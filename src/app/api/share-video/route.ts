import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "https://app.bjhbangkok.com";

// Generate shareable video link with proper encoding
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { videoPath, videoName } = body;

    if (!videoPath) {
      return NextResponse.json(
        { error: "Video path is required" },
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

    // Security check - only allow marketing folder videos
    if (!normalizedPath.includes("/marketing/")) {
      return NextResponse.json(
        { error: "Only marketing videos can be shared" },
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

    // Create base64url encoded ID from path
    const videoId = Buffer.from(normalizedPath).toString("base64url");

    // Generate share URL
    const shareUrl = `${BASE_URL}/share/video/${videoId}`;

    // Generate LINE share URL
    const lineShareUrl = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(
      shareUrl
    )}`;

    return NextResponse.json({
      success: true,
      shareUrl,
      lineShareUrl,
      videoId,
      videoName: videoName || path.basename(normalizedPath),
    });
  } catch (error) {
    console.error("Error generating share link:", error);
    return NextResponse.json(
      { error: "Failed to generate share link" },
      { status: 500 }
    );
  }
}

// Get video share info
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get("id");

    if (!videoId) {
      return NextResponse.json(
        { error: "Video ID is required" },
        { status: 400 }
      );
    }

    // Decode the ID
    const videoPath = Buffer.from(videoId, "base64url").toString("utf-8");

    // Security check
    if (!videoPath.includes("/marketing/")) {
      return NextResponse.json({ error: "Invalid video ID" }, { status: 403 });
    }

    const fullPath = path.join(process.cwd(), "public", videoPath);
    if (!fs.existsSync(fullPath)) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    const stats = fs.statSync(fullPath);
    const fileName = path.basename(fullPath);
    const ext = path.extname(fullPath).toLowerCase();

    const mimeTypes: Record<string, string> = {
      ".mp4": "video/mp4",
      ".webm": "video/webm",
      ".mov": "video/quicktime",
      ".m4v": "video/x-m4v",
    };

    return NextResponse.json({
      success: true,
      video: {
        id: videoId,
        name: fileName,
        path: videoPath,
        url: `${BASE_URL}${videoPath}`,
        size: stats.size,
        mimeType: mimeTypes[ext] || "video/mp4",
        shareUrl: `${BASE_URL}/share/video/${videoId}`,
      },
    });
  } catch (error) {
    console.error("Error getting video info:", error);
    return NextResponse.json(
      { error: "Failed to get video info" },
      { status: 500 }
    );
  }
}
