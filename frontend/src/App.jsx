import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { useTheme } from './context/ThemeContext';
import { Sidebar } from './components/Sidebar';
import { ScannerPage } from './pages/ScannerPage';
import { ResultsPage } from './pages/ResultsPage';
import { HistoryPage } from './pages/HistoryPage';
import { AdminPage } from './pages/AdminPage';
import { LoginPage } from './pages/LoginPage';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Loader2, Menu, Sun, Moon } from 'lucide-react';

function App() {
  const { user, loading, isAdmin } = useAuth();
  const { isDark, toggleTheme } = useTheme();
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
      <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex flex-col items-center justify-center space-y-3">
        <Loader2 className="h-6 w-6 text-blue-600 dark:text-blue-400 animate-spin" />
        <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">Loading UniSkill ATS...</p>
      </div>
    );
  }

  // If not authenticated, show clean login page
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

  const tabTitle = {
    scanner: 'Resume Scanner',
    results: 'Analysis Report',
    history: 'Candidate History',
    admin: 'Keyword Database & Roles'
  }[currentTab] || 'Resume Scanner';

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100">
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
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 h-16 border-b border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition"
              title="Open Navigation"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-base font-semibold text-slate-900 dark:text-white tracking-tight">
                {tabTitle}
              </h1>
            </div>
          </div>

          {/* Quick status & profile pill */}
          <div className="flex items-center space-x-2.5">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                toggleTheme();
              }}
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              className="px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-700 transition flex items-center space-x-1.5 text-xs font-medium shadow-xs cursor-pointer"
            >
              {isDark ? (
                <>
                  <Sun className="h-3.5 w-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="h-3.5 w-3.5 text-slate-600" />
                  <span className="hidden sm:inline">Dark Mode</span>
                </>
              )}
            </button>

            <div className="flex items-center space-x-2 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs">
              <span className="font-medium text-slate-800 dark:text-zinc-200 hidden sm:inline">
                {user?.full_name}
              </span>
              <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${
                isAdmin
                  ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300'
                  : 'bg-slate-200 dark:bg-zinc-700 text-slate-700 dark:text-zinc-300'
              }`}>
                {user?.role === 'admin' ? 'Admin' : 'Student'}
              </span>
            </div>
          </div>
        </header>

        {/* Main Body */}
        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ErrorBoundary>
            {renderPage()}
          </ErrorBoundary>
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-200 dark:border-zinc-800/80 py-5 text-center text-xs text-slate-500 dark:text-zinc-500">
          <p>UniSkill ATS &bull; Internal Platform &bull; Scores are estimates and do not guarantee hiring selection.</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
