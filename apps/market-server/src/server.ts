import type { ClientMessage, ServerMessage } from '@tt/shared';
import { WebSocket, WebSocketServer } from 'ws';
import type { Feed } from './feed';

export interface MarketServer {
  port: number;
  close(): Promise<void>;
}

function send(socket: WebSocket, message: ServerMessage) {
  if (socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify(message));
}

function parseClientMessage(raw: string): ClientMessage | undefined {
  try {
    const message = JSON.parse(raw) as ClientMessage;
    return message.type === 'ping' ? message : undefined;
  } catch {
    return undefined;
  }
}

export function startMarketServer(port: number, feed: Feed): Promise<MarketServer> {
  const wss = new WebSocketServer({ port });

  wss.on('connection', (socket) => {
    send(socket, { type: 'snapshot', quotes: feed.snapshot() });
    socket.on('message', (raw) => {
      const message = parseClientMessage(raw.toString());
      if (!message) {
        console.warn(`[market-server] ignored invalid client message: ${raw.toString()}`);
        return;
      }
      send(socket, { type: 'pong', ts: Date.now() });
    });
  });

  const unsubscribe = feed.subscribe((quote) => {
    for (const client of wss.clients) send(client, { type: 'quote', quote });
  });

  return new Promise((resolve, reject) => {
    wss.once('error', reject);
    wss.once('listening', () => {
      const address = wss.address();
      resolve({
        port: typeof address === 'object' && address !== null ? address.port : port,
        close: () =>
          new Promise((done) => {
            unsubscribe();
            for (const client of wss.clients) client.terminate();
            wss.close(() => done());
          }),
      });
    });
  });
}
