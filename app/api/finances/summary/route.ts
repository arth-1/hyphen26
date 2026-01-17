import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);

    // Dummy path if unauthenticated or dummy account
    const email = (authUser?.email || '').toLowerCase();
    const isDummy = !authUser || email.includes('tech4earthh') || email.includes('tummy');

    if (isDummy) {
      const payments = [
        { id: '1', name: 'Electricity Bill', nameKey: 'electricityBill', amount: 1250, dueDate: 'Nov 3', daysLeft: 2, status: 'urgent', icon: 'Zap', color: 'from-yellow-400 to-orange-400', category: 'utilities' },
        { id: '2', name: 'House Rent', nameKey: 'rent', amount: 15000, dueDate: 'Nov 5', daysLeft: 4, status: 'upcoming', icon: 'Home', color: 'from-blue-400 to-indigo-500', category: 'housing' },
        { id: '3', name: 'School Fee', nameKey: 'schoolFee', amount: 8500, dueDate: 'Nov 10', daysLeft: 9, status: 'upcoming', icon: 'GraduationCap', color: 'from-purple-400 to-pink-500', category: 'education' },
        { id: '4', name: 'Loan EMI', nameKey: 'loanEMI', amount: 5200, dueDate: 'Nov 1', daysLeft: 0, status: 'overdue', icon: 'CreditCard', color: 'from-rose-400 to-red-500', category: 'loan' },
        { id: '5', name: 'Internet', nameKey: 'internet', amount: 899, dueDate: 'Oct 28', daysLeft: -4, status: 'paid', icon: 'Wifi', color: 'from-teal-400 to-cyan-500', category: 'utilities' },
        { id: '6', name: 'Mobile', nameKey: 'mobile', amount: 599, dueDate: 'Oct 25', daysLeft: -7, status: 'paid', icon: 'Smartphone', color: 'from-teal-400 to-cyan-500', category: 'utilities' },
      ];
      const expenseCategories = [
        { name: 'House Rent', amount: 15000, percentage: 48, color: 'bg-blue-500' },
        { name: 'School Fee', amount: 8500, percentage: 27, color: 'bg-purple-500' },
        { name: 'Loan EMI', amount: 5200, percentage: 17, color: 'bg-rose-500' },
        { name: 'Utilities', amount: 2748, percentage: 8, color: 'bg-teal-500' },
      ];
      return NextResponse.json({ payments, expenseCategories, budgetLimit: 35000 });
    }

    // Real path: fetch from DB if available
    if (!supabaseAdmin) return NextResponse.json({ payments: [], expenseCategories: [], budgetLimit: 35000 });

    // Try to fetch user-configured finances; schema may vary, so handle errors leniently
    const { data: paymentsData } = await supabaseAdmin
      .from('finances_payments')
      .select('id, name, name_key, amount, due_date, days_left, status, icon, color, category')
      .eq('user_id', authUser!.id)
      .order('due_date', { ascending: true });

    type DbPayment = { id: string; name: string; name_key?: string; amount: number; due_date: string; days_left: number; status: 'urgent'|'upcoming'|'paid'|'overdue'; icon?: string; color?: string; category?: string };
    const payments = (paymentsData as DbPayment[] | null || []).map((p) => ({
      id: p.id,
      name: p.name,
      nameKey: p.name_key || 'electricityBill',
      amount: p.amount,
      dueDate: p.due_date,
      daysLeft: p.days_left,
      status: p.status,
      icon: p.icon || 'Zap',
      color: p.color || 'from-teal-400 to-cyan-500',
      category: p.category || 'utilities',
    }));

    const { data: cats } = await supabaseAdmin
      .from('finances_categories')
      .select('name, amount, percentage, color')
      .eq('user_id', authUser!.id);

    const expenseCategories = cats || [];

    return NextResponse.json({ payments, expenseCategories, budgetLimit: 35000 });
  } catch (e) {
    console.error('finances summary error', e);
    return NextResponse.json({ payments: [], expenseCategories: [], budgetLimit: 35000 });
  }
}
