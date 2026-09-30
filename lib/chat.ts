// Kate's interactive brain for the demo, hardened.
//
// The model (Claude Haiku 4.5, the lowest tier) is NOT allowed to write what Kate says. It is forced to call
// one tool, `respond`, which classifies the customer's message into a fixed intent and fills slots
// (which moment, which option, which dial level). The engine validates every slot against real data and
// renders the reply from templates. The only model-written text is a factual answer to a follow-up question,
// and that text is rejected (template used instead) if it contains a number not in the fact sheet, claims an
// action, is too long, or contains a link. Without an API key, a keyword classifier does the same job.

import Anthropic from "@anthropic-ai/sdk";
import { buildProfile } from "./engine/profile";
import { CONSENT_LABELS, type ConsentLevel, type Customer, type Group, type Moment } from "./engine/types";

export type ChatAction =
  | { type: "act"; kind: string; option: number; label: string }
  | { type: "consent"; level: ConsentLevel }
  | { type: "adviser"; topic: string };

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

export interface ChatResult {
  reply: string;
  actions: ChatAction[];
  intent: Intent;
  mode: "claude" | "scripted";
}

type Hidden = { kind: string; title: string; requiredConsent: ConsentLevel; missingGroups?: Group[] };

const INTENTS = ["act", "explain", "answer", "consent", "adviser", "profile", "media_received", "acknowledge", "unclear"] as const;
type Intent = (typeof INTENTS)[number];

interface Decision {
  intent: Intent;
  kind?: string;
  option?: number;
  level?: number;
  topic?: string;
  answer?: string;
}

const MODEL = process.env.CHAT_MODEL || "claude-haiku-4-5";
export const chatEnabled = () => !!(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN);

const SYSTEM = `You are the intent classifier for Kate, KBC's digital assistant, in "Heads-Up" mode. You never write Kate's reply. You read the customer's message, the conversation so far, and the customer's open moments, and you call the tool "respond" exactly once with the intent and the slots. Kate's reply is rendered by the bank's system from your slots.

Intents:
- act: the customer chooses an option on an open moment ("cancel it", "move it from savings", "do that", "yes", "ok", "go ahead" after a moment was proposed). kind = the moment's kind, option = the 0-based index of the option that matches best. A bare "ok/yes/do it" refers to the moment most recently discussed; if only one moment is open, that one; if the customer approves a proposal, pick option 0 unless another option clearly matches.
- explain: the customer asks why, how you know, what it's based on, or for the reasoning behind a moment. kind = that moment.
- answer: a factual follow-up question about a moment or the customer's own data that the facts can answer (e.g. "how much would the premium be", "when does my cover end", "what's the difference between the two options"). Put the answer in "answer": at most 50 words, plain text, using ONLY numbers, dates, names and rules that appear in the facts. If the facts don't contain the answer, say so in one sentence and point to the adviser. Never state that something has been done, booked, sent or changed.
- consent: the customer wants to change what Kate may notice (dial, privacy, "stop noticing my payments", "only the essentials"). level = 0..3.
- adviser: the customer wants a call, a branch visit, or a human. topic = what about.
- profile: the customer asks what Kate knows about them.
- media_received: the customer says they sent, uploaded or recorded a photo, video or document.
- acknowledge: thanks, bye, or a plain acknowledgement with nothing to do.
- unclear: anything else, including requests for things that are not options or tools.

Rules: never invent a moment kind or an option index that isn't listed. When in doubt between act and unclear, choose unclear. Call the tool exactly once.`;

const RESPOND: Anthropic.Tool = {
  name: "respond",
  description: "Classify the customer's message and fill the slots. Called exactly once per message.",
  strict: true,
  input_schema: {
    type: "object",
    properties: {
      intent: { type: "string", enum: [...INTENTS] },
      kind: { type: "string", description: "Moment kind, for act/explain/answer" },
      option: { type: "integer", description: "0-based option index, for act" },
      level: { type: "integer", description: "Dial level 0-3, for consent" },
      topic: { type: "string", description: "Topic, for adviser" },
      answer: { type: "string", description: "The factual answer, for answer intent only, max 50 words" },
    },
    required: ["intent"],
    additionalProperties: false,
  },
};

// ---------- Templates: every reply the customer sees comes from here ----------

const eur = (n: number) => "€" + Math.round(n).toLocaleString("en-GB");

function confirmation(m: Moment, i: number): string {
  const label = m.options[i].label;
  const l = label.toLowerCase();
  const human = m.needsHuman ? " Your adviser checks it before it's final; you'll get that confirmation by email, and nothing changes until then." : "";
  if (/cancel/.test(l)) return "Cancelled. The payment won't go out, and nothing has left your account. You'll get a confirmation by email in a minute.";
  if (/hold/.test(l)) return "Holding it for 4 hours. I'll call you on your usual number to go through it together. If we don't speak, it stays on hold.";
  if (/i'm sure|send it/.test(l)) return "Understood. Because of the warning signs, an adviser will call you within 15 minutes to confirm by phone before it goes out. Nothing is sent until then.";
  if (/adviser|book|call me|talk to|walk through/.test(l)) return `Done. Your adviser will call you tomorrow at 10:30 about "${m.title}". You'll get an email confirmation in a minute and a reminder an hour before.`;
  if (/upload|photo|video/.test(l)) return "Received. I'm processing it now; you'll get an email confirmation within the hour, and I'll confirm here too. Nothing else is needed from you.";
  if (/remind/.test(l)) return "No problem. I'll leave it as it is and remind you in two weeks.";
  if (/not now|keep|decide later|it's insured elsewhere|i just wanted/.test(l)) return "No problem. I'll leave it as it is and won't bring it up again unless something changes.";
  if (/pre-register|continuation/.test(l)) return "Done. I've pre-registered the continuation with our insurance team, so no medical questionnaire will be needed." + human;
  if (/compare|show me|see what/.test(l)) return `On its way: I'm preparing the comparison for "${m.title}" and you'll have it here and by email within the hour.` + human;
  if (/move|transfer|switch|renew|split|update|set the insured|plan|add an energy loan|take the bundle|shift/.test(l)) return `Done: "${label}". You'll get an email confirmation shortly, and I'll let you know here when it's through.` + human;
  return `Done: "${label}". You'll get an email confirmation shortly.` + human;
}

function explain(m: Moment): string {
  const facts = m.evidence.map((e) => `${e.field.toLowerCase()}: ${e.value}`).join("; ");
  const money = m.harmEUR ? ` Acting early prevents about ${eur(m.harmEUR)}.` : m.valueEUR ? ` It's worth about ${eur(m.valueEUR)} a year.` : "";
  return `${m.title}. I'm going on ${facts}.${money} ${m.needsHuman ? "An adviser confirms before anything final happens." : "Nothing changes unless you say so."}`;
}

const unclearReply = (visible: Moment[]) =>
  visible.length
    ? `I can help with ${visible.length === 1 ? "one thing" : `${visible.length} things`} right now: ${visible.map((m) => m.title).join("; ")}. Ask me why, tell me which option you want, or ask what I know about you.`
    : "Nothing needs your attention right now. You can ask what I know about you, or change the dial.";

// ---------- Validation of the one piece of model-written text ----------

const numbersIn = (s: string) => new Set((s.replace(/(\d)[ ,.](?=\d{3}\b)/g, "$1").match(/\d+(?:[.,]\d+)?/g) ?? []).map((n) => n.replace(",", ".")));
const ACTION_CLAIM = /\b(i(?:'ve| have) (?:booked|cancelled|canceled|moved|sent|scheduled|updated|switched|changed|set|done|arranged|transferred)|is (?:now )?(?:booked|cancelled|scheduled|done)|has been (?:booked|cancelled|scheduled|updated|sent))\b/i;

function safeAnswer(answer: string | undefined, factsText: string): string | null {
  if (!answer) return null;
  const a = answer.trim();
  if (a.split(/\s+/).length > 60 || /https?:\/\/|www\./i.test(a) || ACTION_CLAIM.test(a)) return null;
  const allowed = numbersIn(factsText);
  for (const n of numbersIn(a)) if (!allowed.has(n) && Number(n) > 31) return null;
  return a;
}

// ---------- Render a decision into a reply; shared by the model path and the scripted path ----------

function render(d: Decision, customer: Customer, consent: ConsentLevel, visible: Moment[], hidden: Hidden[], factsText: string): ChatResult & { mode: "claude" } {
  const actions: ChatAction[] = [];
  const find = (kind?: string) => visible.find((m) => m.kind === kind);
  switch (d.intent) {
    case "act": {
      const m = find(d.kind) ?? (visible.length === 1 ? visible[0] : undefined);
      const i = Number.isInteger(d.option) ? (d.option as number) : 0;
      if (!m || i < 0 || i >= m.options.length) return { reply: unclearReply(visible), actions, intent: "unclear", mode: "claude" };
      actions.push({ type: "act", kind: m.kind, option: i, label: m.options[i].label });
      return { reply: confirmation(m, i), actions, intent: "act", mode: "claude" };
    }
    case "explain": {
      const m = find(d.kind) ?? visible[0];
      return { reply: m ? explain(m) : unclearReply(visible), actions, intent: m ? "explain" : "unclear", mode: "claude" };
    }
    case "answer": {
      const a = safeAnswer(d.answer, factsText);
      const m = find(d.kind);
      return { reply: a ?? (m ? explain(m) : unclearReply(visible)), actions, intent: a ? "answer" : "explain", mode: "claude" };
    }
    case "consent": {
      const level = [0, 1, 2, 3].includes(d.level as number) ? (d.level as ConsentLevel) : consent;
      if (level === consent) return { reply: `Your dial is on "${CONSENT_LABELS[consent]}". Held back right now: ${hidden.map((h) => h.title).join("; ") || "nothing"}. You can change it on the Dial tab, or tell me a level from 0 to 3.`, actions, intent: "consent", mode: "claude" };
      actions.push({ type: "consent", level });
      return { reply: `Done. Your dial is now on "${CONSENT_LABELS[level]}". ${level < consent ? "I'll stop noticing the things that need more than that; turn it back up any time on the Dial tab." : "I can now catch a bit more for you."}`, actions, intent: "consent", mode: "claude" };
    }
    case "adviser": {
      const topic = (d.topic ?? visible[0]?.title ?? "your account").slice(0, 120);
      actions.push({ type: "adviser", topic });
      return { reply: `Done. Your adviser will call you tomorrow at 10:30 about ${topic}. You'll get an email confirmation in a minute and a reminder an hour before.`, actions, intent: "adviser", mode: "claude" };
    }
    case "profile": {
      const p = buildProfile(customer, consent);
      return { reply: `Here's what I'm working from: ${p.headline.toLowerCase()}. ${p.unlockedGroups} of 8 data groups are unlocked by your dial. Open the Profile tab to see every fact and where it comes from; nothing there is new, it's what the bank already holds to run your accounts.`, actions, intent: "profile", mode: "claude" };
    }
    case "media_received":
      return { reply: "I received your recording. I was not able to verify your identity via face recognition, so I have forwarded it to a real human for review. Apologies for the wait; you'll hear back by email.", actions, intent: "media_received", mode: "claude" };
    case "acknowledge":
      return { reply: "You're welcome. I'll be here if anything changes.", actions, intent: "acknowledge", mode: "claude" };
    default:
      return { reply: unclearReply(visible), actions, intent: "unclear", mode: "claude" };
  }
}

function factSheet(customer: Customer, consent: ConsentLevel, visible: Moment[], hidden: Hidden[]): string {
  const p = buildProfile(customer, consent);
  return [
    `Customer: ${customer.name}, ${customer.age}, prefers ${customer.channel}. Dial: ${consent} (${CONSENT_LABELS[consent]}).`,
    `Profile (unlocked groups only):`,
    ...p.groups.filter((g) => g.unlocked).flatMap((g) => g.facts.map((f) => `- [${g.group}] ${f}`)),
    `Open moments:`,
    ...visible.map((m) => [`* kind=${m.kind} | ${m.title}`, `  facts: ${m.summary}`, ...m.evidence.map((e) => `  - ${e.field}: ${e.value}`), `  options: ${m.options.map((o, i) => `[${i}] ${o.label}${o.effect ? ` (${o.effect})` : ""}`).join(" | ")}`].join("\n")),
    `Held back by the dial (titles only): ${hidden.map((h) => `${h.kind} "${h.title}" needs level ${h.requiredConsent}`).join("; ") || "none"}`,
  ].join("\n");
}

export async function chat(customer: Customer, consent: ConsentLevel, visible: Moment[], hidden: Hidden[], history: ChatTurn[], text: string): Promise<ChatResult> {
  const facts = factSheet(customer, consent, visible, hidden);
  if (!chatEnabled()) return { ...render(scripted(visible, consent, text, history), customer, consent, visible, hidden, facts), mode: "scripted" };

  const client = new Anthropic();
  const messages: Anthropic.MessageParam[] = [...history.map((t) => ({ role: t.role, content: t.content }) as Anthropic.MessageParam), { role: "user", content: text }];
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 400,
    system: [
      { type: "text", text: SYSTEM, cache_control: { type: "ephemeral" } },
      { type: "text", text: `FACTS (the only source of truth):\n${facts}` },
    ],
    tools: [RESPOND],
    tool_choice: { type: "tool", name: "respond" },
    messages,
  });
  if (response.stop_reason === "refusal") return { reply: unclearReply(visible), actions: [], intent: "unclear", mode: "claude" };
  const use = response.content.find((b): b is Anthropic.ToolUseBlock => b.type === "tool_use" && b.name === "respond");
  const d = (use?.input ?? { intent: "unclear" }) as Decision;
  if (!INTENTS.includes(d.intent)) d.intent = "unclear";
  return render(d, customer, consent, visible, hidden, facts);
}

// ---------- Scripted classifier (no API key): keyword matching over the same data ----------

const STOP = new Set(["the", "and", "you", "your", "for", "with", "that", "this", "what", "why", "how", "about", "from", "are", "was", "can", "not", "its", "have", "has", "would", "could", "should", "think", "does", "did", "please", "kate"]);
const words = (s: string) => s.toLowerCase().replace(/[^a-z0-9€ ]/g, " ").split(/\s+/).filter((w) => w.length > 2 && !STOP.has(w));
const overlap = (a: string, b: string) => {
  const B = new Set(words(b));
  return words(a).filter((w) => B.has(w)).length;
};

function scripted(visible: Moment[], consent: ConsentLevel, text: string, history: ChatTurn[]): Decision {
  const t = text.toLowerCase().trim();
  const byOverlap = () => {
    const ranked = visible.map((m) => ({ m, s: overlap(text, m.title) * 3 + overlap(text, m.summary + " " + m.evidence.map((e) => e.value).join(" ")) })).sort((a, b) => b.s - a.s);
    return ranked[0]?.s > 0 ? ranked[0] : { m: lastDiscussed(), s: 0 };
  };
  const lastDiscussed = () => {
    for (let i = history.length - 1; i >= 0; i--) {
      const hit = visible.find((m) => history[i].content.includes(m.title));
      if (hit) return hit;
    }
    return visible[0];
  };
  if (/^(ok|okay|yes|yep|sure|do it|go ahead|please do|fine|alright)\b/.test(t)) {
    const m = lastDiscussed();
    return m ? { intent: "act", kind: m.kind, option: 0 } : { intent: "unclear" };
  }
  if (/\b(thanks|thank you|bye|great|perfect)\b/.test(t) && t.length < 40) return { intent: "acknowledge" };
  if (/\b(sent|uploaded|recorded)\b.*\b(photo|video|picture|document|recording)\b/.test(t)) return { intent: "media_received" };
  if (/\b(dial|privacy|consent|essentials|stop noticing|my products|money patterns)\b/.test(t)) {
    const level = /\b(0|zero|essentials|only)\b/.test(t) ? 0 : /\b(1|one|products)\b/.test(t) ? 1 : /\b(2|two|patterns|payments)\b/.test(t) ? 2 : /\b(3|three|app|everything|all)\b/.test(t) ? 3 : consent;
    return { intent: "consent", level };
  }
  if (/\b(why|how do you know|based on|evidence|explain|reason)\b/.test(t)) return { intent: "explain", kind: byOverlap()?.m.kind };
  if (/\b(adviser|advisor|call me|book|appointment|branch|human|someone)\b/.test(t)) return { intent: "adviser", topic: byOverlap()?.m.title };
  if (/\b(profile|know about me|what do you know|my data)\b/.test(t)) return { intent: "profile" };
  let best: { m: Moment; i: number; s: number } | null = null;
  visible.forEach((m) =>
    m.options.forEach((o, i) => {
      const s = overlap(text, o.label) * 2 + (overlap(text, m.title) > 0 ? 1 : 0);
      if (s > 1 && (!best || s > best.s)) best = { m, i, s };
    }),
  );
  if (best) {
    const b = best as { m: Moment; i: number; s: number };
    return { intent: "act", kind: b.m.kind, option: b.i };
  }
  return { intent: "unclear" };
}
