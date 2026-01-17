import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getAuthUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request);
    if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const userId = authUser.id;

    
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Server not ready' }, { status: 500 });
    }

    // Gather signals
    const [{ data: user }, { data: tx }, { data: nfe }, { data: kyc }] = await Promise.all([
      supabaseAdmin.from('users').select('created_at, kyc_status').eq('id', userId).maybeSingle(),
      supabaseAdmin.from('transactions').select('id').eq('user_id', userId),
      supabaseAdmin.from('user_nonfinancial_events').select('id, event_type').eq('user_id', userId),
      supabaseAdmin.from('kyc_verifications').select('status').eq('user_id', userId),
    ]);

    let score = 500; // base
    const factors: string[] = [];

    const txCount = tx?.length || 0;
    if (txCount >= 10) { score += 50; factors.push('transactions_10_plus'); }
    else if (txCount >= 3) { score += 25; factors.push('transactions_3_plus'); }

    const agriReceipts = ((nfe as Array<{ event_type?: string }>) || [])
      .filter((e) => e.event_type === 'agri_input').length;
    if (agriReceipts >= 3) { score += 100; factors.push('agri_receipts_3_plus'); }
    const utilities = ((nfe as Array<{ event_type?: string }>) || [])
      .filter((e) => e.event_type === 'utility_bill').length;
    if (utilities >= 2) { score += 75; factors.push('utility_bills_2_plus'); }

    const kycVerified = ((kyc as Array<{ status?: string }>) || [])
      .some((k) => k.status === 'verified') || user?.kyc_status === 'verified';
    if (kycVerified) { score += 150; factors.push('kyc_verified'); }

    if (user?.created_at) {
      const ageDays = Math.floor((Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24));
      if (ageDays >= 90) { score += 50; factors.push('account_age_90_plus'); }
    }

    const confidence = Math.min(1, factors.length / 6);
    const softScore = Math.max(300, Math.min(1000, score));

    // Upsert credit profile
    const { data: profile } = await supabaseAdmin
      .from('credit_profiles')
      .upsert({
        user_id: userId,
        soft_score: softScore,
        confidence_level: confidence,
        factors,
        improvement_steps: [
          'Upload more receipts or bills',
          'Complete KYC if pending',
          'Increase regular transactions',
        ],
        last_calculated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' })
      .select('*')
      .single();

    return NextResponse.json({ userId, softScore, confidence, factors, profile });
  } catch (e) {
    console.error('Credit calculate error', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
