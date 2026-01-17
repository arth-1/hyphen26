import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { generateEmbeddingGemini, generateAnswerGemini } from '@/lib/gemini';

// This endpoint handles RAG-based queries over government circulars
export async function POST(request: NextRequest) {
  try {
    const { query, language, userId } = await request.json();

    if (!query || !query.trim()) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

  // Step 1: Generate embedding for the query using Gemini (padded to 1536 dims)
  const queryEmbedding = await generateEmbeddingGemini(query);
  
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Server not ready' }, { status: 500 });
    }

    // Step 2: Vector similarity search in Supabase
    const { data: relevantCirculars, error: searchError } = await supabaseAdmin
      .rpc('match_circulars', {
        query_embedding: queryEmbedding,
        match_threshold: 0.7,
        match_count: 5,
        filter_language: language,
      });

    if (searchError) {
      console.error('Circular search error:', searchError);
      return NextResponse.json(
        { error: 'Search failed' },
        { status: 500 }
      );
    }

    // Step 3: Construct context from top results
    const context = relevantCirculars
      ?.map((c: Record<string, string>) => `Title: ${c.title}\nSource: ${c.source}\nContent: ${c.raw_text}`)
      .join('\n\n---\n\n');

    // Step 4: Call LLM with RAG context
  const answer = await generateAnswerGemini({ query, context: context || '', language });

    // Step 5: Format sources
    const sources = relevantCirculars?.map((c: Record<string, string>) => ({
      id: c.id,
      title: c.title,
      source: c.source || 'Government',
      excerpt: c.raw_text.substring(0, 200) + '...',
    })) || [];

    // Step 6: Calculate confidence based on similarity scores
    const avgSimilarity = relevantCirculars?.length
      ? relevantCirculars.reduce((sum: number, c: Record<string, number>) => sum + (c.similarity || 0), 0) /
        relevantCirculars.length
      : 0;

    // Log query for analytics
    const isUUIDv4 = (v: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
    if (userId && isUUIDv4(userId)) {
      await supabaseAdmin.from('security_logs').insert({
        user_id: userId,
        event_type: 'circular_query',
        details: {
          query: query.substring(0, 100),
          language,
          results_count: sources.length,
          confidence: avgSimilarity,
        },
      });
    }

    return NextResponse.json({
      answer,
      sources,
      confidence: avgSimilarity,
    });
  } catch (error) {
    console.error('Circular query error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// All helper code migrated to lib/gemini
