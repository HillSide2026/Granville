import { granville } from "./granville";

// Placeholder whitepaper copy — refine once the final paper content is set.
export const whitepaperPage = {
  // Platform-style intro grid (Features2)
  overview: {
    tagline: "Whitepaper",
    title: "Inside the Granville Whitepaper.",
    subtitle:
      "A practical look at how modern financial infrastructure improves the way global teams monitor, manage, and move money.",
    items: [
      {
        title: "The Research",
        description:
          "A structured analysis of where legacy payment and treasury operations break down as businesses scale across borders.",
        icon: "report/document-text-search",
      },
      {
        title: "The Findings",
        description:
          "Data-backed benchmarks on settlement speed, operational overhead, and the true cost of fragmented financial systems.",
        icon: "analytics/chart-column-research",
      },
      {
        title: "The Global View",
        description:
          "How unified infrastructure reshapes cross-border money movement, currency management, and multi-entity oversight.",
        icon: "location/earth-globe",
      },
    ],
  },

  // First payments-style Content block
  theme1: {
    tagline: "Chapter 01",
    title: "Why Financial Operations Break at Scale.",
    subtitle:
      "The whitepaper opens by mapping the hidden complexity that accumulates as payment volumes, currencies, and entities multiply.",
    contentTitle: "The Cost of Fragmentation",
    contentBody:
      "Disconnected banking relationships, manual reconciliation, and siloed treasury tooling quietly compound into operational drag. This section quantifies that drag and where it originates.",
    items: [
      {
        title: "Limited Visibility",
        description:
          "Without a single source of truth, finance teams react to problems instead of anticipating them.",
      },
      {
        title: "Manual Reconciliation",
        description:
          "Settlement mismatches and spreadsheet-driven workflows scale linearly with growth, not with automation.",
      },
      {
        title: "Fragmented Rails",
        description:
          "Each new banking partner and payment corridor adds integration, reconciliation, and oversight burden.",
      },
    ],
    cover: {
      eyebrow: "Granville · Chapter 01",
      title: "Why Financial Operations Break at Scale",
      meta: ["Section 1", "Benchmarks"],
    },
  },

  // Second payments-style Content block
  theme2: {
    tagline: "Chapter 02",
    title: "A Unified Model for Global Money Movement.",
    subtitle:
      "The second half presents an infrastructure model designed to consolidate payments, treasury, and controls into one operating environment.",
    contentTitle: "Infrastructure as a Foundation",
    contentBody:
      "By treating payments, liquidity, and oversight as a single system rather than stitched-together tools, businesses gain the visibility and control needed to scale globally.",
    items: [
      {
        title: "One Operating Environment",
        description:
          "Consolidate payment workflows, treasury oversight, and controls behind a single infrastructure layer.",
      },
      {
        title: "Standardized Controls",
        description:
          "Approvals, monitoring, and reporting are applied consistently across every corridor and currency.",
      },
      {
        title: "Built to Scale",
        description:
          "New markets and entities extend the same model instead of multiplying operational complexity.",
      },
    ],
    cover: {
      eyebrow: "Granville · Chapter 02",
      title: "A Unified Model for Global Money Movement",
      meta: ["Section 2", "Framework"],
    },
  },

  // Company-style closing cards (FAQs)
  takeaways: {
    title: "Read the Whitepaper",
    items: [
      {
        title: "Who It's For",
        description:
          "Finance, treasury, and operations leaders building or scaling global money movement across multiple markets.",
        icon: "report/documents-notes-pages",
      },
      {
        title: "Get the Paper",
        description:
          "Download the full whitepaper for the complete research, benchmarks, and infrastructure framework.",
        icon: "download/download",
      },
    ],
  },

  requestAccessUrl: granville.requestAccessUrl,
} as const;
