import type { InstrumentSymbol, Quote } from '@tt/shared';
import type { PriceModel } from './models/types';
import { toQuote, type QuoteSpec } from './quote';

export interface Instrument {
  spec: QuoteSpec;
  model: PriceModel;
}

export type QuoteListener = (quote: Quote) => void;

export interface Feed {
  start(): void;
  stop(): void;
  /** Latest quote per symbol, sent to newly connected clients. */
  snapshot(): Quote[];
  subscribe(listener: QuoteListener): () => void;
}

export interface FeedOptions {
  instruments: Instrument[];
  intervalMs: number;
  now?: () => number;
}

export function createFeed({ instruments, intervalMs, now = Date.now }: FeedOptions): Feed {
  const latest = new Map<InstrumentSymbol, Quote>();
  const seqs = new Map<InstrumentSymbol, number>();
  const listeners = new Set<QuoteListener>();
  let timer: ReturnType<typeof setInterval> | undefined;

  function tick() {
    for (const { spec, model } of instruments) {
      const seq = (seqs.get(spec.symbol) ?? 0) + 1;
      seqs.set(spec.symbol, seq);
      const quote = toQuote(spec, model.next(), now(), seq);
      latest.set(spec.symbol, quote);
      for (const listener of listeners) listener(quote);
    }
  }

  return {
    start() {
      if (timer !== undefined) return;
      tick();
      timer = setInterval(tick, intervalMs);
    },
    stop() {
      clearInterval(timer);
      timer = undefined;
    },
    snapshot() {
      return [...latest.values()];
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
