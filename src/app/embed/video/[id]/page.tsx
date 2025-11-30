import { notFound } from "next/navigation";
import fs from "fs";
import path from "path";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://app.bjhbangkok.com";
const VIDEO_ROOT = path.join(process.cwd(), "public", "images", "video");

interface VideoInfo {
    url: string;
    mimeType: string;
    thumbnail: string;
}

async function getVideoInfo(id: string): Promise<VideoInfo | null> {
    try {
        const decodedPath = Buffer.from(id, "base64url").toString("utf-8");

        // Allow both marketing and images/video paths
        const allowedPrefixes = ["/marketing/", "marketing/", "/images/video/", "images/video/"];
        const isAllowed = allowedPrefixes.some((p) => decodedPath.startsWith(p));
        if (!isAllowed) {
            return null;
        }

        const normalizedPath = decodedPath.startsWith("/") ? decodedPath : `/${decodedPath}`;
        const fullPath = path.join(process.cwd(), "public", normalizedPath);

        // Security: prevent path traversal
        const resolvedPath = path.resolve(fullPath);
        const publicDir = path.resolve(process.cwd(), "public");
        if (!resolvedPath.startsWith(publicDir)) {
            return null;
        }

        if (!fs.existsSync(fullPath)) {
            return null;
        }

        const ext = path.extname(fullPath).toLowerCase();
        const mimeTypes: Record<string, string> = {
            ".mp4": "video/mp4",
            ".webm": "video/webm",
            ".mov": "video/quicktime",
            ".m4v": "video/x-m4v",
        };

        // Find thumbnail
        const baseName = path.basename(fullPath, ext);
        const thumbnailCandidates = [
            `${baseName}_thumb.jpg`,
            `${baseName}_thumb.png`,
            `${baseName}.jpg`,
        ];

        let thumbnail = `${BASE_URL}/images/video-placeholder.svg`;
        for (const thumbName of thumbnailCandidates) {
            const thumbPath = path.join(path.dirname(fullPath), thumbName);
            if (fs.existsSync(thumbPath)) {
                const relativePath = path.relative(path.join(process.cwd(), "public"), thumbPath);
                const encodedPath = relativePath.split(path.sep).map(s => encodeURIComponent(s)).join("/");
                thumbnail = `${BASE_URL}/${encodedPath}`;
                break;
            }
        }

        // URL encode the path for special characters
        const encodedVideoPath = normalizedPath.split("/").map(s => encodeURIComponent(s)).join("/");

        return {
            url: `${BASE_URL}${encodedVideoPath}`,
            mimeType: mimeTypes[ext] || "video/mp4",
            thumbnail,
        };
    } catch {
        return null;
    }
}

// Embed page for Twitter Player Card and other embeds
export default async function VideoEmbedPage({
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
        <html>
            <head>
                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <style>{`
          * { margin: 0; padding: 0; box-sizing: border-box; }
          html, body { width: 100%; height: 100%; background: #000; overflow: hidden; }
          video { width: 100%; height: 100%; object-fit: contain; }
        `}</style>
            </head>
            <body>
                <video
                    controls
                    autoPlay
                    playsInline
                    muted
                    preload="metadata"
                    poster={video.thumbnail}
                >
                    <source src={video.url} type={video.mimeType} />
                </video>
            </body>
        </html>
    );
}
