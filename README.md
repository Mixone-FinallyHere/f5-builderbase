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

### Contributing

Day-to-day work happens in the fork [Mixone-FinallyHere/f5-builderbase](https://github.com/Mixone-FinallyHere/f5-builderbase), which is the repo connected to Aikido. Changes reach this repo through pull requests: branch → push to the fork → PR into `WhiteChair/f5-builderbase:main`.

### Deployment

The repo is connected to the Vercel project `f5-builderbase` (team `ds-projects-430c4cf4`). Every push to `main` deploys to production at https://f5-builderbase.vercel.app; pull requests get preview URLs. Vercel builds only the Next.js app from the repo root (`app/`, `public/`); `docs/` and `gcp/` stay in the repo but are not part of the demo site.

## Slides (`/slides`)

Our pitch deck lives in the app at https://f5-builderbase.vercel.app/slides, so everyone presents and edits the same version.

- **Present:** arrow keys or space to move, `F` for fullscreen, `N` for speaker notes. `/slides#5` links to slide 5.
- **Edit:** click **Edit** and enter the team password (`EDIT_PASSWORD` in Vercel). Change text, bullets, images (https URLs) and notes, reorder or add slides, then **Save** (Ctrl+S).
- **Storage:** the deck is saved in Upstash Redis (Vercel Storage), not in the code, so pushes and redeploys don't touch it. Each save keeps the previous version (last 30) under `slides:history`. If two people edit at once, the second save gets a prompt instead of overwriting.
- **Limits:** the free Redis plan allows 500k commands/month. Viewing a slide deck costs 1, a save about 5, and nothing polls, so we're far below the cap.
- **Local dev uses the same database** when `.env.local` has the production values, so saves from localhost change the live deck.
- Until something is saved, the page shows the template from `docs/pitch/PITCH-TEMPLATE.md` (`lib/slides.ts`).

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
- [x] Challenge chosen: **KBC** (personalisation at scale, see [docs/hackathon/SUMMARY.md](docs/hackathon/SUMMARY.md))
- [ ] Problem statement agreed (one sentence)
- [ ] Tagline + project description finalized
- [ ] Collaborators added to the repo
- [ ] Landing page customised (`app/page.tsx`)
- [ ] Core feature / golden path working end-to-end
- [ ] Deployed on Vercel, public URL verified in an incognito window
- [ ] Demo script rehearsed + fallback video recorded
- [ ] Pitch deck filled in (generate with `docs/pitch/build_pitch_deck.py`, see docs/pitch/PITCH-TEMPLATE.md)
- [ ] README updated with live URL, screenshots, and tagline
- [ ] Aikido baseline scan screenshotted, issues fixed, "after" screenshotted
- [ ] Builderbase Overview filled in (all required, editable until the deadline):
  - [ ] Short description
  - [ ] Video link (demo under 3 minutes)
  - [x] GitHub repository link: https://github.com/WhiteChair/f5-builderbase
  - [ ] Aikido screenshots uploaded

## License

[MIT](LICENSE)
