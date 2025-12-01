import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export const runtime = "nodejs";

const marketingRoot = path.join(process.cwd(), "public", "images", "video");

const normalizeSegments = (value: string) =>
  value
    .replace(/\\/g, "/")
    .split("/")
    .map((segment) => segment.trim())
    .filter(Boolean);

const isInsideMarketingRoot = (target: string) => {
  const relative = path.relative(marketingRoot, target);
  if (relative === "") return true;
  return !relative.startsWith("..") && !path.isAbsolute(relative);
};

const sanitizeFileName = (value: string) =>
  value.replace(/[^a-zA-Z0-9.\-_]/g, "_");

const fileExists = async (target: string) => {
  try {
    const stats = await fs.stat(target);
    return stats.isFile();
  } catch {
    return false;
  }
};

type FileUploadValue = FormDataEntryValue & {
  name: string;
  arrayBuffer: () => Promise<ArrayBuffer>;
};

const isUploadSource = (entry: FormDataEntryValue): entry is FileUploadValue =>
  typeof entry === "object" &&
  entry !== null &&
  "arrayBuffer" in entry &&
  typeof (entry as any).arrayBuffer === "function" &&
  typeof (entry as any).name === "string";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const folderPathValue = formData.get("folderPath");
    const folderSegments =
      typeof folderPathValue === "string" ? normalizeSegments(folderPathValue) : [];

    if (folderSegments.length === 0) {
      return NextResponse.json(
        { success: false, error: "Target folder is required" },
        { status: 400 }
      );
    }

    const targetDir = path.join(marketingRoot, ...folderSegments);
    if (!isInsideMarketingRoot(targetDir)) {
      return NextResponse.json(
        { success: false, error: "Invalid target folder" },
        { status: 400 }
      );
    }

    await fs.mkdir(targetDir, { recursive: true });

    const fileEntries = formData.getAll("files").filter(isUploadSource);

    if (fileEntries.length === 0) {
      return NextResponse.json(
        { success: false, error: "No files provided" },
        { status: 400 }
      );
    }

    const savedFiles: Array<{ name: string; path: string; url: string }> = [];

    for (let index = 0; index < fileEntries.length; index++) {
      const fileEntry = fileEntries[index];
      const buffer = Buffer.from(await fileEntry.arrayBuffer());
      const sanitizedName = sanitizeFileName(fileEntry.name);
      const uniqueName = `${Date.now()}-${index}-${sanitizedName}`;
      const destination = path.join(targetDir, uniqueName);
      await fs.writeFile(destination, new Uint8Array(buffer));
      const relativePath = path
        .relative(marketingRoot, destination)
        .split(path.sep)
        .join("/");
      savedFiles.push({
        name: fileEntry.name,
        path: relativePath,
        url: `/api/serve-video/${relativePath}`,
      });
    }

    return NextResponse.json({ success: true, files: savedFiles }, { status: 201 });
  } catch (error) {
    console.error("Error uploading marketing files", error);
    return NextResponse.json(
      { success: false, error: "Unable to upload files" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const rawPath = typeof body.filePath === "string" ? body.filePath : "";
    const normalized = rawPath
      .replace(/^\/+/, "")
      .replace(/^api\/serve-video\//, "")
      .replace(/^images\/video\//, "")
      .replace(/^marketing\//, "");
    const rawSegments = normalizeSegments(normalized);
    const segments = rawSegments.map((segment) => {
      try {
        return decodeURIComponent(segment);
      } catch (decodedError) {
        return segment;
      }
    });

    if (segments.length === 0) {
      return NextResponse.json(
        { success: false, error: "File path is required" },
        { status: 400 }
      );
    }

    const targetFile = path.join(marketingRoot, ...segments);
    if (!isInsideMarketingRoot(targetFile)) {
      return NextResponse.json(
        { success: false, error: "Invalid file path" },
        { status: 400 }
      );
    }

    if (!(await fileExists(targetFile))) {
      return NextResponse.json({ success: false, error: "File not found" }, { status: 404 });
    }

    await fs.unlink(targetFile);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error deleting marketing file", error);
    return NextResponse.json(
      { success: false, error: "Unable to delete file" },
      { status: 500 }
    );
  }
}
