import { QuoteBoard } from './components/QuoteBoard';
import { useMarketFeed } from './market/useMarketFeed';

const STATUS_LABEL = { connecting: '连接中', open: '已连接', closed: '已断开' } as const;

export function App() {
  const market = useMarketFeed();

  return (
    <main className="app">
      <header className="app-header">
        <h1>Trading Terminal</h1>
        <span className={`status status-${market.status}`}>{STATUS_LABEL[market.status]}</span>
      </header>
      <QuoteBoard market={market} />
      <p className="muted disclaimer">模拟行情，仅供学习，不构成投资建议。</p>
    </main>
  );
}
