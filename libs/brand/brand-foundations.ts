export const granvilleBrand = {
  names: {
    company: "Granville Finance",
    authenticatedProduct: "Granville Payments Platform",
    shortProduct: "Payments Platform",
    workspace: "Granville",
    capabilityLabels: ["Treasury", "Payments", "Operations", "Compliance", "Security"],
  },

  favicon: {
    publicState: {
      description: "Light background Granville arrow mark for marketing and unauthenticated pages.",
      background: "brand-surface-public",
      foreground: "brand-navy-950",
    },
    portalState: {
      description: "Dark navy background Granville arrow mark for authenticated portal pages.",
      background: "brand-surface-portal",
      foreground: "brand-slate-50",
    },
    rule: "Use identical mark geometry across all favicon variants. Only background and foreground color treatment changes.",
  },

  iconography: {
    coreMark: "granville-arrow",
    style: "monochrome stroke-based line icon",
    sizesPx: {
      compact: 16,
      navigation: 20,
      brandLockup: 24,
      appIconMinimum: 32,
      appleTouchIcon: 180,
    },
    rules: [
      "Use Granville institutional icons for domain navigation, dashboard metrics, auth branding, and product cards.",
      "Use utility icon libraries only for generic UI controls such as chevrons, close buttons, sort indicators, and menus.",
      "Icons should inherit currentColor unless representing third-party social providers.",
    ],
  },

  colors: {
    "brand-navy-950": "#03080e",
    "brand-navy-900": "#07111f",
    "brand-navy-800": "#0b1931",
    "brand-slate-50": "#f8fafc",
    "brand-slate-100": "#e5edf5",
    "brand-slate-300": "#b8c6d6",
    "brand-slate-400": "#94a3b8",
    "brand-slate-500": "#64748b",
    "brand-blue-400": "#38bdf8",
    "brand-gold-300": "#d5bf9b",
    "brand-gold-400": "#c8ad7f",
    "brand-border-subtle": "rgba(184, 198, 214, 0.12)",
    "brand-border-strong": "rgba(184, 198, 214, 0.22)",
    "brand-surface-public": "#f8fafc",
    "brand-surface-portal": "#07111f",
    "brand-danger": "#dc2626",
    "brand-success": "#16a34a",
    "brand-warning": "#d97706",
  },

  colorRoles: {
    brand: {
      primary: "brand-navy-900",
      secondary: "brand-blue-400",
      premiumAccent: "brand-gold-300",
      primarySurface: "brand-slate-50",
      rule: "Brand assets, logos, Canva templates, and public identity systems should start from navy, blue, gold, and slate.",
    },
    productUi: {
      background: "brand-navy-900",
      backgroundDeep: "brand-navy-950",
      card: "brand-navy-800",
      foreground: "brand-slate-50",
      mutedForeground: "brand-slate-400",
      primaryAction: "brand-gold-300",
      informationalAccent: "brand-blue-400",
      rule: "Product UI keeps the institutional navy, slate, and gold aesthetic; blue is reserved for informational accents, charts, data flow, and system activity.",
    },
    marketing: {
      background: "brand-navy-900",
      foreground: "brand-slate-50",
      primaryAccent: "brand-blue-400",
      premiumAccent: "brand-gold-300",
      lightSurface: "brand-slate-50",
      rule: "Marketing can use blue more visibly than the product UI, while gold remains premium and selective.",
    },
  },

  colorUsage: {
    productUiPercentages: {
      navy: "60-70%",
      slate: "20-30%",
      gold: "5-8%",
      blue: "2-5%",
    },
    marketingPercentages: {
      navy: "45-60%",
      slate: "20-30%",
      blue: "10-20%",
      gold: "5-10%",
    },
    rules: [
      "Navy is the dominant institutional field; use navy-900 as the canonical brand color, navy-950 for depth, and navy-800 for product surfaces.",
      "Blue is the secondary brand color for Canva assets, logo variants, links, infrastructure visuals, integrations, data movement, and informational UI accents.",
      "Gold is a restrained premium accent for primary product actions, selected states, trust cues, and high-value marketing details.",
      "Slate carries readability through text, light surfaces, quiet borders, muted metadata, and inverse foreground treatments.",
    ],
  },

  // ── Semantic contract (single source of meaning) ─────────────────
  // One canonical set of semantic roles, resolved per theme. Each app's
  // native token vocabulary (AstroWind `--aw-*`, Shadcn `--*`) is mapped
  // onto these roles by the generated theme adapters, so "primary",
  // "surface", "text" mean the same thing in marketing and product.
  //
  // Value convention (consumed by scripts/generate-theme.ts):
  //   - a bare token key (e.g. "brand-navy-900", "product-card") resolves
  //     to `var(--granville-color-<key without brand- prefix>)`.
  //   - anything starting with #, rgb, rgba, oklch, hsl, color-mix, or var(
  //     is emitted verbatim.
  semantics: {
    // Canonical role set shared across every surface.
    coreRoles: [
      "bg",
      "bg-deep",
      "surface",
      "surface-raised",
      "surface-muted",
      "text",
      "text-muted",
      "text-on-primary",
      "primary",
      "primary-hover",
      "accent",
      "border",
      "border-strong",
      "ring",
      "danger",
      "success",
      "warning",
    ],

    // Core role resolutions per theme.
    core: {
      marketing: {
        bg: "brand-navy-900",
        "bg-deep": "brand-navy-950",
        surface: "brand-navy-800",
        "surface-raised": "brand-navy-800",
        "surface-muted": "brand-navy-800",
        text: "brand-slate-50",
        "text-muted": "color-mix(in srgb, var(--granville-color-slate-300) 72%, transparent)",
        "text-on-primary": "brand-navy-900",
        primary: "brand-gold-400",
        "primary-hover": "brand-gold-300",
        accent: "brand-blue-400",
        border: "brand-border-subtle",
        "border-strong": "brand-border-strong",
        ring: "brand-gold-400",
        danger: "brand-danger",
        success: "brand-success",
        warning: "brand-warning",
      },
      productLight: {
        bg: "brand-surface-public",
        "bg-deep": "brand-navy-900",
        surface: "#ffffff",
        "surface-raised": "#ffffff",
        "surface-muted": "brand-slate-100",
        text: "brand-navy-900",
        "text-muted": "brand-slate-500",
        "text-on-primary": "brand-slate-50",
        primary: "brand-navy-900",
        "primary-hover": "brand-navy-800",
        accent: "brand-blue-400",
        border: "brand-slate-300",
        "border-strong": "brand-slate-300",
        ring: "brand-gold-400",
        danger: "brand-danger",
        success: "brand-success",
        warning: "brand-warning",
      },
      productDark: {
        bg: "product-background",
        "bg-deep": "product-background-deep",
        surface: "product-card",
        "surface-raised": "oklch(0.208 0.042 265.755)",
        "surface-muted": "oklch(0.279 0.041 260.031)",
        text: "product-text",
        "text-muted": "product-text-muted",
        "text-on-primary": "product-background-deep",
        primary: "product-primary-action",
        "primary-hover": "brand-gold-400",
        accent: "product-info-accent",
        border: "brand-border-subtle",
        "border-strong": "brand-border-strong",
        ring: "oklch(0.551 0.027 264.364)",
        danger: "brand-danger",
        success: "brand-success",
        warning: "brand-warning",
      },
    },

    // Sidebar treatment (product only). Intentionally dark in both light
    // and dark modes; dark mode only deepens the base field.
    sidebar: {
      base: {
        sidebar: "brand-navy-900",
        "sidebar-foreground": "brand-slate-50",
        "sidebar-primary": "brand-gold-300",
        "sidebar-primary-foreground": "brand-navy-950",
        "sidebar-accent": "brand-navy-800",
        "sidebar-accent-foreground": "brand-slate-50",
        "sidebar-border": "brand-border-subtle",
        "sidebar-ring": "brand-gold-300",
      },
      darkOverrides: {
        sidebar: "product-background-deep",
      },
    },

    // Payment-lifecycle status system (product only).
    status: {
      light: {
        created: { bg: "#eef2f7", text: "#334155", border: "#cbd5e1" },
        review: { bg: "#fdf2da", text: "#9a5b12", border: "#f0c878" },
        submitted: { bg: "#e8f4fb", text: "#0b5f8f", border: "#9ad3ef" },
        processing: { bg: "#e9f2ff", text: "#2757c6", border: "#a8c7ff" },
        completed: { bg: "#e8f7ee", text: "#167447", border: "#9fd8b7" },
        failed: { bg: "#fee2e2", text: "#b91c1c", border: "#fca5a5" },
        returned: { bg: "#fff1e8", text: "#b45309", border: "#fdba74" },
        cancelled: { bg: "#f1f5f9", text: "#64748b", border: "#cbd5e1" },
      },
      dark: {
        created: { bg: "rgba(148, 163, 184, 0.14)", text: "#cbd5e1", border: "rgba(148, 163, 184, 0.28)" },
        review: { bg: "rgba(213, 191, 155, 0.16)", text: "#d5bf9b", border: "rgba(213, 191, 155, 0.34)" },
        submitted: { bg: "rgba(56, 189, 248, 0.13)", text: "#7dd3fc", border: "rgba(56, 189, 248, 0.3)" },
        processing: { bg: "rgba(96, 165, 250, 0.14)", text: "#93c5fd", border: "rgba(96, 165, 250, 0.32)" },
        completed: { bg: "rgba(22, 163, 74, 0.16)", text: "#86efac", border: "rgba(22, 163, 74, 0.34)" },
        failed: { bg: "rgba(220, 38, 38, 0.18)", text: "#fca5a5", border: "rgba(220, 38, 38, 0.36)" },
        returned: { bg: "rgba(217, 119, 6, 0.18)", text: "#fdba74", border: "rgba(217, 119, 6, 0.36)" },
        cancelled: { bg: "rgba(148, 163, 184, 0.12)", text: "#94a3b8", border: "rgba(148, 163, 184, 0.26)" },
      },
    },

    // Chart series palette (product only).
    chart: {
      light: [
        "oklch(0.646 0.222 41.116)",
        "oklch(0.6 0.118 184.704)",
        "oklch(0.398 0.07 227.392)",
        "oklch(0.828 0.189 84.429)",
        "oklch(0.769 0.188 70.08)",
      ],
      dark: [
        "oklch(0.488 0.243 264.376)",
        "oklch(0.696 0.17 162.48)",
        "oklch(0.769 0.188 70.08)",
        "oklch(0.627 0.265 303.9)",
        "oklch(0.645 0.246 16.439)",
      ],
    },

    // Native-token adapters: each app's vocabulary → a core role name.
    adapters: {
      // AstroWind marketing site.
      astrowind: {
        "--aw-color-primary": "primary",
        "--aw-color-secondary": "primary-hover",
        "--aw-color-accent": "accent",
        "--aw-color-text-heading": "text",
        "--aw-color-text-default": "text",
        "--aw-color-text-page": "text",
        "--aw-color-text-muted": "text-muted",
        "--aw-color-bg-page": "bg",
        "--aw-color-bg-page-dark": "bg-deep",
      },
      // Shadcn portal.
      shadcn: {
        "--background": "bg",
        "--foreground": "text",
        "--card": "surface",
        "--card-foreground": "text",
        "--popover": "surface-raised",
        "--popover-foreground": "text",
        "--primary": "primary",
        "--primary-foreground": "text-on-primary",
        "--secondary": "surface-muted",
        "--secondary-foreground": "text",
        "--muted": "surface-muted",
        "--muted-foreground": "text-muted",
        "--accent": "surface-muted",
        "--accent-foreground": "text",
        "--destructive": "danger",
        "--border": "border",
        "--input": "border-strong",
        "--ring": "ring",
      },
    },
  },

  typography: {
    fontFamily: {
      sans: "Inter, ui-sans-serif, system-ui, sans-serif",
      heading: "Manrope, Inter, ui-sans-serif, system-ui, sans-serif",
      mono: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    },
    casing: {
      buttons: "sentence-case",
      portalNavigation: "title-case-labels",
      sectionEyebrows: "uppercase",
    },
    rules: [
      "Public display headings should feel confident and restrained.",
      "Portal headings should be compact, scan-friendly, and operational.",
      "Use uppercase only for section labels and compact metadata, not for long copy.",
      "Avoid negative letter spacing in compact cards, buttons, and controls.",
    ],
  },

  spacing: {
    baseGridPx: 8,
    iconTextGapPx: 8,
    portalCardPaddingPx: {
      compact: 16,
      default: 20,
      roomy: 24,
    },
    marketingCardPaddingPx: {
      default: 24,
      roomy: 32,
    },
    sectionMaxWidthPx: {
      standard: 1280,
      focused: 1024,
      narrow: 768,
    },
  },

  radius: {
    portalControlPx: 8,
    portalCardPx: 8,
    marketingCardPx: 24,
    marketingPanelPx: 32,
    appIconPx: 14,
  },

  elevation: {
    portal: "flat or low-shadow surfaces with clear borders",
    marketing: "subtle atmospheric depth only on major panels",
    rule: "Avoid glossy SaaS shine in operational UI.",
  },

  components: {
    buttons: {
      publicPrimary: "filled institutional accent or light-on-dark brand treatment",
      publicSecondary: "dark translucent surface with subtle border",
      portalPrimary: "semantic primary mapped to Granville accent",
      portalSecondary: "quiet outline or ghost treatment",
      destructive: "functional, explicit, not decorative",
    },
    cards: {
      marketingProduct: "subtle translucent surface, restrained border, no heavy decoration",
      marketingCtaPanel: "centered, high-confidence panel with clear left copy and right actions",
      portalMetric: "dense numeric hierarchy, small domain icon, minimal decoration",
      auth: "simple centered card with brand lockup",
    },
  },

  voice: {
    attributes: [
      "institutional",
      "treasury-oriented",
      "infrastructure-focused",
      "calm",
      "precise",
      "operator-grade",
    ],
    preferredTerms: [
      "treasury",
      "payments",
      "operations",
      "compliance",
      "security",
      "settlement",
      "providers",
      "reconciliation",
      "controlled access",
    ],
    avoidTerms: [
      "game-changing",
      "revolutionise",
      "powerful platform",
      "generic SaaS claims",
      "playful language",
    ],
  },
} as const;

export type GranvilleBrand = typeof granvilleBrand;
