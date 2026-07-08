# Brand Standardization Plan

Standardizing the Granville brand system across the marketing site
(`apps/website`, Astro/AstroWind) and the product/back-office surfaces
(`apps/portal`, React/Shadcn; `apps/ops-ui`).

## The actual problem: two systems, not drift

The root problem is **not** that hardcoded values drifted apart. It is that
marketing and the product are **two architecturally separate design systems
that only share a color palette underneath.** Standardizing hex values would
leave two well-tokenized systems that still diverge in *meaning* and *feel*.

| Layer | Marketing | Back end | Shared? |
| --- | --- | --- | --- |
| Primitive palette | `--granville-*` | `--granville-*` | ✅ one |
| **Semantic tokens** | `--aw-color-primary/secondary/accent/text-*/bg-page` (AstroWind) | `--background/--primary/--card/--muted/--popover/--sidebar-*/--ring/--destructive` (Shadcn) | ❌ two disjoint vocabularies |
| **Components** | Astro `.btn` pills, `astro-icon` | React/Shadcn + Radix, `cva` | ❌ no shared `libs/ui` |
| **Icons** | `astro-icon` + Tabler | `@radix-ui/react-icons` | ❌ two — and both violate the FinPack icon policy |

"Primary" literally means different things in each app; the two theme files
were hand-authored maps; the component and icon layers are implemented twice.

## Strategy

Define the brand **once at the semantic level** and **project it into each
framework's native idiom** via generated adapters. Raw-hex cleanup falls out
as a side effect, not the goal.

```
brand-foundations.ts (semantic contract, single source of meaning)
        │  npm run brand:generate
        ├── generated/website-theme.css → --aw-*   → --granville-semantic-* → primitives
        └── generated/portal-theme.css  → Shadcn -- → --granville-semantic-* → primitives
```

Each app keeps its native vocabulary, but there is now one owner of what
every semantic role *means*. Change a role once, both surfaces move together.

---

## Stages

### Stage 1 — Author the canonical semantic layer ✅ DONE

The single vocabulary both apps speak. Added a `semantics` block to
[`libs/brand/brand-foundations.ts`](../libs/brand/brand-foundations.ts):

- ~16 **core roles** (`bg`, `bg-deep`, `surface`, `surface-raised`,
  `surface-muted`, `text`, `text-muted`, `text-on-primary`, `primary`,
  `primary-hover`, `accent`, `border`, `border-strong`, `ring`, `danger`,
  `success`, `warning`) resolved per theme: `marketing`, `productLight`,
  `productDark`.
- Product-only systems: **sidebar**, payment-lifecycle **status** (8 states ×
  bg/text/border, light + dark), **chart** series (light + dark).
- **Adapter maps** declaring how each app's native tokens point at core roles.

### Stage 2 — Generate each framework's theme from the contract ✅ DONE

- Generator: [`libs/brand/scripts/generate-theme.ts`](../libs/brand/scripts/generate-theme.ts),
  wired as `npm run brand:generate` in the root `package.json`.
- Output (checked in, never hand-edited):
  - [`libs/brand/generated/website-theme.css`](../libs/brand/generated/website-theme.css)
  - [`libs/brand/generated/portal-theme.css`](../libs/brand/generated/portal-theme.css)
- Rewired consumers:
  - [`apps/portal/src/styles/theme.css`](../apps/portal/src/styles/theme.css) imports the generated file; keeps only layout tokens + Tailwind `@theme inline` plumbing.
  - [`apps/website/src/assets/styles/tailwind.css`](../apps/website/src/assets/styles/tailwind.css) imports the generated file; [`CustomStyles.astro`](../apps/website/src/components/CustomStyles.astro) reduced to `::selection`.

**Verified:** both apps build; the semantic chain resolves in each app's built
CSS (e.g. portal `--primary → --granville-semantic-primary → navy-900` light /
`product-primary-action` dark); status + chart tokens present in light and
dark; the two hand-authored theme files contain zero hardcoded colors. Values
are preserved 1:1 with the pre-migration theme — a re-plumbing, not a restyle.

> Remaining loose end: the `brand:generate` script addition to the root
> `package.json` may still be uncommitted; confirm it is included.

### Stage 3 — Migrate the marketing site to tokens ⬜ TODO

Drive the website's ~74 raw hex/rgba values to zero — inline gradients and
hardcoded colors in [`HomePage.astro`](../apps/website/src/components/granville/HomePage.astro),
[`TrustBand.astro`](../apps/website/src/components/granville/TrustBand.astro),
[`DashboardPreview.astro`](../apps/website/src/components/granville/DashboardPreview.astro),
and residual literals in `tailwind.css`. Verify naming/favicon/logo lockup per
[`migration-map.md`](../libs/brand/migration-map.md).

### Stage 4 — Migrate the back-end surfaces ⬜ TODO

- **Portal:** sweep the ~89 raw values in components onto the semantic tokens.
- **ops-ui:** [`apps/ops-ui/src/ops-ui.ts`](../apps/ops-ui/src/ops-ui.ts) is an
  844-line hand-rolled HTML server with no brand tokens — give it a minimal
  shared stylesheet built from the contract.
- *(Optional sub-track: Go-served surfaces — transactional emails, PDF/
  whitepaper covers, API-doc theme.)*

### Stage 5 — Governance & enforcement ⬜ TODO

- Lint gate banning raw hex/rgba/oklch **and** direct primitive use in
  components (components must consume semantic tokens, not reach past them).
- Lint gate banning non-FinPack icon imports (Tabler, `@radix-ui/react-icons`).
- CI check asserting `npm run brand:generate` output is up to date (generated
  files are committed).
- Extend the icon-governance clause in [`CLAUDE.md`](../CLAUDE.md) with a
  parallel color/type governance rule; gate `libs/brand` via `CODEOWNERS`.

### Stage 6 — Verify & document rollout ⬜ TODO

- Screenshot-diff marketing + portal (light and dark) against baseline.
- Confirm changing one semantic token visibly moves both surfaces.
- Update [`README.md`](../libs/brand/README.md) / [`migration-map.md`](../libs/brand/migration-map.md):
  mark the semantic layer complete; document "how to add a token" and "how to
  consume the generated themes."

---

## Open decisions

- **ops-ui / Go-served surfaces** — in scope for Stage 4, or product front-ends
  only?
- **Component parity (future stage)** — Astro vs React is a hard boundary, so a
  shared `libs/ui` is not realistic short-term. The likely approach is shared
  component *contracts* (button casing/shape, card radius/padding, status
  badge, focus ring) driven off the Stage-1 tokens, with only framework-
  agnostic pieces extracted into `libs/brand`.
