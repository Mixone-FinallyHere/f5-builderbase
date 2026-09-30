import type { Metadata } from "next";
import { scaleReport } from "@/lib/engine/population";
import { CONSENT_LABELS, type ConsentLevel } from "@/lib/engine/types";

export const metadata: Metadata = { title: "Scale view · Kate Ahead", description: "What Kate Ahead finds across a synthetic population, today." };
export const revalidate = 3600;

const eur = (n: number) => "€" + Math.round(n).toLocaleString("en-GB");
const FAMILY_LABEL: Record<string, string> = { deadline: "Deadline", cover: "Insurance cover", cashflow: "Cash-flow", risk: "Fraud risk", drift: "Drift", lifeevent: "Life event", credit: "Credit", value: "Value" };

export default function ScalePage() {
  const r = scaleReport();
  const harm = r.rows.reduce((s, x) => s + x.harmEUR, 0);
  const value = r.rows.reduce((s, x) => s + x.valueEUR, 0);
  const share = Math.round((r.customersWithMoment / r.population) * 100);

  return (
    <main className="mx-auto max-w-6xl px-4 pb-24 md:px-6">
      <header className="flex flex-wrap items-center justify-between gap-3 py-6">
        <a href="/" className="font-display text-lg font-bold tracking-tight">
          Kate <span className="text-secondary">Ahead</span> <span className="font-normal text-muted">/ today at KBC</span>
        </a>
        <nav className="flex gap-1 text-sm">
          <a href="/demo" className="rounded-full px-3 py-1.5 text-muted hover:text-text">Phone demo</a>
          <a href="/slides" className="rounded-full px-3 py-1.5 text-muted hover:text-text">Slides</a>
        </nav>
      </header>

      <p className="text-xs uppercase tracking-[0.2em] text-secondary">The same engine, over everyone</p>
      <h1 className="font-display mt-2 text-3xl font-bold tracking-tight md:text-4xl">Today, {share}% of customers have a moment Kate should act on</h1>
      <p className="mt-3 max-w-2xl text-muted">
        The eight watchers ran over a synthetic population of {r.population.toLocaleString("en-GB")} customers (seeded, no real data). Each row is a kind of moment; the money is what acting early prevents or gains this year.
      </p>

      <dl className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          [r.population.toLocaleString("en-GB"), "synthetic customers scanned"],
          [r.customersWithMoment.toLocaleString("en-GB"), `customers with at least one moment (${share}%)`],
          [eur(harm), "expected harm prevented this year, if every warning lands"],
          [eur(value), "value found per year"],
        ].map(([v, l]) => (
          <div key={l} className="rounded-card border border-border bg-surface p-5">
            <dt className="font-display text-3xl font-bold text-secondary">{v}</dt>
            <dd className="mt-1 text-sm text-muted">{l}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-8 overflow-x-auto rounded-card border border-border bg-surface">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-wider text-muted">
            <tr className="border-b border-border">
              <th className="p-3">Moment</th>
              <th className="p-3">Family</th>
              <th className="p-3 text-right">Customers</th>
              <th className="p-3 text-right">Avg. lead time</th>
              <th className="p-3 text-right">Harm prevented</th>
              <th className="p-3 text-right">Value / yr</th>
              <th className="p-3 text-right">Held back by dial</th>
            </tr>
          </thead>
          <tbody>
            {r.rows.map((row) => (
              <tr key={row.kind} className="border-b border-border/60">
                <td className="p-3">
                  <span className="font-medium">{row.kind.replace(/-/g, " ")}</span>
                </td>
                <td className="p-3 text-muted">{FAMILY_LABEL[row.family] ?? row.family}</td>
                <td className="p-3 text-right">{row.count.toLocaleString("en-GB")}</td>
                <td className="p-3 text-right text-muted">{row.avgHorizonDays === 0 ? "now" : row.avgHorizonDays > 365 ? `${Math.round(row.avgHorizonDays / 365)} yrs` : `${row.avgHorizonDays} days`}</td>
                <td className="p-3 text-right">{row.harmEUR ? eur(row.harmEUR) : "–"}</td>
                <td className="p-3 text-right">{row.valueEUR ? eur(row.valueEUR) : "–"}</td>
                <td className="p-3 text-right text-muted">{row.hiddenByConsent ? row.hiddenByConsent.toLocaleString("en-GB") : "–"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-2">
        <div className="rounded-card border border-border bg-surface p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-secondary">Consent dial across the population</p>
          <ul className="mt-3 space-y-2 text-sm">
            {r.consentDistribution.map((n, i) => (
              <li key={i}>
                <div className="flex justify-between">
                  <span>{i}. {CONSENT_LABELS[i as ConsentLevel]}</span>
                  <span className="text-muted">{Math.round((n / r.population) * 100)}%</span>
                </div>
                <div className="mt-1 h-1.5 rounded-full bg-surface-2">
                  <div className="h-1.5 rounded-full bg-primary" style={{ width: `${(n / r.population) * 100}%` }} />
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-muted">"Held back by dial" counts moments the engine found but may not show, because the customer hasn't unlocked that data group. Fraud checks always run: they're a legal duty.</p>
        </div>
        <div className="rounded-card border border-border bg-surface p-5 text-sm text-muted">
          <p className="text-xs uppercase tracking-[0.2em] text-secondary">How this scales to 4.1 million</p>
          <ul className="mt-3 space-y-2">
            <li>Deadlines and cover checks run as a nightly batch: cheap, deterministic, fully explainable.</li>
            <li>Cash-flow and drift run monthly per customer from transaction history already in the bank.</li>
            <li>Fraud risk runs in real time on the payment event, as PSR will require.</li>
            <li>The language model is called only when a moment is shown, so cost follows moments, not customers.</li>
            <li>The gate caps what any customer sees, so scale never turns into noise.</li>
          </ul>
        </div>
      </section>
    </main>
  );
}
