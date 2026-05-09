# native-bank-adapter

This path is reserved for direct-bank and proprietary EMI integrations that should remain fully Granville-owned.

Use this path when:

- Formance Payments does not model the provider correctly
- The provider needs bespoke routing or state handling
- The integration must avoid coupling to Formance connector internals

Design rule:

- Match the same Granville adapter contract used by `formance-payments-adapter`
- Keep portability at the contract boundary, not in the provider implementation
