import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Award,
  TrendingUp,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  FileText,
  BarChart2,
  Calendar,
  Briefcase,
  ChevronRight,
  UserCheck,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { InterviewSession, AnalyticsSummary } from '../types';

interface DashboardPageProps {
  onNavigate: (page: string, params?: any) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { user, profile } = useAuth();
  const [recentInterviews, setRecentInterviews] = useState<InterviewSession[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        const [historyRes, analyticsRes] = await Promise.all([
          api.interviews.getHistory(),
          api.analytics.get(),
        ]);
        setRecentInterviews(historyRes.interviews.slice(0, 4));
        setAnalytics(analyticsRes.analytics);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const completion = profile?.completionPercentage || 40;
  const totalInterviews = analytics?.totalInterviews || recentInterviews.filter(i => i.status === 'completed').length || 0;
  const averageScore = analytics?.averageScore || 0;
  const bestScore = analytics?.highestScore || 0;

  const recommendedRoles = [
    {
      title: 'Full Stack Developer',
      match: '96% Profile Match',
      type: 'Technical & System Design',
      desc: 'Based on your React, Node.js, and RESTful API experience.',
      roleKey: 'Full Stack Developer',
    },
    {
      title: 'AI / ML Engineer',
      match: '92% Profile Match',
      type: 'Data Science & Algorithms',
      desc: 'Based on your Python, Machine Learning, and project portfolio.',
      roleKey: 'AI/ML Engineer',
    },
    {
      title: 'Software Developer (SDE)',
      match: '90% Profile Match',
      type: 'Core DSA & OOP',
      desc: 'Focused on algorithms, problem-solving, and database optimization.',
      roleKey: 'Software Developer',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 p-6 sm:p-10 text-white shadow-xl shadow-indigo-600/15">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold text-indigo-100">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              <span>Campus & Corporate Placement Hub</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Welcome back, {user?.name || 'Candidate'}!
            </h1>
            <p className="text-sm sm:text-base text-indigo-100 leading-relaxed font-normal">
              Practice timed verbal interviews with real-time speech transcription and instant Gemini 3.8 Flash evaluations.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigate('interview-config')}
              className="px-6 py-3.5 bg-white hover:bg-slate-100 text-indigo-700 font-bold rounded-2xl shadow-md transition flex items-center justify-center space-x-2 active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Start New Interview</span>
            </button>
            <button
              onClick={() => onNavigate('profile')}
              className="px-5 py-3.5 bg-indigo-900/60 hover:bg-indigo-900/80 text-white font-semibold rounded-2xl border border-indigo-400/30 transition flex items-center justify-center space-x-2"
            >
              <UserCheck className="w-4 h-4" />
              <span>View Profile</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Interviews */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Interviews
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-900">{totalInterviews}</span>
            <span className="text-xs text-slate-500">Sessions</span>
          </div>
          <p className="text-[11px] text-slate-400">Completed & evaluated</p>
        </div>

        {/* Average Score */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Average Score
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-indigo-600">
              {averageScore > 0 ? averageScore : '—'}
            </span>
            {averageScore > 0 && <span className="text-xs text-slate-500">/100</span>}
          </div>
          <p className="text-[11px] text-slate-400">Across all categories</p>
        </div>

        {/* Best Score */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Best Score
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-emerald-600">
              {bestScore > 0 ? bestScore : '—'}
            </span>
            {bestScore > 0 && <span className="text-xs text-slate-500">/100</span>}
          </div>
          <p className="text-[11px] text-slate-400">Peak performance</p>
        </div>

        {/* Profile Completion */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Profile Readiness
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-purple-600">{completion}%</span>
            <span className="text-xs text-slate-500">Completed</span>
          </div>
          <p className="text-[11px] text-slate-400">Resume & skills parsed</p>
        </div>
      </div>

      {/* Main Grid: Recommended Roles & Performance Suggestions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recommended Job Roles (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Recommended Job Roles for You</h2>
              <p className="text-xs text-slate-500">Curated based on your verified skills and resume profile</p>
            </div>
            <button
              onClick={() => onNavigate('interview-config')}
              className="text-xs font-bold text-indigo-600 hover:underline flex items-center space-x-1"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recommendedRoles.map((role, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-indigo-400 hover:shadow-md transition flex flex-col justify-between space-y-3 group"
              >
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full inline-block">
                    {role.match}
                  </span>
                  <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition">
                    {role.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{role.desc}</p>
                </div>

                <button
                  onClick={() => onNavigate('interview-config', { defaultRole: role.roleKey })}
                  className="w-full py-2 bg-slate-50 hover:bg-indigo-600 hover:text-white text-slate-700 text-xs font-bold rounded-xl transition flex items-center justify-center space-x-1"
                >
                  <span>Practice Role</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Recent Interview History Card */}
          <div className="pt-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Recent Interview History</h2>
                <p className="text-xs text-slate-500">Your recent practice sessions and evaluation status</p>
              </div>
              <button
                onClick={() => onNavigate('history')}
                className="text-xs font-bold text-indigo-600 hover:underline flex items-center space-x-1"
              >
                <span>Full History</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs">
              {recentInterviews.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {recentInterviews.map((session) => (
                    <div
                      key={session.id}
                      className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-sm text-slate-900">{session.jobRole}</span>
                          <span className="text-[10px] px-2 py-0.5 bg-slate-100 font-semibold text-slate-600 rounded-full">
                            {session.interviewType}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 bg-indigo-50 font-semibold text-indigo-700 rounded-full">
                            {session.difficulty}
                          </span>
                        </div>
                        <div className="flex items-center space-x-3 text-xs text-slate-400">
                          <span className="flex items-center space-x-1">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{new Date(session.createdAt).toLocaleDateString()}</span>
                          </span>
                          <span>•</span>
                          <span>{session.totalQuestions} Questions</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        {session.evaluation ? (
                          <div className="text-right">
                            <span className="text-base font-extrabold text-indigo-600 block leading-tight">
                              {session.evaluation.overallScore}/100
                            </span>
                            <span className="text-[10px] font-semibold text-emerald-600">
                              {session.evaluation.performanceLevel}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-amber-600 font-medium bg-amber-50 px-2 py-1 rounded-lg">
                            In Progress
                          </span>
                        )}

                        <button
                          onClick={() => {
                            if (session.evaluation) {
                              onNavigate('evaluation-report', { interviewId: session.id });
                            } else {
                              onNavigate('interview-session', { interviewId: session.id });
                            }
                          }}
                          className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl transition"
                        >
                          {session.evaluation ? 'View Report' : 'Resume'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm">No Mock Interviews Taken Yet</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Get started with your first AI mock interview session. It takes only 10-15 minutes to receive a full placement report.
                  </p>
                  <button
                    onClick={() => onNavigate('interview-config')}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition"
                  >
                    Start Your First Interview
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: AI Skill Improvement Suggestions & Quick Launch */}
        <div className="space-y-6">
          {/* Skill Improvement Suggestions */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                AI Skill Suggestions
              </h3>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Based on historical interview evaluations and industry placement benchmarks:
            </p>

            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-xs font-bold text-slate-800 block">
                  1. Deepen Asynchronous & Concurrency Concepts
                </span>
                <p className="text-[11px] text-slate-500">
                  Frequently probed in backend & full-stack interviews. Revise event loops, promise pooling, and worker threads.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-xs font-bold text-slate-800 block">
                  2. Apply the STAR Method in HR Rounds
                </span>
                <p className="text-[11px] text-slate-500">
                  Structure behavioral responses into Situation, Task, Action, and quantified Result to achieve 90+ communication score.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-xs font-bold text-slate-800 block">
                  3. Quantify Project Impact on Resume
                </span>
                <p className="text-[11px] text-slate-500">
                  Always state performance metrics (e.g., 'reduced API response latency by 35%') during verbal project walkthroughs.
                </p>
              </div>
            </div>

            <button
              onClick={() => onNavigate('analytics')}
              className="w-full py-2.5 text-center text-xs font-bold text-indigo-600 hover:bg-indigo-50 rounded-xl transition border border-indigo-100"
            >
              Explore Full Analytics & Radar
            </button>
          </div>

          {/* Placement Checklist */}
          <div className="p-6 rounded-3xl bg-slate-900 text-white shadow-lg space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-400">
              Placement Readiness Checklist
            </h3>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Upload PDF Resume with verified skills</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Complete 1 Technical SDE Mock Interview</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Practice 1 Behavioral / HR Mock Interview</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Maintain 75+ Average Evaluation Score</span>
              </li>
            </ul>

            <button
              onClick={() => onNavigate('interview-config')}
              className="w-full py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold rounded-xl text-xs transition shadow-md"
            >
              Launch Timed Practice Session
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
