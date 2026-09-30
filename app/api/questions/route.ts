import { createHash } from "node:crypto";
import { authError, checkPassword, redis } from "@/lib/slides-server";

export const dynamic = "force-dynamic";

const LIST = "questions";
const MAX_KEPT = 200;
const RATE_LIMIT = 5; // per IP per 10 minutes
const VOICE_MAX_B64 = 400_000; // ~300 KB of audio
const MIMES = new Set(["audio/webm", "audio/mp4", "audio/ogg", "audio/mpeg"]);

type Question = { id: string; name: string; question: string; voice?: string; mime?: string; at: string };

// Anyone can leave a question (rate-limited). Reading them needs the team password.
export async function POST(req: Request) {
  const db = redis();
  if (!db) return Response.json({ error: "Questions aren't set up on this deployment" }, { status: 503 });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  const rlKey = `q:rl:${createHash("sha256").update(ip).digest("hex").slice(0, 16)}`;
  const hits = await db.incr(rlKey);
  if (hits === 1) await db.expire(rlKey, 600);
  if (hits > RATE_LIMIT) return Response.json({ error: "Too many questions from this connection. Try again in a few minutes." }, { status: 429 });

  const text = await req.text();
  if (text.length > VOICE_MAX_B64 + 2_000) return Response.json({ error: "Too large" }, { status: 413 });
  let body: { name?: unknown; question?: unknown; voice?: unknown; mime?: unknown };
  try {
    body = JSON.parse(text);
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const name = typeof body.name === "string" ? body.name.trim().slice(0, 60) : "";
  const question = typeof body.question === "string" ? body.question.trim().slice(0, 600) : "";
  const voice = typeof body.voice === "string" ? body.voice : undefined;
  const mime = typeof body.mime === "string" ? body.mime : undefined;
  if (question.length < 3 && !voice) return Response.json({ error: "Type a question or record one" }, { status: 400 });
  if (voice && (voice.length > VOICE_MAX_B64 || !/^[A-Za-z0-9+/=]+$/.test(voice) || !mime || !MIMES.has(mime))) {
    return Response.json({ error: "Voice note must be a short audio/webm, mp4 or ogg recording" }, { status: 400 });
  }

  const q: Question = { id: createHash("sha256").update(`${Date.now()}:${ip}:${question}`).digest("hex").slice(0, 12), name, question, voice, mime, at: new Date().toISOString() };
  await db.multi().lpush(LIST, q).ltrim(LIST, 0, MAX_KEPT - 1).exec();
  return Response.json({ ok: true, id: q.id });
}

export async function GET(req: Request) {
  const auth = await checkPassword(req);
  if (auth !== "ok") return authError(auth);
  const db = redis()!;
  const items = await db.lrange<Question>(LIST, 0, MAX_KEPT - 1);
  return Response.json({ questions: items }, { headers: { "Cache-Control": "no-store, private" } });
}
