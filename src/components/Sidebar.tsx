import React from 'react';
import {
  LayoutDashboard,
  User,
  Sparkles,
  History,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Award,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  isCollapsed,
  onToggleCollapse,
}) => {
  const { user, profile, logout } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'interview-config', label: 'Start Interview', icon: Sparkles, highlight: true },
    { id: 'history', label: 'Interview History', icon: History },
    { id: 'analytics', label: 'Performance Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const completion = profile?.completionPercentage || 40;

  return (
    <aside
      className={`relative bg-white border-r border-slate-200/90 transition-all duration-300 flex flex-col justify-between shrink-0 h-[calc(100vh-4rem)] sticky top-16 select-none ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Top Navigation */}
      <div className="p-4 space-y-6 overflow-y-auto">
        {/* Toggle Collapse Button */}
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} mb-2`}>
          {!isCollapsed && (
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Navigation
            </span>
          )}
          <button
            onClick={onToggleCollapse}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Links */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                title={isCollapsed ? item.label : undefined}
                className={`w-full flex items-center rounded-xl text-sm font-semibold transition group ${
                  isCollapsed ? 'justify-center p-3' : 'space-x-3 px-3.5 py-2.5'
                } ${
                  isActive
                    ? item.highlight
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm shadow-indigo-500/20'
                      : 'bg-indigo-50 text-indigo-700'
                    : item.highlight
                    ? 'text-indigo-600 hover:bg-indigo-50/70'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon
                  className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-105 ${
                    isActive
                      ? item.highlight
                        ? 'text-white'
                        : 'text-indigo-600'
                      : item.highlight
                      ? 'text-indigo-600'
                      : 'text-slate-400 group-hover:text-slate-600'
                  }`}
                />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Profile Completion & Logout */}
      <div className="p-4 border-t border-slate-100 space-y-4">
        {!isCollapsed ? (
          <div className="p-3 bg-gradient-to-br from-indigo-50/70 to-purple-50/70 border border-indigo-100/80 rounded-2xl">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-slate-700 flex items-center space-x-1">
                <Award className="w-3.5 h-3.5 text-indigo-600" />
                <span>Profile Readiness</span>
              </span>
              <span className="text-xs font-bold text-indigo-700">{completion}%</span>
            </div>
            <div className="w-full bg-slate-200/80 h-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-full transition-all duration-500"
                style={{ width: `${completion}%` }}
              ></div>
            </div>
            {completion < 100 && (
              <button
                onClick={() => onNavigate('profile')}
                className="mt-2 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 hover:underline block text-left"
              >
                + Complete skills & resume
              </button>
            )}
          </div>
        ) : (
          <div
            title={`Profile completion: ${completion}%`}
            className="flex justify-center cursor-pointer"
            onClick={() => onNavigate('profile')}
          >
            <div className="relative w-8 h-8 rounded-full border-2 border-indigo-600/30 flex items-center justify-center font-bold text-[10px] text-indigo-600">
              {completion}%
            </div>
          </div>
        )}

        {/* User Card */}
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          {!isCollapsed ? (
            <div
              className="flex items-center space-x-3 overflow-hidden cursor-pointer"
              onClick={() => onNavigate('profile')}
            >
              <div className="w-9 h-9 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-sm shrink-0">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-slate-900 truncate leading-tight">
                  {user?.name || 'Candidate'}
                </p>
                <p className="text-[11px] text-slate-400 truncate leading-tight">{user?.email}</p>
              </div>
            </div>
          ) : (
            <button
              onClick={() => onNavigate('profile')}
              title={user?.name}
              className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-sm"
            >
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </button>
          )}

          {!isCollapsed && (
            <button
              onClick={() => {
                logout();
                onNavigate('landing');
              }}
              title="Log out"
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
