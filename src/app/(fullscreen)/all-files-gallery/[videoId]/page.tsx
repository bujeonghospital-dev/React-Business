import { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";
import fs from "fs";
import path from "path";
import VideoShareClient from "./VideoShareClient";

// Base URL for the application
const BASE_URL =
    process.env.NEXT_PUBLIC_BASE_URL || "https://app.bjhbangkok.com";

// Directory where videos are stored
const VIDEO_ROOT = path.join(process.cwd(), "public", "images", "video");
const CACHE_DIR = path.join(process.cwd(), "public", "cache", "line-videos");

interface VideoInfo {
    id: string;
    name: string;
    originalUrl: string;
    lineVideoUrl: string;
    thumbnailUrl: string;
    width: number;
    height: number;
    duration?: number;
    mimeType: string;
    folder: string;
    size: number;
}

// Parse video ID to extract folder and filename info
// Format: timestamp-index-random or filename without extension
function parseVideoId(videoId: string): { folder: string; filename: string } | null {
    // Try to find the file by searching through folders
    return null; // Will search dynamically
}

// Recursively search for video file by ID pattern
function findVideoByPattern(
    dir: string,
    pattern: string,
    basePath: string = ""
): { fullPath: string; relativePath: string; folder: string } | null {
    try {
        const entries = fs.readdirSync(dir, { withFileTypes: true });

        for (const entry of entries) {
            const entryPath = path.join(dir, entry.name);
            const relativePath = basePath ? `${basePath}/${entry.name}` : entry.name;

            if (entry.isDirectory()) {
                // Skip cache and system folders
                if (entry.name === "transcoded" || entry.name === ".git") continue;

                const found = findVideoByPattern(entryPath, pattern, relativePath);
                if (found) return found;
            } else if (entry.isFile()) {
                const ext = path.extname(entry.name).toLowerCase();
                const isVideo = [".mp4", ".webm", ".mov", ".m4v", ".avi"].includes(ext);

                if (isVideo) {
                    // Match by: 
                    // 1. Exact filename without extension
                    // 2. Filename contains the pattern
                    // 3. Pattern matches part of filename
                    const nameWithoutExt = path.basename(entry.name, ext);

                    if (
                        nameWithoutExt === pattern ||
                        entry.name === pattern ||
                        nameWithoutExt.includes(pattern) ||
                        pattern.includes(nameWithoutExt)
                    ) {
                        return {
                            fullPath: entryPath,
                            relativePath,
                            folder: basePath || "root",
                        };
                    }
                }
            }
        }
    } catch (error) {
        console.error("Error searching for video:", error);
    }

    return null;
}

// Get video info from filesystem
async function getVideoInfo(videoId: string): Promise<VideoInfo | null> {
    try {
        // Decode if base64url encoded
        let searchPattern = videoId;
        try {
            const decoded = Buffer.from(videoId, "base64url").toString("utf-8");
            if (decoded.includes("/images/video/")) {
                // It's a path-based ID from previous system
                const relativePath = decoded.replace(/^\/images\/video\//, "");
                const fullPath = path.join(VIDEO_ROOT, relativePath);

                if (fs.existsSync(fullPath)) {
                    const stats = fs.statSync(fullPath);
                    const fileName = path.basename(fullPath);
                    const ext = path.extname(fullPath).toLowerCase();
                    const folder = path.dirname(relativePath);

                    return createVideoInfo(videoId, fullPath, relativePath, folder, stats);
                }
            }
        } catch {
            // Not base64, continue with pattern search
        }

        // Search for video by pattern
        const found = findVideoByPattern(VIDEO_ROOT, searchPattern);

        if (!found) {
            return null;
        }

        const stats = fs.statSync(found.fullPath);
        return createVideoInfo(videoId, found.fullPath, found.relativePath, found.folder, stats);
    } catch (error) {
        console.error("Error getting video info:", error);
        return null;
    }
}

// Create VideoInfo object
function createVideoInfo(
    id: string,
    fullPath: string,
    relativePath: string,
    folder: string,
    stats: fs.Stats
): VideoInfo {
    const fileName = path.basename(fullPath);
    const ext = path.extname(fullPath).toLowerCase();
    const nameWithoutExt = path.basename(fileName, ext);

    // Generate base64url ID for LINE video endpoint
    const pathForId = `/images/video/${relativePath}`;
    const lineVideoId = Buffer.from(pathForId).toString("base64url");

    // Check for thumbnail
    const thumbnailName = `${nameWithoutExt}_thumb.jpg`;
    const thumbnailPath = path.join(path.dirname(fullPath), thumbnailName);
    const hasThumbnail = fs.existsSync(thumbnailPath);

    // Generate thumbnail URL or use placeholder
    const thumbnailRelativePath = hasThumbnail
        ? `/images/video/${path.dirname(relativePath)}/${thumbnailName}`
        : null;

    // Check if transcoded version exists
    const cacheFileName = `${nameWithoutExt}_${lineVideoId.slice(0, 20)}_line.mp4`;
    const transcodedPath = path.join(CACHE_DIR, cacheFileName);
    const hasTranscoded = fs.existsSync(transcodedPath);

    // Encode path segments for URL safety (handles spaces and special chars)
    const encodedRelativePath = relativePath
        .split("/")
        .map((segment) => encodeURIComponent(segment))
        .join("/");

    return {
        id,
        name: fileName,
        originalUrl: `${BASE_URL}/images/video/${encodedRelativePath}`,
        lineVideoUrl: hasTranscoded
            ? `${BASE_URL}/api/line-video/${lineVideoId}`
            : `${BASE_URL}/api/serve-video/${encodedRelativePath}`,
        thumbnailUrl: thumbnailRelativePath
            ? `${BASE_URL}${thumbnailRelativePath.split("/").map((s) => encodeURIComponent(s)).join("/")}`
            : `${BASE_URL}/images/video-placeholder.svg`,
        width: 1280,
        height: 720,
        mimeType: "video/mp4",
        folder,
        size: stats.size,
    };
}

// Trigger transcoding in background
async function triggerTranscoding(videoPath: string): Promise<void> {
    try {
        const response = await fetch(`${BASE_URL}/api/transcode-video`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ videoPath }),
        });
        // Fire and forget - don't wait for completion
    } catch (error) {
        console.error("Error triggering transcoding:", error);
    }
}

// Generate metadata for LINE and social sharing
export async function generateMetadata(
    { params }: { params: Promise<{ videoId: string }> },
    parent: ResolvingMetadata
): Promise<Metadata> {
    const { videoId } = await params;
    const video = await getVideoInfo(videoId);

    if (!video) {
        return {
            title: "Video Not Found",
            description: "The requested video could not be found.",
        };
    }

    const pageUrl = `${BASE_URL}/all-files-gallery/${videoId}`;

    // Trigger transcoding if not already done (fire and forget)
    if (!video.lineVideoUrl.includes("/api/line-video/")) {
        const pathForTranscode = `/images/video/${video.folder}/${video.name}`;
        triggerTranscoding(pathForTranscode);
    }

    return {
        title: `${video.name} - BJH Bangkok`,
        description: `Watch ${video.name} from BJH Bangkok`,

        // Open Graph for video - Critical for LINE inline playback
        openGraph: {
            title: video.name,
            description: `Watch ${video.name} from BJH Bangkok`,
            url: pageUrl,
            siteName: "BJH Bangkok",
            type: "video.other",
            images: [
                {
                    url: video.thumbnailUrl,
                    width: video.width,
                    height: video.height,
                    alt: video.name,
                },
            ],
            videos: [
                {
                    url: video.lineVideoUrl,
                    secureUrl: video.lineVideoUrl,
                    type: video.mimeType,
                    width: video.width,
                    height: video.height,
                },
            ],
        },

        // Twitter Card for video
        twitter: {
            card: "player",
            title: video.name,
            description: `Watch ${video.name} from BJH Bangkok`,
            images: [video.thumbnailUrl],
        },

        // Additional meta tags
        other: {
            // LINE specific tags
            "line:title": video.name,
            "line:description": `Watch ${video.name}`,

            // Video meta tags
            "video:duration": video.duration?.toString() || "",
            "video:release_date": new Date().toISOString(),

            // Apple specific for inline video
            "apple-mobile-web-app-capable": "yes",

            // Additional OG video tags as fallback
            "og:video": video.lineVideoUrl,
            "og:video:secure_url": video.lineVideoUrl,
            "og:video:type": video.mimeType,
            "og:video:width": String(video.width),
            "og:video:height": String(video.height),
        },
    };
}

// Page component
export default async function VideoSharePage({
    params,
}: {
    params: Promise<{ videoId: string }>;
}) {
    const { videoId } = await params;
    const video = await getVideoInfo(videoId);

    if (!video) {
        notFound();
    }

    // Create share URL for LINE
    const shareUrl = `${BASE_URL}/all-files-gallery/${videoId}`;
    const lineShareUrl = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(shareUrl)}`;

    return (
        <VideoShareClient
            video={video}
            shareUrl={shareUrl}
            lineShareUrl={lineShareUrl}
        />
    );
}
