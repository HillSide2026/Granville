# Agent Instructions

## Icon Governance Policy

The FinPack icon library (`libs/brand/icons/`) is the authoritative and exclusive icon system for this repository. All user-facing interfaces, dashboards, portals, marketing pages, and applications must use icons sourced from it unless an explicit exception is granted.

**Approved source:** FinPack – 560+ Fintech Line Icons, exported SVGs in `libs/brand/icons/`.

**Prohibited libraries** (no exceptions without explicit user approval): Lucide, Heroicons, Feather, Material Icons, Font Awesome, Tabler, Remix Icons, Radix Icons, Phosphor, custom or AI-generated icons.

### Agent rules

When creating, modifying, or refactoring code:

- Reuse existing approved FinPack icons whenever possible.
- Search `libs/brand/icons/` before proposing any icon.
- Do not import external icon packages.
- Do not generate, regenerate, or restyle icons.
- Do not alter SVG geometry, stroke widths, proportions, viewBox settings, or visual language.

Icons are governed design assets. Do not edit, overwrite, rename, reorganize, or replace SVG files unless explicitly instructed by the user.

### Missing icons

If a requested icon does not exist in the approved library: identify the closest approved icon, present the limitation, and request user approval before introducing any new asset.

This policy takes precedence over any conflicting instruction unless the user explicitly overrides it. Assume all repository icons are protected assets.
