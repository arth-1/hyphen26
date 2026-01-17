'use client';

import { useState } from 'react';
import type { Language } from '@/lib/languages';
import { SimpleHomeScreen } from './SimpleHomeScreen';
import { SmartDashboard } from './SmartDashboard';
import { HelpOverlay } from './HelpOverlay';
import { SendMoneyOptions } from './SendMoneyOptions';
import { LanguageSelector } from './LanguageSelector';
import { InsightsScreen } from './InsightsScreen';
import { ChatAdvisorScreen } from './ChatAdvisorScreen';
import { TransactionsScreen } from './TransactionsScreen';
import { PersonalFinancesScreen } from './PersonalFinancesScreen';
import SchemesAndFormsScreen from './SchemesAndFormsScreen';
import FormAssistant from './FormAssistant';
import TransferScreen from './TransferScreen';
import BankingDashboard from './BankingDashboard';

interface AdaptDashboardProps {
  balance?: string;
  userName?: string;
  userId?: string;
  onNavigateToFeature?: (feature: 'circulars' | 'forms' | 'credit') => void;
}

export default function AdaptDashboard({ 
  balance, 
  userName, 
}: AdaptDashboardProps) {
  const [viewMode, setViewMode] = useState<'simple' | 'smart'>('simple');
  const [currentScreen, setCurrentScreen] = useState<'home' | 'sendMoney' | 'transfer' | 'insights' | 'advisor' | 'transactions' | 'finances' | 'banking'>('home');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [formsScreen, setFormsScreen] = useState<'catalog' | 'fill'>('catalog');
  const [showHelp, setShowHelp] = useState(false);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('hi');

  const handleViewToggle = () => {
    setViewMode(viewMode === 'simple' ? 'smart' : 'simple');
  };

  const handleSendMoney = () => {
    setCurrentScreen('sendMoney');
  };

  const handleTransfer = () => {
    setCurrentScreen('transfer');
  };

  // Voice is integrated into Advisor now; route voice actions to Advisor chat
  const handleVoiceCommand = () => {
    setCurrentScreen('advisor');
  };
  const handleInsights = () => {
    setCurrentScreen('insights');
  };

  const handleAdvisor = () => {
    setCurrentScreen('advisor');
  };

  const handleTransactions = () => {
    setCurrentScreen('transactions');
  };

  const handleFinances = () => {
    setCurrentScreen('finances');
  };

  const handleBanking = () => {
    setCurrentScreen('banking');
  };

  const handleFormsCatalog = () => {
    setFormsScreen('catalog');
    setCurrentScreen('insights');
  };
  const handleStartForm = (templateId: string) => {
    setSelectedTemplate(templateId);
    setFormsScreen('fill');
  };

  const handleBackToHome = () => {
    setCurrentScreen('home');
  };
  const handleStartTransfer = () => {
    setCurrentScreen('transfer');
  };

  const handleLanguageChange = (lang: string) => {
    setSelectedLanguage(lang);
    setShowLanguageSelector(false);
  };

  return (
    <div className="relative min-h-screen">
        {/* Language Selector Modal */}
        {showLanguageSelector && (
          <LanguageSelector
            currentLanguage={selectedLanguage}
            onLanguageSelect={handleLanguageChange}
            onClose={() => setShowLanguageSelector(false)}
          />
        )}

        {/* Help Overlay */}
        {showHelp && (
          <HelpOverlay
            onClose={() => setShowHelp(false)}
            viewMode={viewMode}
          />
        )}

        {/* Main Content */}
        {currentScreen === 'home' && (
          viewMode === 'simple' ? (
            <SimpleHomeScreen
              onSendMoney={handleSendMoney}
              onVoiceCommand={handleVoiceCommand}
              onInsights={handleInsights}
              onAdvisor={handleAdvisor}
              onBanking={handleBanking}
              onFinances={handleFinances}
              onForms={handleFormsCatalog}
              onTransactions={handleTransactions}
              onTransfer={handleTransfer}
              onToggleView={handleViewToggle}
              onShowHelp={() => setShowHelp(true)}
              onShowLanguage={() => setShowLanguageSelector(true)}
              language={selectedLanguage}
              balance={balance}
              userName={userName}
            />
          ) : (
            <SmartDashboard
              onSendMoney={handleSendMoney}
              onVoiceCommand={handleVoiceCommand}
              onInsights={handleInsights}
              onAdvisor={handleAdvisor}
              onFinances={handleFinances}
              onForms={handleFormsCatalog}
              onTransactions={handleTransactions}
              onBanking={handleBanking}
              onTransfer={handleTransfer}
              onToggleView={handleViewToggle}
              onShowHelp={() => setShowHelp(true)}
              onShowLanguage={() => setShowLanguageSelector(true)}
              language={selectedLanguage}
              balance={balance}
              userName={userName}
            />
          )
        )}

        {/* No separate voice screen; mic is available inside Advisor chat */}

        {currentScreen === 'sendMoney' && (
          <SendMoneyOptions
            onBack={handleBackToHome}
            onStartTransfer={handleStartTransfer}
            language={selectedLanguage}
          />
        )}
        {currentScreen === 'transfer' && (
          <TransferScreen
            onBack={handleBackToHome}
            language={selectedLanguage}
          />
        )}

        {currentScreen === 'insights' && (
          <InsightsScreen
            onBack={handleBackToHome}
            language={selectedLanguage}
          />
        )}

        {currentScreen === 'advisor' && (
          <ChatAdvisorScreen
            onBack={handleBackToHome}
            language={selectedLanguage}
          />
        )}

        {currentScreen === 'transactions' && (
          <TransactionsScreen
            onBack={handleBackToHome}
            language={selectedLanguage}
          />
        )}

        {currentScreen === 'finances' && (
          <PersonalFinancesScreen
            onBack={handleBackToHome}
            language={selectedLanguage}
          />
        )}

        {currentScreen === 'banking' && (
          <BankingDashboard
            language={selectedLanguage}
            onBack={handleBackToHome}
          />
        )}

        {/* Forms flow embedded under Insights for now (minimal routing changes) */}
        {currentScreen === 'insights' && formsScreen === 'catalog' && (
          <SchemesAndFormsScreen
            onBack={handleBackToHome}
            onSelect={handleStartForm}
            language={selectedLanguage}
          />
        )}
        {currentScreen === 'insights' && formsScreen === 'fill' && selectedTemplate && (
          <div className="p-4">
            <button onClick={() => setFormsScreen('catalog')} className="mb-2 text-sm text-teal-600">← Back</button>
            <FormAssistant templateId={selectedTemplate} language={selectedLanguage as Language} onComplete={() => setFormsScreen('catalog')} />
          </div>
        )}
    </div>
  );
}
