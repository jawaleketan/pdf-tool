import {
  clampProgress,
  isCancelRequest,
  isRunRequest,
  type ToolName,
  type WorkerResponse,
} from './messages';

/**
 * Shared behavior for the worker stubs that ship before a tool's release.
 *
 * The worker entry files for tools that are not built yet use this so they
 * speak the real contract from day one: progress first, then an honest error
 * naming the release that implements them. Each tool's release replaces its
 * stub with the real engine.
 */

const releaseNames: Record<ToolName, string> = {
  merge: 'Release 1',
  split: 'Release 2',
  compress: 'Release 3',
};

export function startStubWorker(tool: ToolName): void {
  const scope = self as unknown as DedicatedWorkerGlobalScope;
  const cancelled = new Set<string>();

  function post(message: WorkerResponse): void {
    scope.postMessage(message);
  }

  scope.onmessage = (event: MessageEvent<unknown>) => {
    const data = event.data;

    if (isCancelRequest(data)) {
      cancelled.add(data.id);
      return;
    }

    if (!isRunRequest(data) || data.tool !== tool) return;

    post({ id: data.id, type: 'progress', percent: clampProgress(0) });

    if (cancelled.has(data.id)) return;

    post({
      id: data.id,
      type: 'error',
      message: `The ${tool} tool ships in ${releaseNames[tool]}. The worker scaffold is in place and ready for it.`,
    });
  };
}
