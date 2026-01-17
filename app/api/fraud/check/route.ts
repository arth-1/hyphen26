import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getAuthUser } from '@/lib/auth';
import { evaluateFraudRiskGemini } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
  const body = await request.json();
  const amount: number = body?.amount;
  const beneficiaryId: string | undefined = body?.beneficiaryId;
  const description: string | undefined = body?.description;
    let userId: string | undefined = body?.userId;
    if (!userId) {
      const authUser = await getAuthUser(request);
      if (authUser) userId = authUser.id;
    }
    if (!userId || amount == null) {
      return NextResponse.json({ error: 'userId and amount are required' }, { status: 400 });
    }

  const flags: string[] = [];
  let risk = 0;

    if (!supabaseAdmin) {
      const safe = amount < 1000; // minimal fallback on server not ready
      return NextResponse.json({ safe, riskScore: safe ? 0.2 : 0.8, flags: ['server_unavailable'] });
    }

    // Velocity check: last 60 minutes
    const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { data: recentTx } = await supabaseAdmin
      .from('transactions')
      .select('id, amount')
      .eq('user_id', userId)
      .gte('created_at', since);

    const velocity = recentTx?.length || 0;
    if (velocity >= 5) {
      flags.push('high_velocity');
      risk += 0.3;
    }

    // Average amount baseline
    const { data: avgAgg } = await supabaseAdmin
      .from('transactions')
      .select('amount')
      .eq('user_id', userId);
    const amounts = (avgAgg || []).map((r: { amount: number }) => Number(r.amount) || 0);
    const avg = amounts.length ? amounts.reduce((a: number, b: number) => a + b, 0) / amounts.length : 0;
    if (avg > 0 && amount > 5 * avg) {
      flags.push('amount_anomaly');
      risk += 0.3;
    }

    // Capacity check: compare with last 30 days income
    const since30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const { data: lastIncome } = await supabaseAdmin
      .from('transactions')
      .select('amount, transaction_type')
      .eq('user_id', userId)
      .gte('created_at', since30);
    type TxRow = { amount: number; transaction_type: string };
    const monthlyIncome = ((lastIncome as TxRow[]) || [])
      .filter((r: TxRow) => r.transaction_type === 'receive')
      .reduce((sum: number, r: TxRow) => sum + (Number(r.amount) || 0), 0);
    if (monthlyIncome > 0 && amount > 0.6 * monthlyIncome) {
      flags.push('capacity_exceeded');
      risk += 0.4;
    }

    // New beneficiary check (< 24h)
    let newBenAgeHours: number | undefined;
    let beneficiaryVerified: boolean | undefined;
    if (beneficiaryId) {
      const { data: ben } = await supabaseAdmin
        .from('beneficiaries')
        .select('created_at, is_verified')
        .eq('id', beneficiaryId)
        .maybeSingle();
      if (ben?.created_at) {
        const created = new Date(ben.created_at).getTime();
        newBenAgeHours = Math.max(0, (Date.now() - created) / (1000 * 60 * 60));
        if (newBenAgeHours < 24 && amount > 1000) {
          flags.push('new_beneficiary');
          risk += 0.4;
        }
      }
      if (typeof (ben as { is_verified?: boolean } | null)?.is_verified === 'boolean') {
        beneficiaryVerified = Boolean((ben as { is_verified?: boolean } | null)?.is_verified);
      }
    }

    // Known flagged beneficiary/entity check via prior fraud events details
    let priorFlagged = false;
    if (beneficiaryId) {
      const { data: priorFraud } = await supabaseAdmin
        .from('fraud_events')
        .select('id')
        .contains('details', { beneficiary_id: beneficiaryId } as Record<string, unknown>)
        .limit(1);
      if (priorFraud && priorFraud.length > 0) {
        flags.push('beneficiary_flagged');
        risk += 0.5;
        priorFlagged = true;
      }
    }

    // AI augmentation with Gemini
    const ai = await evaluateFraudRiskGemini({
      amount,
      velocityLastHour: velocity,
      averageAmount: avg,
      monthlyIncome,
      newBeneficiaryAgeHours: newBenAgeHours,
      beneficiaryVerified,
      priorBeneficiaryFlagged: priorFlagged,
      description,
      language: 'en',
    });

    let finalRisk = risk;
    if (ai) {
      finalRisk = Math.max(0, Math.min(1, (risk + ai.riskScore) / 2));
      ai.flags?.forEach(f => { if (!flags.includes(f)) flags.push(f); });
    }
    const safe = (finalRisk < 0.7) && (ai ? ai.safe : true);
    return NextResponse.json({ safe, riskScore: Number(finalRisk.toFixed(2)), flags, ai: ai ? { reasons: ai.reasons, score: ai.riskScore } : undefined });
  } catch (e) {
    console.error('Fraud check error', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
