import { notFound } from "next/navigation";
import fs from "fs";
import path from "path";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://app.bjhbangkok.com";

interface VideoInfo {
    url: string;
    mimeType: string;
    thumbnail: string;
}

async function getVideoInfo(id: string): Promise<VideoInfo | null> {
    try {
        const decodedPath = Buffer.from(id, "base64url").toString("utf-8");

        if (!decodedPath.includes("/marketing/")) {
            return null;
        }

        const normalizedPath = decodedPath.startsWith("/") ? decodedPath : `/${decodedPath}`;
        const fullPath = path.join(process.cwd(), "public", normalizedPath);

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

        const fileName = path.basename(fullPath, ext);
        const thumbnailPath = `/images/video/${fileName}_thumb.jpg`;
        const thumbnailFullPath = path.join(process.cwd(), "public", thumbnailPath);

        const thumbnail = fs.existsSync(thumbnailFullPath)
            ? `${BASE_URL}${thumbnailPath}`
            : `${BASE_URL}/images/video-placeholder.svg`;

        return {
            url: `${BASE_URL}${normalizedPath}`,
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
