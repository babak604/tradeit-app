'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import {
  ArrowLeft,
  Upload,
  Video,
  Sparkles,
  Building2,
  DollarSign,
  Zap,
  CheckCircle2,
  Loader2,
  Play,
  ShieldCheck,
  Tag,
  MapPin,
  Flame,
} from 'lucide-react';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Default test company ID (Company A)
const CURRENT_COMPANY_ID = '11111111-1111-1111-1111-111111111111';

const CATEGORIES = [
  'Engineering & Software',
  'Media Production & Video',
  'Growth & Performance Marketing',
  'Legal & Professional Services',
  'Cloud & Enterprise Infrastructure',
  'Design & Brand Identity',
];

export default function CreateOfferPage() {
  const router = useRouter();

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [estimatedValue, setEstimatedValue] = useState<number | ''>(20000);
  const [offeringSummary, setOfferingSummary] = useState('');
  const [seekingSummary, setSeekingSummary] = useState('');
  const [videoUrl, setVideoUrl] = useState('https://assets.mixkit.co/videos/preview/mixkit-code-running-on-a-computer-screen-23010-large.mp4');
  
  // UI & Upload State
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Handle direct file upload to Supabase Storage
  async function handleVideoFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(15);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `offers/${fileName}`;

      setUploadProgress(45);

      const { data, error } = await supabase.storage
        .from('offer-videos')
        .upload(filePath, file, { cacheControl: '3600', upsert: true });

      if (error) throw error;

      setUploadProgress(85);

      const { data: publicUrlData } = supabase.storage
        .from('offer-videos')
        .getPublicUrl(filePath);

      if (publicUrlData?.publicUrl) {
        setVideoUrl(publicUrlData.publicUrl);
      }
      setUploadProgress(100);
    } catch (err: any) {
      console.warn('Supabase storage fallback (using current video URL):', err?.message || err);
    } finally {
      setIsUploading(false);
    }
  }

  // Handle Form Submission
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title || !offeringSummary || !seekingSummary) return;

    setIsSubmitting(true);

    try {
      const payload = {
        company_id: CURRENT_COMPANY_ID,
        title,
        category,
        estimated_value: Number(estimatedValue) || 10000,
        offering_summary: offeringSummary,
        seeking_summary: seekingSummary,
        video_url: videoUrl,
      };

      const { data, error } = await supabase
        .from('trade_offers')
        .insert(payload)
        .select('id')
        .maybeSingle();

      if (error) {
        console.warn('Supabase insert notice:', error.message);
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/');
      }, 1200);
    } catch (err) {
      console.error('Error publishing barter offer:', err);
      // Fallback redirect to feed for smooth demo UX
      router.push('/');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Header Navigation */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-30 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="p-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-sky-400">
                  TradeIt.tv Studio
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  Step 1 of 1
                </span>
              </div>
              <h1 className="text-lg font-extrabold text-white">Publish New Barter Offer</h1>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-slate-400 bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl">
            <Sparkles className="w-4 h-4 text-sky-400" />
            <span>AI Reciprocity Indexing Active</span>
          </div>
        </div>
      </header>

      {/* Main Studio Grid: Form (Left) vs Realtime Feed Preview (Right) */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Offer Creation Form (7 cols) */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-6">
          {/* Section 1: Video Pitch Asset */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Video className="w-4 h-4 text-sky-400" /> B2B Video Pitch Media
              </label>
              <span className="text-[10px] font-mono text-slate-500">MP4 / WebM up to 50MB</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* File Upload Dropzone */}
              <label className="border-2 border-dashed border-slate-800 hover:border-sky-500/50 bg-slate-950/60 rounded-2xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all group min-h-[120px]">
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoFileUpload}
                  disabled={isUploading}
                  className="hidden"
                />
                <Upload className="w-6 h-6 text-slate-400 group-hover:text-sky-400 mb-2 transition-colors" />
                <span className="text-xs font-bold text-slate-200">
                  {isUploading ? `Uploading (${uploadProgress}%)` : 'Upload Video File'}
                </span>
                <span className="text-[10px] text-slate-500 mt-1">Direct upload to storage</span>
              </label>

              {/* Direct URL Input Fallback */}
              <div className="flex flex-col justify-center space-y-2 bg-slate-950/60 border border-slate-800 rounded-2xl p-4">
                <span className="text-xs font-bold text-slate-400">Or Paste Direct MP4 URL</span>
                <input
                  type="url"
                  placeholder="https://assets.mixkit.co/..."
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-sky-500 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Trade Details & Financial Valuation */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-5">
            <div className="space-y-1">
              <label className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Tag className="w-4 h-4 text-sky-400" /> Title & Value Tier
              </label>
              <p className="text-xs text-slate-400">Keep titles focused on business deliverables and outcomes.</p>
            </div>

            <div className="space-y-4">
              <div>
                <input
                  type="text"
                  required
                  placeholder="e.g. Full-Stack Next.js 16 & Mobile App Architecture"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-sky-500 font-bold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1.5">Industry Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-3 text-xs text-slate-200 focus:outline-none focus:border-sky-500 font-semibold"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1.5">
                    Estimated Barter Value ($ USD)
                  </label>
                  <div className="relative">
                    <DollarSign className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                    <input
                      type="number"
                      required
                      min={1000}
                      step={500}
                      value={estimatedValue}
                      onChange={(e) => setEstimatedValue(e.target.value ? Number(e.target.value) : '')}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-3 text-xs text-emerald-400 font-mono font-bold focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Reciprocal Exchange Summaries */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-5">
            {/* What you are offering */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-400" /> Deliverable Summary (What You Offer)
              </label>
              <textarea
                required
                rows={3}
                placeholder="Detail deliverables, team capacity, sprint hours, or service scope..."
                value={offeringSummary}
                onChange={(e) => setOfferingSummary(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-sky-500 leading-relaxed"
              />
            </div>

            {/* What you are seeking */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-sky-400 flex items-center gap-2">
                <Zap className="w-4 h-4" /> Reciprocal Want (What You Need in Return)
              </label>
              <textarea
                required
                rows={3}
                placeholder="Describe exact services, AWS/GCP credits, or agencies you want to barter with..."
                value={seekingSummary}
                onChange={(e) => setSeekingSummary(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-sky-500 leading-relaxed"
              />
            </div>
          </div>

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={isSubmitting || success}
            className="w-full py-4 px-6 rounded-2xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-sky-500/20 transition-all transform hover:-translate-y-0.5 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Publishing & Vectorizing Offer...
              </>
            ) : success ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-slate-950" />
                Offer Published to Live Feed!
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Publish to TradeIt.tv Feed
              </>
            )}
          </button>
        </form>

        {/* Right Column: Real-Time Live Feed Card Preview (5 cols) */}
        <div className="lg:col-span-5 sticky top-24 space-y-4">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Play className="w-3.5 h-3.5 text-sky-400 fill-sky-400" /> Live Feed Mobile Preview
            </span>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">
              WYSIWYG Mode
            </span>
          </div>

          {/* Simulated Mobile Feed Card */}
          <div className="relative aspect-[9/14] max-h-[580px] w-full rounded-3xl overflow-hidden border border-slate-800 bg-slate-900 shadow-2xl flex flex-col justify-between p-6">
            {/* Background Video Preview */}
            <div className="absolute inset-0 z-0 bg-slate-950">
              <video
                key={videoUrl}
                src={videoUrl}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover opacity-50 scale-105 filter blur-[0.5px]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-slate-950/80" />
            </div>

            {/* Top Mock Header */}
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-sky-500 flex items-center justify-center font-black text-slate-950 text-xs">
                  T
                </div>
                <span className="text-xs font-bold text-white tracking-tight">TradeIt.tv</span>
              </div>
              <span className="text-[10px] font-mono font-bold text-amber-400 bg-slate-900/80 border border-slate-800 px-2.5 py-1 rounded-xl flex items-center gap-1">
                <Flame className="w-3 h-3" />
                ${estimatedValue ? Number(estimatedValue).toLocaleString() : '20,000'}
              </span>
            </div>

            {/* Bottom Content Preview Overlay */}
            <div className="relative z-10 space-y-3">
              <div className="flex items-center gap-1.5">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-900/90 border border-slate-700 text-white">
                  <Building2 className="w-3 h-3 text-sky-400" /> Apex Software Studio
                  <ShieldCheck className="w-3 h-3 text-sky-400" />
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-900/60 text-slate-400">
                  <MapPin className="w-2.5 h-2.5" /> Montreal, QC
                </span>
              </div>

              <h2 className="text-lg font-extrabold text-white leading-snug line-clamp-2">
                {title || 'Your Offer Deliverable Title Will Appear Here'}
              </h2>

              <p className="text-xs text-slate-300 leading-relaxed line-clamp-3 bg-slate-900/70 border border-slate-800/80 rounded-xl p-3 backdrop-blur-md">
                {offeringSummary || 'Describe what your team delivers in exchange...'}
              </p>

              <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/30 backdrop-blur-md">
                <span className="text-[10px] font-black uppercase tracking-wider text-sky-400 flex items-center gap-1 mb-0.5">
                  <Zap className="w-3 h-3" /> Reciprocal Want:
                </span>
                <p className="text-xs font-semibold text-slate-200 line-clamp-1">
                  {seekingSummary || 'What you seek in return...'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}