'use client';

import { Card, CardContent } from '@/updated_ui/components/ui/card';
import { Badge } from '@/updated_ui/components/ui/badge';
import { Button } from '@/updated_ui/components/ui/button';
import { Progress } from '@/updated_ui/components/ui/progress';
import { TrendingUp, Calendar, IndianRupee, CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface RecurringDeposit {
  id: string;
  account_id: string;
  monthly_amount: string;
  interest_rate: string;
  tenure_months: number;
  current_value?: string;
  maturity_amount: string;
  maturity_date: string;
  auto_debit_enabled: boolean;
  next_payment_date?: string;
  payments_made: number;
  status: 'active' | 'matured' | 'defaulted' | 'premature_closed';
  created_at: string;
}

interface RecurringDepositsListProps {
  recurringDeposits: RecurringDeposit[];
  language?: string;
  showBalance?: boolean;
}

export function RecurringDepositsList({ 
  recurringDeposits, 
  language = 'hi', 
  showBalance = true 
}: RecurringDepositsListProps) {
  const content = {
    hi: {
      noRDs: 'कोई आवर्ती जमा नहीं मिली',
      monthlyAmount: 'मासिक राशि',
      interestRate: 'ब्याज दर',
      tenure: 'अवधि',
      currentValue: 'वर्तमान मूल्य',
      maturityAmount: 'परिपक्वता राशि',
      maturityDate: 'परिपक्वता तिथि',
      nextPayment: 'अगला भुगतान',
      paymentsMade: 'भुगतान किया गया',
      autoDebit: 'ऑटो डेबिट',
      enabled: 'सक्षम',
      disabled: 'अक्षम',
      active: 'सक्रिय',
      matured: 'परिपक्व',
      defaulted: 'डिफॉल्ट',
      prematureClosed: 'समय से पहले बंद',
      months: 'महीने',
      years: 'साल',
      viewDetails: 'विवरण देखें',
      payNow: 'अभी भुगतान करें',
      progress: 'प्रगति',
      completed: 'पूर्ण',
    },
    en: {
      noRDs: 'No Recurring Deposits found',
      monthlyAmount: 'Monthly Amount',
      interestRate: 'Interest Rate',
      tenure: 'Tenure',
      currentValue: 'Current Value',
      maturityAmount: 'Maturity Amount',
      maturityDate: 'Maturity Date',
      nextPayment: 'Next Payment',
      paymentsMade: 'Payments Made',
      autoDebit: 'Auto Debit',
      enabled: 'Enabled',
      disabled: 'Disabled',
      active: 'Active',
      matured: 'Matured',
      defaulted: 'Defaulted',
      prematureClosed: 'Premature Closed',
      months: 'months',
      years: 'years',
      viewDetails: 'View Details',
      payNow: 'Pay Now',
      progress: 'Progress',
      completed: 'Completed',
    },
  };

  const t = content[language as keyof typeof content] || content.en;

  const statusColors = {
    active: 'bg-blue-100 text-blue-800',
    matured: 'bg-green-100 text-green-800',
    defaulted: 'bg-red-100 text-red-800',
    premature_closed: 'bg-orange-100 text-orange-800',
  };

  const statusIcons = {
    active: <Clock className="w-4 h-4" />,
    matured: <CheckCircle className="w-4 h-4" />,
    defaulted: <AlertCircle className="w-4 h-4" />,
    premature_closed: <AlertCircle className="w-4 h-4" />,
  };

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(parseFloat(amount));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const calculateProgress = (rd: RecurringDeposit) => {
    return (rd.payments_made / rd.tenure_months) * 100;
  };

  if (recurringDeposits.length === 0) {
    return (
      <Card className="shadow-lg">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <TrendingUp className="w-16 h-16 text-gray-300 mb-4" />
          <p className="text-gray-500">{t.noRDs}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {recurringDeposits.map((rd) => {
        const tenureYears = Math.floor(rd.tenure_months / 12);
        const tenureMonthsRem = rd.tenure_months % 12;
        const progress = calculateProgress(rd);

        return (
          <Card key={rd.id} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
            <div className="h-2 bg-gradient-to-r from-purple-500 to-pink-500" />
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {t.monthlyAmount}
                    </h3>
                    <p className="text-xl font-bold text-gray-900">
                      {showBalance ? formatCurrency(rd.monthly_amount) : '••••••'}
                    </p>
                  </div>
                </div>
                <Badge variant="secondary" className={`${statusColors[rd.status]} flex items-center gap-1`}>
                  {statusIcons[rd.status]}
                  {t[rd.status as keyof typeof t]}
                </Badge>
              </div>

              <div className="space-y-3 mb-4">
                {rd.current_value && (
                  <div className="flex justify-between items-center text-sm p-3 bg-purple-50 rounded-lg">
                    <span className="text-gray-700 font-medium">{t.currentValue}</span>
                    <span className="text-lg font-bold text-purple-600">
                      {showBalance ? formatCurrency(rd.current_value) : '••••••'}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">{t.maturityAmount}</span>
                  <span className="text-lg font-bold text-gray-900">
                    {showBalance ? formatCurrency(rd.maturity_amount) : '••••••'}
                  </span>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">{t.interestRate}</span>
                  <span className="font-semibold text-purple-600">{rd.interest_rate}% p.a.</span>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">{t.tenure}</span>
                  <span className="font-semibold text-gray-900">
                    {tenureYears > 0 && `${tenureYears} ${t.years} `}
                    {tenureMonthsRem > 0 && `${tenureMonthsRem} ${t.months}`}
                  </span>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600 flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {t.maturityDate}
                  </span>
                  <span className="font-semibold text-gray-900">
                    {formatDate(rd.maturity_date)}
                  </span>
                </div>

                {rd.next_payment_date && rd.status === 'active' && (
                  <div className="flex justify-between items-center text-sm p-2 bg-yellow-50 rounded border border-yellow-200">
                    <span className="text-yellow-800 font-medium">{t.nextPayment}</span>
                    <span className="font-semibold text-yellow-900">
                      {formatDate(rd.next_payment_date)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">{t.autoDebit}</span>
                  <Badge variant={rd.auto_debit_enabled ? 'default' : 'secondary'}>
                    {rd.auto_debit_enabled ? t.enabled : t.disabled}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-xs text-gray-600">
                  <span>{t.progress}</span>
                  <span>
                    {rd.payments_made} / {rd.tenure_months} {t.months} ({progress.toFixed(0)}%)
                  </span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1">
                  {t.viewDetails}
                </Button>
                {rd.status === 'active' && !rd.auto_debit_enabled && (
                  <Button className="flex-1 bg-purple-600 hover:bg-purple-700">
                    <IndianRupee className="w-4 h-4 mr-2" />
                    {t.payNow}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
