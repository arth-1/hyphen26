'use client';

import { Card, CardContent } from '@/updated_ui/components/ui/card';
import { Badge } from '@/updated_ui/components/ui/badge';
import { Button } from '@/updated_ui/components/ui/button';
import { Progress } from '@/updated_ui/components/ui/progress';
import { PiggyBank, Calendar, TrendingUp, AlertCircle, CheckCircle, Clock } from 'lucide-react';

interface FixedDeposit {
  id: string;
  account_id: string;
  principal_amount: string;
  interest_rate: string;
  tenure_months: number;
  maturity_amount: string;
  maturity_date: string;
  status: 'active' | 'matured' | 'premature_closed';
  created_at: string;
}

interface FixedDepositsListProps {
  fixedDeposits: FixedDeposit[];
  language?: string;
  showBalance?: boolean;
  compact?: boolean;
}

export function FixedDepositsList({ 
  fixedDeposits, 
  language = 'hi', 
  showBalance = true,
  compact = false
}: FixedDepositsListProps) {
  const content = {
    hi: {
      noFDs: 'कोई सावधि जमा नहीं मिली',
      principal: 'मूल राशि',
      interestRate: 'ब्याज दर',
      tenure: 'अवधि',
      maturityAmount: 'परिपक्वता राशि',
      maturityDate: 'परिपक्वता तिथि',
      active: 'सक्रिय',
      matured: 'परिपक्व',
      prematureClosed: 'समय से पहले बंद',
      months: 'महीने',
      years: 'साल',
      createdOn: 'बनाया गया',
      viewDetails: 'विवरण देखें',
      timeRemaining: 'शेष समय',
      daysLeft: 'दिन बचे',
    },
    en: {
      noFDs: 'No Fixed Deposits found',
      principal: 'Principal',
      interestRate: 'Interest Rate',
      tenure: 'Tenure',
      maturityAmount: 'Maturity Amount',
      maturityDate: 'Maturity Date',
      active: 'Active',
      matured: 'Matured',
      prematureClosed: 'Premature Closed',
      months: 'months',
      years: 'years',
      createdOn: 'Created on',
      viewDetails: 'View Details',
      timeRemaining: 'Time Remaining',
      daysLeft: 'days left',
    },
  };

  const t = content[language as keyof typeof content] || content.en;

  const statusColors = {
    active: 'bg-blue-100 text-blue-800',
    matured: 'bg-green-100 text-green-800',
    premature_closed: 'bg-orange-100 text-orange-800',
  };

  const statusIcons = {
    active: <Clock className="w-4 h-4" />,
    matured: <CheckCircle className="w-4 h-4" />,
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

  const calculateProgress = (fd: FixedDeposit) => {
    const startDate = new Date(fd.created_at);
    const maturityDate = new Date(fd.maturity_date);
    const today = new Date();
    
    const totalDays = (maturityDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    const elapsedDays = (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    
    return Math.min(Math.max((elapsedDays / totalDays) * 100, 0), 100);
  };

  const getDaysRemaining = (maturityDate: string) => {
    const today = new Date();
    const maturity = new Date(maturityDate);
    const diffTime = maturity.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(diffDays, 0);
  };

  if (fixedDeposits.length === 0) {
    return (
      <Card className="shadow-lg">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <PiggyBank className="w-16 h-16 text-gray-300 mb-4" />
          <p className="text-gray-500">{t.noFDs}</p>
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    return (
      <div className="space-y-3">
        {fixedDeposits.map((fd) => (
          <div
            key={fd.id}
            className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border"
          >
            <div className="flex items-center gap-3">
              <PiggyBank className="w-5 h-5 text-green-600" />
              <div>
                <div className="text-sm font-medium">
                  {showBalance ? formatCurrency(fd.principal_amount) : '••••••'}
                </div>
                <div className="text-xs text-gray-500">
                  {fd.interest_rate}% • {fd.tenure_months} {t.months}
                </div>
              </div>
            </div>
            <Badge variant="secondary" className={statusColors[fd.status]}>
              {t[fd.status as keyof typeof t]}
            </Badge>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {fixedDeposits.map((fd) => {
        const progress = calculateProgress(fd);
        const daysLeft = getDaysRemaining(fd.maturity_date);
        const tenureYears = Math.floor(fd.tenure_months / 12);
        const tenureMonthsRem = fd.tenure_months % 12;

        return (
          <Card key={fd.id} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
            <div className="h-2 bg-gradient-to-r from-green-500 to-blue-500" />
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-green-100 to-blue-100 rounded-lg">
                    <PiggyBank className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {t.principal}
                    </h3>
                    <p className="text-xl font-bold text-gray-900">
                      {showBalance ? formatCurrency(fd.principal_amount) : '••••••'}
                    </p>
                  </div>
                </div>
                <Badge variant="secondary" className={`${statusColors[fd.status]} flex items-center gap-1`}>
                  {statusIcons[fd.status]}
                  {t[fd.status as keyof typeof t]}
                </Badge>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600 flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" />
                    {t.interestRate}
                  </span>
                  <span className="font-semibold text-green-600">{fd.interest_rate}% p.a.</span>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">{t.tenure}</span>
                  <span className="font-semibold text-gray-900">
                    {tenureYears > 0 && `${tenureYears} ${t.years} `}
                    {tenureMonthsRem > 0 && `${tenureMonthsRem} ${t.months}`}
                  </span>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">{t.maturityDate}</span>
                  <span className="font-semibold text-gray-900 flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {formatDate(fd.maturity_date)}
                  </span>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">{t.maturityAmount}</span>
                  <span className="text-lg font-bold text-blue-600">
                    {showBalance ? formatCurrency(fd.maturity_amount) : '••••••'}
                  </span>
                </div>
              </div>

              {fd.status === 'active' && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>{t.timeRemaining}</span>
                    <span>{daysLeft} {t.daysLeft}</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              )}

              <Button variant="outline" className="w-full mt-4">
                {t.viewDetails}
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
