import { Send, Download, HandCoins, TrendingUp, Target, Sparkles, Globe, ToggleRight, HelpCircle, Mic, Building2 } from 'lucide-react';

interface SmartDashboardProps {
  onSendMoney: () => void;
  onVoiceCommand: () => void;
  onInsights: () => void;
  onAdvisor: () => void;
  onTransactions: () => void;
  onFinances: () => void;
  onForms: () => void;
  onTransfer: () => void;
  onToggleView: () => void;
  onShowHelp: () => void;
  onShowLanguage: () => void;
  language: string;
  balance?: string;
  userName?: string;
}

const translations: Record<string, Record<string, string>> = {
  en: {
    dashboard: 'Dashboard',
    totalBalance: 'Total Balance',
    insights: 'Financial Insights',
    spending: 'This Month Spending',
    savings: 'Money Saved',
    targetSavings: 'Target Savings Goal',
    goal: 'Goal',
    saved: 'Saved',
    quickActions: 'Quick Actions',
    send: 'Send',
    receive: 'Receive',
    transactionHistory: 'History',
    bankTransfer: 'Transfer',
    loans: 'Loans',
    recentActivity: 'Recent Activity',
    essentials: 'Essentials (Food, Bills)',
    entertainment: 'Entertainment',
    shopping: 'Shopping',
    others: 'Others',
    viewFullInsights: 'View Full Insights',
    advisor: 'Advisor',
  },
  es: {
    dashboard: 'Panel',
    totalBalance: 'Saldo Total',
    insights: 'Información Financiera',
    spending: 'Gastos de Este Mes',
    savings: 'Dinero Ahorrado',
    targetSavings: 'Meta de Ahorro',
    goal: 'Meta',
    saved: 'Ahorrado',
    quickActions: 'Acciones Rápidas',
    send: 'Enviar',
    receive: 'Recibir',
    transactionHistory: 'Historial',
    bankTransfer: 'Transferir',
    loans: 'Préstamos',
    recentActivity: 'Actividad Reciente',
    essentials: 'Esenciales (Comida, Facturas)',
    entertainment: 'Entretenimiento',
    shopping: 'Compras',
    others: 'Otros',
    viewFullInsights: 'Ver Detalles',
    advisor: 'Asesor',
  },
  hi: {
    dashboard: 'डैशबोर्ड',
    totalBalance: 'कुल बैलेंस',
    insights: 'वित्तीय जानकारी',
    spending: 'इस महीने का खर्च',
    savings: 'बचत की गई राशि',
    targetSavings: 'बचत लक्ष्य',
    goal: 'लक्ष्य',
    saved: 'बचाया',
    quickActions: 'त्वरित कार्य',
    send: 'भेजें',
    receive: 'प्राप्त',
    transactionHistory: 'इतिहास',
    bankTransfer: 'ट्रांसफर',
    loans: 'ऋण',
    banking: 'बैंकिंग',
    recentActivity: 'हाल की गतिविधि',
    essentials: 'आवश्यक (भोजन, बिल)',
    entertainment: 'मनोरंजन',
    shopping: 'खरीदारी',
    others: 'अन्य',
    viewFullInsights: 'पूरी जानकारी देखें',
    advisor: 'सलाहकार',
  },
};

export function SmartDashboard({ 
  onSendMoney, 
  onVoiceCommand, 
  onInsights,
  onAdvisor,
  onTransactions,
  onFinances,
  onForms,
  onTransfer,
  onBanking,
  onToggleView, 
  onShowHelp, 
  onShowLanguage,
  language,
  balance = '₹ 45,230.50',
  userName = 'ADAPT User'
}: SmartDashboardProps) {
  const t = translations[language] || translations.en;
  // Kept static for now to avoid inline style use

  return (
    <div className="min-h-screen bg-linear-to-b from-sky-50 to-blue-50 p-6 relative">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
            <Sparkles className="w-6 h-6 text-teal-600" />
          </div>
          <div>
            <p className="text-gray-600 text-sm">{t.dashboard}</p>
            <p className="text-gray-900 font-medium">{userName}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onShowLanguage}
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm"
            aria-label="Change language"
          >
            <Globe className="w-5 h-5 text-gray-600" />
          </button>
          <button
            onClick={onToggleView}
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm"
            aria-label="Toggle view mode"
          >
            <ToggleRight className="w-5 h-5 text-teal-600" />
          </button>
          <button
            onClick={onShowHelp}
            className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center hover:bg-teal-400 transition-colors shadow-sm"
            aria-label="Help"
          >
            <HelpCircle className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* Balance Card */}
      <div className="bg-linear-to-br from-teal-400 to-cyan-500 rounded-3xl p-6 mb-6 shadow-lg">
        <p className="text-white opacity-90 text-sm mb-2">{t.totalBalance}</p>
        <p className="text-white text-3xl font-bold mb-4">{balance}</p>
        <div className="flex gap-3">
          <button
            onClick={onSendMoney}
            className="flex-1 bg-white text-gray-900 rounded-xl py-3 px-4 flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors shadow-sm font-medium"
          >
            <Send className="w-5 h-5" />
            <span className="text-sm">{t.send}</span>
          </button>
          <button className="flex-1 bg-white/20 text-white rounded-xl py-3 px-4 flex items-center justify-center gap-2 hover:bg-white/30 transition-colors backdrop-blur font-medium">
            <Download className="w-5 h-5" />
            <span className="text-sm">{t.receive}</span>
          </button>
        </div>
      </div>

      {/* Financial Insights Summary */}
      <div className="bg-white rounded-3xl p-6 mb-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-teal-600" />
            <p className="text-gray-900 font-semibold">{t.insights}</p>
          </div>
          <button 
            onClick={onInsights}
            className="text-teal-600 text-sm hover:text-teal-700 font-medium"
          >
            {t.viewFullInsights} →
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* Spending Summary */}
          <div className="bg-linear-to-br from-blue-50 to-indigo-50 rounded-2xl p-4">
            <p className="text-gray-600 text-xs mb-1">{t.spending}</p>
            <p className="text-gray-900 font-bold text-lg">₹ 12,769</p>
          </div>

          {/* Savings Summary */}
          <div className="bg-linear-to-br from-teal-50 to-cyan-50 rounded-2xl p-4">
            <p className="text-gray-600 text-xs mb-1">{t.savings}</p>
            <p className="text-gray-900 font-bold text-lg">₹ 8,450</p>
          </div>
        </div>

        {/* Quick Category Indicators */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <p className="text-gray-600 text-xs flex-1">{t.essentials}</p>
            <p className="text-gray-900 text-xs font-medium">51%</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            <p className="text-gray-600 text-xs flex-1">{t.entertainment}</p>
            <p className="text-gray-900 text-xs font-medium">25%</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-rose-500 rounded-full"></div>
            <p className="text-gray-600 text-xs flex-1">{t.shopping}</p>
            <p className="text-gray-900 text-xs font-medium">16%</p>
          </div>
        </div>
      </div>

      {/* Target Savings Goal */}
      <div className="bg-linear-to-br from-amber-400 to-orange-400 rounded-3xl p-6 mb-6 shadow-lg">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-6 h-6 text-white" />
          <p className="text-white font-semibold">{t.targetSavings}</p>
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-white/90 text-xs">{t.goal}</p>
              <p className="text-white font-bold text-lg">₹ 50,000</p>
            </div>
            <div className="text-right">
              <p className="text-white/90 text-xs">{t.saved}</p>
              <p className="text-white font-bold text-lg">₹ 32,500</p>
            </div>
          </div>
          
          <div className="w-full bg-white/20 rounded-full h-3">
            <div className="bg-white h-3 rounded-full transition-all duration-500 w-[65%]"></div>
          </div>
          
          <p className="text-white text-xs text-center">65% complete • ₹ 17,500 to go</p>
        </div>
      </div>

      {/* Personal Finances Button */}
      <button
        onClick={onFinances}
        className="w-full bg-white rounded-3xl p-4 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-all active:scale-95 mb-3"
      >
        <TrendingUp className="w-5 h-5 text-teal-600" />
        <span className="text-gray-900 text-sm font-medium">Personal Finances</span>
      </button>

      {/* Banking Button */}
      {onBanking && (
        <button
          onClick={onBanking}
          className="w-full bg-white rounded-3xl p-4 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-all active:scale-95 mb-3"
        >
          <Building2 className="w-5 h-5 text-blue-600" />
          <span className="text-gray-900 text-sm font-medium">{t.banking}</span>
        </button>
      )}

      {/* Forms & Schemes Button */}
      <button
        onClick={onForms}
        className="w-full bg-white rounded-3xl p-4 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-all active:scale-95 mb-3"
      >
        <Sparkles className="w-5 h-5 text-teal-600" />
        <span className="text-gray-900 text-sm font-medium">Forms & Schemes</span>
      </button>

      {/* Advisor Button */}
      <button
        onClick={onAdvisor}
        className="w-full bg-white rounded-3xl p-4 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-all active:scale-95 mb-3"
      >
        <HandCoins className="w-5 h-5 text-teal-600" />
        <span className="text-gray-900 text-sm font-medium">{t.advisor}</span>
      </button>

      {/* Bank Transfer Button */}
      <button
        onClick={onTransfer}
        className="w-full bg-white rounded-3xl p-4 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-all active:scale-95 mb-3"
      >
        <Send className="w-5 h-5 text-teal-600" />
        <span className="text-gray-900 text-sm font-medium">{t.bankTransfer}</span>
      </button>

      {/* Transactions History Button */}
      <button
        onClick={onTransactions}
        className="w-full bg-white rounded-3xl p-4 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-all active:scale-95 mb-3"
      >
        <Download className="w-5 h-5 text-teal-600" />
        <span className="text-gray-900 text-sm font-medium">{t.transactionHistory}</span>
      </button>

      {/* Voice Command Button */}
      <button
        onClick={onVoiceCommand}
        className="w-full bg-linear-to-br from-purple-400 to-pink-500 rounded-3xl p-4 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-all active:scale-95"
      >
        <Mic className="w-5 h-5 text-white" />
        <span className="text-white text-sm font-medium">Voice Command</span>
      </button>
    </div>
  );
}
