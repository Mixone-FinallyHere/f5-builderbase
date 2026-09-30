@AGENTS.md

# F5 - Builderbase (Tectonic Hackathon)

- `app/`, `public/`: the demo site (Next.js). Vercel project `f5-builderbase` (team `ds-projects-430c4cf4`) auto-deploys `main` to https://f5-builderbase.vercel.app. Keep the demo building: run `npm run lint` and `npm run build` before pushing.
- `gcp/`: code that runs on Google Cloud (sponsor credits). Not built by Vercel; excluded from the root tsconfig.
- `docs/hackathon/`: event rules and judging. The participants guide PDF is local only (gitignored); read it or `SUMMARY.md` for constraints.
- `docs/pitch/`, `docs/DESIGN.md`: pitch outline, deck generator, and design tokens.
- The repo is **public**: never commit secrets, keys, or the Google Cloud credit code. Use `.env.local`.
