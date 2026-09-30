# gcp/

Code and config for anything we run on **Google Cloud** during the hackathon: for example, a backend API on Cloud Run, Vertex AI / Gemini calls, data jobs, or storage setup scripts.

## Why a separate folder

The demo site in `app/` is deployed by Vercel. Anything that needs to run on Google Cloud lives here so it stays in the repo and under version control, but is **not** built or deployed by Vercel. The root `tsconfig.json` excludes this folder, so a service here can have its own `package.json` / `requirements.txt` without breaking the Vercel build.

Suggested layout once we know what we need:

```
gcp/
  api/          Cloud Run service (own Dockerfile + dependencies)
  scripts/      One-off setup scripts (create buckets, enable APIs, seed data)
```

## Google Cloud credits

The hackathon's Google Cloud sponsor gives our team a **credit code**, shown on the event platform after the event starts. It's redeemed once in the Google Cloud console (Billing → Credits) against the team's billing account. Once redeemed, the credits apply to whatever project uses that billing account.

## Secrets: never commit them

**This repo is public.** Do not put any of the following in this folder or anywhere else in git:

- the credit code itself
- service-account JSON keys
- API keys

Put local secrets in `.env.local` (already gitignored) and set production values in the Vercel / Google Cloud dashboards. List the variable **names** (no values) in `.env.example` so teammates know what to set.
