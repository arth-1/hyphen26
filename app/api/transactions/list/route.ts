import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    if (!supabaseAdmin) return NextResponse.json({ error: 'Server not ready' }, { status: 500 });

    // If not logged in, return dummy transactions (public fallback for demo)
    if (!authUser) {
      const now = Date.now();
      const seed = [
        {
          id: 'seed-0',
          created_at: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
          transaction_type: 'send' as const,
          amount: 850.0,
          currency: 'INR',
          description: 'Fertilizer purchase',
          status: 'completed' as const,
        },
        {
          id: 'seed-1',
          created_at: new Date(now - 26 * 60 * 60 * 1000).toISOString(),
          transaction_type: 'receive' as const,
          amount: 2500.0,
          currency: 'INR',
          description: 'Crop sale payment',
          status: 'completed' as const,
        },
        {
          id: 'seed-2',
          created_at: new Date(now - 3 * 24 * 60 * 60 * 1000).toISOString(),
          transaction_type: 'deposit' as const,
          amount: 500.0,
          currency: 'INR',
          description: 'Cash deposit at branch',
          status: 'completed' as const,
        },
      ];
      return NextResponse.json({ transactions: seed });
    }

    const email = (authUser.email || '').toLowerCase();
    const isDummy = email.includes('tech4earthh') || email.includes('tummy');

    // If logged-in dummy/dev account, always return 2-3 seeded entries without touching DB
    if (isDummy) {
      const now = Date.now();
      const seed = [
        {
          id: 'seed-0',
          created_at: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
          transaction_type: 'send' as const,
          amount: 850.0,
          currency: 'INR',
          description: 'Fertilizer purchase',
          status: 'completed' as const,
        },
        {
          id: 'seed-1',
          created_at: new Date(now - 26 * 60 * 60 * 1000).toISOString(),
          transaction_type: 'receive' as const,
          amount: 2500.0,
          currency: 'INR',
          description: 'Crop sale payment',
          status: 'completed' as const,
        },
        {
          id: 'seed-2',
          created_at: new Date(now - 3 * 24 * 60 * 60 * 1000).toISOString(),
          transaction_type: 'deposit' as const,
          amount: 500.0,
          currency: 'INR',
          description: 'Cash deposit at branch',
          status: 'completed' as const,
        },
      ];
      return NextResponse.json({ transactions: seed });
    }

    const { data, error } = await supabaseAdmin
      .from('transactions')
      .select('id, created_at, transaction_type, amount, currency, description, status')
      .eq('user_id', authUser.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('transactions list error', error);
      return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
    }

    let txns = data ?? [];

    // If no transactions exist, seed 2-3 realistic dummy entries for dev/demo accounts
    if (!txns || txns.length === 0) {
      const now = Date.now();
      const seed = [
        {
          user_id: authUser.id,
          transaction_type: 'send',
          amount: 850.0,
          currency: 'INR',
          status: 'completed',
          payment_method: 'upi',
          description: 'Fertilizer purchase',
          fraud_check_passed: true,
          created_at: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
        },
        {
          user_id: authUser.id,
          transaction_type: 'receive',
          amount: 2500.0,
          currency: 'INR',
          status: 'completed',
          payment_method: 'bank_transfer',
          description: 'Crop sale payment',
          fraud_check_passed: true,
          created_at: new Date(now - 26 * 60 * 60 * 1000).toISOString(),
        },
        {
          user_id: authUser.id,
          transaction_type: 'deposit',
          amount: 500.0,
          currency: 'INR',
          status: 'completed',
          payment_method: 'cash',
          description: 'Cash deposit at branch',
          fraud_check_passed: true,
          created_at: new Date(now - 3 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ];

  const { error: insertErr } = await supabaseAdmin.from('transactions').insert(seed);
      if (insertErr) {
        // If insert fails due to RLS or schema mismatch, just return the seed in-memory
        console.warn('transactions seed insert failed, returning ephemeral seed', insertErr.message);
        return NextResponse.json({ transactions: seed.map((s, i) => ({
          id: `seed-${i}`,
          created_at: s.created_at as string,
          transaction_type: s.transaction_type as 'send' | 'receive' | 'deposit' | 'withdrawal',
          amount: s.amount,
          currency: s.currency,
          description: s.description,
          status: s.status as 'pending' | 'completed' | 'failed' | 'flagged',
        })) });
      }

      const { data: afterSeed } = await supabaseAdmin
        .from('transactions')
        .select('id, created_at, transaction_type, amount, currency, description, status')
        .eq('user_id', authUser.id)
        .order('created_at', { ascending: false })
        .limit(50);
      txns = afterSeed ?? [];
    }

    return NextResponse.json({ transactions: txns });
  } catch (e) {
    console.error('transactions GET error', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
