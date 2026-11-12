import React, { useState } from 'react';
import { Bot, Sparkles, Menu, X, ArrowRight, User as UserIcon, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  onNavigate: (page: string) => void;
  currentPage: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate, currentPage }) => {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <button
          onClick={() => onNavigate(user ? 'dashboard' : 'landing')}
          className="flex items-center space-x-3 group focus:outline-none"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <Bot className="w-5 h-5" />
          </div>
          <div className="text-left">
            <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 bg-clip-text text-transparent block leading-tight">
              AI Mock Interview
            </span>
            <span className="text-[10px] tracking-wider font-semibold text-indigo-600 uppercase">
              Evaluation System
            </span>
          </div>
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
          {!user ? (
            <>
              <button
                onClick={() => onNavigate('landing')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                  currentPage === 'landing' ? 'text-indigo-600 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Home
              </button>
              <a
                href="#features"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate('landing');
                  setTimeout(() => {
                    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }}
                className="px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate('landing');
                  setTimeout(() => {
                    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }}
                className="px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition"
              >
                How It Works
              </a>
              <a
                href="#why-us"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate('landing');
                  setTimeout(() => {
                    document.getElementById('why-us')?.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }}
                className="px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition"
              >
                Why Choose Us
              </a>
            </>
          ) : (
            <>
              <button
                onClick={() => onNavigate('dashboard')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
                  currentPage === 'dashboard' ? 'text-indigo-600 bg-indigo-50/80 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </button>
              <button
                onClick={() => onNavigate('interview-config')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
                  currentPage === 'interview-config' ? 'text-indigo-600 bg-indigo-50/80 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span>Start Interview</span>
              </button>
            </>
          )}
        </nav>

        {/* User CTAs */}
        <div className="hidden md:flex items-center space-x-3">
          {!user ? (
            <>
              <button
                onClick={() => onNavigate('login')}
                className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-indigo-600 transition"
              >
                Log In
              </button>
              <button
                onClick={() => onNavigate('register')}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-sm shadow-blue-500/20 active:scale-95 transition"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </>
          ) : (
            <div className="flex items-center space-x-3">
              <button
                onClick={() => onNavigate('profile')}
                className="flex items-center space-x-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-white text-slate-700 text-sm font-medium transition"
              >
                <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="max-w-[120px] truncate">{user.name}</span>
              </button>
              <button
                onClick={() => {
                  logout();
                  onNavigate('landing');
                }}
                title="Log out"
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center space-x-2">
          {user && (
            <button
              onClick={() => onNavigate('dashboard')}
              className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"
            >
              <LayoutDashboard className="w-5 h-5" />
            </button>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 shadow-lg animate-in slide-in-from-top-2">
          {!user ? (
            <>
              <button
                onClick={() => {
                  onNavigate('landing');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left py-2 text-sm font-medium text-slate-700 hover:text-indigo-600"
              >
                Home
              </button>
              <a
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-sm font-medium text-slate-700 hover:text-indigo-600"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-sm font-medium text-slate-700 hover:text-indigo-600"
              >
                How It Works
              </a>
              <div className="pt-3 border-t border-slate-100 flex flex-col space-y-2">
                <button
                  onClick={() => {
                    onNavigate('login');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 text-center text-sm font-semibold text-slate-700 border border-slate-200 rounded-xl"
                >
                  Log In
                </button>
                <button
                  onClick={() => {
                    onNavigate('register');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 text-center text-sm font-semibold text-white bg-indigo-600 rounded-xl shadow-sm"
                >
                  Get Started Free
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-2">
              <div className="p-3 bg-slate-50 rounded-xl flex items-center space-x-3 mb-2">
                <div className="w-9 h-9 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="text-left overflow-hidden">
                  <p className="text-sm font-semibold text-slate-900 truncate">{user.name}</p>
                  <p className="text-xs text-slate-500 truncate">{user.email}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  onNavigate('dashboard');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left py-2.5 px-3 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                Dashboard
              </button>
              <button
                onClick={() => {
                  onNavigate('profile');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left py-2.5 px-3 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                My Profile
              </button>
              <button
                onClick={() => {
                  onNavigate('interview-config');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left py-2.5 px-3 rounded-lg text-sm font-semibold text-indigo-600 bg-indigo-50"
              >
                Start New Interview
              </button>
              <button
                onClick={() => {
                  onNavigate('history');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left py-2.5 px-3 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                Interview History
              </button>
              <button
                onClick={() => {
                  onNavigate('analytics');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left py-2.5 px-3 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                Performance Analytics
              </button>
              <button
                onClick={() => {
                  onNavigate('settings');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left py-2.5 px-3 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                Settings
              </button>
              <div className="pt-2 border-t border-slate-100">
                <button
                  onClick={() => {
                    logout();
                    onNavigate('landing');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center space-x-2 py-2.5 text-sm font-semibold text-rose-600 bg-rose-50 rounded-xl"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
