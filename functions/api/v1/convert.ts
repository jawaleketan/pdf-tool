// Polyfill browser globals for pdf-parse in Cloudflare Workers
if (typeof globalThis.DOMMatrix === 'undefined') {
  // @ts-expect-error polyfill
  globalThis.DOMMatrix = class DOMMatrix {
    a = 1; b = 0; c = 0; d = 1; e = 0; f = 0;
    constructor() {}
    multiply() { return this; }
    inverse() { return this; }
    translate() { return this; }
    scale() { return this; }
    rotate() { return this; }
    transformPoint(p: unknown) { return p; }
  };
}
if (typeof globalThis.ImageData === 'undefined') {
  // @ts-expect-error polyfill
  globalThis.ImageData = class ImageData {};
}
if (typeof globalThis.Path2D === 'undefined') {
  // @ts-expect-error polyfill
  globalThis.Path2D = class Path2D {};
}

import { Document, Packer, Paragraph, TextRun } from 'docx';

const apiKeyRateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_MAX = 100;
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour

export const onRequestPost = async (context: { request: Request }): Promise<Response> => {
  try {
    const authHeader = context.request.headers.get('Authorization');
    const xApiKey = context.request.headers.get('X-API-Key');

    let apiKey = '';
    if (authHeader && authHeader.startsWith('Bearer ')) {
      apiKey = authHeader.substring(7).trim();
    } else if (xApiKey) {
      apiKey = xApiKey.trim();
    }

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized. Missing API key in X-API-Key or Authorization header.' }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    // Rate limiting per API key
    const now = Date.now();
    let record = apiKeyRateLimitMap.get(apiKey);

    if (!record || now > record.resetTime) {
      record = { count: 1, resetTime: now + RATE_LIMIT_WINDOW };
      apiKeyRateLimitMap.set(apiKey, record);
    } else {
      record.count++;
      if (record.count > RATE_LIMIT_MAX) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Maximum 100 API conversions per hour.' }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'X-RateLimit-Limit': String(RATE_LIMIT_MAX),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': String(Math.ceil(record.resetTime / 1000)),
            },
          },
        );
      }
    }

    const remaining = Math.max(0, RATE_LIMIT_MAX - record.count);
    const resetSec = Math.ceil(record.resetTime / 1000);

    const formData = await context.request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return new Response(JSON.stringify({ error: 'No file uploaded in form-data under field "file".' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 10MB limit
    if (file.size > 10 * 1024 * 1024) {
      return new Response(JSON.stringify({ error: 'File size exceeds 10MB limit.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Parse PDF text
    const pdfParseMod = await import('pdf-parse');
    // @ts-expect-error pdf-parse type workaround
    const parseFn = pdfParseMod.default || pdfParseMod;
    const pdfData = await parseFn(buffer);
    const textContent = pdfData.text || '';

    // Create Word Document using docx
    const paragraphs = textContent.split('\n').map(
      (line: string) =>
        new Paragraph({
          children: [new TextRun(line.trim())],
        }),
    );

    if (paragraphs.length === 0) {
      paragraphs.push(new Paragraph({ children: [new TextRun('Converted from PDF')] }));
    }

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: paragraphs,
        },
      ],
    });

    const docxBuffer = await Packer.toBuffer(doc);
    const originalName = file.name.replace(/\.[^/.]+$/, '');

    return new Response(docxBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(originalName)}.docx"`,
        'X-RateLimit-Limit': String(RATE_LIMIT_MAX),
        'X-RateLimit-Remaining': String(remaining),
        'X-RateLimit-Reset': String(resetSec),
        'X-Deletion-Policy': 'Files are processed securely and deleted immediately after conversion.',
      },
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to process API conversion.';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
