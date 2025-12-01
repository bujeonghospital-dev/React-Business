import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export const runtime = "nodejs";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://app.bjhbangkok.com";
const CACHE_DIR = path.join(process.cwd(), "public", "cache", "line-videos");
const VIDEO_ROOT = path.join(process.cwd(), "public", "images", "video");

// Allowed video folders for security
const ALLOWED_FOLDERS = ["/images/video/", "/marketing/"];

// Check if path is in allowed folders
const isAllowedPath = (normalizedPath: string): boolean => {
  return ALLOWED_FOLDERS.some((folder) => normalizedPath.includes(folder));
};

// Generate cache filename from video path
function getCacheFileName(videoPath: string): string {
  const hash = Buffer.from(videoPath).toString("base64url").slice(0, 32);
  const originalName = path.basename(videoPath, path.extname(videoPath));
  return `${originalName}_${hash}_line.mp4`;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "Video ID required" }, { status: 400 });
    }

    // Decode the ID to get original video path
    const videoPath = Buffer.from(id, "base64url").toString("utf-8");

    // Security check - allow videos from /images/video/ and /marketing/
    if (!isAllowedPath(videoPath)) {
      return NextResponse.json({ error: "Invalid video ID" }, { status: 403 });
    }

    // Look for cached transcoded version
    const cacheName = getCacheFileName(videoPath);
    const cachePath = path.join(CACHE_DIR, cacheName);

    let filePath: string;
    let isCached = false;

    try {
      await fs.stat(cachePath);
      filePath = cachePath;
      isCached = true;
    } catch {
      // No cached version, serve original
      filePath = path.join(process.cwd(), "public", videoPath);
    }

    // Check if file exists
    try {
      await fs.stat(filePath);
    } catch {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    // Read file
    const fileBuffer = await fs.readFile(filePath);
    const fileSize = fileBuffer.length;
    const fileName = path.basename(filePath);

    // CORS and video headers
    const headers: Record<string, string> = {
      "Content-Type": "video/mp4",
      "Content-Length": fileSize.toString(),
      "Accept-Ranges": "bytes",
      "Cache-Control": "public, max-age=31536000",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
      "Access-Control-Expose-Headers": "Content-Range, Content-Length, Accept-Ranges",
      "Content-Disposition": `inline; filename="${encodeURIComponent(fileName)}"`,
    };

    // Handle range requests for video streaming
    const range = request.headers.get("range");

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = end - start + 1;

      const chunk = fileBuffer.slice(start, end + 1);

      return new NextResponse(new Uint8Array(chunk), {
        status: 206,
        headers: {
          ...headers,
          "Content-Range": `bytes ${start}-${end}/${fileSize}`,
          "Content-Length": chunkSize.toString(),
        },
      });
    }

    // Return full file
    return new NextResponse(new Uint8Array(fileBuffer), {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("Error serving LINE video:", error);
    return NextResponse.json(
      { error: "Failed to serve video" },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
      "Access-Control-Allow-Headers": "Range, Content-Type",
      "Access-Control-Max-Age": "86400",
    },
  });
}
