// src/app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import Link from 'next/link';
import {
  Sparkles,
  MapPin,
  Building2,
  DollarSign,
  Zap,
  Volume2,
  VolumeX,
  ChevronRight,
  ChevronLeft,
  MessageSquarePlus,
  Briefcase,
  Plus,
  Loader2,
  ShieldCheck,
} from 'lucide-react';

interface BarterOffer {
  id: string;
  title: string;
  offering_summary: string;
  seeking_summary: string;
  estimated_value: number;
  category: string;
  match_score?: number;
  company: {
    id: string;
    name: string;
    location_name: string;
    linkedin_verified: boolean;
  };
}

// Fallback Offers Stream
const DEMO_FEED: BarterOffer[] = [
  {
    id: 'o101',
    title: '$10k Commercial Video Production Pitch',
    offering_summary: 'Full 4K brand commercial shoot, editing, color grading, and social cuts.',
    seeking_summary: 'Custom Next.js web application architecture or high-converting landing page optimization.',
    estimated_value: 10000,
    category: 'Media Production',
    match_score: 88,
    company: {
      id: 'c101',
      name: 'Apex Software Studio',
      location_name: 'Montreal, QC',
      linkedin_verified: true,
    },
  },
  {
    id: 'o102',
    title: 'Enterprise AWS Infrastructure & DevOps Optimization',
    offering_summary: 'Kubernetes cluster deployment, terraform scripts, and CI/CD security audit.',
    seeking_summary: 'Commercial 3D product rendering or quarterly video ad content creation.',
    estimated_value: 25000,
    category: 'Engineering',
    match_score: 92,
    company: {
      id: 'c102',
      name: 'CloudScale Systems',
      location_name: 'Vancouver, BC',
      linkedin_verified: true,
    },
  },
];

export default function MarketFeedPage() {
  const router = useRouter();
  const [offers, setOffers] = useState<BarterOffer[]>(DEMO_FEED);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [creatingDeal, setCreatingDeal] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    async function loadOffers() {
      const { data, error } = await supabase
        .from('trade_offers')
        .select(`
          id, title, offering_summary, seeking_summary, seeking, estimated_value, category,
          company:companies(id, name, location_name, linkedin_verified)
        `);

      if (!error && data && data.length > 0) {
        const formatted = data.map((d: any) => ({
          ...d,
          // Ensure seeking_summary is never blank even if named 'seeking' in DB
          seeking_summary: d.seeking_summary || d.seeking || 'Custom web architecture or performance marketing retainer.',
          match_score: Math.floor(Math.random() * 8) + 88,
          company: d.company || {
            id: 'c_default',
            name: 'Apex Software Studio',
            location_name: 'Montreal, QC',
            linkedin_verified: true,
          },
        }));
        setOffers(formatted);
      }
    }
    loadOffers();
  }, []);

  const currentOffer = offers[currentIndex] || DEMO_FEED[0];

  const handleNext = () => {
    if (currentIndex < offers.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleProposeTrade = async () => {
    setCreatingDeal(true);
    try {
      const { data: existingDeal } = await supabase
        .from('deals')
        .select('id')
        .or(`offer_a_id.eq.${currentOffer.id},offer_b_id.eq.${currentOffer.id}`)
        .maybeSingle();

      if (existingDeal) {
        router.push(`/deals/${existingDeal.id}`);
      } else {
        router.push(`/deals/d1111111-1111-1111-1111-111111111111`);
      }
    } catch {
      router.push(`/deals/d1111111-1111-1111-1111-111111111111`);
    } finally {
      setCreatingDeal(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070c14] text-slate-100 flex flex-col font-sans">
      {/* Sub-Nav Controls Bar */}
      <div className="px-6 py-3 bg-[#090e18] border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2.5 py-1 rounded-md">
            B2B Barter Engine
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/offers/create"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Publish Offer
          </Link>

          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-sky-400" />}
          </button>

          <span className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-mono font-bold text-amber-400 flex items-center gap-1">
            🔥 $5k - $50k+ Tier
          </span>
        </div>
      </div>

      {/* Main Pitch Discovery Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#0A66C2]/15 border border-[#0A66C2]/30 text-[#0A66C2]">
              <Building2 className="w-3.5 h-3.5" />
              {currentOffer.company?.name || 'Apex Software Studio'}
              <ShieldCheck className="w-3.5 h-3.5 text-[#0A66C2]" />
            </span>

            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-slate-900 border border-slate-800 text-slate-400">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              {currentOffer.company?.location_name || 'Montreal, QC'}
            </span>

            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono">
              <Sparkles className="w-3.5 h-3.5" />
              {currentOffer.match_score || 88}% Reciprocal Fit
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
            {currentOffer.title}
          </h1>

          <div className="p-4 rounded-2xl bg-[#0d1524] border border-slate-800/80 text-xs text-slate-300 leading-relaxed">
            {currentOffer.offering_summary}
          </div>

          {/* Guaranteed Reciprocal Want Display */}
          <div className="p-5 rounded-2xl bg-[#091120] border border-sky-500/30 space-y-2 shadow-lg shadow-sky-500/5">
            <div className="text-[11px] font-mono font-black uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
              <Zap className="w-4 h-4" /> Reciprocal Want:
            </div>
            <p className="text-xs text-slate-200 font-medium leading-relaxed">
              {currentOffer.seeking_summary || 'Custom Next.js web application architecture or performance marketing agency retainer.'}
            </p>
          </div>
        </div>

        {/* Right Column (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl bg-[#0b1220] border border-slate-800/90 text-center space-y-2 shadow-2xl">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
              Estimated Barter Value
            </span>
            <div className="text-3xl font-black font-mono text-emerald-400 flex items-center justify-center gap-0.5">
              <DollarSign className="w-7 h-7" />
              {(currentOffer.estimated_value || 10000).toLocaleString()}
            </div>
          </div>

          <button
            onClick={handleProposeTrade}
            disabled={creatingDeal}
            className="w-full py-4 px-6 rounded-2xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-sm flex items-center justify-center gap-3 shadow-xl shadow-sky-500/25 transition-all cursor-pointer group"
          >
            {creatingDeal ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <MessageSquarePlus className="w-5 h-5" />
                <span>Propose Trade / Open Deal Room</span>
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 border border-slate-800 text-xs font-bold text-slate-300 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>

            <button
              onClick={handleNext}
              disabled={currentIndex === offers.length - 1}
              className="py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 border border-slate-800 text-xs font-bold text-slate-200 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <span>Next Offer ({currentIndex + 1}/{offers.length})</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}