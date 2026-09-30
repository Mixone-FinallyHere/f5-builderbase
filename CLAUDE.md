@AGENTS.md

# F5 - Builderbase (Tectonic Hackathon)

- `app/`, `public/`: the demo site (Next.js). Vercel project `f5-builderbase` (team `ds-projects-430c4cf4`) auto-deploys `main` to https://f5-builderbase.vercel.app. Keep the demo building: run `npm run lint` and `npm run build` before pushing.
- `gcp/`: code that runs on Google Cloud (sponsor credits). Not built by Vercel; excluded from the root tsconfig.
- `docs/hackathon/`: event rules and judging. The participants guide PDF is local only (gitignored); read it or `SUMMARY.md` for constraints.
- `docs/pitch/`, `docs/DESIGN.md`: pitch outline, deck generator, and design tokens.
- The repo is **public**: never commit secrets, keys, or the Google Cloud credit code. Use `.env.local`.
- **Security counts for 10% of the hackathon score, graded via Aikido Security scans** (see `docs/hackathon/README.md`). Write code with that in mind: validate input, authenticate writes, no secrets in git, no vulnerable dependencies.
- **Hackathon brief:** read `docs/hackathon/SUMMARY.md` before product decisions. **We're doing the KBC challenge:** a vision plus a working proof of concept for personalisation that scales to 2.3M+ customers (signals → situation and intent → experiences that adapt across products and channels). Judged on creativity, technical ability (does it work), fit, and security. Submission needs a demo video under 3 minutes, the public repo, Aikido before/after screenshots, and a README covering how to run it and what's unfinished. Code is frozen after submission.
- `*.private.md` files are gitignored team notes (credentials, links); never commit their contents.
- **Git workflow (fork + PRs):** `origin` is the fork `Mixone-FinallyHere/f5-builderbase` (connected to Aikido); `upstream` is `WhiteChair/f5-builderbase` (Vercel deploys its `main`, and its push URL is disabled locally). Work on a branch, push it to `origin`, open a PR into `upstream/main` (`gh pr create`, whose default repo is upstream). After merging, sync the fork: `gh repo sync Mixone-FinallyHere/f5-builderbase && git pull`. The **WhiteChair repo is what we submit**; Aikido scans the fork, so it must be synced before every scan.
