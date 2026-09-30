"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import type { PersonaMeta } from "@/lib/engine/personas";
import type { ConsentLevel, Group } from "@/lib/engine/types";
import { KatePhone, type Me } from "../demo/KatePhone";

export default function AppShell() {
  const params = useSearchParams();
  const [personas, setPersonas] = useState<PersonaMeta[]>([]);
  const [me, setMe] = useState<Me | null>(null);
  const [chosen, setChosen] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);

  const loadMe = useCallback(async (): Promise<Me | null> => {
    const res = await fetch("/api/me", { cache: "no-store" });
    const data = (await res.json()) as Me;
    return data.signedIn ? data : null;
  }, []);

  const patch = useCallback(
    async (body: object) => {
      const res = await fetch("/api/me", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error("Couldn't update the dial");
      const v = await loadMe();
      if (v) setMe(v);
      return v;
    },
    [loadMe],
  );

  const open = useCallback(
    async (id: string) => {
      setError(null);
      setChosen({});
      const res = await fetch("/api/session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ persona: id }) });
      if (!res.ok) return setError("Unknown customer");
      await patch({ consent: 3 });
    },
    [patch],
  );

  useEffect(() => {
    fetch("/api/personas").then((r) => r.json()).then((p) => setPersonas(p.personas)).catch(() => setError("Couldn't load"));
    const id = params.get("persona");
    if (id) open(id);
    else loadMe().then((v) => v && setMe(v));
  }, [params, open, loadMe]);

  return (
    <main className="mx-auto flex min-h-[100dvh] max-w-[430px] flex-col bg-white text-slate-900 sm:my-6 sm:min-h-0 sm:rounded-[2.2rem] sm:border-[6px] sm:border-slate-800 sm:shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)]" style={{ height: "min(100dvh, 860px)" }}>
      <div className="flex items-center justify-between px-5 pt-3 text-[11px] text-slate-500">
        <span>9:41</span>
        <span className="rounded-full bg-slate-100 px-2 py-0.5">KBC Mobile · concept</span>
        <button onClick={() => setMe(null)} className="text-sky-700">{me ? "switch" : ""}</button>
      </div>
      {me ? (
        <KatePhone
          me={me}
          cards={me.moments}
          greeting={`Hi ${me.customer.name}. ${me.moments.length === 0 ? "Nothing needs your attention right now." : `${me.moments.length} thing${me.moments.length > 1 ? "s" : ""} worth a look before ${me.moments.length > 1 ? "they become problems" : "it becomes a problem"}.`}`}
          chosen={chosen}
          onChoose={(kind, option) => setChosen((c) => ({ ...c, [kind]: option }))}
          onLevel={(l: ConsentLevel) => patch({ consent: l })}
          onGroups={(g: Group[]) => patch({ groups: g })}
        />
      ) : (
        <div className="flex flex-1 flex-col justify-center gap-2 p-5">
          <p className="text-center text-xs uppercase tracking-[0.2em] text-slate-500">Sign in as</p>
          {personas.map((p) => (
            <button key={p.id} onClick={() => open(p.id)} className="rounded-2xl border border-slate-200 p-3 text-left hover:border-sky-500">
              <p className="font-semibold">{p.name} <span className="font-normal text-slate-500">· {p.age}</span></p>
              <p className="text-xs text-slate-500">{p.tagline}</p>
            </button>
          ))}
          {error && <p className="text-center text-sm text-rose-600">{error}</p>}
          <p className="mt-2 text-center text-[11px] text-slate-400">Concept demo. Invented customers, no real data.</p>
        </div>
      )}
    </main>
  );
}
