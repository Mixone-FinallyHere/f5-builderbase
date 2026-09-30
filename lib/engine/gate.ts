// Policy & consent gate: which moments a customer actually sees.
// - consent: a moment is shown only if every data group it used is unlocked by the customer's dial level
// - ranking: harm first (severity), then the nearest horizon
// - cap: one screen of moments, never a feed (alert fatigue kills prevention)

import type { ConsentLevel, Customer, Moment } from "./types";

export const MAX_VISIBLE = 4;

export interface GateResult {
  visible: Moment[];
  hiddenByConsent: Array<Pick<Moment, "id" | "kind" | "title" | "requiredConsent">>;
  overflow: number; // ranked below the cap
}

export function gate(customer: Customer, moments: Moment[], consent: ConsentLevel = customer.consent): GateResult {
  const allowed = moments.filter((m) => m.requiredConsent <= consent);
  const hidden = moments.filter((m) => m.requiredConsent > consent);
  const ranked = [...allowed].sort((a, b) => {
    if (a.realtime !== b.realtime) return a.realtime ? -1 : 1;
    if (a.severity !== b.severity) return b.severity - a.severity;
    return a.horizonDays - b.horizonDays;
  });
  return {
    visible: ranked.slice(0, MAX_VISIBLE),
    hiddenByConsent: hidden.map(({ id, kind, title, requiredConsent }) => ({ id, kind, title, requiredConsent })),
    overflow: Math.max(ranked.length - MAX_VISIBLE, 0),
  };
}
