# Brand Foundations Migration Map

This map turns Stage 1 brand decisions into implementation guidance for Stage 2.

## App Ownership

- `apps/branded-domain/branded-domain-site`: public marketing and legal website.
- `apps/portal`: unauthenticated auth pages and authenticated Granville Payments Platform.

## Naming Map

| Surface | Standard |
| --- | --- |
| Marketing header/footer | Granville Finance |
| Marketing page title | Granville Finance |
| Auth page brand lockup | Granville Finance |
| Portal browser title | Granville Payments Platform |
| Portal shell/sidebar product label | Payments Platform |
| Portal workspace/team label | Granville |
| Legal entity references | Keep legal entity language explicit and separate from product naming |

## Token Mapping: Marketing Site

Map Astro theme variables to Granville tokens:

| Astro variable/pattern | Stage 1 token |
| --- | --- |
| `--aw-color-bg-page` | `--granville-color-marketing-background` |
| `--aw-color-bg-page-dark` | `--granville-color-navy-950` |
| dark elevated panels | `--granville-color-navy-900` |
| deep visual panels | `--granville-color-navy-800` |
| primary dark text | `--granville-color-slate-50` |
| muted dark text | `--granville-color-slate-300` or `--granville-color-slate-400` |
| secondary brand accent | `--granville-color-marketing-accent` |
| warm CTA/premium accent | `--granville-color-marketing-premium` |
| warm CTA hover | `--granville-color-gold-400` |
| subtle borders | `--granville-color-border-subtle` |
| focused content width | `--granville-width-focused` |

## Token Mapping: Portal App

Map Shadcn semantic tokens to Granville tokens:

| Portal semantic role | Stage 1 token |
| --- | --- |
| `background` in portal state | `--granville-color-surface-portal` |
| `foreground` on dark | `--granville-color-slate-50` |
| `muted-foreground` | `--granville-color-slate-400` |
| `border` | `--granville-color-border-subtle` |
| `primary` | `--granville-color-gold-300` |
| `primary hover` | `--granville-color-gold-400` |
| informational accent | `--granville-color-product-info-accent` |
| `sidebar` | `--granville-color-navy-950` |
| `sidebar-accent` | `--granville-color-navy-900` |
| `destructive` | `--granville-color-danger` |

## Brand Token Layers

| Layer | Purpose | Canonical tokens |
| --- | --- | --- |
| Brand colors | Canva, logo system, brand assets, and public identity | `--granville-color-brand-primary`, `--granville-color-brand-secondary`, `--granville-color-brand-premium`, `--granville-color-brand-surface` |
| Product UI colors | Application shell, controls, charts, tables, and workflows | `--granville-color-product-*` |
| Marketing colors | Public website and campaign pages | `--granville-color-marketing-*` |

## Color Usage Rules

| Family | Product UI share | Marketing/Canva share | Rule |
| --- | ---: | ---: | --- |
| Navy | 60-70% | 45-60% | Use as the dominant institutional field. `navy-900` is canonical; `navy-950` adds depth; `navy-800` supports panels and cards. |
| Slate | 20-30% | 20-30% | Use for text, light surfaces, quiet borders, muted copy, and metadata. |
| Gold | 5-8% | 5-10% | Use sparingly for premium emphasis, primary actions, selected states, and trust cues. |
| Blue | 2-5% | 10-20% | Use as the secondary brand signal. In product, reserve it for informational accents, charts, integrations, data movement, and infrastructure visuals. |

## Typography Mapping

- Marketing H1: heading font, bold, display scale, restrained tracking.
- Marketing section title: heading font, bold, large but below H1.
- Marketing eyebrow: uppercase only, modest tracking.
- Portal page title: compact `text-2xl` equivalent.
- Portal card title: compact `text-sm` or `text-base`, medium weight.
- Portal table text: prioritize density and scanability.

## Component Migration Priorities

1. Brand head and favicon rules.
2. Logo lockup and icon sizing.
3. Button casing and variants.
4. Card radius, padding, and border rules.
5. Portal semantic token mapping.
6. Marketing hardcoded color migration.
7. Template content cleanup.

## Stage 2 Entry Criteria

Begin component migration only after:

- token names are accepted
- naming hierarchy is accepted
- CTA casing is accepted
- favicon behavior is accepted
- icon usage rules are accepted
