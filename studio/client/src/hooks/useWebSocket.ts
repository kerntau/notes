import { useEffect, useState, useRef } from 'react';
import { ProcessStatus } from '../types';

export function useWebSocket() {
  const [logs, setLogs] = useState<string[]>([]);
  const [procStatus, setProcStatus] = useState<ProcessStatus>({ isRunning: false, mode: 'idle' });
  const [lastFileChange, setLastFileChange] = useState<{ event: string; path: string } | null>(null);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
   const wsUrl = `${protocol}//${host}/ws`;
    let retryTimer: number | undefined;
    let disposed = false;

    const connect = () => {
      if (disposed) return;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;
      ws.onopen = () => setConnected(true);
      ws.onclose = () => {
        setConnected(false);
        wsRef.current = null;
        if (!disposed) retryTimer = window.setTimeout(connect, 3000);
      };
      ws.onerror = () => ws.close();
      ws.onmessage = event => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === 'LOG') setLogs(prev => [...prev.slice(-400), payload.data]);
          else if (payload.type === 'LOG_BATCH') setLogs(payload.data || []);
          else if (payload.type === 'STATUS_UPDATE') setProcStatus(payload.data);
          else if (payload.type === 'FILE_CHANGE') setLastFileChange(payload.data);
        } catch (e) {}
      };
    };

    connect();
    return () => {
      disposed = true;
      if (retryTimer !== undefined) window.clearTimeout(retryTimer);
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, []);

  const clearLogs = () => setLogs([]);

  return { connected, logs, procStatus, lastFileChange, clearLogs };
}
