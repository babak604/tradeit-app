'use client';

import { useState, useEffect, useRef } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import {
  Send,
  MessageSquare,
  ShieldCheck,
  Building2,
  Loader2,
  Wifi,
  WifiOff,
  Sparkles,
  Paperclip,
} from 'lucide-react';

export interface DealMessage {
  id: string;
  deal_id: string;
  sender_company_id: string;
  sender_company_name?: string;
  sender_user_id: string;
  content: string;
  is_system_message?: boolean;
  created_at: string;
}

interface DealRoomChatProps {
  dealId: string;
  currentCompanyId: string;
  currentCompanyName: string;
  currentUserId: string;
  partnerCompanyName: string;
}

export function DealRoomChat({
  dealId,
  currentCompanyId,
  currentCompanyName,
  currentUserId,
  partnerCompanyName,
}: DealRoomChatProps) {
  const [messages, setMessages] = useState<DealMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Auto-scroll to bottom of message stream
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    let channel: any;

    async function initChat() {
      setLoading(true);

      // 1. Fetch historical messages for this deal
      const { data, error } = await supabase
        .from('deal_messages')
        .select('*')
        .eq('deal_id', dealId)
        .order('created_at', { ascending: true });

      if (!error && data) {
        setMessages(data as DealMessage[]);
      }

      setLoading(false);

      // 2. Subscribe to Supabase Realtime postgres_changes on deal_messages table
      channel = supabase
        .channel(`deal_room:${dealId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'deal_messages',
            filter: `deal_id=eq.${dealId}`,
          },
          (payload) => {
            const newMsg = payload.new as DealMessage;
            setMessages((prev) => {
              // Deduplicate if already added locally
              if (prev.some((m) => m.id === newMsg.id)) return prev;
              return [...prev, newMsg];
            });
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            setIsConnected(true);
          } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
            setIsConnected(false);
          }
        });
    }

    initChat();

    // Cleanup Realtime Subscription on component unmount
    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [dealId]);

  // Handle message dispatch
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    const messageText = newMessage.trim();
    setNewMessage('');
    setSending(true);

    const tempId = crypto.randomUUID();
    const optimisticMessage: DealMessage = {
      id: tempId,
      deal_id: dealId,
      sender_company_id: currentCompanyId,
      sender_company_name: currentCompanyName,
      sender_user_id: currentUserId,
      content: messageText,
      created_at: new Date().toISOString(),
    };

    // Optimistic UI Update
    setMessages((prev) => [...prev, optimisticMessage]);

    const { error } = await supabase.from('deal_messages').insert({
      deal_id: dealId,
      sender_company_id: currentCompanyId,
      sender_user_id: currentUserId,
      content: messageText,
    });

    if (error) {
      console.error('Failed to send message:', error);
      // Revert optimistic message if DB insert failed
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
    }

    setSending(false);
  };

  return (
    <div className="flex flex-col h-[600px] rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl overflow-hidden">
      {/* Header Bar */}
      <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-extrabold text-white flex items-center gap-2">
              Encrypted Deal Room Channel
              <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
            </h3>
            <p className="text-[10px] text-slate-400">
              Communicating with <strong className="text-slate-200">{partnerCompanyName}</strong>
            </p>
          </div>
        </div>

        {/* Live WebSocket Status Indicator */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-slate-900 border border-slate-800">
          {isConnected ? (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-400 flex items-center gap-1">
                <Wifi className="w-3 h-3" /> Realtime
              </span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span className="text-amber-400 flex items-center gap-1">
                <WifiOff className="w-3 h-3" /> Connecting...
              </span>
            </>
          )}
        </div>
      </div>

      {/* Chat Messages Body */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-slate-800">
        {loading ? (
          <div className="h-full flex items-center justify-center text-slate-500 gap-2 text-xs">
            <Loader2 className="w-4 h-4 animate-spin text-sky-400" />
            <span>Establishing secure Realtime channel...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2">
            <Sparkles className="w-8 h-8 text-sky-400/40" />
            <div className="text-xs font-bold text-slate-300">No negotiation messages yet</div>
            <p className="text-[11px] text-slate-500 max-w-xs">
              Use this room to clarify deliverable scope, milestones, or contract execution terms.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender_company_id === currentCompanyId;

            if (msg.is_system_message) {
              return (
                <div key={msg.id} className="flex justify-center my-2">
                  <div className="px-3 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-[10px] font-mono text-sky-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-3 h-3" />
                    <span>{msg.content}</span>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-1`}
              >
                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 px-1 font-mono">
                  <Building2 className="w-3 h-3 text-slate-400" />
                  <span>{isMe ? currentCompanyName : partnerCompanyName}</span>
                  <span>•</span>
                  <span>
                    {new Date(msg.created_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                <div
                  className={`max-w-[80%] p-3.5 rounded-2xl text-xs leading-relaxed shadow-lg ${
                    isMe
                      ? 'bg-sky-500 text-slate-950 font-medium rounded-tr-none'
                      : 'bg-slate-800 text-slate-100 border border-slate-700 rounded-tl-none'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Action Bar */}
      <form onSubmit={handleSendMessage} className="p-3 bg-slate-950 border-t border-slate-800">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Attach Deliverable Specification"
          >
            <Paperclip className="w-4 h-4" />
          </button>

          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={`Message ${partnerCompanyName}...`}
            className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
          />

          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="px-4 py-2.5 rounded-2xl bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-sky-500/20 transition-all cursor-pointer"
          >
            {sending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}