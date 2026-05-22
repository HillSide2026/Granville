# Granville Portal

Standalone customer-facing React application for authenticated onboarding, account visibility, balances, and payment activity.

## Current scope

- Browser-routed portal shell under `apps/portal`
- Mocked portal-local API layer in `src/api/`
- Reduced route surface: `sign-in`, `sign-up`, `dashboard`, `accounts`, `activity`, `settings`
- Placeholder customer data only in this phase

## Commands

```bash
npm install
npm start
```

## Notes

- The app remains standalone with its own `package.json`.
- The current shell is intentionally decoupled from `apps/api`; future integration should replace `src/api/mockData.js` through `src/api/client.js`.
- Because the app now uses browser routing, deployed hosting should provide an SPA history fallback for routes such as `/sign-in` and `/dashboard`.
