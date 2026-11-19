import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { useTheme } from './context/ThemeContext';
import { Sidebar } from './components/Sidebar';
import { ScannerPage } from './pages/ScannerPage';
import { ResultsPage } from './pages/ResultsPage';
import { HistoryPage } from './pages/HistoryPage';
import { AdminPage } from './pages/AdminPage';
import { LoginPage } from './pages/LoginPage';
import { Loader2, Sparkles, Menu, Server, Shield } from 'lucide-react';

function App() {
  const { user, loading, isAdmin } = useAuth();
  const { isDark } = useTheme();
  const [currentTab, setCurrentTab] = useState('scanner');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const handleAnalysisComplete = (result) => {
    setAnalysisResult(result);
    setCurrentTab('results');
  };

  const handleScanAgain = () => {
    setAnalysisResult(null);
    setCurrentTab('scanner');
  };

  const handleViewAnalysis = (analysis) => {
    setAnalysisResult(analysis);
    setCurrentTab('results');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#071330] flex flex-col items-center justify-center space-y-4">
        <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center shadow-xl shadow-indigo-500/30 animate-pulse">
          <Sparkles className="h-7 w-7 text-white" />
        </div>
        <Loader2 className="h-5 w-5 text-indigo-400 animate-spin" />
        <p className="text-sm text-slate-300 font-medium">Initializing UniSkill ATS Pro...</p>
      </div>
    );
  }

  // If not authenticated, show unified login page
  if (!user) {
    return <LoginPage />;
  }

  const renderPage = () => {
    if (currentTab === 'results' && analysisResult) {
      return <ResultsPage analysis={analysisResult} onScanAgain={handleScanAgain} />;
    }
    switch (currentTab) {
      case 'history':
        return <HistoryPage onViewAnalysis={handleViewAnalysis} />;
      case 'admin':
        return <AdminPage />;
      case 'scanner':
      default:
        return <ScannerPage onAnalysisComplete={handleAnalysisComplete} />;
    }
  };

  // Background: Deep Royal/Navy Blue canvas
  const mainBg = isDark
    ? 'bg-gradient-to-br from-[#06122d] via-[#08183a] to-[#040c1e] text-slate-100'
    : 'bg-gradient-to-br from-[#0a1c44] via-[#0d2252] to-[#071536] text-white';

  const tabTitle = {
    scanner: 'ATS Resume Compatibility Scanner',
    results: 'ATS Score & Diagnostics',
    history: 'Candidate Analysis History',
    admin: 'Centralized Keyword & Role Database'
  }[currentTab] || 'ATS Scanner';

  return (
    <div className={`min-h-screen flex ${mainBg}`}>
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          setCurrentTab(tab);
          if (tab !== 'results') setAnalysisResult(null);
        }}
        mobileOpen={mobileSidebarOpen}
        setMobileOpen={setMobileSidebarOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 h-16 border-b border-white/10 bg-[#071330]/85 backdrop-blur-md px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition"
              title="Open Navigation"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-white tracking-tight flex items-center space-x-2">
                <span>{tabTitle}</span>
              </h2>
              <p className="text-[10px] text-slate-400 font-medium hidden sm:block">
                UniSkill AI-Powered ATS Resume Intelligence Engine
              </p>
            </div>
          </div>

          {/* Quick status & profile pill */}
          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[11px] font-semibold">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Redis Load Balancer</span>
            </div>

            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs">
              <div className={`h-6 w-6 rounded-lg flex items-center justify-center font-bold text-xs ${
                isAdmin ? 'bg-purple-500/20 text-purple-300' : 'bg-indigo-500/20 text-indigo-300'
              }`}>
                {user?.full_name ? user.full_name[0].toUpperCase() : 'U'}
              </div>
              <span className="font-semibold text-white text-xs max-w-[120px] truncate hidden md:inline">
                {user?.full_name}
              </span>
              <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                isAdmin ? 'bg-purple-500/20 text-purple-300' : 'bg-slate-700 text-slate-300'
              }`}>
                {user?.role}
              </span>
            </div>
          </div>
        </header>

        {/* Main Body */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {renderPage()}
        </main>

        {/* Footer */}
        <footer className="border-t border-white/10 py-6 text-center text-[11px] text-slate-400 bg-black/20">
          <p>
            UniSkill ATS Pro &bull; AI-Powered Career Intelligence Platform &bull; Connected to Redis Distributed Cache
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
