'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import {
  Sparkles,
  ArrowRight,
  Building2,
  DollarSign,
  ShieldCheck,
  ArrowLeftRight,
  AlertCircle,
  CheckCircle2,
  Layers,
} from 'lucide-react';
import Link from 'next/link';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const CURRENT_COMPANY_ID = '11111111-1111-1111-1111-111111111111';

interface OfferDetail {
  id: string;
  company_id: string;
  title: string;
  offering_summary: string;
  looking_for_summary: string;
  estimated_value: number;
  category: string;
  video_url: string;
  company?: {
    name: string;
    is_verified: boolean;
    location_name: string;
  };
}

function DealCreationForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const targetOfferId = searchParams.get('offerId');

  const [targetOffer, setTargetOffer] = useState<OfferDetail | null>(null);
  const [myOffers, setMyOffers] = useState<OfferDetail[]>([]);
  const [selectedMyOfferId, setSelectedMyOfferId] = useState<string>('');
  const [proposalNotes, setProposalNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadTradeData() {
      try {
        setLoading(true);

        // 1. Fetch Target Offer Details
        if (targetOfferId) {
          const { data: targetData, error: targetError } = await supabase
            .from('trade_offers')
            .select(`
              *,
              company:company_id(name, is_verified, location_name)
            `)
            .eq('id', targetOfferId)
            .single();

          if (targetError) throw targetError;
          setTargetOffer(targetData);
        }

        // 2. Fetch User's Active Offers to Trade With
        const { data: myData, error: myError } = await supabase
          .from('trade_offers')
          .select('*')
          .eq('company_id', CURRENT_COMPANY_ID)
          .eq('status', 'active');

        if (myError) throw myError;
        setMyOffers(myData || []);
        if (myData && myData.length > 0) {
          setSelectedMyOfferId(myData[0].id);
        }
      } catch (err: any) {
        console.error('Error loading deal context:', err);
        setErrorMsg(err?.message || 'Failed to load offer details.');
      } finally {
        setLoading(false);
      }
    }

    loadTradeData();
  }, [targetOfferId]);

  const handleInitiateSwap = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetOffer || !selectedMyOfferId) return;

    try {
      setSubmitting(true);
      setErrorMsg(null);

      // Create new deal record in Supabase
      const { data: newDeal, error } = await supabase
        .from('deals')
        .insert({
          company_a_id: CURRENT_COMPANY_ID,
          company_b_id: targetOffer.company_id,
          offer_a_id: selectedMyOfferId,
          offer_b_id: targetOffer.id,
          status: 'negotiating',
          terms: proposalNotes || 'Initiated barter trade proposal.',
        })
        .select()
        .single();

      if (error) throw error;

      // Seed initial deal room system message
      await supabase.from('deal_messages').insert({
        deal_id: newDeal.id,
        sender_company_id: CURRENT_COMPANY_ID,
        message: proposalNotes || 'Proposal initiated. Let’s negotiate trade terms.',
      });

      // Redirect directly to the live Deal Room
      router.push(`/deals/${newDeal.id}`);
    } catch (err: any) {
      console.error('Error creating deal:', err);
      setErrorMsg(err?.message || 'Failed to initiate deal.');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedMyOffer = myOffers.find((o) => o.id === selectedMyOfferId);

  // Valuation delta calculation
  const valTarget = targetOffer?.estimated_value || 0;
  const valMine = selectedMyOffer?.estimated_value || 0;
  const valDelta = valMine - valTarget;

  if (loading) {
    return (
      <div className="text-center py-24 text-slate-400 text-sm animate-pulse font-mono">
        Loading trade specs...
      </div>
    );
  }

  if (!targetOffer) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-slate-900 border border-slate-800 rounded-2xl text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-amber-400 mx-auto" />
        <h2 className="text-lg font-bold text-white">Target Offer Not Found</h2>
        <p className="text-xs text-slate-400">Select an offer from the market feed to initiate a trade proposal.</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl transition-all"
        >
          Browse Feed
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="border-b border-slate-800 pb-6">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-sky-400" />
            <h1 className="text-2xl font-extrabold text-white">Propose Barter Swap</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Pair your pitch with target offerings to initiate AI-assisted bilateral negotiations.
          </p>
        </div>

        {errorMsg && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleInitiateSwap} className="space-y-8">
          {/* Side-by-Side Swap Comparison Grid */}
          <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-stretch">
            
            {/* Target Offer (What You Want) */}
            <div className="md:col-span-5 bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-4">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-sky-400 bg-sky-500/10 px-2.5 py-1 rounded-md border border-sky-500/20">
                  Target Offer (Receiving)
                </span>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-sky-400" /> {targetOffer.company?.name}
                    </span>
                    {targetOffer.company?.is_verified && (
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    )}
                  </div>
                  <h3 className="text-base font-bold text-white">{targetOffer.title}</h3>
                  <p className="text-xs text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <strong className="text-sky-400">Offering:</strong> {targetOffer.offering_summary}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400">Estimated Value</span>
                <span className="text-sm font-mono font-bold text-emerald-400 flex items-center gap-0.5">
                  <DollarSign className="w-4 h-4" />
                  {targetOffer.estimated_value?.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Swap Divider Icon */}
            <div className="md:col-span-1 flex items-center justify-center py-2 md:py-0">
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-2xl text-sky-400 shadow-xl">
                <ArrowLeftRight className="w-6 h-6 animate-pulse" />
              </div>
            </div>

            {/* Your Offer Selection (What You Provide) */}
            <div className="md:col-span-5 bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-4">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
                  Your Pitch (Providing)
                </span>

                <div className="mt-4 space-y-3">
                  {myOffers.length === 0 ? (
                    <div className="p-4 bg-slate-950 border border-dashed border-slate-800 rounded-xl text-center space-y-2">
                      <p className="text-xs text-slate-400 font-bold">No active pitches found.</p>
                      <Link
                        href="/offers/new"
                        className="inline-block text-xs text-sky-400 hover:underline font-bold"
                      >
                        + Post a new offer first
                      </Link>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1.5">
                        Select an active offer from your portfolio:
                      </label>
                      <select
                        value={selectedMyOfferId}
                        onChange={(e) => setSelectedMyOfferId(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-sky-500"
                      >
                        {myOffers.map((offer) => (
                          <option key={offer.id} value={offer.id}>
                            {offer.title} (${offer.estimated_value?.toLocaleString()})
                          </option>
                        ))}
                      </select>

                      {selectedMyOffer && (
                        <p className="mt-3 text-xs text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800">
                          <strong className="text-emerald-400">Offering:</strong> {selectedMyOffer.offering_summary}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400">Estimated Value</span>
                <span className="text-sm font-mono font-bold text-emerald-400 flex items-center gap-0.5">
                  <DollarSign className="w-4 h-4" />
                  {selectedMyOffer?.estimated_value?.toLocaleString() || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Value Offset Indicator */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-sky-400" />
              <span className="text-xs font-bold text-slate-300">Valuation Parity Check</span>
            </div>
            <div className="font-mono text-xs font-bold">
              {valDelta === 0 ? (
                <span className="text-emerald-400">Equal Value Swap ($0 Delta)</span>
              ) : valDelta > 0 ? (
                <span className="text-emerald-400">+${valDelta.toLocaleString()} Surplus in your favor</span>
              ) : (
                <span className="text-amber-400">-${Math.abs(valDelta).toLocaleString()} Offset needed</span>
              )}
            </div>
          </div>

          {/* Opening Proposal Terms */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-3">
            <label className="block text-xs font-bold text-slate-200">
              Opening Proposal Notes / Custom Terms
            </label>
            <textarea
              rows={3}
              value={proposalNotes}
              onChange={(e) => setProposalNotes(e.target.value)}
              placeholder="Introduce your swap offer, timeline requirements, or cash-offset terms..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-white focus:outline-none focus:border-sky-500 placeholder-slate-600"
            />
          </div>

          {/* Action CTA */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <Link
              href="/"
              className="px-5 py-2.5 rounded-xl border border-slate-800 text-xs font-bold text-slate-400 hover:text-white transition-all"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={submitting || myOffers.length === 0}
              className="inline-flex items-center gap-2 bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-slate-950 font-bold text-xs px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-sky-500/10 cursor-pointer"
            >
              {submitting ? (
                'Initiating Proposal...'
              ) : (
                <>
                  Send Official Swap Proposal <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CreateDealPage() {
  return (
    <Suspense fallback={
      <div className="text-center py-24 text-slate-400 text-sm animate-pulse font-mono">
        Loading deal wizard...
      </div>
    }>
      <DealCreationForm />
    </Suspense>
  );
}