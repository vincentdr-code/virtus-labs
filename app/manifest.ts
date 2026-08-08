import type { MetadataRoute } from "next";

/**
 * PWA manifest — lets the dashboard install to a taskbar or home screen with
 * its own window and icon rather than living in a browser tab.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "TailorSent Operations",
    short_name: "TailorSent",
    description:
      "Internal operations dashboard — market research, pipeline, and client delivery.",
    start_url: "/",
    display: "standalone",
    background_color: "#08152B",
    theme_color: "#08152B",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
