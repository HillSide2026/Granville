import { GranvilleBackendClient } from "./backend-client.ts";
import { taskHandlers } from "./handlers.ts";
import type { CamundaJob, CamundaJobWorker, WorkerContext } from "./types.ts";

export function registerGranvilleCamundaWorkers(
  worker: CamundaJobWorker,
  context: WorkerContext,
): void {
  for (const [type, handler] of Object.entries(taskHandlers)) {
    worker.subscribe(type, (job) => handler(job, context));
  }
}

class LoggingWorker implements CamundaJobWorker {
  readonly handlers = new Map<
    string,
    (job: CamundaJob) => Promise<Record<string, unknown> | undefined>
  >();

  subscribe(
    type: string,
    handler: (job: CamundaJob) => Promise<Record<string, unknown> | undefined>,
  ): void {
    this.handlers.set(type, handler);
    console.log(`Registered Camunda worker task type: ${type}`);
  }
}

if (process.argv[1] === import.meta.filename) {
  const backend = new GranvilleBackendClient();
  const worker = new LoggingWorker();
  registerGranvilleCamundaWorkers(worker, { backend });
  console.log(
    "Camunda worker stubs loaded. Wire LoggingWorker to @camunda8/sdk for live Zeebe jobs.",
  );
}
