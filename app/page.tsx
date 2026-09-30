import { demoVideoUrl, headlineStats, painPoints, project, segments, solutionSteps, team } from "@/lib/content";
import { toEmbed } from "@/lib/video";

const navLink = "rounded-full px-3 py-1.5 text-sm text-muted transition hover:text-text";

export default function Home() {
  const video = demoVideoUrl ? toEmbed(demoVideoUrl) : null;

  return (
    <main className="mx-auto max-w-6xl px-6 pb-24">
      <nav className="flex flex-wrap items-center justify-between gap-3 py-6">
        <a href="#top" className="font-display text-lg font-bold tracking-tight">
          {project.name}
        </a>
        <div className="flex flex-wrap items-center gap-1">
          <a href="#problem" className={navLink}>Problem</a>
          <a href="#solution" className={navLink}>Solution</a>
          <a href="/demo" className={navLink}>Live demo</a>
          <a href="#demo" className={navLink}>Video</a>
          <a href="/slides" className={navLink}>Slides</a>
          <a href={project.repo} className="ml-1 rounded-full border border-border bg-surface px-4 py-1.5 text-sm text-muted transition hover:text-text">
            GitHub
          </a>
        </div>
      </nav>

      <section id="top" className="pt-16 pb-20 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs uppercase tracking-widest text-muted">
          <span className="h-2 w-2 rounded-full bg-success" /> {project.challenge}
        </span>
        <h1 className="font-display mx-auto mt-8 max-w-4xl text-4xl font-bold leading-[1.1] tracking-tight md:text-6xl">
          {project.headline}{" "}
          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {project.headlineAccent}
          </span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted">{project.tagline}</p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <a className="rounded-xl bg-primary px-6 py-3 font-medium text-white shadow-[0_0_40px_-8px_#7c5cff] transition hover:brightness-110" href="/demo">
            Try the live demo
          </a>
          <a className="rounded-xl border border-border bg-surface px-6 py-3 font-medium transition hover:bg-surface-2" href="/slides">
            See the pitch
          </a>
        </div>
        <dl className="mx-auto mt-16 grid max-w-4xl gap-4 text-left md:grid-cols-3">
          {headlineStats.map((s) => (
            <div key={s.value} className="rounded-card border border-border bg-surface p-5">
              <dt className="font-display text-3xl font-bold text-secondary">{s.value}</dt>
              <dd className="mt-2 text-sm text-muted">
                {s.label}{" "}
                <a href={s.source.url} className="underline decoration-border underline-offset-2 hover:text-text" target="_blank" rel="noopener noreferrer">
                  {s.source.label}
                </a>
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section id="problem" className="scroll-mt-8">
        <SectionHeading kicker="The problem" title="Six things customers struggle with today" />
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {painPoints.map((p) => (
            <article key={p.id} className="flex flex-col rounded-card border border-border bg-surface p-6">
              <p className="font-display text-4xl font-bold text-primary">{p.stat}</p>
              <p className="mt-1 text-xs uppercase tracking-wider text-muted">{p.statLabel}</p>
              <h3 className="font-display mt-5 text-xl font-semibold">{p.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{p.body}</p>
              <a href={p.source.url} className="mt-4 text-xs text-muted underline decoration-border underline-offset-2 hover:text-text" target="_blank" rel="noopener noreferrer">
                Source: {p.source.label}
              </a>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-20">
        <SectionHeading kicker="Who it hurts" title="Not one audience, but many different moments" />
        <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {segments.map((s) => (
            <li key={s.name} className="rounded-card border border-border bg-surface-2 p-4">
              <p className="font-display font-semibold">{s.name}</p>
              <p className="mt-1 text-sm text-muted">{s.pain}</p>
            </li>
          ))}
        </ul>
      </section>

      <section id="solution" className="mt-24 scroll-mt-8">
        <SectionHeading kicker="Our solution" title="Kate Ahead: prevention on data KBC already holds" />
        <p className="mt-3 max-w-2xl text-muted">Five customers, ten moments, one engine. Try it live: pick a customer, open their Kate, turn the consent dial.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <a href="/demo" className="rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-white transition hover:brightness-110">Open the phone demo</a>
          <a href="/scale" className="rounded-xl border border-border bg-surface px-5 py-2.5 text-sm font-medium transition hover:bg-surface-2">See it at scale</a>
        </div>
        <ol className="mt-8 grid gap-4 md:grid-cols-3">
          {solutionSteps.map((s, i) => (
            <li key={i} className="rounded-card border border-border bg-surface p-6">
              <span className="font-display text-4xl font-bold text-primary">0{i + 1}</span>
              <p className="font-display mt-3 text-lg font-semibold">{s.title}</p>
              <p className="mt-1 text-sm text-muted">{s.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section id="demo" className="mt-24 scroll-mt-8">
        <SectionHeading kicker="Demo" title="See it in action" />
        <div className="mt-8 overflow-hidden rounded-card border border-border bg-surface">
          {video?.kind === "iframe" && (
            <iframe
              src={video.src}
              title="Demo video"
              className="aspect-video w-full"
              allow="fullscreen; picture-in-picture"
              referrerPolicy="strict-origin-when-cross-origin"
              sandbox="allow-scripts allow-same-origin allow-presentation"
            />
          )}
          {video?.kind === "video" && <video src={video.src} controls className="aspect-video w-full" />}
          {!video && (
            <div className="flex aspect-video flex-col items-center justify-center gap-2 p-6 text-center text-muted">
              <p className="font-display text-xl text-text">Demo video (under 3 minutes)</p>
              <p className="text-sm">Set <code className="rounded bg-surface-2 px-1.5 py-0.5">demoVideoUrl</code> in <code className="rounded bg-surface-2 px-1.5 py-0.5">lib/content.ts</code> to a YouTube, Vimeo or Loom link.</p>
            </div>
          )}
        </div>
        <p className="mt-4 text-sm text-muted">
          Prefer slides? <a href="/slides" className="text-text underline underline-offset-2">Open the pitch deck</a>. Use the arrow keys to navigate and F for fullscreen.
        </p>
      </section>

      <section className="mt-24 grid gap-4 md:grid-cols-2">
        <div className="rounded-card border border-border bg-surface p-6">
          <SectionHeading kicker="Security" title="Built to be trusted" />
          <p className="mt-3 text-sm text-muted">
            Scanned with Aikido&apos;s AI code audit (before and after results to follow). Customer data is scoped to its owner, inputs are validated on the server, security headers are set on every page, and no secrets live in the code.
          </p>
        </div>
        <div className="rounded-card border border-border bg-surface p-6">
          <SectionHeading kicker="Team" title="Team F5" />
          <ul className="mt-3 space-y-1 text-sm">
            {team.map((m, i) => (
              <li key={i}>
                <span className="text-text">{m.name}</span> <span className="text-muted">· {m.role}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <footer className="mt-24 border-t border-border pt-6 text-sm text-muted">
        {project.name} · {project.challenge} · <a href={project.repo} className="underline underline-offset-2 hover:text-text">Source on GitHub</a> · MIT licensed
      </footer>
    </main>
  );
}

function SectionHeading({ kicker, title }: { kicker: string; title: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.2em] text-secondary">{kicker}</p>
      <h2 className="font-display mt-2 text-3xl font-bold tracking-tight">{title}</h2>
    </div>
  );
}
