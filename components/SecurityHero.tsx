'use client';

import React, { useState, useEffect } from 'react';
import { t, securityAudioScript, type Language } from '@/lib/languages';

interface SecurityHeroProps {
  language?: Language;
}

export default function SecurityHero({ language = 'hi' }: SecurityHeroProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [autoPlayed, setAutoPlayed] = useState(false);

  const speakSecurityMessage = React.useCallback(() => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(securityAudioScript[language]);
      
      // Set language for speech
      const langCodes: Record<Language, string> = {
        hi: 'hi-IN',
        en: 'en-US',
        ta: 'ta-IN',
        te: 'te-IN',
        bn: 'bn-IN',
      };
      utterance.lang = langCodes[language];
      utterance.rate = 0.9; // Slightly slower for clarity
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);

      window.speechSynthesis.speak(utterance);
    }
  }, [language]);

  // Auto-play security message on first load
  useEffect(() => {
    if (!autoPlayed) {
      const timer = setTimeout(() => {
        speakSecurityMessage();
        setAutoPlayed(true);
      }, 1000); // Delay 1s for better UX
      
      return () => clearTimeout(timer);
    }
  }, [autoPlayed, speakSecurityMessage]);

  return (
    <>
      {/* Main Security Banner - FIRST VISIBLE ELEMENT */}
      <div className="relative bg-gradient-to-r from-green-600 via-green-500 to-emerald-500 text-white shadow-2xl rounded-2xl p-6 md:p-8 mb-8 overflow-hidden">
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-60 h-60 bg-white rounded-full translate-x-1/2 translate-y-1/2"></div>
        </div>

        <div className="relative z-10">
          {/* Main Title - Large and Bold */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-extrabold mb-2 drop-shadow-lg">
                {t('securityTitle', language)}
              </h1>
              <p className="text-lg md:text-xl font-semibold opacity-95">
                {t('securitySubtitle', language)}
              </p>
            </div>
            
            {/* Security Shield Icon */}
            <div className="ml-4 flex-shrink-0">
              <div className="w-20 h-20 md:w-24 md:h-24 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <span className="text-5xl md:text-6xl">🛡️</span>
              </div>
            </div>
          </div>

          {/* Security Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
              <p className="text-base md:text-lg font-semibold">
                {t('securityFeatures.encryption', language)}
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
              <p className="text-base md:text-lg font-semibold">
                {t('securityFeatures.fraud', language)}
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
              <p className="text-base md:text-lg font-semibold">
                {t('securityFeatures.kyc', language)}
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
              <p className="text-base md:text-lg font-semibold">
                {t('securityFeatures.help', language)}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={speakSecurityMessage}
              disabled={isPlaying}
              className="flex-1 bg-white text-green-600 hover:bg-green-50 disabled:bg-gray-200 disabled:text-gray-500 font-bold py-4 px-6 rounded-xl shadow-lg transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 text-lg"
            >
              {isPlaying ? (
                <>
                  <span className="animate-pulse text-2xl">🔊</span>
                  <span>{t('listening', language)}</span>
                </>
              ) : (
                <>
                  <span className="text-2xl">🔊</span>
                  <span>{t('listenToSafety', language)}</span>
                </>
              )}
            </button>
            
            <button
              onClick={() => setShowModal(true)}
              className="flex-1 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-bold py-4 px-6 rounded-xl border-2 border-white/40 shadow-lg transition-all transform hover:scale-105 active:scale-95 text-lg"
            >
              {t('learnMore', language)}
            </button>
          </div>
        </div>
      </div>

      {/* Security Details Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-slideUp">
            <div className="sticky top-0 bg-gradient-to-r from-green-600 to-emerald-500 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl md:text-3xl font-bold">
                  {t('securityTitle', language)}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-2xl transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Encryption */}
              <div className="bg-green-50 rounded-xl p-5 border-2 border-green-200">
                <div className="flex items-start gap-4">
                  <span className="text-4xl">🔒</span>
                  <div>
                    <h3 className="text-xl font-bold text-green-800 mb-2">
                      {language === 'hi' ? 'डेटा एन्क्रिप्शन' : 'Data Encryption'}
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      {language === 'hi' 
                        ? 'आपका सभी डेटा 256-बिट एन्क्रिप्शन से सुरक्षित है। यह बैंक जैसी सुरक्षा है। कोई भी आपका डेटा नहीं पढ़ सकता।'
                        : 'All your data is secured with 256-bit encryption. This is bank-level security. No one can read your data.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Fraud Detection */}
              <div className="bg-blue-50 rounded-xl p-5 border-2 border-blue-200">
                <div className="flex items-start gap-4">
                  <span className="text-4xl">🛡️</span>
                  <div>
                    <h3 className="text-xl font-bold text-blue-800 mb-2">
                      {language === 'hi' ? 'AI धोखाधड़ी सुरक्षा' : 'AI Fraud Protection'}
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      {language === 'hi'
                        ? 'हमारा AI हर लेनदेन की जांच करता है। संदिग्ध गतिविधि को तुरंत रोका जाता है। आपका पैसा पूरी तरह सुरक्षित है।'
                        : 'Our AI checks every transaction. Suspicious activity is blocked immediately. Your money is completely safe.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* KYC Verification */}
              <div className="bg-purple-50 rounded-xl p-5 border-2 border-purple-200">
                <div className="flex items-start gap-4">
                  <span className="text-4xl">✅</span>
                  <div>
                    <h3 className="text-xl font-bold text-purple-800 mb-2">
                      {language === 'hi' ? 'सरकारी ID सत्यापन' : 'Government ID Verification'}
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      {language === 'hi'
                        ? 'आधार, पैन कार्ड से सुरक्षित सत्यापन। OTP से पुष्टि। केवल असली लोग ही खाता बना सकते हैं।'
                        : 'Secure verification with Aadhaar, PAN Card. OTP confirmation. Only real people can create accounts.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Voice Help */}
              <div className="bg-orange-50 rounded-xl p-5 border-2 border-orange-200">
                <div className="flex items-start gap-4">
                  <span className="text-4xl">🎧</span>
                  <div>
                    <h3 className="text-xl font-bold text-orange-800 mb-2">
                      {language === 'hi' ? 'आवाज़ में मदद' : 'Voice Help'}
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      {language === 'hi'
                        ? 'हिंदी, तमिल, तेलुगु, बंगाली में आवाज़ की मदद। लिखना नहीं आता? कोई बात नहीं। बोलकर सब काम करें।'
                        : 'Voice help in Hindi, Tamil, Telugu, Bengali. Cannot write? No problem. Do everything by speaking.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setShowModal(false)}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-500 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 active:scale-95 text-lg"
              >
                {language === 'hi' ? 'समझ गया' : 'Got It'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
