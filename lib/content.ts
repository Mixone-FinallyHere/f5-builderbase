// All text on the landing page lives here, so the team can edit copy without touching layout.
// Numbers come from docs/hackathon/SUMMARY.md and our KBC problem research; keep the sources when editing.

export type Source = { label: string; url: string };

export const project = {
  // TODO: replace once the idea is chosen.
  name: "F5 - Builderbase",
  headline: "KBC has the world's best banking app.",
  headlineAccent: "Its customers still feel unheard.",
  tagline: "Our one-line promise goes here: who it's for and what changes for them.",
  challenge: "KBC challenge · Tectonic Hackathon 2026",
  repo: "https://github.com/WhiteChair/f5-builderbase",
};

// Paste a YouTube, Vimeo or Loom link (or a direct https .mp4) to embed the demo video.
export const demoVideoUrl = "";

export const headlineStats: Array<{ value: string; label: string; source: Source }> = [
  {
    value: "4.1M",
    label: "KBC clients in Belgium, and only about half use the app",
    source: { label: "KBC Annual Report 2025", url: "https://www.kbc.com/content/dam/kbccom/doc/investor-relations/Results/jvs-2025/jvs-2025-grp-en.pdf" },
  },
  {
    value: "1M+",
    label: "Belgians now bank with Revolut, adding about 25k a month",
    source: { label: "Belga, 2026", url: "https://www.belganewsagency.eu/revolut-passes-1-million-customers-in-belgium" },
  },
  {
    value: "€93M",
    label: "lost to phishing in Belgium in 2025, with fraud up 102% in Q1 2026",
    source: { label: "Febelfin, 2026", url: "https://febelfin.be/media/pages/publicaties/2026/febelfin-actieplan-voor-de-aanpak-van-online-fraude/01f6dccf4f-1783584006/febelfin-actieplan-voor-de-aanpak-van-online-fraude.pdf" },
  },
];

export type PainPoint = { id: string; stat: string; statLabel: string; title: string; body: string; source: Source };

export const painPoints: PainPoint[] = [
  {
    id: "unexplained",
    stat: "+48%",
    statLabel: "account closures started by banks (2024)",
    title: "Decisions without explanations",
    body: "Accounts get blocked, KYC documents go unanswered, loans are refused without a reason. The ombudsman criticises algorithms that end customer relationships without looking at the individual case, and these are almost never reversed.",
    source: { label: "Ombudsfin annual report 2024", url: "https://www.ombudsfin.be/storage/app/uploads/public/67e/6ab/544/67e6ab544dd9a549547885.pdf" },
  },
  {
    id: "fraud",
    stat: "37.5%",
    statLabel: "of justified fraud complaints resolved, vs 96% for everything else",
    title: "Fraud is where trust breaks",
    body: "Fraud is the biggest complaint category and the one banks settle least. New protections (transfer caps, delays, name-check warnings) add friction, and some shift the blame back to the customer.",
    source: { label: "Ombudsfin annual report 2024", url: "https://www.ombudsfin.be/storage/app/uploads/public/67e/6ab/544/67e6ab544dd9a549547885.pdf" },
  },
  {
    id: "value",
    stat: "€303bn",
    statLabel: "in Belgian savings accounts earning about 0.6%",
    title: "Paying more, earning less",
    body: "Account fees rose again in 2026 while savings stay underpaid. Customers have shown they will move fast: €22bn left for a state bond in a single week in 2023, and Trade Republic now offers a Belgian IBAN.",
    source: { label: "NBB, 2025", url: "https://www.nbb.be/doc/dq/n/dq3/cnf.pdf" },
  },
  {
    id: "reach",
    stat: "2.1M / 4.1M",
    statLabel: "Belgian clients who use KBC Mobile",
    title: "The world's best app, for half the clients",
    body: "KBC Mobile is ranked the world's best banking app, yet about half of Belgian clients don't use it and growth is slowing. Anything that only lives in the app misses them.",
    source: { label: "KBC Annual Report 2025", url: "https://www.kbc.com/content/dam/kbccom/doc/investor-relations/Results/jvs-2025/jvs-2025-grp-en.pdf" },
  },
  {
    id: "moments",
    stat: "2 in 3",
    statLabel: "feel under-informed about home energy rules and premiums",
    title: "Absent at life's money moments",
    body: "First job, first investment, first home, a renovation deadline, a month-end squeeze: the bank shows up afterwards, with a product or a rule. Only about 14% of Kate's sales leads convert, and complex needs still fall to humans.",
    source: { label: "KBC/Ipsos, 2025", url: "https://www.kbc.com/content/dam/kbccom/doc/newsroom/pressreleases/2025/Persbericht%20Batibouw_NL.pdf" },
  },
  {
    id: "exclusion",
    stat: "40%",
    statLabel: "of Belgians aged 16–74 are digitally vulnerable",
    title: "Digital-first leaves people behind",
    body: "Branches and ATMs keep disappearing (382 ATMs per million people vs 654 in the EU), while 80% still say a nearby branch matters. The digitally weakest are also the most exposed to scams.",
    source: { label: "King Baudouin Foundation", url: "https://kbs-frb.be/nl/vier-op-de-tien-belgen-lopen-nog-steeds-risico-op-digitale-uitsluiting" },
  },
];

export const segments: Array<{ name: string; pain: string }> = [
  { name: "Young adults", pain: "Everyday money moves to a second app; investing is learned on social media." },
  { name: "Savers", pain: "Loyal money earning little, while competitors remove the hassle of switching." },
  { name: "Home buyers", pain: "€57k of own money needed and energy-label rules few understand." },
  { name: "Seniors", pain: "35% of over-75s have never been online; branches and cash are receding." },
  { name: "Self-employed", pain: "43% find credit harder to get; 20% don't know whom to talk to." },
  { name: "Stretched households", pain: "38% expect trouble making ends meet; stress shows long before arrears." },
  { name: "Newcomers", pain: "Weeks of paperwork before an account, with little help in English." },
];

// Placeholder until the idea is chosen: what the product does, in three steps.
export const solutionSteps = [
  { title: "Step 1", body: "What the customer experiences first." },
  { title: "Step 2", body: "What our product understands or does." },
  { title: "Step 3", body: "The outcome, and why it builds trust." },
];

export const team: Array<{ name: string; role: string }> = [
  { name: "Team member", role: "Role" },
  { name: "Team member", role: "Role" },
  { name: "Team member", role: "Role" },
];
