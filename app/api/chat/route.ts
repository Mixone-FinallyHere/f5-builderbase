import { chat, chatEnabled, type ChatTurn } from "@/lib/chat";
import { gate, groupsForLevel, normaliseGroups } from "@/lib/engine/gate";
import { buildPersonas } from "@/lib/engine/personas";
import { runWatchers } from "@/lib/engine/watchers";
import { readSession, writeSession } from "@/lib/session";
import { redis } from "@/lib/slides-server";

export const dynamic = "force-dynamic";

const MAX_TEXT = 600;
const MAX_HISTORY = 12;
const RATE_LIMIT = 40; // per session per 10 minutes

// Talk to Kate. Persona and consent come from the session cookie only.
export async function POST(req: Request) {
  const session = await readSession();
  const customer = session ? buildPersonas()[session.persona] : undefined;
  if (!session || !customer) return Response.json({ error: "Pick a customer first" }, { status: 401 });

  const db = redis();
  if (db) {
    const key = `chat:rl:${session.persona}:${session.iat}`;
    const hits = await db.incr(key);
    if (hits === 1) await db.expire(key, 600);
    if (hits > RATE_LIMIT) return Response.json({ error: "Kate needs a short break. Try again in a few minutes." }, { status: 429 });
  }

  let body: { text?: unknown; history?: unknown };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const text = typeof body.text === "string" ? body.text.trim().slice(0, MAX_TEXT) : "";
  if (text.length < 1) return Response.json({ error: "Say something first" }, { status: 400 });
  const history: ChatTurn[] = Array.isArray(body.history)
    ? body.history
        .filter((t): t is ChatTurn => typeof t === "object" && t !== null && (t.role === "user" || t.role === "assistant") && typeof t.content === "string")
        .slice(-MAX_HISTORY)
        .map((t) => ({ role: t.role, content: t.content.slice(0, MAX_TEXT * 2) }))
    : [];

  const groups = session.groups ? normaliseGroups(session.groups) : groupsForLevel(session.consent);
  const { visible, hiddenByConsent } = gate(customer, runWatchers(customer), groups);
  try {
    const result = await chat(customer, session.consent, visible, hiddenByConsent, history, text);
    for (const a of result.actions) if (a.type === "consent") await writeSession({ persona: session.persona, consent: a.level, iat: session.iat });
    return Response.json(result, { headers: { "Cache-Control": "no-store, private" } });
  } catch (err) {
    console.warn(`[chat] ${err instanceof Error ? err.message : err}`);
    return Response.json({ error: "Kate couldn't answer just now. Try again." }, { status: 502 });
  }
}

export function GET() {
  return Response.json({ mode: chatEnabled() ? "claude" : "scripted" });
}
