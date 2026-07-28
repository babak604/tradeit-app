'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { X, Send, Video, Building2 } from 'lucide-react';

interface ProposalModalProps {
  offer: {
    id: string;
    title: string;
    offered_asset_type: string;
    offered_asset_value_usd: number;
    seeking_asset_type: string;
    companies: {
      name: string;
    };
  };
  isOpen: boolean;
  onClose: () => void;
}

export default function TradeProposalModal({ offer, isOpen, onClose }: ProposalModalProps) {
  const supabase = createClient();
  const [pitchMessage, setPitchMessage] = useState('');
  const [responseVideoUrl, setResponseVideoUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      alert('Please log in to submit a trade proposal.');
      setSubmitting(false);
      return;
    }

    const { error } = await supabase.from('trade_proposals').insert([
      {
        offer_id: offer.id,
        proposing_company_id: user.id,
        pitch_message: pitchMessage,
        response_video_url: responseVideoUrl || null,
        status: 'pending',
      },
    ]);

    if (error) {
      alert(`Error sending proposal: ${error.message}`);
    } else {
      alert('Trade proposal sent successfully!');
      onClose();
    }
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl text-slate-100">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-sky-400" />
            <h3 className="font-bold text-lg text-white">Propose Trade to {offer.companies?.name}</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="my-4 p-3 bg-slate-950 border border-slate-800/80 rounded-xl text-xs space-y-1 text-slate-300">
          <p><span className="text-slate-500 font-semibold uppercase">Target Asset:</span> {offer.title}</p>
          <p><span className="text-slate-500 font-semibold uppercase">Est. Value:</span> <span className="text-emerald-400 font-bold">${offer.offered_asset_value_usd.toLocaleString()} USD</span></p>
          <p><span className="text-slate-500 font-semibold uppercase">Seeking:</span> {offer.seeking_asset_type}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase font-bold tracking-wider text-slate-300 mb-1.5">
              Your Proposal / Counter-Offer Terms
            </label>
            <textarea
              required
              rows={4}
              placeholder="Detail what asset, credits, or service hours your company will exchange in return..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm focus:outline-none focus:border-sky-500 text-white"
              value={pitchMessage}
              onChange={(e) => setPitchMessage(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs uppercase font-bold tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Video className="w-4 h-4 text-sky-400" /> Counter Pitch Video URL (Optional)
            </label>
            <input
              type="url"
              placeholder="https://..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-sky-500 text-white"
              value={responseVideoUrl}
              onChange={(e) => setResponseVideoUrl(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
          >
            {submitting ? 'Submitting Trade Proposal...' : 'Send Trade Proposal'} <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}