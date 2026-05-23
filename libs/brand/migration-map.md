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
| `--aw-color-bg-page-dark` | `--granville-color-navy-950` |
| dark elevated panels | `--granville-color-navy-900` |
| deep visual panels | `--granville-color-navy-800` |
| primary dark text | `--granville-color-slate-50` |
| muted dark text | `--granville-color-slate-300` or `--granville-color-slate-400` |
| warm CTA/accent | `--granville-color-gold-300` |
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
| `sidebar` | `--granville-color-navy-950` |
| `sidebar-accent` | `--granville-color-navy-900` |
| `destructive` | `--granville-color-danger` |

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

