import { describe, expect, it } from 'vitest';
import {
  clampProgress,
  isCancelRequest,
  isRunRequest,
  isWorkerResponse,
} from '../src/lib/pdf/messages';

describe('clampProgress', () => {
  it('keeps values inside 0 to 100 and rounds them', () => {
    expect(clampProgress(50)).toBe(50);
    expect(clampProgress(33.6)).toBe(34);
    expect(clampProgress(-5)).toBe(0);
    expect(clampProgress(140)).toBe(100);
  });

  it('treats nonsense values as zero', () => {
    expect(clampProgress(Number.NaN)).toBe(0);
    expect(clampProgress(Number.POSITIVE_INFINITY)).toBe(0);
  });

  it('keeps the exact bounds as whole numbers', () => {
    expect(clampProgress(0)).toBe(0);
    expect(clampProgress(100)).toBe(100);
  });
});

describe('isRunRequest', () => {
  it('accepts a well formed run request', () => {
    expect(
      isRunRequest({ id: 'merge-1', type: 'run', tool: 'merge', files: [] }),
    ).toBe(true);
  });

  it('rejects anything else', () => {
    expect(isRunRequest(null)).toBe(false);
    expect(isRunRequest({ type: 'run', id: 'merge-1', tool: 'merge' })).toBe(false);
    expect(isRunRequest({ type: 'cancel', id: 'merge-1' })).toBe(false);
  });

  it('rejects ids, tools, and files that are not of the right shape', () => {
    expect(isRunRequest({ type: 'run', id: 7, tool: 'merge', files: [] })).toBe(false);
    expect(isRunRequest({ type: 'run', id: 'merge-1', tool: null, files: [] })).toBe(false);
    expect(isRunRequest({ type: 'run', id: 'merge-1', tool: 'merge', files: 'x' })).toBe(false);
  });
});

describe('isCancelRequest', () => {
  it('accepts a cancel message with an id', () => {
    expect(isCancelRequest({ id: 'merge-1', type: 'cancel' })).toBe(true);
  });

  it('rejects a run message', () => {
    expect(isCancelRequest({ id: 'merge-1', type: 'run', tool: 'merge', files: [] })).toBe(false);
  });

  it('rejects a cancel without a string id', () => {
    expect(isCancelRequest({ type: 'cancel' })).toBe(false);
    expect(isCancelRequest({ type: 'cancel', id: 7 })).toBe(false);
  });
});

describe('isWorkerResponse', () => {
  it('accepts progress, result, and error messages', () => {
    expect(isWorkerResponse({ id: 'a', type: 'progress', percent: 10 })).toBe(true);
    expect(isWorkerResponse({ id: 'a', type: 'result', file: new ArrayBuffer(0), name: 'x.pdf' })).toBe(true);
    expect(isWorkerResponse({ id: 'a', type: 'error', message: 'boom' })).toBe(true);
  });

  it('rejects messages without an id or of an unknown type', () => {
    expect(isWorkerResponse({ type: 'progress', percent: 10 })).toBe(false);
    expect(isWorkerResponse({ id: 'a', type: 'shout' })).toBe(false);
    expect(isWorkerResponse('progress')).toBe(false);
    expect(isWorkerResponse(undefined)).toBe(false);
  });

  it('rejects a known type whose id is not a string', () => {
    expect(isWorkerResponse({ id: 7, type: 'progress', percent: 10 })).toBe(false);
    expect(isWorkerResponse({ id: null, type: 'error', message: 'boom' })).toBe(false);
  });
});
