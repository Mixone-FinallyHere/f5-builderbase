import type { MetadataRoute } from "next";

// Makes /app installable on a phone ("Add to Home Screen"): full screen, no browser chrome.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "KBC Mobile · concept (Heads-Up)",
    short_name: "KBC concept",
    description: "Heads-Up by Kate: a concept demo. Invented customers, no real data.",
    start_url: "/app",
    display: "standalone",
    background_color: "#eef3f6",
    theme_color: "#0091d2",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
