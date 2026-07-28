'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import {
  Building2,
  ShieldCheck,
  Plus,
  FileSignature,
  Sparkles,
  DollarSign,
  CheckCircle2,
  Clock,
  ChevronDown,
  ExternalLink,
  TrendingUp,
  MapPin,
  ArrowRightLeft,
  Zap,
  Briefcase,
  Video,
  AlertCircle,
  Loader2,
  X,
  Lock,
} from 'lucide-react';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Multi-Tenant Profile Registry for Sandbox Context Switching
const CORPORATE_TENANTS = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'Apex Software Studio',
    is_verified: true,
    linkedin_verified: true,
    linkedin_vanity_name: 'apex-software-studio',
    location_name: 'Montreal, QC',
    industry: 'Engineering & Web3',
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    name: 'Vivid Media Group',
    is_verified: false,
    linkedin_verified: false,
    linkedin_vanity_name: null,
    location_name: 'Vancouver, BC',
    industry: 'Media & 3D Production',
  },
];

// Fallback Offers Mock
const DEMO_OFFERS = [
  {
    id: 'o1111111-1111-1111-1111-111111111111',
    company_id: '11111111-1111-1111-1111-111111111111',
    title: 'Full-Stack Next.js 16 & Mobile App Development',
    offering_summary: '120 senior engineering hours for custom Web3/AI platform development.',
    seeking_summary: 'Enterprise cloud infrastructure credits (AWS/GCP) or commercial video production.',
    estimated_value: 25000,
    category: 'Engineering',
    created_at: '2026-07-20T10:00:00.000Z',
  },
  {
    id: 'o2222222-2222-2222-2222-222222222222',
    company_id: '22222222-2222-2222-2222-222222222222',
    title: 'Commercial Brand Video Campaign & 3D Animation',
    offering_summary: '4K commercial video editing, surreal VFX, and audio mastering.',
    seeking_summary: 'Performance marketing agency retainer or custom database optimization.',
    estimated_value: 18000,
    category: 'Media Production',
    created_at: '2026-07-22T14:30:00.000Z',
  },
];

// Fallback Deals Mock
const DEMO_DEALS = [
  {
    id: 'd1111111-1111-1111-1111-111111111111',
    status: 'executed',
    similarity_score: 0.96,
    company_a_signed: true,
    company_b_signed: true,
    created_at: '2026-07-25T16:00:00.000Z',
    partner_company_name: 'Vivid Media Group',
    my_deliverable: 'Full-Stack Next.js 16 & Mobile App Development',
    partner_deliverable: 'Commercial Brand Video Campaign & 3D Animation',
    contract_value: 25000,
  },
  {
    id: 'd2222222-2222-2222-2222-222222222222',
    status: 'pending_signatures',
    similarity_score: 0.88,
    company_a_signed: true,
    company_b_signed: false,
    created_at: '2026-07-27T09:15:00.000Z',
    partner_company_name: 'CloudScale Infrastructure Inc',
    my_deliverable: 'Full-Stack Next.js 16 & Mobile App Development',
    partner_deliverable: '$20,000 AWS Cloud Enterprise Credits',
    contract_value: 20000,
  },
];

export default function EnterpriseDashboard() {
  const [activeCompany, setActiveCompany] = useState(CORPORATE_TENANTS[0]);
  const [activeTab, setActiveTab] = useState<'offers' | 'deals'>('offers');
  const [offers, setOffers] = useState<any[]>([]);
  const [deals, setDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  // LinkedIn Modal Verification States
  const [isLinkedInModalOpen, setIsLinkedInModalOpen] = useState(false);
  const [linkedinOrgInput, setLinkedinOrgInput] = useState('');
  const [verifyingLinkedIn, setVerifyingLinkedIn] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [verifySuccess, setVerifySuccess] = useState<string | null>(null);

  useEffect(() => {
    loadCompanyData(activeCompany.id);
  }, [activeCompany]);

  async function loadCompanyData(companyId: string) {
    setLoading(true);
    try {
      // 1. Fetch Company Offers
      const { data: offerData } = await supabase
        .from('trade_offers')
        .select('*')
        .eq('company_id', companyId);

      if (offerData && offerData.length > 0) {
        setOffers(offerData);
      } else {
        setOffers(DEMO_OFFERS.filter((o) => o.company_id === companyId));
      }

      // 2. Fetch Deals
      const { data: dealData } = await supabase
        .from('deals')
        .select(`
          id, status, similarity_score, company_a_signed, company_b_signed, created_at,
          offer_a:trade_offers!offer_a_id(title, estimated_value, company:companies(name, id)),
          offer_b:trade_offers!offer_b_id(title, estimated_value, company:companies(name, id))
        `);

      if (dealData && dealData.length > 0) {
        const mappedDeals = dealData.map((d: any) => {
          const isOfferA = d.offer_a?.company?.id === companyId;
          const myOffer = isOfferA ? d.offer_a : d.offer_b;
          const partnerOffer = isOfferA ? d.offer_b : d.offer_a;

          return {
            id: d.id,
            status: d.status,
            similarity_score: d.similarity_score || 0.92,
            company_a_signed: d.company_a_signed,
            company_b_signed: d.company_b_signed,
            created_at: d.created_at,
            partner_company_name: partnerOffer?.company?.name || 'Enterprise Counterpart',
            my_deliverable: myOffer?.title || 'Custom Barter Services',
            partner_deliverable: partnerOffer?.title || 'Reciprocal Deliverables',
            contract_value: myOffer?.estimated_value || 20000,
          };
        });
        setDeals(mappedDeals);
      } else {
        setDeals(DEMO_DEALS);
      }
    } catch (err) {
      console.error('Error fetching tenant dashboard data:', err);
      setOffers(DEMO_OFFERS.filter((o) => o.company_id === companyId));
      setDeals(DEMO_DEALS);
    } finally {
      setLoading(false);
    }
  }

  // Handle LinkedIn Verification Submission
  const handleVerifyLinkedInCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifyingLinkedIn(true);
    setVerifyError(null);
    setVerifySuccess(null);

    try {
      const res = await fetch('/api/auth/verify-linkedin-company', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId: activeCompany.id,
          linkedinOrgUrn: linkedinOrgInput || `urn:li:organization:${activeCompany.name.toLowerCase().replace(/\s+/g, '-')}`,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'LinkedIn Organization verification failed.');
      }

      setVerifySuccess('LinkedIn Organization successfully verified! Verified badge assigned.');
      
      // Update local state to reflect instant verification
      setActiveCompany((prev) => ({
        ...prev,
        is_verified: true,
        linkedin_verified: true,
      }));

      setTimeout(() => {
        setIsLinkedInModalOpen(false);
        setVerifySuccess(null);
      }, 2000);
    } catch (err: any) {
      setVerifyError(err.message || 'Verification failed.');
    } finally {
      setVerifyingLinkedIn(false);
    }
  };

  // Calculate Metrics
  const totalExecutedValue = deals
    .filter((d) => d.status === 'executed')
    .reduce((acc, curr) => acc + (curr.contract_value || 0), 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Header & Multi-Tenant Switcher */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-30 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-sky-500 flex items-center justify-center font-black text-slate-950 text-lg shadow-lg shadow-sky-500/20">
                T
              </div>
              <span className="font-extrabold text-lg text-white tracking-tight">
                TradeIt<span className="text-sky-400">.tv</span>
              </span>
            </Link>
            <span className="text-slate-700">|</span>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
              Enterprise Dashboard
            </span>
          </div>

          {/* Profile Switcher & Actions */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 transition-colors cursor-pointer"
              >
                <Building2 className="w-4 h-4 text-sky-400" />
                <span>{activeCompany.name}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-2 z-50">
                  <div className="px-3 py-2 text-[10px] font-mono font-bold uppercase text-slate-500">
                    Switch Active Corporate Profile
                  </div>
                  {CORPORATE_TENANTS.map((tenant) => (
                    <button
                      key={tenant.id}
                      onClick={() => {
                        setActiveCompany(tenant);
                        setProfileDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-colors ${
                        activeCompany.id === tenant.id
                          ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                          : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <div className="truncate">
                        <div>{tenant.name}</div>
                        <div className="text-[10px] text-slate-500 font-normal">{tenant.industry}</div>
                      </div>
                      {activeCompany.id === tenant.id && <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Link
              href="/offers/create"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shadow-lg shadow-sky-500/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Publish Offer</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-8">
        {/* Company Identity & Stats Hero */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800 relative overflow-hidden grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-7 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              {/* LinkedIn / Company Verification Status Badge & Button */}
              {activeCompany.is_verified || activeCompany.linkedin_verified ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#0A66C2]/10 border border-[#0A66C2]/30 text-[#0A66C2]">
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.78a1.63 1.63 0 1 0 0 3.26 1.63 1.63 0 0 0 0-3.26Z" />
                  </svg>
                  LinkedIn Verified Tenant
                  <ShieldCheck className="w-3.5 h-3.5 text-[#0A66C2]" />
                </span>
              ) : (
                <button
                  onClick={() => setIsLinkedInModalOpen(true)}
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#0A66C2]/15 hover:bg-[#0A66C2]/30 border border-[#0A66C2]/40 text-[#0A66C2] transition-all cursor-pointer shadow-lg shadow-[#0A66C2]/10"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.78a1.63 1.63 0 1 0 0 3.26 1.63 1.63 0 0 0 0-3.26Z" />
                  </svg>
                  <span>Verify LinkedIn Organization</span>
                </button>
              )}

              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-950 border border-slate-800 text-slate-400">
                <MapPin className="w-3 h-3 text-slate-500" />
                {activeCompany.location_name}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {activeCompany.name} Operations
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
              Manage reciprocal trade offerings, monitor real-time AI match pairings, and view executed non-monetary agreements.
            </p>
          </div>

          {/* Key Metrics Cards */}
          <div className="md:col-span-5 grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase text-slate-500 flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-emerald-400" /> Transacted Volume
              </span>
              <div className="text-xl font-black font-mono text-emerald-400 flex items-center">
                <DollarSign className="w-5 h-5" />
                {totalExecutedValue.toLocaleString()}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase text-slate-500 flex items-center gap-1">
                <FileSignature className="w-3 h-3 text-sky-400" /> Active Deals
              </span>
              <div className="text-xl font-black font-mono text-sky-400">{deals.length} Contracts</div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('offers')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'offers'
                  ? 'bg-sky-500/10 text-sky-400 border border-sky-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              Active Published Offers ({offers.length})
            </button>
            <button
              onClick={() => setActiveTab('deals')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'deals'
                  ? 'bg-sky-500/10 text-sky-400 border border-sky-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <ArrowRightLeft className="w-4 h-4" />
              Barter Contracts & Deals ({deals.length})
            </button>
          </div>
        </div>

        {/* Tab 1: Published Offers Grid */}
        {activeTab === 'offers' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {offers.map((offer) => (
              <div
                key={offer.id}
                className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-full bg-slate-950 border border-slate-800 text-sky-400">
                      {offer.category || 'Engineering'}
                    </span>
                    <span className="text-sm font-black font-mono text-emerald-400 flex items-center">
                      <DollarSign className="w-4 h-4" />
                      {offer.estimated_value?.toLocaleString()}
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold text-white leading-snug">{offer.title}</h3>

                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-3 bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80">
                    {offer.offering_summary}
                  </p>

                  <div className="p-3 rounded-2xl bg-sky-500/10 border border-sky-500/20 space-y-1">
                    <span className="text-[10px] font-black uppercase text-sky-400 flex items-center gap-1">
                      <Zap className="w-3 h-3" /> Seeking Reciprocal:
                    </span>
                    <p className="text-xs font-medium text-slate-200 line-clamp-2">{offer.seeking_summary}</p>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-slate-800/60">
                  <Link
                    href="/"
                    className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
                  >
                    <Video className="w-3.5 h-3.5 text-sky-400" /> Preview in Feed
                  </Link>
                  <Link
                    href={`/deals/${offer.id}`}
                    className="text-xs font-bold text-sky-400 hover:text-sky-300 flex items-center gap-1"
                  >
                    View Matches <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 2: Deals & Contracts Table */}
        {activeTab === 'deals' && (
          <div className="rounded-3xl bg-slate-900/60 border border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 font-mono uppercase text-[10px]">
                  <tr>
                    <th className="p-4">Counterpart Enterprise</th>
                    <th className="p-4">Barter Deliverables</th>
                    <th className="p-4">Similarity Match</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {deals.map((deal) => (
                    <tr key={deal.id} className="hover:bg-slate-900/80 transition-colors">
                      <td className="p-4 font-bold text-white">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-sky-400 shrink-0" />
                          <span>{deal.partner_company_name}</span>
                        </div>
                      </td>

                      <td className="p-4 max-w-xs space-y-1">
                        <div className="text-slate-200 font-semibold truncate">{deal.my_deliverable}</div>
                        <div className="text-[10px] text-slate-400 truncate">⇄ {deal.partner_deliverable}</div>
                      </td>

                      <td className="p-4 font-mono font-bold text-emerald-400">
                        <span className="inline-flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full text-[11px]">
                          <Sparkles className="w-3 h-3" />
                          {Math.round((deal.similarity_score || 0.92) * 100)}%
                        </span>
                      </td>

                      <td className="p-4">
                        {deal.status === 'executed' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3" /> Executed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                            <Clock className="w-3 h-3" /> Pending Signature
                          </span>
                        )}
                      </td>

                      <td className="p-4 text-right">
                        <Link
                          href={`/deals/${deal.id}`}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-sky-500 hover:text-slate-950 font-bold text-xs text-slate-200 transition-all"
                        >
                          <FileSignature className="w-3.5 h-3.5" /> Open Room
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* LinkedIn Company Verification Modal */}
      {isLinkedInModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-6 shadow-2xl relative">
            <button
              onClick={() => setIsLinkedInModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-[#0A66C2]/10 border border-[#0A66C2]/30 text-[#0A66C2]">
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.78a1.63 1.63 0 1 0 0 3.26 1.63 1.63 0 0 0 0-3.26Z" />
                </svg>
                Corporate Identity Protocol
              </div>
              <h2 className="text-xl font-extrabold text-white">Verify LinkedIn Organization</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Link <strong className="text-white">{activeCompany.name}</strong> to your official LinkedIn Organization Page to unlock verified badges and receive a +10% match score bonus.
              </p>
            </div>

            {/* Benefits Banner */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>Verified Corporate Benefits:</span>
              </div>
              <ul className="text-slate-300 space-y-1.5 text-[11px] list-disc list-inside">
                <li>Authenticates Administrator ACL permissions via LinkedIn Graph API</li>
                <li>Earns +10% Vector Match Boost in Coincidence Engine</li>
                <li>Displays Verified Corporate badge in trade negotiations</li>
              </ul>
            </div>

            {/* Feedback Messages */}
            {verifyError && (
              <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{verifyError}</span>
              </div>
            )}

            {verifySuccess && (
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{verifySuccess}</span>
              </div>
            )}

            {/* Verification Form */}
            <form onSubmit={handleVerifyLinkedInCompany} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-mono font-bold uppercase text-slate-400">
                  LinkedIn Organization URN / ID
                </label>
                <input
                  type="text"
                  value={linkedinOrgInput}
                  onChange={(e) => setLinkedinOrgInput(e.target.value)}
                  placeholder="e.g. urn:li:organization:12345678 or apex-software"
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#0A66C2] transition-colors"
                />
                <p className="text-[10px] text-slate-500">
                  Leave blank to auto-detect using your current authenticated LinkedIn session.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsLinkedInModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={verifyingLinkedIn}
                  className="px-5 py-2.5 rounded-xl bg-[#0A66C2] hover:bg-[#084e96] text-white font-bold text-xs shadow-lg shadow-[#0A66C2]/20 flex items-center gap-2 transition-all cursor-pointer"
                >
                  {verifyingLinkedIn ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Verifying ACL...
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5" /> Authenticate & Verify
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}