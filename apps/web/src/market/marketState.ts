import type { InstrumentSymbol, Quote, ServerMessage } from '@tt/shared';

export type ConnectionStatus = 'connecting' | 'open' | 'closed';

export interface SymbolState {
  quote: Quote;
  previous?: Quote;
  /** First quote seen this session; the baseline for change %. */
  open: Quote;
}

export interface MarketState {
  status: ConnectionStatus;
  symbols: Partial<Record<InstrumentSymbol, SymbolState>>;
}

export const initialMarketState: MarketState = { status: 'connecting', symbols: {} };

function applyQuote(symbols: MarketState['symbols'], quote: Quote): MarketState['symbols'] {
  const existing = symbols[quote.symbol];
  if (existing && quote.seq <= existing.quote.seq) return symbols;
  return {
    ...symbols,
    [quote.symbol]: { quote, previous: existing?.quote, open: existing?.open ?? quote },
  };
}

export function applyServerMessage(state: MarketState, message: ServerMessage): MarketState {
  switch (message.type) {
    case 'snapshot':
      return { ...state, symbols: message.quotes.reduce(applyQuote, state.symbols) };
    case 'quote':
      return { ...state, symbols: applyQuote(state.symbols, message.quote) };
    case 'pong':
      return state;
  }
}

export function withStatus(state: MarketState, status: ConnectionStatus): MarketState {
  return state.status === status ? state : { ...state, status };
}
