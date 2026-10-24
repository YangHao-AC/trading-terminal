import { createFeed } from './feed';
import { createRandomWalkModel } from './models/randomWalk';
import { createSeededRandom } from './random';
import { startMarketServer } from './server';

const PORT = Number(process.env.MARKET_PORT ?? 8787);
const TICK_INTERVAL_MS = 250;
const random = createSeededRandom(Date.now());

const feed = createFeed({
  intervalMs: TICK_INTERVAL_MS,
  instruments: [
    {
      spec: { symbol: 'XAUUSD', spread: 0.3, decimals: 2 },
      model: createRandomWalkModel({ initialPrice: 4000, maxStep: 0.5, random }),
    },
    {
      spec: { symbol: 'USDCNY', spread: 0.001, decimals: 4 },
      model: createRandomWalkModel({ initialPrice: 7.1, maxStep: 0.0005, random }),
    },
  ],
});

const server = await startMarketServer(PORT, feed);
feed.start();
console.log(`[market-server] ws://localhost:${server.port}`);

function shutdown() {
  feed.stop();
  void server.close().then(() => process.exit(0));
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
