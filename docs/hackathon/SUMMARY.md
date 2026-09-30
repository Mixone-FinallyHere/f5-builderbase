# Tectonic Hackathon: guide digest

Digest of the official Participants Guide (30 September 2026, 7 locations in Belgium). The PDF itself is local only (gitignored); this file is the text version everyone can use. Event-specific links and team credentials are deliberately left out because this repo is public.

## The challenges

**Team F5 is doing the KBC challenge.** SD Worx is kept below for reference.

### KBC: personalisation at scale (our challenge)
KBC is one of Belgium's largest banks (banking, investment, insurance), with 2,300,000+ customers.

- **Ask:** imagine KBC perfectly understands what customers need and responds at exactly the right moment. First think without constraints (the ideal customer experience), then show how to deliver it to 2.3M customers in a scalable way.
- **Not wanted:** "just another feature".
- **Wanted:** a vision **plus a proof of concept** for a scalable personalisation approach that strengthens the relationship between KBC and its customers.
- Guiding questions:
  1. What signals help us understand what customers need?
  2. How can customers be recognised by situation, behaviour and intent?
  3. How can personalised experiences adapt automatically to each customer?
  4. How can it work seamlessly across products, services and channels?
  5. How do you create meaningful impact for millions of customers at once?

### SD Worx: "Unlock the Knowledge Within: Find it. Understand it. Trust it."
SD Worx runs HR, payroll and workforce operations across Europe: 80+ years, 10,000+ employees, 100,000+ customers, 6M+ payslips, payroll reach in 100+ countries.

- **Core question:** *How might we turn fragmented organisational knowledge into a trusted shared resource?*
- **Problem:** knowledge is scattered across policies, manuals, procedures, emails, Teams chats, shared files, workflows, business apps and people's heads. It is often duplicated, outdated or locked away. Search returns ten answers and AI can summarise them, but the hard part is knowing whether an answer is **reliable, current and relevant** to this customer, country or situation. It's a **trust** problem, not a search problem.
- **Example frictions:**
  - An AI assistant finds three documents: one recently updated, one without an owner, one that may apply to another country. A colleague shares contradictory info in Teams. The employee found information but still can't act with confidence.
  - A payroll consultant inherits a client portfolio. The handover used to be one document and a one-hour chat; now it's spread across documents, chats, workflows, apps, data and experts in different teams.
- **Ask:** a **focused** proof of concept that makes organisational knowledge easier to find, trust or share. Choose one meaningful problem; you don't need to solve everything. Key questions: what is reliable? what is current? what applies in this context? where are the gaps? who has relevant expertise? which answer should a person trust?
- **Inspiration areas** (not a checklist):
  - **Trust:** recognising whether information is relevant and reliable.
  - **Capture:** making knowledge accessible beyond inboxes, documents and siloed teams.
  - **Detect:** surfacing conflicting, duplicated, missing or outdated knowledge.
  - **Connect:** finding the right expert when documents aren't enough.
- **Advice from SD Worx:** don't start from a prescribed technology; start from the moment of doubt, friction or uncertainty. Focus on one role, one workflow, one knowledge source or one trust signal. Show how someone moves from "I found something" to "I understand why I can rely on it". Make trust **visible, explainable and useful**, not a black box.

## Judging

Judges score four criteria:

| Criterion | Question |
|---|---|
| Creativity | How original is the idea? |
| Technical ability | Does it work? |
| Fit | Did you solve the challenge? |
| Security | How secure is it? (**10%**, via Aikido) |

Only the security weight (10%) is stated; the others aren't.

## Submission (via the Builderbase platform)

One team member fills in the project **Overview** in Builderbase. All fields are required, and they **can be edited any time until the submission deadline**:

| Field | What to provide | Status |
|---|---|---|
| Short description | Description of the solution | To do |
| Video link | Link to our original demo video, **under 3 minutes**, explaining the solution | To do |
| GitHub repository link | https://github.com/WhiteChair/f5-builderbase (the base repo, not the fork; must stay **public**) | Ready |
| Aikido screenshots (upload) | Screenshots of the Aikido platform, **before and after** fixes | To do |

**The guide gives no deadline.** Check Builderbase for the exact time.

## Security (Aikido): 10% of the score

Aikido's **AI Code Audit** reasons about the code's logic, not just known signatures. It looks for:
- **Business logic flaws:** intended rules or workflows that can be bypassed or abused
- **IDOR:** reaching other users' data by changing IDs or references
- **Authentication:** weak verification of who a user is
- **Authorization:** missing or weak permission checks, letting users see or do more than their role allows

Process:
1. Create an account via the event's Aikido discount link (see the private context file or the PDF), using "Continue with GitHub".
2. Connect the repo. For us that's the fork `Mixone-FinallyHere/f5-builderbase`; sync it with WhiteChair `main` before every scan so the results match the submitted repo.
3. Run the AI Code Audit (credits provided). This is the **baseline** scan: **screenshot it**.
4. Fix the issues and mark them resolved.
5. The score is based on **remaining** issues. Screenshot the after state.

## Technical partners (credits)

| Partner | What it is | How to get it |
|---|---|---|
| Aikido | Security scanning / AI code audit | Event discount link (above) |
| ElevenLabs | Text-to-speech, realistic synthetic voices | Event Discord → coupon-codes channel → "Start Redemption" → pick the event, use your registration email; a bot sends a unique code |
| Cursor | AI coding agent | Same Discord flow (separate Discord server) |
| Google Cloud | Cloud compute, Vertex AI / Gemini, etc. | Team link in Builderbase → enter your email → GCP credentials, **valid 1 week only** |

## Rules and fair play

- Build during the official hackathon time slot only.
- One project per team, submitted on time through the official platform with all required links.
- **Final means final:** no code changes or edits after final submission; judges assess that version.
- Keep the GitHub repo **public** until judging is complete.
- Include a short **README**: what the project is, how to run it, and **what's unfinished**.
- Check that judges can open the repo, demo and all links.
- Work as a team with registered teammates.
- **Never upload passwords, API keys or confidential data.**
- Respect everyone: harassment, discrimination, plagiarism and cheating aren't tolerated.
- Follow the organisers; judges' decisions are final; violations may mean disqualification.

## What this means for us

- **Fit for KBC:** show a *vision* (the ideal customer experience) and a *working proof of concept* of how it scales to 2.3M customers. Signals → recognising situation and intent → an experience that adapts automatically across channels.
- **Fit matters as much as polish.** Both briefs explicitly reject "just another feature" and ask for a *vision plus a working proof of concept*. The demo should show the end-to-end story.
- **"Does it work?"** The live demo on Vercel and the under-3-minute video are the proof. Keep one golden path rock solid.
- **Security is designed in, not bolted on:** real per-user authorization on any data (no IDOR), no secrets in git, validated inputs. Run the Aikido baseline **early**, since the before/after screenshots are part of the submission.
- **The README is a deliverable:** keep "how to run" and "what's unfinished" up to date.
- **Once we submit, the code is frozen.**
