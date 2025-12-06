import React, { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import SnapFeature from './components/SnapFeature';
import TranslatorFeature from './components/TranslatorFeature';
import WordDojoFeature from './components/WordDojoFeature';
import SenseiFeature from './components/SenseiFeature';
import AuthPage from './components/AuthPage';
import { ViewState } from './types';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.SNAP);
  
  // Check local storage on mount to persist login
  useEffect(() => {
      const storedAuth = localStorage.getItem('nihongo_auth');
      if (storedAuth === 'true') {
          setIsAuthenticated(true);
      }
  }, []);

  const handleLogin = () => {
      setIsAuthenticated(true);
      localStorage.setItem('nihongo_auth', 'true');
  };

  const renderView = () => {
    switch (currentView) {
      case ViewState.SNAP:
        return <SnapFeature />;
      case ViewState.TRANSLATE:
        return <TranslatorFeature />;
      case ViewState.DOJO:
        return <WordDojoFeature />;
      case ViewState.SENSEI:
        return <SenseiFeature />;
      default:
        return <SnapFeature />;
    }
  };

  if (!isAuthenticated) {
    return <AuthPage onLogin={handleLogin} />;
  }

  return (
    <div className="relative w-full h-screen overflow-hidden bg-slate-50 font-sans text-slate-900 select-none">
      {/* Main Content Area */}
      <main className="h-full w-full pb-20">
        {renderView()}
      </main>

      {/* Bottom Navigation */}
      <Navigation currentView={currentView} setView={setCurrentView} />
    </div>
  );
}

export default App;