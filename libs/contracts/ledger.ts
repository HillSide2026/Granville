export interface LedgerPostingRequest {
  id: string;
  aggregateType: string;
  aggregateId: string;
  postingKey: string;
  idempotencyKey: string;
  ledgerName: string;
  description: string;
  postings: Array<{
    source: string;
    destination: string;
    amount: string;
    asset: string;
  }>;
  metadata: Record<string, string>;
}

export interface LedgerPostingResult {
  id: string;
  ledgerName: string;
  formanceTransactionId: string;
  postedAt: string;
}

export interface LedgerEffectReference {
  ledgerPostingQueueId: string;
  formanceTransactionId?: string;
}
