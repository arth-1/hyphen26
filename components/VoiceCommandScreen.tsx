import { useRef, useState } from 'react';
import { Mic, X, Volume2, CheckCircle, AlertCircle } from 'lucide-react';

interface VoiceCommandScreenProps {
  onBack: () => void;
  language: string;
}

const translations: Record<string, Record<string, string>> = {
  en: {
    voicePayment: 'Voice Payment',
    listening: 'Listening...',
    tapToSpeak: 'Tap microphone to speak',
    processing: 'Processing your command...',
    recognized: 'Command recognized',
    examples: 'Try saying:',
    example1: '"Send 500 rupees to Priya"',
    example2: '"Check my balance"',
    example3: '"Pay electricity bill"',
    speakClearly: 'Speak clearly and naturally',
  },
  es: {
    voicePayment: 'Pago por Voz',
    listening: 'Escuchando...',
    tapToSpeak: 'Toca el micrófono para hablar',
    processing: 'Procesando tu comando...',
    recognized: 'Comando reconocido',
    examples: 'Intenta decir:',
    example1: '"Enviar 500 rupias a Priya"',
    example2: '"Verificar mi saldo"',
    example3: '"Pagar factura de electricidad"',
    speakClearly: 'Habla clara y naturalmente',
  },
  hi: {
    voicePayment: 'आवाज़ से भुगतान',
    listening: 'सुन रहे हैं...',
    tapToSpeak: 'बोलने के लिए माइक टैप करें',
    processing: 'आपके आदेश पर काम हो रहा है...',
    recognized: 'आदेश समझ आया',
    examples: 'यह कहें:',
    example1: '"प्रिया को 500 रुपये भेजें"',
    example2: '"मेरा बैलेंस देखें"',
    example3: '"बिजली का बिल दें"',
    speakClearly: 'साफ और स्वाभाविक रूप से बोलें',
  },
};

export function VoiceCommandScreen({ onBack, language }: VoiceCommandScreenProps) {
  // Minimal SpeechRecognition typings
  interface ISpeechRecognitionResult { 0: { transcript: string }; length: number; isFinal?: boolean }
  interface ISpeechRecognitionResultList { length: number; [i: number]: ISpeechRecognitionResult }
  interface ISpeechRecognitionEvent extends Event { resultIndex: number; results: ISpeechRecognitionResultList }
  interface ISpeechRecognition extends EventTarget {
    lang: string; interimResults: boolean; continuous: boolean;
    onresult: (e: ISpeechRecognitionEvent) => void; onend: () => void; onerror: (e: unknown) => void;
    start(): void; stop(): void;
  }
  type ISpeechRecognitionConstructor = new () => ISpeechRecognition;

  const [isListening, setIsListening] = useState(false);
  const [command, setCommand] = useState('');
  const [status, setStatus] = useState<'idle' | 'listening' | 'processing' | 'recognized' | 'unsupported'>('idle');
  const recognitionRef = useRef<ISpeechRecognition | null>(null);
  const t = translations[language] || translations.en;

  function getLocaleFromLanguage(code: string) {
    const map: Record<string, string> = { hi: 'hi-IN', en: 'en-IN', es: 'es-ES' };
    return map[code] || 'en-IN';
  }

  const startListening = () => {
    if (typeof window === 'undefined') return;
    const w = window as unknown as {
      SpeechRecognition?: ISpeechRecognitionConstructor;
      webkitSpeechRecognition?: ISpeechRecognitionConstructor;
    };
    const SR: ISpeechRecognitionConstructor | undefined = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) {
      setStatus('unsupported');
      return;
    }
    const rec = new SR();
    rec.lang = getLocaleFromLanguage(language);
    rec.interimResults = true;
    rec.continuous = false;
    let transcript = '';
    rec.onresult = (e: ISpeechRecognitionEvent) => {
      transcript = '';
      for (let i = 0; i < e.results.length; i++) transcript += e.results[i][0]?.transcript || '';
      setCommand(transcript);
    };
    rec.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
      if (transcript.trim()) {
        // Optionally speak back the recognized command
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
          const u = new SpeechSynthesisUtterance(transcript);
          u.lang = getLocaleFromLanguage(language);
          window.speechSynthesis.cancel();
          window.speechSynthesis.speak(u);
        }
        setStatus('recognized');
      } else {
        setStatus('idle');
      }
    };
    rec.onerror = () => {
      setIsListening(false);
      recognitionRef.current = null;
      setStatus('idle');
    };
    recognitionRef.current = rec;
    setIsListening(true);
    setStatus('listening');
    rec.start();
  };

  const stopListening = () => {
    const rec = recognitionRef.current;
    if (rec) {
      try { rec.stop(); } catch {}
    }
  };

  const handleMicTap = () => {
    if (isListening) {
      stopListening();
    } else {
      setCommand('');
      setStatus('idle');
      startListening();
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-purple-400 to-pink-500 p-6 relative flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <p className="text-white text-xl font-semibold">{t.voicePayment}</p>
        <button
          onClick={onBack}
          className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm"
          aria-label="Close"
        >
          <X className="w-6 h-6 text-gray-600" />
        </button>
      </div>

      {/* Voice Animation */}
      <div className="flex flex-col items-center justify-center flex-1 mb-8">
        <div className="relative mb-8">
          {isListening && (
            <>
              <div className="absolute inset-0 bg-white rounded-full animate-ping opacity-20"></div>
              <div className="absolute inset-0 bg-white rounded-full animate-pulse opacity-10"></div>
            </>
          )}
          <button
            onClick={handleMicTap}
            className={`relative w-32 h-32 rounded-full flex items-center justify-center transition-all transform active:scale-95 ${
              isListening 
                ? 'bg-white shadow-2xl' 
                : 'bg-white/30 backdrop-blur hover:bg-white/40'
            }`}
            title={isListening ? (language === 'hi' ? 'सुनना बंद करें' : 'Stop listening') : (language === 'hi' ? 'सुनना शुरू करें' : 'Start listening')}
          >
            <Mic className={`w-16 h-16 ${isListening ? 'text-purple-600' : 'text-white'}`} />
          </button>
        </div>

        {/* Status Text */}
  <div className="text-center min-h-20 flex items-center justify-center">
          {status === 'idle' && (
            <p className="text-white text-sm">{t.tapToSpeak}</p>
          )}
          {status === 'unsupported' && (
            <div className="flex items-center gap-2 text-white">
              <AlertCircle className="w-5 h-5" />
              <p className="text-sm">{language === 'hi' ? 'इस ब्राउज़र में वॉइस सपोर्ट नहीं है।' : 'Voice is not supported in this browser.'}</p>
            </div>
          )}
          {status === 'listening' && (
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                <div className="w-1 h-8 bg-white rounded-full animate-pulse"></div>
                <div className="w-1 h-10 bg-white rounded-full animate-pulse"></div>
                <div className="w-1 h-6 bg-white rounded-full animate-pulse"></div>
                <div className="w-1 h-12 bg-white rounded-full animate-pulse"></div>
              </div>
              <p className="text-white ml-2">{t.listening}</p>
            </div>
          )}
          {status === 'processing' && (
            <div className="flex flex-col items-center gap-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              <p className="text-white text-sm">{t.processing}</p>
            </div>
          )}
          {status === 'recognized' && (
            <div className="flex flex-col items-center gap-2">
              <CheckCircle className="w-12 h-12 text-green-400" />
              <p className="text-white font-medium">{t.recognized}</p>
            </div>
          )}
        </div>

        {/* Recognized Command */}
        {command && (
          <div className="mt-6 bg-white/20 backdrop-blur rounded-2xl p-6 w-full">
            <div className="flex items-start gap-3">
              <Volume2 className="w-6 h-6 text-white shrink-0 mt-1" />
              <p className="text-white">{command}</p>
            </div>
          </div>
        )}
      </div>

      {/* Examples */}
      <div className="bg-white/20 backdrop-blur rounded-3xl p-6">
        <p className="text-white mb-4 text-sm font-medium">{t.examples}</p>
        <div className="space-y-3">
          <div className="bg-white/20 backdrop-blur rounded-2xl p-4 flex items-center gap-3">
            <Volume2 className="w-5 h-5 text-white shrink-0" />
            <p className="text-white text-sm">{t.example1}</p>
          </div>
          <div className="bg-white/20 backdrop-blur rounded-2xl p-4 flex items-center gap-3">
            <Volume2 className="w-5 h-5 text-white shrink-0" />
            <p className="text-white text-sm">{t.example2}</p>
          </div>
          <div className="bg-white/20 backdrop-blur rounded-2xl p-4 flex items-center gap-3">
            <Volume2 className="w-5 h-5 text-white shrink-0" />
            <p className="text-white text-sm">{t.example3}</p>
          </div>
        </div>
        <p className="text-white/90 text-xs mt-4 text-center">{t.speakClearly}</p>
      </div>
    </div>
  );
}
