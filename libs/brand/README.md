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
- Tone: institutional, treasury-oriented, precise, restrained

## How To Use In Stage 2

Stage 2 should import or mirror these values into each app's native styling layer:

- Astro marketing site: map CSS variables into the existing `--aw-*` theme variables.
- Portal app: map CSS variables into Shadcn semantic tokens in `src/styles/theme.css`.
- Shared icon and favicon behavior should continue using the bank icon geometry defined during Stage 1.
