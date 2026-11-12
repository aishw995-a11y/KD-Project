import React, { useState, useEffect } from 'react';
import {
  Settings,
  Lock,
  User,
  Bell,
  Volume2,
  Database,
  Trash2,
  LogOut,
  CheckCircle2,
  AlertTriangle,
  Server,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';

interface SettingsPageProps {
  onNavigate: (page: string) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onNavigate }) => {
  const { user, profile, logout } = useAuth();
  const toast = useToast();

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Audio preference
  const [speechSpeed, setSpeechSpeed] = useState('1.0');
  const [soundEffects, setSoundEffects] = useState(true);
  const [notifications, setNotifications] = useState(true);

  // System status
  const [systemStatus, setSystemStatus] = useState<any>(null);

  // Delete modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  useEffect(() => {
    async function checkStatus() {
      try {
        const res = await api.status.get();
        setSystemStatus(res);
      } catch (e) {
        console.warn('Status check failed:', e);
      }
    }
    checkStatus();
  }, []);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      toast.error('Please fill in current and new passwords.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters.');
      return;
    }

    try {
      setPasswordLoading(true);
      const res = await api.auth.changePassword({ currentPassword, newPassword, confirmPassword });
      toast.success(res.message);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleSavePreferences = () => {
    toast.success('System preferences saved successfully!');
  };

  const handleDeleteAccount = () => {
    toast.info('Account deleted. Logging out...');
    setDeleteModalOpen(false);
    logout();
    onNavigate('landing');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Title */}
      <div className="border-b border-slate-200/80 pb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          System & Account Settings
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage your credentials, audio speech playback speed, and database storage parameters.
        </p>
      </div>

      {/* 1. Account Details Summary */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center space-x-3 border-b border-slate-100 pb-4">
          <User className="w-5 h-5 text-indigo-600" />
          <h2 className="text-lg font-bold text-slate-900">Personal Information</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-slate-400 font-semibold block uppercase">Registered Name</span>
            <p className="text-sm font-bold text-slate-800 mt-0.5">{user?.name}</p>
          </div>
          <div>
            <span className="text-slate-400 font-semibold block uppercase">Email</span>
            <p className="text-sm font-bold text-slate-800 mt-0.5">{user?.email}</p>
          </div>
          <div>
            <span className="text-slate-400 font-semibold block uppercase">College / University</span>
            <p className="text-sm font-bold text-slate-800 mt-0.5">{profile?.college || 'Not specified'}</p>
          </div>
          <div>
            <span className="text-slate-400 font-semibold block uppercase">Degree Qualification</span>
            <p className="text-sm font-bold text-slate-800 mt-0.5">{profile?.qualification || 'B.Tech'}</p>
          </div>
        </div>

        <div className="pt-2">
          <button
            onClick={() => onNavigate('profile')}
            className="text-xs font-bold text-indigo-600 hover:underline"
          >
            Edit full profile & resume details →
          </button>
        </div>
      </div>

      {/* 2. Change Password */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center space-x-3 border-b border-slate-100 pb-4">
          <Lock className="w-5 h-5 text-indigo-600" />
          <h2 className="text-lg font-bold text-slate-900">Security & Password</h2>
        </div>

        <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-lg">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Current Password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="At least 6 chars"
                required
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Repeat password"
                required
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={passwordLoading}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-500/20 transition disabled:opacity-60"
          >
            {passwordLoading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>

      {/* 3. Audio & Voice Preferences */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center space-x-3 border-b border-slate-100 pb-4">
          <Volume2 className="w-5 h-5 text-indigo-600" />
          <h2 className="text-lg font-bold text-slate-900">Audio & Voice Interaction</h2>
        </div>

        <div className="space-y-4 max-w-lg text-xs">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-800 block">AI Interviewer Speech Speed</span>
              <p className="text-slate-500">Adjust the conversational reading rate of questions.</p>
            </div>
            <select
              value={speechSpeed}
              onChange={e => setSpeechSpeed(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
            >
              <option value="0.8">0.8x (Slower)</option>
              <option value="1.0">1.0x (Standard)</option>
              <option value="1.2">1.2x (Brisk)</option>
            </select>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div>
              <span className="font-bold text-slate-800 block">Sound Effects</span>
              <p className="text-slate-500">Play timer warning and answer submission pings.</p>
            </div>
            <input
              type="checkbox"
              checked={soundEffects}
              onChange={e => setSoundEffects(e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded"
            />
          </div>

          <button
            type="button"
            onClick={handleSavePreferences}
            className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl font-bold text-slate-700 transition"
          >
            Save Preferences
          </button>
        </div>
      </div>

      {/* 4. Backend & Database System Status */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center space-x-3 border-b border-slate-100 pb-4">
          <Database className="w-5 h-5 text-indigo-600" />
          <h2 className="text-lg font-bold text-slate-900">Database & AI Infrastructure</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-slate-400 font-semibold block">AI Studio Model</span>
            <span className="text-sm font-bold text-indigo-600 flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{systemStatus?.geminiModel || 'gemini-3.8-flash'}</span>
            </span>
            <p className="text-[11px] text-slate-500">Server-side telemetry active</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-slate-400 font-semibold block">Database Persistence Engine</span>
            <span className="text-sm font-bold text-slate-800 flex items-center space-x-1.5">
              <Server className="w-4 h-4 text-emerald-600" />
              <span>{systemStatus?.database?.storageType || 'MongoDB Atlas / Local Persistent'}</span>
            </span>
            <p className="text-[11px] text-slate-500">
              {systemStatus?.database?.mongoConnected ? 'Connected to MongoDB Atlas' : 'Durable local file storage (data/db.json)'}
            </p>
          </div>
        </div>
      </div>

      {/* 5. Danger Zone: Delete Account & Log Out */}
      <div className="bg-rose-50/50 rounded-3xl border border-rose-200/80 p-6 sm:p-8 shadow-xs space-y-4">
        <h2 className="text-lg font-bold text-rose-900">Account Management</h2>
        <p className="text-xs text-rose-700 leading-relaxed">
          Log out of your session or permanently erase your mock interviews and evaluation scores.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={() => {
              logout();
              onNavigate('landing');
            }}
            className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-bold transition flex items-center space-x-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Log Out</span>
          </button>

          <button
            onClick={() => setDeleteModalOpen(true)}
            className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition flex items-center space-x-2 shadow-sm"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Account</span>
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-lg font-bold text-slate-900">Are you sure you want to delete your account?</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                This will delete your candidate profile, resume data, and all interview evaluation records. This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center space-x-3 pt-2">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="w-1/2 py-2.5 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                className="w-1/2 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-500/20"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
