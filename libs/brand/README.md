# Granville Brand Foundations

This library is the Stage 1 source of truth for Granville brand standards.

It does not render UI and should not depend on Astro, React, Shadcn, Tailwind, or app-specific component libraries. Its purpose is to give both frontends a shared vocabulary before Stage 2 component migration.

## Files

- `brand-foundations.ts` - typed source of truth for naming, tokens, typography, spacing, components, favicon rules, and voice.
- `index.ts` - stable import surface for brand foundations.
- `css-vars.css` - framework-neutral CSS custom properties derived from the Stage 1 token decisions.
- `migration-map.md` - implementation notes for mapping the Astro marketing site and portal app onto these standards.

## Stage 1 Rules

- Public company brand: `Granville Finance`
- Authenticated product brand: `Granville Payments Platform`
- Workspace label: `Granville`
- Core mark: treasury/bank icon
- Public favicon state: light background
- Portal favicon state: dark navy background
- Primary brand color: `brand-navy-900` / `#07111f`
- Secondary brand color: `brand-blue-400` / `#38bdf8`
- Premium accent: `brand-gold-300` / `#d5bf9b`
- Primary surface: `brand-slate-50` / `#f8fafc`
- Tone: institutional, treasury-oriented, precise, restrained

## Color System

The canonical Granville brand system has three layers:

- Brand colors: navy, blue, gold, and slate. These govern Canva assets, logo variants, public brand expression, and identity-level decisions.
- Product UI colors: navy, slate, and gold remain the dominant application aesthetic. Blue is available as a controlled informational accent for charts, data movement, integration states, and infrastructure visuals.
- Marketing site colors: navy remains the primary field, slate carries text and light surfaces, blue can appear more visibly as the secondary brand signal, and gold stays premium and selective.

Recommended product UI usage:

| Family | Share | Rule |
| --- | ---: | --- |
| Navy | 60-70% | Dominant shell, background, and card environment. |
| Slate | 20-30% | Text, borders, muted metadata, and light surfaces. |
| Gold | 5-8% | Primary actions, selected states, and premium emphasis. |
| Blue | 2-5% | Informational accents, charts, integrations, and data flow. |

Recommended marketing and Canva usage:

| Family | Share | Rule |
| --- | ---: | --- |
| Navy | 45-60% | Brand grounding and high-confidence fields. |
| Slate | 20-30% | Light surfaces, inverse text, and readability. |
| Blue | 10-20% | Secondary brand recognition, infrastructure energy, and links. |
| Gold | 5-10% | Premium restraint, trust cues, and high-value highlights. |

## How To Use In Stage 2

Stage 2 should import or mirror these values into each app's native styling layer:

- Astro marketing site: map CSS variables into the existing `--aw-*` theme variables.
- Portal app: map CSS variables into Shadcn semantic tokens in `src/styles/theme.css`.
- Shared icon and favicon behavior should continue using the bank icon geometry defined during Stage 1.
