'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/updated_ui/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/updated_ui/components/ui/card';
import { Button } from '@/updated_ui/components/ui/button';
import { Wallet, PiggyBank, Landmark, TrendingUp, Bot, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { AccountCard } from './banking/AccountCard';
import { FixedDepositsList } from './banking/FixedDepositsList';
import { LoansList } from './banking/LoansList';
import { RecurringDepositsList } from './banking/RecurringDepositsList';
import { InvestmentsView } from './banking/InvestmentsView';
import { BankingAIAssistant } from './BankingAIAssistant';
import { useBankingData } from '@/lib/hooks/useBankingData';

interface BankingDashboardProps {
  language?: string;
  onBack?: () => void;
}

export default function BankingDashboard({ language = 'hi', onBack }: BankingDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [showBalance, setShowBalance] = useState(true);
  
  const { accounts, fixedDeposits, loans, recurringDeposits, loading } = useBankingData();

  // Calculate totals
  const totalBalance = accounts.reduce((sum, acc) => sum + parseFloat(acc.balance || '0'), 0);
  const totalFDAmount = fixedDeposits
    .filter(fd => fd.status === 'active')
    .reduce((sum, fd) => sum + parseFloat(fd.principal_amount || '0'), 0);
  const totalLoanAmount = loans
    .filter(loan => loan.status === 'active' || loan.status === 'disbursed')
    .reduce((sum, loan) => sum + parseFloat(loan.outstanding_balance || loan.sanctioned_amount || '0'), 0);
  const totalRDAmount = recurringDeposits
    .filter(rd => rd.status === 'active')
    .reduce((sum, rd) => sum + parseFloat(rd.current_value || '0'), 0);

  const content = {
    hi: {
      title: 'बैंकिंग डैशबोर्ड',
      overview: 'अवलोकन',
      accounts: 'खाते',
      fixedDeposits: 'सावधि जमा',
      loans: 'ऋण',
      recurringDeposits: 'आवर्ती जमा',
      investments: 'निवेश',
      totalBalance: 'कुल शेष',
      totalFDs: 'कुल FD',
      totalLoans: 'कुल ऋण',
      totalRDs: 'कुल RD',
      activeAccounts: 'सक्रिय खाते',
      activeFDs: 'सक्रिय FD',
      activeLoans: 'सक्रिय ऋण',
      activeRDs: 'सक्रिय RD',
      askAI: 'AI से पूछें',
      quickActions: 'त्वरित कार्रवाई',
      createFD: 'FD बनाएं',
      applyLoan: 'ऋण के लिए आवेदन करें',
      startRD: 'RD शुरू करें',
      getAdvice: 'सलाह लें',
      viewAll: 'सभी देखें',
    },
    en: {
      title: 'Banking Dashboard',
      overview: 'Overview',
      accounts: 'Accounts',
      fixedDeposits: 'Fixed Deposits',
      loans: 'Loans',
      recurringDeposits: 'Recurring Deposits',
      investments: 'Investments',
      totalBalance: 'Total Balance',
      totalFDs: 'Total FDs',
      totalLoans: 'Total Loans',
      totalRDs: 'Total RDs',
      activeAccounts: 'Active Accounts',
      activeFDs: 'Active FDs',
      activeLoans: 'Active Loans',
      activeRDs: 'Active RDs',
      askAI: 'Ask AI',
      quickActions: 'Quick Actions',
      createFD: 'Create FD',
      applyLoan: 'Apply for Loan',
      startRD: 'Start RD',
      getAdvice: 'Get Advice',
      viewAll: 'View All',
    },
  };

  const t = content[language as keyof typeof content] || content.en;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 md:p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Landmark className="w-8 h-8 text-blue-600" />
              {t.title}
            </h1>
          </div>
          <Button
            onClick={() => setShowAIAssistant(!showAIAssistant)}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            <Bot className="w-5 h-5 mr-2" />
            {t.askAI}
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="border-l-4 border-l-blue-500 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center justify-between">
                {t.totalBalance}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowBalance(!showBalance)}
                  className="h-6 w-6 p-0"
                >
                  {showBalance ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {showBalance ? formatCurrency(totalBalance) : '••••••'}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {accounts.length} {t.activeAccounts}
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">{t.totalFDs}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {showBalance ? formatCurrency(totalFDAmount) : '••••••'}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {fixedDeposits.filter(fd => fd.status === 'active').length} {t.activeFDs}
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">{t.totalLoans}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {showBalance ? formatCurrency(totalLoanAmount) : '••••••'}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {loans.filter(loan => loan.status === 'active' || loan.status === 'disbursed').length} {t.activeLoans}
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">{t.totalRDs}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {showBalance ? formatCurrency(totalRDAmount) : '••••••'}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {recurringDeposits.filter(rd => rd.status === 'active').length} {t.activeRDs}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mb-6 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">{t.quickActions}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col gap-2 hover:bg-green-50 hover:border-green-500"
                onClick={() => {
                  setShowAIAssistant(true);
                  // Could set a default message here
                }}
              >
                <PiggyBank className="w-6 h-6 text-green-600" />
                <span className="text-sm">{t.createFD}</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col gap-2 hover:bg-orange-50 hover:border-orange-500"
                onClick={() => setShowAIAssistant(true)}
              >
                <Landmark className="w-6 h-6 text-orange-600" />
                <span className="text-sm">{t.applyLoan}</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col gap-2 hover:bg-purple-50 hover:border-purple-500"
                onClick={() => setShowAIAssistant(true)}
              >
                <TrendingUp className="w-6 h-6 text-purple-600" />
                <span className="text-sm">{t.startRD}</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col gap-2 hover:bg-blue-50 hover:border-blue-500"
                onClick={() => setShowAIAssistant(true)}
              >
                <Bot className="w-6 h-6 text-blue-600" />
                <span className="text-sm">{t.getAdvice}</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 bg-white shadow-lg">
            <TabsTrigger value="overview" className="data-[state=active]:bg-blue-100">
              <Wallet className="w-4 h-4 mr-2" />
              {t.overview}
            </TabsTrigger>
            <TabsTrigger value="accounts" className="data-[state=active]:bg-blue-100">
              {t.accounts}
            </TabsTrigger>
            <TabsTrigger value="fds" className="data-[state=active]:bg-green-100">
              {t.fixedDeposits}
            </TabsTrigger>
            <TabsTrigger value="loans" className="data-[state=active]:bg-orange-100">
              {t.loans}
            </TabsTrigger>
            <TabsTrigger value="rds" className="data-[state=active]:bg-purple-100">
              {t.recurringDeposits}
            </TabsTrigger>
            <TabsTrigger value="investments" className="data-[state=active]:bg-pink-100">
              {t.investments}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Accounts */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{t.accounts}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setActiveTab('accounts')}
                    >
                      {t.viewAll} <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {accounts.slice(0, 3).map((account) => (
                    <AccountCard
                      key={account.id}
                      account={account}
                      language={language}
                      showBalance={showBalance}
                      compact
                    />
                  ))}
                </CardContent>
              </Card>

              {/* Recent FDs */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{t.fixedDeposits}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setActiveTab('fds')}
                    >
                      {t.viewAll} <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <FixedDepositsList
                    fixedDeposits={fixedDeposits.slice(0, 3)}
                    language={language}
                    showBalance={showBalance}
                    compact
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="accounts">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {accounts.map((account) => (
                <AccountCard
                  key={account.id}
                  account={account}
                  language={language}
                  showBalance={showBalance}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="fds">
            <FixedDepositsList
              fixedDeposits={fixedDeposits}
              language={language}
              showBalance={showBalance}
            />
          </TabsContent>

          <TabsContent value="loans">
            <LoansList
              loans={loans}
              language={language}
              showBalance={showBalance}
            />
          </TabsContent>

          <TabsContent value="rds">
            <RecurringDepositsList
              recurringDeposits={recurringDeposits}
              language={language}
              showBalance={showBalance}
            />
          </TabsContent>

          <TabsContent value="investments">
            <InvestmentsView language={language} />
          </TabsContent>
        </Tabs>
      </div>

      {/* AI Assistant Overlay */}
      {showAIAssistant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Bot className="w-6 h-6 text-blue-600" />
                {language === 'hi' ? 'बैंकिंग AI सहायक' : 'Banking AI Assistant'}
              </h2>
              <Button
                variant="ghost"
                onClick={() => setShowAIAssistant(false)}
              >
                ✕
              </Button>
            </div>
            <div className="flex-1 overflow-hidden">
              <BankingAIAssistant language={language} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
