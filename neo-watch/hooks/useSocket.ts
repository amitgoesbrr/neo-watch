"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { ChatMessage } from "@/lib/api";

// {{{ Types
export interface SocketUser {
  id: string;
  name: string;
}

export type WSEvent =
  | { type: "connected"; asteroidId: string; user: SocketUser; onlineCount: number }
  | { type: "message"; message: ChatMessage }
  | { type: "user_joined"; user: SocketUser; onlineCount: number; timestamp: string }
  | { type: "user_left"; user: SocketUser; onlineCount: number; timestamp: string }
  | { type: "typing"; user: SocketUser }
  | { type: "stop_typing"; user: SocketUser }
  | { type: "error"; message: string };
// }}}

// {{{ Hook Config
const WS_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000")
  .replace(/^http/, "ws")
  .replace(/\/api$/, "");
// }}}

// {{{ useSocket Hook
export function useSocket(asteroidId: string) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const mountedRef = useRef(false);

  const [connected, setConnected] = useState(false);
  const [onlineCount, setOnlineCount] = useState(0);
  const [typingUsers, setTypingUsers] = useState<SocketUser[]>([]);
  const [lastMessage, setLastMessage] = useState<ChatMessage | null>(null);

  // Callbacks stored in refs to avoid stale closures
  const onMessageCallback = useRef<((msg: ChatMessage) => void) | null>(null);
  const onUserJoined = useRef<((user: SocketUser, count: number) => void) | null>(null);
  const onUserLeft = useRef<((user: SocketUser, count: number) => void) | null>(null);

  // Typing indicator timeout management
  const typingTimers = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const clearTypingUser = useCallback((userId: string) => {
    setTypingUsers((prev) => prev.filter((u) => u.id !== userId));
    const timer = typingTimers.current.get(userId);
    if (timer) {
      clearTimeout(timer);
      typingTimers.current.delete(userId);
    }
  }, []);

  const connect = useCallback(() => {
    // Guard: don't connect if unmounted or already connecting/open
    if (!mountedRef.current) return;
    if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
      return;
    }

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token || !asteroidId) return;

    const url = `${WS_BASE}/ws/chat/${asteroidId}?token=${encodeURIComponent(token)}`;
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      if (!mountedRef.current) {
        ws.close(1000, "Unmounted before open");
        return;
      }
      console.log(`[WS] Connected to asteroid ${asteroidId}`);
      reconnectAttempts.current = 0;
    };

    ws.onmessage = (event) => {
      try {
        const data: WSEvent = JSON.parse(event.data);

        switch (data.type) {
          case "connected":
            setConnected(true);
            setOnlineCount(data.onlineCount);
            break;

          case "message":
            setLastMessage(data.message);
            onMessageCallback.current?.(data.message);
            break;

          case "user_joined":
            setOnlineCount(data.onlineCount);
            onUserJoined.current?.(data.user, data.onlineCount);
            break;

          case "user_left":
            setOnlineCount(data.onlineCount);
            clearTypingUser(data.user.id);
            onUserLeft.current?.(data.user, data.onlineCount);
            break;

          case "typing": {
            setTypingUsers((prev) => {
              if (prev.find((u) => u.id === data.user.id)) return prev;
              return [...prev, data.user];
            });
            const existingTimer = typingTimers.current.get(data.user.id);
            if (existingTimer) clearTimeout(existingTimer);
            typingTimers.current.set(
              data.user.id,
              setTimeout(() => clearTypingUser(data.user.id), 3000)
            );
            break;
          }

          case "stop_typing":
            clearTypingUser(data.user.id);
            break;

          case "error":
            console.error("[WS] Server error:", data.message);
            break;
        }
      } catch (err) {
        console.error("[WS] Failed to parse message:", err);
      }
    };

    ws.onclose = (event) => {
      setConnected(false);
      wsRef.current = null;

      // Reconnect unless intentional close (code 1000) or unmounted
      if (mountedRef.current && event.code !== 1000 && reconnectAttempts.current < maxReconnectAttempts) {
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
        console.log(`[WS] Reconnecting in ${delay}ms (attempt ${reconnectAttempts.current + 1})`);
        reconnectTimer.current = setTimeout(() => {
          reconnectAttempts.current++;
          connect();
        }, delay);
      }
    };

    ws.onerror = (err) => {
      console.error("[WS] Connection error:", err);
    };
  }, [asteroidId, clearTypingUser]);

  // Single effect keyed on asteroidId — resilient to Strict Mode double-mount
  useEffect(() => {
    mountedRef.current = true;
    // Small delay so that Strict Mode's unmount→remount settles before connecting
    const initTimer = setTimeout(() => {
      if (mountedRef.current) connect();
    }, 50);

    const timersRef = typingTimers.current;

    return () => {
      mountedRef.current = false;
      clearTimeout(initTimer);
      if (reconnectTimer.current) {
        clearTimeout(reconnectTimer.current);
        reconnectTimer.current = null;
      }
      if (wsRef.current) {
        wsRef.current.close(1000, "Component unmounted");
        wsRef.current = null;
      }
      timersRef.forEach((timer) => clearTimeout(timer));
      timersRef.clear();
      setConnected(false);
      setOnlineCount(0);
      setTypingUsers([]);
    };
  }, [asteroidId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Send message
  const sendMessage = useCallback((content: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "message", content }));
    }
  }, []);

  // Send typing indicator
  const sendTyping = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "typing" }));
    }
  }, []);

  // Send stop typing
  const sendStopTyping = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "stop_typing" }));
    }
  }, []);

  // Subscribe to messages
  const onMessage = useCallback((cb: (msg: ChatMessage) => void) => {
    onMessageCallback.current = cb;
  }, []);

  return {
    connected,
    onlineCount,
    typingUsers,
    lastMessage,
    sendMessage,
    sendTyping,
    sendStopTyping,
    onMessage,
    reconnect: connect,
  };
}
// }}}

export default useSocket;
