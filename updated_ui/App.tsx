import { useState } from 'react';
import { SimpleHomeScreen } from './components/SimpleHomeScreen';
import { SmartDashboard } from './components/SmartDashboard';
import { VoiceCommandScreen } from './components/VoiceCommandScreen';
import { HelpOverlay } from './components/HelpOverlay';
import { SendMoneyOptions } from './components/SendMoneyOptions';
import { LanguageSelector } from './components/LanguageSelector';
import { InsightsScreen } from './components/InsightsScreen';

export default function App() {
  const [viewMode, setViewMode] = useState<'simple' | 'smart'>('simple');
  const [currentScreen, setCurrentScreen] = useState<'home' | 'voice' | 'sendMoney' | 'insights'>('home');
  const [showHelp, setShowHelp] = useState(false);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  const handleViewToggle = () => {
    setViewMode(viewMode === 'simple' ? 'smart' : 'simple');
  };

  const handleSendMoney = () => {
    setCurrentScreen('sendMoney');
  };

  const handleVoiceCommand = () => {
    setCurrentScreen('voice');
  };

  const handleInsights = () => {
    setCurrentScreen('insights');
  };

  const handleBackToHome = () => {
    setCurrentScreen('home');
  };

  const handleLanguageChange = (lang: string) => {
    setSelectedLanguage(lang);
    setShowLanguageSelector(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden relative">
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
              onToggleView={handleViewToggle}
              onShowHelp={() => setShowHelp(true)}
              onShowLanguage={() => setShowLanguageSelector(true)}
              language={selectedLanguage}
            />
          ) : (
            <SmartDashboard
              onSendMoney={handleSendMoney}
              onVoiceCommand={handleVoiceCommand}
              onInsights={handleInsights}
              onToggleView={handleViewToggle}
              onShowHelp={() => setShowHelp(true)}
              onShowLanguage={() => setShowLanguageSelector(true)}
              language={selectedLanguage}
            />
          )
        )}

        {currentScreen === 'voice' && (
          <VoiceCommandScreen
            onBack={handleBackToHome}
            language={selectedLanguage}
          />
        )}

        {currentScreen === 'sendMoney' && (
          <SendMoneyOptions
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
      </div>
    </div>
  );
}
