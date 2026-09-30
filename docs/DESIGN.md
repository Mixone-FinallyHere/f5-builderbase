# F5 - Builderbase — Design Language

Dark, modern, high-contrast. Confident and technical, but warm — a product built overnight that looks like it took a month.

## Palette

| Role | Name | Hex | Usage |
|---|---|---|---|
| Background | Void | `#07080C` | Page / slide background |
| Surface | Ink | `#10121A` | Cards, panels |
| Surface 2 | Graphite | `#171A25` | Raised cards, hover, inputs |
| Border | Line | `#262A3A` | 1px hairlines |
| Primary accent | Volt Violet | `#7C5CFF` | Primary buttons, links, key numbers |
| Secondary accent | Signal Mint | `#2DE2C4` | Highlights, badges, secondary CTA, charts |
| Text | Snow | `#F5F6FA` | Headings and body |
| Muted | Fog | `#9AA0B4` | Secondary text, captions |
| Success | Go | `#3DDC97` | Success states |
| Warning | Amber | `#FFB020` | Warnings |
| Danger | Coral | `#FF5C7A` | Errors, destructive |

Signature gradient: `linear-gradient(90deg, #7C5CFF, #2DE2C4)` — use only for one hero word/metric per screen.
Ambient glow: radial `rgba(124,92,255,.22)` top-left and `rgba(45,226,196,.12)` top-right over `#07080C`.
Contrast: Snow on Void ≈ 18:1, Fog on Void ≈ 7:1, white on Volt Violet ≈ 4.6:1 (use ≥ 16px / medium weight).

## Typography (free, Google Fonts)

- **Display / headings:** Space Grotesk — weights 500 / 700, tight tracking (-0.02em), line-height 1.05–1.15.
- **Body / UI:** Inter — weights 400 / 500 / 600, line-height 1.5–1.6.
- **Mono (optional):** JetBrains Mono for code and metrics.
- Scale: 72 / 48 / 32 / 24 / 18 / 16 / 14 / 12 px. Max 2 font families per screen.

## Spacing, radius, elevation

- 8px base grid. Spacing steps: 4, 8, 12, 16, 24, 32, 48, 64, 96.
- Radius: 8px (inputs/buttons small), 12px (buttons), 16px (cards), 999px (pills/badges).
- Borders: 1px `#262A3A`; no heavy drop shadows. Elevation = lighter surface + subtle glow (`0 0 40px -8px #7C5CFF`) on primary CTAs only.
- Layout: max width 1152px, generous whitespace, 12-col grid, left-aligned body text, centered hero.

## Tone & voice

Short, direct, active verbs. No buzzwords. One idea per screen. Numbers over adjectives. Playful only in microcopy ("Build it tonight. Ship it by morning.").

## Components

- **Primary button:** `#7C5CFF` fill, white text, 12px radius, glow on hover (brightness 1.1).
- **Secondary button:** `#10121A` fill, 1px `#262A3A` border, Snow text.
- **Card:** `#10121A`, 1px border, 16px radius, 24px padding, 8px-tall mint bar accent optional.
- **Badge/pill:** uppercase 12px, tracking 0.1em, Fog text, dot indicator in Go/Amber/Coral.
- **Motion:** 150–200ms ease-out, opacity/translate only. Respect `prefers-reduced-motion`.

## Ready-to-paste prompt for AI design tools (v0, Claude, Gemini)

```text
Design in a dark, modern, high-contrast style for a hackathon product called "F5 - Builderbase".

COLOR TOKENS (use exactly):
- background #07080C; surface #10121A; raised surface #171A25; border #262A3A
- primary accent (violet) #7C5CFF; secondary accent (mint) #2DE2C4
- text #F5F6FA; muted text #9AA0B4
- success #3DDC97; warning #FFB020; danger #FF5C7A
- signature gradient: linear-gradient(90deg, #7C5CFF, #2DE2C4), used on at most one hero word or metric per screen
- ambient background glow: soft radial violet (rgba(124,92,255,0.22)) top-left and mint (rgba(45,226,196,0.12)) top-right over the dark background

TYPOGRAPHY: Space Grotesk (500/700, tight letter-spacing -0.02em, line-height 1.1) for headings; Inter (400/500/600, line-height 1.6) for body and UI. Type scale 72/48/32/24/18/16/14/12px. Optional JetBrains Mono for code/metrics.

SHAPE & SPACE: 8px spacing grid; radii 8px small, 12px buttons, 16px cards, full pills for badges; 1px hairline borders (#262A3A); no heavy drop shadows — depth comes from lighter surfaces and a subtle violet glow on the primary CTA only. Max content width 1152px, generous whitespace, 12-column grid.

COMPONENTS: primary button = violet fill, white text, 12px radius, glow on hover; secondary button = #10121A fill with hairline border; cards = #10121A, 16px radius, 24px padding; status badges = small uppercase pills with a colored dot; motion = 150–200ms ease-out fades/translates only.

TONE: confident, technical, warm. Short direct headlines with active verbs, one idea per section, numbers over adjectives. Accessible contrast (WCAG AA), visible focus rings in mint (#2DE2C4), responsive mobile-first, semantic HTML, Tailwind CSS.

Build: [DESCRIBE THE SCREEN OR SLIDE HERE].
```
