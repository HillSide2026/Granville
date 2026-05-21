# Granville Portal

Customer-facing React application for authenticated onboarding, account visibility, balances, and payment activity.

## Current scope

- Vite, React, TypeScript, TanStack Router, and shadcn/ui portal under `apps/portal`
- Granville modules for wallets, balances, transfers, beneficiaries, approvals, cards, FX, and compliance
- Portal-local API client and placeholder data for the current MVP phase
- Clerk-ready auth screens and an authenticated layout shell

## Commands

```bash
npm install
npm run dev
npm run build
npm test
```

## Notes

- The app remains standalone with its own `package.json`.
- Future integration should connect the portal API client to `apps/api`.
- Deployed hosting should provide an SPA history fallback for browser routes.
