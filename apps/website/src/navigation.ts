import { granville } from "./data/granville";
import { getPermalink } from "./utils/permalinks";

export const headerData = {
  links: [
    { text: "Platform", href: getPermalink("/#platform") },
    { text: "Payments", href: getPermalink("/#payments") },
    { text: "Contact", href: getPermalink("/contact") },
  ],
  actions: [{ text: "Request access", href: granville.requestAccessUrl, target: "_blank" }],
};

export const footerData = {
  links: [
    {
      title: "Navigation",
      links: [
        { text: "Platform", href: getPermalink("/#platform") },
        { text: "Industries", href: getPermalink("/#payments") },
        { text: "Company", href: getPermalink("/#company") },
        { text: "Careers", href: getPermalink("/#company") },
        { text: "Whitepaper", href: getPermalink("/blog") },
        { text: "Contact", href: getPermalink("/contact") },
      ],
    },
  ],
  secondaryLinks: [
    { text: "Terms", href: getPermalink("/terms") },
    { text: "Privacy Policy", href: getPermalink("/privacy") },
    { text: "Cookie Notice", href: getPermalink("/cookie-notice") },
    { text: "Regulatory Disclosures", href: getPermalink("/legal/regulatory-disclosures") },
  ],
  socialLinks: [
    {
      text: '<span class="sr-only">LinkedIn</span>',
      href: granville.linkedinUrl,
      ariaLabel: "LinkedIn",
      icon: "tabler:brand-linkedin",
      target: "_blank",
    },
  ],
  description: "Financial infrastructure for global money movement.",
  footNote:
    "Granville Finance is a trading name of 17409052 Canada Inc. Registered Office: 1235 Bay Street, Suite 700, Toronto, Ontario, Canada, M5R 3K4.",
};
