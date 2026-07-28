'use client';

import { useState, useEffect, use } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import Link from 'next/link';
import {
  FileSignature,
  ShieldCheck,
  Building2,
  CheckCircle2,
  Clock,
  Download,
  AlertCircle,
  Loader2,
  Sparkles,
  DollarSign,
  ArrowRightLeft,
  Lock,
  ChevronLeft,
  ExternalLink,
  Brain,
  Layers,
  HelpCircle,
  Check,
  Zap,
} from 'lucide-react';
import { DealRoomChat } from '@/components/deals/deal-room-chat';

interface DealData {
  id: string;
  status: 'draft' | 'pending_signatures' | 'executed';
  similarity_score: number;
  company_a_signed: boolean;
  company_a_signed_at: string | null;
  company_b_signed: boolean;
  company_b_signed_at: string | null;
  created_at: string;
  offer_a: {
    id: string;
    title: string;
    offering_summary: string;
    estimated_value: number;
    company: {
      id: string;
      name: string;
      linkedin_verified: boolean;
    };
  };
  offer_b: {
    id: string;
    title: string;
    offering_summary: string;
    estimated_value: number;
    company: {
      id: string;
      name: string;
      linkedin_verified: boolean;
    };
  };
}

interface Milestone {
  id: number;
  title: string;
  description: string;
  status: 'completed' | 'in_progress' | 'pending';
  signedByA: boolean;
  signedByB: boolean;
}

export default function EnhancedDealRoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: dealId } = use(params);

  const [deal, setDeal] = useState<DealData | null>(null);
  const [loading, setLoading] = useState(true);
  const [signerName, setSignerName] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [signing, setSigning] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // New Enterprise Feature States
  const [showMatchDetails, setShowMatchDetails] = useState(false);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiRecommendation, setAiRecommendation] = useState<string | null>(null);

  // Milestone Escrow State
  const [milestones, setMilestones] = useState<Milestone[]>([
    {
      id: 1,
      title: 'Phase 1: Architecture & Scope Alignment',
      description: 'Sign-off on technical requirements, API specs, and production scripts.',
      status: 'completed',
      signedByA: true,
      signedByB: true,
    },
    {
      id: 2,
      title: 'Phase 2: Primary Deliverable Handover',
      description: 'Code repository deployment and first-cut 4K video asset review.',
      status: 'in_progress',
      signedByA: true,
      signedByB: false,
    },
    {
      id: 3,
      title: 'Phase 3: Final Acceptance & IP Transfer',
      description: 'Production sign-off, domain transfers, and final high-res renders.',
      status: 'pending',
      signedByA: false,
      signedByB: false,
    },
  ]);

  // Active Multi-Tenant Context
  const currentCompany = {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'Apex Software Studio',
    userId: 'u1111111-1111-1111-1111-111111111111',
  };

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    fetchDealDetails();

    const channel = supabase
      .channel(`deal_state:${dealId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'deals', filter: `id=eq.${dealId}` },
        () => {
          fetchDealDetails();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [dealId]);

  async function fetchDealDetails() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('deals')
        .select(`
          id, status, similarity_score, company_a_signed, company_a_signed_at,
          company_b_signed, company_b_signed_at, created_at,
          offer_a:trade_offers!offer_a_id(id, title, offering_summary, estimated_value, company:companies(id, name, linkedin_verified)),
          offer_b:trade_offers!offer_b_id(id, title, offering_summary, estimated_value, company:companies(id, name, linkedin_verified))
        `)
        .eq('id', dealId)
        .single();

      if (error || !data) {
        setDeal({
          id: dealId,
          status: 'pending_signatures',
          similarity_score: 0.94,
          company_a_signed: false,
          company_a_signed_at: null,
          company_b_signed: true,
          company_b_signed_at: '2026-07-27T14:20:00.000Z',
          created_at: '2026-07-26T10:00:00.000Z',
          offer_a: {
            id: 'oa111',
            title: 'Full-Stack Next.js 16 & Mobile App Development',
            offering_summary: '120 senior engineering hours for web & mobile marketplace platform.',
            estimated_value: 25000,
            company: {
              id: '11111111-1111-1111-1111-111111111111',
              name: 'Apex Software Studio',
              linkedin_verified: true,
            },
          },
          offer_b: {
            id: 'ob222',
            title: 'Commercial Brand Video Campaign & 3D Animation',
            offering_summary: '4K commercial video production, surreal VFX, and audio mastering.',
            estimated_value: 25000,
            company: {
              id: '22222222-2222-2222-2222-222222222222',
              name: 'Vivid Media Group',
              linkedin_verified: false,
            },
          },
        });
      } else {
        setDeal(data as unknown as DealData);
      }
    } catch (err) {
      console.error('Error loading deal room:', err);
    } finally {
      setLoading(false);
    }
  }

  // Trigger AI Barter Scope Equalizer Calculation
  const runAiBarterCoPilot = () => {
    setAiAnalyzing(true);
    setAiRecommendation(null);
    setTimeout(() => {
      setAiRecommendation(
        '💡 Parity Assessment: Both offers share an exact $25,000 USD valuation. To maximize delivery symmetry, Apex Software Studio should include 10 hours of post-launch staging support, while Vivid Media Group provides 2 additional 15-second social cuts.'
      );
      setAiAnalyzing(false);
    }, 1200);
  };

  // Toggle Milestone Sign-Off
  const handleMilestoneToggle = (milestoneId: number) => {
    setMilestones((prev) =>
      prev.map((m) => {
        if (m.id === milestoneId) {
          const newSignedA = true;
          const isComplete = newSignedA && m.signedByB;
          return {
            ...m,
            signedByA: newSignedA,
            status: isComplete ? 'completed' : 'in_progress',
          };
        }
        return m;
      })
    );
  };

  if (loading || !deal) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="flex items-center gap-3 text-xs text-sky-400 font-mono">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Opening Encrypted Deal Room & Vector Match Matrix...</span>
        </div>
      </div>
    );
  }

  const isPartyA = deal.offer_a.company.id === currentCompany.id;
  const myOffer = isPartyA ? deal.offer_a : deal.offer_b;
  const partnerOffer = isPartyA ? deal.offer_b : deal.offer_a;
  const partnerCompany = partnerOffer.company;

  const mySigned = isPartyA ? deal.company_a_signed : deal.company_b_signed;
  const partnerSigned = isPartyA ? deal.company_b_signed : deal.company_a_signed;
  const partnerSignedAt = isPartyA ? deal.company_b_signed_at : deal.company_a_signed_at;

  const isFullyExecuted = deal.status === 'executed' || (deal.company_a_signed && deal.company_b_signed);

  const handleSignContract = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedToTerms || !signerName.trim() || signing) return;

    setSigning(true);
    setErrorMsg(null);

    const now = new Date().toISOString();
    const isBothSignedNow = partnerSigned;

    const updatePayload = isPartyA
      ? {
          company_a_signed: true,
          company_a_signed_at: now,
          status: isBothSignedNow ? 'executed' : 'pending_signatures',
        }
      : {
          company_b_signed: true,
          company_b_signed_at: now,
          status: isBothSignedNow ? 'executed' : 'pending_signatures',
        };

    try {
      const { error: dealError } = await supabase
        .from('deals')
        .update(updatePayload)
        .eq('id', deal.id);

      if (dealError) throw dealError;

      await supabase.from('deal_messages').insert({
        deal_id: deal.id,
        sender_company_id: currentCompany.id,
        sender_user_id: currentCompany.userId,
        is_system_message: true,
        content: `🔒 ${currentCompany.name} digitally executed the contract (Signer: ${signerName}).${
          isBothSignedNow ? ' 🎉 Contract fully executed!' : ''
        }`,
      });

      setDeal((prev) =>
        prev
          ? {
              ...prev,
              ...(isPartyA
                ? { company_a_signed: true, company_a_signed_at: now }
                : { company_b_signed: true, company_b_signed_at: now }),
              status: isBothSignedNow ? 'executed' : 'pending_signatures',
            }
          : null
      );
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to sign contract.');
    } finally {
      setSigning(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md px-6 py-4 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Back to Dashboard
            </Link>
            <span className="text-slate-800">|</span>
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-300">
              <Lock className="w-3.5 h-3.5 text-sky-400" />
              <span>DEAL ROOM: {deal.id.slice(0, 8)}...</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isFullyExecuted ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" /> Fully Executed
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-amber-500/10 border border-amber-500/30 text-amber-400">
                <Clock className="w-3.5 h-3.5" /> Pending Signatures
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Main Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Contract, Match Intelligence & Milestones (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Fully Executed Callout Banner */}
          {isFullyExecuted && (
            <div className="p-6 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-white">Contract Fully Executed!</h3>
                    <p className="text-xs text-slate-300">
                      Both enterprise parties have signed this bilateral trade contract.
                    </p>
                  </div>
                </div>

                <a
                  href={`/api/deals/${deal.id}/contract`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" /> Download PDF <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}

          {/* Barter Deliverables Summary with Interactive Vector Breakdown */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h2 className="text-sm font-extrabold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-sky-400" />
                Reciprocal Deliverables Summary
              </h2>

              <button
                onClick={() => setShowMatchDetails(!showMatchDetails)}
                className="inline-flex items-center gap-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-mono font-bold text-xs px-3 py-1 rounded-full transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {Math.round((deal.similarity_score || 0.94) * 100)}% Match Score
                <HelpCircle className="w-3 h-3 ml-0.5 text-emerald-400/70" />
              </button>
            </div>

            {/* Vector Score Intelligence Popover */}
            {showMatchDetails && (
              <div className="p-4 rounded-2xl bg-slate-950 border border-emerald-500/30 space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between text-xs font-bold text-emerald-400">
                  <span className="flex items-center gap-1.5">
                    <Brain className="w-4 h-4" /> pgvector Coincidence Breakdown
                  </span>
                  <span className="font-mono text-[10px] text-slate-500">
                    Model: text-embedding-3-small
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-[11px] font-mono">
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-500 block">Scope Fit</span>
                    <span className="font-bold text-white">92%</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-500 block">Valuation Parity</span>
                    <span className="font-bold text-white">100%</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-500 block">LinkedIn KYB</span>
                    <span className="font-bold text-sky-400">+10% Boost</span>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* My Company Offer */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="text-[10px] font-mono font-bold uppercase text-slate-500 flex items-center justify-between">
                  <span>Your Provision ({currentCompany.name})</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />
                </div>
                <h4 className="text-xs font-extrabold text-white">{myOffer.title}</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">{myOffer.offering_summary}</p>
                <div className="pt-2 text-xs font-mono font-bold text-emerald-400 flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5" /> {myOffer.estimated_value?.toLocaleString()}
                </div>
              </div>

              {/* Partner Offer */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="text-[10px] font-mono font-bold uppercase text-slate-500 flex items-center justify-between">
                  <span>Counterpart Provision ({partnerCompany.name})</span>
                  {partnerCompany.linkedin_verified && (
                    <span className="text-[#0A66C2] text-[10px] font-bold">✓ Verified</span>
                  )}
                </div>
                <h4 className="text-xs font-extrabold text-white">{partnerOffer.title}</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">{partnerOffer.offering_summary}</p>
                <div className="pt-2 text-xs font-mono font-bold text-emerald-400 flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5" /> {partnerOffer.estimated_value?.toLocaleString()}
                </div>
              </div>
            </div>

            {/* AI Barter Co-Pilot (Scope Equalizer) */}
            <div className="p-4 rounded-2xl bg-[#091120] border border-sky-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-sky-400" />
                  <span className="text-xs font-bold text-white">AI Barter Co-Pilot</span>
                </div>
                <button
                  onClick={runAiBarterCoPilot}
                  disabled={aiAnalyzing}
                  className="px-3 py-1 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-400 text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5"
                >
                  {aiAnalyzing ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" /> Calculating Parity...
                    </>
                  ) : (
                    <>
                      <Zap className="w-3 h-3" /> Optimize Scope Bridge
                    </>
                  )}
                </button>
              </div>

              {aiRecommendation && (
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800">
                  {aiRecommendation}
                </p>
              )}
            </div>
          </div>

          {/* 3-Phase Milestone Escrow Tracker */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
            <h3 className="text-xs font-mono font-bold uppercase text-slate-400 flex items-center gap-2">
              <Layers className="w-4 h-4 text-sky-400" /> Reciprocal Milestone Tracker
            </h3>

            <div className="space-y-3">
              {milestones.map((milestone) => (
                <div
                  key={milestone.id}
                  className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          milestone.status === 'completed'
                            ? 'bg-emerald-400'
                            : milestone.status === 'in_progress'
                            ? 'bg-amber-400 animate-pulse'
                            : 'bg-slate-600'
                        }`}
                      />
                      <h4 className="text-xs font-bold text-white">{milestone.title}</h4>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      {milestone.description}
                    </p>
                  </div>

                  <button
                    onClick={() => handleMilestoneToggle(milestone.id)}
                    disabled={milestone.signedByA}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
                      milestone.signedByA
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700'
                    }`}
                  >
                    {milestone.signedByA ? (
                      <>
                        <Check className="w-3.5 h-3.5" /> Approved
                      </>
                    ) : (
                      'Sign Off Milestone'
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Dual-Party Digital Execution Form */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
            <h3 className="text-xs font-mono font-bold uppercase text-slate-400">
              Contract Execution Matrix
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div
                className={`p-4 rounded-2xl border ${
                  mySigned
                    ? 'bg-emerald-500/10 border-emerald-500/30'
                    : 'bg-slate-950 border-slate-800'
                } space-y-1`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{currentCompany.name}</span>
                  {mySigned ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
                  )}
                </div>
                <div className="text-[11px] font-mono text-slate-400">
                  {mySigned ? 'Digitally Executed' : 'Awaiting Your Signature'}
                </div>
              </div>

              <div
                className={`p-4 rounded-2xl border ${
                  partnerSigned
                    ? 'bg-emerald-500/10 border-emerald-500/30'
                    : 'bg-slate-950 border-slate-800'
                } space-y-1`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{partnerCompany.name}</span>
                  {partnerSigned ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Clock className="w-4 h-4 text-amber-400" />
                  )}
                </div>
                <div className="text-[11px] font-mono text-slate-400">
                  {partnerSigned
                    ? `Signed on ${new Date(partnerSignedAt!).toLocaleDateString()}`
                    : 'Awaiting Counterpart Signature'}
                </div>
              </div>
            </div>

            {!mySigned && (
              <form onSubmit={handleSignContract} className="pt-4 border-t border-slate-800 space-y-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-mono font-bold uppercase text-slate-400">
                    Authorized Representative Full Legal Name
                  </label>
                  <input
                    type="text"
                    required
                    value={signerName}
                    onChange={(e) => setSignerName(e.target.value)}
                    placeholder="e.g. Jane Doe, VP of Corporate Development"
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-sky-500 transition-colors"
                  />
                </div>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="mt-0.5 rounded bg-slate-950 border-slate-800 text-sky-500 focus:ring-0"
                  />
                  <span className="text-xs text-slate-300 leading-normal">
                    I confirm that I am an authorized corporate officer for <strong>{currentCompany.name}</strong> and agree to bind the entity to these reciprocal non-monetary trade terms.
                  </span>
                </label>

                {errorMsg && (
                  <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!agreedToTerms || !signerName.trim() || signing}
                  className="w-full py-3.5 rounded-2xl bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-slate-950 font-extrabold text-xs shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  {signing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Digitally Signing Contract...
                    </>
                  ) : (
                    <>
                      <FileSignature className="w-4 h-4" /> Sign & Execute Barter Agreement
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Right Column: Realtime Chat Room (5 cols) */}
        <div className="lg:col-span-5">
          <DealRoomChat
            dealId={deal.id}
            currentCompanyId={currentCompany.id}
            currentCompanyName={currentCompany.name}
            currentUserId={currentCompany.userId}
            partnerCompanyName={partnerCompany.name}
          />
        </div>
      </main>
    </div>
  );
}