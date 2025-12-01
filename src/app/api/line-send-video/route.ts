import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://app.bjhbangkok.com";
const LINE_CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;

// Allowed video folders for security
const ALLOWED_FOLDERS = ["/images/video/", "/marketing/", "/Ad Content/"];

// Check if path is in allowed folders
const isAllowedPath = (normalizedPath: string): boolean => {
  return ALLOWED_FOLDERS.some((folder) => normalizedPath.includes(folder));
};

interface LineMessageResponse {
  success: boolean;
  message?: string;
  error?: string;
  details?: unknown;
}

// Send video message via LINE Messaging API
async function sendVideoToLine(
  userId: string,
  videoUrl: string,
  previewImageUrl: string,
  videoName: string
): Promise<LineMessageResponse> {
  if (!LINE_CHANNEL_ACCESS_TOKEN) {
    return {
      success: false,
      error: "LINE_CHANNEL_ACCESS_TOKEN is not configured",
    };
  }

  try {
    const response = await fetch("https://api.line.me/v2/bot/message/push", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        to: userId,
        messages: [
          {
            type: "video",
            originalContentUrl: videoUrl,
            previewImageUrl: previewImageUrl,
          },
          {
            type: "text",
            text: `🎬 ${videoName}\n\nจาก BJH Bangkok Medical Center`,
          },
        ],
      }),
    });

    if (response.ok) {
      return { success: true, message: "Video sent successfully" };
    } else {
      const errorData = await response.json();
      console.error("LINE API Error:", JSON.stringify(errorData, null, 2));
      console.error("Request was:", { to: userId, videoUrl, previewImageUrl });
      return {
        success: false,
        error: errorData.message || JSON.stringify(errorData.details) || `LINE API Error: ${response.status}`,
        details: errorData,
      };
    }
  } catch (error) {
    console.error("Error sending to LINE:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Send video to LINE group/room
async function sendVideoToLineGroup(
  groupId: string,
  videoUrl: string,
  previewImageUrl: string,
  videoName: string
): Promise<LineMessageResponse> {
  if (!LINE_CHANNEL_ACCESS_TOKEN) {
    return {
      success: false,
      error: "LINE_CHANNEL_ACCESS_TOKEN is not configured",
    };
  }

  try {
    const response = await fetch("https://api.line.me/v2/bot/message/push", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        to: groupId,
        messages: [
          {
            type: "video",
            originalContentUrl: videoUrl,
            previewImageUrl: previewImageUrl,
          },
          {
            type: "text",
            text: `🎬 ${videoName}\n\nจาก BJH Bangkok Medical Center`,
          },
        ],
      }),
    });

    if (response.ok) {
      return { success: true, message: "Video sent to group successfully" };
    } else {
      const errorData = await response.json();
      console.error("LINE API Error (Group):", JSON.stringify(errorData, null, 2));
      return {
        success: false,
        error: errorData.message || JSON.stringify(errorData.details) || `LINE API Error: ${response.status}`,
        details: errorData,
      };
    }
  } catch (error) {
    console.error("Error sending to LINE group:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// POST - Send video to LINE user or group
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { videoPath, lineUserId, lineGroupId, videoName } = body;

    if (!videoPath) {
      return NextResponse.json(
        { error: "Video path is required" },
        { status: 400 }
      );
    }

    if (!lineUserId && !lineGroupId) {
      return NextResponse.json(
        { error: "LINE user ID or group ID is required" },
        { status: 400 }
      );
    }

    // Normalize path
    let normalizedPath = videoPath;
    if (normalizedPath.startsWith(BASE_URL)) {
      normalizedPath = normalizedPath.replace(BASE_URL, "");
    }
    if (!normalizedPath.startsWith("/")) {
      normalizedPath = "/" + normalizedPath;
    }

    // Security check
    if (!isAllowedPath(normalizedPath)) {
      return NextResponse.json(
        { error: "Only videos from allowed folders can be sent" },
        { status: 403 }
      );
    }

    // Verify file exists
    const fullPath = path.join(process.cwd(), "public", normalizedPath);
    if (!fs.existsSync(fullPath)) {
      return NextResponse.json(
        { error: "Video file not found" },
        { status: 404 }
      );
    }

    // Check file size (LINE limit is 200MB for video)
    const stats = fs.statSync(fullPath);
    const fileSizeMB = stats.size / (1024 * 1024);
    if (fileSizeMB > 200) {
      return NextResponse.json(
        { error: "Video file is too large. Maximum size is 200MB." },
        { status: 400 }
      );
    }

    // Generate video URL (must be HTTPS and publicly accessible)
    // Encode path for URL (spaces become %20, etc.)
    const encodedPath = normalizedPath.split('/').map((segment: string) => encodeURIComponent(segment)).join('/');
    const videoUrl = `${BASE_URL}${encodedPath}`;

    // Generate preview image URL
    const ext = path.extname(normalizedPath);
    const baseName = path.basename(normalizedPath, ext);
    const dirName = path.dirname(normalizedPath);
    
    // Try to find thumbnail
    const possibleThumbnails = [
      `${dirName}/${baseName}_thumb.jpg`,
      `${dirName}/${baseName}_thumb.png`,
      `/images/video/${baseName}_thumb.jpg`,
    ];

    let previewImageUrl = `${BASE_URL}/images/video-placeholder.svg`;
    for (const thumbPath of possibleThumbnails) {
      const thumbFullPath = path.join(process.cwd(), "public", thumbPath);
      if (fs.existsSync(thumbFullPath)) {
        const encodedThumbPath = thumbPath.split('/').map((segment: string) => encodeURIComponent(segment)).join('/');
        previewImageUrl = `${BASE_URL}${encodedThumbPath}`;
        break;
      }
    }

    const name = videoName || path.basename(normalizedPath);

    // Send to LINE
    let result: LineMessageResponse;
    if (lineGroupId) {
      result = await sendVideoToLineGroup(
        lineGroupId,
        videoUrl,
        previewImageUrl,
        name
      );
    } else {
      result = await sendVideoToLine(
        lineUserId,
        videoUrl,
        previewImageUrl,
        name
      );
    }

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message,
        videoUrl,
        previewImageUrl,
        fileSizeMB: Math.round(fileSizeMB * 100) / 100,
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error, details: result.details },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in line-send-video:", error);
    return NextResponse.json(
      { error: "Failed to send video to LINE" },
      { status: 500 }
    );
  }
}

// GET - Check LINE configuration status
export async function GET(request: NextRequest) {
  const isConfigured = !!LINE_CHANNEL_ACCESS_TOKEN;
  const { searchParams } = new URL(request.url);
  const testId = searchParams.get("testId");
  
  // If testId provided, test the ID validity
  let idInfo = null;
  if (testId) {
    const idType = testId.startsWith("U") ? "User" 
                 : testId.startsWith("C") ? "Group/Room" 
                 : testId.startsWith("R") ? "Room"
                 : "Unknown";
    idInfo = {
      id: testId,
      length: testId.length,
      type: idType,
      valid: testId.length === 33 && ["U", "C", "R"].includes(testId[0]),
    };
  }
  
  return NextResponse.json({
    configured: isConfigured,
    message: isConfigured 
      ? "LINE Messaging API is configured" 
      : "LINE_CHANNEL_ACCESS_TOKEN is not set. Please add it to your environment variables.",
    requirements: {
      LINE_CHANNEL_ACCESS_TOKEN: isConfigured ? "✅ Set" : "❌ Missing",
    },
    idInfo,
    documentation: "https://developers.line.biz/en/docs/messaging-api/",
  });
}
