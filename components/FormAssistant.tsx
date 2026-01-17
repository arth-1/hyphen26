'use client';

import React, { useState, useEffect, useCallback } from 'react';
import createReport from 'docx-templates';
import { saveAs } from 'file-saver';
import { t, type Language } from '@/lib/languages';

interface Field {
  name: string;
  type: 'text' | 'number' | 'date' | 'select' | 'textarea';
  label: Record<Language, string>;
  options?: string[];
  required: boolean;
  validation?: string;
}

interface FormTemplate {
  id: string;
  name: string;
  fields: Field[];
}

interface FormAssistantProps {
  templateId: string;
  language?: Language;
  userId?: string;
  onComplete?: (data: Record<string, string | number>) => void;
}

export default function FormAssistant({
  templateId,
  language = 'hi',
  userId,
  onComplete,
}: FormAssistantProps) {
  const [template, setTemplate] = useState<FormTemplate | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | number>>({});
  const [isListening, setIsListening] = useState(false);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const loadTemplate = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/forms/${templateId}`);
      const data = await response.json();
      setTemplate(data);

      // Create or resume session
      const sessionRes = await fetch('/api/forms/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId,
          userId,
          language,
        }),
      });
      const sessionData = await sessionRes.json();
      setSessionId(sessionData.id);
      setAnswers(sessionData.answers || {});
      setCurrentIndex(sessionData.current_field_index || 0);
    } catch (error) {
      console.error('Template load error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [templateId, userId, language]);

  // Load form template
  useEffect(() => {
    loadTemplate();
  }, [loadTemplate]);

  const fields = template?.fields ?? [];
  const safeIndex = fields.length > 0 ? Math.min(Math.max(0, currentIndex), fields.length - 1) : 0;
  const currentField = fields.length > 0 ? fields[safeIndex] : undefined;
  const progress = fields.length > 0 ? ((safeIndex / fields.length) * 100) : 0;

  const progressWidthClass = (() => {
    const p = Math.round(progress);
    if (p <= 0) return 'w-0';
    if (p <= 8) return 'w-1/12';
    if (p <= 17) return 'w-1/6';
    if (p <= 25) return 'w-1/4';
    if (p <= 33) return 'w-1/3';
    if (p <= 42) return 'w-5/12';
    if (p <= 50) return 'w-1/2';
    if (p <= 58) return 'w-7/12';
    if (p <= 66) return 'w-2/3';
    if (p <= 75) return 'w-3/4';
    if (p <= 83) return 'w-5/6';
    if (p <= 92) return 'w-11/12';
    return 'w-full';
  })();

  // Speak question
  const speakQuestion = (field: Field) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      
      const question = field.label[language] || field.label['en'];
      const utterance = new SpeechSynthesisUtterance(question);
      
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

  // Start voice input
  const startVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert(language === 'hi' ? 'माफ़ करें, आवाज़ काम नहीं कर रही' : 'Sorry, voice not supported');
      return;
    }

    type GenericRecognition = {
      lang: string;
      continuous: boolean;
      onstart: () => void;
      onresult: (event: { results: ArrayLike<{ 0: { transcript: string } }> }) => void;
      onerror: () => void;
      onend: () => void;
      start: () => void;
    };
    const SpeechRecognitionCtor: new () => GenericRecognition = ((window as unknown as { webkitSpeechRecognition?: new () => GenericRecognition; SpeechRecognition?: new () => GenericRecognition; }).webkitSpeechRecognition
      || (window as unknown as { webkitSpeechRecognition?: new () => GenericRecognition; SpeechRecognition?: new () => GenericRecognition; }).SpeechRecognition) as new () => GenericRecognition;
    const recognition: GenericRecognition = new SpeechRecognitionCtor();

    const langCodes: Record<Language, string> = {
      hi: 'hi-IN',
      en: 'en-US',
      ta: 'ta-IN',
      te: 'te-IN',
      bn: 'bn-IN',
    };

    recognition.lang = langCodes[language];
    recognition.continuous = false;

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setCurrentAnswer(transcript);
      setIsListening(false);
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognition.start();
  };

  // Save answer and move to next
  const handleNext = async () => {
    if (!currentField || !currentAnswer.trim()) return;

    const newAnswers = {
      ...answers,
      [currentField.name]: currentAnswer,
    };
    setAnswers(newAnswers);

    // Save to backend
    if (sessionId) {
      await fetch('/api/forms/session', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          answers: newAnswers,
          currentIndex: currentIndex + 1,
        }),
      });
    }

    // Move to next field
    if (template && currentIndex < template.fields.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setCurrentAnswer('');
      
      // Auto-speak next question after short delay
      setTimeout(() => {
        if (template.fields[currentIndex + 1]) {
          speakQuestion(template.fields[currentIndex + 1]);
        }
      }, 500);
    }
  };

  // Go back
  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      const prevField = template?.fields[currentIndex - 1];
      if (prevField) {
        setCurrentAnswer(String(answers[prevField.name] || ''));
      }
    }
  };

  // Submit form
  const handleSubmit = async () => {
    if (sessionId) {
      await fetch('/api/forms/session', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          status: 'completed',
          answers,
        }),
      });
    }

    if (onComplete) {
      onComplete(answers);
    }
  };

  const handleDownload = () => {
    if (!template) {
      alert("Template not loaded yet.");
      return;
    }

    (async () => {
      try {
        console.log("Starting Word document download...");

        // Fetch the Word template
        const response = await fetch('/Simplified_Bank_Loan_Form.docx');
        if (!response.ok) throw new Error('Could not find the Word template.');
        const templateBuffer = await response.arrayBuffer();
        
        console.log("Template loaded. Preparing data...");
        console.log("Answers:", answers);

        // Map form answers to Word document placeholders
        const dataToFill = {
          ...answers,
          // Explicitly map common field names to Word placeholders
          fullName: answers['fullName'] || answers['name'] || answers['applicantName'] || '',
          dob: answers['dob'] || answers['dateOfBirth'] || answers['birthDate'] || '',
          gender: answers['gender'] || answers['sex'] || '',
          maritalStatus: answers['maritalStatus'] || answers['maritalSt'] || '',
          mobile: answers['mobile'] || answers['mobileNumber'] || answers['phone'] || '',
          email: answers['email'] || answers['emailId'] || '',
          pan: answers['pan'] || answers['panCard'] || '',
          aadhaar: answers['aadhaar'] || answers['uid'] || '',
          address: answers['address'] || answers['currentAddress'] || '',
          city: answers['city'] || answers['district'] || '',
          state: answers['state'] || '',
          pin: answers['pin'] || answers['pincode'] || '',
          permanentAddress: answers['permanentAddress'] || '',
          occupation: answers['occupation'] || answers['profession'] || '',
          employer: answers['employer'] || answers['companyName'] || '',
          designation: answers['designation'] || answers['jobTitle'] || '',
          income: answers['income'] || answers['annualIncome'] || '',
          loanType: answers['loanType'] || answers['loanCategory'] || '',
          loanAmount: answers['loanAmount'] || answers['amount'] || '',
          loanPurpose: answers['loanPurpose'] || answers['purpose'] || '',
          tenure: answers['tenure'] || answers['loanTenure'] || '',
          place: answers['place'] || '',
          date: answers['date'] || new Date().toLocaleDateString('en-IN'),
          signature: answers['signature'] || '',
        };

        console.log("Data to fill:", dataToFill);

        // Generate filled document
        const filledDoc = await createReport({
          template: templateBuffer,
          data: dataToFill,
          cmdDelimiter: ['{', '}'],
          failFast: false,
        });

        // Save the file
        const blob = new Blob([filledDoc], {
          type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        });
        saveAs(blob, `Filled_Loan_Application_${Date.now()}.docx`);
        
        console.log("Download completed successfully.");
      } catch (error) {
        console.error("Download failed:", error);
        alert(`Download Failed: ${error instanceof Error ? error.message : String(error)}`);
      }
    })();
  };

  // Read back all answers
  const readBackAnswers = () => {
    if (!template) return;

    const text = template.fields
      .map((field) => {
        const question = field.label[language] || field.label['en'];
        const answer = answers[field.name];
        return `${question}: ${answer}`;
      })
      .join('. ');

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-bounce">📝</div>
          <p className="text-xl text-gray-600">{t('loading', language)}</p>
        </div>
      </div>
    );
  }

  if (!template || !currentField) {
    return (
      <div className="text-center p-12">
        <p className="text-red-600 text-lg">
          {language === 'hi' ? 'फॉर्म नहीं मिला' : 'Form not found'}
        </p>
      </div>
    );
  }

  const isLastField = currentIndex === template.fields.length - 1;
  const allFieldsCompleted = template.fields.every((f) => answers[f.name]);

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl p-6 md:p-10">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="text-5xl mb-4">📝</div>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
          {template.name}
        </h2>
        <p className="text-gray-600">
          {language === 'hi' 
            ? 'आवाज़ में जवाब दें, हम फॉर्म भर देंगे'
            : 'Answer with your voice, we\'ll fill the form'}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-gray-700">
            {language === 'hi' 
              ? `सवाल ${currentIndex + 1} में से ${template.fields.length}`
              : `Question ${currentIndex + 1} of ${template.fields.length}`}
          </span>
          <span className="text-sm font-semibold text-blue-600">
            {Math.round(progress)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div className={`bg-linear-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-300 ${progressWidthClass}`} />
        </div>
      </div>

      {/* Current Question */}
  <div className="bg-linear-to-br from-blue-50 to-purple-50 rounded-2xl p-8 mb-6 border-2 border-blue-200">
        <div className="flex items-start justify-between mb-6">
          <h3 className="text-2xl md:text-3xl font-bold text-gray-800 flex-1">
            {currentField.label[language] || currentField.label['en']}
            {currentField.required && <span className="text-red-500 ml-2">*</span>}
          </h3>
          <button
            onClick={() => speakQuestion(currentField)}
            className="bg-white hover:bg-gray-50 p-3 rounded-full shadow-lg transition-all ml-4"
            title={language === 'hi' ? 'सुनें' : 'Listen'}
          >
            <span className="text-2xl">🔊</span>
          </button>
        </div>

        {/* Voice Input Button */}
        <div className="text-center mb-6">
          <button
            onClick={startVoiceInput}
            disabled={isListening}
            className={`w-32 h-32 rounded-full font-bold text-xl transition-all transform hover:scale-105 active:scale-95 shadow-2xl ${
              isListening
                ? 'bg-red-500 text-white animate-pulse'
                : 'bg-linear-to-br from-blue-500 to-purple-600 text-white'
            }`}
          >
            {isListening ? '🎤' : '🎙️'}
          </button>
          <p className="mt-4 text-lg font-semibold text-gray-700">
            {isListening ? t('listening', language) : t('tapToSpeak', language)}
          </p>
        </div>

        {/* Text Input Fallback */}
        <div className="mb-4">
          <textarea
            value={currentAnswer}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            placeholder={t('orTypeHere', language)}
            className="w-full p-4 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-lg min-h-[100px] resize-none"
          />
        </div>

        {/* Show prefilled answer if exists */}
        {answers[currentField.name] && (
          <div className="bg-green-100 border-2 border-green-300 rounded-xl p-4 mb-4">
            <p className="text-sm font-semibold text-green-800 mb-1">
              {language === 'hi' ? '✓ पहले भरा हुआ जवाब:' : '✓ Previously filled:'}
            </p>
            <p className="text-lg text-gray-800">{answers[currentField.name]}</p>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleBack}
          disabled={currentIndex === 0}
          className="flex-1 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 text-gray-800 font-bold py-4 px-6 rounded-xl transition-all"
        >
          ← {language === 'hi' ? 'पीछे' : 'Back'}
        </button>

        {!isLastField && (
          <button
            onClick={handleNext}
            disabled={!currentAnswer.trim()}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-bold py-4 px-6 rounded-xl shadow-lg transition-all transform hover:scale-105 active:scale-95"
          >
            {t('nextQuestion', language)} →
          </button>
        )}

        {isLastField && (
          <button
            onClick={handleNext}
            disabled={!currentAnswer.trim()}
            className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-bold py-4 px-6 rounded-xl shadow-lg transition-all transform hover:scale-105 active:scale-95"
          >
            {language === 'hi' ? 'पूरा करें' : 'Complete'} ✓
          </button>
        )}
      </div>

      {/* Review & Submit (shown after all fields completed) */}
      {allFieldsCompleted && (
        <div className="mt-8 bg-green-50 rounded-2xl p-6 border-2 border-green-200">
          <h3 className="text-xl font-bold text-green-800 mb-4 flex items-center gap-2">
            <span>✅</span>
            <span>{language === 'hi' ? 'आपके जवाब' : 'Your Answers'}</span>
          </h3>

          <div className="space-y-3 mb-6">
            {template.fields.map((field) => (
              <div key={field.name} className="bg-white rounded-lg p-4 shadow">
                <p className="text-sm font-semibold text-gray-600 mb-1">
                  {field.label[language] || field.label['en']}
                </p>
                <p className="text-lg text-gray-800">{answers[field.name]}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={readBackAnswers}
              className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-800 font-bold py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <span>🔊</span>
              <span>{t('readBack', language)}</span>
            </button>
            
            <button
              onClick={handleDownload}
              className="flex-1 bg-purple-100 hover:bg-purple-200 text-purple-800 font-bold py-4 px-6 rounded-xl transition-all"
            >
              {language === 'hi' ? 'डाउनलोड' : 'Download'}
            </button>
            
            <button
              onClick={handleSubmit}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg transition-all transform hover:scale-105 active:scale-95"
            >
              {t('confirmAndSubmit', language)}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
