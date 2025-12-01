import { Metadata, ResolvingMetadata } from "next";
import { notFound, redirect } from "next/navigation";
import fs from "fs";
import path from "path";
import CopyButton from "./CopyButton";

// Base URL for the application
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://app.bjhbangkok.com";

interface VideoInfo {
    id: string;
    name: string;
    url: string;
    thumbnail: string;
    width: number;
    height: number;
    duration?: number;
    mimeType: string;
}

// Function to get video info from file system or database
async function getVideoInfo(id: string): Promise<VideoInfo | null> {
    try {
        // Decode the ID (it's base64 encoded path)
        const decodedPath = Buffer.from(id, "base64url").toString("utf-8");

        // Security check - ensure path is within allowed folders
        const allowedFolders = ["/images/video/", "/marketing/", "images/video/", "marketing/"];
        const isAllowed = allowedFolders.some(folder => decodedPath.includes(folder));

        if (!isAllowed) {
            return null;
        }

        const normalizedPath = decodedPath.startsWith("/") ? decodedPath : `/${decodedPath}`;
        const fullPath = path.join(process.cwd(), "public", normalizedPath);

        // Check if file exists
        if (!fs.existsSync(fullPath)) {
            return null;
        }

        const stats = fs.statSync(fullPath);
        const fileName = path.basename(fullPath);
        const ext = path.extname(fullPath).toLowerCase();

        // Determine MIME type
        const mimeTypes: Record<string, string> = {
            ".mp4": "video/mp4",
            ".webm": "video/webm",
            ".mov": "video/quicktime",
            ".m4v": "video/x-m4v",
        };

        const mimeType = mimeTypes[ext] || "video/mp4";

        // Use LINE-specific video endpoint for OG tags (supports transcoded versions)
        // This endpoint serves cached transcoded H.264 version if available
        const lineVideoUrl = `${BASE_URL}/api/line-video/${id}`;

        // Direct URL for fallback/player
        const directUrl = `${BASE_URL}${normalizedPath}`;

        // Generate thumbnail path (check for existing thumbnail)
        const thumbnailName = `${path.basename(fileName, ext)}_thumb.jpg`;
        const folderPath = path.dirname(normalizedPath);
        const thumbnailPath = `${folderPath}/${thumbnailName}`;
        const thumbnailFullPath = path.join(process.cwd(), "public", thumbnailPath);

        // Also check for a thumbnail in the same folder
        const thumbnail = fs.existsSync(thumbnailFullPath)
            ? `${BASE_URL}${thumbnailPath}`
            : `${BASE_URL}/images/video-placeholder.svg`;

        return {
            id,
            name: fileName,
            url: lineVideoUrl, // Use LINE-optimized endpoint for OG tags
            thumbnail,
            width: 1280,
            height: 720,
            mimeType: "video/mp4", // Always report as MP4 for LINE
        };
    } catch (error) {
        console.error("Error getting video info:", error);
        return null;
    }
}

// Generate metadata for LINE and social sharing
export async function generateMetadata(
    { params }: { params: Promise<{ id: string }> },
    parent: ResolvingMetadata
): Promise<Metadata> {
    const { id } = await params;
    const video = await getVideoInfo(id);

    if (!video) {
        return {
            title: "Video Not Found",
        };
    }

    const pageUrl = `${BASE_URL}/share/video/${id}`;

    return {
        title: `${video.name} - BJH Bangkok`,
        description: `Watch ${video.name} from BJH Bangkok Medical Center`,

        // Open Graph for video - Critical for LINE inline playback
        openGraph: {
            title: video.name,
            description: `Watch ${video.name} from BJH Bangkok Medical Center`,
            url: pageUrl,
            siteName: "BJH Bangkok",
            type: "video.other",
            images: [
                {
                    url: video.thumbnail,
                    width: video.width,
                    height: video.height,
                    alt: video.name,
                },
            ],
            videos: [
                {
                    url: video.url,
                    secureUrl: video.url,
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
            description: `Watch ${video.name} from BJH Bangkok Medical Center`,
            images: [video.thumbnail],
        },

        // Additional meta tags via 'other' - these will be rendered as <meta name="key" content="value">
        other: {
            // LINE specific
            "line:title": video.name,
            "line:description": `Watch ${video.name}`,

            // Video meta tags (for broader compatibility)
            "video:duration": video.duration?.toString() || "",
            "video:release_date": new Date().toISOString(),

            // Apple specific for inline video
            "apple-mobile-web-app-capable": "yes",

            // Additional OG video tags as fallback
            "og:video": video.url,
            "og:video:secure_url": video.url,
            "og:video:type": video.mimeType,
            "og:video:width": String(video.width),
            "og:video:height": String(video.height),
        },
    };
}

// Video share page component - Optimized for LINE in-app browser
export default async function VideoSharePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const video = await getVideoInfo(id);

    if (!video) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col">
            {/* Full-screen Video Player for LINE */}
            <div className="flex-1 flex items-center justify-center p-2 sm:p-4">
                <div className="w-full max-w-4xl">
                    {/* Video Container - Large and prominent */}
                    <div className="bg-black rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl">
                        <video
                            controls
                            autoPlay
                            muted
                            playsInline
                            preload="auto"
                            poster={video.thumbnail}
                            className="w-full aspect-video"
                            controlsList="nodownload"
                            webkit-playsinline="true"
                            x-webkit-airplay="allow"
                        >
                            <source src={video.url} type={video.mimeType} />
                            Your browser does not support the video tag.
                        </video>
                    </div>

                    {/* Tap to unmute hint */}
                    <div className="mt-3 text-center">
                        <p className="text-white/40 text-sm">🔊 แตะที่วิดีโอเพื่อเปิดเสียง</p>
                    </div>

                    {/* Video Info - Compact */}
                    <div className="mt-4 text-center px-4">
                        <h1 className="text-lg sm:text-2xl font-bold text-white mb-1 line-clamp-2">{video.name}</h1>
                        <p className="text-white/60 text-sm">BJH Bangkok Medical Center</p>
                    </div>

                    {/* Action buttons - Mobile optimized */}
                    <div className="mt-6 px-4 flex flex-col sm:flex-row justify-center gap-3">
                        <a
                            href={`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(`${BASE_URL}/share/video/${id}`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-6 py-3 bg-[#00B900] hover:bg-[#00A000] active:bg-[#009000] text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.349 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
                            </svg>
                            แชร์ต่อใน LINE
                        </a>

                        <CopyButton url={`${BASE_URL}/share/video/${id}`} />
                    </div>

                    {/* Back to gallery link */}
                    <div className="mt-6 pb-6 text-center">
                        <a
                            href="/all-files-gallery"
                            className="text-purple-400 hover:text-purple-300 underline text-sm"
                        >
                            ← กลับไปหน้าแกลเลอรี่
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
