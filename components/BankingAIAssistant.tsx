"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  ArrowLeft,
  MessageCircle,
  Mic,
  MicOff,
  Send as SendIcon,
  Sparkles,
  Volume2,
  VolumeX,
  TrendingUp,
  DollarSign,
  Gift,
  Zap,
} from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface BankingDashboardProps {
  onBack?: () => void;
  userId?: string;
  language?: string;
}

export function BankingAIAssistant({
  onBack,
  userId,
  language = "en",
}: BankingDashboardProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        language === "hi"
          ? "नमस्ते! मैं आपका बैंकिंग सहायक हूँ। FD, ऋण, RD, या निवेश सलाह - कुछ भी करवा सकते हैं। क्या आप करना चाहते हैं?"
          : "Hello! I'm your banking assistant. I can help you with Fixed Deposits, Loans, Recurring Deposits, or investment advice. What would you like to do?",
      timestamp: new Date(),
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [conversationId, setConversationId] = useState<string | null>(null);

  const listRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const ttsRef = useRef<SpeechSynthesisUtterance | null>(null);

  const t = useMemo(
    () => ({
      title: {
        en: "Banking AI Assistant",
        hi: "बैंकिंग एआई सहायक",
      },
      placeholder: {
        en: "Ask about FD, loans, RD, or investments...",
        hi: "FD, ऋण, RD, या निवेश के बारे में पूछें...",
      },
      send: { en: "Send", hi: "भेजें" },
      startVoice: { en: "Start Voice", hi: "वॉइस शुरू करें" },
      stopVoice: { en: "Stop", hi: "रोकें" },
    }),
    []
  );

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.lang =
          language === "hi" ? "hi-IN" : "en-US";
        recognitionRef.current.interimResults = true;
        recognitionRef.current.continuous = false;

        recognitionRef.current.onresult = (event: any) => {
          let interim = "";
          for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
              setInput((prev) => prev + event.results[i][0].transcript);
            } else {
              interim += event.results[i][0].transcript;
            }
          }
          if (interim) setInput(interim);
        };

        recognitionRef.current.onend = () => {
          setIsRecording(false);
        };
      }
    }
  }, [language]);

  // Auto-scroll to latest message
  useEffect(() => {
    listRef.current?.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  // Speak assistant responses
  useEffect(() => {
    if (!autoSpeak) return;

    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.role === "assistant" && typeof window !== "undefined") {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(lastMessage.content);
        utterance.lang = language === "hi" ? "hi-IN" : "en-US";
        utterance.rate = 1;
        utterance.pitch = 1;
        ttsRef.current = utterance;
        window.speechSynthesis.speak(utterance);
      } catch (error) {
        console.error("TTS error:", error);
      }
    }
  }, [messages, autoSpeak, language]);

  const handleSendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");

    // Add user message
    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: userMessage,
        timestamp: new Date(),
      },
    ]);

    setLoading(true);

    try {
      const response = await fetch("/api/banking/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          conversationId,
          language,
        }),
      });

      const data = await response.json();

      if (data.response) {
        setConversationId(data.conversationId);
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.response,
            timestamp: new Date(),
          },
        ]);
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceStart = () => {
    if (!recognitionRef.current) {
      alert("Speech Recognition not supported in this browser");
      return;
    }

    setIsRecording(true);
    recognitionRef.current.start();
  };

  const handleVoiceStop = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft size={24} />
            </button>
          )}
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg p-2">
              <Sparkles size={20} className="text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-gray-900">
                {t.title[language as keyof typeof t.title]}
              </h1>
              <p className="text-xs text-gray-500">
                {language === "hi" ? "AI द्वारा संचालित" : "AI-powered"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setAutoSpeak(!autoSpeak)}
            className={`p-2 rounded-lg transition ${
              autoSpeak
                ? "bg-blue-100 text-blue-600"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {autoSpeak ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div
        ref={listRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                msg.role === "user"
                  ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-br-none"
                  : "bg-white text-gray-900 border border-gray-200 rounded-bl-none shadow-sm"
              }`}
            >
              <p className="text-sm leading-relaxed">{msg.content}</p>
              <p
                className={`text-xs mt-1 ${
                  msg.role === "user" ? "text-blue-100" : "text-gray-400"
                }`}
              >
                {msg.timestamp.toLocaleTimeString(language === "hi" ? "hi-IN" : "en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-white text-gray-900 border border-gray-200 px-4 py-3 rounded-lg rounded-bl-none">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Action Buttons */}
      <div className="px-4 py-3 bg-white border-t border-gray-200 grid grid-cols-4 gap-2">
        <button
          onClick={() => {
            const msg = language === "hi" ? "FD बनाना है" : "Create FD";
            setInput(msg);
          }}
          className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-100 text-xs text-center text-gray-700"
        >
          <Gift size={16} />
          <span>{language === "hi" ? "FD" : "FD"}</span>
        </button>
        <button
          onClick={() => {
            const msg =
              language === "hi" ? "ऋण के लिए आवेदन" : "Apply for loan";
            setInput(msg);
          }}
          className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-100 text-xs text-center text-gray-700"
        >
          <DollarSign size={16} />
          <span>{language === "hi" ? "ऋण" : "Loan"}</span>
        </button>
        <button
          onClick={() => {
            const msg =
              language === "hi" ? "RD शुरू करना है" : "Start RD";
            setInput(msg);
          }}
          className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-100 text-xs text-center text-gray-700"
        >
          <TrendingUp size={16} />
          <span>{language === "hi" ? "RD" : "RD"}</span>
        </button>
        <button
          onClick={() => {
            const msg =
              language === "hi" ? "निवेश सलाह दो" : "Investment advice";
            setInput(msg);
          }}
          className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-100 text-xs text-center text-gray-700"
        >
          <Zap size={16} />
          <span>{language === "hi" ? "सलाह" : "Advice"}</span>
        </button>
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 p-4 space-y-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={t.placeholder[language as keyof typeof t.placeholder]}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={handleSendMessage}
            disabled={loading || !input.trim()}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-lg hover:opacity-90 disabled:opacity-50 transition flex items-center gap-2"
          >
            <SendIcon size={18} />
            <span className="hidden sm:inline">
              {t.send[language as keyof typeof t.send]}
            </span>
          </button>
        </div>

        <div className="flex gap-2">
          {!isRecording ? (
            <button
              onClick={handleVoiceStart}
              className="flex-1 bg-blue-100 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-200 transition flex items-center justify-center gap-2 text-sm font-medium"
            >
              <Mic size={18} />
              {t.startVoice[language as keyof typeof t.startVoice]}
            </button>
          ) : (
            <button
              onClick={handleVoiceStop}
              className="flex-1 bg-red-100 text-red-600 px-4 py-2 rounded-lg hover:bg-red-200 transition flex items-center justify-center gap-2 text-sm font-medium animate-pulse"
            >
              <MicOff size={18} />
              {t.stopVoice[language as keyof typeof t.stopVoice]}
            </button>
          )}
        </div>

        <p className="text-xs text-gray-500 text-center">
          {language === "hi"
            ? "💡 आप अपनी भाषा में बातें कर सकते हैं"
            : "💡 Speak in your preferred language"}
        </p>
      </div>
    </div>
  );
}

export default BankingAIAssistant;
