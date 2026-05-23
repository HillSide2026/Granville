# Design System Stage 1: Brand Foundations

## Purpose

Stage 1 establishes the shared Granville brand layer before broad UI implementation. The goal is to make the Astro marketing site and the portal/dashboard app feel like one institutional financial infrastructure product without redesigning either application prematurely.

## Scope

This stage is documentation, token definition, and decision-making. It should produce implementation-ready standards for:

- brand naming and product architecture
- favicon, logo, and icon usage
- color tokens
- typography rules
- spacing, radius, and elevation rules
- CTA and component language
- voice and messaging standards

Stage 1 should not include broad component rewrites. Any implementation should be limited to proving that the standards are technically usable.

## Naming Architecture

Define the official hierarchy:

- Company brand: `Granville Finance`
- Authenticated product: `Granville Payments Platform`
- Short product label: `Payments Platform`
- Workspace label: `Granville`
- Capability labels: `Treasury`, `Payments`, `Operations`, `Compliance`, `Security`

Rules:

- Public marketing, legal, auth entry, and company pages should use `Granville Finance`.
- Authenticated application shell, manifests, and browser title should use `Granville Payments Platform`.
- Sidebar/team switcher may use `Granville` only as a workspace or organization label.
- Avoid vague product labels such as `Platform` when a more specific label is possible.

## Visual Identity Standards

Define the treasury/bank mark as the core institutional icon.

Rules:

- The same bank icon geometry is used everywhere.
- Public/marketing/auth favicon uses a light background.
- Authenticated portal favicon uses a dark navy background.
- The icon itself remains monochrome and stroke-based.
- Logo lockups should use icon plus text where space allows.
- Marketing and portal should share icon sizing rules:
  - 16px for compact UI
  - 20px for nav items
  - 24px for auth/header brand lockups
  - 32px+ only for app icons or touch assets

## Color Token Specification

Define a shared Granville palette independent of framework defaults.

Proposed tokens:

- `brand-navy-950`: deepest page background
- `brand-navy-900`: elevated dark surface
- `brand-navy-800`: active dark surface
- `brand-slate-50`: primary text on dark
- `brand-slate-300`: secondary text on dark
- `brand-slate-500`: muted text and borders
- `brand-gold-300`: restrained institutional accent
- `brand-gold-400`: primary CTA/accent hover
- `brand-border-subtle`: low-contrast dark border
- `brand-surface-public`: light favicon/auth background
- `brand-surface-portal`: dark portal favicon/app chrome

Acceptance criteria:

- Astro and portal can map their existing styling systems to the same token names.
- Hardcoded homepage colors have a migration path.
- Shadcn semantic tokens have a Granville mapping.

## Typography Specification

Define shared type rules:

- Primary display headings: restrained, high confidence, no decorative treatment.
- Section eyebrows: uppercase allowed, modest tracking only.
- Portal headings: compact, scan-friendly, sentence case.
- Body copy: plain, institutional, readable.
- Button text: choose one casing standard before Stage 2. Recommendation: sentence case.

Initial standard:

- Public H1: large display, bold, tight but readable.
- Public section title: bold, strong hierarchy.
- Portal page title: `text-2xl`, bold, tight tracking.
- Portal card title: small/medium, functional.
- Avoid negative letter spacing inside compact controls.

## Spacing, Radius, and Elevation

Define density rules:

- Marketing section container: centered, shared max-width.
- Portal shell: 8px grid, dense but breathable.
- Icon/text gap: 8px.
- Card padding:
  - portal: 16-24px
  - marketing: 24-32px
- Radius:
  - portal cards/buttons: 8-12px
  - marketing cards: up to 24px
  - large CTA panels may exceed this only when intentional
- Elevation should be subtle; avoid glossy SaaS shine in portal surfaces.

## Button Standards

Define cross-app button roles:

- Primary marketing CTA
- Secondary marketing CTA
- Portal primary action
- Portal secondary/outline action
- Destructive action
- Link action

Rules:

- Public CTAs may be more expressive but must use Granville tokens.
- Portal actions should prioritize clarity and operational trust.
- Button labels should use consistent casing.
- Social auth buttons may retain third-party icon colors, but the surrounding UI remains restrained.

## Card Standards

Define card types:

- Marketing product card
- Marketing CTA panel
- Portal metric card
- Portal table/card container
- Auth card

Rules:

- Marketing cards may use subtle translucent surfaces.
- Portal cards should be quieter, flatter, and more information-dense.
- Dashboard metric cards should prioritize numeric/status clarity over decoration.
- Hover states should be restrained.

## Voice and Messaging Standards

Approved tone:

- institutional
- treasury-oriented
- infrastructure-focused
- calm
- precise
- operator-grade

Preferred terms:

- treasury
- payments
- operations
- compliance
- security
- settlement
- providers
- reconciliation
- controlled access

Avoid or limit:

- game-changing
- revolutionise
- powerful platform
- generic SaaS claims
- playful or overly promotional language

## Deliverables

Stage 1 is complete when the repo has:

- a documented naming hierarchy
- a documented token proposal
- favicon/logo/icon rules
- typography, spacing, button, and card standards
- voice and messaging rules
- a short migration checklist for Stage 2

Optional technical proof:

- add token names to one shared reference file or doc
- map portal semantic tokens to proposed Granville tokens in documentation
- map marketing hardcoded values to proposed token names in documentation

## Implemented Artifacts

Stage 1 foundations live under `libs/brand/`:

- `libs/brand/brand-foundations.ts` defines the typed source of truth for naming, favicon behavior, icon rules, colors, typography, spacing, radius, elevation, components, and voice.
- `libs/brand/css-vars.css` exposes framework-neutral CSS variables that Astro and the portal can map into their native styling systems during Stage 2.
- `libs/brand/migration-map.md` documents how the Astro marketing site and Shadcn portal should map existing styles, names, and semantic roles to the Stage 1 standards.

These files are intentionally framework-neutral. They should guide Stage 2 implementation without forcing either app to rewrite its component stack.

## Acceptance Criteria

- A designer or engineer can answer which brand name to use on any surface.
- Favicon behavior is specified for public and authenticated states.
- Button, card, typography, and icon usage have clear rules.
- Stage 2 can begin without debating foundational brand decisions.

## Out of Scope

- full redesign
- broad component migration
- replacing Shadcn primitives
- rebuilding the marketing homepage
- changing product functionality
