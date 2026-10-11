/**
 * The one typed message contract every PDF tool worker speaks.
 *
 * Defined once in the scaffold (spec 0001) and reused by merge, split, and
 * compress. Each tool's own spec narrows the payload field for its options
 * (page ranges, quality preset, and so on).
 */

export type ToolName = 'merge' | 'split' | 'compress';

export interface RunRequest {
  id: string;
  type: 'run';
  tool: ToolName;
  files: ArrayBuffer[];
  /** Narrowed per tool by that tool's spec. */
  payload?: unknown;
}

export interface CancelRequest {
  id: string;
  type: 'cancel';
}

export type WorkerRequest = RunRequest | CancelRequest;

export interface ProgressResponse {
  id: string;
  type: 'progress';
  percent: number;
}

export interface ResultResponse {
  id: string;
  type: 'result';
  file: ArrayBuffer;
  name: string;
}

export interface ErrorResponse {
  id: string;
  type: 'error';
  message: string;
}

export type WorkerResponse = ProgressResponse | ResultResponse | ErrorResponse;

/** Progress values are whole numbers between 0 and 100, whatever the worker sends. */
export function clampProgress(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, Math.round(value)));
}

export function isRunRequest(data: unknown): data is RunRequest {
  return (
    typeof data === 'object' &&
    data !== null &&
    (data as { type?: unknown }).type === 'run' &&
    typeof (data as { id?: unknown }).id === 'string' &&
    typeof (data as { tool?: unknown }).tool === 'string' &&
    Array.isArray((data as { files?: unknown }).files)
  );
}

export function isCancelRequest(data: unknown): data is CancelRequest {
  return (
    typeof data === 'object' &&
    data !== null &&
    (data as { type?: unknown }).type === 'cancel' &&
    typeof (data as { id?: unknown }).id === 'string'
  );
}

export function isWorkerResponse(data: unknown): data is WorkerResponse {
  if (typeof data !== 'object' || data === null) return false;
  const message = data as { type?: unknown; id?: unknown };
  if (typeof message.id !== 'string') return false;
  return message.type === 'progress' || message.type === 'result' || message.type === 'error';
}
