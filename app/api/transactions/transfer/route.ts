import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    const email = (authUser?.email || '').toLowerCase();
    const isDummy = !authUser || email.includes('tech4earthh') || email.includes('tummy');

    const body = await req.json();
    const { amount, description, beneficiaryId, newBeneficiary, paymentMethod = 'bank_transfer' } = body || {};
    if (!amount || amount <= 0) return NextResponse.json({ error: 'Amount must be positive' }, { status: 400 });

    let effectiveBeneficiaryId: string | null = beneficiaryId || null;
    let effectiveBeneficiaryName: string | null = null;

    // Create beneficiary for real users if needed
    if (!effectiveBeneficiaryId && newBeneficiary && !isDummy) {
      const { name, upi_id, account_number, ifsc_code } = newBeneficiary;

      
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Server not ready' }, { status: 500 });
    }
      const { data: ben, error: benErr } = await supabaseAdmin
        .from('beneficiaries')
        .insert({ user_id: authUser!.id, name, upi_id: upi_id || null, account_number: account_number || null, ifsc_code: ifsc_code || null, added_via: 'manual' })
        .select('id, name')
        .single();
      if (benErr || !ben) return NextResponse.json({ error: 'Failed to add beneficiary' }, { status: 500 });
      effectiveBeneficiaryId = ben.id;
      effectiveBeneficiaryName = ben.name;
    } else if (!effectiveBeneficiaryId && newBeneficiary && isDummy) {
      effectiveBeneficiaryId = `seed-${Math.random().toString(36).slice(2)}`;
      effectiveBeneficiaryName = newBeneficiary.name || 'Unknown';
    }

    // Run fraud check
    const fraudRes = await fetch(new URL('/api/fraud/check', req.nextUrl.origin), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: authUser?.id, amount, beneficiaryId: effectiveBeneficiaryId || undefined }),
    });
    const fraud = await fraudRes.json();

    if (isDummy) {
      // For demo accounts, honor the fraud decision from the AI+rules instead of forcing a flag.
      const safe: boolean = !!fraud?.safe;
      const riskScore: number = Number(fraud?.riskScore) || 0.8;
      const flagged = !safe;
      return NextResponse.json({
        status: flagged ? 'flagged' : 'completed',
        flagged,
        riskScore,
        flags: fraud?.flags || [],
        message: flagged ? 'Transfer flagged by real-time detection.' : 'Transfer simulated successfully',
      });
    }

    // Real user: block or complete based on fraud result
    const safe: boolean = !!fraud?.safe;
    const riskScore: number = Number(fraud?.riskScore) || 0;
    const status: 'flagged' | 'completed' = safe ? 'completed' : 'flagged';

    
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Server not ready' }, { status: 500 });
    }

    const { data: inserted, error } = await supabaseAdmin
      .from('transactions')
      .insert({
        user_id: authUser!.id,
        transaction_type: 'send',
        amount,
        currency: 'INR',
        beneficiary_id: effectiveBeneficiaryId,
        beneficiary_name: effectiveBeneficiaryName,
        status,
        payment_method: paymentMethod,
        description: description || null,
        metadata: { fraud },
        risk_score: riskScore,
        fraud_check_passed: safe,
        completed_at: safe ? new Date().toISOString() : null,
      })
      .select('id, status, risk_score, fraud_check_passed')
      .single();

    if (error) {
      console.error('transfer insert error', error);
      return NextResponse.json({ error: 'Transfer failed' }, { status: 500 });
    }

    return NextResponse.json({
      status,
      flagged: !safe,
      riskScore,
      transactionId: inserted?.id,
      fraud
    });
  } catch (e) {
    console.error('transfer error', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
