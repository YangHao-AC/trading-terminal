import type { InstrumentSymbol, Quote } from '@tt/shared';

export interface QuoteSpec {
  symbol: InstrumentSymbol;
  /** Full bid/ask spread in price units; must be an even number of minor units. */
  spread: number;
  /** Decimal places quoted, e.g. 2 for XAUUSD, 4 for USDCNY. */
  decimals: number;
}

/**
 * Rounds the mid to the quote grid first, then offsets in integer minor units,
 * so ask - bid is exactly the configured spread on every tick.
 */
export function toQuote(spec: QuoteSpec, mid: number, ts: number, seq: number): Quote {
  const scale = 10 ** spec.decimals;
  const midUnits = Math.round(mid * scale);
  const halfSpreadUnits = Math.round((spec.spread * scale) / 2);
  return {
    symbol: spec.symbol,
    bid: ((midUnits - halfSpreadUnits) / scale).toFixed(spec.decimals),
    ask: ((midUnits + halfSpreadUnits) / scale).toFixed(spec.decimals),
    ts,
    seq,
  };
}
