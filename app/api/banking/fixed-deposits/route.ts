import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  try {
    // Get user from auth header or session
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch user's fixed deposits via their accounts
    const { data: accounts } = await supabase
      .from('accounts')
      .select('id')
      .eq('user_id', user.id);

    if (!accounts || accounts.length === 0) {
      return NextResponse.json({ fixedDeposits: [] });
    }

    const accountIds = accounts.map((a) => a.id);

    const { data: fixedDeposits, error } = await supabase
      .from('fixed_deposits')
      .select('*')
      .in('account_id', accountIds)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching fixed deposits:', error);
      return NextResponse.json({ error: 'Failed to fetch fixed deposits' }, { status: 500 });
    }

    return NextResponse.json({ fixedDeposits: fixedDeposits || [] });
  } catch (error) {
    console.error('Error in fixed deposits API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
