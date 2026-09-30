"use client";

import { useCallback, useEffect, useState } from "react";
import { CONSENT_LABELS, GROUP_NAMES, type ConsentLevel, type ExplainedMoment, type Group } from "@/lib/engine/types";
import type { PersonaMeta } from "@/lib/engine/personas";

type Me = {
  customer: { id: string; name: string; age: number; channel: string; digitalConfidence: string };
  consent: ConsentLevel;
  consentLabel: string;
  moments: ExplainedMoment[];
  hiddenByConsent: Array<{ id: string; kind: string; title: string; requiredConsent: ConsentLevel }>;
  overflow: number;
  explainer: "gemini-api" | "vertex" | "off";
};

const LEVELS: ConsentLevel[] = [0, 1, 2, 3];
const LEVEL_DATA: Record<ConsentLevel, string> = {
  0: "identity, security",
  1: "+ products, insurance, calendars",
  2: "+ payments, life stage",
  3: "+ how you use the app",
};

export default function DemoApp() {
  const [personas, setPersonas] = useState<PersonaMeta[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState(false);
  const [chosen, setChosen] = useState<Record<string, string>>({});
  const [open, setOpen] = useState<Record<string, boolean>>({});

  const loadMe = useCallback(async () => {
    const res = await fetch("/api/me", { cache: "no-store" });
    if (!res.ok) throw new Error("Couldn't load moments");
    const data = (await res.json()) as Me & { signedIn: boolean };
    return data.signedIn ? data : null;
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const p = await fetch("/api/personas").then((r) => r.json());
        setPersonas(p.personas);
        const existing = await loadMe();
        if (existing) {
          setMe(existing);
          setSelected(existing.customer.id);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong");
      }
    })();
  }, [loadMe]);

  async function pick(id: string) {
    setLoading(true);
    setError(null);
    setSettings(false);
    setChosen({});
    setOpen({});
    try {
      const res = await fetch("/api/session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ persona: id }) });
      if (!res.ok) throw new Error("Couldn't start the session");
      setSelected(id);
      setMe(await loadMe());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function setConsent(level: ConsentLevel) {
    setLoading(true);
    try {
      const res = await fetch("/api/me", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ consent: level }) });
      if (!res.ok) throw new Error("Couldn't update the dial");
      setMe(await loadMe());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const meta = personas.find((p) => p.id === selected);

  return (
    <main className="mx-auto max-w-6xl px-4 pb-24 md:px-6">
      <header className="flex flex-wrap items-center justify-between gap-3 py-6">
        <a href="/" className="font-display text-lg font-bold tracking-tight">
          Kate <span className="text-secondary">Ahead</span> <span className="font-normal text-muted">/ demo</span>
        </a>
        <nav className="flex gap-1 text-sm">
          <a href="/scale" className="rounded-full px-3 py-1.5 text-muted hover:text-text">Scale view</a>
          <a href="/slides" className="rounded-full px-3 py-1.5 text-muted hover:text-text">Slides</a>
        </nav>
      </header>

      <section>
        <p className="text-xs uppercase tracking-[0.2em] text-secondary">Pick a customer</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {personas.map((p) => (
            <button
              key={p.id}
              onClick={() => pick(p.id)}
              disabled={loading}
              className={`rounded-card border p-3 text-left transition disabled:opacity-60 ${selected === p.id ? "border-primary bg-surface-2" : "border-border bg-surface hover:bg-surface-2"}`}
            >
              <p className="font-display font-semibold">
                {p.name} <span className="text-muted">· {p.age}</span>
              </p>
              <p className="mt-0.5 text-xs text-muted">{p.tagline}</p>
            </button>
          ))}
        </div>
      </section>

      {error && <p className="mt-4 text-sm text-danger">{error}</p>}

      <section className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_420px]">
        <aside className="order-2 space-y-6 lg:order-1">
          {meta ? (
            <>
              <div className="rounded-card border border-border bg-surface p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-secondary">The situation</p>
                <p className="mt-2 text-sm leading-relaxed">{meta.story}</p>
                <p className="mt-4 text-xs uppercase tracking-[0.2em] text-secondary">What this shows</p>
                <ul className="mt-2 space-y-1 text-sm text-muted">
                  {meta.showcases.map((s) => (
                    <li key={s} className="flex gap-2">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-secondary" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
              {me && (
                <div className="rounded-card border border-border bg-surface p-5 text-sm">
                  <p className="text-xs uppercase tracking-[0.2em] text-secondary">Behind the screen</p>
                  <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-muted">
                    <dt>Watchers run</dt>
                    <dd className="text-text">8, on data the bank already holds</dd>
                    <dt>Moments found</dt>
                    <dd className="text-text">{me.moments.length + me.hiddenByConsent.length + me.overflow}</dd>
                    <dt>Shown</dt>
                    <dd className="text-text">{me.moments.length} (cap 4, harm first)</dd>
                    <dt>Held back by the dial</dt>
                    <dd className="text-text">{me.hiddenByConsent.length}</dd>
                    <dt>Wording by</dt>
                    <dd className="text-text">{me.explainer === "off" ? "templates (Gemini not connected)" : `Gemini via ${me.explainer === "vertex" ? "Vertex AI" : "Gemini API"}, facts-checked`}</dd>
                    <dt>Preferred channel</dt>
                    <dd className="text-text">{me.customer.channel}{me.customer.channel !== "app" && ", so the same moment goes out as a call script and to the adviser"}</dd>
                  </dl>
                </div>
              )}
              <div className="rounded-card border border-border bg-surface p-5 text-sm">
                <p className="text-xs uppercase tracking-[0.2em] text-secondary">Data groups</p>
                <ul className="mt-2 grid grid-cols-2 gap-1 text-muted">
                  {(Object.keys(GROUP_NAMES) as Group[]).map((g) => (
                    <li key={g} className="flex items-center gap-2">
                      <GroupChip g={g} />
                      {GROUP_NAMES[g]}
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-xs text-muted">Every card says which groups it used. The dial in the phone's settings decides which groups Kate may use.</p>
              </div>
            </>
          ) : (
            <div className="rounded-card border border-dashed border-border p-5 text-sm text-muted">
              Choose one of the five customers above. Each one shows two or three moments where Kate acts before something goes wrong, on data the bank already has.
            </div>
          )}
        </aside>

        <div className="order-1 flex justify-center lg:order-2">
          <Phone loading={loading}>
            {!me ? (
              <div className="flex h-full items-center justify-center p-8 text-center text-sm text-slate-500">Pick a customer to open their Kate.</div>
            ) : settings ? (
              <div className="p-4 text-slate-900">
                <button onClick={() => setSettings(false)} className="text-sm text-sky-700">← Back</button>
                <h2 className="mt-3 text-lg font-semibold">What may Kate notice?</h2>
                <p className="mt-1 text-sm text-slate-600">You decide which of your data Kate may use to warn you. Nothing here changes what the bank must do by law.</p>
                <div className="mt-4 space-y-2">
                  {LEVELS.map((l) => (
                    <label key={l} className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 ${me.consent === l ? "border-sky-600 bg-sky-50" : "border-slate-200"}`}>
                      <input type="radio" name="consent" checked={me.consent === l} onChange={() => setConsent(l)} className="mt-1" />
                      <span>
                        <span className="block text-sm font-medium">{l}. {CONSENT_LABELS[l]}</span>
                        <span className="block text-xs text-slate-500">{LEVEL_DATA[l]}</span>
                      </span>
                    </label>
                  ))}
                </div>
                <div className="mt-5 rounded-xl bg-slate-100 p-3 text-sm">
                  <p className="font-medium">With this setting, Kate won&apos;t notice:</p>
                  {me.hiddenByConsent.length ? (
                    <ul className="mt-1 list-disc pl-5 text-slate-600">
                      {me.hiddenByConsent.map((h) => (
                        <li key={h.id}>
                          {h.title} <span className="text-slate-400">(needs level {h.requiredConsent})</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-1 text-slate-600">Nothing. Everything Kate found is shown.</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex h-full flex-col">
                <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-600 font-display font-bold text-white">K</div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-900">Kate</p>
                    <p className="text-xs text-slate-500">ahead of you · {me.consentLabel.toLowerCase()}</p>
                  </div>
                  <button onClick={() => setSettings(true)} aria-label="Settings" className="rounded-full p-2 text-slate-500 hover:bg-slate-100">
                    ⚙
                  </button>
                </div>
                <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 p-3">
                  <Bubble>
                    Hi {me.customer.name}. {me.moments.length === 0 ? "Nothing needs your attention right now." : me.moments.length === 1 ? "One thing worth a look before it becomes a problem." : `${me.moments.length} things worth a look before they become problems.`}
                  </Bubble>
                  {me.moments.map((m) => (
                    <MomentCard key={m.id} m={m} chosen={chosen[m.id]} onChoose={(label) => setChosen((c) => ({ ...c, [m.id]: label }))} open={!!open[m.id]} onToggle={() => setOpen((o) => ({ ...o, [m.id]: !o[m.id] }))} />
                  ))}
                  {me.overflow > 0 && <p className="px-1 text-xs text-slate-500">{me.overflow} more, lower priority. Kate shows at most 4 at a time.</p>}
                </div>
                <div className="grid grid-cols-4 border-t border-slate-200 bg-white py-2 text-center text-[11px] text-slate-500">
                  <span>Accounts</span>
                  <span>Pay</span>
                  <span className="font-semibold text-sky-700">Kate</span>
                  <span>More</span>
                </div>
              </div>
            )}
          </Phone>
        </div>
      </section>
    </main>
  );
}

function Phone({ children, loading }: { children: React.ReactNode; loading: boolean }) {
  return (
    <div className="relative w-full max-w-[390px]">
      <div className="overflow-hidden rounded-[2.2rem] border-[6px] border-slate-800 bg-white shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)]" style={{ height: 780 }}>
        <div className="flex items-center justify-between bg-white px-5 pt-3 text-[11px] text-slate-500">
          <span>9:41</span>
          <span className="rounded-full bg-slate-100 px-2 py-0.5">KBC Mobile · concept</span>
          <span>●●●</span>
        </div>
        <div className="h-[calc(100%-1.6rem)]">{children}</div>
      </div>
      {loading && <div className="absolute inset-0 flex items-center justify-center rounded-[2.2rem] bg-black/30 text-sm text-white">Kate is thinking…</div>}
    </div>
  );
}

function Bubble({ children }: { children: React.ReactNode }) {
  return <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-white px-3 py-2 text-sm text-slate-800 shadow-sm">{children}</div>;
}

const STRIPE = { 3: "bg-rose-500", 2: "bg-amber-500", 1: "bg-sky-500" } as const;

function MomentCard({ m, chosen, onChoose, open, onToggle }: { m: ExplainedMoment; chosen?: string; onChoose: (label: string) => void; open: boolean; onToggle: () => void }) {
  return (
    <article className="overflow-hidden rounded-2xl bg-white shadow-sm">
      <div className="flex">
        <div className={`w-1.5 shrink-0 ${STRIPE[m.severity]}`} />
        <div className="flex-1 p-3">
          <div className="flex flex-wrap gap-1 text-[10px] uppercase tracking-wider">
            {m.realtime && <Tag tone="rose">right now</Tag>}
            {!m.realtime && m.horizonDays > 0 && <Tag tone="slate">{m.horizonDays > 365 ? `${Math.round(m.horizonDays / 365)} yrs ahead` : `${m.horizonDays} days ahead`}</Tag>}
            {m.needsHuman && <Tag tone="violet">adviser confirms</Tag>}
            {m.channelHint !== "app" && <Tag tone="emerald">also by {m.channelHint}</Tag>}
            <Tag tone={m.explainedBy === "gemini" ? "sky" : "slate"}>{m.explainedBy === "gemini" ? "Gemini · facts checked" : "template"}</Tag>
          </div>
          <h3 className="mt-1.5 text-sm font-semibold text-slate-900">{m.title}</h3>
          <p className="mt-1 text-[13px] leading-relaxed text-slate-700">{m.message}</p>
          <button onClick={onToggle} className="mt-2 text-xs font-medium text-sky-700">
            {open ? "Hide" : "Why?"} · based on {m.evidence.length} data point{m.evidence.length > 1 ? "s" : ""}
          </button>
          {open && (
            <ul className="mt-2 space-y-1 rounded-lg bg-slate-50 p-2 text-xs text-slate-700">
              {m.evidence.map((e, i) => (
                <li key={i} className="flex gap-2">
                  <GroupChip g={e.group} />
                  <span>
                    <span className="font-medium">{e.field}:</span> {e.value}
                  </span>
                </li>
              ))}
              {(m.harmEUR || m.valueEUR) && (
                <li className="pt-1 text-slate-500">
                  {m.harmEUR ? `Prevents about €${Math.round(m.harmEUR).toLocaleString("en-GB")}. ` : ""}
                  {m.valueEUR ? `Worth about €${Math.round(m.valueEUR).toLocaleString("en-GB")}/yr.` : ""}
                </li>
              )}
            </ul>
          )}
          <div className="mt-2 flex flex-col gap-1.5">
            {chosen ? (
              <p className="rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-800">✓ {chosen}. Kate takes it from here and confirms when it&apos;s done.</p>
            ) : (
              m.options.map((o) => (
                <button key={o.label} onClick={() => onChoose(o.label)} className="rounded-lg border border-slate-200 px-3 py-1.5 text-left text-xs text-slate-800 hover:border-sky-500 hover:bg-sky-50">
                  {o.label}
                  {o.effect && <span className="text-slate-500"> · {o.effect}</span>}
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

const TONES = {
  rose: "bg-rose-100 text-rose-700",
  amber: "bg-amber-100 text-amber-800",
  sky: "bg-sky-100 text-sky-700",
  slate: "bg-slate-100 text-slate-600",
  violet: "bg-violet-100 text-violet-700",
  emerald: "bg-emerald-100 text-emerald-700",
} as const;

function Tag({ tone, children }: { tone: keyof typeof TONES; children: React.ReactNode }) {
  return <span className={`rounded px-1.5 py-0.5 ${TONES[tone]}`}>{children}</span>;
}

function GroupChip({ g }: { g: Group }) {
  return <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded bg-slate-200 text-[10px] font-bold text-slate-700" title={GROUP_NAMES[g]}>{g}</span>;
}
