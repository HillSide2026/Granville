export interface CamundaJob {
  key: string;
  type: string;
  processInstanceKey: string;
  elementInstanceKey: string;
  variables: Record<string, unknown>;
}

export interface CamundaJobWorker {
  subscribe(
    type: string,
    handler: (job: CamundaJob) => Promise<Record<string, unknown> | undefined>,
  ): void;
}

export interface WorkerContext {
  backend: BackendClient;
}

export interface BackendClient {
  post(path: string, body?: Record<string, unknown>, idempotencyKey?: string): Promise<unknown>;
  patch(path: string, body?: Record<string, unknown>, idempotencyKey?: string): Promise<unknown>;
  get(path: string): Promise<unknown>;
}
