import { X, Check, Globe } from 'lucide-react';

interface LanguageSelectorProps {
  currentLanguage: string;
  onLanguageSelect: (lang: string) => void;
  onClose: () => void;
}

const languages = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
];

export function LanguageSelector({ currentLanguage, onLanguageSelect, onClose }: LanguageSelectorProps) {
  return (
    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
              <Globe className="w-6 h-6 text-teal-600" />
            </div>
            <p className="text-gray-900">Select Language</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
            aria-label="Close"
          >
            <X className="w-6 h-6 text-gray-700" />
          </button>
        </div>

        <p className="text-gray-600 text-sm mb-6">Choose your preferred language for the app</p>

        {/* Language Options */}
        <div className="space-y-3">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => onLanguageSelect(lang.code)}
              className={`w-full rounded-2xl p-4 flex items-center justify-between transition-all hover:shadow-md ${
                currentLanguage === lang.code
                  ? 'bg-gradient-to-r from-teal-400 to-cyan-500 text-white'
                  : 'bg-gray-50 hover:bg-gray-100 text-gray-900'
              }`}
            >
              <div className="text-left">
                <p className={`${currentLanguage === lang.code ? 'text-white' : 'text-gray-900'}`}>
                  {lang.nativeName}
                </p>
                <p className={`text-sm ${currentLanguage === lang.code ? 'text-white/80' : 'text-gray-600'}`}>
                  {lang.name}
                </p>
              </div>
              {currentLanguage === lang.code && (
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                  <Check className="w-5 h-5 text-teal-600" />
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Info */}
        <div className="mt-6 bg-blue-50 rounded-2xl p-4 border border-blue-200">
          <p className="text-blue-900 text-xs text-center">
            Voice commands and audio guides are available in all selected languages
          </p>
        </div>
      </div>
    </div>
  );
}
