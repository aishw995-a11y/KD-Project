import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Sidebar } from './components/Sidebar';

import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProfilePage } from './pages/ProfilePage';
import { InterviewConfigPage } from './pages/InterviewConfigPage';
import { InterviewSessionPage } from './pages/InterviewSessionPage';
import { EvaluationReportPage } from './pages/EvaluationReportPage';
import { HistoryPage } from './pages/HistoryPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { SettingsPage } from './pages/SettingsPage';

function AppContent() {
  const { user, isLoading } = useAuth();
  const [currentPage, setCurrentPage] = useState<string>('landing');
  const [navigationParams, setNavigationParams] = useState<any>({});
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  const handleNavigate = (page: string, params: any = {}) => {
    setNavigationParams(params);
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xl shadow-lg shadow-indigo-500/20 animate-pulse">
          AI
        </div>
        <p className="text-sm font-semibold text-slate-600">Initializing AI Mock Interview System...</p>
      </div>
    );
  }

  // Protected route check
  const protectedPages = [
    'dashboard',
    'profile',
    'interview-config',
    'interview-session',
    'evaluation-report',
    'history',
    'analytics',
    'settings',
  ];

  const isProtected = protectedPages.includes(currentPage);
  const activePage = isProtected && !user ? 'login' : currentPage;

  // Pages with sidebar
  const showSidebar = user && [
    'dashboard',
    'profile',
    'interview-config',
    'history',
    'analytics',
    'settings',
  ].includes(activePage);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      {/* Navbar */}
      <Navbar onNavigate={handleNavigate} currentPage={activePage} />

      {/* Main Content Area */}
      <div className="flex-1 flex w-full">
        {showSidebar && (
          <Sidebar
            currentPage={activePage}
            onNavigate={handleNavigate}
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          />
        )}

        <main className={`flex-1 transition-all w-full overflow-x-hidden ${showSidebar ? 'p-2 sm:p-6' : ''}`}>
          {activePage === 'landing' && <LandingPage onNavigate={handleNavigate} />}
          {activePage === 'login' && <LoginPage onNavigate={handleNavigate} />}
          {activePage === 'register' && <RegisterPage onNavigate={handleNavigate} />}
          {activePage === 'forgot-password' && <ForgotPasswordPage onNavigate={handleNavigate} />}
          {activePage === 'dashboard' && <DashboardPage onNavigate={handleNavigate} />}
          {activePage === 'profile' && <ProfilePage onNavigate={handleNavigate} />}
          {activePage === 'interview-config' && (
            <InterviewConfigPage
              onNavigate={handleNavigate}
              defaultRole={navigationParams?.defaultRole}
            />
          )}
          {activePage === 'interview-session' && (
            <InterviewSessionPage
              onNavigate={handleNavigate}
              interviewId={navigationParams?.interviewId}
            />
          )}
          {activePage === 'evaluation-report' && (
            <EvaluationReportPage
              onNavigate={handleNavigate}
              interviewId={navigationParams?.interviewId}
              reportId={navigationParams?.reportId}
            />
          )}
          {activePage === 'history' && <HistoryPage onNavigate={handleNavigate} />}
          {activePage === 'analytics' && <AnalyticsPage onNavigate={handleNavigate} />}
          {activePage === 'settings' && <SettingsPage onNavigate={handleNavigate} />}
        </main>
      </div>

      {/* Footer on landing, login, register, and report pages */}
      {(activePage === 'landing' || activePage === 'evaluation-report' || !user) && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </AuthProvider>
  );
}
