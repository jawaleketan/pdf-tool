import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createToolWorker } from '../src/lib/pdf/createToolWorker';

/**
 * Covers: worker message contract (spec 0001 scaffold criteria).
 *
 * The worker constructors arrive through Vite's `?worker` import form, so the
 * three worker modules are replaced with one fake that records everything the
 * helper posts and lets the test deliver responses back.
 */

const fake = vi.hoisted(() => {
  const instances: FakeWorker[] = [];

  class FakeWorker {
    posted: unknown[] = [];
    onmessage: ((event: { data: unknown }) => void) | null = null;
    terminated = false;

    constructor() {
      instances.push(this);
    }

    postMessage(message: unknown): void {
      this.posted.push(message);
    }

    terminate(): void {
      this.terminated = true;
    }

    emit(data: unknown): void {
      this.onmessage?.({ data });
    }
  }

  return { instances, FakeWorker };
});

vi.mock('../src/workers/merge.worker?worker', () => ({ default: fake.FakeWorker }));
vi.mock('../src/workers/split.worker?worker', () => ({ default: fake.FakeWorker }));
vi.mock('../src/workers/compress.worker?worker', () => ({ default: fake.FakeWorker }));

function lastWorker() {
  const instance = fake.instances.at(-1);
  if (!instance) throw new Error('no fake worker was constructed');
  return instance;
}

describe('createToolWorker', () => {
  beforeEach(() => {
    fake.instances.length = 0;
  });

  it('posts a typed run request and returns its id', () => {
    // Arrange
    const files = [new ArrayBuffer(8)];
    const worker = createToolWorker('merge');

    // Act
    const id = worker.run(files, { parts: 2 });

    // Assert
    expect(id).toBe('merge-1');
    expect(lastWorker().posted).toEqual([
      { id: 'merge-1', type: 'run', tool: 'merge', files, payload: { parts: 2 } },
    ]);
  });

  it('gives each run a fresh id so cancels target the right run', () => {
    const worker = createToolWorker('merge');

    expect(worker.run([])).toBe('merge-1');
    expect(worker.run([])).toBe('merge-2');
  });

  it('starts the worker that belongs to the requested tool', () => {
    const worker = createToolWorker('compress');

    worker.run([]);

    expect(lastWorker().posted).toMatchObject([{ type: 'run', tool: 'compress' }]);
    expect(fake.instances).toHaveLength(1);
  });

  it('routes responses to the matching handler and clamps the percent', () => {
    const onProgress = vi.fn();
    const onResult = vi.fn();
    const onError = vi.fn();
    const file = new ArrayBuffer(4);
    const worker = createToolWorker('merge');

    worker.run([], undefined, { onProgress, onResult, onError });

    const active = lastWorker();
    active.emit({ id: 'merge-1', type: 'progress', percent: 150 });
    active.emit({ id: 'merge-1', type: 'progress', percent: Number.NaN });
    active.emit({ id: 'merge-1', type: 'result', file, name: 'merged.pdf' });
    active.emit({ id: 'merge-1', type: 'error', message: 'boom' });

    expect(onProgress.mock.calls).toEqual([[100], [0]]);
    expect(onResult).toHaveBeenCalledWith({ file, name: 'merged.pdf' });
    expect(onError).toHaveBeenCalledWith('boom');
  });

  it('ignores messages addressed to a different run', () => {
    const onError = vi.fn();
    const worker = createToolWorker('merge');

    worker.run([], undefined, { onError });
    lastWorker().emit({ id: 'merge-2', type: 'error', message: 'stale' });

    expect(onError).not.toHaveBeenCalled();
  });

  it('ignores messages that fail the contract guard', () => {
    const onProgress = vi.fn();
    const worker = createToolWorker('split');

    worker.run([], undefined, { onProgress });
    lastWorker().emit({ type: 'progress', percent: 10 });
    lastWorker().emit({ id: 'split-1', type: 'shout' });

    expect(onProgress).not.toHaveBeenCalled();
  });

  it('posts a typed cancel request with the given id', () => {
    const worker = createToolWorker('merge');

    worker.run([]);
    worker.cancel('merge-1');

    expect(lastWorker().posted[1]).toEqual({ id: 'merge-1', type: 'cancel' });
  });

  it('terminates the underlying worker', () => {
    const worker = createToolWorker('compress');

    worker.terminate();

    expect(lastWorker().terminated).toBe(true);
  });
});
