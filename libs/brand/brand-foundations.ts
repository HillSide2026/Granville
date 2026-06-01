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
