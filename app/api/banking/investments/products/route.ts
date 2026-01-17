import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  try {
    // Fetch all active investment products (public data)
    const { data: products, error } = await supabase
      .from('investment_products')
      .select('*')
      .eq('is_active', true)
      .order('product_type', { ascending: true });

    if (error) {
      console.error('Error fetching investment products:', error);
      return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
    }

    return NextResponse.json({ products: products || [] });
  } catch (error) {
    console.error('Error in investment products API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
