# Third-Party Layout

This directory is the target home for upstream infrastructure checkouts that Granville consumes but does not own.

Target state:

```text
third_party/
  formance-ledger/
  formance-payments/
  formance-stack/
```

Current interim mapping:

- `.` maps to the current Formance Ledger checkout
- `vendor/formance-payments` maps to the current Formance Payments checkout
- `vendor/formance-stack` maps to the current Formance Stack checkout

Migration rule:

- Do not move the root ledger checkout until Granville-owned code has been separated enough to survive the move cleanly.
- Once ready, clone fresh upstream checkouts into `third_party/` and move Granville-owned files out of the current root.
