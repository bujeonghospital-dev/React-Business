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
          "/login",
          "/register",
          "/oauth2callback",
          "/admin/",
          "/dashboard/",
          "/private/",
          "/all-files-gallery",
          "/facebook-ads-manager/",
          "/customer-contact-dashboard/",
        ],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: [
          "/api/",
          "/_next/",
          "/login",
          "/register",
          "/oauth2callback",
          "/admin/",
          "/all-files-gallery",
        ],
      },
      {
        userAgent: "Bingbot",
        allow: "/",
        disallow: [
          "/api/",
          "/_next/",
          "/login",
          "/register",
        ],
      },
    ],
    sitemap: "https://app.bjhbangkok.com/sitemap.xml",
  };
}
