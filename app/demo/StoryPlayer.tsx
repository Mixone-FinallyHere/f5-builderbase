"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { STEP_MS, STORIES, type Step } from "@/lib/stories";
import { CONSENT_LABELS, GROUP_NAMES, type ConsentLevel, type Group } from "@/lib/engine/types";
import { Comic } from "./Comic";
import { fmtLead, KatePhone, type Me } from "./KatePhone";

export type { Me } from "./KatePhone";

// Plays a customer's scripted story. The cards are real engine output (me.moments at full consent);
// a story step only says which one to reveal next. Once the phone is open, it is fully interactive.
export function StoryPlayer({ persona, me, onLevel, onGroups }: { persona: string; me: Me; onLevel: (level: ConsentLevel) => Promise<Me | null>; onGroups: (groups: Group[]) => Promise<Me | null> }) {
  const story = STORIES[persona];
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [revealed, setRevealed] = useState<string[]>([]);
  const [chosen, setChosen] = useState<Record<string, number>>({});
  const [view, setView] = useState<Me>(me); // the phone's current consent state
  const [dialNote, setDialNote] = useState<string | undefined>();
  const [typing, setTyping] = useState(false);
  const timer = useRef<number | null>(null);
  const step = story.steps[i];
  const last = i >= story.steps.length - 1;

  const momentByKind = useMemo(() => new Map(me.moments.map((m) => [m.kind, m])), [me]);
  const cards = revealed.map((k) => momentByKind.get(k)).filter((m): m is NonNullable<typeof m> => !!m);

  const applyLevel = useCallback(
    async (level: ConsentLevel) => {
      const v = await onLevel(level);
      if (v) setView(v);
      return v;
    },
    [onLevel],
  );
  const applyGroups = useCallback(
    async (groups: Group[]) => {
      const v = await onGroups(groups);
      if (v) setView(v);
      return v;
    },
    [onGroups],
  );

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
      applyLevel(step.level).then((v) => {
        if (!cancelled && v) setDialNote(`I'll stop noticing ${v.hiddenByConsent.length} things. Turn it back up any time.`);
      });
      return () => {
        cancelled = true;
      };
    }
  }, [i, step, applyLevel]);

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
    setDialNote(undefined);
    setPlaying(true);
    applyLevel(3);
  }, [applyLevel]);

  const phase = phaseOf(story.steps, i);

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
                The cards on the phone are produced by the watchers for this customer's data, right now. Every card's <span className="text-text">Why?</span> lists the data points used. The phone is live: tap an option, ask Kate why, or talk to her.
              </p>
              {step.type === "moment" && momentByKind.get(step.kind) && (
                <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
                  <dt>Lead time</dt>
                  <dd className="text-text">{fmtLead(momentByKind.get(step.kind)!.horizonDays, momentByKind.get(step.kind)!.realtime)}</dd>
                  <dt>Data groups</dt>
                  <dd className="text-text">{[...new Set(momentByKind.get(step.kind)!.evidence.map((e) => e.group))].map((g) => GROUP_NAMES[g]).join(", ")}</dd>
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
              {dialNote ? (
                <>
                  <p className="mt-2 text-sm text-muted">Kate keeps: {view.moments.map((m) => m.title).join("; ") || "nothing"}.</p>
                  <p className="mt-2 text-sm text-muted">Kate will no longer notice:</p>
                  <ul className="mt-1 list-disc pl-5 text-sm">
                    {view.hiddenByConsent.map((h) => (
                      <li key={h.id}>{h.title} <span className="text-muted">(needs {h.missingGroups.map((g) => GROUP_NAMES[g]).join(", ")})</span></li>
                    ))}
                  </ul>
                  <p className="mt-3 text-xs text-muted">Fraud and identity checks still run: a legal duty, not a preference. Consent is visible, reversible and per data group, on the Dial tab.</p>
                </>
              ) : (
                <p className="mt-2 text-sm text-muted">…</p>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-center">
          <div className={`phone-shell ${phase === "phone" ? "phone-zoomed" : ""}`}>
            <div className="flex items-center justify-between px-5 pt-3 text-[11px] text-slate-500">
              <span>9:41</span>
              <span className="rounded-full bg-slate-100 px-2 py-0.5">KBC Mobile · concept</span>
              <span>●●●</span>
            </div>
            {phase === "lock" ? (
              <LockScreen notify={step.type === "notify" ? step : undefined} name={me.customer.name} />
            ) : (
              <KatePhone
                me={view}
                cards={cards}
                greeting={`Hi ${me.customer.name}. Before this becomes a problem:`}
                liveKind={step.type === "moment" ? step.kind : undefined}
                typing={typing}
                chosen={chosen}
                onChoose={(kind, option) => setChosen((c) => ({ ...c, [kind]: option }))}
                onLevel={applyLevel}
                onGroups={applyGroups}
                note={step.type === "dial" ? dialNote : undefined}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function phaseOf(steps: Step[], i: number): "lock" | "phone" {
  for (let k = 0; k <= i; k++) if (steps[k].type === "zoom") return "phone";
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

function Btn({ children, onClick, disabled, primary }: { children: React.ReactNode; onClick: () => void; disabled?: boolean; primary?: boolean }) {
  return (
    <button onClick={onClick} disabled={disabled} className={`rounded-lg px-3 py-1.5 text-sm transition disabled:cursor-not-allowed disabled:opacity-40 ${primary ? "bg-primary text-white hover:brightness-110" : "border border-border bg-surface hover:bg-surface-2"}`}>
      {children}
    </button>
  );
}
