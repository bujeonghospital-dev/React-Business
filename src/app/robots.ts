// src/app/robots.ts
import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/_next/", "/home", "/login", "/register"],
      },
    ],
    sitemap: "https://app.bjhbangkok.com/sitemap.xml",
  };
}
