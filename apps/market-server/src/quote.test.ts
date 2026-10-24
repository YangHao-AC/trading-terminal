import { describe, expect, it } from 'vitest';
import { toQuote } from './quote';

const XAU = { symbol: 'XAUUSD', spread: 0.3, decimals: 2 } as const;

describe('toQuote', () => {
  it.each([4000, 4000.005, 4012.345, 3999.994999])(
    'keeps the spread exactly 0.30 at mid %s',
    (mid) => {
      const quote = toQuote(XAU, mid, 0, 1);
      expect(Math.round((Number(quote.ask) - Number(quote.bid)) * 100)).toBe(30);
    },
  );

  it('centres bid and ask around the rounded mid', () => {
    expect(toQuote(XAU, 4000, 0, 1)).toMatchObject({ bid: '3999.85', ask: '4000.15' });
  });

  it('pads to the configured number of decimals', () => {
    const quote = toQuote({ symbol: 'USDCNY', spread: 0.001, decimals: 4 }, 7.1, 0, 1);
    expect(quote).toMatchObject({ bid: '7.0995', ask: '7.1005' });
  });
});
