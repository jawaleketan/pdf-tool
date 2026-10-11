import MergeWorker from '../../workers/merge.worker?worker';
import SplitWorker from '../../workers/split.worker?worker';
import CompressWorker from '../../workers/compress.worker?worker';
import {
  clampProgress,
  isWorkerResponse,
  type CancelRequest,
  type RunRequest,
  type ToolName,
} from './messages';

/**
 * The single typed helper that starts a tool worker.
 *
 * Workers are imported with Vite's `?worker` form so each one is bundled as a
 * real file; a plain `new URL` reference gets inlined as a data URL, which
 * browsers refuse to start as a module worker. PDF libraries are imported only
 * inside the workers, so content pages never download them (spec 0001). Every
 * tool uses this helper instead of starting workers its own way.
 */

const workerConstructors: Record<ToolName, new () => Worker> = {
  merge: MergeWorker,
  split: SplitWorker,
  compress: CompressWorker,
};

export interface ToolWorkerHandlers {
  onProgress?: (percent: number) => void;
  onResult?: (result: { file: ArrayBuffer; name: string }) => void;
  onError?: (message: string) => void;
}

export interface ToolWorker {
  /** Starts a run and returns its request id, used to cancel that run. */
  run(files: ArrayBuffer[], payload?: unknown, handlers?: ToolWorkerHandlers): string;
  cancel(id: string): void;
  terminate(): void;
}

export function createToolWorker(tool: ToolName): ToolWorker {
  const worker = new workerConstructors[tool]();
  let counter = 0;

  return {
    run(files, payload, handlers = {}) {
      counter += 1;
      const id = `${tool}-${counter}`;

      worker.onmessage = (event: MessageEvent<unknown>) => {
        const message = event.data;
        if (!isWorkerResponse(message) || message.id !== id) return;
        if (message.type === 'progress') {
          handlers.onProgress?.(clampProgress(message.percent));
        } else if (message.type === 'result') {
          handlers.onResult?.({ file: message.file, name: message.name });
        } else {
          handlers.onError?.(message.message);
        }
      };

      const request: RunRequest = { id, type: 'run', tool, files, payload };
      worker.postMessage(request);
      return id;
    },

    cancel(id) {
      const request: CancelRequest = { id, type: 'cancel' };
      worker.postMessage(request);
    },

    terminate() {
      worker.terminate();
    },
  };
}
