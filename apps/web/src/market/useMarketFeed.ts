import type { ServerMessage } from '@tt/shared';
import { useEffect, useReducer } from 'react';
import {
  applyServerMessage,
  initialMarketState,
  withStatus,
  type ConnectionStatus,
  type MarketState,
} from './marketState';

type Action =
  { type: 'message'; message: ServerMessage } | { type: 'status'; status: ConnectionStatus };

function reducer(state: MarketState, action: Action): MarketState {
  return action.type === 'message'
    ? applyServerMessage(state, action.message)
    : withStatus(state, action.status);
}

function marketFeedUrl(): string {
  const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${location.host}/ws`;
}

/**
 * Minimal connection: no reconnect, no heartbeat yet (练习 3).
 * Stop the market server while the page is open to see why that matters.
 */
export function useMarketFeed(): MarketState {
  const [state, dispatch] = useReducer(reducer, initialMarketState);

  useEffect(() => {
    const socket = new WebSocket(marketFeedUrl());
    dispatch({ type: 'status', status: 'connecting' });
    socket.onopen = () => dispatch({ type: 'status', status: 'open' });
    socket.onclose = () => dispatch({ type: 'status', status: 'closed' });
    socket.onmessage = (event: MessageEvent<string>) => {
      dispatch({ type: 'message', message: JSON.parse(event.data) as ServerMessage });
    };
    return () => socket.close();
  }, []);

  return state;
}
