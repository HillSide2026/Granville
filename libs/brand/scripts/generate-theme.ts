// Generates each app's native theme CSS from the single semantic contract
// defined in ../brand-foundations.ts. Run with:
//
//   node --experimental-strip-types libs/brand/scripts/generate-theme.ts
//
// Outputs (checked in, never hand-edited):
//   ../generated/website-theme.css   AstroWind `--aw-*` mapped onto semantics
//   ../generated/portal-theme.css     Shadcn `--*` mapped onto semantics
//
// The point: "primary", "surface", "text" resolve through one shared
// `--granville-semantic-*` layer, so marketing and product cannot drift
// in meaning — only the primitives they point at change per theme.

import { writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { granvilleBrand } from "../brand-foundations.ts";

const here = dirname(fileURLToPath(import.meta.url));
const outDir = join(here, "..", "generated");

const { semantics } = granvilleBrand;

const BANNER =
  "/* GENERATED from libs/brand/brand-foundations.ts by scripts/generate-theme.ts.\n" +
  "   Do not edit by hand — run `npm run brand:generate` at the repo root. */\n\n";

// Resolve a contract value to a CSS value.
// Bare token keys become var(--granville-color-*); literal colors pass through.
function resolve(value: string): string {
  if (/^(#|rgb|rgba|oklch|hsl|color-mix|var\()/.test(value)) return value;
  return `var(--granville-color-${value.replace(/^brand-/, "")})`;
}

function declarations(entries: Record<string, string>, prefix: string, indent = "  "): string {
  return Object.entries(entries)
    .map(([k, v]) => `${indent}${prefix}${k}: ${resolve(v)};`)
    .join("\n");
}

// Emit `--granville-semantic-<role>: <value>;` lines for one core theme.
function semanticBlock(theme: Record<string, string>, indent = "  "): string {
  return declarations(theme, "--granville-semantic-", indent);
}

// Emit native adapter lines: `<nativeToken>: var(--granville-semantic-<role>);`
function adapterBlock(adapter: Record<string, string>, indent = "  "): string {
  return Object.entries(adapter)
    .map(([token, role]) => `${indent}${token}: var(--granville-semantic-${role});`)
    .join("\n");
}

// ── Website (marketing) ──────────────────────────────────────────────
// The marketing site presents a single dark field, so `:root` and `.dark`
// resolve identically. Fonts are mapped here too for a single source.
function buildWebsite(): string {
  const fonts = [
    "  --aw-font-sans: var(--granville-font-sans);",
    "  --aw-font-serif: Georgia;",
    "  --aw-font-heading: var(--granville-font-heading);",
  ].join("\n");

  return (
    BANNER +
    ":root,\n.dark {\n" +
    "  /* Semantic core — marketing theme */\n" +
    semanticBlock(semantics.core.marketing) +
    "\n\n  /* AstroWind adapter */\n" +
    fonts +
    "\n" +
    adapterBlock(semantics.adapters.astrowind) +
    "\n}\n"
  );
}

// ── Portal (product) ─────────────────────────────────────────────────
// `:root` is the light product theme, `.dark` the dark product theme.
// Shadcn tokens point at the semantic layer once (in `:root`) and follow
// it into dark automatically. Sidebar / status / chart are product-only
// systems emitted directly under their consumed names.
function statusBlock(set: Record<string, { bg: string; text: string; border: string }>, indent = "  "): string {
  return Object.entries(set)
    .map(([state, c]) =>
      [
        `${indent}--portal-status-${state}-bg: ${resolve(c.bg)};`,
        `${indent}--portal-status-${state}-text: ${resolve(c.text)};`,
        `${indent}--portal-status-${state}-border: ${resolve(c.border)};`,
      ].join("\n"),
    )
    .join("\n");
}

function chartBlock(series: readonly string[], indent = "  "): string {
  return series.map((c, i) => `${indent}--chart-${i + 1}: ${resolve(c)};`).join("\n");
}

function buildPortal(): string {
  return (
    BANNER +
    ":root {\n" +
    "  /* Semantic core — product light */\n" +
    semanticBlock(semantics.core.productLight) +
    "\n\n  /* Sidebar (dark treatment in both modes) */\n" +
    declarations(semantics.sidebar.base, "--") +
    "\n\n  /* Payment status — light */\n" +
    statusBlock(semantics.status.light) +
    "\n\n  /* Charts — light */\n" +
    chartBlock(semantics.chart.light) +
    "\n\n  /* Shadcn adapter (points at the semantic layer; follows it into .dark) */\n" +
    adapterBlock(semantics.adapters.shadcn) +
    "\n}\n\n" +
    ".dark {\n" +
    "  /* Semantic core — product dark */\n" +
    semanticBlock(semantics.core.productDark) +
    "\n\n  /* Sidebar override */\n" +
    declarations(semantics.sidebar.darkOverrides, "--") +
    "\n\n  /* Payment status — dark */\n" +
    statusBlock(semantics.status.dark) +
    "\n\n  /* Charts — dark */\n" +
    chartBlock(semantics.chart.dark) +
    "\n}\n"
  );
}

mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "website-theme.css"), buildWebsite());
writeFileSync(join(outDir, "portal-theme.css"), buildPortal());

process.stdout.write("Generated libs/brand/generated/{website-theme,portal-theme}.css\n");
