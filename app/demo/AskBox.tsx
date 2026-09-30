"use client";

import { useEffect, useRef, useState } from "react";

const MAX_SECONDS = 20;

// "Ask us": judges and viewers leave a question, typed or as a short voice note.
export function AskBox() {
  const [name, setName] = useState("");
  const [question, setQuestion] = useState("");
  const [status, setStatus] = useState<{ kind: "idle" | "sending" | "ok" | "error"; text?: string }>({ kind: "idle" });
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [voice, setVoice] = useState<{ blob: Blob; url: string } | null>(null);
  const rec = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);

  useEffect(() => {
    if (!recording) return;
    const id = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(id);
  }, [recording]);

  useEffect(() => {
    if (recording && seconds >= MAX_SECONDS) stop();
  }, [seconds, recording]);

  async function start() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mime = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"].find((t) => MediaRecorder.isTypeSupported(t));
      const r = new MediaRecorder(stream, mime ? { mimeType: mime, audioBitsPerSecond: 32_000 } : undefined);
      chunks.current = [];
      r.ondataavailable = (e) => e.data.size && chunks.current.push(e.data);
      r.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunks.current, { type: r.mimeType });
        setVoice({ blob, url: URL.createObjectURL(blob) });
      };
      rec.current = r;
      r.start();
      setSeconds(0);
      setVoice(null);
      setRecording(true);
    } catch {
      setStatus({ kind: "error", text: "Microphone not available. Type your question instead." });
    }
  }

  function stop() {
    rec.current?.stop();
    setRecording(false);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (question.trim().length < 3 && !voice) {
      setStatus({ kind: "error", text: "Type a question or record one." });
      return;
    }
    setStatus({ kind: "sending" });
    try {
      let voiceB64: string | undefined;
      let mime: string | undefined;
      if (voice) {
        if (voice.blob.size > 300_000) throw new Error("Voice note too large; keep it under 20 seconds.");
        voiceB64 = await new Promise<string>((res, rej) => {
          const fr = new FileReader();
          fr.onload = () => res((fr.result as string).split(",")[1]);
          fr.onerror = () => rej(new Error("Couldn't read the recording"));
          fr.readAsDataURL(voice.blob);
        });
        mime = voice.blob.type.split(";")[0];
      }
      const res = await fetch("/api/questions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, question, voice: voiceB64, mime }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Couldn't send");
      setStatus({ kind: "ok", text: "Sent. Thank you, we'll answer in the Q&A." });
      setQuestion("");
      setVoice(null);
    } catch (err) {
      setStatus({ kind: "error", text: err instanceof Error ? err.message : "Couldn't send" });
    }
  }

  return (
    <form onSubmit={submit} className="rounded-card border border-border bg-surface p-5">
      <p className="text-xs uppercase tracking-[0.2em] text-secondary">Ask us</p>
      <h2 className="font-display mt-1 text-xl font-semibold">Got a question for the team?</h2>
      <p className="mt-1 text-sm text-muted">Type it, or record a {MAX_SECONDS}-second voice note. We read them during the Q&A.</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-[200px_minmax(0,1fr)]">
        <input value={name} onChange={(e) => setName(e.target.value)} maxLength={60} placeholder="Your name (optional)" className="rounded-lg border border-border bg-bg px-3 py-2 text-sm outline-none focus:border-primary" />
        <textarea value={question} onChange={(e) => setQuestion(e.target.value)} maxLength={600} rows={2} placeholder="Your question…" className="rounded-lg border border-border bg-bg px-3 py-2 text-sm outline-none focus:border-primary" />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
        {recording ? (
          <button type="button" onClick={stop} className="rounded-lg border border-danger px-3 py-1.5 text-danger">■ Stop ({MAX_SECONDS - seconds}s left)</button>
        ) : (
          <button type="button" onClick={start} className="rounded-lg border border-border bg-surface-2 px-3 py-1.5">● Record a voice note</button>
        )}
        {voice && !recording && (
          <>
            <audio src={voice.url} controls className="h-8" />
            <button type="button" onClick={() => setVoice(null)} className="text-muted underline">remove</button>
          </>
        )}
        <button type="submit" disabled={status.kind === "sending"} className="ml-auto rounded-lg bg-primary px-4 py-1.5 font-medium text-white disabled:opacity-50">
          {status.kind === "sending" ? "Sending…" : "Send"}
        </button>
      </div>
      {status.text && <p className={`mt-2 text-sm ${status.kind === "error" ? "text-danger" : "text-success"}`}>{status.text}</p>}
    </form>
  );
}
