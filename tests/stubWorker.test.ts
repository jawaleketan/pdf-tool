import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { startStubWorker } from '../src/lib/pdf/stubWorker';

/**
 * Covers: worker message contract (spec 0001 scaffold criteria).
 *
 * startStubWorker writes to the worker scope, so the test provides that scope
 * (globalThis.self) and reads back every posted message. The three real worker
 * entries are one line each and delegate here, so this covers their behavior.
 */

const posted: unknown[] = [];
let scope: {
  postMessage: (message: unknown) => void;
  onmessage: ((event: MessageEvent<unknown>) => void) | null;
};

function deliver(data: unknown): void {
  if (!scope.onmessage) throw new Error('the worker never registered its message handler');
  scope.onmessage({ data } as MessageEvent<unknown>);
}

describe('startStubWorker', () => {
  beforeEach(() => {
    posted.length = 0;
    scope = {
      postMessage: (message: unknown) => posted.push(message),
      onmessage: null,
    };
    vi.stubGlobal('self', scope);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('answers a run with a progress ping and an honest error naming the release', () => {
    startStubWorker('merge');

    deliver({ id: 'merge-1', type: 'run', tool: 'merge', files: [] });

    expect(posted).toEqual([
      { id: 'merge-1', type: 'progress', percent: 0 },
      {
        id: 'merge-1',
        type: 'error',
        message:
          'The merge tool ships in Release 1. The worker scaffold is in place and ready for it.',
      },
    ]);
  });

  it.each([
    ['split', 'Release 2'],
    ['compress', 'Release 3'],
  ])('names the right release for the %s tool', (tool, release) => {
    startStubWorker(tool as 'split' | 'compress');

    deliver({ id: `${tool}-1`, type: 'run', tool, files: [] });

    expect(posted).toContainEqual(
      expect.objectContaining({ type: 'error', message: expect.stringContaining(release) }),
    );
  });

  it('ignores a run addressed to a different tool', () => {
    startStubWorker('merge');

    deliver({ id: 'split-1', type: 'run', tool: 'split', files: [] });

    expect(posted).toEqual([]);
  });

  it('pings progress but sends no error when the run was cancelled first', () => {
    startStubWorker('merge');

    deliver({ id: 'merge-1', type: 'cancel' });
    deliver({ id: 'merge-1', type: 'run', tool: 'merge', files: [] });

    expect(posted).toEqual([{ id: 'merge-1', type: 'progress', percent: 0 }]);
  });

  it('ignores messages that fail the contract guards', () => {
    startStubWorker('merge');

    deliver(null);
    deliver({ type: 'run', tool: 'merge', files: [] });
    deliver({ id: 42, type: 'cancel' });

    expect(posted).toEqual([]);
  });
});
