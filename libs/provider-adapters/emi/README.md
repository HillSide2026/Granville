# EMI Adapters

This directory is reserved for EMI-oriented adapter implementations.

Rules:

- adapters implement the provider interface from `interfaces/`
- provider-native statuses stay inside adapter code
- orchestration callers consume normalized Granville-side results only
