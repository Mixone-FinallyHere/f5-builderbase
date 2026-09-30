"use client";

import { useCallback, useEffect, useState } from "react";
import type { PersonaMeta } from "@/lib/engine/personas";
import { CONSENT_LABELS, type ConsentLevel } from "@/lib/engine/types";
import { AskBox } from "./AskBox";
import { Card, StoryPlayer, type Me } from "./StoryPlayer";

const LEVELS: ConsentLevel[] = [0, 1, 2, 3];

export default function DemoApp() {
  const [personas, setPersonas] = useState<PersonaMeta[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [me, setMe] = useState<Me | null>(null);
  const [mode, setMode] = useState<"story" | "explore">("story");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exploreMe, setExploreMe] = useState<Me | null>(null);

  const loadMe = useCallback(async (): Promise<Me | null> => {
    const res = await fetch("/api/me", { cache: "no-store" });
    if (!res.ok) throw new Error("Couldn't load moments");
    const data = (await res.json()) as Me;
    return data.signedIn ? data : null;
  }, []);

  const setConsent = useCallback(
    async (level: ConsentLevel) => {
      const res = await fetch("/api/me", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ consent: level }) });
      if (!res.ok) throw new Error("Couldn't update the dial");
      return loadMe();
    },
    [loadMe],
  );

  useEffect(() => {
    fetch("/api/personas")
      .then((r) => r.json())
      .then((p) => setPersonas(p.personas))
      .catch(() => setError("Couldn't load the personas"));
  }, []);

  async function pick(id: string) {
    setLoading(true);
    setError(null);
    setMe(null);
    try {
      const res = await fetch("/api/session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ persona: id }) });
      if (!res.ok) throw new Error("Couldn't start the session");
      // Stories run at full consent so every moment is available; the dial step lowers it live.
      const full = await setConsent(3);
      setSelected(id);
      setMe(full);
      setExploreMe(full);
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
          Heads-<span className="text-secondary">Up</span> <span className="font-normal text-muted">by Kate / live demo</span>
        </a>
        <nav className="flex gap-1 text-sm">
          <a href="/scale" className="rounded-full px-3 py-1.5 text-muted hover:text-text">Scale view</a>
          <a href="/slides" className="rounded-full px-3 py-1.5 text-muted hover:text-text">Slides</a>
        </nav>
      </header>

      <section className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-secondary">Pick a customer</p>
          <p className="mt-1 text-sm text-muted">Each story: something happens in real life, the signal reaches the bank, and the phone lights up before it becomes a problem.</p>
        </div>
        {me && (
          <div className="flex rounded-lg border border-border bg-surface p-0.5 text-sm">
            <button onClick={() => setMode("story")} className={`rounded-md px-3 py-1 ${mode === "story" ? "bg-primary text-white" : "text-muted"}`}>Story</button>
            <button onClick={() => setMode("explore")} className={`rounded-md px-3 py-1 ${mode === "explore" ? "bg-primary text-white" : "text-muted"}`}>Explore</button>
          </div>
        )}
      </section>
      <div className="mt-3 grid gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {personas.map((p) => (
          <button key={p.id} onClick={() => pick(p.id)} disabled={loading} className={`rounded-card border p-3 text-left transition disabled:opacity-60 ${selected === p.id ? "border-primary bg-surface-2" : "border-border bg-surface hover:bg-surface-2"}`}>
            <p className="font-display font-semibold">
              {p.name} <span className="text-muted">· {p.age}</span>
            </p>
            <p className="mt-0.5 text-xs text-muted">{p.tagline}</p>
          </button>
        ))}
      </div>

      {error && <p className="mt-4 text-sm text-danger">{error}</p>}
      {loading && <p className="mt-6 text-sm text-muted">Running the watchers for this customer…</p>}

      <section className="mt-8">
        {me && meta && mode === "story" && <StoryPlayer key={me.customer.id} persona={me.customer.id} me={me} onDial={setConsent} />}
        {me && meta && mode === "explore" && exploreMe && (
          <Explore me={exploreMe} onDial={async (l) => { const v = await setConsent(l); if (v) setExploreMe(v); }} />
        )}
        {!me && !loading && (
          <div className="rounded-card border border-dashed border-border p-6 text-sm text-muted">
            Five customers, ten moments. Choose one to play their story; use <span className="text-text">Next →</span> to present at your own pace.
          </div>
        )}
      </section>

      <section className="mt-16">
        <AskBox />
      </section>
    </main>
  );
}

function Explore({ me, onDial }: { me: Me; onDial: (l: ConsentLevel) => Promise<void> }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_400px]">
      <div className="space-y-4">
        <div className="rounded-card border border-border bg-surface p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-secondary">What may Kate notice?</p>
          <div className="mt-3 space-y-2">
            {LEVELS.map((l) => (
              <label key={l} className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 text-sm ${me.consent === l ? "border-primary bg-surface-2" : "border-border"}`}>
                <input type="radio" name="consent" checked={me.consent === l} onChange={() => onDial(l)} className="mt-1" />
                <span>
                  <span className="block font-medium">{l}. {CONSENT_LABELS[l]}</span>
                </span>
              </label>
            ))}
          </div>
          <div className="mt-4 text-sm text-muted">
            {me.hiddenByConsent.length ? (
              <>
                <p>Held back at this level:</p>
                <ul className="mt-1 list-disc pl-5">
                  {me.hiddenByConsent.map((h) => (
                    <li key={h.id}>{h.title} <span className="text-muted/70">(needs level {h.requiredConsent})</span></li>
                  ))}
                </ul>
              </>
            ) : (
              <p>Everything the engine found is shown.</p>
            )}
            {me.overflow > 0 && <p className="mt-2">{me.overflow} more, ranked below the cap of 4.</p>}
          </div>
        </div>
        <div className="rounded-card border border-border bg-surface p-5 text-sm text-muted">
          <p className="text-xs uppercase tracking-[0.2em] text-secondary">Behind the screen</p>
          <p className="mt-2">8 watchers ran on data the bank already holds. {me.moments.length} shown, harm first, cap 4.</p>
        </div>
      </div>
      <div className="flex justify-center">
        <div className="phone-shell phone-zoomed">
          <div className="flex items-center justify-between px-5 pt-3 text-[11px] text-slate-500">
            <span>9:41</span>
            <span className="rounded-full bg-slate-100 px-2 py-0.5">KBC Mobile · concept</span>
            <span>●●●</span>
          </div>
          <div className="flex h-[calc(100%-1.6rem)] flex-col">
            <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-600 font-display font-bold text-white">K</div>
              <div>
                <p className="text-sm font-semibold text-slate-900">Kate</p>
                <p className="text-xs text-slate-500">heads-up · {me.consentLabel}</p>
              </div>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 p-3">
              <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-white px-3 py-2 text-sm text-slate-800 shadow-sm">
                Hi {me.customer.name}. {me.moments.length === 0 ? "Nothing needs your attention right now." : `${me.moments.length} thing${me.moments.length > 1 ? "s" : ""} worth a look before ${me.moments.length > 1 ? "they become problems" : "it becomes a problem"}.`}
              </div>
              {me.moments.map((m) => (
                <Card key={m.id} m={m} live={false} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
