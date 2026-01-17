import { Send, Download, Wallet, Building2, HandCoins, TrendingUp, Target, Sparkles, Globe, ToggleRight, HelpCircle, Mic, Receipt } from 'lucide-react';

interface SmartDashboardProps {
  onSendMoney: () => void;
  onVoiceCommand: () => void;
  onInsights: () => void;
  onToggleView: () => void;
  onShowHelp: () => void;
  onShowLanguage: () => void;
  language: string;
}

const translations: Record<string, any> = {
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
    recentActivity: 'हाल की गतिविधि',
    essentials: 'आवश्यक (भोजन, बिल)',
    entertainment: 'मनोरंजन',
    shopping: 'खरीदारी',
    others: 'अन्य',
    viewFullInsights: 'पूरी जानकारी देखें',
  },
};

export function SmartDashboard({ 
  onSendMoney, 
  onVoiceCommand, 
  onInsights,
  onToggleView, 
  onShowHelp, 
  onShowLanguage,
  language 
}: SmartDashboardProps) {
  const t = translations[language] || translations.en;
  const savingsProgress = (32500 / 50000) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-blue-50 p-6 relative">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
            <Sparkles className="w-6 h-6 text-teal-600" />
          </div>
          <div>
            <p className="text-gray-600 text-sm">{t.dashboard}</p>
            <p className="text-gray-900">FluidBank</p>
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
      <div className="bg-gradient-to-br from-teal-400 to-cyan-500 rounded-3xl p-6 mb-6 shadow-lg">
        <p className="text-white opacity-90 text-sm mb-2">{t.totalBalance}</p>
        <p className="text-white mb-4">₹ 45,230.50</p>
        <div className="flex gap-3">
          <button
            onClick={onSendMoney}
            className="flex-1 bg-white text-gray-900 rounded-xl py-3 px-4 flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors shadow-sm"
          >
            <Send className="w-5 h-5" />
            <span className="text-sm">{t.send}</span>
          </button>
          <button className="flex-1 bg-white/20 text-white rounded-xl py-3 px-4 flex items-center justify-center gap-2 hover:bg-white/30 transition-colors backdrop-blur">
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
            <p className="text-gray-900">{t.insights}</p>
          </div>
          <button 
            onClick={onInsights}
            className="text-teal-600 text-sm hover:text-teal-700"
          >
            {t.viewFullInsights} →
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* Spending Summary */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4">
            <p className="text-gray-600 text-xs mb-1">{t.spending}</p>
            <p className="text-gray-900">₹ 12,769</p>
          </div>

          {/* Savings Summary */}
          <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl p-4">
            <p className="text-gray-600 text-xs mb-1">{t.savings}</p>
            <p className="text-gray-900">₹ 8,450</p>
          </div>
        </div>

        {/* Quick Category Indicators */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <p className="text-gray-600 text-xs flex-1">{t.essentials}</p>
            <p className="text-gray-900 text-xs">51%</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            <p className="text-gray-600 text-xs flex-1">{t.entertainment}</p>
            <p className="text-gray-900 text-xs">25%</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-rose-500 rounded-full"></div>
            <p className="text-gray-600 text-xs flex-1">{t.shopping}</p>
            <p className="text-gray-900 text-xs">16%</p>
          </div>
        </div>
      </div>

      {/* Target Savings Goal */}
      <div className="bg-gradient-to-br from-amber-400 to-orange-400 rounded-3xl p-6 mb-6 shadow-lg">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-6 h-6 text-white" />
          <p className="text-white">{t.targetSavings}</p>
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-white/90 text-xs">{t.goal}</p>
              <p className="text-white">₹ 50,000</p>
            </div>
            <div className="text-right">
              <p className="text-white/90 text-xs">{t.saved}</p>
              <p className="text-white">₹ 32,500</p>
            </div>
          </div>
          
          <div className="w-full bg-white/20 rounded-full h-3">
            <div 
              className="bg-white h-3 rounded-full transition-all duration-500"
              style={{ width: `${savingsProgress}%` }}
            ></div>
          </div>
          
          <p className="text-white text-xs text-center">65% complete • ₹ 17,500 to go</p>
        </div>
      </div>

      {/* Voice Command Button */}
      <button
        onClick={onVoiceCommand}
        className="w-full bg-gradient-to-br from-purple-400 to-pink-500 rounded-3xl p-4 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-all active:scale-95"
      >
        <Mic className="w-5 h-5 text-white" />
        <span className="text-white text-sm">Voice Command</span>
      </button>
    </div>
  );
}
