"use client";

import React, { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import { 
  ShieldCheck, 
  Lock, 
  Send, 
  Building2, 
  ArrowRightLeft, 
  CheckCircle2, 
  Clock, 
  Sparkles,
  AlertCircle
} from "lucide-react";

// Initialize browser Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Message {
  id: string;
  sender: "initiator" | "receiver";
  senderName: string;
  text: string;
  timestamp: string;
}

interface DealState {
  valueUsd: number;
  initiatorCompany: string;
  initiatorOffer: string;
  initiatorSigned: boolean;
  receiverCompany: string;
  receiverOffer: string;
  receiverSigned: boolean;
  status: "negotiating" | "locked" | "executed";
}

export function DealRoom({ dealId }: { dealId: string }) {
  // Current user role simulation (In real auth, derived from user context)
  const [currentUserRole] = useState<"initiator" | "receiver">("initiator");

  // Deal state
  const [deal, setDeal] = useState<DealState>({
    valueUsd: 25000,
    initiatorCompany: "Apex Media Labs",
    initiatorOffer: "Video Production & Brand Package ($25k value)",
    initiatorSigned: false,
    receiverCompany: "Nexus Cloud Infrastructure",
    receiverOffer: "12-Month Enterprise Server Allocation ($25k value)",
    receiverSigned: false,
    status: "negotiating",
  });

  // Chat & Realtime state
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "receiver",
      senderName: "Nexus Cloud Infrastructure",
      text: "We can commit to the 12-month tier, provided SLA guarantees 99.99% uptime.",
      timestamp: "10:14 AM",
    },
  ]);
  const [inputText, setInputText] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Supabase Realtime Channel Subscription
  useEffect(() => {
    const channel = supabase.channel(`deal:${dealId}`, {
      config: { broadcast: { self: true } },
    });

    channel
      .on("broadcast", { event: "new-message" }, ({ payload }) => {
        setMessages((prev) => [...prev, payload]);
      })
      .on("broadcast", { event: "signature-update" }, ({ payload }) => {
        setDeal((prev) => {
          const updated = { ...prev, ...payload };
          // Check for Dual Lock
          if (updated.initiatorSigned && updated.receiverSigned) {
            updated.status = "locked";
          }
          return updated;
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [dealId]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Actions
  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const newMessage: Message = {
      id: crypto.randomUUID(),
      sender: currentUserRole,
      senderName: currentUserRole === "initiator" ? deal.initiatorCompany : deal.receiverCompany,
      text: inputText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    // Broadcast message via Supabase Realtime
    await supabase.channel(`deal:${dealId}`).send({
      type: "broadcast",
      event: "new-message",
      payload: newMessage,
    });

    setInputText("");
  };

  const toggleSignature = async () => {
    const field = currentUserRole === "initiator" ? "initiatorSigned" : "receiverSigned";
    const nextState = !deal[field];

    const payload = { [field]: nextState };

    // Broadcast signature update
    await supabase.channel(`deal:${dealId}`).send({
      type: "broadcast",
      event: "signature-update",
      payload,
    });
  };

  const isLocked = deal.initiatorSigned && deal.receiverSigned;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Top Bar / Status Header */}
      <div className="mb-8 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold tracking-wider text-emerald-400 uppercase">
                Trade Room #{dealId.slice(0, 8)}
              </span>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                  isLocked
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                }`}
              >
                {isLocked ? (
                  <>
                    <Lock className="h-3.5 w-3.5" /> Handshake Locked
                  </>
                ) : (
                  <>
                    <Clock className="h-3.5 w-3.5" /> Negotiation Active
                  </>
                )}
              </span>
            </div>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-white md:text-3xl">
              B2B Barter Exchange
            </h1>
          </div>

          <div className="flex items-center gap-4 rounded-xl border border-slate-800 bg-slate-950/80 px-5 py-3">
            <div>
              <p className="text-xs text-slate-400">Estimated Value</p>
              <p className="text-xl font-extrabold text-emerald-400">
                ${deal.valueUsd.toLocaleString()} USD
              </p>
            </div>
            <ShieldCheck className="h-8 w-8 text-emerald-500/60" />
          </div>
        </div>
      </div>

      {/* Grid: Barter Structure & Handshake Box */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Column: Deal Structure & Handshake Protocol */}
        <div className="flex flex-col gap-6 lg:col-span-7">
          {/* Companies & Assets Swap */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
            <h2 className="mb-6 flex items-center gap-2 text-lg font-semibold text-white">
              <ArrowRightLeft className="h-5 w-5 text-indigo-400" /> Coincidence of Wants
            </h2>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Party A */}
              <div
                className={`rounded-xl border p-4 transition-all ${
                  deal.initiatorSigned
                    ? "border-emerald-500/50 bg-emerald-950/10"
                    : "border-slate-800 bg-slate-900/80"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-300">
                    <Building2 className="h-4 w-4 text-indigo-400" />
                    {deal.initiatorCompany}
                  </div>
                  {deal.initiatorSigned && (
                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  )}
                </div>
                <p className="text-sm font-medium text-white">{deal.initiatorOffer}</p>
                <div className="mt-4 text-xs text-slate-400">
                  Status: {deal.initiatorSigned ? "Signed & Confirmed" : "Awaiting Signature"}
                </div>
              </div>

              {/* Party B */}
              <div
                className={`rounded-xl border p-4 transition-all ${
                  deal.receiverSigned
                    ? "border-emerald-500/50 bg-emerald-950/10"
                    : "border-slate-800 bg-slate-900/80"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-300">
                    <Building2 className="h-4 w-4 text-purple-400" />
                    {deal.receiverCompany}
                  </div>
                  {deal.receiverSigned && (
                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  )}
                </div>
                <p className="text-sm font-medium text-white">{deal.receiverOffer}</p>
                <div className="mt-4 text-xs text-slate-400">
                  Status: {deal.receiverSigned ? "Signed & Confirmed" : "Awaiting Signature"}
                </div>
              </div>
            </div>
          </div>

          {/* Dual Signature Consensus Panel */}
          <div className="rounded-2xl border border-indigo-500/20 bg-gradient-to-b from-indigo-950/20 to-slate-900/40 p-6">
            <div className="flex items-start gap-4">
              <div className="rounded-xl bg-indigo-500/10 p-3 text-indigo-400">
                <Lock className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-semibold text-white">
                  Dual-Signature Consensus Handshake
                </h3>
                <p className="mt-1 text-sm text-slate-400">
                  Both parties must digitally lock terms before the barter contract executes. 
                  Once dual signatures are achieved, this deal is immutable.
                </p>

                <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                  <button
                    onClick={toggleSignature}
                    className={`flex items-center gap-2 rounded-xl px-6 py-3 font-semibold transition-all ${
                      deal[currentUserRole === "initiator" ? "initiatorSigned" : "receiverSigned"]
                        ? "bg-slate-800 text-slate-300 hover:bg-slate-700"
                        : "bg-emerald-500 text-slate-950 hover:bg-emerald-400 font-bold shadow-lg shadow-emerald-500/20"
                    }`}
                  >
                    <CheckCircle2 className="h-5 w-5" />
                    {deal[currentUserRole === "initiator" ? "initiatorSigned" : "receiverSigned"]
                      ? "Revoke Signature"
                      : "Sign & Authorize Deal"}
                  </button>

                  {isLocked && (
                    <div className="flex items-center gap-2 text-emerald-400 font-medium text-sm animate-pulse">
                      <Sparkles className="h-5 w-5" /> Deal Ready for Escrow Execution
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Real-Time Negotiation Chat */}
        <div className="flex flex-col rounded-2xl border border-slate-800 bg-slate-900/50 lg:col-span-5 h-[600px]">
          {/* Chat Header */}
          <div className="border-b border-slate-800 p-4 font-semibold text-white flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              Real-Time Negotiation Channel
            </span>
            <span className="text-xs text-slate-500">Encrypted</span>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => {
              const isMe = msg.sender === currentUserRole;
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                >
                  <span className="text-[10px] text-slate-500 mb-1">{msg.senderName}</span>
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                      isMe
                        ? "bg-indigo-600 text-white rounded-tr-none"
                        : "bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700/50"
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[10px] text-slate-600 mt-1">{msg.timestamp}</span>
                </div>
              );
            })}
            <div ref={chatEndRef} />
          </div>

          {/* Chat Input */}
          <div className="border-t border-slate-800 p-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Negotiate terms or SLA conditions..."
                className="flex-1 rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
              />
              <button
                type="submit"
                className="rounded-xl bg-indigo-600 p-2.5 text-white hover:bg-indigo-500 transition-colors"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}