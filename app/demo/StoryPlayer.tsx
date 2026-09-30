"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { STEP_MS, STORIES, type Step } from "@/lib/stories";
import { CONSENT_LABELS, GROUP_NAMES, type ConsentLevel, type ExplainedMoment, type Group } from "@/lib/engine/types";
import { Comic } from "./Comic";

export type Me = {
  signedIn: boolean;
  customer: { id: string; name: string; age: number; channel: string; digitalConfidence: string };
  consent: ConsentLevel;
  consentLabel: string;
  moments: ExplainedMoment[];
  hiddenByConsent: Array<{ id: string; kind: string; title: string; requiredConsent: ConsentLevel }>;
  overflow: number;
  explainer: "gemini-api" | "vertex" | "off";
};

// Everything the engine found for this persona at full consent, so a story can reveal any moment.
export function StoryPlayer({ persona, me, onDial }: { persona: string; me: Me; onDial: (level: ConsentLevel) => Promise<Me | null> }) {
  const story = STORIES[persona];
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [revealed, setRevealed] = useState<string[]>([]);
  const [chosen, setChosen] = useState<Record<string, number>>({});
  const [dialView, setDialView] = useState<Me | null>(null);
  const [typing, setTyping] = useState(false);
  const timer = useRef<number | null>(null);
  const step = story.steps[i];
  const last = i >= story.steps.length - 1;

  const momentByKind = useMemo(() => new Map(me.moments.map((m) => [m.kind, m])), [me]);

  // Apply a step's side effects when it becomes current.
  useEffect(() => {
    if (step.type === "moment") {
      setTyping(true);
      const t = window.setTimeout(() => {
        setTyping(false);
        setRevealed((r) => (r.includes(step.kind) ? r : [...r, step.kind]));
      }, 1100);
      return () => window.clearTimeout(t);
    }
    if (step.type === "act") {
      const t = window.setTimeout(() => setChosen((c) => ({ ...c, [step.kind]: step.option })), 900);
      return () => window.clearTimeout(t);
    }
    if (step.type === "dial") {
      let cancelled = false;
      onDial(step.level).then((v) => !cancelled && setDialView(v));
      return () => {
        cancelled = true;
      };
    }
  }, [i, step, onDial]);

  // Autoplay.
  useEffect(() => {
    if (!playing || last) return;
    const m = step.type === "moment" ? momentByKind.get(step.kind) : undefined;
    const extra = m ? Math.min(m.message.length * 18, 9000) : 0;
    timer.current = window.setTimeout(() => setI((x) => x + 1), (step.ms ?? STEP_MS[step.type]) + extra);
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [i, playing, last, step, momentByKind]);

  const restart = useCallback(() => {
    setI(0);
    setRevealed([]);
    setChosen({});
    setDialView(null);
    setPlaying(true);
    onDial(3);
  }, [onDial]);

  const phase = phaseOf(story.steps, i);
  const zoomed = phase === "phone";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-display text-lg font-semibold">
          {story.title} <span className="text-sm font-normal text-muted">· step {i + 1} of {story.steps.length}</span>
        </p>
        <div className="flex items-center gap-1 text-sm">
          <Btn onClick={restart}>⟲ Restart</Btn>
          <Btn onClick={() => setI((x) => Math.max(0, x - 1))} disabled={i === 0}>← Back</Btn>
          <Btn onClick={() => setPlaying((p) => !p)}>{playing ? "⏸ Pause" : "▶ Play"}</Btn>
          <Btn onClick={() => { setPlaying(false); setI((x) => Math.min(story.steps.length - 1, x + 1)); }} disabled={last} primary>
            Next →
          </Btn>
        </div>
      </div>

      <ol className="flex flex-wrap gap-1">
        {story.steps.map((s, k) => (
          <li key={k}>
            <button onClick={() => { setPlaying(false); setI(k); }} title={s.type} className={`h-1.5 w-6 rounded-full transition ${k === i ? "bg-secondary" : k < i ? "bg-primary" : "bg-border"}`} />
          </li>
        ))}
      </ol>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_400px]">
        {/* Left: the world */}
        <div className="min-w-0 space-y-4">
          {(step.type === "scene" || step.type === "outcome") && <Comic scene={step.scene} caption={step.caption} />}

          {step.type === "signal" && (
            <div className="rounded-card border border-border bg-surface p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-secondary">The signal reaches the bank</p>
              <p className="mt-2 font-display text-lg">{step.event}</p>
              <p className="mt-4 text-xs uppercase tracking-[0.2em] text-secondary">Data groups touched (already in the bank)</p>
              <ul className="mt-2 flex flex-wrap gap-2">
                {step.groups.map((g, k) => (
                  <li key={g} className="signal-chip rounded-lg border border-border bg-surface-2 px-3 py-1.5 text-sm" style={{ animationDelay: `${k * 250}ms` }}>
                    <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded bg-primary/30 text-[11px] font-bold">{g}</span>
                    {GROUP_NAMES[g as Group]}
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-xs uppercase tracking-[0.2em] text-secondary">Watchers that wake up</p>
              <ul className="mt-2 flex flex-wrap gap-2">
                {step.watchers.map((w, k) => (
                  <li key={w} className="signal-chip rounded-full border border-secondary/50 px-3 py-1 text-sm text-secondary" style={{ animationDelay: `${1200 + k * 300}ms` }}>
                    ● {w}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {(step.type === "notify" || step.type === "zoom" || step.type === "moment" || step.type === "act") && (
            <div className="rounded-card border border-border bg-surface p-5 text-sm text-muted">
              <p className="text-xs uppercase tracking-[0.2em] text-secondary">Live from the engine</p>
              <p className="mt-2">
                The cards on the phone are produced by the watchers for this customer's data, right now. Every card's <span className="text-text">Why?</span> lists the data points used.
              </p>
              {step.type === "moment" && momentByKind.get(step.kind) && (
                <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
                  <dt>Lead time</dt>
                  <dd className="text-text">{fmtLead(momentByKind.get(step.kind)!.horizonDays, momentByKind.get(step.kind)!.realtime)}</dd>
                  <dt>Needs consent</dt>
                  <dd className="text-text">level {momentByKind.get(step.kind)!.requiredConsent}: {CONSENT_LABELS[momentByKind.get(step.kind)!.requiredConsent]}</dd>
                </dl>
              )}
            </div>
          )}

          {step.type === "aside" && (
            <div className="rounded-card border border-secondary/40 bg-surface p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-secondary">{step.icon === "phone" ? "☎ Same moment, other channel" : step.icon === "adviser" ? "👤 Human in the loop" : "§ The rule behind it"}</p>
              <p className="mt-2 font-display text-lg">{step.title}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted">{step.body}</p>
            </div>
          )}

          {step.type === "dial" && (
            <div className="rounded-card border border-border bg-surface p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-secondary">The customer turns the dial down</p>
              <p className="mt-2 font-display text-lg">“Only the essentials”: what changes?</p>
              {dialView ? (
                <>
                  <p className="mt-2 text-sm text-muted">Kate keeps: {dialView.moments.map((m) => m.title).join("; ") || "nothing"}.</p>
                  <p className="mt-2 text-sm text-muted">Kate will no longer notice:</p>
                  <ul className="mt-1 list-disc pl-5 text-sm">
                    {dialView.hiddenByConsent.map((h) => (
                      <li key={h.id}>{h.title} <span className="text-muted">(needs level {h.requiredConsent})</span></li>
                    ))}
                  </ul>
                  <p className="mt-3 text-xs text-muted">Fraud checks still run: a legal duty, not a preference. Consent is visible, reversible and per data group.</p>
                </>
              ) : (
                <p className="mt-2 text-sm text-muted">…</p>
              )}
            </div>
          )}
        </div>

        {/* Right: the phone */}
        <div className="flex justify-center">
          <div className={`phone-shell ${zoomed ? "phone-zoomed" : ""}`}>
            <div className="flex items-center justify-between px-5 pt-3 text-[11px] text-slate-500">
              <span>9:41</span>
              <span className="rounded-full bg-slate-100 px-2 py-0.5">KBC Mobile · concept</span>
              <span>●●●</span>
            </div>
            {phase === "lock" ? (
              <LockScreen notify={step.type === "notify" ? step : undefined} name={me.customer.name} />
            ) : (
              <div className="flex h-[calc(100%-1.6rem)] flex-col">
                <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-600 font-display font-bold text-white">K</div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-900">Kate</p>
                    <p className="text-xs text-slate-500">heads-up · {(dialView ?? me).consentLabel}</p>
                  </div>
                </div>
                <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 p-3">
                  <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-white px-3 py-2 text-sm text-slate-800 shadow-sm">Hi {me.customer.name}. Before this becomes a problem:</div>
                  {revealed.map((kind) => {
                    const m = momentByKind.get(kind);
                    return m ? <Card key={kind} m={m} chosen={chosen[kind]} live={step.type === "moment" && step.kind === kind} /> : null;
                  })}
                  {typing && (
                    <div className="inline-flex items-center gap-1 rounded-2xl bg-white px-3 py-2 text-xs text-slate-500 shadow-sm">
                      Kate is typing <span className="dots" />
                    </div>
                  )}
                  {step.type === "dial" && dialView && (
                    <div className="rounded-2xl bg-white p-3 text-xs text-slate-700 shadow-sm">
                      <p className="font-semibold">Dial set to “{dialView.consentLabel}”.</p>
                      <p className="mt-1">I'll stop noticing {dialView.hiddenByConsent.length} things. Turn it back up any time.</p>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-4 border-t border-slate-200 bg-white py-2 text-center text-[11px] text-slate-500">
                  <span>Accounts</span>
                  <span>Pay</span>
                  <span className="font-semibold text-sky-700">Kate</span>
                  <span>More</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function phaseOf(steps: Step[], i: number): "world" | "lock" | "phone" {
  // Before the notification: the phone is locked. After the zoom: the chat. Outcome: back to the world, phone stays open.
  let seenNotify = false;
  let seenZoom = false;
  for (let k = 0; k <= i; k++) {
    if (steps[k].type === "notify") seenNotify = true;
    if (steps[k].type === "zoom") seenZoom = true;
  }
  if (seenZoom) return "phone";
  if (seenNotify) return "lock";
  return "lock";
}

function LockScreen({ notify, name }: { notify?: Extract<Step, { type: "notify" }>; name: string }) {
  return (
    <div className="relative h-[calc(100%-1.6rem)] bg-gradient-to-b from-sky-100 to-slate-200">
      <div className="pt-32 text-center text-slate-700">
        <p className="text-5xl font-light">9:41</p>
        <p className="text-sm">Today</p>
      </div>
      {notify && (
        <div className="notify absolute left-3 right-3 top-3 rounded-2xl bg-white/95 p-3 shadow-lg backdrop-blur">
          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <span className="flex h-5 w-5 items-center justify-center rounded bg-sky-600 text-[10px] font-bold text-white">K</span>
            KBC Mobile · now
          </div>
          <p className="mt-1 text-sm font-semibold text-slate-900">{notify.title}</p>
          <p className="text-xs text-slate-700">{notify.body}</p>
        </div>
      )}
      <p className="absolute bottom-6 w-full text-center text-xs text-slate-500">{name}'s phone · swipe up to open</p>
    </div>
  );
}

function fmtLead(days: number, realtime?: boolean) {
  if (realtime) return "real time";
  if (days === 0) return "now";
  if (days > 365) return `${Math.round(days / 365)} years`;
  return `${days} days`;
}

const STRIPE = { 3: "bg-rose-500", 2: "bg-amber-500", 1: "bg-sky-500" } as const;

export function Card({ m, chosen, live }: { m: ExplainedMoment; chosen?: number; live: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <article className={`card-in overflow-hidden rounded-2xl bg-white shadow-sm ${live ? "ring-2 ring-sky-300" : ""}`}>
      <div className="flex">
        <div className={`w-1.5 shrink-0 ${STRIPE[m.severity]}`} />
        <div className="flex-1 p-3">
          <div className="flex flex-wrap gap-1 text-[10px] uppercase tracking-wider">
            {m.realtime ? <Tag tone="rose">right now</Tag> : m.horizonDays > 0 && <Tag tone="slate">{fmtLead(m.horizonDays)} ahead</Tag>}
            {m.needsHuman && <Tag tone="violet">adviser confirms</Tag>}
            {m.channelHint !== "app" && <Tag tone="emerald">also by {m.channelHint}</Tag>}
          </div>
          <h3 className="mt-1.5 text-sm font-semibold text-slate-900">{m.title}</h3>
          <p className="mt-1 text-[13px] leading-relaxed text-slate-700">{live ? <Typewriter text={m.message} /> : m.message}</p>
          <button onClick={() => setOpen((o) => !o)} className="mt-2 text-xs font-medium text-sky-700">
            {open ? "Hide" : "Why?"} · based on {m.evidence.length} data point{m.evidence.length > 1 ? "s" : ""}
          </button>
          {open && (
            <ul className="mt-2 space-y-1 rounded-lg bg-slate-50 p-2 text-xs text-slate-700">
              {m.evidence.map((e, k) => (
                <li key={k} className="flex gap-2">
                  <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded bg-slate-200 text-[10px] font-bold text-slate-700">{e.group}</span>
                  <span><span className="font-medium">{e.field}:</span> {e.value}</span>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-2 flex flex-col gap-1.5">
            {m.options.map((o, k) =>
              chosen === undefined ? (
                <div key={o.label} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-800">
                  {o.label}
                  {o.effect && <span className="text-slate-500"> · {o.effect}</span>}
                </div>
              ) : k === chosen ? (
                <div key={o.label} className="tap rounded-lg border border-emerald-500 bg-emerald-50 px-3 py-1.5 text-xs text-emerald-800">
                  ✓ {o.label}
                  {o.effect && <span className="text-emerald-700"> · {o.effect}</span>}
                </div>
              ) : null,
            )}
            {chosen !== undefined && <p className="text-[11px] text-slate-500">Kate takes it from here and confirms when it's done.</p>}
          </div>
        </div>
      </div>
    </article>
  );
}

function Typewriter({ text }: { text: string }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    setN(0);
    const id = window.setInterval(() => setN((x) => (x >= text.length ? x : x + 3)), 30);
    return () => window.clearInterval(id);
  }, [text]);
  return <>{text.slice(0, n)}</>;
}

const TONES = { rose: "bg-rose-100 text-rose-700", slate: "bg-slate-100 text-slate-600", violet: "bg-violet-100 text-violet-700", emerald: "bg-emerald-100 text-emerald-700" } as const;
function Tag({ tone, children }: { tone: keyof typeof TONES; children: React.ReactNode }) {
  return <span className={`rounded px-1.5 py-0.5 ${TONES[tone]}`}>{children}</span>;
}

function Btn({ children, onClick, disabled, primary }: { children: React.ReactNode; onClick: () => void; disabled?: boolean; primary?: boolean }) {
  return (
    <button onClick={onClick} disabled={disabled} className={`rounded-lg px-3 py-1.5 text-sm transition disabled:cursor-not-allowed disabled:opacity-40 ${primary ? "bg-primary text-white hover:brightness-110" : "border border-border bg-surface hover:bg-surface-2"}`}>
      {children}
    </button>
  );
}
