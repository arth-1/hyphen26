import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { userId, idType, idNumber, documentUrl } = await request.json();
    if (!userId || !idType || !idNumber) {
      return NextResponse.json({ error: 'userId, idType and idNumber are required' }, { status: 400 });
    }

    const idHash = crypto.createHash('sha256').update(String(idNumber)).digest('hex');
    const idLast4 = String(idNumber).slice(-4);

    
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Server not ready' }, { status: 500 });
    }

    // Check duplicates (free heuristic; no paid KYC API)
    const { data: dup, error: dupErr } = await supabaseAdmin
      .from('kyc_verifications')
      .select('id, user_id, status')
      .eq('id_hash', idHash)
      .limit(1)
      .maybeSingle();

    if (dupErr) {
      console.error('KYC duplicate check error', dupErr);
    }

    const status: 'pending' | 'verified' | 'manual_review' = dup ? 'manual_review' : 'pending';

    // Insert KYC record
    const { data: rec, error: insErr } = await supabaseAdmin
      .from('kyc_verifications')
      .insert({
        user_id: userId,
        id_type: idType,
        id_hash: idHash,
        id_last_4: idLast4,
        document_url: documentUrl || null,
        status,
        provider_response: { provider: 'local-free', note: 'No external verification used' },
      })
      .select('*')
      .single();

    if (insErr) {
      console.error('KYC insert error', insErr);
      return NextResponse.json({ error: 'Failed to create KYC record' }, { status: 500 });
    }

    // If duplicate, log potential fraud
    if (dup) {
      await supabaseAdmin.from('fraud_events').insert({
        user_id: userId,
        event_type: 'duplicate_id',
        details: { existing_user_id: dup.user_id, id_type: idType },
        risk_score: 0.9,
        action_taken: 'manual_review',
      });
    }

    return NextResponse.json({
      status,
      kyc: rec,
      message: status === 'pending'
        ? 'KYC submitted for manual review (free flow).'
        : 'Possible duplicate ID detected. Sent for manual review.',
    });
  } catch (e) {
    console.error('KYC verify error', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
