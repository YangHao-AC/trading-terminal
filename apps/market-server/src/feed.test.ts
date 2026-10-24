import type { Quote } from '@tt/shared';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createFeed, type Instrument } from './feed';

function constantInstrument(symbol: 'XAUUSD' | 'USDCNY', price: number): Instrument {
  return {
    spec: { symbol, spread: 0, decimals: 2 },
    model: { next: () => price },
  };
}

describe('createFeed', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  function setup() {
    const feed = createFeed({
      instruments: [constantInstrument('XAUUSD', 4000), constantInstrument('USDCNY', 7.1)],
      intervalMs: 100,
      now: () => 123,
    });
    const received: Quote[] = [];
    const unsubscribe = feed.subscribe((q) => received.push(q));
    return { feed, received, unsubscribe };
  }

  it('emits one quote per instrument immediately on start', () => {
    const { feed, received } = setup();
    feed.start();
    expect(received.map((q) => q.symbol)).toEqual(['XAUUSD', 'USDCNY']);
  });

  it('increments the sequence number per symbol on every tick', () => {
    const { feed, received } = setup();
    feed.start();
    vi.advanceTimersByTime(200);
    expect(received.filter((q) => q.symbol === 'XAUUSD').map((q) => q.seq)).toEqual([1, 2, 3]);
  });

  it('keeps the latest quote per symbol in the snapshot', () => {
    const { feed } = setup();
    feed.start();
    vi.advanceTimersByTime(100);
    expect(feed.snapshot().map((q) => [q.symbol, q.seq])).toEqual([
      ['XAUUSD', 2],
      ['USDCNY', 2],
    ]);
  });

  it('stops notifying a listener after it unsubscribes', () => {
    const { feed, received, unsubscribe } = setup();
    feed.start();
    unsubscribe();
    vi.advanceTimersByTime(500);
    expect(received).toHaveLength(2);
  });

  it('stops ticking after stop()', () => {
    const { feed, received } = setup();
    feed.start();
    feed.stop();
    vi.advanceTimersByTime(500);
    expect(received).toHaveLength(2);
  });
});
