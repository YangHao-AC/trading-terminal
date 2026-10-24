export type InstrumentSymbol = 'XAUUSD' | 'USDCNY';

/**
 * Prices are decimal strings, never JS numbers: a number like 4012.3 cannot be
 * represented exactly in binary floating point, and the error compounds in P&L math.
 */
export interface Quote {
  symbol: InstrumentSymbol;
  /** Best price the market will buy at — what you receive when you sell. */
  bid: string;
  /** Best price the market will sell at — what you pay when you buy. */
  ask: string;
  /** Server time, epoch milliseconds. */
  ts: number;
  /** Per-symbol sequence number; a gap means a message was lost. */
  seq: number;
}

export type ServerMessage =
  | { type: 'snapshot'; quotes: Quote[] }
  | { type: 'quote'; quote: Quote }
  | { type: 'pong'; ts: number };

export type ClientMessage = { type: 'ping'; ts: number };
