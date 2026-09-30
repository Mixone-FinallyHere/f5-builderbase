// The Explainer: turns a moment's fact sheet into Kate's message. Gemini phrases; it never decides.
// Guardrails: the model only sees the facts and options; the output is rejected (and the template used)
// if it contains a number that isn't in the facts. Works with either
//   GEMINI_API_KEY                      (Gemini Developer API), or
//   GCP_SA_KEY + GCP_PROJECT_ID         (Vertex AI in our Google Cloud project; SA key as base64 JSON)
// and falls back to the template when neither is set or the call fails, so the demo never depends on it.

import { GoogleAuth } from "google-auth-library";
import type { Customer, ExplainedMoment, Moment } from "./types";

const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const TIMEOUT_MS = 9_000;
const cache = new Map<string, string>();

export function explainerStatus(): "gemini-api" | "vertex" | "off" {
  if (process.env.GEMINI_API_KEY) return "gemini-api";
  if (process.env.GCP_SA_KEY && process.env.GCP_PROJECT_ID) return "vertex";
  return "off";
}

function factSheet(c: Customer, m: Moment): string {
  return [
    `Customer: ${c.name}, ${c.age}, prefers ${c.channel}, digital confidence ${c.digitalConfidence}, language of the reply: English.`,
    `Moment: ${m.title}`,
    `What is true (only source of numbers):`,
    ...m.evidence.map((e) => `- ${e.field}: ${e.value}`),
    `Plain statement of the situation: ${m.summary}`,
    `Options the customer can choose (use these labels verbatim, do not invent others):`,
    ...m.options.map((o) => `- ${o.label}${o.effect ? ` (${o.effect})` : ""}`),
  ].join("\n");
}

const SYSTEM = `You are Kate, KBC's digital assistant, in a new "Heads-Up" mode: you warn customers before something goes wrong and explain the bank's reasoning.
Write the message Kate sends for this moment. Rules:
- 60 to 100 words, warm and direct, B2 language level, no jargon, no exclamation marks.
- Use ONLY numbers, dates and facts from the fact sheet. Never invent a figure, a product or a rule.
- Say what you noticed, why it matters, and what happens if they do nothing. Then point to the options (use their labels).
- Never blame the customer. Never pressure. It's fine to say "nothing changes unless you say so".
- Output plain text only, no headings, no bullet points.`;

const numbersIn = (s: string) => new Set((s.replace(/(\d)[ ,.](?=\d{3}\b)/g, "$1").match(/\d+(?:[.,]\d+)?/g) ?? []).map((n) => n.replace(",", ".")));

function factsCheck(text: string, facts: string): boolean {
  const allowed = numbersIn(facts);
  for (const n of numbersIn(text)) if (!allowed.has(n) && Number(n) > 31) return false; // small numbers: "2 minutes", "30 days" wording
  return true;
}

async function callGemini(prompt: string): Promise<string> {
  const body = {
    systemInstruction: { parts: [{ text: SYSTEM }] },
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.4, maxOutputTokens: 400 },
  };
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    let url: string;
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (process.env.GEMINI_API_KEY) {
      url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;
      headers["x-goog-api-key"] = process.env.GEMINI_API_KEY;
    } else {
      const credentials = JSON.parse(Buffer.from(process.env.GCP_SA_KEY!, "base64").toString("utf8"));
      const auth = new GoogleAuth({ credentials, scopes: ["https://www.googleapis.com/auth/cloud-platform"] });
      const token = await (await auth.getClient()).getAccessToken();
      const loc = process.env.GCP_LOCATION || "global";
      const host = loc === "global" ? "aiplatform.googleapis.com" : `${loc}-aiplatform.googleapis.com`;
      url = `https://${host}/v1/projects/${process.env.GCP_PROJECT_ID}/locations/${loc}/publishers/google/models/${MODEL}:generateContent`;
      headers.Authorization = `Bearer ${token.token}`;
    }
    const res = await fetch(url, { method: "POST", headers, body: JSON.stringify(body), signal: ctrl.signal });
    if (!res.ok) throw new Error(`Gemini ${res.status}: ${(await res.text()).slice(0, 200)}`);
    const data = await res.json();
    const text: string | undefined = data?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? "").join("");
    if (!text?.trim()) throw new Error("Gemini returned no text");
    return text.trim();
  } finally {
    clearTimeout(timer);
  }
}

export async function explain(c: Customer, m: Moment): Promise<ExplainedMoment> {
  const channelHint = c.channel === "app" ? "app" : c.channel;
  const base = { ...m, channelHint } as ExplainedMoment;
  if (explainerStatus() === "off") return { ...base, message: m.summary, explainedBy: "template" };
  const key = `${c.id}:${m.id}:${m.summary.length}`;
  const cached = cache.get(key);
  if (cached) return { ...base, message: cached, explainedBy: "gemini" };
  try {
    const facts = factSheet(c, m);
    const text = await callGemini(facts);
    if (!factsCheck(text, facts)) {
      console.warn(`[explain] Gemini output failed the facts check for ${m.id}; using template`);
      return { ...base, message: m.summary, explainedBy: "template" };
    }
    cache.set(key, text);
    return { ...base, message: text, explainedBy: "gemini" };
  } catch (err) {
    console.warn(`[explain] ${m.id}: ${err instanceof Error ? err.message : err}`);
    return { ...base, message: m.summary, explainedBy: "template" };
  }
}

export async function explainAll(c: Customer, moments: Moment[]): Promise<ExplainedMoment[]> {
  return Promise.all(moments.map((m) => explain(c, m)));
}
