import type { Quote } from '@tt/shared';
import { describe, expect, it } from 'vitest';
import { applyServerMessage, initialMarketState, withStatus } from './marketState';

function quote(seq: number, bid: string): Quote {
  return { symbol: 'XAUUSD', bid, ask: bid, ts: seq, seq };
}

describe('applyServerMessage', () => {
  it('uses the snapshot quote as the session open', () => {
    const state = applyServerMessage(initialMarketState, {
      type: 'snapshot',
      quotes: [quote(1, '4000.00')],
    });
    expect(state.symbols.XAUUSD?.open.bid).toBe('4000.00');
  });

  it('keeps the first quote as open and the prior quote as previous', () => {
    let state = applyServerMessage(initialMarketState, {
      type: 'quote',
      quote: quote(1, '4000.00'),
    });
    state = applyServerMessage(state, { type: 'quote', quote: quote(2, '4001.00') });
    state = applyServerMessage(state, { type: 'quote', quote: quote(3, '4002.00') });
    expect(state.symbols.XAUUSD).toMatchObject({
      open: { bid: '4000.00' },
      previous: { bid: '4001.00' },
      quote: { bid: '4002.00' },
    });
  });

  it('ignores a quote that is older than the one already held', () => {
    let state = applyServerMessage(initialMarketState, {
      type: 'quote',
      quote: quote(5, '4005.00'),
    });
    state = applyServerMessage(state, { type: 'quote', quote: quote(4, '4004.00') });
    expect(state.symbols.XAUUSD?.quote.bid).toBe('4005.00');
  });

  it('returns the same state object for pong', () => {
    expect(applyServerMessage(initialMarketState, { type: 'pong', ts: 1 })).toBe(
      initialMarketState,
    );
  });
});

describe('withStatus', () => {
  it('returns the same object when the status is unchanged, avoiding a re-render', () => {
    expect(withStatus(initialMarketState, 'connecting')).toBe(initialMarketState);
  });
});
