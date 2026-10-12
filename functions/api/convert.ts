// Polyfill browser globals for pdf-parse in Cloudflare Workers
if (typeof globalThis.DOMMatrix === 'undefined') {
  // @ts-expect-error polyfill
  globalThis.DOMMatrix = class DOMMatrix {
    a = 1;
    b = 0;
    c = 0;
    d = 1;
    e = 0;
    f = 0;
    constructor() {}
    multiply() {
      return this;
    }
    inverse() {
      return this;
    }
    translate() {
      return this;
    }
    scale() {
      return this;
    }
    rotate() {
      return this;
    }
    transformPoint(p: unknown) {
      return p;
    }
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

// Simple in-memory rate limiter per IP
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour

export const onRequestPost = async (context: { request: Request }): Promise<Response> => {
  try {
    const clientIp = context.request.headers.get('cf-connecting-ip') || '127.0.0.1';
    const now = Date.now();
    let record = rateLimitMap.get(clientIp);

    if (!record || now > record.resetTime) {
      record = { count: 1, resetTime: now + RATE_LIMIT_WINDOW };
      rateLimitMap.set(clientIp, record);
    } else {
      record.count++;
      if (record.count > RATE_LIMIT_MAX) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Maximum 5 conversions per hour.' }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'X-Deletion-Policy': 'Files are deleted immediately after conversion.',
            },
          },
        );
      }
    }

    const formData = await context.request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return new Response(JSON.stringify({ error: 'No file uploaded.' }), {
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
        'X-Deletion-Policy':
          'Files are processed securely and deleted immediately after conversion.',
      },
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to convert PDF to Word.';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
