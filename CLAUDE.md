@AGENTS.md

# Kate Ahead (Tectonic Hackathon, KBC challenge, team F5)

- This repo is the **submission**: only the mobile web app (Next.js App Router) and its engine. Vercel deploys `main` to https://f5-builderbase.vercel.app. Keep `npm run lint` and `npm run build` green.
- Layout: `app/` (pages, API routes), `components/` (the phone UI), `lib/engine/` (types, personas, watchers, gate, profile, skills, population), `lib/chat.ts` (templated conversation, no live AI), `lib/session.ts` (signed cookie).
- `docs/` and `private-notes/` are gitignored on purpose: research, plan, pitch script and event material live there for the team's Claude Project, never in the public repo.
- The repo is **public** and scored by Aikido (10%): no secrets, validate inputs, keep the session-only identity model, keep the security headers.
- Git workflow: `origin` is the fork `Mixone-FinallyHere/f5-builderbase` (Aikido scans it), `upstream` is `WhiteChair/f5-builderbase` (submitted, Vercel). Branch → push to origin → PR into upstream main → sync the fork.
