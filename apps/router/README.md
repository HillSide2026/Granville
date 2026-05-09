# granville-router

Purpose:

- Select the provider and rail for each payment attempt
- Enforce configuration-driven routing policy
- Preserve portability across EMI and future bank integrations

Inputs:

- Payment order intent
- Provider capabilities
- Jurisdiction and rail constraints
- Currency, corridor, amount, and account state

Outputs:

- `provider_binding_id`
- `rail`
- `execution_mode`
- fallback sequence

Milestone 1:

- Start with deterministic rules from config
- Keep routing decisions auditable and replayable
