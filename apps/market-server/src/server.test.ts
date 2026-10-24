import type { Quote, ServerMessage } from '@tt/shared';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { WebSocket } from 'ws';
import type { Feed, QuoteListener } from './feed';
import { startMarketServer, type MarketServer } from './server';

const QUOTE: Quote = { symbol: 'XAUUSD', bid: '3999.85', ask: '4000.15', ts: 1, seq: 1 };

function fakeFeed() {
  const listeners = new Set<QuoteListener>();
  const feed: Feed = {
    start: () => {},
    stop: () => {},
    snapshot: () => [QUOTE],
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
  return { feed, emit: (quote: Quote) => listeners.forEach((l) => l(quote)) };
}

function connect(port: number) {
  const socket = new WebSocket(`ws://localhost:${port}`);
  const messages: ServerMessage[] = [];
  const waiters: (() => void)[] = [];
  socket.on('message', (raw) => {
    messages.push(JSON.parse(raw.toString()) as ServerMessage);
    waiters.splice(0).forEach((resolve) => resolve());
  });
  const nextMessage = async (): Promise<ServerMessage> => {
    const index = messages.length;
    while (messages.length <= index) await new Promise<void>((r) => waiters.push(r));
    return messages[index]!;
  };
  return { socket, nextMessage, opened: new Promise((r) => socket.once('open', r)) };
}

describe('startMarketServer', () => {
  let server: MarketServer | undefined;
  afterEach(async () => {
    await server?.close();
    server = undefined;
  });

  it('sends a snapshot to a newly connected client', async () => {
    server = await startMarketServer(0, fakeFeed().feed);
    const client = connect(server.port);
    expect(await client.nextMessage()).toEqual({ type: 'snapshot', quotes: [QUOTE] });
  });

  it('broadcasts feed quotes to connected clients', async () => {
    const { feed, emit } = fakeFeed();
    server = await startMarketServer(0, feed);
    const client = connect(server.port);
    await client.nextMessage();
    emit({ ...QUOTE, seq: 2 });
    expect(await client.nextMessage()).toEqual({ type: 'quote', quote: { ...QUOTE, seq: 2 } });
  });

  it('answers ping with pong', async () => {
    server = await startMarketServer(0, fakeFeed().feed);
    const client = connect(server.port);
    await client.nextMessage();
    client.socket.send(JSON.stringify({ type: 'ping', ts: 1 }));
    expect(await client.nextMessage()).toMatchObject({ type: 'pong' });
  });

  it('logs and ignores malformed client messages', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    server = await startMarketServer(0, fakeFeed().feed);
    const client = connect(server.port);
    await client.nextMessage();
    client.socket.send('not json');
    client.socket.send(JSON.stringify({ type: 'ping', ts: 1 }));
    expect(await client.nextMessage()).toMatchObject({ type: 'pong' });
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('not json'));
    warn.mockRestore();
  });
});
