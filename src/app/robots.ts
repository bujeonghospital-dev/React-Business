// src/app/robots.ts
import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/_next/",
          "/home",
          "/login",
          "/register",
          "/admin/",
          "/dashboard/",
          "/private/",
        ],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/api/", "/_next/", "/login", "/register", "/admin/"],
      },
    ],
    sitemap: "https://app.bjhbangkok.com/sitemap.xml",
    host: "https://app.bjhbangkok.com",
  };
}
