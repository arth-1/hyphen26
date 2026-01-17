import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    const body = await req.json();
    const { name, upi_id, account_number, ifsc_code } = body || {};

    if (!name || (!upi_id && !account_number)) {
      return NextResponse.json({ error: 'Name and a payment identifier (UPI or account) are required' }, { status: 400 });
    }

    const email = (authUser?.email || '').toLowerCase();
    const isDummy = !authUser || email.includes('tech4earthh') || email.includes('tummy');

    
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Server not ready' }, { status: 500 });
    }

    if (isDummy) {
      // Ephemeral seed for demo
      return NextResponse.json({
        beneficiary: {
          id: `seed-${Math.random().toString(36).slice(2)}`,
          name,
          upi_id: upi_id || null,
          account_number: account_number || null,
          ifsc_code: ifsc_code || null,
          created_at: new Date().toISOString(),
        }
      });
    }

    const { data, error } = await supabaseAdmin
      .from('beneficiaries')
      .insert({
        user_id: authUser!.id,
        name,
        upi_id: upi_id || null,
        account_number: account_number || null,
        ifsc_code: ifsc_code || null,
        added_via: 'manual',
      })
      .select('id, name, upi_id, account_number, ifsc_code, created_at')
      .single();

    if (error) return NextResponse.json({ error: 'Failed to add beneficiary' }, { status: 500 });

    return NextResponse.json({ beneficiary: data });
  } catch (e) {
    console.error('beneficiaries add error', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
