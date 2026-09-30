# F5 - Builderbase

> **Tagline placeholder:** one sentence on who this is for and why it matters.

Hackathon project built with Next.js (App Router), TypeScript and Tailwind CSS v4, deployed on Vercel.

**Live:** https://f5-builderbase.vercel.app · **Repo:** https://github.com/WhiteChair/f5-builderbase

## Quick start

```bash
git clone https://github.com/WhiteChair/f5-builderbase.git
cd f5-builderbase
npm install
npm run dev        # http://localhost:3000
```

Other scripts:

```bash
npm run build      # production build
npm run start      # serve the production build
npm run lint       # type-check (tsc --noEmit)
```

Requires Node.js 20+. Copy `.env.example` to `.env.local` if you add environment variables (never commit secrets).

## Project structure

```
app/            Demo web app (Next.js App Router) — this is what Vercel deploys
public/         Static assets for the demo app
gcp/            Code that runs on Google Cloud (sponsor credits) — not deployed by Vercel
docs/DESIGN.md                    Colour palette, typography, AI design prompt
docs/hackathon/                   Event material: rules, judging criteria, our notes
docs/pitch/PITCH-TEMPLATE.md      Slide-by-slide pitch outline
docs/pitch/build_pitch_deck.py    Generates the 16:9 pitch deck: `pip install python-pptx && python docs/pitch/build_pitch_deck.py`
```

### Deployment

The repo is connected to the Vercel project `f5-builderbase` (team `ds-projects-430c4cf4`). Every push to `main` deploys to production at https://f5-builderbase.vercel.app; pull requests get preview URLs. Vercel builds only the Next.js app from the repo root (`app/`, `public/`); `docs/` and `gcp/` stay in the repo but are not part of the demo site.

## Design

Dark, high-contrast palette — Void `#07080C`, Ink `#10121A`, Volt Violet `#7C5CFF`, Signal Mint `#2DE2C4`, Snow `#F5F6FA`. Fonts: Space Grotesk + Inter. Full details and a ready-to-paste prompt for v0/Claude/Gemini in [docs/DESIGN.md](docs/DESIGN.md).

## Team

| Name | Role | GitHub |
|---|---|---|
| _Your name_ | _e.g. Product / Full-stack_ | [@WhiteChair](https://github.com/WhiteChair) |
| _Teammate_ | _Role_ | [@handle](https://github.com/) |
| _Teammate_ | _Role_ | [@handle](https://github.com/) |

To add collaborators: **Settings → Collaborators → Add people**.

## Hackathon checklist

- [ ] Team formed, roles assigned
- [ ] Problem statement agreed (one sentence)
- [ ] Tagline + project description finalized
- [ ] Collaborators added to the repo
- [ ] Landing page customised (`app/page.tsx`)
- [ ] Core feature / golden path working end-to-end
- [ ] Deployed on Vercel, public URL verified in an incognito window
- [ ] Demo script rehearsed + fallback video recorded
- [ ] Pitch deck filled in (generate with `docs/pitch/build_pitch_deck.py`, see docs/pitch/PITCH-TEMPLATE.md)
- [ ] README updated with live URL, screenshots, and tagline
- [ ] Submission form sent before the deadline

## License

[MIT](LICENSE)
