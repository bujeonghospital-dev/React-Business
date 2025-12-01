import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export const runtime = "nodejs";

// Video root directory
const videoRoot = path.join(process.cwd(), "public", "images", "video");

// MIME types for video and image files
const mimeTypes: Record<string, string> = {
  ".mp4": "video/mp4",
  ".mov": "video/quicktime",
  ".avi": "video/x-msvideo",
  ".mkv": "video/x-matroska",
  ".webm": "video/webm",
  ".flv": "video/x-flv",
  ".mpeg": "video/mpeg",
  ".mpg": "video/mpeg",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
};

const getMimeType = (filePath: string): string => {
  const ext = path.extname(filePath).toLowerCase();
  return mimeTypes[ext] || "application/octet-stream";
};

const isInsideVideoRoot = (target: string): boolean => {
  const relative = path.relative(videoRoot, target);
  if (relative === "") return true;
  return !relative.startsWith("..") && !path.isAbsolute(relative);
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathSegments } = await params;
    
    if (!pathSegments || pathSegments.length === 0) {
      return NextResponse.json({ error: "File path required" }, { status: 400 });
    }

    // Decode each segment
    const decodedSegments = pathSegments.map((segment) => {
      try {
        return decodeURIComponent(segment);
      } catch {
        return segment;
      }
    });

    const filePath = path.join(videoRoot, ...decodedSegments);

    // Security check - ensure file is within video root
    if (!isInsideVideoRoot(filePath)) {
      return NextResponse.json({ error: "Invalid file path" }, { status: 403 });
    }

    // Check if file exists
    try {
      const stats = await fs.stat(filePath);
      if (!stats.isFile()) {
        return NextResponse.json({ error: "Not a file" }, { status: 404 });
      }
    } catch {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Read file
    const fileBuffer = await fs.readFile(filePath);
    const mimeType = getMimeType(filePath);
    const fileName = path.basename(filePath);

    // Handle range requests for video streaming
    const range = request.headers.get("range");
    const fileSize = fileBuffer.length;

    // CORS headers for external access (LINE, etc.)
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
      "Access-Control-Allow-Headers": "Range, Content-Type",
      "Access-Control-Expose-Headers": "Content-Range, Content-Length, Accept-Ranges",
    };

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = end - start + 1;

      const chunk = fileBuffer.slice(start, end + 1);

      return new NextResponse(new Uint8Array(chunk), {
        status: 206,
        headers: {
          ...corsHeaders,
          "Content-Range": `bytes ${start}-${end}/${fileSize}`,
          "Accept-Ranges": "bytes",
          "Content-Length": chunkSize.toString(),
          "Content-Type": mimeType,
          "Cache-Control": "public, max-age=31536000",
        },
      });
    }

    // Return full file
    return new NextResponse(new Uint8Array(fileBuffer), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": mimeType,
        "Content-Length": fileSize.toString(),
        "Content-Disposition": `inline; filename="${encodeURIComponent(fileName)}"`,
        "Accept-Ranges": "bytes",
        "Cache-Control": "public, max-age=31536000",
      },
    });
  } catch (error) {
    console.error("Error serving video file:", error);
    return NextResponse.json(
      { error: "Unable to serve file" },
      { status: 500 }
    );
  }
}

// Handle OPTIONS request for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
      "Access-Control-Allow-Headers": "Range, Content-Type",
      "Access-Control-Expose-Headers": "Content-Range, Content-Length, Accept-Ranges",
      "Access-Control-Max-Age": "86400",
    },
  });
}
