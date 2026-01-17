'use client';

import React, { useState, useRef } from 'react';
import { t, type Language } from '@/lib/languages';

interface CircularQAProps {
  language?: Language;
  userId?: string;
}

interface Answer {
  answer: string;
  sources: Array<{
    id: string;
    title: string;
    source: string;
    excerpt: string;
  }>;
  confidence: number;
}

export default function CircularQA({ language = 'hi', userId }: CircularQAProps) {
  const [mode, setMode] = useState<'voice' | 'text'>('voice');
  const [query, setQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [answer, setAnswer] = useState<Answer | null>(null);
  const [showSources, setShowSources] = useState(false);
  const recognitionRef = useRef<unknown>(null);

  // Initialize speech recognition
  const startVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert(language === 'hi' ? 'माफ़ करें, आवाज़ काम नहीं कर रही' : 'Sorry, voice not supported');
      return;
    }

    const SpeechRecognitionAPI = (window as unknown as { webkitSpeechRecognition: new () => unknown; SpeechRecognition?: new () => unknown }).webkitSpeechRecognition || 
      (window as unknown as { SpeechRecognition?: new () => unknown }).SpeechRecognition;
    
    if (!SpeechRecognitionAPI) return;
    
    const recognition = new SpeechRecognitionAPI() as {
      lang: string;
      continuous: boolean;
      interimResults: boolean;
      onstart: (() => void) | null;
      onresult: ((event: { results: { [key: number]: { [key: number]: { transcript: string } } } }) => void) | null;
      onerror: (() => void) | null;
      onend: (() => void) | null;
      start: () => void;
      stop: () => void;
    };

    const langCodes: Record<Language, string> = {
      hi: 'hi-IN',
      en: 'en-US',
      ta: 'ta-IN',
      te: 'te-IN',
      bn: 'bn-IN',
    };

    recognition.lang = langCodes[language];
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: { results: { [key: number]: { [key: number]: { transcript: string } } } }) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
      setIsListening(false);
      // Auto-submit after voice input
      handleSubmit(transcript);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopVoiceInput = () => {
    if (recognitionRef.current) {
      (recognitionRef.current as { stop: () => void }).stop();
      setIsListening(false);
    }
  };

  const handleSubmit = async (voiceQuery?: string) => {
    const finalQuery = voiceQuery || query;
    if (!finalQuery.trim()) return;

    setIsLoading(true);
    setAnswer(null);

    try {
      const response = await fetch('/api/circulars/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: finalQuery,
          language,
          userId,
        }),
      });

      const data = await response.json();
      setAnswer(data);
    } catch (error) {
      console.error('Query error:', error);
      alert(language === 'hi' ? 'कुछ गलत हुआ, फिर कोशिश करें' : 'Something went wrong, try again');
    } finally {
      setIsLoading(false);
    }
  };

  const speakAnswer = () => {
    if (!answer) return;

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(answer.answer);
      
      const langCodes: Record<Language, string> = {
        hi: 'hi-IN',
        en: 'en-US',
        ta: 'ta-IN',
        te: 'te-IN',
        bn: 'bn-IN',
      };
      utterance.lang = langCodes[language];
      utterance.rate = 0.85;

      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="text-5xl mb-3">📢</div>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
          {t('askCirculars', language)}
        </h2>
        <p className="text-gray-600">
          {language === 'hi' 
            ? 'सरकारी योजनाओं और ऋण के बारे में पूछें'
            : 'Ask about government schemes and loans'}
        </p>
      </div>

      {/* Mode Toggle */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={() => setMode('voice')}
          className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all ${
            mode === 'voice'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          🎤 {language === 'hi' ? 'आवाज़' : 'Voice'}
        </button>
        <button
          onClick={() => setMode('text')}
          className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all ${
            mode === 'text'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          ⌨️ {language === 'hi' ? 'लिखें' : 'Type'}
        </button>
      </div>

      {/* Voice Input */}
      {mode === 'voice' && (
        <div className="text-center mb-6">
          <button
            onClick={isListening ? stopVoiceInput : startVoiceInput}
            disabled={isLoading}
            className={`w-32 h-32 rounded-full font-bold text-xl transition-all transform hover:scale-105 active:scale-95 shadow-2xl ${
              isListening
                ? 'bg-red-500 text-white animate-pulse'
                : 'bg-gradient-to-br from-blue-500 to-purple-600 text-white'
            }`}
          >
            {isListening ? '🎤' : '🎙️'}
          </button>
          <p className="mt-4 text-lg font-semibold text-gray-700">
            {isListening ? t('listening', language) : t('tapToSpeak', language)}
          </p>
          {query && (
            <div className="mt-4 p-4 bg-gray-50 rounded-xl">
              <p className="text-gray-800 font-medium">{query}</p>
            </div>
          )}
        </div>
      )}

      {/* Text Input */}
      {mode === 'text' && (
        <div className="mb-6">
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('orTypeHere', language)}
            className="w-full p-4 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-lg min-h-[120px] resize-none"
            disabled={isLoading}
          />
          <button
            onClick={() => handleSubmit()}
            disabled={!query.trim() || isLoading}
            className="mt-3 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-bold py-4 px-6 rounded-xl shadow-lg transition-all transform hover:scale-105 active:scale-95 text-lg"
          >
            {isLoading ? '⏳ ' + t('loading', language) : '🔍 ' + (language === 'hi' ? 'खोजें' : 'Search')}
          </button>
        </div>
      )}

      {/* Answer Card */}
      {answer && (
        <div className="mt-8 bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-6 border-2 border-green-200 shadow-lg">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <span>💡</span>
              <span>{language === 'hi' ? 'जवाब' : 'Answer'}</span>
            </h3>
            <div className="flex gap-2">
              <button
                onClick={speakAnswer}
                className="bg-white hover:bg-gray-50 p-3 rounded-lg shadow transition-all"
                title={language === 'hi' ? 'सुनें' : 'Listen'}
              >
                🔊
              </button>
              <button
                onClick={() => setShowSources(!showSources)}
                className="bg-white hover:bg-gray-50 px-4 py-2 rounded-lg shadow transition-all font-semibold text-sm"
              >
                {language === 'hi' ? 'स्रोत' : 'Sources'} ({answer.sources.length})
              </button>
            </div>
          </div>

          <div className="prose prose-lg max-w-none">
            <p className="text-gray-800 leading-relaxed text-lg whitespace-pre-wrap">
              {answer.answer}
            </p>
          </div>

          {/* Confidence Indicator */}
          <div className="mt-4 flex items-center gap-2">
            <span className="text-sm text-gray-600">
              {language === 'hi' ? 'विश्वास:' : 'Confidence:'}
            </span>
            <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-xs">
              <div
                className="bg-green-500 h-2 rounded-full transition-all"
                style={{ width: `${answer.confidence * 100}%` }}
              />
            </div>
            <span className="text-sm font-semibold text-gray-700">
              {Math.round(answer.confidence * 100)}%
            </span>
          </div>

          {/* Sources */}
          {showSources && answer.sources.length > 0 && (
            <div className="mt-6 space-y-3">
              <h4 className="font-bold text-gray-700">
                {language === 'hi' ? '📚 स्रोत:' : '📚 Sources:'}
              </h4>
              {answer.sources.map((source) => (
                <div key={source.id} className="bg-white rounded-lg p-4 shadow border border-gray-200">
                  <h5 className="font-semibold text-gray-800 mb-1">{source.title}</h5>
                  <p className="text-sm text-gray-600 mb-2">{source.source}</p>
                  <p className="text-sm text-gray-700 italic">&ldquo;{source.excerpt}&rdquo;</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
