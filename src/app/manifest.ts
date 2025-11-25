import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "BJH Bangkok - Thai Packaging & Printing",
    short_name: "BJH Bangkok",
    description:
      "BJH Bangkok (บีเจเอช แบงค็อก) - ผู้นำด้านบรรจุภัณฑ์และงานพิมพ์ในประเทศไทย | Leading packaging & printing solutions provider in Thailand",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#3b82f6",
    icons: [
      {
        src: "/BJH.png",
        sizes: "any",
        type: "image/png",
      },
    ],
  };
}
