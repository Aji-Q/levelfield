# LevelField web brand specification

## Redesign record

- **Mode:** Redesign · Preserve
- **Preserve:** metrology-report identity, warm dark palette, LevelField spirit-level glyph,
  evidence-first language, routes, scoring semantics, form order, accessibility semantics.
- **Improve:** hackathon story in the first viewport, real proof points, snapshot freshness,
  responsive tables, assessment onboarding, interaction feedback, mobile hierarchy.
- **Remove:** the unsupported implication that the static DreamDEX cache is a live feed.
- **Protected contracts:** `/`, `/market/[marketId]`, `/methodology`, `/assess`; score and band
  meanings; contract field names/order; legal scope copy.
- **Highest-risk change:** the landing page became a wider presentation surface while long-form
  evidence pages remain constrained reading surfaces.
- **Rollback:** commit history retains the original list-first implementation; the data and route
  contracts did not change.

## Design read

```yaml
artifact: analytics product + hackathon demonstration site
audience: DreamDEX/Somnia judges, prediction-market builders, agent developers
visual-language: forensic field notebook / premium cartographic instrument
mode: preserve
visual-variance: 6/10
motion-intensity: 3/10
information-density: 7/10
asset-dependence: 5/10
brand-fidelity: 9/10
```

## System

- **Palette:** warm black `#0a0a08`, raised black `#171610`, bone `#eeeae1`, secondary
  `#aaa497`, accessible muted text `#8c8579`, restrained brass `#d0a24c`.
- **Typography:** Instrument Serif for display; IBM Plex Sans for prose and controls; IBM Plex
  Mono for scores, metadata, labels, and measurement language.
- **Spacing:** 4px base with primary intervals of 8/12/16/24/32/48/64/96.
- **Radius:** near-square 0–2px. The product should feel measured and precise, not soft-card SaaS.
- **Elevation:** borders and tonal planes instead of drop shadows.
- **Motion:** one 620ms hero reveal and small 160–180ms state transitions; all disabled by
  `prefers-reduced-motion`.

## Assets

| Role | Path | Notes |
|---|---|---|
| Brand glyph | `apps/web/public/brand/level-glyph.svg` | Existing spirit-level identity externalized as an asset |
| Hero visual | `apps/web/public/brand/levelfield-risk-field.webp` | Garden/GPT Image 2 Mode B output, 1536×1024 source, 103 KB WebP |
| Generation prompt | `garden-gpt-image-2/prompt/levelfield-risk-field-20260820.md` | Reproducible structured prompt |

The hero visual contains no text or fabricated data. All claims, scores, market facts, and calls
to action remain real HTML rendered from repository data.
