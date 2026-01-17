import { X, TrendingUp, Target, ShoppingBag, Utensils, Zap, Sparkles } from 'lucide-react';

interface InsightsScreenProps {
  onBack: () => void;
  language: string;
}

const translations: Record<string, Record<string, string>> = {
  en: {
    insights: 'Financial Insights',
    spending: 'This Month Spending',
    savings: 'Money Saved',
    targetSavings: 'Target Savings Goal',
    goal: 'Goal',
    saved: 'Saved',
    essentials: 'Essentials (Food, Bills)',
    entertainment: 'Entertainment',
    shopping: 'Shopping',
    others: 'Others',
    total: 'Total',
    toGo: 'to go',
    monthlyProgress: 'Monthly Progress',
    keepGoing: 'Keep up the good work!',
  },
  es: {
    insights: 'Información Financiera',
    spending: 'Gastos de Este Mes',
    savings: 'Dinero Ahorrado',
    targetSavings: 'Meta de Ahorro',
    goal: 'Meta',
    saved: 'Ahorrado',
    essentials: 'Esenciales (Comida, Facturas)',
    entertainment: 'Entretenimiento',
    shopping: 'Compras',
    others: 'Otros',
    total: 'Total',
    toGo: 'restante',
    monthlyProgress: 'Progreso Mensual',
    keepGoing: '¡Sigue así!',
  },
  hi: {
    insights: 'वित्तीय जानकारी',
    spending: 'इस महीने का खर्च',
    savings: 'बचत की गई राशि',
    targetSavings: 'बचत लक्ष्य',
    goal: 'लक्ष्य',
    saved: 'बचाया',
    essentials: 'आवश्यक (भोजन, बिल)',
    entertainment: 'मनोरंजन',
    shopping: 'खरीदारी',
    others: 'अन्य',
    total: 'कुल',
    toGo: 'बाकी',
    monthlyProgress: 'मासिक प्रगति',
    keepGoing: 'बढ़िया काम जारी रखें!',
  },
};

export function InsightsScreen({ onBack, language }: InsightsScreenProps) {
  const t = translations[language] || translations.en;
  const savingsProgress = (32500 / 50000) * 100;

  return (
    <div className="min-h-screen bg-linear-to-b from-teal-50 to-blue-50 p-6 relative">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-teal-400 rounded-full flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <p className="text-teal-900 text-xl font-semibold">{t.insights}</p>
        </div>
        <button
          onClick={onBack}
          className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm"
          aria-label="Close"
        >
          <X className="w-6 h-6 text-gray-600" />
        </button>
      </div>

      {/* Monthly Savings Card */}
      <div className="bg-linear-to-br from-teal-400 to-cyan-500 rounded-3xl p-6 mb-6 shadow-lg">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-10 h-10 bg-white/30 backdrop-blur rounded-full flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <p className="text-white font-semibold">{t.savings}</p>
        </div>
        <p className="text-white text-3xl font-bold mb-2">₹ 8,450</p>
        <div className="flex items-center gap-2 bg-white/20 backdrop-blur px-4 py-2 rounded-full inline-flex">
          <div className="w-2 h-2 bg-white rounded-full"></div>
          <span className="text-white text-sm font-medium">↑ 12% from last month</span>
        </div>
      </div>

      {/* Spending Breakdown */}
      <div className="bg-white rounded-3xl p-6 mb-6 shadow-lg">
        <div className="flex items-center gap-2 mb-4">
          <ShoppingBag className="w-5 h-5 text-teal-600" />
          <p className="text-gray-900 font-semibold">{t.spending}</p>
        </div>
        
        <div className="mb-4">
          <p className="text-teal-600 text-sm">{t.total}</p>
          <p className="text-gray-900 text-2xl font-bold">₹ 12,769.50</p>
        </div>

        <div className="space-y-4">
          {/* Essentials */}
          <div className="bg-linear-to-r from-blue-50 to-blue-100 rounded-2xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center shrink-0">
                <Utensils className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-gray-900 text-sm mb-1 font-medium">{t.essentials}</p>
                <div className="flex justify-between items-center">
                  <div className="flex-1 bg-blue-200 rounded-full h-2 mr-3">
                    <div className="bg-blue-500 h-2 rounded-full w-[51%]"></div>
                  </div>
                  <p className="text-gray-900 text-sm font-semibold">₹ 6,500</p>
                </div>
              </div>
            </div>
            <p className="text-gray-600 text-xs ml-13">51% of total spending</p>
          </div>

          {/* Entertainment */}
          <div className="bg-linear-to-r from-purple-50 to-purple-100 rounded-2xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-gray-900 text-sm mb-1 font-medium">{t.entertainment}</p>
                <div className="flex justify-between items-center">
                  <div className="flex-1 bg-purple-200 rounded-full h-2 mr-3">
                    <div className="bg-purple-500 h-2 rounded-full w-[25%]"></div>
                  </div>
                  <p className="text-gray-900 text-sm font-semibold">₹ 3,200</p>
                </div>
              </div>
            </div>
            <p className="text-gray-600 text-xs ml-13">25% of total spending</p>
          </div>

          {/* Shopping */}
          <div className="bg-linear-to-r from-rose-50 to-rose-100 rounded-2xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-rose-500 rounded-full flex items-center justify-center shrink-0">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-gray-900 text-sm mb-1 font-medium">{t.shopping}</p>
                <div className="flex justify-between items-center">
                  <div className="flex-1 bg-rose-200 rounded-full h-2 mr-3">
                    <div className="bg-rose-500 h-2 rounded-full w-[16%]"></div>
                  </div>
                  <p className="text-gray-900 text-sm font-semibold">₹ 2,069.50</p>
                </div>
              </div>
            </div>
            <p className="text-gray-600 text-xs ml-13">16% of total spending</p>
          </div>

          {/* Others */}
          <div className="bg-linear-to-r from-teal-50 to-teal-100 rounded-2xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center shrink-0">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-gray-900 text-sm mb-1 font-medium">{t.others}</p>
                <div className="flex justify-between items-center">
                  <div className="flex-1 bg-teal-200 rounded-full h-2 mr-3">
                    <div className="bg-teal-500 h-2 rounded-full w-[8%]"></div>
                  </div>
                  <p className="text-gray-900 text-sm font-semibold">₹ 1,000</p>
                </div>
              </div>
            </div>
            <p className="text-gray-600 text-xs ml-13">8% of total spending</p>
          </div>
        </div>
      </div>

      {/* Target Savings Goal */}
      <div className="bg-linear-to-br from-amber-400 to-orange-400 rounded-3xl p-6 shadow-lg">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-10 h-10 bg-white/30 backdrop-blur rounded-full flex items-center justify-center">
            <Target className="w-5 h-5 text-white" />
          </div>
          <p className="text-white font-semibold">{t.targetSavings}</p>
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-white/90 text-sm">{t.goal}</p>
              <p className="text-white text-lg font-bold">₹ 50,000</p>
            </div>
            <div className="text-right">
              <p className="text-white/90 text-sm">{t.saved}</p>
              <p className="text-white text-lg font-bold">₹ 32,500</p>
            </div>
          </div>
          
          <div className="bg-white/20 backdrop-blur rounded-full p-1">
            <div className="w-full bg-white/30 rounded-full h-4">
              <div 
                className="bg-white h-4 rounded-full transition-all duration-500 flex items-center justify-end pr-2 w-[65%]"
              >
                <span className="text-amber-600 text-xs font-semibold">65%</span>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <p className="text-white text-sm font-medium">{t.keepGoing}</p>
            <p className="text-white text-sm font-medium">₹ 17,500 {t.toGo}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
