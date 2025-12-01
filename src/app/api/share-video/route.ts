import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "https://app.bjhbangkok.com";

// Allowed video folders
const ALLOWED_FOLDERS = ["/images/video/", "/marketing/"];

// Check if path is in allowed folders
const isAllowedPath = (normalizedPath: string): boolean => {
  return ALLOWED_FOLDERS.some((folder) => normalizedPath.includes(folder));
};

// Convert serve-video URL to direct path
const normalizeVideoPath = (videoPath: string): string => {
  let normalizedPath = videoPath;

  // Remove base URL
  if (normalizedPath.startsWith(BASE_URL)) {
    normalizedPath = normalizedPath.replace(BASE_URL, "");
  }

  // Convert /api/serve-video/... to /images/video/...
  if (normalizedPath.includes("/api/serve-video/")) {
    normalizedPath = normalizedPath.replace(
      "/api/serve-video/",
      "/images/video/"
    );
  }

  // Ensure leading slash
  if (!normalizedPath.startsWith("/")) {
    normalizedPath = "/" + normalizedPath;
  }

  return normalizedPath;
};

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
    const normalizedPath = normalizeVideoPath(videoPath);

    // Security check - only allow specific folder videos
    if (!isAllowedPath(normalizedPath)) {
      return NextResponse.json(
        { error: "Only videos from allowed folders can be shared" },
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

    // Extract filename without extension as video ID (for cleaner URLs)
    const fileName = path.basename(normalizedPath);
    const fileNameWithoutExt = path.basename(fileName, path.extname(fileName));

    // Use base64url encoded path for share URLs (supports full path including folders)
    const lineVideoIdEncoded =
      Buffer.from(normalizedPath).toString("base64url");

    // Generate share URL using the /share/video/[id] route (public, with OG meta tags)
    const shareUrl = `${BASE_URL}/share/video/${lineVideoIdEncoded}`;

    // LINE video URL (direct video serving for inline playback)
    const lineVideoUrl = `${BASE_URL}/api/line-video/${lineVideoIdEncoded}`;

    // Generate LINE share URL
    const lineShareUrl = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(
      shareUrl
    )}`;

    // Check file size for transcoding recommendation
    const stats = fs.statSync(fullPath);
    const fileSizeMB = stats.size / (1024 * 1024);
    const needsTranscoding = fileSizeMB > 25; // LINE recommends < 25MB

    return NextResponse.json({
      success: true,
      shareUrl,
      lineShareUrl,
      lineVideoUrl,
      videoId: lineVideoIdEncoded,
      videoName: videoName || path.basename(normalizedPath),
      fileSize: stats.size,
      fileSizeMB: Math.round(fileSizeMB * 100) / 100,
      needsTranscoding,
      transcodeUrl: needsTranscoding ? `/api/transcode-video` : null,
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

    // Security check - allow both /images/video/ and /marketing/
    if (!isAllowedPath(videoPath)) {
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
