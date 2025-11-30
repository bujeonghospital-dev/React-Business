import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { spawn } from "child_process";

export const runtime = "nodejs";
export const maxDuration = 300; // 5 minutes for transcoding

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://app.bjhbangkok.com";

// Directories
const VIDEO_ROOT = path.join(process.cwd(), "public", "images", "video");
const CACHE_DIR = path.join(process.cwd(), "public", "cache", "line-videos");

// Transcoding status tracking (in-memory, could be replaced with Redis)
const transcodingStatus = new Map<string, {
  status: "pending" | "processing" | "completed" | "error";
  progress: number;
  error?: string;
  outputPath?: string;
  startTime: number;
}>();

// Ensure cache directory exists
async function ensureCacheDir() {
  try {
    await fs.mkdir(CACHE_DIR, { recursive: true });
  } catch (error) {
    // Directory might already exist
  }
}

// Generate cache filename from video path
function getCacheFileName(videoPath: string): string {
  const hash = Buffer.from(videoPath).toString("base64url").slice(0, 32);
  const originalName = path.basename(videoPath, path.extname(videoPath));
  return `${originalName}_${hash}_line.mp4`;
}

// Check if cached version exists and is valid
async function getCachedVideo(videoPath: string): Promise<string | null> {
  try {
    const cacheName = getCacheFileName(videoPath);
    const cachePath = path.join(CACHE_DIR, cacheName);
    
    const stats = await fs.stat(cachePath);
    
    // Check if cache is older than 7 days
    const cacheAge = Date.now() - stats.mtimeMs;
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
    
    if (cacheAge < maxAge && stats.size > 0) {
      return cachePath;
    }
    
    return null;
  } catch {
    return null;
  }
}

// Check if video is already H.264 compatible
async function isH264Compatible(videoPath: string): Promise<boolean> {
  return new Promise((resolve) => {
    const ffprobe = spawn("ffprobe", [
      "-v", "error",
      "-select_streams", "v:0",
      "-show_entries", "stream=codec_name",
      "-of", "default=noprint_wrappers=1:nokey=1",
      videoPath
    ]);

    let output = "";
    ffprobe.stdout.on("data", (data) => {
      output += data.toString();
    });

    ffprobe.on("close", (code) => {
      const codec = output.trim().toLowerCase();
      resolve(codec === "h264");
    });

    ffprobe.on("error", () => {
      resolve(false);
    });
  });
}

// Get video duration for progress calculation
async function getVideoDuration(videoPath: string): Promise<number> {
  return new Promise((resolve) => {
    const ffprobe = spawn("ffprobe", [
      "-v", "error",
      "-show_entries", "format=duration",
      "-of", "default=noprint_wrappers=1:nokey=1",
      videoPath
    ]);

    let output = "";
    ffprobe.stdout.on("data", (data) => {
      output += data.toString();
    });

    ffprobe.on("close", () => {
      const duration = parseFloat(output.trim());
      resolve(isNaN(duration) ? 0 : duration);
    });

    ffprobe.on("error", () => {
      resolve(0);
    });
  });
}

// Transcode video to H.264/AAC for LINE compatibility
async function transcodeVideo(
  inputPath: string,
  outputPath: string,
  jobId: string,
  duration: number
): Promise<void> {
  return new Promise((resolve, reject) => {
    // FFmpeg command for LINE-compatible output:
    // - H.264 video codec with web-optimized settings
    // - AAC audio codec
    // - Faststart for streaming
    // - Reasonable file size (target ~15MB for 1 minute)
    const ffmpeg = spawn("ffmpeg", [
      "-i", inputPath,
      "-y", // Overwrite output
      "-c:v", "libx264", // H.264 video codec
      "-preset", "fast", // Faster encoding
      "-crf", "28", // Quality (higher = smaller file, lower quality)
      "-profile:v", "baseline", // Maximum compatibility
      "-level", "3.0", // Compatible with most devices
      "-pix_fmt", "yuv420p", // Standard pixel format
      "-c:a", "aac", // AAC audio codec
      "-b:a", "128k", // Audio bitrate
      "-ar", "44100", // Audio sample rate
      "-ac", "2", // Stereo audio
      "-movflags", "+faststart", // Enable streaming
      "-max_muxing_queue_size", "1024",
      "-progress", "pipe:1", // Output progress to stdout
      outputPath
    ]);

    let lastProgress = 0;

    ffmpeg.stdout.on("data", (data) => {
      const output = data.toString();
      // Parse FFmpeg progress output
      const timeMatch = output.match(/out_time_ms=(\d+)/);
      if (timeMatch && duration > 0) {
        const currentTime = parseInt(timeMatch[1]) / 1000000;
        const progress = Math.min(99, Math.round((currentTime / duration) * 100));
        if (progress > lastProgress) {
          lastProgress = progress;
          transcodingStatus.set(jobId, {
            status: "processing",
            progress,
            startTime: transcodingStatus.get(jobId)?.startTime || Date.now()
          });
        }
      }
    });

    ffmpeg.stderr.on("data", (data) => {
      // FFmpeg outputs progress info to stderr too
      const output = data.toString();
      const timeMatch = output.match(/time=(\d{2}):(\d{2}):(\d{2})/);
      if (timeMatch && duration > 0) {
        const hours = parseInt(timeMatch[1]);
        const minutes = parseInt(timeMatch[2]);
        const seconds = parseInt(timeMatch[3]);
        const currentTime = hours * 3600 + minutes * 60 + seconds;
        const progress = Math.min(99, Math.round((currentTime / duration) * 100));
        if (progress > lastProgress) {
          lastProgress = progress;
          transcodingStatus.set(jobId, {
            status: "processing",
            progress,
            startTime: transcodingStatus.get(jobId)?.startTime || Date.now()
          });
        }
      }
    });

    ffmpeg.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`FFmpeg exited with code ${code}`));
      }
    });

    ffmpeg.on("error", (error) => {
      reject(error);
    });
  });
}

// POST: Start transcoding job
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { videoPath } = body;

    if (!videoPath) {
      return NextResponse.json({ error: "Video path is required" }, { status: 400 });
    }

    // Normalize path
    let normalizedPath = videoPath;
    if (normalizedPath.startsWith(BASE_URL)) {
      normalizedPath = normalizedPath.replace(BASE_URL, "");
    }
    if (normalizedPath.includes("/api/serve-video/")) {
      normalizedPath = normalizedPath.replace("/api/serve-video/", "/images/video/");
    }
    if (!normalizedPath.startsWith("/")) {
      normalizedPath = "/" + normalizedPath;
    }

    // Security check
    if (!normalizedPath.includes("/images/video/")) {
      return NextResponse.json(
        { error: "Only videos from /images/video/ can be transcoded" },
        { status: 403 }
      );
    }

    const inputPath = path.join(process.cwd(), "public", normalizedPath);

    // Check if source file exists
    try {
      await fs.stat(inputPath);
    } catch {
      return NextResponse.json({ error: "Video file not found" }, { status: 404 });
    }

    await ensureCacheDir();

    // Generate job ID
    const jobId = Buffer.from(normalizedPath).toString("base64url");

    // Check if already cached
    const cachedPath = await getCachedVideo(normalizedPath);
    if (cachedPath) {
      const relativePath = `/cache/line-videos/${path.basename(cachedPath)}`;
      return NextResponse.json({
        success: true,
        status: "completed",
        progress: 100,
        jobId,
        outputUrl: `${BASE_URL}${relativePath}`,
        lineVideoUrl: `${BASE_URL}/api/line-video/${jobId}`,
        cached: true
      });
    }

    // Check if already in progress
    const existingStatus = transcodingStatus.get(jobId);
    if (existingStatus && existingStatus.status === "processing") {
      return NextResponse.json({
        success: true,
        status: "processing",
        progress: existingStatus.progress,
        jobId,
        message: "Transcoding already in progress"
      });
    }

    // Check if video is already H.264
    const isCompatible = await isH264Compatible(inputPath);
    if (isCompatible) {
      // If already H.264, just copy to cache with faststart
      const cacheName = getCacheFileName(normalizedPath);
      const outputPath = path.join(CACHE_DIR, cacheName);

      // Quick remux to add faststart
      await new Promise<void>((resolve, reject) => {
        const ffmpeg = spawn("ffmpeg", [
          "-i", inputPath,
          "-y",
          "-c", "copy",
          "-movflags", "+faststart",
          outputPath
        ]);

        ffmpeg.on("close", (code) => {
          if (code === 0) resolve();
          else reject(new Error("Remux failed"));
        });

        ffmpeg.on("error", reject);
      });

      const relativePath = `/cache/line-videos/${cacheName}`;
      return NextResponse.json({
        success: true,
        status: "completed",
        progress: 100,
        jobId,
        outputUrl: `${BASE_URL}${relativePath}`,
        lineVideoUrl: `${BASE_URL}/api/line-video/${jobId}`,
        alreadyCompatible: true
      });
    }

    // Start transcoding in background
    const duration = await getVideoDuration(inputPath);
    const cacheName = getCacheFileName(normalizedPath);
    const outputPath = path.join(CACHE_DIR, cacheName);

    // Initialize status
    transcodingStatus.set(jobId, {
      status: "processing",
      progress: 0,
      startTime: Date.now()
    });

    // Start transcoding (don't await - run in background)
    transcodeVideo(inputPath, outputPath, jobId, duration)
      .then(() => {
        const relativePath = `/cache/line-videos/${cacheName}`;
        transcodingStatus.set(jobId, {
          status: "completed",
          progress: 100,
          outputPath: relativePath,
          startTime: transcodingStatus.get(jobId)?.startTime || Date.now()
        });
      })
      .catch((error) => {
        transcodingStatus.set(jobId, {
          status: "error",
          progress: 0,
          error: error.message,
          startTime: transcodingStatus.get(jobId)?.startTime || Date.now()
        });
      });

    return NextResponse.json({
      success: true,
      status: "processing",
      progress: 0,
      jobId,
      message: "Transcoding started",
      estimatedTime: Math.ceil(duration / 2) // Rough estimate
    });
  } catch (error) {
    console.error("Transcode error:", error);
    return NextResponse.json(
      { error: "Failed to start transcoding" },
      { status: 500 }
    );
  }
}

// GET: Check transcoding status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get("jobId");

    if (!jobId) {
      return NextResponse.json({ error: "Job ID is required" }, { status: 400 });
    }

    const status = transcodingStatus.get(jobId);

    if (!status) {
      // Check if cached file exists
      const videoPath = Buffer.from(jobId, "base64url").toString("utf-8");
      const cachedPath = await getCachedVideo(videoPath);

      if (cachedPath) {
        const relativePath = `/cache/line-videos/${path.basename(cachedPath)}`;
        return NextResponse.json({
          success: true,
          status: "completed",
          progress: 100,
          outputUrl: `${BASE_URL}${relativePath}`,
          lineVideoUrl: `${BASE_URL}/api/line-video/${jobId}`
        });
      }

      return NextResponse.json({
        success: false,
        status: "not_found",
        message: "No transcoding job found"
      });
    }

    const response: Record<string, unknown> = {
      success: true,
      status: status.status,
      progress: status.progress,
      elapsedTime: Math.round((Date.now() - status.startTime) / 1000)
    };

    if (status.status === "completed" && status.outputPath) {
      response.outputUrl = `${BASE_URL}${status.outputPath}`;
      response.lineVideoUrl = `${BASE_URL}/api/line-video/${jobId}`;
    }

    if (status.status === "error") {
      response.error = status.error;
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("Status check error:", error);
    return NextResponse.json(
      { error: "Failed to check status" },
      { status: 500 }
    );
  }
}
