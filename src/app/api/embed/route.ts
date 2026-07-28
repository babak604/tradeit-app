import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Helper to generate vector embedding via OpenAI
async function generateEmbedding(text: string): Promise<number[]> {
  if (!OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY environment variable is not configured.');
  }

  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: text,
      dimensions: 1536,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`OpenAI Embedding API Error: ${errorData.error?.message || response.statusText}`);
  }

  const data = await response.json();
  return data.data[0].embedding;
}

export async function POST(request: Request) {
  try {
    const { offerId, offeringSummary, lookingForSummary } = await request.json();

    if (!offerId || !offeringSummary || !lookingForSummary) {
      return NextResponse.json(
        { error: 'Missing offerId, offeringSummary, or lookingForSummary' },
        { status: 400 }
      );
    }

    // 1. Generate 1536-dimensional vectors for both offering and seeking summaries in parallel
    const [offeringEmbedding, lookingForEmbedding] = await Promise.all([
      generateEmbedding(offeringSummary),
      generateEmbedding(lookingForSummary),
    ]);

    // 2. Save vectors into Supabase pgvector columns
    const supabase = await createServerSupabaseClient();
    const { error: updateError } = await supabase
      .from('trade_offers')
      .update({
        offering_embedding: offeringEmbedding,
        looking_for_embedding: lookingForEmbedding,
      })
      .eq('id', offerId);

    if (updateError) {
      console.error('Supabase Vector Update Error:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      offerId,
      message: 'Successfully generated and stored dual 1536-dim embeddings.',
    });
  } catch (err: any) {
    console.error('Embedding Route Error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}