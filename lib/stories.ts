// Scripted demo stories: what happens in real life, how the signal reaches the bank, what the customer sees,
// what they do, and how it ends. The moment cards themselves come from the engine (/api/me); a story step
// only says which moment to reveal next, so the "real-time" cards are real engine output.

export type Step =
  | { type: "scene"; scene: string; caption: string; ms?: number }
  | { type: "signal"; event: string; groups: string[]; watchers: string[]; ms?: number }
  | { type: "notify"; title: string; body: string; ms?: number }
  | { type: "zoom"; ms?: number }
  | { type: "moment"; kind: string; ms?: number }
  | { type: "act"; kind: string; option: number; ms?: number }
  | { type: "aside"; title: string; body: string; icon: "phone" | "adviser" | "law"; ms?: number }
  | { type: "dial"; level: 0 | 1 | 2 | 3; ms?: number }
  | { type: "outcome"; scene: string; caption: string; ms?: number };

export interface Story {
  persona: string;
  title: string;
  steps: Step[];
}

export const STORIES: Record<string, Story> = {
  lien: {
    persona: "lien",
    title: "Buying a house, checked as a whole",
    steps: [
      { type: "scene", scene: "lien-notary", caption: "Tuesday, 10:14. Lien and Tom sign the compromis for a €385,000 house with an energy label E. The deposit goes to the notary." },
      { type: "signal", event: "€38,500 transfer to Notaris Vermeulen, reference “voorschot compromis”", groups: ["B", "C", "D", "H", "F"], watchers: ["Credit", "Cover", "Deadline"] },
      { type: "notify", title: "Heads-up on your house purchase", body: "Three things worth knowing before the deed. Nothing is decided for you." },
      { type: "zoom" },
      { type: "moment", kind: "house-purchase-analysis" },
      { type: "act", kind: "house-purchase-analysis", option: 0 },
      { type: "moment", kind: "home-insure-rebuild-value" },
      { type: "act", kind: "home-insure-rebuild-value", option: 0 },
      { type: "moment", kind: "renovation-obligation" },
      { type: "aside", icon: "law", title: "Why the bank may say this", body: "Since June 2024 borrowers can switch the bundled insurance after a third of the term at no cost and keep the rate discount. Kate applies the rule for the customer instead of hoping they never find out." },
      { type: "outcome", scene: "lien-home", caption: "Deed signed. Bundle taken with a review set for year 9, home insured for its rebuild value, renovation planned with the energy loan. About €18,700 better off over the term." },
    ],
  },
  marc: {
    persona: "marc",
    title: "Retiring in five months",
    steps: [
      { type: "scene", scene: "marc-hr", caption: "Marc confirms his retirement date with HR. Five months to go. His group hospitalisation insurance ends the same day; nobody mentions it." },
      { type: "signal", event: "Policy record updated: employer cover ends on the retirement date. ID card on file expires in 41 days.", groups: ["D", "H", "A", "C"], watchers: ["Cover", "Deadline", "Value"] },
      { type: "notify", title: "Two things before you retire", body: "Your hospitalisation cover changes in March, and your ID card expires next month." },
      { type: "zoom" },
      { type: "moment", kind: "hospitalisation-retirement" },
      { type: "aside", icon: "adviser", title: "Adviser confirms first", body: "Health-related moments never go out on their own. Marc's adviser sees the same card, checks the continuation option and approves it before Kate sends it." },
      { type: "act", kind: "hospitalisation-retirement", option: 0 },
      { type: "moment", kind: "id-expiry" },
      { type: "act", kind: "id-expiry", option: 0 },
      { type: "dial", level: 0 },
      { type: "outcome", scene: "marc-bench", caption: "Continuation pre-registered, no medical questionnaire. ID renewed from the sofa. In March, nothing breaks." },
    ],
  },
  ayse: {
    persona: "ayse",
    title: "Turning 25, paying elsewhere",
    steps: [
      { type: "scene", scene: "ayse-cafe", caption: "Lisbon, a Saturday. Ayşe pays with her other app again: no card fees abroad. Her 25th birthday, and the end of her free account, is in 38 days." },
      { type: "signal", event: "Monthly top-ups to a neobank IBAN: €40 → €340 in six months. Plus account turns paid on 7 Nov.", groups: ["B", "A", "C"], watchers: ["Value", "Drift"] },
      { type: "notify", title: "Your free account ends on your birthday", body: "Here's the cheapest setup for how you actually bank. Nothing changes unless you say so." },
      { type: "zoom" },
      { type: "moment", kind: "fee-cliff-25" },
      { type: "act", kind: "fee-cliff-25", option: 0 },
      { type: "moment", kind: "competitor-drift" },
      { type: "act", kind: "competitor-drift", option: 0 },
      { type: "moment", kind: "idle-savings" },
      { type: "outcome", scene: "ayse-phone", caption: "Basic account from her birthday, travel option on, €6,000 earning 3.15%. The €340 a month has a reason to come back." },
    ],
  },
  jos: {
    persona: "jos",
    title: "A text message about a parcel",
    steps: [
      { type: "scene", scene: "jos-sms", caption: "Twelve minutes ago, Jos tapped a link in a text about a held parcel. He “re-installed” his banking app on a new phone, as instructed. He is about to send €2,850 to “PostNL Douane BV”." },
      { type: "signal", event: "New device enrolled today · SMS link opened 12 min ago · first payment to this account · €2,850 vs usual €150 · name check: orange", groups: ["G", "B"], watchers: ["Risk"] },
      { type: "notify", title: "Let's pause this payment for a moment", body: "This looks like a scam we see a lot. Nothing is blocked; I'll call you on your usual number." },
      { type: "zoom" },
      { type: "moment", kind: "scam-in-progress" },
      { type: "aside", icon: "phone", title: "The same moment, by phone", body: "Jos prefers the phone, so Kate calls his number on file: “Hi Jos, it's Kate from KBC. You're about to send €2,850 to a new account after opening a link in a text. That's the pattern of a parcel scam. Nothing is blocked. Shall we cancel it together?”" },
      { type: "act", kind: "scam-in-progress", option: 1 },
      { type: "moment", kind: "hospitalisation-increase" },
      { type: "outcome", scene: "jos-call", caption: "Payment cancelled. €2,850 stays where it is. Under the new EU rules the bank would have refunded it anyway; preventing it costs nothing and blames nobody." },
    ],
  },
  nadia: {
    persona: "nadia",
    title: "A late client and a tax deadline",
    steps: [
      { type: "scene", scene: "nadia-client", caption: "Nadia's biggest client: “I'll pay next month, promise.” VAT prepayment and social contributions land on the 20th. Last week she bought a car." },
      { type: "signal", event: "Projected balance: −€2,960 on the 20th before the €4,800 invoice lands · €18,500 to Garage Delvaux + vehicle registration fee · no motor policy", groups: ["B", "D", "E"], watchers: ["Cash-flow", "Cover"] },
      { type: "notify", title: "Your account dips below zero on the 20th", body: "A two-week buffer from savings avoids overdraft costs. Also: the new car isn't insured with us yet." },
      { type: "zoom" },
      { type: "moment", kind: "month-end-shortfall" },
      { type: "act", kind: "month-end-shortfall", option: 0 },
      { type: "moment", kind: "new-car-no-cover" },
      { type: "act", kind: "new-car-no-cover", option: 0 },
      { type: "moment", kind: "income-protection-gap" },
      { type: "outcome", scene: "nadia-desk", caption: "Buffer moved for two weeks, no overdraft, no declined VAT payment. Car insured before the first drive to a client." },
    ],
  },
};

// Default duration per step type in autoplay (ms). Moments add reading time for the message.
export const STEP_MS: Record<Step["type"], number> = {
  scene: 6500,
  signal: 5000,
  notify: 4000,
  zoom: 1400,
  moment: 5500,
  act: 2600,
  aside: 6500,
  dial: 6000,
  outcome: 8000,
};
