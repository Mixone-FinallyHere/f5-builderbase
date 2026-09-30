// Server-only helpers for the slide deck: Redis storage and edit-password checks.
// Budget note: Upstash free tier is 500k commands/month. Viewing costs 1 command,
// saving costs ~5, a password check 1 (+2 on failure). Nothing polls.
import { createHash, timingSafeEqual } from "node:crypto";
import { Redis } from "@upstash/redis";
import { SEED_DECK, type Deck } from "./slides";

const DECK_KEY = "slides:deck";
const HISTORY_KEY = "slides:history"; // previous versions, newest first
const HISTORY_LENGTH = 30;
const MAX_FAILURES = 10;
const LOCKOUT_SECONDS = 15 * 60;

let client: Redis | null | undefined;

export function redis(): Redis | null {
  if (client === undefined) {
    const configured = (process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL) &&
      (process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN);
    client = configured ? Redis.fromEnv() : null;
  }
  return client;
}

export function editingEnabled(): boolean {
  return redis() !== null && !!process.env.EDIT_PASSWORD;
}

export async function loadDeck(): Promise<{ deck: Deck; stored: boolean }> {
  const db = redis();
  const deck = db ? await db.get<Deck>(DECK_KEY) : null;
  return deck ? { deck, stored: true } : { deck: SEED_DECK, stored: false };
}

export async function saveDeck(deck: Deck, previous: Deck | null): Promise<void> {
  const db = redis();
  if (!db) throw new Error("Storage not configured");
  const tx = db.multi();
  if (previous) {
    tx.lpush(HISTORY_KEY, previous);
    tx.ltrim(HISTORY_KEY, 0, HISTORY_LENGTH - 1);
  }
  tx.set(DECK_KEY, deck);
  await tx.exec();
}

function clientIp(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
}

function digest(s: string): Buffer {
  return createHash("sha256").update(s).digest();
}

export type AuthResult = "ok" | "denied" | "locked" | "disabled";

// Checks the x-edit-password header. Constant-time comparison, and per-IP lockout
// after repeated failures so the password can't be brute-forced.
export async function checkPassword(req: Request): Promise<AuthResult> {
  const expected = process.env.EDIT_PASSWORD;
  const db = redis();
  if (!expected || !db) return "disabled";

  const failKey = `slides:fail:${clientIp(req)}`;
  const failures = (await db.get<number>(failKey)) ?? 0;
  if (failures >= MAX_FAILURES) return "locked";

  // The client percent-encodes the password so any character survives the header.
  let given = "";
  try {
    given = decodeURIComponent(req.headers.get("x-edit-password") ?? "");
  } catch {} // malformed encoding counts as a wrong password
  if (timingSafeEqual(digest(given), digest(expected))) return "ok";

  await db.multi().incr(failKey).expire(failKey, LOCKOUT_SECONDS).exec();
  return "denied";
}

export function authError(result: Exclude<AuthResult, "ok">): Response {
  const messages = {
    denied: ["Wrong password", 401],
    locked: ["Too many wrong attempts. Try again in 15 minutes.", 429],
    disabled: ["Editing is not configured on this deployment", 503],
  } as const;
  const [error, status] = messages[result];
  return Response.json({ error }, { status });
}
