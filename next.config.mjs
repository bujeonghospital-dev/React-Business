/** @type {import('next').NextConfig} */
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const POLICY_FILENAME_TH =
  "ข้อบังคับเกี่ยวกับการทำงาน ฉบับปรับปรุง ปี 2568.pdf";
const POLICY_PATH = `/downloads/${encodeURIComponent(POLICY_FILENAME_TH)}`;
const ASCII_FALLBACK = "policy-2568.pdf";

const isDev = process.env.NODE_ENV !== "production";

const nextConfig = {
  turbopack: {
    root: __dirname,
  },
  images: { unoptimized: true },

  ...(isDev
    ? { allowedDevOrigins: ["99.0.0.106", "localhost", "127.0.0.1"] }
    : {}),

  async rewrites() {
    return [{ source: "/dl/policy-2568", destination: POLICY_PATH }];
  },

  async headers() {
    const pdfHeaders = [
      { key: "Content-Type", value: "application/pdf" },
      { key: "X-Content-Type-Options", value: "nosniff" },

      {
        key: "Content-Disposition",
        value: `inline; filename="${ASCII_FALLBACK}"; filename*=UTF-8''${encodeURIComponent(
          POLICY_FILENAME_TH
        )}`,
      },
    ];

    // Video headers for LINE inline playback and social sharing
    const videoHeaders = [
      { key: "Access-Control-Allow-Origin", value: "*" },
      { key: "Access-Control-Allow-Methods", value: "GET, HEAD, OPTIONS" },
      {
        key: "Access-Control-Allow-Headers",
        value: "Range, Accept-Ranges, Content-Range",
      },
      { key: "Accept-Ranges", value: "bytes" },
      { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
      { key: "X-Content-Type-Options", value: "nosniff" },
    ];

    // MP4 specific headers
    const mp4Headers = [
      ...videoHeaders,
      { key: "Content-Type", value: "video/mp4" },
    ];

    // WebM specific headers
    const webmHeaders = [
      ...videoHeaders,
      { key: "Content-Type", value: "video/webm" },
    ];

    // MOV specific headers
    const movHeaders = [
      ...videoHeaders,
      { key: "Content-Type", value: "video/quicktime" },
    ];

    return [
      { source: "/downloads/:path*.pdf", headers: pdfHeaders },
      { source: "/dl/policy-2568", headers: pdfHeaders },

      // Video file headers for marketing folder
      { source: "/marketing/:path*.mp4", headers: mp4Headers },
      { source: "/marketing/:path*.MP4", headers: mp4Headers },
      { source: "/marketing/:path*.webm", headers: webmHeaders },
      { source: "/marketing/:path*.mov", headers: movHeaders },
      { source: "/marketing/:path*.MOV", headers: movHeaders },

      // General video headers
      { source: "/:path*.mp4", headers: mp4Headers },
      { source: "/:path*.webm", headers: webmHeaders },
      { source: "/:path*.mov", headers: movHeaders },
    ];
  },
};

export default nextConfig;
