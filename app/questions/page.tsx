"use client";

import { useState } from "react";

type Q = { id: string; name: string; question: string; voice?: string; mime?: string; at: string };

// Team inbox for questions left on the demo page. Needs the team password (same as the slides editor).
export default function QuestionsPage() {
  const [password, setPassword] = useState("");
  const [items, setItems] = useState<Q[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load(e?: React.FormEvent) {
    e?.preventDefault();
    setError(null);
    const res = await fetch("/api/questions", { headers: { "x-edit-password": encodeURIComponent(password) }, cache: "no-store" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return setError(data.error ?? "Couldn't load");
    setItems(data.questions);
  }

  return (
    <main className="mx-auto max-w-3xl px-4 pb-24 md:px-6">
      <header className="flex items-center justify-between py-6">
        <a href="/demo" className="font-display text-lg font-bold tracking-tight">
          Heads-<span className="text-secondary">Up</span> <span className="font-normal text-muted">/ questions</span>
        </a>
      </header>
      {items === null ? (
        <form onSubmit={load} className="flex flex-wrap items-center gap-2 rounded-card border border-border bg-surface p-4 text-sm">
          <label htmlFor="pw" className="text-muted">Team password</label>
          <input id="pw" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="rounded-lg border border-border bg-bg px-3 py-1.5 outline-none focus:border-primary" autoFocus />
          <button type="submit" className="rounded-lg bg-primary px-4 py-1.5 font-medium text-white">Open inbox</button>
          {error && <span className="text-danger">{error}</span>}
        </form>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted">{items.length} question{items.length === 1 ? "" : "s"}, newest first</p>
            <button onClick={() => load()} className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm">Refresh</button>
          </div>
          <ul className="mt-4 space-y-3">
            {items.map((q) => (
              <li key={q.id} className="rounded-card border border-border bg-surface p-4">
                <p className="text-xs text-muted">{q.name || "Anonymous"} · {new Date(q.at).toLocaleString("en-GB")}</p>
                {q.question && <p className="mt-1">{q.question}</p>}
                {q.voice && q.mime && <audio controls src={`data:${q.mime};base64,${q.voice}`} className="mt-2 h-8 w-full" />}
              </li>
            ))}
            {items.length === 0 && <li className="text-sm text-muted">Nothing yet.</li>}
          </ul>
        </>
      )}
    </main>
  );
}
