'use client';

import { Card, CardContent } from '@/updated_ui/components/ui/card';
import { Badge } from '@/updated_ui/components/ui/badge';
import { Button } from '@/updated_ui/components/ui/button';
import { Wallet, CreditCard, Building2, ExternalLink } from 'lucide-react';

interface Account {
  id: string;
  account_number: string;
  account_type: 'savings' | 'current' | 'salary';
  balance: string;
  currency: string;
  branch_code?: string;
  ifsc_code?: string;
  status: 'active' | 'inactive' | 'frozen';
  monthly_income?: string;
}

interface AccountCardProps {
  account: Account;
  language?: string;
  showBalance?: boolean;
  compact?: boolean;
}

export function AccountCard({ account, language = 'hi', showBalance = true, compact = false }: AccountCardProps) {
  const content = {
    hi: {
      savings: 'बचत खाता',
      current: 'चालू खाता',
      salary: 'वेतन खाता',
      balance: 'शेष राशि',
      accountNumber: 'खाता संख्या',
      ifsc: 'IFSC कोड',
      active: 'सक्रिय',
      inactive: 'निष्क्रिय',
      frozen: 'फ्रीज',
      viewDetails: 'विवरण देखें',
      monthlyIncome: 'मासिक आय',
    },
    en: {
      savings: 'Savings Account',
      current: 'Current Account',
      salary: 'Salary Account',
      balance: 'Balance',
      accountNumber: 'Account Number',
      ifsc: 'IFSC Code',
      active: 'Active',
      inactive: 'Inactive',
      frozen: 'Frozen',
      viewDetails: 'View Details',
      monthlyIncome: 'Monthly Income',
    },
  };

  const t = content[language as keyof typeof content] || content.en;

  const accountTypeText = {
    savings: t.savings,
    current: t.current,
    salary: t.salary,
  };

  const statusColors = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    frozen: 'bg-red-100 text-red-800',
  };

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: account.currency || 'INR',
      maximumFractionDigits: 2,
    }).format(parseFloat(amount));
  };

  const maskAccountNumber = (accNum: string) => {
    if (accNum.length <= 4) return accNum;
    return 'XXXX-XXXX-' + accNum.slice(-4);
  };

  if (compact) {
    return (
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white rounded-lg shadow-sm">
            <Wallet className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">
              {accountTypeText[account.account_type]}
            </div>
            <div className="text-xs text-gray-500">
              {maskAccountNumber(account.account_number)}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-gray-900">
            {showBalance ? formatCurrency(account.balance) : '••••••'}
          </div>
          <Badge variant="secondary" className={statusColors[account.status]}>
            {t[account.status as keyof typeof t]}
          </Badge>
        </div>
      </div>
    );
  }

  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
      <div className="h-2 bg-gradient-to-r from-blue-500 to-purple-500" />
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg">
              {account.account_type === 'savings' && <Wallet className="w-6 h-6 text-blue-600" />}
              {account.account_type === 'current' && <Building2 className="w-6 h-6 text-purple-600" />}
              {account.account_type === 'salary' && <CreditCard className="w-6 h-6 text-green-600" />}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                {accountTypeText[account.account_type]}
              </h3>
              <p className="text-sm text-gray-500">
                {maskAccountNumber(account.account_number)}
              </p>
            </div>
          </div>
          <Badge variant="secondary" className={statusColors[account.status]}>
            {t[account.status as keyof typeof t]}
          </Badge>
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex justify-between items-baseline">
            <span className="text-sm text-gray-600">{t.balance}</span>
            <span className="text-2xl font-bold text-gray-900">
              {showBalance ? formatCurrency(account.balance) : '••••••'}
            </span>
          </div>

          {account.ifsc_code && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">{t.ifsc}</span>
              <span className="font-mono text-gray-900">{account.ifsc_code}</span>
            </div>
          )}

          {account.monthly_income && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">{t.monthlyIncome}</span>
              <span className="font-semibold text-gray-900">
                {showBalance ? formatCurrency(account.monthly_income) : '••••••'}
              </span>
            </div>
          )}
        </div>

        <Button variant="outline" className="w-full">
          {t.viewDetails} <ExternalLink className="w-4 h-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
}
