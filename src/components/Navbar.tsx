'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import {
  Sparkles,
  Building2,
  Plus,
  MessageSquare,
  Compass,
  Bell,
} from 'lucide-react';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const CURRENT_COMPANY_ID = '11111111-1111-1111-1111-111111111111';

export default function Navbar() {
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Realtime subscription for incoming messages across all active deals
    const channel = supabase
      .channel('global_deal_messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'deal_messages' },
        (payload) => {
          const newMsg = payload.new;
          // Increment unread count if message was sent by a trading partner
          if (newMsg.sender_company_id !== CURRENT_COMPANY_ID) {
            setUnreadCount((prev) => prev + 1);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto h-16 flex items-center justify-between gap-4">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="p-2 bg-sky-500/10 border border-sky-500/20 rounded-xl group-hover:border-sky-500/40 transition-all">
            <Sparkles className="w-5 h-5 text-sky-400" />
          </div>
          <span className="text-lg font-black text-white tracking-tight">
            TradeIt<span className="text-sky-400">.tv</span>
          </span>
        </Link>

        {/* Center Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
          <Link
            href="/"
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              pathname === '/'
                ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/10'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Compass className="w-3.5 h-3.5" /> Market Feed
          </Link>
          
          <Link
            href="/dashboard"
            className={`relative px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              pathname === '/dashboard'
                ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/10'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" /> Portfolio
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-black text-white animate-pulse">
                {unreadCount}
              </span>
            )}
          </Link>
        </nav>

        {/* Right CTA Actions */}
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-lg font-mono">
              <Bell className="w-3.5 h-3.5 animate-bounce" />
              <span>{unreadCount} New Message{unreadCount > 1 ? 's' : ''}</span>
            </div>
          )}

          <Link
            href="/offers/new"
            className="inline-flex items-center gap-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-lg shadow-sky-500/10"
          >
            <Plus className="w-4 h-4" /> Post Pitch
          </Link>
        </div>
      </div>
    </header>
  );
}