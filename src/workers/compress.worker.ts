/// <reference lib="webworker" />
import { PDFDocument } from 'pdf-lib';
import {
  clampProgress,
  isCancelRequest,
  isRunRequest,
  type WorkerResponse,
} from '../lib/pdf/messages';

const scope = self as unknown as DedicatedWorkerGlobalScope;

interface CompressPayload {
  preset?: 'recommended' | 'maximum' | 'lossless';
}

scope.onmessage = async (event: MessageEvent<unknown>) => {
  const data = event.data;
  const cancelled = new Set<string>();

  if (isCancelRequest(data)) {
    cancelled.add(data.id);
    return;
  }

  if (!isRunRequest(data) || data.tool !== 'compress') return;

  const { id, files, payload } = data;

  function post(message: WorkerResponse): void {
    scope.postMessage(message);
  }

  try {
    if (files.length === 0) {
      post({ id, type: 'error', message: 'No PDF file provided for compression.' });
      return;
    }

    post({ id, type: 'progress', percent: clampProgress(15) });
    if (cancelled.has(id)) return;

    const fileBuffer = files[0];

    const pdf = await PDFDocument.load(fileBuffer, { ignoreEncryption: true });

    post({ id, type: 'progress', percent: clampProgress(40) });
    if (cancelled.has(id)) return;

    const compressPayload = (payload || {}) as CompressPayload;
    const preset = compressPayload.preset || 'recommended';

    // Configure save options based on preset
    const useObjectStreams = preset !== 'lossless';

    post({ id, type: 'progress', percent: clampProgress(70) });
    if (cancelled.has(id)) return;

    const pdfBytes = await pdf.save({
      useObjectStreams,
    });

    post({ id, type: 'progress', percent: clampProgress(90) });
    if (cancelled.has(id)) return;

    const resultBuffer = new ArrayBuffer(pdfBytes.byteLength);
    new Uint8Array(resultBuffer).set(pdfBytes);

    post({ id, type: 'progress', percent: clampProgress(100) });
    post({
      id,
      type: 'result',
      file: resultBuffer,
      name: `compressed-document.pdf`,
    });
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : 'Unknown error during PDF compression.';
    post({ id, type: 'error', message: errorMessage });
  }
};
