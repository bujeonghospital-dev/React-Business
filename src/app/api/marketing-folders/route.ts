import { NextResponse, type NextRequest } from "next/server";
import { promises as fs } from "fs";
import path from "path";

type FileType = "image" | "video" | "clip";

interface ApiFileItem {
  id: number;
  name: string;
  type: FileType;
  url: string;
  thumbnail: string;
  size: string;
  date: string;
  tags: string[];
  favorite: boolean;
  views: number;
  category: string;
  needsThumbnailGeneration?: boolean;
}

const thumbnailsRoot = path.join(process.cwd(), "public", "images", "video");

interface ApiFolderNode {
  id: string;
  name: string;
  path: string;
  fileIds: number[];
  children: ApiFolderNode[];
}

const marketingRoot = path.join(process.cwd(), "public", "images", "video");

const folderDefinitions = [
  { id: "ad-content", name: "Ad Content" },
  { id: "before-and-after", name: "Before and After" },
  { id: "branding", name: "Branding" },
  { id: "presentations", name: "Presentations" },
  { id: "all-footages", name: "All Footages" },
  { id: "other-files", name: "Other Files" },
];

const imageExtensions = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".gif",
  ".bmp",
  ".tif",
  ".tiff",
]);
const videoExtensions = new Set([
  ".mp4",
  ".mov",
  ".avi",
  ".mkv",
  ".webm",
  ".flv",
  ".mpeg",
]);

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

const formatBytes = (bytes: number) => {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const exponent = Math.floor(Math.log(bytes) / Math.log(1024));
  const value = bytes / Math.pow(1024, exponent);
  return `${value.toFixed(2)} ${units[exponent]}`;
};

const getFileType = (fileName: string): FileType => {
  const ext = path.extname(fileName).toLowerCase();
  if (imageExtensions.has(ext)) return "image";
  if (videoExtensions.has(ext)) return "video";
  return "clip";
};

const pathExists = async (target: string) => {
  try {
    const stats = await fs.stat(target);
    return stats.isDirectory();
  } catch {
    return false;
  }
};

const sanitizeFolderName = (value: string) =>
  value.replace(/[\\/]/g, "").trim();

const normalizeSegments = (pathString: string) =>
  pathString
    .split("/")
    .map((segment) => segment.trim())
    .filter(Boolean);

const isInsideMarketingRoot = (target: string) => {
  const relative = path.relative(marketingRoot, target);
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

// Generate thumbnail path for a video file
const getVideoThumbnailPath = (
  segments: string[],
  fileName: string
): string => {
  const baseName = path.basename(fileName, path.extname(fileName));
  const thumbnailName = `${baseName}_thumb.jpg`;
  return path.join(thumbnailsRoot, thumbnailName);
};

// Get thumbnail URL for a video file
const getVideoThumbnailUrl = (segments: string[], fileName: string): string => {
  const baseName = path.basename(fileName, path.extname(fileName));
  const thumbnailName = `${baseName}_thumb.jpg`;
  return `/images/video/${thumbnailName}`;
};

// Default video placeholder
const VIDEO_PLACEHOLDER = "/images/video-placeholder.svg";

const buildFolderNode = async (
  dirPath: string,
  segments: string[],
  category: string,
  files: ApiFileItem[],
  counter: { value: number }
): Promise<ApiFolderNode> => {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  entries.sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
  );

  const fileIds: number[] = [];
  const children: ApiFolderNode[] = [];

  for (const entry of entries) {
    if (entry.name.startsWith(".")) continue;

    const entryPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      const childNode = await buildFolderNode(
        entryPath,
        [...segments, entry.name],
        category,
        files,
        counter
      );
      children.push(childNode);
      continue;
    }

    if (entry.isFile()) {
      const stats = await fs.stat(entryPath);
      const fileId = counter.value++;
      const fileSegments = [...segments, entry.name];
      const urlSegments = fileSegments.map((segment) =>
        encodeURIComponent(segment)
      );
      const url = `/api/serve-video/${urlSegments.join("/")}`;
      const fileType = getFileType(entry.name);

      // Determine thumbnail for the file
      let thumbnail = url;
      let needsThumbnailGeneration = false;

      if (fileType === "video" || fileType === "clip") {
        // Check if thumbnail exists
        const thumbnailPath = getVideoThumbnailPath(fileSegments, entry.name);
        const thumbnailExists = await fileExists(thumbnailPath);

        if (thumbnailExists) {
          thumbnail = getVideoThumbnailUrl(fileSegments, entry.name);
        } else {
          // Use placeholder and mark for generation
          thumbnail = VIDEO_PLACEHOLDER;
          needsThumbnailGeneration = true;
        }
      }

      const fileItem: ApiFileItem = {
        id: fileId,
        name: entry.name,
        type: fileType,
        url,
        thumbnail,
        size: formatBytes(stats.size),
        date: stats.mtime.toISOString(),
        tags: segments,
        favorite: false,
        views: 0,
        category,
        needsThumbnailGeneration,
      };
      files.push(fileItem);
      fileIds.push(fileId);
    }
  }

  const nodeId = segments.map(slugify).join("-");
  return {
    id: nodeId,
    name: segments[segments.length - 1] ?? "",
    path: segments.join("/"),
    fileIds,
    children,
  };
};

export async function GET() {
  try {
    const files: ApiFileItem[] = [];
    const counter = { value: 1 };

    const folders: ApiFolderNode[] = [];

    for (const definition of folderDefinitions) {
      const dirPath = path.join(marketingRoot, definition.name);
      if (await pathExists(dirPath)) {
        const node = await buildFolderNode(
          dirPath,
          [definition.name],
          definition.name,
          files,
          counter
        );
        folders.push(node);
      } else {
        folders.push({
          id: definition.id,
          name: definition.name,
          path: definition.name,
          fileIds: [],
          children: [],
        });
      }
    }

    return NextResponse.json({ folders, files }, { status: 200 });
  } catch (error) {
    console.error("Error reading marketing folders", error);
    return NextResponse.json(
      { folders: [], files: [], error: "Unable to read marketing assets." },
      { status: 500 }
    );
  }
}

const isDirectoryEmpty = async (dirPath: string) => {
  try {
    const entries = await fs.readdir(dirPath);
    return entries.length === 0;
  } catch {
    return false;
  }
};

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const rawCurrentPath =
      typeof body.currentPath === "string" ? body.currentPath : "";
    const rawNewName = typeof body.newName === "string" ? body.newName : "";
    const sanitizedNewName = sanitizeFolderName(rawNewName);

    if (!rawCurrentPath || !sanitizedNewName) {
      return NextResponse.json(
        { error: "Current path and new folder name are required." },
        { status: 400 }
      );
    }

    if (sanitizedNewName.includes("..")) {
      return NextResponse.json(
        { error: "Invalid folder name." },
        { status: 400 }
      );
    }

    const currentSegments = normalizeSegments(rawCurrentPath);
    if (
      currentSegments.length === 0 ||
      currentSegments.some((segment) => segment.includes(".."))
    ) {
      return NextResponse.json(
        { error: "Invalid current path." },
        { status: 400 }
      );
    }

    const currentDir = path.join(marketingRoot, ...currentSegments);
    if (!isInsideMarketingRoot(currentDir)) {
      return NextResponse.json(
        { error: "Current path is outside of marketing assets." },
        { status: 400 }
      );
    }

    if (!(await pathExists(currentDir))) {
      return NextResponse.json(
        { error: "Folder does not exist." },
        { status: 404 }
      );
    }

    const parentSegments = currentSegments.slice(0, -1);
    const parentDir = path.join(marketingRoot, ...parentSegments);
    if (!isInsideMarketingRoot(parentDir)) {
      return NextResponse.json(
        { error: "Invalid parent folder." },
        { status: 400 }
      );
    }

    const newDir = path.join(parentDir, sanitizedNewName);
    if (!isInsideMarketingRoot(newDir)) {
      return NextResponse.json(
        { error: "Invalid target path." },
        { status: 400 }
      );
    }

    if (await pathExists(newDir)) {
      return NextResponse.json(
        { error: "Target folder already exists." },
        { status: 409 }
      );
    }

    await fs.rename(currentDir, newDir);
    const parentPath = parentSegments.join("/");
    const newPath = parentPath
      ? `${parentPath}/${sanitizedNewName}`
      : sanitizedNewName;
    return NextResponse.json({ success: true, path: newPath }, { status: 200 });
  } catch (error) {
    console.error("Error renaming marketing folder", error);
    return NextResponse.json(
      { error: "Unable to rename folder." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawParentPath =
      typeof body.parentPath === "string" ? body.parentPath : "";
    const rawFolderName =
      typeof body.folderName === "string" ? body.folderName : "";
    const sanitizedFolderName = sanitizeFolderName(rawFolderName);

    if (!rawParentPath || !sanitizedFolderName) {
      return NextResponse.json(
        { error: "Parent path and folder name are required." },
        { status: 400 }
      );
    }

    if (sanitizedFolderName.includes("..")) {
      return NextResponse.json(
        { error: "Invalid folder name." },
        { status: 400 }
      );
    }

    const parentSegments = normalizeSegments(rawParentPath);
    if (
      parentSegments.length === 0 ||
      parentSegments.some((segment) => segment.includes(".."))
    ) {
      return NextResponse.json(
        { error: "Invalid parent path." },
        { status: 400 }
      );
    }

    const parentDir = path.join(marketingRoot, ...parentSegments);
    if (!isInsideMarketingRoot(parentDir)) {
      return NextResponse.json(
        { error: "Parent path is outside of the marketing tree." },
        { status: 400 }
      );
    }

    if (!(await pathExists(parentDir))) {
      return NextResponse.json(
        { error: "Parent folder does not exist." },
        { status: 404 }
      );
    }

    const newFolderPath = path.join(parentDir, sanitizedFolderName);
    if (!isInsideMarketingRoot(newFolderPath)) {
      return NextResponse.json(
        { error: "Invalid folder path." },
        { status: 400 }
      );
    }

    if (await pathExists(newFolderPath)) {
      return NextResponse.json(
        { error: "Folder already exists." },
        { status: 409 }
      );
    }

    await fs.mkdir(newFolderPath);
    return NextResponse.json(
      { success: true, path: `${rawParentPath}/${sanitizedFolderName}` },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating marketing folder", error);
    return NextResponse.json(
      { error: "Unable to create folder." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const rawPath = typeof body.path === "string" ? body.path : "";
    const normalized = normalizeSegments(rawPath);

    if (normalized.length === 0) {
      return NextResponse.json(
        { error: "Folder path is required." },
        { status: 400 }
      );
    }

    if (normalized.some((segment) => segment.includes(".."))) {
      return NextResponse.json(
        { error: "Invalid folder path." },
        { status: 400 }
      );
    }

    const targetDir = path.join(marketingRoot, ...normalized);
    if (!isInsideMarketingRoot(targetDir)) {
      return NextResponse.json(
        { error: "Path is outside marketing assets." },
        { status: 400 }
      );
    }

    if (!(await pathExists(targetDir))) {
      return NextResponse.json({ error: "Folder not found." }, { status: 404 });
    }

    if (!(await isDirectoryEmpty(targetDir))) {
      return NextResponse.json(
        { error: "Folder must be empty before deleting." },
        { status: 409 }
      );
    }

    await fs.rmdir(targetDir);
    return NextResponse.json(
      { success: true, path: normalized.join("/") },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting marketing folder", error);
    return NextResponse.json(
      { error: "Unable to delete folder." },
      { status: 500 }
    );
  }
}
