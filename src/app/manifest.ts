import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "BJH Bangkok Hospital - โรงพยาบาลบีเจเอช",
    short_name: "BJH Bangkok",
    description:
      "BJH Bangkok (โรงพยาบาลบีเจเอช) - โรงพยาบาลชั้นนำในกรุงเทพฯ ประเทศไทย | BJH Hospital Bangkok - Leading Healthcare Provider in Thailand | บริการทางการแพทย์ครบวงจร มาตรฐานสากล",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0ea5e9",
    icons: [
      {
        src: "/BJH.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/BJH.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
