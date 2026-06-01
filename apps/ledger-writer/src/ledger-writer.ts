import { createHash } from "node:crypto";

import type { LedgerPostingResult } from "../../../libs/contracts/ledger.ts";
import type { InMemoryGranvilleStore, LedgerQueueItem } from "../../../libs/persistence/src/in-memory-store.ts";

export class LedgerWriter {
  store: InMemoryGranvilleStore;
  readonly #formanceLedgerUrl?: string;

  constructor(store: InMemoryGranvilleStore, formanceLedgerUrl?: string) {
    this.store = store;
    this.#formanceLedgerUrl = formanceLedgerUrl;
  }

  async postPending(options: { failIds?: Set<string> } = {}): Promise<LedgerPostingResult[]> {
    const results: LedgerPostingResult[] = [];
    for (const item of this.store.ledgerQueue.values()) {
      if (!["pending", "failed"].includes(item.status)) {
        continue;
      }
      try {
        if (options.failIds?.has(item.id)) {
          throw new Error("simulated ledger writer failure");
        }
        const result = await this.#post(item);
        this.store.markLedgerPosted(item.id, result);
        results.push(result);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        this.store.markLedgerFailed(item.id, message);
      }
    }
    return results;
  }

  async replay(id: string): Promise<LedgerPostingResult[]> {
    this.store.resetLedgerPosting(id);
    return this.postPending();
  }

  async #post(item: LedgerQueueItem): Promise<LedgerPostingResult> {
    if (!this.#formanceLedgerUrl) {
      return {
        id: item.id,
        ledgerName: item.ledgerName,
        formanceTransactionId: deterministicTransactionId(item.idempotencyKey),
        postedAt: new Date().toISOString(),
      };
    }

    const url = `${this.#formanceLedgerUrl}/v2/${item.ledgerName}/transactions`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Idempotency-Key": item.idempotencyKey,
      },
      body: JSON.stringify({
        postings: item.postings.map((p) => ({
          source: p.source,
          destination: p.destination,
          amount: parseInt(p.amount, 10),
          asset: p.asset,
        })),
        metadata: item.metadata,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Formance Ledger ${response.status}: ${text}`);
    }

    const data = (await response.json()) as { data: { id: number } };
    return {
      id: item.id,
      ledgerName: item.ledgerName,
      formanceTransactionId: String(data.data.id),
      postedAt: new Date().toISOString(),
    };
  }
}

function deterministicTransactionId(idempotencyKey: string): string {
  return `mock-formance-${createHash("sha256").update(idempotencyKey).digest("hex").slice(0, 24)}`;
}
