/** @type {import('next').NextConfig} */

const POLICY_FILENAME_TH =
  "ข้อบังคับเกี่ยวกับการทำงาน ฉบับปรับปรุง ปี 2568.pdf";
const POLICY_PATH = `/downloads/${encodeURIComponent(POLICY_FILENAME_TH)}`;
const ASCII_FALLBACK = "policy-2568.pdf";

const isDev = process.env.NODE_ENV !== "production";

const nextConfig = {
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

    return [
      { source: "/downloads/:path*.pdf", headers: pdfHeaders },
      { source: "/dl/policy-2568", headers: pdfHeaders },
    ];
  },
};

export default nextConfig;
