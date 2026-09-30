"use client";

import { useCallback, useEffect, useState } from "react";
import type { PersonaMeta } from "@/lib/engine/personas";
import type { ConsentLevel, Group } from "@/lib/engine/types";
import { AskBox } from "./AskBox";
import { KatePhone, type Me } from "./KatePhone";
import { StoryPlayer } from "./StoryPlayer";

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
  const setGroups = useCallback(
    async (groups: Group[]) => {
      const res = await fetch("/api/me", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ groups }) });
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
        {me && meta && mode === "story" && <StoryPlayer key={me.customer.id} persona={me.customer.id} me={me} onLevel={setConsent} onGroups={setGroups} />}
        {me && meta && mode === "explore" && exploreMe && (
          <Explore
            key={me.customer.id}
            me={exploreMe}
            onLevel={async (l) => { const v = await setConsent(l); if (v) setExploreMe(v); return v; }}
            onGroups={async (g) => { const v = await setGroups(g); if (v) setExploreMe(v); return v; }}
          />
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

function Explore({ me, onLevel, onGroups }: { me: Me; onLevel: (l: ConsentLevel) => Promise<unknown>; onGroups: (g: Group[]) => Promise<unknown> }) {
  const [chosen, setChosen] = useState<Record<string, number>>({});
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_400px]">
      <div className="space-y-4">
        <div className="rounded-card border border-border bg-surface p-5 text-sm text-muted">
          <p className="text-xs uppercase tracking-[0.2em] text-secondary">Free explore</p>
          <p className="mt-2">Everything the engine found for {me.customer.name}, live. Tap options, ask Kate why (type or talk), open the Profile tab to see what she knows, or the Dial tab to switch data groups on and off.</p>
          <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
            <dt>Watchers run</dt>
            <dd className="text-text">8, on data the bank already holds</dd>
            <dt>Shown</dt>
            <dd className="text-text">{me.moments.length} (cap 4, harm first)</dd>
            <dt>Held back by the dial</dt>
            <dd className="text-text">{me.hiddenByConsent.length}</dd>
            <dt>Data groups on</dt>
            <dd className="text-text">{me.groups.join(" ")}</dd>
          </dl>
        </div>
        <div className="rounded-card border border-border bg-surface p-5 text-sm text-muted">
          <p className="text-xs uppercase tracking-[0.2em] text-secondary">Try asking Kate</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>“Why do you think that?”</li>
            <li>“Cancel the payment” / “Move it from savings”</li>
            <li>“What do you know about me?”</li>
            <li>“Set the dial to 1” / “Stop noticing my payments”</li>
            <li>“Book my adviser”</li>
          </ul>
        </div>
      </div>
      <div className="flex justify-center">
        <div className="phone-shell phone-zoomed">
          <div className="flex items-center justify-between px-5 pt-3 text-[11px] text-slate-500">
            <span>9:41</span>
            <span className="rounded-full bg-slate-100 px-2 py-0.5">KBC Mobile · concept</span>
            <span>●●●</span>
          </div>
          <KatePhone
            me={me}
            cards={me.moments}
            greeting={`Hi ${me.customer.name}. ${me.moments.length === 0 ? "Nothing needs your attention right now." : `${me.moments.length} thing${me.moments.length > 1 ? "s" : ""} worth a look before ${me.moments.length > 1 ? "they become problems" : "it becomes a problem"}.`}`}
            chosen={chosen}
            onChoose={(kind, option) => setChosen((c) => ({ ...c, [kind]: option }))}
            onLevel={onLevel}
            onGroups={onGroups}
          />
        </div>
      </div>
    </div>
  );
}
