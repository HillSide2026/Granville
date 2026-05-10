import { createHash } from "node:crypto";

import type { LedgerPostingResult } from "../../../libs/contracts/ledger.ts";
import type { InMemoryGranvilleStore } from "../../../libs/persistence/src/in-memory-store.ts";

export class LedgerWriter {
  store: InMemoryGranvilleStore;

  constructor(store: InMemoryGranvilleStore) {
    this.store = store;
  }

  postPending(options: { failIds?: Set<string> } = {}): LedgerPostingResult[] {
    const results: LedgerPostingResult[] = [];
    for (const item of this.store.ledgerQueue.values()) {
      if (!["pending", "failed"].includes(item.status)) {
        continue;
      }
      try {
        if (options.failIds?.has(item.id)) {
          throw new Error("simulated ledger writer failure");
        }
        const existing = item.result;
        const result: LedgerPostingResult = existing ?? {
          id: item.id,
          ledgerName: item.ledgerName,
          formanceTransactionId: deterministicTransactionId(item.idempotencyKey),
          postedAt: new Date().toISOString(),
        };
        this.store.markLedgerPosted(item.id, result);
        results.push(result);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        this.store.markLedgerFailed(item.id, message);
      }
    }
    return results;
  }

  replay(id: string): LedgerPostingResult[] {
    this.store.resetLedgerPosting(id);
    return this.postPending();
  }
}

function deterministicTransactionId(idempotencyKey: string): string {
  return `mock-formance-${createHash("sha256").update(idempotencyKey).digest("hex").slice(0, 24)}`;
}
