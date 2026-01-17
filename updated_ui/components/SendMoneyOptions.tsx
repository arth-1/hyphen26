import { QrCode, Phone, X, Scan } from 'lucide-react';

interface SendMoneyOptionsProps {
  onBack: () => void;
  language: string;
}

const translations: Record<string, any> = {
  en: {
    sendMoney: 'Send Money',
    chooseMethod: 'Choose a method to send',
    scanQR: 'Scan QR Code',
    scanDesc: 'Scan recipient QR code',
    phoneNumber: 'Phone Number',
    phoneDesc: 'Send using mobile number',
  },
  es: {
    sendMoney: 'Enviar Dinero',
    chooseMethod: 'Elige un método para enviar',
    scanQR: 'Escanear Código QR',
    scanDesc: 'Escanea el código QR del destinatario',
    phoneNumber: 'Número de Teléfono',
    phoneDesc: 'Enviar usando número móvil',
  },
  hi: {
    sendMoney: 'पैसे भेजें',
    chooseMethod: 'भेजने का तरीका चुनें',
    scanQR: 'QR कोड स्कैन करें',
    scanDesc: 'प्राप्तकर्ता का QR कोड स्कैन करें',
    phoneNumber: 'फोन नंबर',
    phoneDesc: 'मोबाइल नंबर से भेजें',
  },
};

export function SendMoneyOptions({ onBack, language }: SendMoneyOptionsProps) {
  const t = translations[language] || translations.en;

  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-400 to-blue-500 p-6 relative">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <p className="text-white">{t.sendMoney}</p>
        <button
          onClick={onBack}
          className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm"
          aria-label="Close"
        >
          <X className="w-6 h-6 text-gray-600" />
        </button>
      </div>

      <p className="text-white/90 mb-8 text-center">{t.chooseMethod}</p>

      {/* Options */}
      <div className="space-y-6">
        {/* QR Code Option */}
        <button className="w-full bg-white rounded-3xl p-8 flex flex-col items-center gap-4 shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center">
            <QrCode className="w-12 h-12 text-white" />
          </div>
          <div className="text-center">
            <p className="text-gray-900 mb-2">{t.scanQR}</p>
            <p className="text-gray-600 text-sm">{t.scanDesc}</p>
          </div>
          <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full">
            <Scan className="w-4 h-4 text-blue-600" />
            <span className="text-blue-600 text-sm">Quick & Secure</span>
          </div>
        </button>

        {/* Phone Number Option */}
        <button className="w-full bg-white rounded-3xl p-8 flex flex-col items-center gap-4 shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95">
          <div className="w-24 h-24 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-full flex items-center justify-center">
            <Phone className="w-12 h-12 text-white" />
          </div>
          <div className="text-center">
            <p className="text-gray-900 mb-2">{t.phoneNumber}</p>
            <p className="text-gray-600 text-sm">{t.phoneDesc}</p>
          </div>
          <div className="flex items-center gap-2 bg-teal-50 px-4 py-2 rounded-full">
            <Phone className="w-4 h-4 text-teal-600" />
            <span className="text-teal-600 text-sm">Easy & Fast</span>
          </div>
        </button>
      </div>

      {/* Visual Indicator */}
      <div className="mt-12 flex flex-col items-center gap-3">
        <div className="flex gap-2">
          <div className="w-2 h-2 bg-white rounded-full"></div>
          <div className="w-2 h-2 bg-white/50 rounded-full"></div>
          <div className="w-2 h-2 bg-white/50 rounded-full"></div>
        </div>
        <p className="text-white/75 text-xs">Swipe for more options</p>
      </div>
    </div>
  );
}
