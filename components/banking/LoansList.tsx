'use client';

import { Card, CardContent } from '@/updated_ui/components/ui/card';
import { Badge } from '@/updated_ui/components/ui/badge';
import { Button } from '@/updated_ui/components/ui/button';
import { Progress } from '@/updated_ui/components/ui/progress';
import { Landmark, Calendar, IndianRupee, AlertCircle, CheckCircle, Clock, FileText } from 'lucide-react';

interface Loan {
  id: string;
  account_id: string;
  loan_type: 'personal' | 'home' | 'auto' | 'education' | 'gold';
  applied_amount: string;
  sanctioned_amount?: string;
  outstanding_balance?: string;
  interest_rate: string;
  tenure_months: number;
  emi_amount?: string;
  emi_day?: number;
  next_emi_date?: string;
  disbursement_date?: string;
  status: 'pending_approval' | 'approved' | 'disbursed' | 'active' | 'rejected' | 'closed' | 'defaulted';
  created_at: string;
}

interface LoansListProps {
  loans: Loan[];
  language?: string;
  showBalance?: boolean;
}

export function LoansList({ loans, language = 'hi', showBalance = true }: LoansListProps) {
  const content = {
    hi: {
      noLoans: 'कोई ऋण नहीं मिला',
      personal: 'व्यक्तिगत ऋण',
      home: 'होम लोन',
      auto: 'ऑटो लोन',
      education: 'शिक्षा ऋण',
      gold: 'गोल्ड लोन',
      appliedAmount: 'आवेदित राशि',
      sanctionedAmount: 'स्वीकृत राशि',
      outstandingBalance: 'बकाया राशि',
      interestRate: 'ब्याज दर',
      tenure: 'अवधि',
      emiAmount: 'EMI राशि',
      nextEMI: 'अगली EMI',
      pending_approval: 'स्वीकृति लंबित',
      approved: 'स्वीकृत',
      disbursed: 'वितरित',
      active: 'सक्रिय',
      rejected: 'अस्वीकृत',
      closed: 'बंद',
      defaulted: 'डिफॉल्ट',
      months: 'महीने',
      years: 'साल',
      viewDetails: 'विवरण देखें',
      payNow: 'अभी भुगतान करें',
      repaymentProgress: 'पुनर्भुगतान प्रगति',
      paid: 'भुगतान किया',
      remaining: 'शेष',
    },
    en: {
      noLoans: 'No Loans found',
      personal: 'Personal Loan',
      home: 'Home Loan',
      auto: 'Auto Loan',
      education: 'Education Loan',
      gold: 'Gold Loan',
      appliedAmount: 'Applied Amount',
      sanctionedAmount: 'Sanctioned Amount',
      outstandingBalance: 'Outstanding Balance',
      interestRate: 'Interest Rate',
      tenure: 'Tenure',
      emiAmount: 'EMI Amount',
      nextEMI: 'Next EMI',
      pending_approval: 'Pending Approval',
      approved: 'Approved',
      disbursed: 'Disbursed',
      active: 'Active',
      rejected: 'Rejected',
      closed: 'Closed',
      defaulted: 'Defaulted',
      months: 'months',
      years: 'years',
      viewDetails: 'View Details',
      payNow: 'Pay Now',
      repaymentProgress: 'Repayment Progress',
      paid: 'Paid',
      remaining: 'Remaining',
    },
  };

  const t = content[language as keyof typeof content] || content.en;

  const loanTypeText = {
    personal: t.personal,
    home: t.home,
    auto: t.auto,
    education: t.education,
    gold: t.gold,
  };

  const statusColors = {
    pending_approval: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-blue-100 text-blue-800',
    disbursed: 'bg-green-100 text-green-800',
    active: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    closed: 'bg-gray-100 text-gray-800',
    defaulted: 'bg-red-100 text-red-800',
  };

  const statusIcons = {
    pending_approval: <Clock className="w-4 h-4" />,
    approved: <CheckCircle className="w-4 h-4" />,
    disbursed: <CheckCircle className="w-4 h-4" />,
    active: <CheckCircle className="w-4 h-4" />,
    rejected: <AlertCircle className="w-4 h-4" />,
    closed: <CheckCircle className="w-4 h-4" />,
    defaulted: <AlertCircle className="w-4 h-4" />,
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

  const calculateRepaymentProgress = (loan: Loan) => {
    if (!loan.sanctioned_amount || !loan.outstanding_balance) return 0;
    
    const sanctioned = parseFloat(loan.sanctioned_amount);
    const outstanding = parseFloat(loan.outstanding_balance);
    const paid = sanctioned - outstanding;
    
    return (paid / sanctioned) * 100;
  };

  if (loans.length === 0) {
    return (
      <Card className="shadow-lg">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Landmark className="w-16 h-16 text-gray-300 mb-4" />
          <p className="text-gray-500">{t.noLoans}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {loans.map((loan) => {
        const tenureYears = Math.floor(loan.tenure_months / 12);
        const tenureMonthsRem = loan.tenure_months % 12;
        const repaymentProgress = calculateRepaymentProgress(loan);

        return (
          <Card key={loan.id} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
            <div className="h-2 bg-gradient-to-r from-orange-500 to-red-500" />
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-orange-100 to-red-100 rounded-lg">
                    <Landmark className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {loanTypeText[loan.loan_type]}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {formatDate(loan.created_at)}
                    </p>
                  </div>
                </div>
                <Badge variant="secondary" className={`${statusColors[loan.status]} flex items-center gap-1`}>
                  {statusIcons[loan.status]}
                  {t[loan.status as keyof typeof t]}
                </Badge>
              </div>

              <div className="space-y-3 mb-4">
                {loan.status === 'pending_approval' && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">{t.appliedAmount}</span>
                    <span className="text-lg font-bold text-gray-900">
                      {showBalance ? formatCurrency(loan.applied_amount) : '••••••'}
                    </span>
                  </div>
                )}

                {(loan.status === 'approved' || loan.status === 'disbursed' || loan.status === 'active' || loan.status === 'closed') && loan.sanctioned_amount && (
                  <>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">{t.sanctionedAmount}</span>
                      <span className="text-lg font-bold text-gray-900">
                        {showBalance ? formatCurrency(loan.sanctioned_amount) : '••••••'}
                      </span>
                    </div>

                    {loan.outstanding_balance && (loan.status === 'disbursed' || loan.status === 'active') && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">{t.outstandingBalance}</span>
                        <span className="text-xl font-bold text-orange-600">
                          {showBalance ? formatCurrency(loan.outstanding_balance) : '••••••'}
                        </span>
                      </div>
                    )}
                  </>
                )}

                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">{t.interestRate}</span>
                  <span className="font-semibold text-orange-600">{loan.interest_rate}% p.a.</span>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">{t.tenure}</span>
                  <span className="font-semibold text-gray-900">
                    {tenureYears > 0 && `${tenureYears} ${t.years} `}
                    {tenureMonthsRem > 0 && `${tenureMonthsRem} ${t.months}`}
                  </span>
                </div>

                {loan.emi_amount && (
                  <div className="flex justify-between items-center text-sm p-3 bg-orange-50 rounded-lg">
                    <span className="text-gray-700 font-medium flex items-center gap-1">
                      <IndianRupee className="w-4 h-4" />
                      {t.emiAmount}
                    </span>
                    <span className="text-lg font-bold text-orange-600">
                      {showBalance ? formatCurrency(loan.emi_amount) : '••••••'}
                    </span>
                  </div>
                )}

                {loan.next_emi_date && (loan.status === 'disbursed' || loan.status === 'active') && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {t.nextEMI}
                    </span>
                    <span className="font-semibold text-red-600">
                      {formatDate(loan.next_emi_date)}
                    </span>
                  </div>
                )}
              </div>

              {(loan.status === 'disbursed' || loan.status === 'active') && repaymentProgress > 0 && (
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>{t.repaymentProgress}</span>
                    <span>{repaymentProgress.toFixed(1)}% {t.paid}</span>
                  </div>
                  <Progress value={repaymentProgress} className="h-2" />
                </div>
              )}

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1">
                  <FileText className="w-4 h-4 mr-2" />
                  {t.viewDetails}
                </Button>
                {(loan.status === 'disbursed' || loan.status === 'active') && loan.emi_amount && (
                  <Button className="flex-1 bg-orange-600 hover:bg-orange-700">
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
