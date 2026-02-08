"use client";

import { useEffect, useState, use, useRef, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Send,
  Loader2,
  Users,
  MessageCircle,
  Radio,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { chatApi, neoApi, type ChatMessage, type NEO } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/hooks/useSocket";
import { TypingIndicator } from "@/components/chat/TypingIndicator";

export default function ChatPage({ params }: { params: Promise<{ asteroidId: string }> }) {
  const { asteroidId } = use(params);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [asteroid, setAsteroid] = useState<NEO | null>(null);
  const { user: currentUser, isAuthenticated } = useAuth();
  const scrollRef = useRef<HTMLDivElement>(null);
  const typingTimer = useRef<NodeJS.Timeout | null>(null);

  const {
    connected,
    onlineCount,
    typingUsers,
    sendMessage,
    sendTyping,
    sendStopTyping,
    onMessage,
  } = useSocket(asteroidId);

  // Fetch asteroid info
  useEffect(() => {
    async function fetchAsteroid() {
      try {
        const res = await neoApi.lookup(asteroidId);
        if (res.success && res.data) {
          setAsteroid(res.data.asteroid);
        }
      } catch (error) {
        console.error("Failed to fetch asteroid:", error);
      }
    }
    fetchAsteroid();
  }, [asteroidId]);

  // Fetch message history once
  const fetchMessages = useCallback(async () => {
    try {
      const res = await chatApi.getMessages(asteroidId, 100);
      if (res.success && res.data) {
        setMessages(res.data.messages);
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    } finally {
      setLoading(false);
    }
  }, [asteroidId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Listen for new messages via WebSocket
  useEffect(() => {
    onMessage((msg: ChatMessage) => {
      setMessages((prev) => {
        if (prev.find((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    });
  }, [onMessage]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Handle typing indicators
  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setNewMessage(e.target.value);
    sendTyping();

    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      sendStopTyping();
    }, 2000);
  }

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage.trim() || !isAuthenticated) return;

    sendMessage(newMessage.trim());
    setNewMessage("");
    sendStopTyping();
    if (typingTimer.current) clearTimeout(typingTimer.current);
  }

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-80px)] p-4 md:p-8">
      {/* Header */}
      <div className="shrink-0 mb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href={asteroid ? `/asteroids/${asteroidId}` : "/dashboard"}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-text-secondary" />
          </Link>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-white flex items-center gap-3">
              <MessageCircle className="w-6 h-6 text-nebula-purple" />
              Communications
            </h1>
            <p className="text-xs text-text-muted font-mono">
              CHANNEL: {asteroid?.name || asteroidId}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${connected ? 'bg-safe-green/10 border border-safe-green/20' : 'bg-danger-red/10 border border-danger-red/20'}`}>
            <span className={`w-2 h-2 rounded-full ${connected ? 'bg-safe-green animate-pulse' : 'bg-danger-red'}`} />
            <span className={`text-xs font-mono ${connected ? 'text-safe-green' : 'text-danger-red'}`}>
              {connected ? "LIVE" : "OFFLINE"}
            </span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10">
            <Users className="w-4 h-4 text-text-muted" />
            <span className="text-xs text-text-muted font-mono">{onlineCount} ONLINE</span>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 glass rounded-xl border border-white/10 overflow-hidden flex flex-col min-h-0">
        {/* Channel Info Bar */}
        <div className="shrink-0 p-4 border-b border-white/10 bg-white/5 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Radio className="w-5 h-5 text-plasma-cyan animate-pulse" />
              <div>
                <h3 className="font-bold text-white text-sm">
                  {asteroid?.name || `Object ${asteroidId}`}
                </h3>
                <p className="text-[10px] text-text-muted font-mono uppercase">
                  Secure Communication Frequency • All Messages Encrypted
                </p>
              </div>
            </div>
            {asteroid && (
              <Link
                href={`/asteroids/${asteroidId}`}
                className="text-[10px] text-nebula-purple hover:text-stellar-blue transition-colors font-mono uppercase"
              >
                View Object →
              </Link>
            )}
          </div>
        </div>

        {/* Messages Container */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 custom-scrollbar"
        >
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-3">
                <Loader2 className="w-8 h-8 animate-spin text-plasma-cyan mx-auto" />
                <p className="text-sm text-text-muted font-mono">
                  Establishing connection...
                </p>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
              <div className="p-6 rounded-full bg-white/5 border border-white/10">
                <MessageCircle className="w-12 h-12 text-white/20" />
              </div>
              <div>
                <p className="text-white/60 font-medium">No Transmissions Yet</p>
                <p className="text-xs text-text-muted mt-1">
                  Be the first to broadcast on this frequency
                </p>
              </div>
            </div>
          ) : (
            <AnimatePresence>
              {messages.map((msg, index) => {
                const isMe = currentUser?.id === msg.user.id;
                const showAvatar =
                  index === 0 || messages[index - 1].user.id !== msg.user.id;

                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className={`flex gap-3 ${isMe ? "flex-row-reverse" : ""}`}
                  >
                    {showAvatar ? (
                      <div className="w-10 h-10 rounded-full bg-nebula-purple/20 flex items-center justify-center shrink-0 border border-white/10 shadow-lg">
                        {msg.user.avatar ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={msg.user.avatar}
                            alt={msg.user.name}
                            className="w-full h-full rounded-full"
                          />
                        ) : (
                          <span className="text-sm font-bold text-white/70">
                            {msg.user.name[0]?.toUpperCase()}
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="w-10 shrink-0" />
                    )}

                    <div
                      className={`flex flex-col ${
                        isMe ? "items-end" : "items-start"
                      } max-w-[75%]`}
                    >
                      {showAvatar && (
                        <div className="flex items-center gap-2 mb-1 px-1">
                          <span className="text-xs font-bold text-white/60">
                            {msg.user.name}
                          </span>
                          <span className="text-[10px] text-white/30 font-mono">
                            {new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      )}
                      <div
                        className={`px-4 py-3 rounded-2xl text-sm shadow-md border ${
                          isMe
                            ? "bg-nebula-purple/20 border-nebula-purple/30 text-white rounded-tr-sm"
                            : "bg-white/5 border-white/10 text-white/90 rounded-tl-sm"
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
          {typingUsers.filter(u => u.id !== currentUser?.id).length > 0 && (
            <div className="flex items-center gap-2 pl-13">
              <TypingIndicator 
                userName={typingUsers.filter(u => u.id !== currentUser?.id).map(u => u.name).join(", ")} 
                size="sm" 
              />
            </div>
          )}
        </div>

        {/* Message Input */}
        <form
          onSubmit={handleSend}
          className="shrink-0 p-4 border-t border-white/10 bg-white/5 backdrop-blur-md"
        >
          {!isAuthenticated ? (
            <div className="text-center py-2">
              <p className="text-sm text-text-muted">
                <Link href="/login" className="text-nebula-purple hover:underline">
                  Sign in
                </Link>
                {" "}to join the conversation
              </p>
            </div>
          ) : (
            <div className="flex gap-3">
              <input
                type="text"
                value={newMessage}
                onChange={handleInputChange}
                placeholder={connected ? "Transmit message..." : "Connecting..."}
                disabled={!connected}
                className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-nebula-purple/50 placeholder:text-white/30 font-mono transition-all disabled:opacity-50"
              />
              <Button
                type="submit"
                disabled={!connected || !newMessage.trim()}
                className="h-12 w-12 p-0 rounded-xl bg-nebula-purple hover:bg-nebula-purple/80 shadow-lg shadow-nebula-purple/20 border border-white/10 transition-all"
              >
                <Send className="w-5 h-5 text-white" />
              </Button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
