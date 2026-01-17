import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    const email = (authUser?.email || '').toLowerCase();
    const isDummy = !authUser || email.includes('tech4earthh') || email.includes('tummy');

    if (isDummy) {
      return NextResponse.json({ beneficiaries: [
        { id: 'seed-fert', name: 'Shakti Fertilizers', upi_id: 'shakti@upi', account_number: '0000000000', ifsc_code: 'SBIN000000', created_at: new Date().toISOString() },
        { id: 'seed-seed', name: 'Green Seed Store', upi_id: 'greenseed@upi', account_number: '1111111111', ifsc_code: 'HDFC000111', created_at: new Date().toISOString() },
        { id: 'seed-tractor', name: 'Bharat Tractor Parts', upi_id: 'bharat@upi', account_number: '2222222222', ifsc_code: 'ICIC000222', created_at: new Date().toISOString() },
      ]});
    }

    
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Server not ready' }, { status: 500 });
    }

    const { data, error } = await supabaseAdmin
      .from('beneficiaries')
      .select('id, name, upi_id, account_number, ifsc_code, created_at')
      .eq('user_id', authUser!.id)
      .order('created_at', { ascending: false });

    if (error) return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });

    return NextResponse.json({ beneficiaries: data || [] });
  } catch (e) {
    console.error('beneficiaries list error', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
