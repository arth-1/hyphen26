"use client";

import { useEffect, useMemo, useState } from 'react';
import { X, Bell, AlertCircle, CheckCircle2, Calendar, Zap, Home, GraduationCap, CreditCard, Smartphone, Wifi, TrendingUp, PlusCircle } from 'lucide-react';

interface PersonalFinancesScreenProps {
  onBack: () => void;
  language: string;
}

type IconType = React.ComponentType<{ className?: string }>;

interface Payment {
  id: string;
  name: string;
  nameKey: string;
  amount: number;
  dueDate: string; // display-friendly (e.g., 'Nov 3')
  daysLeft: number; // negative for past/paid
  status: 'urgent' | 'upcoming' | 'paid' | 'overdue';
  icon: IconType;
  color: string; // tailwind gradient from-to
  category: string;
}

interface CategorySummary { name: string; amount: number; percentage: number; color: string }

type LocaleStrings = {
  personalFinances: string; upcomingPayments: string; paidBills: string; expenseBreakdown: string; totalExpenses: string; urgent: string; paid: string; dueIn: string; days: string; day: string; electricityBill: string; rent: string; schoolFee: string; loanEMI: string; creditCard: string; internet: string; mobile: string; waterBill: string; thisMonth: string; dueToday: string; overdue: string; payNow: string; viewAll: string; budgetStatus: string; spent: string; remaining: string; addNew: string; addBill: string; addLoan: string; addSubscription: string; nothingYet: string;
};

export function PersonalFinancesScreen({ onBack, language }: PersonalFinancesScreenProps) {
  const t: Record<string, LocaleStrings> = useMemo(() => ({
    en: {
      personalFinances: 'Personal Finances',
      upcomingPayments: 'Upcoming Payments',
      paidBills: 'Paid This Month',
      expenseBreakdown: 'Expense Breakdown',
      totalExpenses: 'Total Expenses',
      urgent: 'Due Soon',
      paid: 'Paid',
      dueIn: 'Due in',
      days: 'days',
      day: 'day',
      electricityBill: 'Electricity Bill',
      rent: 'House Rent',
      schoolFee: 'School Fee',
      loanEMI: 'Loan EMI',
      creditCard: 'Credit Card',
      internet: 'Internet',
      mobile: 'Mobile',
      waterBill: 'Water Bill',
      thisMonth: 'This Month',
      dueToday: 'Due Today',
      overdue: 'Overdue',
      payNow: 'Pay Now',
      viewAll: 'View All',
      budgetStatus: 'Budget Status',
      spent: 'Spent',
      remaining: 'Remaining',
      addNew: 'Add New',
      addBill: 'Add Bill',
      addLoan: 'Add Loan EMI',
      addSubscription: 'Add Subscription',
      nothingYet: 'No personal finances added yet.'
    },
    hi: {
      personalFinances: 'व्यक्तिगत वित्त',
      upcomingPayments: 'आने वाले भुगतान',
      paidBills: 'इस महीने भुगतान',
      expenseBreakdown: 'खर्च विवरण',
      totalExpenses: 'कुल खर्च',
      urgent: 'जल्द देय',
      paid: 'भुगतान किया',
      dueIn: 'बाकी',
      days: 'दिन',
      day: 'दिन',
      electricityBill: 'बिजली बिल',
      rent: 'किराया',
      schoolFee: 'स्कूल फीस',
      loanEMI: 'लोन EMI',
      creditCard: 'क्रेडिट कार्ड',
      internet: 'इंटरनेट',
      mobile: 'मोबाइल',
      waterBill: 'पानी का बिल',
      thisMonth: 'इस महीने',
      dueToday: 'आज देय',
      overdue: 'बकाया',
      payNow: 'अभी भुगतान करें',
      viewAll: 'सभी देखें',
      budgetStatus: 'बजट स्थिति',
      spent: 'खर्च',
      remaining: 'बचा',
      addNew: 'नया जोड़ें',
      addBill: 'बिल जोड़ें',
      addLoan: 'लोन EMI जोड़ें',
      addSubscription: 'सब्सक्रिप्शन जोड़ें',
      nothingYet: 'अभी तक कोई व्यक्तिगत वित्त नहीं जोड़ा गया है।'
    }
  }), []);
  const TT: LocaleStrings = t[language] || t.en;

  const [payments, setPayments] = useState<Payment[]>([]);
  const [categories, setCategories] = useState<CategorySummary[]>([]);
  const [budgetLimit, setBudgetLimit] = useState<number>(35000);
  // local fetch states (optional)
  // const [loading, setLoading] = useState(true);
  // const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        // setLoading(true);
        // setError(null);
        const res = await fetch('/api/finances/summary');
        if (!res.ok) throw new Error('failed');
        const data = await res.json();
        type ApiPayment = { id?: string|number; name: string; nameKey?: string; amount: number; dueDate: string; daysLeft: number; status: 'urgent'|'upcoming'|'paid'|'overdue'; icon?: string; color?: string; category?: string };
        setPayments((data?.payments || []).map((p: ApiPayment, i: number) => ({
          id: String(p.id ?? i),
          name: p.name,
          nameKey: p.nameKey ?? 'electricityBill',
          amount: p.amount,
          dueDate: p.dueDate,
          daysLeft: p.daysLeft,
          status: p.status,
          icon: (p.icon === 'Home' ? Home : p.icon === 'GraduationCap' ? GraduationCap : p.icon === 'CreditCard' ? CreditCard : p.icon === 'Wifi' ? Wifi : p.icon === 'Smartphone' ? Smartphone : Zap),
          color: p.color ?? 'from-teal-400 to-cyan-500',
          category: p.category ?? 'utilities'
        })));
        setCategories(data?.expenseCategories || []);
        setBudgetLimit(data?.budgetLimit || 35000);
      } catch {
        // fallback to empty; UI will show add options
        setPayments([]);
        setCategories([]);
      } finally {
        // setLoading(false);
      }
    };
    run();
  }, []);

  const upcomingPayments = payments.filter(p => p.status === 'urgent' || p.status === 'upcoming' || p.status === 'overdue');
  const paidPayments = payments.filter(p => p.status === 'paid');
  const totalMonthlyExpenses = payments.reduce((sum, p) => sum + p.amount, 0);
  const totalSpent = upcomingPayments.reduce((sum, p) => sum + p.amount, 0);
  const budgetPercentage = Math.min((totalSpent / budgetLimit) * 100, 100);

  return (
    <div className="min-h-screen bg-linear-to-b from-teal-50 to-blue-50 p-6 relative">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-teal-400 rounded-full flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <p className="text-teal-900 font-semibold">{TT.personalFinances}</p>
        </div>
        <button onClick={onBack} className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm" aria-label="Close">
          <X className="w-6 h-6 text-gray-600" />
        </button>
      </div>

      {/* Budget Status */}
      <div className="bg-white rounded-3xl p-6 mb-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <p className="text-gray-900">{TT.budgetStatus}</p>
          <p className="text-gray-600 text-sm">₹ {budgetLimit.toLocaleString()}</p>
        </div>
        <div className="mb-3">
          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
            <div className={`${
              budgetPercentage > 90 ? 'bg-linear-to-r from-rose-400 to-red-500' :
              budgetPercentage > 70 ? 'bg-linear-to-r from-amber-400 to-orange-400' :
              'bg-linear-to-r from-teal-400 to-cyan-500'
            } h-4 rounded-full transition-all duration-500 ${
              budgetPercentage <= 5 ? 'w-[5%]' : budgetPercentage <= 15 ? 'w-[15%]'
              : budgetPercentage <= 25 ? 'w-[25%]' : budgetPercentage <= 35 ? 'w-[35%]'
              : budgetPercentage <= 45 ? 'w-[45%]' : budgetPercentage <= 55 ? 'w-[55%]'
              : budgetPercentage <= 65 ? 'w-[65%]' : budgetPercentage <= 75 ? 'w-[75%]'
              : budgetPercentage <= 85 ? 'w-[85%]' : budgetPercentage <= 95 ? 'w-[95%]' : 'w-full'
            }`} />
          </div>
        </div>
        <div className="flex justify-between items-center">
          <div>
            <p className="text-gray-600 text-xs">{TT.spent}</p>
            <p className="text-gray-900">₹ {totalSpent.toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="text-gray-600 text-xs">{TT.remaining}</p>
            <p className="text-teal-600">₹ {(budgetLimit - totalSpent).toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Upcoming Payments */}
      <div className="bg-white rounded-3xl p-6 mb-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-teal-600" />
            <p className="text-gray-900">{TT.upcomingPayments}</p>
          </div>
          {upcomingPayments.length > 0 && (
            <div className="w-6 h-6 bg-rose-100 rounded-full flex items-center justify-center">
              <span className="text-rose-600 text-xs">{upcomingPayments.length}</span>
            </div>
          )}
        </div>

        <div className="space-y-3">
          {upcomingPayments.map((payment) => (
            <div key={payment.id} className={`${payment.status === 'overdue' ? 'bg-linear-to-r from-rose-50 to-red-50 border-2 border-rose-200' : payment.status === 'urgent' ? 'bg-linear-to-r from-amber-50 to-orange-50 border-2 border-amber-200' : 'bg-linear-to-r from-blue-50 to-indigo-50'} rounded-2xl p-4`}>
              <div className="flex items-start gap-3">
                <div className={`w-12 h-12 bg-linear-to-br ${payment.color} rounded-full flex items-center justify-center shrink-0`}>
                  <payment.icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="text-gray-900">{TT[payment.nameKey as keyof typeof TT] || payment.name}</p>
                      <p className="text-gray-600 text-sm">{payment.dueDate}</p>
                    </div>
                    <p className="text-gray-900">₹ {payment.amount.toLocaleString()}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    {payment.status === 'overdue' ? (
                      <div className="flex items-center gap-1 bg-rose-200 px-3 py-1 rounded-full">
                        <AlertCircle className="w-3 h-3 text-rose-700" />
                        <span className="text-rose-700 text-xs">{TT.overdue}</span>
                      </div>
                    ) : payment.daysLeft === 0 ? (
                      <div className="flex items-center gap-1 bg-amber-200 px-3 py-1 rounded-full">
                        <AlertCircle className="w-3 h-3 text-amber-700" />
                        <span className="text-amber-700 text-xs">{TT.dueToday}</span>
                      </div>
                    ) : payment.daysLeft <= 3 ? (
                      <div className="flex items-center gap-1 bg-amber-200 px-3 py-1 rounded-full">
                        <Calendar className="w-3 h-3 text-amber-700" />
                        <span className="text-amber-700 text-xs">{payment.daysLeft} {payment.daysLeft === 1 ? TT.day : TT.days}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 bg-blue-100 px-3 py-1 rounded-full">
                        <Calendar className="w-3 h-3 text-blue-700" />
                        <span className="text-blue-700 text-xs">{payment.daysLeft} {TT.days}</span>
                      </div>
                    )}
                    {(payment.status === 'overdue' || payment.daysLeft <= 2) && (
                      <button className="bg-teal-500 text-white px-4 py-1 rounded-full text-xs hover:bg-teal-400 transition-colors">
                        {TT.payNow}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Expense Breakdown */}
      <div className="bg-white rounded-3xl p-6 mb-6 shadow-lg">
        <p className="text-gray-900 mb-4">{TT.expenseBreakdown}</p>
        <div className="mb-4">
          <p className="text-gray-600 text-xs mb-2">{TT.thisMonth}</p>
          <p className="text-gray-900 mb-3">₹ {totalMonthlyExpenses.toLocaleString()}</p>
          <div className="w-full h-8 bg-gray-100 rounded-full overflow-hidden flex">
            {(categories.length > 0 ? categories : [
              { name: TT.rent, amount: 15000, percentage: 48, color: 'bg-blue-500' },
              { name: TT.schoolFee, amount: 8500, percentage: 27, color: 'bg-purple-500' },
              { name: TT.loanEMI, amount: 5200, percentage: 17, color: 'bg-rose-500' },
              { name: 'Utilities', amount: 2748, percentage: 8, color: 'bg-teal-500' },
            ]).map((category, index) => (
              <div key={index} className={`${category.color} h-full flex items-center justify-center ${
                category.percentage <= 5 ? 'w-[5%]' : category.percentage <= 15 ? 'w-[15%]'
                : category.percentage <= 25 ? 'w-[25%]' : category.percentage <= 35 ? 'w-[35%]'
                : category.percentage <= 45 ? 'w-[45%]' : category.percentage <= 55 ? 'w-[55%]'
                : category.percentage <= 65 ? 'w-[65%]' : category.percentage <= 75 ? 'w-[75%]'
                : category.percentage <= 85 ? 'w-[85%]' : category.percentage <= 95 ? 'w-[95%]' : 'w-full'
              }`}>
                {category.percentage > 15 && (
                  <span className="text-white text-xs">{category.percentage}%</span>
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-3">
          {(categories.length > 0 ? categories : [
              { name: TT.rent, amount: 15000, percentage: 48, color: 'bg-blue-500' },
              { name: TT.schoolFee, amount: 8500, percentage: 27, color: 'bg-purple-500' },
              { name: TT.loanEMI, amount: 5200, percentage: 17, color: 'bg-rose-500' },
              { name: 'Utilities', amount: 2748, percentage: 8, color: 'bg-teal-500' },
            ]).map((category, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-4 h-4 ${category.color} rounded`} />
                <p className="text-gray-900 text-sm">{category.name}</p>
              </div>
              <div className="text-right">
                <p className="text-gray-900 text-sm">₹ {category.amount.toLocaleString()}</p>
                <p className="text-gray-600 text-xs">{category.percentage}%</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Paid Bills */}
      <div className="bg-linear-to-br from-teal-50 to-cyan-50 rounded-3xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-teal-600" />
            <p className="text-gray-900">{TT.paidBills}</p>
          </div>
          <span className="text-teal-600 text-sm">{paidPayments.length} {TT.paid}</span>
        </div>
        <div className="space-y-2">
          {paidPayments.map((payment) => (
            <div key={payment.id} className="flex items-center justify-between bg-white rounded-xl p-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                  <payment.icon className="w-5 h-5 text-teal-600" />
                </div>
                <div>
                  <p className="text-gray-900 text-sm">{TT[payment.nameKey as keyof typeof TT] || payment.name}</p>
                  <p className="text-gray-600 text-xs">{payment.dueDate}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-gray-900 text-sm">₹ {payment.amount.toLocaleString()}</p>
                <div className="flex items-center gap-1 justify-end">
                  <CheckCircle2 className="w-3 h-3 text-teal-600" />
                  <span className="text-teal-600 text-xs">{TT.paid}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add New Options */}
      <div className="mt-6 bg-white rounded-3xl p-6 shadow-lg">
        {payments.length === 0 && (
          <p className="text-gray-900 mb-3">{TT.nothingYet}</p>
        )}
        <div className="flex flex-wrap gap-2">
          <button className="inline-flex items-center gap-2 bg-teal-600 text-white px-3 py-2 rounded-full text-sm"><PlusCircle className="w-4 h-4" />{TT.addBill}</button>
          <button className="inline-flex items-center gap-2 bg-amber-500 text-white px-3 py-2 rounded-full text-sm"><PlusCircle className="w-4 h-4" />{TT.addLoan}</button>
          <button className="inline-flex items-center gap-2 bg-indigo-500 text-white px-3 py-2 rounded-full text-sm"><PlusCircle className="w-4 h-4" />{TT.addSubscription}</button>
        </div>
      </div>
    </div>
  );
}
