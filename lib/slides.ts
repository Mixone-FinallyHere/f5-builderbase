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

// Starter content: the pitch structure from docs/pitch/PITCH-TEMPLATE.md with the KBC problem slides
// filled in from our research (sources in the speaker notes). Shown until the first save.
const seed: Array<Omit<Slide, "id" | "image">> = [
  { layout: "title", title: "Heads-Up", subtitle: "Your bank warns you before things go wrong, and explains why · KBC challenge · Tectonic Hackathon 2026", bullets: [], notes: "0:05. Name and one-line promise." },
  { layout: "statement", title: "KBC has the world's best banking app. Half of its Belgian clients don't use it.", subtitle: "Hook", bullets: [], notes: "0:15. About 2.1M of 4.1M Belgian clients use KBC Mobile (KBC Annual Report 2025). The brief's '2.3M customers' is the number who have used Kate." },
  { layout: "content", title: "Customers feel acted on, not helped", subtitle: "The problem", bullets: ["Accounts blocked and relationships ended by algorithms, rarely explained (+48% bank-initiated closures in 2024)", "Only 37.5% of justified fraud complaints get resolved, against 96% for everything else", "Fees up again in 2026, while €303bn in savings earns about 0.6%", "1M+ Belgians already moved everyday banking to Revolut"], notes: "0:20. Sources: Ombudsfin annual report 2024; Test-Aankoop 2025; NBB 2025; Belga 2026. Pick the one pain our solution fixes and lead with it." },
  { layout: "content", title: "It hits different people at different moments", subtitle: "Who it hurts", bullets: ["Young adults: everyday money lives in a second app", "Home buyers: 2 in 3 don't understand energy-label rules and premiums", "Seniors: 35% of over-75s have never been online, while branches and ATMs recede", "Stretched households: 38% expect trouble making ends meet"], notes: "Optional slide: keep only the segment our demo persona belongs to. Sources: BNP Paribas Fortis 2025, KBC/Ipsos 2025, Statbel 2024 and 2025." },
  { layout: "content", title: "The solution", subtitle: "[Name] helps [who] do [what] by [how]", bullets: ["Key benefit one", "Key benefit two", "Key benefit three"], notes: "0:20. Say what it is, plainly. Tie each benefit to a problem on slide 3." },
  { layout: "content", title: "Demo", subtitle: "One customer, one moment", bullets: ["Step 1: the moment of friction", "Step 2: what our product does", "Step 3: the outcome"], notes: "0:45. Show, don't tell. Have the fallback video ready (it's embedded on the landing page)." },
  { layout: "content", title: "How it works", subtitle: "", bullets: ["Signals in, explanation out: architecture and stack", "How it scales to millions of customers", "Secure by design: audited with Aikido"], notes: "0:20. Earn technical credibility. Mention Google Cloud / Gemini if used." },
  { layout: "content", title: "Why it matters for KBC", subtitle: "", bullets: ["Digital sales are at 57% against a 65% target; the NPS ranking has been stuck at top 3 against a top-2 target", "Kate creates 656k leads a quarter, but only about 14% convert", "Fraud costs now land on the bank: courts and new EU rules shift the burden of proof"], notes: "0:15. Sources: KBC Annual Report 2025; KBC newsroom (Kate, five years); VRT 2026 on the Cassation ruling; PSR agreement Nov 2025." },
  { layout: "statement", title: "Courts, EU law and neobanks are changing what customers can expect from their bank.", subtitle: "Why now", bullets: [], notes: "0:10. GDPR Art. 22 (SCHUFA), AI Act transparency from Aug 2026, PSR burden of proof, Trade Republic with a Belgian IBAN (Sep 2026). Rewrite if our solution points elsewhere." },
  { layout: "content", title: "Team F5", subtitle: "", bullets: ["Name: role, one credential", "Name: role, one credential", "Name: role, one credential"], notes: "0:15. Who did what tonight." },
  { layout: "title", title: "The ask", subtitle: "Feedback · pilot with KBC · f5-builderbase.vercel.app", bullets: [], notes: "0:15. Clear next step. Point to the live URL and repo." },
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
