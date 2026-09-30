# Kate Ahead

> Your bank warns you before things go wrong, on data it already holds, and explains why.

A concept for the **KBC challenge** at the Tectonic Hackathon 2026 (team F5): personalisation that acts *for* the customer ahead of time, instead of selling to them after the fact.

**Live demo:** https://f5-builderbase.vercel.app · **Repo:** https://github.com/WhiteChair/f5-builderbase

Five invented customers, no real data, no live AI agent. Everything a customer sees is computed by rules over data a bank-insurer already stores, and every reply is a template over verified facts.

## Try it

Open the link on a phone (or in a browser; on a desktop it renders in a phone frame). Pick a customer:

| Customer | What just happened | What Kate Ahead catches |
|---|---|---|
| Lien & Tom, 31 | Signed the compromis for a €385k house, label E | The purchase analysed as a whole (bundle vs standalone with the 2024 switch right, EPC renovation obligation and energy loan, 2% duty); insure the rebuild value; the renovation clock |
| Marc, 64 | Confirmed his retirement date; his group hospitalisation cover ends that day | The continuation right, 5 months early (adviser confirms); ID expiry in 41 days; a term deposit maturing; idle savings |
| Ayşe, 24 | Paid abroad with another app again; 25th birthday in 38 days | The fee cliff at 25 with the tier that fits her usage; money drifting to Revolut; idle savings |
| Jos, 72 | Tapped a parcel-scam link, enrolled a new device, is about to send €2,850 | The scam stopped in the moment with reason codes, delivered by phone too; a premium rise at the policy anniversary |
| Nadia, 38 | Her client pays late; VAT is due on the 20th; she bought a car | A shortfall projected 10 days ahead; the car with no motor cover; the income-protection gap |

On their Overzicht, a notification leads into **Kate Ahead**: the moments appear one by one. Tap **Why?** to see the exact data points behind each, tap an option, ask Kate a question (typed or spoken), send a photo or video, open **Profiel** to see the living profile, or **Privacy** to switch data groups on and off. **Meer** documents the skills, the harness and the guardrails.

To install it like an app on a phone: open the link, then *Share → Add to Home Screen*.

## Run it locally

```bash
git clone https://github.com/WhiteChair/f5-builderbase.git
cd f5-builderbase
npm install
npm run dev        # http://localhost:3000
```

Node.js 20+. Copy `.env.example` to `.env.local` and set `SESSION_SECRET` (any long random string); nothing else is needed. `npm run build` and `npm run lint` (type-check) must pass.

## How it works

```
signals (data the bank already holds)
   → situation record per customer
   → skills (8 watchers) produce moments with evidence, lead time, expected harm, options
   → consent gate (per data group) + cap of 4 on screen
   → templates render Kate's message
   → app card / adviser / phone script
```

**Eight data groups**, all of which a bank-insurer already stores to run accounts and policies. Nothing new is collected.

| Group | Data points | Can be switched off |
|---|---|---|
| A Identity & compliance | ID expiry, KYC review date, missing documents | No (AML/KYC duty) |
| B Accounts & payments | Balance trajectory, inflows, recurring debits, new payees, amount vs usual, name-check result, outflows to other apps | Yes |
| C Products & pricing | Account tier vs feature use, rates held, deposits, loans, renovation drawdowns | Yes |
| D Insurance | Policies, insured capital vs rebuild value, group vs individual cover, anniversaries, premium changes | Yes |
| E Life stage & household | Age, household, employment, pension horizon, home ownership, energy label, flood zone | Yes |
| F Behaviour & channel | Logins, repeated screens, abandoned flows, searches, calls | Yes (the most personal) |
| G Device & security | New device, SMS link timing, pending transfer signals | No (fraud monitoring is a legal duty under PSR) |
| H External calendars & rules | Renovation obligation, switch window, medical index, tariff changes | Yes |

**The skills** (`lib/engine/watchers.ts`, described as data in `lib/engine/skills.ts`):

| Skill | Tier | Fires when |
|---|---|---|
| Deadline | 0 | ID expiry ≤ 60 days; KYC document missing; renovation obligation |
| Cover | 0 | Group hospitalisation ending ≤ 200 days; medical-index rise ≤ 45 days; insured capital < 90% of rebuild value or renovation after last valuation; car paid, no motor policy; self-employed, no income protection; flood zone |
| Cash-flow | 1 | 30-day projection `balance + inflows − recurring debits`, minimum < 0 |
| Risk | 2 | Logistic score on five reason codes (new device +2.2, SMS link +2.0, new payee +1.2, amount > 3× usual +1.0, name check not green +1.5, intercept −3), fires above p = 0.6; always on |
| Drift | 1 | Outflows to other apps: last 3 months > 2× first 3 and > €200 |
| Value | 0 | Fee cliff at 25 with best-fit tier; savings ≥ €5k at ≤ 1% for 12+ months; deposit maturing ≤ 30 days |
| Credit | 1 | Notary deposit + mortgage quote: duty, LTV, bundle vs standalone over the switch window, energy loan vs mortgage, rebuild value |
| Behaviour | 1 | Same screen opened 3 times in a week |

Tier 0 is calendars and facts (deterministic), tier 1 is patterns over transactions (no training), tier 2 is one score with reason codes. No model prices insurance or decides credit.

**Consent** is a set of data groups. The dial's four presets (Only the essentials → My products → My money patterns → How I use the app) are presets over that set; every group can also be toggled alone. A moment is shown only if every group in its evidence is allowed, and the app lists what Kate will no longer catch when a group is switched off (`lib/engine/gate.ts`).

**Kate's conversation** (`lib/chat.ts`): a keyword classifier maps the message to a fixed intent (act, explain, consent, adviser, profile, media received, acknowledge, unclear); the engine validates the slots; templates render the reply. Anything outside those intents answers "This demo has no live AI agent yet." In production the classifier would be a small model forced to call one tool with the same schema, and a factual answer would be discarded if it contained a number not in the fact sheet or claimed an action. The templates and validation would not change.

**A photo or video** sent to Kate stays in the browser. Kate replies with the transcript she understood (browser speech recognition), that identity could not be verified by face recognition, and that it was forwarded to a human.

## Security

- The signed-in customer comes only from a signed, httpOnly session cookie; no customer id is accepted in a URL or body on data routes (no IDOR).
- All inputs are validated and capped; the chat is rate-limited per session.
- Security headers on every route: CSP, `frame-ancestors 'none'`, nosniff, referrer policy, permissions policy (camera and microphone same-origin only), HSTS.
- No secrets in the repo; the only environment variable is `SESSION_SECRET`.
- Nothing a customer records leaves the browser.

## What's unfinished

- No live language model: replies are templated and the classifier is keyword-based (by design for this demo).
- All customers and the 50,000-customer scale view are synthetic and seeded; production would read the bank's own data and parameters (the demo's estimates are marked as such in `lib/engine/watchers.ts`).
- The adviser, phone and email channels are simulated as confirmations; there is no persistence between sessions.
- Dutch labels in the app chrome with English content, to keep one demo language.

## Team

Team F5: Miguel Terol (@Mixone-FinallyHere) and teammates. Built during the Tectonic Hackathon, 30 September 2026.

## License

[MIT](LICENSE)
