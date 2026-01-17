import { Send, Download, Wallet, Building2, HandCoins, Mic, HelpCircle, Globe, ToggleLeft, Receipt } from 'lucide-react';

interface SimpleHomeScreenProps {
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
    welcome: 'Welcome',
    balance: 'Your Balance',
    send: 'Send',
    receive: 'Receive',
    checkBalance: 'Check Balance',
    quickActions: 'Quick Actions',
    transactionHistory: 'Transaction History',
    bankTransfer: 'Bank Transfer',
    loans: 'Loans',
    voiceHelp: 'Voice Help',
    tapMic: 'Tap to speak',
  },
  es: {
    welcome: 'Bienvenido',
    balance: 'Tu Saldo',
    send: 'Enviar',
    receive: 'Recibir',
    checkBalance: 'Ver Saldo',
    quickActions: 'Acciones Rápidas',
    transactionHistory: 'Historial',
    bankTransfer: 'Transferencia',
    loans: 'Préstamos',
    voiceHelp: 'Ayuda por Voz',
    tapMic: 'Toca para hablar',
  },
  hi: {
    welcome: 'स्वागत है',
    balance: 'आपका बैलेंस',
    send: 'भेजें',
    receive: 'प्राप्त करें',
    checkBalance: 'बैलेंस देखें',
    quickActions: 'त्वरित कार्य',
    transactionHistory: 'लेन-देन इतिहास',
    bankTransfer: 'बैंक ट्रांसफर',
    loans: 'ऋण',
    voiceHelp: 'आवाज़ सहायता',
    tapMic: 'बोलने के लिए टैप करें',
  },
};

export function SimpleHomeScreen({ 
  onSendMoney, 
  onVoiceCommand, 
  onInsights,
  onToggleView, 
  onShowHelp, 
  onShowLanguage,
  language 
}: SimpleHomeScreenProps) {
  const t = translations[language] || translations.en;

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-400 to-cyan-500 p-6 relative">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
            <Wallet className="w-7 h-7 text-teal-600" />
          </div>
          <div>
            <p className="text-white opacity-90 text-sm">{t.welcome}</p>
            <p className="text-white">FluidBank</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onShowLanguage}
            className="w-12 h-12 bg-teal-500 rounded-full flex items-center justify-center hover:bg-teal-400 transition-colors"
            aria-label="Change language"
          >
            <Globe className="w-6 h-6 text-white" />
          </button>
          <button
            onClick={onToggleView}
            className="w-12 h-12 bg-teal-500 rounded-full flex items-center justify-center hover:bg-teal-400 transition-colors"
            aria-label="Toggle view mode"
          >
            <ToggleLeft className="w-6 h-6 text-white" />
          </button>
          <button
            onClick={onShowHelp}
            className="w-12 h-12 bg-white rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm"
            aria-label="Help"
          >
            <HelpCircle className="w-6 h-6 text-teal-600" />
          </button>
        </div>
      </div>

      {/* Balance Card */}
      <div className="bg-white rounded-3xl p-6 mb-6 shadow-lg">
        <p className="text-gray-600 mb-2">{t.balance}</p>
        <p className="text-teal-900 mb-4">₹ 45,230.50</p>
        <div className="flex items-center gap-2 bg-teal-50 text-teal-700 px-4 py-2 rounded-full inline-flex">
          <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
          <span className="text-sm">Account Active</span>
        </div>
      </div>

      {/* Main Action Buttons */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <button
          onClick={onSendMoney}
          className="bg-white rounded-2xl p-6 flex flex-col items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-all active:scale-95"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-rose-400 to-pink-500 rounded-full flex items-center justify-center">
            <Send className="w-8 h-8 text-white" />
          </div>
          <span className="text-gray-900">{t.send}</span>
        </button>

        <button
          className="bg-white rounded-2xl p-6 flex flex-col items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-all active:scale-95"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-full flex items-center justify-center">
            <Download className="w-8 h-8 text-white" />
          </div>
          <span className="text-gray-900">{t.receive}</span>
        </button>

        <button
          onClick={onInsights}
          className="bg-white rounded-2xl p-6 flex flex-col items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-all active:scale-95"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center">
            <Wallet className="w-8 h-8 text-white" />
          </div>
          <span className="text-gray-900 text-center text-sm">{t.checkBalance}</span>
        </button>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-3xl p-6 mb-6 shadow-lg">
        <p className="text-gray-900 mb-4">{t.quickActions}</p>
        <div className="grid grid-cols-2 gap-4">
          <button className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 flex items-center gap-3 hover:shadow-md transition-all">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center flex-shrink-0">
              <Receipt className="w-6 h-6 text-white" />
            </div>
            <span className="text-gray-900 text-left text-sm">{t.transactionHistory}</span>
          </button>

          <button className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4 flex items-center gap-3 hover:shadow-md transition-all">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <span className="text-gray-900 text-left text-sm">{t.bankTransfer}</span>
          </button>

          <button className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-4 flex items-center gap-3 hover:shadow-md transition-all">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
              <HandCoins className="w-6 h-6 text-white" />
            </div>
            <span className="text-gray-900 text-left text-sm">{t.loans}</span>
          </button>

          <button className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl p-4 flex items-center gap-3 hover:shadow-md transition-all">
            <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-full flex items-center justify-center flex-shrink-0">
              <Download className="w-6 h-6 text-white" />
            </div>
            <span className="text-gray-900 text-left text-sm">{t.receive}</span>
          </button>
        </div>
      </div>

      {/* Voice Help Button */}
      <button
        onClick={onVoiceCommand}
        className="w-full bg-white rounded-2xl p-6 flex items-center justify-center gap-4 shadow-lg hover:shadow-xl transition-all active:scale-95"
      >
        <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center animate-pulse">
          <Mic className="w-8 h-8 text-white" />
        </div>
        <div className="text-left">
          <p className="text-gray-900">{t.voiceHelp}</p>
          <p className="text-gray-600 text-sm">{t.tapMic}</p>
        </div>
      </button>
    </div>
  );
}
