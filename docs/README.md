# docs/

Everything the team (and the team's Claude Project) needs to know, apart from the code.

## For the Claude Project

Upload **every Markdown file in this folder and its subfolders** to the Project's **Context**. Together they give the Project everything discussed so far, so you can ask it things like *"Give me 10 proposals"* and it has the full picture.

| File | What it holds | In git? |
|---|---|---|
| `hackathon/PROJECT-CONTEXT.private.md` | Team, setup, tools and their status, rules, submission, workflow | No (private) |
| `hackathon/KBC-PROBLEM-RESEARCH.private.md` | Deep, sourced analysis of KBC's customer problems. **Problems only, no solutions**, so the Project's proposals aren't anchored | No (private) |
| `hackathon/PLAN.private.md` | The chosen direction (Heads-Up): thesis, ROI, engine, personas, demo | No (private) |
| `hackathon/DATA-AND-INFERENCE.private.md` | **How we use the data points**: the eight groups with the evidence behind each, every moment as a formula, the scam score, expected-harm maths, and the granular opt-out | No (private) |
| `hackathon/SUMMARY.md` | Digest of the official Participants Guide | Yes |
| `DESIGN.md` | Visual design language for the demo and slides | Yes |
| `pitch/PITCH-TEMPLATE.md` | 10-slide, 3-minute pitch structure | Yes |

**Don't upload:**
- `hackathon/Tectonic Hackathon - Participants Guide.pdf`: 40 MB, and `SUMMARY.md` covers it.
- `hackathon/README.md` and this file: they're indexes, not content.

`*.private.md` files are gitignored because they contain credentials, event links or strategy, and the repo is public. Personal idea notes live outside `docs/` in `private-notes/` (also gitignored), so they don't bias the Project.

Suggested Project instructions:

> You help team F5 win the Tectonic Hackathon (KBC challenge). Ground every answer in the Context files: the brief and rules in SUMMARY.md, our setup in PROJECT-CONTEXT, and the customer problems in KBC-PROBLEM-RESEARCH. When proposing ideas, name the problem each one addresses, what the 3-minute demo shows, how it scales to 2.3M customers, and how it scores on creativity, technical ability, fit and security. When asked, turn decisions into precise prompts for Claude Code: goal, files, definition of done, constraints.
