/// <reference lib="webworker" />
import { PDFDocument } from 'pdf-lib';
import JSZip from 'jszip';
import {
  clampProgress,
  isCancelRequest,
  isRunRequest,
  type WorkerResponse,
} from '../lib/pdf/messages';

const scope = self as unknown as DedicatedWorkerGlobalScope;

interface SplitPayload {
  mode: 'range' | 'every' | 'extract';
  rangeStart?: number;
  rangeEnd?: number;
  pages?: number[];
}

scope.onmessage = async (event: MessageEvent<unknown>) => {
  const data = event.data;
  const cancelled = new Set<string>();

  if (isCancelRequest(data)) {
    cancelled.add(data.id);
    return;
  }

  if (!isRunRequest(data) || data.tool !== 'split') return;

  const { id, files, payload } = data;

  function post(message: WorkerResponse): void {
    scope.postMessage(message);
  }

  try {
    if (files.length === 0) {
      post({ id, type: 'error', message: 'No PDF file provided for splitting.' });
      return;
    }

    post({ id, type: 'progress', percent: clampProgress(10) });

    if (cancelled.has(id)) return;

    const fileBuffer = files[0];
    const pdf = await PDFDocument.load(fileBuffer, { ignoreEncryption: true });
    const totalPages = pdf.getPageCount();

    if (totalPages === 0) {
      post({ id, type: 'error', message: 'The provided PDF has no pages.' });
      return;
    }

    const splitPayload = (payload || {}) as SplitPayload;
    const mode = splitPayload.mode || 'every';

    post({ id, type: 'progress', percent: clampProgress(30) });

    if (cancelled.has(id)) return;

    if (mode === 'range') {
      const start = Math.max(1, Math.min(totalPages, splitPayload.rangeStart || 1));
      const end = Math.max(start, Math.min(totalPages, splitPayload.rangeEnd || totalPages));

      const newPdf = await PDFDocument.create();
      const indices: number[] = [];
      for (let i = start - 1; i <= end - 1; i++) {
        indices.push(i);
      }

      const copiedPages = await newPdf.copyPages(pdf, indices);
      for (const page of copiedPages) {
        newPdf.addPage(page);
      }

      post({ id, type: 'progress', percent: clampProgress(80) });

      const pdfBytes = await newPdf.save();
      const resultBuffer = new ArrayBuffer(pdfBytes.byteLength);
      new Uint8Array(resultBuffer).set(pdfBytes);

      post({ id, type: 'progress', percent: clampProgress(100) });
      post({
        id,
        type: 'result',
        file: resultBuffer,
        name: `split-pages-${start}-to-${end}.pdf`,
      });
    } else if (mode === 'extract') {
      const pageList = (splitPayload.pages || []).filter((p) => p >= 1 && p <= totalPages);
      if (pageList.length === 0) {
        post({ id, type: 'error', message: 'No valid pages selected for extraction.' });
        return;
      }

      const newPdf = await PDFDocument.create();
      const indices = pageList.map((p) => p - 1);
      const copiedPages = await newPdf.copyPages(pdf, indices);
      for (const page of copiedPages) {
        newPdf.addPage(page);
      }

      post({ id, type: 'progress', percent: clampProgress(80) });

      const pdfBytes = await newPdf.save();
      const resultBuffer = new ArrayBuffer(pdfBytes.byteLength);
      new Uint8Array(resultBuffer).set(pdfBytes);

      post({ id, type: 'progress', percent: clampProgress(100) });
      post({
        id,
        type: 'result',
        file: resultBuffer,
        name: `extracted-pages.pdf`,
      });
    } else {
      // 'every' page -> zip of individual page PDFs (or single PDF if 1 page)
      if (totalPages === 1) {
        const newPdf = await PDFDocument.create();
        const [copied] = await newPdf.copyPages(pdf, [0]);
        newPdf.addPage(copied);
        const pdfBytes = await newPdf.save();
        const resultBuffer = new ArrayBuffer(pdfBytes.byteLength);
        new Uint8Array(resultBuffer).set(pdfBytes);

        post({ id, type: 'progress', percent: clampProgress(100) });
        post({
          id,
          type: 'result',
          file: resultBuffer,
          name: `page-1.pdf`,
        });
        return;
      }

      const zip = new JSZip();
      for (let i = 0; i < totalPages; i++) {
        if (cancelled.has(id)) return;
        const newPdf = await PDFDocument.create();
        const [copied] = await newPdf.copyPages(pdf, [i]);
        newPdf.addPage(copied);
        const pdfBytes = await newPdf.save();
        zip.file(`page-${i + 1}.pdf`, pdfBytes);

        const progressPercent = Math.round(30 + ((i + 1) / totalPages) * 50);
        post({ id, type: 'progress', percent: clampProgress(progressPercent) });
      }

      if (cancelled.has(id)) return;
      post({ id, type: 'progress', percent: clampProgress(85) });

      const zipBlob = await zip.generateAsync({ type: 'arraybuffer' });

      post({ id, type: 'progress', percent: clampProgress(100) });
      post({
        id,
        type: 'result',
        file: zipBlob,
        name: `split-all-pages.zip`,
      });
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error during PDF splitting.';
    post({ id, type: 'error', message: errorMessage });
  }
};
