import { granville } from "./granville";

export const homepage = {
  navigation: {
    links: [
      { text: "Platform", href: "/#platform" },
      { text: "Payments", href: "/#payments" },
      { text: "Contact", href: "/#contact" },
    ],
    primaryAction: {
      text: "Request access",
      href: granville.requestAccessUrl,
    },
  },
  hero: {
    tagline: "Global Payments",
    title: "One Platform. Global Money Movement.",
    subtitle:
      "Granville Finance provides financial infrastructure and payment technology to help businesses move, manage, and grow.",
    primaryAction: {
      text: "Request access",
      href: granville.requestAccessUrl,
    },
    secondaryAction: {
      text: "Discover Platform",
      href: "/#platform",
    },
    highlights: [],
  },
  products: {
    tagline: "Platform",
    title: "Powerful Platform Built for Modern Money Movement.",
    subtitle: "",
    items: [
      {
        title: "Payment Platform",
        description:
          "Coordinate domestic and international payment flows through a unified infrastructure layer designed for speed and clarity.",
        icon: "arrow/arrow-transaction-left-right",
      },
      {
        title: "Treasury Functionality",
        description:
          "Centralize account management, liquidity visibility, currency handling, and treasury operations across financial partners.",
        icon: "banking/bank",
      },
      {
        title: "Operational Security",
        description:
          "Built-in access controls, monitoring, authentication, and operational safeguards designed for regulated financial environments.",
        icon: "security/shield-protection-secure-check",
      },
    ],
  },
  operatingModel: {
    tagline: "PAYMENTS",
    title: "Fast Forward Global Money Movement.",
    subtitle:
      "Granville Finance helps global corporates optimize payments, currencies, and financial workflows across markets without relying on fragmented banking infrastructure.",
    contentTitle: "Built for Scale and Control",
    contentBody:
      "Modernize global operations with finance and treasury infrastructure built for scale, visibility, and control. Granville Finance helps teams streamline workflows and growth internationally through our unified financial platform.",
    items: [
      {
        title: "Optimize Operations",
        description:
          "Consolidate payment rails, team processes, and external systems into a single, unified platform designed for scale, visibility, and control.",
      },
      {
        title: "Streamline Workflows",
        description:
          "Unify currencies, approvals, reconciliation, and reporting into standardized workflows that reduce manual intervention and improve operational consistency across markets.",
      },
      {
        title: "Improve Visibility",
        description:
          "Gain real-time visibility into transaction flows, settlement status, reconciliation outcomes, and operational performance through centralized monitoring and reporting infrastructure.",
      },
    ],
  },
  company: {
    title: "About Granville",
    items: [
      {
        title: "Careers",
        description:
          "Build the future of worldwide money movement. Grow with Granville Finance as we expand our financial infrastructure and payment technology platform.",
        icon: "tabler:briefcase",
      },
      {
        title: "News",
        description:
          "Follow product launches and company updates. A simple home for announcements, market notes, and platform milestones as Granville Finance grows.",
        icon: "tabler:news",
      },
    ],
  },
  closing: {
    tagline: "CONTACT",
    title: "Build modern global payment operations.",
    subtitle:
      "Speak with Granville Finance about how we can help your financial ops team move forward with confidence.",
    primaryAction: {
      text: "Request access",
      href: granville.requestAccessUrl,
    },
    secondaryAction: {
      text: "Contact us",
      href: "/contact",
    },
  },
} as const;
