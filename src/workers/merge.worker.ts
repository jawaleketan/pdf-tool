/// <reference lib="webworker" />
import { PDFDocument } from 'pdf-lib';
import {
  clampProgress,
  isCancelRequest,
  isRunRequest,
  type WorkerResponse,
} from '../lib/pdf/messages';

const scope = self as unknown as DedicatedWorkerGlobalScope;

scope.onmessage = async (event: MessageEvent<unknown>) => {
  const data = event.data;
  const cancelled = new Set<string>();

  if (isCancelRequest(data)) {
    cancelled.add(data.id);
    return;
  }

  if (!isRunRequest(data) || data.tool !== 'merge') return;

  const { id, files } = data;

  function post(message: WorkerResponse): void {
    scope.postMessage(message);
  }

  try {
    if (files.length === 0) {
      post({ id, type: 'error', message: 'No PDF files provided for merging.' });
      return;
    }

    post({ id, type: 'progress', percent: clampProgress(10) });

    if (cancelled.has(id)) return;

    const mergedPdf = await PDFDocument.create();
    const totalFiles = files.length;

    for (let i = 0; i < totalFiles; i++) {
      if (cancelled.has(id)) return;

      const fileBuffer = files[i];
      const pdf = await PDFDocument.load(fileBuffer, { ignoreEncryption: true });
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());

      for (const page of copiedPages) {
        mergedPdf.addPage(page);
      }

      const progressPercent = Math.round(10 + ((i + 1) / totalFiles) * 70);
      post({ id, type: 'progress', percent: clampProgress(progressPercent) });
    }

    if (cancelled.has(id)) return;

    post({ id, type: 'progress', percent: clampProgress(90) });

    const mergedPdfBytes = await mergedPdf.save();
    const resultBuffer = new ArrayBuffer(mergedPdfBytes.byteLength);
    new Uint8Array(resultBuffer).set(mergedPdfBytes);

    post({ id, type: 'progress', percent: clampProgress(100) });
    post({
      id,
      type: 'result',
      file: resultBuffer,
      name: 'merged.pdf',
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error during PDF merging.';
    post({ id, type: 'error', message: errorMessage });
  }
};
