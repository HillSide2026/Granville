# Granville Branded Domain Page Map

This is the minimal public-facing page set for Granville's branded domain.

The active implementation lives in `branded-domain-site/`. It started from AstroWind's `src/pages/homes/saas.astro`, but `branded-domain-site/` is now the single source of truth for public-facing pages. The archived `archive/index.html` and `archive/styles.css` files are legacy draft reference only.

Assumptions:

- the public site is primarily a trust and conversion layer
- the main conversion action is sending users to the app/platform sign-up flow
- product onboarding, authentication, and account management live in the app, not on the marketing site
- legal copy will need review by counsel before launch

## Core routes

### `/`

Purpose:

- present Granville clearly as a payments infrastructure and orchestration platform
- explain the value proposition in plain language
- drive one primary action: `Sign up`

Primary CTA:

- `Sign up` -> app sign-up URL

Secondary CTA:

- `Contact sales` or `Talk to us`

Recommended sections:

- hero with direct product positioning
- short product overview
- trust/reliability section
- who it is for
- simple FAQ
- footer with legal and contact links

Notes:

- iterate from `branded-domain-site/src/pages/index.astro` and `branded-domain-site/src/data/homepage.ts`
- remove demo pricing, blog, and generic SaaS filler unless they are backed by real Granville content

### `/contact`

Purpose:

- provide a credible way to reach the company
- support sales, partnership, and compliance inquiries

Include:

- contact email or form
- company legal name
- business address if intended for publication
- response expectation if known

## Legal and trust routes

### `/terms`

Purpose:

- govern use of the public website and, if appropriate, the platform

Include:

- who the contracting entity is
- scope of the service
- eligibility and account terms
- acceptable use
- disclaimers and limitation language
- suspension and termination language
- governing law and contact details

Notes:

- the current page in `branded-domain-site/` is only a structural placeholder and must be rewritten

### `/privacy`

Purpose:

- explain what personal information is collected, why, how it is used, retained, shared, and how users can exercise rights

Include:

- categories of personal information collected
- purposes for collection and use
- cookies and analytics summary
- service providers and third-party processing
- cross-border processing if applicable
- retention approach
- privacy/contact officer details
- access, correction, deletion, and complaint/request process

Notes:

- the current page in `branded-domain-site/` is only a structural placeholder and must be rewritten

### `/cookie-notice`

Purpose:

- explain cookies, analytics, and similar tracking technologies in plain language

Include:

- essential vs optional cookies
- analytics or advertising tools in use
- how users can manage preferences

Notes:

- this can be a standalone page or a section within `/privacy`
- if any non-essential tracking is used, a dedicated cookie page is cleaner

### `/legal/regulatory-disclosures`

Purpose:

- give visitors confidence without overstating regulatory status

Include:

- legal entity name
- trading name statement
- jurisdictions served
- licensing or registration details that are actually true
- onboarding and availability caveats
- statement that service availability may depend on eligibility and compliance review

Do not include:

- implied banking status if Granville is not a bank
- unverified licensing claims
- vague statements like "fully regulated globally"

### `/legal/disclaimers`

Purpose:

- central place for marketing and service disclaimers that do not fit neatly in Terms

Include:

- no banking or custodial claim unless true
- informational-content disclaimer
- availability-by-jurisdiction disclaimer
- product availability subject to approval/onboarding

Notes:

- this can be merged into `/legal/regulatory-disclosures` if we want fewer pages

## Strongly recommended follow-on routes

### `/security`

Purpose:

- answer the first trust questions enterprise buyers will have

Include:

- security posture summary
- data handling overview
- incident reporting/contact route
- status page or trust inbox if available

### `/accessibility`

Purpose:

- explain accessibility commitment and provide a feedback route

Include:

- commitment statement
- target standard such as WCAG 2.1 AA or 2.2 AA if that is the actual target
- contact method for accessibility issues

### `/complaints`

Purpose:

- provide a clear escalation path for users, partners, or counterparties

Include:

- how to submit a complaint
- response timeline if known
- when regulatory or privacy complaints may be directed elsewhere

## Navigation model

Header:

- Product
- Security
- Contact
- Sign up

Footer:

- Privacy Policy
- Terms of Use
- Cookie Notice
- Regulatory Disclosures
- Accessibility
- Contact

Optional footer links:

- Security
- Complaints

## Pages to skip for now

- blog
- newsroom
- careers
- pricing
- feature-comparison pages
- generic case studies

These can make the site feel thin if they are only placeholders.

## Recommended MVP build order

1. `/`
2. `/privacy`
3. `/terms`
4. `/legal/regulatory-disclosures`
5. `/contact`
6. `/cookie-notice`

## Content guardrails

- keep all claims concrete and supportable
- avoid invented metrics or unnamed partner counts
- avoid implying regulated status until the exact registration or licence wording is confirmed
- prefer one strong CTA to the app over multiple competing actions
