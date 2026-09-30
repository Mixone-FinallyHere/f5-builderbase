// Slide deck model shared by the /slides page and the /api/slides route.

export const LAYOUTS = ["title", "statement", "content"] as const;
export type Layout = (typeof LAYOUTS)[number];

export type Slide = {
  id: string;
  layout: Layout;
  title: string;
  subtitle: string;
  bullets: string[];
  image: string; // https URL or empty
  notes: string; // speaker notes, only shown in notes view
};

export type Deck = {
  slides: Slide[];
  updatedAt: number; // ms epoch of last save, 0 for the seed deck
};

export const LIMITS = {
  slides: 60,
  id: 40,
  title: 200,
  subtitle: 400,
  bullets: 12,
  bullet: 300,
  image: 1000,
  notes: 4000,
  bodyBytes: 256_000,
};

export function newSlide(layout: Layout = "content"): Slide {
  return {
    id: Math.random().toString(36).slice(2, 10),
    layout,
    title: "New slide",
    subtitle: "",
    bullets: [],
    image: "",
    notes: "",
  };
}

// Starter content, from docs/pitch/PITCH-TEMPLATE.md. Shown until the first save.
const seed: Array<Omit<Slide, "id" | "image">> = [
  { layout: "title", title: "F5 - Builderbase", subtitle: "One-line promise goes here · Tectonic Hackathon 2026", bullets: [], notes: "0:05. Name and one-line promise." },
  { layout: "statement", title: "A surprising stat, a question, or a one-sentence story.", subtitle: "Hook", bullets: [], notes: "0:15. Make them care in 10 seconds." },
  { layout: "content", title: "The problem", subtitle: "", bullets: ["Who hurts, and how often", "What it costs in time or money", "“One real quote from a user”"], notes: "0:20. Make the pain concrete." },
  { layout: "content", title: "The solution", subtitle: "X helps [who] do [what] by [how]", bullets: ["Key benefit one", "Key benefit two", "Key benefit three"], notes: "0:20. Say what it is, plainly." },
  { layout: "content", title: "Demo", subtitle: "The golden path in 3 steps", bullets: ["Step 1: action", "Step 2: action", "Step 3: result / wow moment"], notes: "0:45. Show, don't tell. Have the fallback video ready." },
  { layout: "content", title: "How it works", subtitle: "", bullets: ["Architecture and stack", "What we built tonight vs. reused", "The clever bit"], notes: "0:20. Earn technical credibility." },
  { layout: "content", title: "Market", subtitle: "", bullets: ["Who pays", "TAM / SAM / SOM or user count", "Competitors and our edge"], notes: "0:15. Show it's worth building." },
  { layout: "statement", title: "The shift that makes this possible today.", subtitle: "Why now", bullets: [], notes: "0:10. Tech, regulation or behaviour change." },
  { layout: "content", title: "Team", subtitle: "", bullets: ["Name: role, one credential", "Name: role, one credential", "Name: role, one credential"], notes: "0:15. Who did what tonight." },
  { layout: "title", title: "The ask", subtitle: "Feedback · pilot · intros  ·  f5-builderbase.vercel.app", bullets: [], notes: "0:15. Clear next step. Point to the live URL and repo." },
];

export const SEED_DECK: Deck = {
  slides: seed.map((s, i) => ({ ...s, id: `seed-${i + 1}`, image: "" })),
  updatedAt: 0,
};

// Invisible control characters (e.g. pasted from PDFs) render as boxes; keep only \t and \n.
const CONTROL_CHARS = /[\u0000-\u0008\u000B-\u001F\u007F-\u009F]/g;

function str(v: unknown, max: number): string | null {
  if (typeof v !== "string" || v.length > max) return null;
  // toWellFormed() replaces broken UTF-16 (half an emoji) with U+FFFD instead of storing garbage.
  return v.toWellFormed().replace(CONTROL_CHARS, "");
}

function isSafeImageUrl(v: string): boolean {
  if (v === "") return true;
  try {
    return new URL(v).protocol === "https:";
  } catch {
    return false;
  }
}

// Validates untrusted input (request bodies) into a Deck. Returns an error message on failure.
export function parseDeck(input: unknown): { deck: Deck } | { error: string } {
  if (typeof input !== "object" || input === null) return { error: "Deck must be an object" };
  const { slides, updatedAt } = input as Record<string, unknown>;
  if (!Array.isArray(slides) || slides.length === 0 || slides.length > LIMITS.slides) {
    return { error: `Deck needs 1 to ${LIMITS.slides} slides` };
  }
  if (typeof updatedAt !== "number" || !Number.isFinite(updatedAt)) return { error: "Invalid updatedAt" };

  const out: Slide[] = [];
  const ids = new Set<string>();
  for (const [i, raw] of slides.entries()) {
    if (typeof raw !== "object" || raw === null) return { error: `Slide ${i + 1} is invalid` };
    const s = raw as Record<string, unknown>;
    const id = str(s.id, LIMITS.id);
    const title = str(s.title, LIMITS.title);
    const subtitle = str(s.subtitle, LIMITS.subtitle);
    const image = str(s.image, LIMITS.image);
    const notes = str(s.notes, LIMITS.notes);
    const layout = LAYOUTS.find((l) => l === s.layout);
    const bullets = Array.isArray(s.bullets) && s.bullets.length <= LIMITS.bullets ? s.bullets.map((b) => str(b, LIMITS.bullet)) : null;
    if (!id || !/^[a-z0-9-]+$/i.test(id) || ids.has(id)) return { error: `Slide ${i + 1}: invalid or duplicate id` };
    if (title === null || subtitle === null || notes === null || !layout) return { error: `Slide ${i + 1}: invalid fields or text too long` };
    if (!bullets || bullets.some((b) => b === null)) return { error: `Slide ${i + 1}: at most ${LIMITS.bullets} bullets of ${LIMITS.bullet} chars` };
    if (image === null || !isSafeImageUrl(image)) return { error: `Slide ${i + 1}: image must be an https:// URL` };
    ids.add(id);
    out.push({ id, layout, title, subtitle, bullets: bullets as string[], image, notes });
  }
  return { deck: { slides: out, updatedAt } };
}
