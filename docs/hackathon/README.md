# docs/hackathon/

Event material for the Tectonic Hackathon.

- **Tectonic Hackathon - Participants Guide.pdf**: download it from the event platform and save it here. It's gitignored (about 40 MB), so each teammate keeps their own local copy.
- **[SUMMARY.md](SUMMARY.md)**: the challenges, judging, submission checklist, Aikido process and rules from the guide, in text form.
- **PROJECT-CONTEXT.private.md**: gitignored. Fuller version with team credentials and event links, meant for the team's Claude Project context.

## Notes

- **Security is 10% of the score, measured in Aikido.** Participants get access to [Aikido Security](https://www.aikido.dev/), which scans the repo for vulnerable dependencies, leaked secrets, code issues (SAST) and misconfigurations. Connect the repo to Aikido early and fix findings as we go rather than at the end. Basics: no secrets in git (the repo is public), keep dependencies up to date, validate input on API routes, and protect anything that writes data.
