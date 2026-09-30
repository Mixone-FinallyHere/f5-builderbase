// Turns a pasted video link into something we can embed. Only known hosts and https .mp4 files
// are accepted, so a typo can't turn into an iframe to an arbitrary site (the CSP enforces the same).

export type Embed = { kind: "iframe"; src: string } | { kind: "video"; src: string };

export function toEmbed(raw: string): Embed | null {
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    return null;
  }
  if (url.protocol !== "https:") return null;
  const host = url.hostname.replace(/^www\./, "");

  if (host === "youtube.com" || host === "youtu.be") {
    const id = host === "youtu.be" ? url.pathname.slice(1) : url.searchParams.get("v") ?? url.pathname.split("/").pop();
    return id && /^[\w-]{6,20}$/.test(id) ? { kind: "iframe", src: `https://www.youtube-nocookie.com/embed/${id}` } : null;
  }
  if (host === "vimeo.com") {
    const id = url.pathname.split("/").filter(Boolean)[0];
    return id && /^\d+$/.test(id) ? { kind: "iframe", src: `https://player.vimeo.com/video/${id}` } : null;
  }
  if (host === "loom.com") {
    const id = url.pathname.split("/").pop();
    return id && /^[\w-]+$/.test(id) ? { kind: "iframe", src: `https://www.loom.com/embed/${id}` } : null;
  }
  if (url.pathname.toLowerCase().endsWith(".mp4")) return { kind: "video", src: url.href };
  return null;
}
