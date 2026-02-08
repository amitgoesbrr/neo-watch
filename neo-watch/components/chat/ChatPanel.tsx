"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Send, User, Loader2, Wifi } from "lucide-react";
import { chatApi, type ChatMessage } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/hooks/useSocket";
import { TypingIndicator } from "@/components/chat/TypingIndicator";

interface ChatPanelProps {
  asteroidId: string;
}

export default function ChatPanel({ asteroidId }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
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

  // Fetch message history on mount
  const fetchMessages = useCallback(async () => {
    try {
      const res = await chatApi.getMessages(asteroidId);
      if (res.success && res.data) {
        setMessages(res.data.messages);
      }
    } catch (error) {
      console.error(error);
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
        // Avoid duplicates
        if (prev.find((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    });
  }, [onMessage]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Handle typing indicators
  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setNewMessage(e.target.value);
    sendTyping();

    // Clear previous timer
    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      sendStopTyping();
    }, 2000);
  }

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage.trim()) return;

    sendMessage(newMessage.trim());
    setNewMessage("");
    sendStopTyping();
    if (typingTimer.current) clearTimeout(typingTimer.current);
  }

  return (
    <div className="flex flex-col h-100 glass rounded-xl border border-white/10 overflow-hidden relative group">
        <div className="absolute inset-0 bg-void-dark/50 -z-10" />
        
        <div className="p-4 border-b border-white/10 bg-white/5 backdrop-blur-md flex justify-between items-center">
            <h3 className="font-bold text-white flex items-center gap-2 text-sm uppercase tracking-wider">
                <span className={`w-2 h-2 rounded-full ${connected ? 'bg-safe-green animate-pulse shadow-[0_0_8px_#22c55e]' : 'bg-danger-red'}`} />
                Secure Comms Channel
            </h3>
            <div className="flex items-center gap-3">
                {connected && onlineCount > 0 && (
                  <span className="text-[10px] font-mono text-safe-green/70 flex items-center gap-1">
                    <Wifi className="w-3 h-3" />
                    {onlineCount} online
                  </span>
                )}
                <span className="text-[10px] font-mono text-white/30">
                   FREQ: {asteroidId.substring(0, 4)}
                </span>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar scroll-smooth" ref={scrollRef}>
            {loading ? (
                <div className="flex justify-center items-center h-full">
                    <Loader2 className="w-6 h-6 animate-spin text-plasma-cyan" />
                </div>
            ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-text-muted space-y-2 opacity-50">
                    <User className="w-8 h-8 opacity-20" />
                    <p className="text-xs">No signals detected on this frequency.</p>
                </div>
            ) : (
                messages.map((msg) => {
                    const isMe = currentUser?.id === msg.user.id;
                    return (
                        <div key={msg.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0 border border-white/10 shadow-lg">
                                {msg.user.avatar ? (
                                    /* eslint-disable-next-line @next/next/no-img-element */
                                    <img src={msg.user.avatar} alt={msg.user.name} className="w-full h-full rounded-full" />
                                ) : (
                                    <span className="text-xs font-bold text-white/70">{msg.user.name[0]}</span>
                                )}
                            </div>
                            <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[80%]`}>
                                <div className="flex items-center gap-2 mb-1 px-1">
                                    <span className="text-[10px] font-bold text-white/60 uppercase tracking-wider">{msg.user.name}</span>
                                    <span className="text-[9px] text-white/20 font-mono">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <div className={`px-4 py-2 rounded-2xl text-sm shadow-md border ${isMe ? 'bg-nebula-purple/20 border-nebula-purple/30 text-white rounded-tr-none' : 'bg-white/5 border-white/10 text-white/90 rounded-tl-none'}`}>
                                    {msg.content}
                                </div>
                            </div>
                        </div>
                    );
                })
            )}
            {typingUsers.filter(u => u.id !== currentUser?.id).length > 0 && (
              <div className="flex items-center gap-2 pl-11">
                <TypingIndicator 
                  userName={typingUsers.filter(u => u.id !== currentUser?.id).map(u => u.name).join(", ")} 
                  size="sm" 
                />
              </div>
            )}
        </div>

        <form onSubmit={handleSend} className="p-3 border-t border-white/10 bg-white/5 flex gap-2">
            {!isAuthenticated ? (
              <p className="text-xs text-text-muted text-center w-full py-2">
                Sign in to join the conversation
              </p>
            ) : (
              <>
                <input
                    type="text"
                    value={newMessage}
                    onChange={handleInputChange}
                    placeholder={connected ? "Transmit message..." : "Connecting..."}
                    disabled={!connected}
                    className="flex-1 bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-nebula-purple placeholder:text-white/20 font-mono disabled:opacity-50"
                />
                <Button size="sm" type="submit" disabled={!connected || !newMessage.trim()} className="h-10 w-10 p-0 rounded-lg bg-nebula-purple hover:bg-nebula-purple/80 shadow-lg shadow-nebula-purple/20 border border-white/10">
                    <Send className="w-4 h-4 text-white" />
                </Button>
              </>
            )}
        </form>
    </div>
  );
}

