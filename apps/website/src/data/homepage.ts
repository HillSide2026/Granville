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
    tagline: "Granville Finance",
    title: "One Platform for Global Finance Teams",
    subtitle:
      "Granville Finance provides financial infrastructure and payment solutions to help businesses move, manage, and grow.",
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
    title: "A Unified Platform for Global Financial Operations.",
    subtitle: "",
    items: [
      {
        title: "Payment Platform",
        description:
          "Access domestic and cross-border payment capabilities through a unified infrastructure platform built for efficiency, transparency, and scale.",
        icon: "arrow/arrow-transaction-left-right",
      },
      {
        title: "Treasury Functionality",
        description:
          "Centralize account visibility, liquidity oversight, and currency management, across your financial ecosystem.",
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
    title: "Fast Forward Global Financial Operations.",
    subtitle:
      "Granville Finance helps businesses simplify financial operations and international payments through a modern infrastructure platform.",
    contentTitle: "Built for Growth and Control",
    contentBody:
      "Modernize financial operations with infrastructure designed to deliver greater visibility, operational efficiency, and scalability as your business expands globally.",
    items: [
      {
        title: "Optimize Operations",
        description:
          "Consolidate financial systems and payment workflows within a single operating environment.",
      },
      {
        title: "Streamline Workflows",
        description:
          "Standardize approvals, reconciliation, reporting, and treasury processes to improve efficiency and reduce operational complexity.",
      },
      {
        title: "Real-Time Visibility",
        description:
          "Monitor settlements, balances, payments, and operational activity through centralized reporting and oversight tools.",
      },
    ],
  },
  company: {
    title: "About Granville",
    items: [
      {
        title: "Careers",
        description:
          "Help build the next generation of financial infrastructure and global payment technology.",
        icon: "tabler:briefcase",
      },
      {
        title: "News",
        description:
          "Stay informed with company updates, product developments, industry insights, and platform milestones.",
        icon: "tabler:news",
      },
    ],
  },
  closing: {
    tagline: "CONTACT",
    title: "Transform Your Financial Operations.",
    subtitle:
      "Learn how Granville Finance can help your organization simplify payments, improve visibility, and scale financial operations globally.",
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
