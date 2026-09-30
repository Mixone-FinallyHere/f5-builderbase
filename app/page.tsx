const features = [
  { title: "Feature one", body: "Replace with the one-sentence benefit of your first feature." },
  { title: "Feature two", body: "Replace with the one-sentence benefit of your second feature." },
  { title: "Feature three", body: "Replace with the one-sentence benefit of your third feature." },
];

const steps = ["Connect", "Build", "Ship"];

export default function Home() {
  return (
    <main className="mx-auto max-w-6xl px-6 pb-24">
      <nav className="flex items-center justify-between py-6">
        <span className="font-display text-lg font-bold tracking-tight">
          F5 <span className="text-muted">-</span> Builderbase
        </span>
        <a
          href="https://github.com/WhiteChair/f5-builderbase"
          className="rounded-full border border-border bg-surface px-4 py-2 text-sm text-muted transition hover:text-text"
        >
          GitHub
        </a>
      </nav>

      <section className="pt-20 pb-24 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs uppercase tracking-widest text-muted">
          <span className="h-2 w-2 rounded-full bg-success" /> Hackathon build · live
        </span>
        <h1 className="font-display mx-auto mt-8 max-w-3xl text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl">
          Build it tonight.{" "}
          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Ship it by morning.
          </span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-muted">
          F5 - Builderbase. Tagline placeholder: one clear sentence about who this is for and why it matters.
        </p>
        <div className="mt-10 flex justify-center gap-3">
          <a className="rounded-xl bg-primary px-6 py-3 font-medium text-white shadow-[0_0_40px_-8px_#7c5cff] transition hover:brightness-110" href="#features">
            Get started
          </a>
          <a className="rounded-xl border border-border bg-surface px-6 py-3 font-medium transition hover:bg-surface-2" href="#how">
            How it works
          </a>
        </div>
      </section>

      <section id="features" className="grid gap-4 md:grid-cols-3">
        {features.map((f) => (
          <div key={f.title} className="rounded-card border border-border bg-surface p-6">
            <div className="mb-4 h-2 w-10 rounded-full bg-secondary" />
            <h3 className="font-display text-xl font-semibold">{f.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{f.body}</p>
          </div>
        ))}
      </section>

      <section id="how" className="mt-24">
        <h2 className="font-display text-3xl font-bold tracking-tight">How it works</h2>
        <ol className="mt-8 grid gap-4 md:grid-cols-3">
          {steps.map((s, i) => (
            <li key={s} className="rounded-card border border-border bg-surface-2 p-6">
              <span className="font-display text-4xl font-bold text-primary">0{i + 1}</span>
              <p className="font-display mt-3 text-lg font-semibold">{s}</p>
              <p className="mt-1 text-sm text-muted">Describe this step in one line.</p>
            </li>
          ))}
        </ol>
      </section>

      <footer className="mt-24 border-t border-border pt-6 text-sm text-muted">
        © 2026 F5 - Builderbase · MIT licensed
      </footer>
    </main>
  );
}
