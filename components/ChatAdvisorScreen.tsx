"use client";
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Bot, Send as SendIcon, ShieldCheck, Sparkles, Mic, Volume2, Square } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type Message = { role: 'user' | 'assistant'; content: string };

interface ChatAdvisorScreenProps {
  onBack: () => void;
  language: string;
}

export function ChatAdvisorScreen({ onBack, language }: ChatAdvisorScreenProps) {
  // Minimal SpeechRecognition typings (browser-provided)
  interface ISpeechRecognitionResult {
    0: { transcript: string };
    length: number;
    isFinal?: boolean;
  }
  interface ISpeechRecognitionResultList {
    length: number;
    [index: number]: ISpeechRecognitionResult;
  }
  interface ISpeechRecognitionEvent extends Event {
    resultIndex: number;
    results: ISpeechRecognitionResultList;
  }
  interface ISpeechRecognition extends EventTarget {
    lang: string;
    interimResults: boolean;
    continuous: boolean;
    onresult: (e: ISpeechRecognitionEvent) => void;
    onend: () => void;
    onerror: (e: unknown) => void;
    start(): void;
    stop(): void;
  }
  type ISpeechRecognitionConstructor = new () => ISpeechRecognition;

  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        language === 'hi'
          ? 'नमस्ते! मैं आपका ऋण और वित्तीय सलाहकार हूँ। आप किस प्रकार का ऋण या सलाह चाहते हैं?'
          : 'Hello! I’m your loan and financial advisor. What kind of loan or advice are you looking for?',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [softScore, setSoftScore] = useState<number | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<ISpeechRecognition | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const ttsRef = useRef<SpeechSynthesisUtterance | null>(null);

  const t = useMemo(() => ({
    title: {
      en: 'Loan & Advice',
      hi: 'ऋण और सलाह',
    },
    placeholder: {
      en: 'Ask about loans, eligibility, interest, documents…',
      hi: 'ऋण, पात्रता, ब्याज, दस्तावेज़… के बारे में पूछें',
    },
    send: { en: 'Send', hi: 'भेजें' },
  }), []);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  // Speak assistant replies if enabled
  // Speak assistant replies if enabled
  useEffect(() => {
    if (!autoSpeak) return;
    const last = messages[messages.length - 1];
    if (last?.role === 'assistant' && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        // Cancel any ongoing speech and speak latest
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(last.content);
        const langMap: Record<string, string> = { hi: 'hi-IN', en: 'en-IN' };
        u.lang = langMap[language] || 'en-IN';
        u.rate = 1;
        u.pitch = 1;
        ttsRef.current = u;
        u.onend = () => { ttsRef.current = null; };
        u.onerror = () => { ttsRef.current = null; };
        window.speechSynthesis.speak(u);
      } catch {
        // ignore TTS errors
      }
    }
  }, [messages, autoSpeak, language]);

  // Cleanup: stop recording and TTS when leaving the page/component
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch {}
        recognitionRef.current = null;
      }
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        try { window.speechSynthesis.cancel(); } catch {}
      }
    };
  }, []);

  // Fetch or compute soft credit score for the signed-in user
  async function fetchScore() {
    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      const res = await fetch('/api/credit/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (res.ok) {
        const json = await res.json();
        setSoftScore(json.softScore ?? null);
      }
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    fetchScore();
  }, []);

  async function sendMessage() {
    const text = input.trim();
    if (!text) return;
    setInput('');
    setMessages((m) => [...m, { role: 'user', content: text }]);
    setLoading(true);
    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      const res = await fetch('/api/advisor/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ message: text, language }),
      });
      const data = await res.json();
      const answer = data?.answer || (language === 'hi' ? 'माफ़ कीजिए, कुछ समस्या हुई।' : 'Sorry, something went wrong.');
      setMessages((m) => [...m, { role: 'assistant', content: answer }]);
      if (typeof data?.softScore === 'number') setSoftScore(data.softScore);
    } catch {
      setMessages((m) => [
        ...m,
        { role: 'assistant', content: language === 'hi' ? 'माफ़ कीजिए, कुछ समस्या हुई।' : 'Sorry, something went wrong.' },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function getLocaleFromLanguage(code: string) {
    const map: Record<string, string> = { hi: 'hi-IN', en: 'en-IN' };
    return map[code] || 'en-IN';
  }

  function startRecording() {
    if (typeof window === 'undefined') return;
    const w = window as unknown as {
      SpeechRecognition?: ISpeechRecognitionConstructor;
      webkitSpeechRecognition?: ISpeechRecognitionConstructor;
    };
    const SR: ISpeechRecognitionConstructor | undefined = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) {
      setMessageToast(language === 'hi' ? 'यह ब्राउज़र वॉइस इनपुट का समर्थन नहीं करता।' : 'Voice input is not supported in this browser.');
      return;
    }
  const rec = new SR();
    rec.lang = getLocaleFromLanguage(language);
    rec.interimResults = true;
    rec.continuous = false;
    let transcript = '';
  rec.onresult = (e: ISpeechRecognitionEvent) => {
      const last = e.results[e.resultIndex];
      if (!last) return;
      transcript = '';
      for (let i = 0; i < e.results.length; i++) {
        transcript += e.results[i][0]?.transcript || '';
      }
      setInput(transcript);
    };
    rec.onend = () => {
      setIsRecording(false);
      recognitionRef.current = null;
      if (transcript.trim()) {
        setTimeout(() => {
          // Auto-send the captured text
          sendMessage();
        }, 50);
      }
    };
    rec.onerror = () => {
      setIsRecording(false);
      recognitionRef.current = null;
    };
  recognitionRef.current = rec;
    setIsRecording(true);
    rec.start();
  }

  function stopRecording() {
    const rec = recognitionRef.current;
    if (rec) {
      try { rec.stop(); } catch {}
    }
  }

  function stopSpeaking() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try { window.speechSynthesis.cancel(); } catch {}
      ttsRef.current = null;
    }
  }

  function handleBack() {
    stopRecording();
    stopSpeaking();
    onBack();
  }

  // Simple toast via message bubble for unsupported STT
  function setMessageToast(text: string) {
    setMessages((m) => [...m, { role: 'assistant', content: text }]);
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-sky-50 to-blue-50 flex flex-col">
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <button
          onClick={handleBack}
          className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
            <Bot className="w-5 h-5 text-teal-600" />
          </div>
          <div>
            <p className="text-gray-900 font-semibold">{t.title[language as 'en' | 'hi'] || t.title.en}</p>
            {softScore != null && (
              <p className="text-xs text-gray-600 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-teal-600" /> Soft Score: {softScore}
              </p>
            )}
          </div>
        </div>
        <div className="w-10" />
      </div>

      {/* Messages */}
      <div ref={listRef} className="flex-1 overflow-y-auto px-4 pb-24 space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={`${m.role === 'assistant' ? 'justify-start' : 'justify-end'} flex`}>
            <div
              className={`${
                m.role === 'assistant'
                  ? 'bg-white text-gray-900'
                  : 'bg-teal-600 text-white'
              } rounded-2xl px-4 py-3 max-w-[80%] shadow`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white text-gray-900 rounded-2xl px-4 py-3 max-w-[80%] shadow flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-600" />
              <span className="text-sm">Thinking…</span>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur border-t">
        <div className="flex items-center gap-2">
          <button
            onClick={() => (isRecording ? stopRecording() : startRecording())}
            className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm ${
              isRecording ? 'bg-rose-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
            aria-label={isRecording ? 'Stop recording' : 'Start recording'}
            title={isRecording ? 'Stop recording' : 'Start recording'}
          >
            <Mic className="w-5 h-5" />
          </button>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder={t.placeholder[language as 'en' | 'hi'] || t.placeholder.en}
            className="flex-1 border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="w-12 h-12 rounded-xl bg-teal-600 text-white flex items-center justify-center hover:bg-teal-500 disabled:opacity-50"
            aria-label="Send"
          >
            <SendIcon className="w-5 h-5" />
          </button>
          <button
            onClick={stopSpeaking}
            className="w-12 h-12 rounded-xl bg-white text-gray-700 flex items-center justify-center shadow-sm hover:bg-gray-50"
            aria-label="Stop speaking"
            title="Stop speaking"
          >
            <Square className="w-5 h-5" />
          </button>
          <button
            onClick={() => setAutoSpeak((v) => !v)}
            className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              autoSpeak ? 'bg-teal-50 text-teal-700' : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
            aria-label={autoSpeak ? 'Mute assistant voice' : 'Enable assistant voice'}
            title={autoSpeak ? 'Mute assistant voice' : 'Enable assistant voice'}
          >
            <Volume2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
