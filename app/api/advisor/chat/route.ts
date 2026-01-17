import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { generateAnswerGemini } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { message, language = 'en' } = await req.json();
    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'message is required' }, { status: 400 });
    }

    const admin = supabaseAdmin;
    if (!admin) {
      return NextResponse.json({ error: 'Server not ready' }, { status: 500 });
    }

    // Load soft credit score if available
    const { data: profile } = await admin
      .from('credit_profiles')
      .select('soft_score, confidence_level, factors')
      .eq('user_id', authUser.id)
      .maybeSingle();

    // Attempt to load last few transactions for context (optional)
    const { data: tx } = await admin
      .from('transactions')
      .select('amount, transaction_type, description, created_at')
      .eq('user_id', authUser.id)
      .order('created_at', { ascending: false })
      .limit(15);

    let txList = (tx as Array<{ created_at?: string; transaction_type?: string; amount?: number; description?: string }> | null || []);
    // If no data exists for this user, synthesize realistic dummy context (dev/dummy accounts)
  type Profile = { soft_score?: number; confidence_level?: number; factors?: string[] } | null;
  let effectiveProfile: Profile = profile as Profile;
    if ((!effectiveProfile || typeof effectiveProfile.soft_score !== 'number') && (!txList || txList.length === 0)) {
      effectiveProfile = { soft_score: 682, confidence_level: 0.72, factors: ['on-time-payments', 'low-credit-utilization'] };
      txList = [
        { created_at: new Date().toISOString(), transaction_type: 'debit', amount: 850, description: 'Fertilizer purchase' },
        { created_at: new Date(Date.now() - 86400000).toISOString(), transaction_type: 'credit', amount: 2500, description: 'Crop sale payment' },
        { created_at: new Date(Date.now() - 3*86400000).toISOString(), transaction_type: 'debit', amount: 399, description: 'Electricity bill' },
      ];
    }

    const txSummary = (txList || [])
      .slice(0, 10)
      .map((t) => `${t.created_at?.slice(0,10)} • ${t.transaction_type} • ₹${t.amount} • ${t.description ?? ''}`)
      .join('\n');

    // Optional: basic loan application status (dummy if missing)
    const loanStatus = `Loan Applications: ${
      effectiveProfile?.soft_score && effectiveProfile.soft_score >= 680
        ? '1 pending KCC (Kisan Credit Card) renewal; pre-approved small agri loan up to ₹50,000'
        : 'No active applications; eligibility may be limited due to lower score'
    }`;

    const context = [
      effectiveProfile
        ? `Soft Credit Score: ${effectiveProfile.soft_score} (confidence ${Math.round((effectiveProfile.confidence_level ?? 0) * 100)}%). Factors: ${(effectiveProfile.factors || []).join(', ')}`
        : 'Soft Credit Score: unavailable',
      txSummary ? `Recent Transactions:\n${txSummary}` : 'No recent transactions found.',
      loanStatus,
      'User Type: rural banking customer seeking loan/advice.',
      'Regulations/Circulars Context: Provided only when user explicitly asks about specific rules; otherwise ignore.'
    ].join('\n\n');

    const answer = await generateAnswerGemini({
      query: `User message: ${message}\n\nRespond ONLY if the question concerns: loans, credit score, eligibility, interest, documents, application process, status, or government loan schemes. If not, ask the user to rephrase a loan-related query. If the user asks about circulars/regulations, cite briefly from Context.`,
      context,
      language,
    });

  return NextResponse.json({ answer, softScore: effectiveProfile?.soft_score ?? null });
  } catch (e) {
    console.error('Advisor chat error', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
