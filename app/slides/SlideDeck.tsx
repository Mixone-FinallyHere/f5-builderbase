"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { LAYOUTS, LIMITS, newSlide, SEED_DECK, type Deck, type Layout, type Slide } from "@/lib/slides";

const PASSWORD_KEY = "f5-slides-password";

function readStored(): string {
  try {
    return sessionStorage.getItem(PASSWORD_KEY) ?? "";
  } catch {
    return "";
  }
}

function writeStored(value: string | null) {
  try {
    if (value === null) sessionStorage.removeItem(PASSWORD_KEY);
    else sessionStorage.setItem(PASSWORD_KEY, value);
  } catch {}
}

// HTTP headers only carry Latin-1, so a password like "contraseña€" would make fetch throw.
// Percent-encode it; the server decodes it (lib/slides-server.ts).
function encodePassword(value: string): string {
  return encodeURIComponent(value);
}

type Status ={ kind: "info" | "error" | "ok"; text: string } | null;

export default function SlideDeck() {
  const [deck, setDeck] = useState<Deck>(SEED_DECK); // last saved / loaded version
  const [draft, setDraft] = useState<Deck>(SEED_DECK); // what's on screen
  const [loaded, setLoaded] = useState(false);
  const [editingEnabled, setEditingEnabled] = useState(false);
  const [index, setIndex] = useState(0);
  const [editing, setEditing] = useState(false);
  const [password, setPassword] = useState("");
  const [askPassword, setAskPassword] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [saving, setSaving] = useState(false);
  const [conflict, setConflict] = useState<Deck | null>(null);
  const [status, setStatus] = useState<Status>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  const dirty = draft !== deck;
  const slides = draft.slides;
  const current = slides[Math.min(index, slides.length - 1)];

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/slides", { cache: "no-store" });
      if (!res.ok) throw new Error();
      const data: { deck: Deck; editingEnabled: boolean } = await res.json();
      setDeck(data.deck);
      setDraft(data.deck);
      setEditingEnabled(data.editingEnabled);
    } catch {
      setStatus({ kind: "error", text: "Couldn't load the saved deck, showing the template." });
    } finally {
      setLoaded(true);
    }
  }, []);

  // Read the #n deep link once. The ref matters: dev mode runs effects twice, and the
  // second run would otherwise read back the "#1" that the effect below just wrote.
  const hashRead = useRef(false);
  useEffect(() => {
    load();
    setPassword(readStored());
    if (hashRead.current) return;
    hashRead.current = true;
    const n = parseInt(window.location.hash.slice(1), 10);
    if (n > 0) setIndex(n - 1);
  }, [load]);

  useEffect(() => {
    if (hashRead.current) history.replaceState(null, "", `#${index + 1}`);
  }, [index]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const go = useCallback((i: number) => setIndex(Math.max(0, Math.min(slides.length - 1, i))), [slides.length]);

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) document.exitFullscreen();
    else stageRef.current?.requestFullscreen();
  }, []);

  const save = useCallback(
    async (force = false) => {
      if (saving) return;
      setSaving(true);
      setStatus({ kind: "info", text: "Saving…" });
      try {
        const res = await fetch("/api/slides", {
          method: "PUT",
          headers: { "Content-Type": "application/json", "x-edit-password": encodePassword(password) },
          body: JSON.stringify({ deck: draft, baseUpdatedAt: deck.updatedAt, force }),
        });
        const data = await res.json();
        if (res.status === 409) {
          setConflict(data.deck);
          setStatus({ kind: "error", text: "Someone else saved while you were editing." });
        } else if (!res.ok) {
          if (res.status === 401) {
            writeStored(null);
            setEditing(false);
            setAskPassword(true);
          }
          setStatus({ kind: "error", text: data.error ?? "Save failed" });
        } else {
          setDeck(data.deck);
          setDraft(data.deck);
          setConflict(null);
          setStatus({ kind: "ok", text: "Saved" });
        }
      } catch {
        setStatus({ kind: "error", text: "Network error, not saved" });
      } finally {
        setSaving(false);
      }
    },
    [saving, password, draft, deck.updatedAt],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        if (editing) {
          e.preventDefault();
          save();
        }
        return;
      }
      const target = e.target as HTMLElement;
      if (target.closest("input, textarea, select")) return;
      if (["ArrowRight", "PageDown", " "].includes(e.key)) {
        e.preventDefault();
        go(index + 1);
      } else if (["ArrowLeft", "PageUp"].includes(e.key)) {
        e.preventDefault();
        go(index - 1);
      } else if (e.key === "Home") go(0);
      else if (e.key === "End") go(slides.length - 1);
      else if (e.key === "f") toggleFullscreen();
      else if (e.key === "n") setShowNotes((v) => !v);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [editing, save, go, index, slides.length, toggleFullscreen]);

  async function unlock(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch("/api/slides/auth", { method: "POST", headers: { "x-edit-password": encodePassword(password) } });
      if (res.ok) {
        writeStored(password);
        setAskPassword(false);
        setEditing(true);
        setStatus(null);
      } else {
        const data = await res.json().catch(() => ({}));
        setStatus({ kind: "error", text: data.error ?? "Wrong password" });
      }
    } catch {
      setStatus({ kind: "error", text: "Network error" });
    }
  }

  function startEditing() {
    if (readStored()) setEditing(true);
    else setAskPassword(true);
  }

  // Draft mutations
  const setSlides = (next: Slide[]) => setDraft({ ...draft, slides: next });
  const updateCurrent = (patch: Partial<Slide>) =>
    setSlides(slides.map((s) => (s.id === current.id ? { ...s, ...patch } : s)));
  const addSlide = () => {
    setSlides([...slides.slice(0, index + 1), newSlide(), ...slides.slice(index + 1)]);
    setIndex(index + 1);
  };
  const duplicateSlide = () => {
    setSlides([...slides.slice(0, index + 1), { ...current, id: newSlide().id }, ...slides.slice(index + 1)]);
    setIndex(index + 1);
  };
  const deleteSlide = () => {
    if (slides.length === 1) return;
    setSlides(slides.filter((s) => s.id !== current.id));
    go(Math.min(index, slides.length - 2));
  };
  const moveSlide = (dir: -1 | 1) => {
    const j = index + dir;
    if (j < 0 || j >= slides.length) return;
    const next = [...slides];
    [next[index], next[j]] = [next[j], next[index]];
    setSlides(next);
    setIndex(j);
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-[1600px] flex-col gap-4 px-4 py-4 md:px-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <a href="/" className="font-display text-lg font-bold tracking-tight">
          F5 <span className="text-muted">-</span> Builderbase <span className="text-muted font-normal">/ slides</span>
        </a>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          {status && (
            <span className={status.kind === "error" ? "text-danger" : status.kind === "ok" ? "text-success" : "text-muted"}>
              {status.text}
            </span>
          )}
          {editing && dirty && !saving && <span className="text-warn">Unsaved changes</span>}
          <Button onClick={() => setShowNotes((v) => !v)}>{showNotes ? "Hide notes" : "Notes"}</Button>
          <Button onClick={toggleFullscreen}>Present</Button>
          {editing ? (
            <>
              <Button
                onClick={() => {
                  if (dirty) setDraft(deck);
                  setEditing(false);
                  setStatus(null);
                }}
              >
                {dirty ? "Discard" : "Done"}
              </Button>
              <Button primary disabled={!dirty || saving} onClick={() => save()}>
                Save
              </Button>
            </>
          ) : (
            loaded &&
            editingEnabled && <Button onClick={startEditing}>Edit</Button>
          )}
        </div>
      </header>

      {askPassword && !editing && (
        <form onSubmit={unlock} className="flex flex-wrap items-center gap-2 rounded-card border border-border bg-surface p-3 text-sm">
          <label htmlFor="pw" className="text-muted">Team password</label>
          <input
            id="pw"
            type="password"
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-lg border border-border bg-bg px-3 py-1.5 outline-none focus:border-primary"
          />
          <Button primary type="submit">Unlock editing</Button>
          <Button onClick={() => setAskPassword(false)}>Cancel</Button>
        </form>
      )}

      {conflict && (
        <div className="flex flex-wrap items-center gap-2 rounded-card border border-warn/50 bg-surface p-3 text-sm">
          <span>A teammate saved a newer version. Load theirs (your unsaved edits are lost), or overwrite it with yours (theirs stays in history).</span>
          <Button onClick={() => { setDeck(conflict); setDraft(conflict); setConflict(null); setStatus(null); go(index); }}>Load theirs</Button>
          <Button primary onClick={() => save(true)}>Overwrite with mine</Button>
        </div>
      )}

      <div className={editing ? "grid flex-1 gap-4 lg:grid-cols-[200px_minmax(0,1fr)_340px]" : "flex flex-1 flex-col"}>
        {editing && (
          <ol className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-x-visible">
            {slides.map((s, i) => (
              <li key={s.id}>
                <button
                  onClick={() => setIndex(i)}
                  className={`w-40 shrink-0 rounded-lg border px-3 py-2 text-left text-xs [overflow-wrap:anywhere] lg:w-full ${i === index ? "border-primary bg-surface-2" : "border-border bg-surface hover:bg-surface-2"}`}
                >
                  <span className="text-muted">{i + 1}.</span> {s.title || "Untitled"}
                </button>
              </li>
            ))}
          </ol>
        )}

        <div className="flex flex-col gap-3">
          <div ref={stageRef} className="stage-wrapper flex items-center justify-center bg-bg" onClick={(e) => !editing && e.detail === 1 && go(index + 1)}>
            <SlideView slide={current} />
          </div>
          <div className="flex items-center justify-between text-sm text-muted">
            <Button onClick={() => go(index - 1)} disabled={index === 0}>← Prev</Button>
            <span>{index + 1} / {slides.length}</span>
            <Button onClick={() => go(index + 1)} disabled={index === slides.length - 1}>Next →</Button>
          </div>
          {showNotes && (
            <div className="rounded-card border border-border bg-surface p-4 text-sm whitespace-pre-wrap [overflow-wrap:anywhere]">
              {current.notes || <span className="text-muted">No speaker notes for this slide.</span>}
            </div>
          )}
          {!editing && (
            <p className="text-xs text-muted">← → or space to navigate · F fullscreen · N notes</p>
          )}
        </div>

        {editing && (
          <aside className="flex flex-col gap-3 rounded-card border border-border bg-surface p-4 text-sm">
            <div className="flex flex-wrap gap-2">
              <Button onClick={addSlide}>+ Slide</Button>
              <Button onClick={duplicateSlide}>Duplicate</Button>
              <Button onClick={() => moveSlide(-1)} disabled={index === 0}>↑</Button>
              <Button onClick={() => moveSlide(1)} disabled={index === slides.length - 1}>↓</Button>
              <Button onClick={deleteSlide} disabled={slides.length === 1}>Delete</Button>
            </div>
            <Field label="Layout">
              <select
                value={current.layout}
                onChange={(e) => updateCurrent({ layout: e.target.value as Layout })}
                className={inputClass}
              >
                {LAYOUTS.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </Field>
            <Field label="Title">
              <input value={current.title} maxLength={LIMITS.title} onChange={(e) => updateCurrent({ title: e.target.value })} className={inputClass} />
            </Field>
            <Field label={current.layout === "statement" ? "Label (small text above)" : "Subtitle"}>
              <input value={current.subtitle} maxLength={LIMITS.subtitle} onChange={(e) => updateCurrent({ subtitle: e.target.value })} className={inputClass} />
            </Field>
            {current.layout === "content" && (
              <>
                <Field label="Bullets (one per line)">
                  <textarea
                    rows={5}
                    value={current.bullets.join("\n")}
                    onChange={(e) => updateCurrent({ bullets: e.target.value.split("\n").slice(0, LIMITS.bullets).map((b) => b.slice(0, LIMITS.bullet)) })}
                    className={inputClass}
                  />
                </Field>
                <Field label="Image URL (https)">
                  <input value={current.image} maxLength={LIMITS.image} placeholder="https://…" onChange={(e) => updateCurrent({ image: e.target.value })} className={inputClass} />
                </Field>
              </>
            )}
            <Field label="Speaker notes">
              <textarea rows={4} value={current.notes} maxLength={LIMITS.notes} onChange={(e) => updateCurrent({ notes: e.target.value })} className={inputClass} />
            </Field>
            <p className="text-xs text-muted">Ctrl+S to save. Every save keeps the previous version in history.</p>
          </aside>
        )}
      </div>
    </main>
  );
}

const inputClass = "w-full rounded-lg border border-border bg-bg px-3 py-2 outline-none focus:border-primary";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs uppercase tracking-wider text-muted">{label}</span>
      {children}
    </label>
  );
}

function Button({ primary, className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { primary?: boolean }) {
  return (
    <button
      type="button"
      {...props}
      className={`rounded-lg px-3 py-1.5 text-sm transition disabled:cursor-not-allowed disabled:opacity-40 ${primary ? "bg-primary text-white hover:brightness-110" : "border border-border bg-surface hover:bg-surface-2"} ${className ?? ""}`}
    />
  );
}

// A 16:9 slide. Sizes are in container-query units so the slide scales with its width.
function SlideView({ slide }: { slide: Slide }) {
  return (
    <div className="stage relative aspect-video w-full overflow-hidden rounded-card border border-border bg-surface">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_10%_0%,rgba(124,92,255,0.25),transparent),radial-gradient(50%_50%_at_100%_0%,rgba(45,226,196,0.12),transparent)]" />
      <div className="relative flex h-full flex-col p-[6cqw] [overflow-wrap:anywhere]">
        {slide.layout === "title" && (
          <div className="m-auto text-center">
            <h1 className="font-display text-[6.5cqw] leading-[1.12] font-bold tracking-tight">{slide.title}</h1>
            {slide.subtitle && <p className="mt-[2cqw] text-[2.2cqw] text-muted">{slide.subtitle}</p>}
            <div className="mx-auto mt-[3cqw] h-[0.5cqw] w-[8cqw] rounded-full bg-gradient-to-r from-primary to-secondary" />
          </div>
        )}
        {slide.layout === "statement" && (
          <div className="my-auto max-w-[85%]">
            {slide.subtitle && <p className="mb-[2cqw] text-[1.6cqw] uppercase tracking-[0.2em] text-secondary">{slide.subtitle}</p>}
            <h1 className="font-display text-[5cqw] leading-[1.15] font-bold tracking-tight">{slide.title}</h1>
          </div>
        )}
        {slide.layout === "content" && (
          <>
            <h1 className="font-display text-[4.2cqw] leading-tight font-bold tracking-tight">{slide.title}</h1>
            {slide.subtitle && <p className="mt-[1cqw] text-[2cqw] text-muted">{slide.subtitle}</p>}
            <div className="mt-[4cqw] flex min-h-0 flex-1 gap-[4cqw]">
              <ul className="flex flex-1 flex-col gap-[1.8cqw]">
                {slide.bullets.filter((b) => b.trim()).map((b, i) => (
                  <li key={i} className="flex gap-[1.5cqw] text-[2.3cqw] leading-snug">
                    <span className="mt-[0.9cqw] h-[0.9cqw] w-[0.9cqw] shrink-0 rounded-full bg-secondary" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
              {slide.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={slide.image} alt="" referrerPolicy="no-referrer" className="h-full max-w-[45%] rounded-card object-contain" />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
