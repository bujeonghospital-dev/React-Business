import { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";
import fs from "fs";
import path from "path";
import Link from "next/link";

// Base URL for the application
const BASE_URL =
    process.env.NEXT_PUBLIC_BASE_URL || "https://app.bjhbangkok.com";

// Root directory for videos
const VIDEO_ROOT = path.join(process.cwd(), "public", "images", "video");

interface VideoInfo {
    id: string;
    name: string;
    displayName: string;
    originalUrl: string;
    videoUrl: string;  // URL for OG meta tags (API endpoint with range support)
    thumbnail: string;
    width: number;
    height: number;
    duration?: number;
    mimeType: string;
    size: number;
    folder: string;
}

// Get clean display name from filename
function getDisplayName(fileName: string): string {
    const ext = path.extname(fileName).toLowerCase();
    const baseName = path.basename(fileName, ext);
    // Convert underscores/dashes to spaces and capitalize
    return baseName
        .replace(/[-_]/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase())
        .trim();
}

// Function to get video info from file system
async function getVideoInfo(id: string): Promise<VideoInfo | null> {
    try {
        // Decode the ID (it is base64url encoded path)
        let decodedPath: string;
        try {
            decodedPath = Buffer.from(id, "base64url").toString("utf-8");
        } catch {
            console.log("Failed to decode video ID:", id);
            return null;
        }

        // Security check - only allow images/video folder
        const allowedPrefixes = ["/images/video/", "images/video/"];
        const isAllowed = allowedPrefixes.some((p) => decodedPath.startsWith(p));
        if (!isAllowed) {
            console.log("Path not allowed:", decodedPath);
            return null;
        }

        // Normalize path
        const normalizedPath = decodedPath.startsWith("/")
            ? decodedPath
            : `/${decodedPath}`;
        const relativePath = normalizedPath.replace(/^\/images\/video\//, "");
        const fullPath = path.join(VIDEO_ROOT, relativePath);

        // Security: ensure path is within VIDEO_ROOT
        const resolvedPath = path.resolve(fullPath);
        const resolvedRoot = path.resolve(VIDEO_ROOT);
        if (!resolvedPath.startsWith(resolvedRoot)) {
            console.log("Path traversal attempt blocked:", decodedPath);
            return null;
        }

        // Check if file exists
        if (!fs.existsSync(fullPath)) {
            console.log("File not found:", fullPath);
            return null;
        }

        const stats = fs.statSync(fullPath);
        if (!stats.isFile()) {
            console.log("Not a file:", fullPath);
            return null;
        }

        const fileName = path.basename(fullPath);
        const ext = path.extname(fullPath).toLowerCase();

        // Only allow video files
        const videoExtensions = [".mp4", ".webm", ".mov", ".m4v"];
        if (!videoExtensions.includes(ext)) {
            console.log("Not a video file:", ext);
            return null;
        }

        // Determine MIME type
        const mimeTypes: Record<string, string> = {
            ".mp4": "video/mp4",
            ".webm": "video/webm",
            ".mov": "video/quicktime",
            ".m4v": "video/x-m4v",
        };
        const mimeType = mimeTypes[ext] || "video/mp4";

        // Get folder name for organization
        const folder = path.dirname(relativePath) || "root";

        // Check for existing thumbnail
        const baseName = path.basename(fileName, ext);
        const thumbnailCandidates = [
            `${baseName}_thumb.jpg`,
            `${baseName}_thumb.png`,
            `${baseName}.jpg`,
            `${baseName}.png`,
        ];

        let thumbnail = `${BASE_URL}/images/video-placeholder.svg`;
        for (const thumbName of thumbnailCandidates) {
            const thumbPath = path.join(path.dirname(fullPath), thumbName);
            if (fs.existsSync(thumbPath)) {
                const thumbRelative = path.join(path.dirname(relativePath), thumbName);
                const encodedThumbPath = thumbRelative
                    .split("/")
                    .map((s) => encodeURIComponent(s))
                    .join("/");
                thumbnail = `${BASE_URL}/images/video/${encodedThumbPath}`;
                break;
            }
        }

        // Encode relative path for URLs (handles spaces and special characters)
        const encodedRelativePath = relativePath
            .split("/")
            .map((s) => encodeURIComponent(s))
            .join("/");

        // Use serve-video API for video URL (supports byte-range requests)
        const videoUrl = `${BASE_URL}/api/serve-video/${encodedRelativePath}`;
        const originalUrl = `${BASE_URL}/images/video/${encodedRelativePath}`;

        return {
            id,
            name: fileName,
            displayName: getDisplayName(fileName),
            originalUrl,
            videoUrl,
            thumbnail,
            width: 1280,
            height: 720,
            mimeType,
            size: stats.size,
            folder,
        };
    } catch (error) {
        console.error("Error getting video info:", error);
        return null;
    }
}

// Generate metadata for LINE inline video playback
export async function generateMetadata(
    { params }: { params: Promise<{ id: string }> },
    parent: ResolvingMetadata
): Promise<Metadata> {
    const { id } = await params;
    const video = await getVideoInfo(id);

    if (!video) {
        return {
            title: "Video Not Found - BJH Bangkok",
            description: "The requested video could not be found.",
        };
    }

    const pageUrl = `${BASE_URL}/all-files-gallery/video/${id}`;

    // Critical: These meta tags enable LINE inline video playback
    return {
        title: `${video.displayName} - BJH Bangkok`,
        description: `Watch ${video.displayName} from BJH Bangkok Medical Center`,

        // Open Graph for video - Essential for LINE inline playback
        openGraph: {
            title: video.displayName,
            description: `Watch ${video.displayName} from BJH Bangkok Medical Center`,
            url: pageUrl,
            siteName: "BJH Bangkok",
            type: "video.other", // Required for video content
            images: [
                {
                    url: video.thumbnail,
                    width: video.width,
                    height: video.height,
                    alt: video.displayName,
                },
            ],
            videos: [
                {
                    url: video.videoUrl,
                    secureUrl: video.videoUrl,
                    type: "video/mp4",
                    width: video.width,
                    height: video.height,
                },
            ],
        },

        // Twitter Player Card
        twitter: {
            card: "player",
            title: video.displayName,
            description: `Watch ${video.displayName} from BJH Bangkok Medical Center`,
            images: [video.thumbnail],
        },

        // Additional meta for LINE and other platforms
        other: {
            // Direct video URL for LINE - must be publicly accessible HTTPS
            "og:video": video.videoUrl,
            "og:video:secure_url": video.videoUrl,
            "og:video:type": "video/mp4",
            "og:video:width": String(video.width),
            "og:video:height": String(video.height),

            // LINE specific meta tags
            "line:title": video.displayName,
            "line:description": `Watch ${video.displayName}`,

            // Twitter Player
            "twitter:player": `${BASE_URL}/embed/video/${id}`,
            "twitter:player:width": String(video.width),
            "twitter:player:height": String(video.height),
            "twitter:player:stream": video.videoUrl,
            "twitter:player:stream:content_type": "video/mp4",

            // Apple inline video support
            "apple-mobile-web-app-capable": "yes",
        },
    };
}

// Format file size for display
function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

// Video page component
export default async function VideoPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const video = await getVideoInfo(id);

    if (!video) {
        notFound();
    }

    const shareUrl = `${BASE_URL}/all-files-gallery/video/${id}`;
    const lineShareUrl = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(shareUrl)}`;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            {/* Video Player Section */}
            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* Back Button */}
                <Link
                    href="/all-files-gallery"
                    className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-6 transition-colors"
                >
                    <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 19l-7-7 7-7"
                        />
                    </svg>
                    Back to Gallery
                </Link>

                {/* Video Container */}
                <div className="bg-black rounded-2xl overflow-hidden shadow-2xl">
                    <video
                        controls
                        autoPlay
                        playsInline
                        preload="metadata"
                        poster={video.thumbnail}
                        className="w-full aspect-video"
                    >
                        <source src={video.videoUrl} type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                </div>

                {/* Video Info */}
                <div className="mt-6">
                    <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                        {video.displayName}
                    </h1>
                    <div className="flex flex-wrap gap-4 text-white/60 text-sm mb-4">
                        <span> {video.folder}</span>
                        <span> {formatFileSize(video.size)}</span>
                    </div>

                    {/* Share Section */}
                    <div className="mt-8 p-6 bg-white/5 rounded-2xl border border-white/10">
                        <h2 className="text-lg font-semibold text-white mb-4">
                             Share this video
                        </h2>
                        <p className="text-white/60 text-sm mb-4">
                            Share this link on LINE for inline video playback
                        </p>

                        {/* Share URL Display */}
                        <div className="flex items-center gap-2 bg-black/30 rounded-xl p-3 mb-4">
                            <input
                                type="text"
                                readOnly
                                value={shareUrl}
                                className="flex-1 bg-transparent text-white/80 text-sm outline-none"
                            />
                            <button
                                onClick={() => {
                                    if (typeof navigator !== "undefined") {
                                        navigator.clipboard?.writeText(shareUrl);
                                    }
                                }}
                                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm rounded-lg transition-colors"
                            >
                                Copy
                            </button>
                        </div>

                        {/* Share Buttons */}
                        <div className="flex flex-wrap gap-3">
                            {/* LINE Share Button */}
                            <a
                                href={lineShareUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-[#00B900] hover:bg-[#00A000] text-white rounded-xl font-medium transition-colors"
                            >
                                <svg
                                    className="w-5 h-5"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                >
                                    <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.349 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
                                </svg>
                                Share on LINE
                            </a>

                            {/* Copy Link Button */}
                            <button
                                onClick={() => {
                                    if (typeof navigator !== "undefined") {
                                        navigator.clipboard?.writeText(shareUrl);
                                        alert("Link copied!");
                                    }
                                }}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-colors"
                            >
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                                    />
                                </svg>
                                Copy Link
                            </button>

                            {/* Native Share (Mobile) */}
                            <button
                                onClick={() => {
                                    if (typeof navigator !== "undefined" && navigator.share) {
                                        navigator.share({
                                            title: video.displayName,
                                            text: `Watch ${video.displayName} from BJH Bangkok`,
                                            url: shareUrl,
                                        });
                                    }
                                }}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-colors"
                            >
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                                    />
                                </svg>
                                Share
                            </button>
                        </div>
                    </div>

                    {/* Info Box */}
                    <div className="mt-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                        <h3 className="text-green-300 font-semibold mb-2 flex items-center gap-2">
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.349 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
                            </svg>
                            LINE Inline Video Playback
                        </h3>
                        <ul className="text-green-200/80 text-sm space-y-1">
                            <li> Copy and paste this link directly into LINE chat</li>
                            <li> LINE will show a video preview thumbnail</li>
                            <li> Tap play to watch inline without leaving LINE</li>
                            <li> Or use the green "Share on LINE" button above</li>
                        </ul>
                    </div>

                    {/* Download Button */}
                    <div className="mt-6">
                        <a
                            href={video.originalUrl}
                            download={video.name}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-colors"
                        >
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                                />
                            </svg>
                            Download Video
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
