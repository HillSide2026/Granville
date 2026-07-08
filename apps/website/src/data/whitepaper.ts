import { granville } from "./granville";

// Whitepaper copy — reframed around the wedge: paying a global contract
// workforce (contractors, agencies, crews) for companies that work with them
// instead of standing up an EOR. "Financial operations" is the mechanism, not
// the topic. Claim-safe: no invented benchmarks; no employment/EOR-avoidance
// framing. Refine once the final paper content is set.
export const whitepaperPage = {
  // Platform-style intro grid (Features2)
  overview: {
    tagline: "Whitepaper",
    title: "Paying a Global Contract Workforce.",
    subtitle:
      "For companies that build with contractors, agencies, and crews across borders instead of an employer of record — how to pay them on time, in their currency, with every payment recorded.",
    items: [
      {
        title: "Why Companies Go Contract-First",
        description:
          "Teams increasingly build with contractors, agencies, and rotational crews across borders rather than standing up entities in every market.",
        icon: "report/document-text-search",
      },
      {
        title: "Where Payment Breaks",
        description:
          "The hidden cost of paying that workforce through a bank, a payout tool, an FX provider, and a spreadsheet — with the founder pushing every run by hand.",
        icon: "analytics/chart-column-research",
      },
      {
        title: "One Workflow, Every Payment Recorded",
        description:
          "How a single cue-up → approve → pay → record flow replaces the stack and keeps the books current across currencies and corridors.",
        icon: "location/earth-globe",
      },
    ],
  },

  // First payments-style Content block
  theme1: {
    tagline: "Chapter 01",
    title: "Why Paying a Global Team Breaks Down.",
    subtitle:
      "The whitepaper opens by mapping the complexity that accumulates as a company pays more people, in more countries and currencies — without an entity or EOR in each market.",
    contentTitle: "The Cost of a Stitched-Together Stack",
    contentBody:
      "A bank for domestic, a payout tool for abroad, an FX provider for rates, and a spreadsheet for who-got-paid. The gaps between them get reconciled by hand — usually by the founder. This section maps where that drag comes from.",
    items: [
      {
        title: "The Founder Is the Rail",
        description:
          "Every payment run waits on the principal to log in and push it manually — operating the payments instead of approving them.",
      },
      {
        title: "No Single Record",
        description:
          "Who was paid, when, and in what currency lives across tools; month-end becomes a reconstruction rather than a read.",
      },
      {
        title: "FX and Fees Leak",
        description:
          "Each corridor and tool takes a cut, and the true cost of moving money stays invisible until someone adds it all up.",
      },
    ],
    cover: {
      eyebrow: "Granville · Chapter 01",
      title: "Why Paying a Global Team Breaks Down",
      meta: ["Section 1", "The Problem"],
    },
  },

  // Second payments-style Content block
  theme2: {
    tagline: "Chapter 02",
    title: "One Workflow for the Whole Team.",
    subtitle:
      "The second half presents an operating model that collapses the stack into a single cue-up → approve → pay → record flow — payment and bookkeeping as one event.",
    contentTitle: "Payment and Record, the Same Event",
    contentBody:
      "When paying someone and recording it are one action, the founder approves instead of operating, and the books are always current. Treasury, FX, and controls become the mechanism underneath — not four tools to reconcile.",
    items: [
      {
        title: "Cue Up, Approve, Send",
        description:
          "Finance prepares the run, the principal approves, and money moves — a clean separation of duties on every payment.",
      },
      {
        title: "Every Payment on One Ledger",
        description:
          "Each payout posts itself to an auditable record across currencies and corridors, so the books never fall behind the money.",
      },
      {
        title: "Balances and FX in One Place",
        description:
          "Hold, convert, and pay without hopping between a bank, a payout tool, and an FX provider for a single run.",
      },
    ],
    cover: {
      eyebrow: "Granville · Chapter 02",
      title: "One Workflow for the Whole Team",
      meta: ["Section 2", "The Model"],
    },
  },

  // Company-style closing cards (FAQs)
  takeaways: {
    title: "Read the Whitepaper",
    items: [
      {
        title: "Who It's For",
        description:
          "Founders and finance leads at companies paying a global contract workforce — agencies, marketplaces, and operators working with contractors and crews across borders.",
        icon: "report/documents-notes-pages",
      },
      {
        title: "Get the Paper",
        description:
          "Download the full whitepaper for the complete argument, the operating model, and how Granville implements it.",
        icon: "download/download",
      },
    ],
  },

  requestAccessUrl: granville.requestAccessUrl,
} as const;
