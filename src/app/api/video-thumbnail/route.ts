import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export const runtime = "nodejs";

const marketingRoot = path.join(process.cwd(), "public", "marketing");
const thumbnailsRoot = path.join(process.cwd(), "public", "images", "video");

const videoExtensions = new Set([
  ".mp4",
  ".mov",
  ".avi",
  ".mkv",
  ".webm",
  ".flv",
  ".mpeg",
]);

const isVideoFile = (fileName: string): boolean => {
  const ext = path.extname(fileName).toLowerCase();
  return videoExtensions.has(ext);
};

const normalizeSegments = (value: string) =>
  value
    .replace(/\\/g, "/")
    .split("/")
    .map((segment) => segment.trim())
    .filter(Boolean);

const isInsideRoot = (target: string, root: string) => {
  const relative = path.relative(root, target);
  if (relative === "") return true;
  return !relative.startsWith("..") && !path.isAbsolute(relative);
};

const fileExists = async (target: string): Promise<boolean> => {
  try {
    const stats = await fs.stat(target);
    return stats.isFile();
  } catch {
    return false;
  }
};

const ensureDirectoryExists = async (dirPath: string): Promise<void> => {
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch (error) {
    // Directory might already exist
  }
};

// Generate thumbnail path from video path
const getThumbnailPath = (videoPath: string): string => {
  const segments = normalizeSegments(videoPath);
  const fileName = segments.pop() || "";
  const baseName = path.basename(fileName, path.extname(fileName));
  const thumbnailName = `${baseName}_thumb.jpg`;
  return path.join(thumbnailsRoot, ...segments, thumbnailName);
};

// Get thumbnail URL from video URL
export const getThumbnailUrl = (videoUrl: string): string => {
  const segments = normalizeSegments(videoUrl.replace(/^\/marketing\//, ""));
  const fileName = segments.pop() || "";
  const baseName = path.basename(fileName, path.extname(fileName));
  const thumbnailName = `${baseName}_thumb.jpg`;
  return `/images/video/${thumbnailName}`;
};

// Check if thumbnail exists for a video
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const videoPath = searchParams.get("videoPath");

    if (!videoPath) {
      return NextResponse.json(
        { success: false, error: "Video path is required" },
        { status: 400 }
      );
    }

    const segments = normalizeSegments(videoPath.replace(/^\/marketing\//, ""));
    const videoFullPath = path.join(marketingRoot, ...segments);

    if (!isInsideRoot(videoFullPath, marketingRoot)) {
      return NextResponse.json(
        { success: false, error: "Invalid video path" },
        { status: 400 }
      );
    }

    if (!(await fileExists(videoFullPath))) {
      return NextResponse.json(
        { success: false, error: "Video file not found" },
        { status: 404 }
      );
    }

    const thumbnailPath = getThumbnailPath(segments.join("/"));
    const thumbnailExists = await fileExists(thumbnailPath);

    if (thumbnailExists) {
      const thumbnailUrl = getThumbnailUrl(videoPath);
      return NextResponse.json({
        success: true,
        thumbnailExists: true,
        thumbnailUrl,
      });
    }

    return NextResponse.json({
      success: true,
      thumbnailExists: false,
      thumbnailUrl: null,
    });
  } catch (error) {
    console.error("Error checking video thumbnail:", error);
    return NextResponse.json(
      { success: false, error: "Unable to check thumbnail" },
      { status: 500 }
    );
  }
}

// Store a generated thumbnail (from client-side generation)
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const videoPath = formData.get("videoPath") as string;
    const thumbnailData = formData.get("thumbnail") as Blob | null;

    if (!videoPath || !thumbnailData) {
      return NextResponse.json(
        { success: false, error: "Video path and thumbnail data are required" },
        { status: 400 }
      );
    }

    const segments = normalizeSegments(videoPath.replace(/^\/marketing\//, ""));
    const videoFullPath = path.join(marketingRoot, ...segments);

    if (!isInsideRoot(videoFullPath, marketingRoot)) {
      return NextResponse.json(
        { success: false, error: "Invalid video path" },
        { status: 400 }
      );
    }

    const fileName = segments.pop() || "";
    if (!isVideoFile(fileName)) {
      return NextResponse.json(
        { success: false, error: "Not a video file" },
        { status: 400 }
      );
    }

    const baseName = path.basename(fileName, path.extname(fileName));
    const thumbnailName = `${baseName}_thumb.jpg`;
    const thumbnailDir = thumbnailsRoot; // Save directly to /images/video
    const thumbnailPath = path.join(thumbnailDir, thumbnailName);

    // Ensure thumbnail directory exists
    await ensureDirectoryExists(thumbnailDir);

    // Save the thumbnail
    const buffer = Buffer.from(await thumbnailData.arrayBuffer());
    await fs.writeFile(thumbnailPath, new Uint8Array(buffer));

    const thumbnailUrl = `/images/video/${thumbnailName}`;

    return NextResponse.json({
      success: true,
      thumbnailUrl,
    });
  } catch (error) {
    console.error("Error saving video thumbnail:", error);
    return NextResponse.json(
      { success: false, error: "Unable to save thumbnail" },
      { status: 500 }
    );
  }
}
