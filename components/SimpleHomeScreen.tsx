import { Send, Download, Wallet, Building2, HandCoins, Mic, HelpCircle, Globe, ToggleLeft, Receipt, Landmark, Bell, Eye, EyeOff, User, ArrowRight, Star, Camera, Phone } from 'lucide-react';
import { useState } from 'react';

interface SimpleHomeScreenProps {
  onSendMoney: () => void;
  onVoiceCommand: () => void;
  onInsights: () => void;
  onAdvisor: () => void;
  onFinances: () => void;
  onForms: () => void;
  onTransactions: () => void;
  onTransfer: () => void;
  onBanking?: () => void;
  onToggleView: () => void;
  onShowHelp: () => void;
  onShowLanguage: () => void;
  language: string;
  balance?: string;
  userName?: string;
}

const translations: Record<string, Record<string, string>> = {
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
    tapMic: 'Tap to speak - We will help you',
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
    banking: 'बैंकिंग',
    voiceHelp: 'आवाज़ सहायता',
    tapMic: 'बोलने के लिए टैप करें - हम मदद करेंगे',
  },
  ta: {
    welcome: 'வரவேற்கிறோம்',
    balance: 'உங்கள் இருப்பு',
    send: 'அனுப்பு',
    receive: 'பெறு',
    checkBalance: 'இருப்பை பார்க்க',
    quickActions: 'விரைவு செயல்கள்',
    transactionHistory: 'பரிவர்த்தனை வரலாறு',
    bankTransfer: 'வங்கி பரிமாற்றம்',
    loans: 'கடன்கள்',
    voiceHelp: 'குரல் உதவி',
    tapMic: 'பேச தட்டவும்',
  },
  te: {
    welcome: 'స్వాగతం',
    balance: 'మీ బ్యాలెన్స్',
    send: 'పంపు',
    receive: 'స్వీకరించు',
    checkBalance: 'బ్యాలెన్స్ చూడండి',
    quickActions: 'త్వరిత చర్యలు',
    transactionHistory: 'లావాదేవీ చరిత్ర',
    bankTransfer: 'బ్యాంక్ బదిలీ',
    loans: 'రుణాలు',
    voiceHelp: 'వాయిస్ సహాయం',
    tapMic: 'మాట్లాడటానికి నొక్కండి',
  },
  bn: {
    welcome: 'স্বাগতম',
    balance: 'আপনার ব্যালেন্স',
    send: 'পাঠান',
    receive: 'গ্রহণ করুন',
    checkBalance: 'ব্যালেন্স দেখুন',
    quickActions: 'দ্রুত কাজ',
    transactionHistory: 'লেনদেনের ইতিহাস',
    bankTransfer: 'ব্যাংক স্থানান্তর',
    loans: 'ঋণ',
    voiceHelp: 'ভয়েস সাহায্য',
    tapMic: 'কথা বলতে ট্যাপ করুন',
  },
};

export function SimpleHomeScreen({ 
  onSendMoney, 
  onVoiceCommand, 
  onInsights,
  onAdvisor,
  onFinances,
  onForms,
  onTransactions,
  onTransfer,
  onBanking,
  onToggleView, 
  onShowHelp, 
  onShowLanguage,
  language,
  balance = '₹ 45,230.50',
  userName = 'ADAPT User'
}: SimpleHomeScreenProps) {
  const t = translations[language] || translations.en;
  const [showBalance, setShowBalance] = useState(true);

  const recentTransactions = [
    { name: 'Electricity Bill', amount: '-₹1,250', icon: '⚡', color: 'bg-yellow-500' },
    { name: 'Salary Received', amount: '+₹25,000', icon: '💰', color: 'bg-green-500' },
    { name: 'Mobile Recharge', amount: '-₹399', icon: '📱', color: 'bg-blue-500' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white p-4 shadow-lg sticky top-0 z-40">
        <div className="flex justify-between items-center max-w-6xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="bg-white p-2 rounded-xl shadow-md">
              <Wallet className="w-6 h-6 text-teal-600" />
            </div>
            <div>
              <div className="text-xs opacity-90">{t.welcome}</div>
              <div className="font-semibold text-lg">{userName}</div>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={onShowLanguage}
              className="bg-white/20 hover:bg-white/30 p-2.5 rounded-xl transition-all"
            >
              <Globe className="w-5 h-5" />
            </button>
            <button className="bg-white/20 hover:bg-white/30 p-2.5 rounded-xl transition-all relative">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">1</span>
            </button>
            <button 
              onClick={onShowHelp}
              className="bg-white/20 hover:bg-white/30 p-2.5 rounded-xl transition-all"
            >
              <HelpCircle className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 space-y-4">
        {/* Balance Card */}
        <div className="bg-gradient-to-br from-teal-600 to-cyan-700 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16"></div>
          
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="text-sm opacity-90 mb-1">{t.balance}</div>
                <div className="text-4xl font-bold tracking-tight">
                  {showBalance ? balance : '₹ ••••••'}
                </div>
              </div>
              <button 
                onClick={() => setShowBalance(!showBalance)}
                className="bg-white/20 hover:bg-white/30 p-3 rounded-xl backdrop-blur-sm transition-all"
              >
                {showBalance ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex gap-2 text-xs opacity-75">
                <User className="w-4 h-4" />
                <span>Account No: XXXX 5678</span>
              </div>
              <div className="bg-green-400/30 px-3 py-1.5 rounded-full backdrop-blur-sm border border-green-400/50">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-xs font-medium">Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Action Buttons */}
        <div className="grid grid-cols-3 gap-3">
          <button 
            onClick={onSendMoney}
            className="bg-gradient-to-br from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all transform hover:scale-105 active:scale-95"
          >
            <div className="bg-white/20 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-2 backdrop-blur-sm">
              <Send className="w-7 h-7" />
            </div>
            <div className="text-2xl mb-1">📤</div>
            <div className="font-semibold text-base">{t.send}</div>
            <div className="text-xs opacity-90">Money</div>
          </button>

          <button className="bg-gradient-to-br from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all transform hover:scale-105 active:scale-95">
            <div className="bg-white/20 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-2 backdrop-blur-sm">
              <Download className="w-7 h-7" />
            </div>
            <div className="text-2xl mb-1">📥</div>
            <div className="font-semibold text-base">{t.receive}</div>
            <div className="text-xs opacity-90">Money</div>
          </button>

          <button 
            onClick={onInsights}
            className="bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all transform hover:scale-105 active:scale-95"
          >
            <div className="bg-white/20 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-2 backdrop-blur-sm">
              <Wallet className="w-7 h-7" />
            </div>
            <div className="text-2xl mb-1">👛</div>
            <div className="font-semibold text-base">Check</div>
            <div className="text-xs opacity-90">Balance</div>
          </button>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-3xl p-5 shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <div className="w-1 h-6 bg-teal-500 rounded-full"></div>
              Recent Activity
            </h2>
            <button 
              onClick={onTransactions}
              className="text-teal-600 text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-all"
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-2">
            {recentTransactions.map((transaction, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 ${transaction.color} rounded-xl flex items-center justify-center text-xl`}>
                    {transaction.icon}
                  </div>
                  <div className="text-sm font-medium text-gray-700">{transaction.name}</div>
                </div>
                <div className={`font-bold ${transaction.amount.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                  {transaction.amount}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-3xl p-5 shadow-lg">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <div className="w-1 h-6 bg-teal-500 rounded-full"></div>
            {t.quickActions}
          </h2>
          
          <div className="grid grid-cols-2 gap-3">
            <button onClick={onTransactions} className="bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-2xl p-4 transition-all text-left group">
              <div className="flex items-center gap-3">
                <div className="bg-blue-500 w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform text-xl">
                  📝
                </div>
                <div>
                  <div className="font-semibold text-gray-800">Transaction</div>
                  <div className="text-xs text-gray-600">History</div>
                </div>
              </div>
            </button>

            <button onClick={onTransfer} className="bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 rounded-2xl p-4 transition-all text-left group">
              <div className="flex items-center gap-3">
                <div className="bg-purple-500 w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform text-xl">
                  🏦
                </div>
                <div>
                  <div className="font-semibold text-gray-800">Bank</div>
                  <div className="text-xs text-gray-600">Transfer</div>
                </div>
              </div>
            </button>

            <button onClick={onFinances} className="bg-gradient-to-br from-teal-50 to-teal-100 hover:from-teal-100 hover:to-teal-200 rounded-2xl p-4 transition-all text-left group">
              <div className="flex items-center gap-3">
                <div className="bg-teal-500 w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform text-xl">
                  💼
                </div>
                <div>
                  <div className="font-semibold text-gray-800">Personal</div>
                  <div className="text-xs text-gray-600">Finances</div>
                </div>
              </div>
            </button>

            <button onClick={onAdvisor} className="bg-gradient-to-br from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 rounded-2xl p-4 transition-all text-left group">
              <div className="flex items-center gap-3">
                <div className="bg-orange-500 w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform text-xl">
                  💡
                </div>
                <div>
                  <div className="font-semibold text-gray-800">Financial</div>
                  <div className="text-xs text-gray-600">Advisor</div>
                </div>
              </div>
            </button>

            <button onClick={onForms} className="bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 rounded-2xl p-4 transition-all text-left group">
              <div className="flex items-center gap-3">
                <div className="bg-green-500 w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform text-xl">
                  📄
                </div>
                <div>
                  <div className="font-semibold text-gray-800">Forms &</div>
                  <div className="text-xs text-gray-600">Schemes</div>
                </div>
              </div>
            </button>

            {onBanking && (
              <button onClick={onBanking} className="bg-gradient-to-br from-amber-50 to-amber-100 hover:from-amber-100 hover:to-amber-200 rounded-2xl p-4 transition-all text-left group">
                <div className="flex items-center gap-3">
                  <div className="bg-amber-500 w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform text-xl">
                    🏛️
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800">Banking</div>
                    <div className="text-xs text-gray-600">Services</div>
                  </div>
                </div>
              </button>
            )}
          </div>
        </div>

        {/* Financial Tip */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-100 rounded-3xl p-5 shadow-lg border-2 border-amber-200">
          <div className="flex items-center gap-2 mb-3">
            <Star className="w-6 h-6 text-amber-600" />
            <h2 className="text-lg font-bold text-amber-900">Financial Tip</h2>
          </div>
          <div className="bg-white/50 rounded-xl p-4 backdrop-blur-sm">
            <p className="text-sm text-gray-700 leading-relaxed">
              💡 Save 20% of your income every month for a secure future
            </p>
          </div>
        </div>

        {/* Scan & Pay */}
        <button className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-2xl p-5 shadow-xl hover:shadow-2xl transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 w-14 h-14 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Camera className="w-7 h-7" />
              </div>
              <div className="text-left">
                <div className="font-bold text-lg">Scan & Pay</div>
                <div className="text-sm opacity-90">QR Code</div>
              </div>
            </div>
            <div className="text-3xl">📷</div>
          </div>
        </button>

        {/* Voice Help */}
        <button 
          onClick={onVoiceCommand}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all group"
        >
          <div className="flex items-center justify-center gap-4">
            <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform">
              <Mic className="w-8 h-8 animate-pulse" />
            </div>
            <div className="text-left">
              <div className="font-bold text-xl">{t.voiceHelp}</div>
              <div className="text-sm opacity-90">{t.tapMic}</div>
            </div>
          </div>
        </button>

        {/* Emergency Help */}
        <div className="bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl p-5 shadow-xl text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 w-14 h-14 rounded-full flex items-center justify-center backdrop-blur-sm animate-pulse">
                <Phone className="w-7 h-7" />
              </div>
              <div>
                <div className="font-bold text-lg">Need Help?</div>
                <div className="text-sm opacity-90">24/7: 1800-XXX-XXXX</div>
              </div>
            </div>
            <button className="bg-white text-red-600 hover:bg-red-50 px-6 py-3 rounded-xl font-bold transition-all shadow-lg">
              Call Now
            </button>
          </div>
        </div>

        {/* Security Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-4 text-white shadow-lg">
          <div className="flex items-center justify-center gap-3">
            <span className="text-sm font-medium">🔒 Your data is 100% secure and encrypted</span>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl z-40">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="grid grid-cols-4 gap-2">
            <button className="flex flex-col items-center gap-1 p-2 text-teal-600 bg-teal-50 rounded-xl">
              <Wallet className="w-6 h-6" />
              <span className="text-xs font-medium">Home</span>
            </button>
            <button 
              onClick={onInsights}
              className="flex flex-col items-center gap-1 p-2 text-gray-600 hover:bg-gray-50 rounded-xl transition-all"
            >
              <Receipt className="w-6 h-6" />
              <span className="text-xs font-medium">Stats</span>
            </button>
            <button 
              onClick={onVoiceCommand}
              className="flex flex-col items-center gap-1 p-2 text-gray-600 hover:bg-gray-50 rounded-xl transition-all"
            >
              <Mic className="w-6 h-6" />
              <span className="text-xs font-medium">Voice</span>
            </button>
            <button 
              onClick={onToggleView}
              className="flex flex-col items-center gap-1 p-2 text-gray-600 hover:bg-gray-50 rounded-xl transition-all"
            >
              <User className="w-6 h-6" />
              <span className="text-xs font-medium">Profile</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
