import { spreadOf, type InstrumentSymbol } from '@tt/shared';
import Decimal from 'decimal.js';
import type { MarketState, SymbolState } from '../market/marketState';

const SYMBOLS: { symbol: InstrumentSymbol; label: string; unit: string }[] = [
  { symbol: 'XAUUSD', label: '伦敦金', unit: 'USD/oz' },
  { symbol: 'USDCNY', label: '美元/人民币', unit: 'CNY' },
];

type Direction = 'up' | 'down' | 'flat';

function directionOf(from: string, to: string): Direction {
  const cmp = new Decimal(to).comparedTo(from);
  return cmp > 0 ? 'up' : cmp < 0 ? 'down' : 'flat';
}

function decimalsOf(price: string): number {
  return price.split('.')[1]?.length ?? 0;
}

function QuoteRow({ label, unit, state }: { label: string; unit: string; state?: SymbolState }) {
  if (!state) {
    return (
      <tr>
        <td>{label}</td>
        <td colSpan={5} className="muted">
          等待行情…
        </td>
      </tr>
    );
  }

  const { quote, previous, open } = state;
  const tick = previous ? directionOf(previous.bid, quote.bid) : 'flat';
  const change = new Decimal(quote.bid).minus(open.bid);
  const changePct = change.div(open.bid).times(100);
  const session = directionOf(open.bid, quote.bid);
  const decimals = decimalsOf(quote.bid);

  return (
    <tr>
      <td>
        {label}
        <span className="muted unit">{unit}</span>
      </td>
      <td className={`price tick-${tick}`}>{quote.bid}</td>
      <td className={`price tick-${tick}`}>{quote.ask}</td>
      <td className="price muted">{new Decimal(spreadOf(quote)).toFixed(decimals)}</td>
      <td className={`price session-${session}`}>{change.toFixed(decimals)}</td>
      <td className={`price session-${session}`}>{changePct.toFixed(3)}%</td>
    </tr>
  );
}

export function QuoteBoard({ market }: { market: MarketState }) {
  return (
    <table className="quote-board">
      <thead>
        <tr>
          <th>品种</th>
          <th>买价 Bid</th>
          <th>卖价 Ask</th>
          <th>点差</th>
          <th>涨跌</th>
          <th>涨跌幅</th>
        </tr>
      </thead>
      <tbody>
        {SYMBOLS.map(({ symbol, label, unit }) => (
          <QuoteRow key={symbol} label={label} unit={unit} state={market.symbols[symbol]} />
        ))}
      </tbody>
    </table>
  );
}
