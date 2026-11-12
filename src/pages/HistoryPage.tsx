import React, { useState, useEffect } from 'react';
import {
  History,
  Calendar,
  Filter,
  Search,
  Sparkles,
  ArrowRight,
  ChevronRight,
  Award,
  CheckCircle2,
  Clock,
  RotateCcw,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { InterviewSession } from '../types';

interface HistoryPageProps {
  onNavigate: (page: string, params?: any) => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({ onNavigate }) => {
  const [interviews, setInterviews] = useState<InterviewSession[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [roleFilter, setRoleFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchHistory();
  }, [roleFilter, typeFilter, difficultyFilter]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await api.interviews.getHistory({
        role: roleFilter !== 'all' ? roleFilter : undefined,
        type: typeFilter !== 'all' ? typeFilter : undefined,
        difficulty: difficultyFilter !== 'all' ? difficultyFilter : undefined,
      });
      setInterviews(res.interviews);
    } catch (err) {
      console.error('Failed to load interview history:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredInterviews = interviews.filter(i => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      i.jobRole.toLowerCase().includes(q) ||
      i.interviewType.toLowerCase().includes(q) ||
      i.difficulty.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100 w-fit mb-2">
            <History className="w-3.5 h-3.5" />
            <span>Candidate Archives</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Interview Session History
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Revisit your previous mock sessions, inspect question feedbacks, and track your evaluation trajectory.
          </p>
        </div>

        <button
          onClick={() => onNavigate('interview-config')}
          className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-500/20 transition flex items-center space-x-2 shrink-0"
        >
          <Sparkles className="w-4 h-4" />
          <span>Start New Interview</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-5 shadow-xs grid grid-cols-1 sm:grid-cols-4 gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search role or type..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Role Filter */}
        <div>
          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700"
          >
            <option value="all">All Job Roles</option>
            <option value="Software Developer">Software Developer</option>
            <option value="Full Stack Developer">Full Stack Developer</option>
            <option value="AI/ML Engineer">AI/ML Engineer</option>
            <option value="Python Developer">Python Developer</option>
            <option value="Java Developer">Java Developer</option>
            <option value="Data Analyst">Data Analyst</option>
          </select>
        </div>

        {/* Type Filter */}
        <div>
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700"
          >
            <option value="all">All Interview Types</option>
            <option value="Technical Interview">Technical Interview</option>
            <option value="HR Interview">HR Interview</option>
            <option value="Behavioral Interview">Behavioral Interview</option>
            <option value="Mixed Interview">Mixed Interview</option>
          </select>
        </div>

        {/* Difficulty Filter */}
        <div>
          <select
            value={difficultyFilter}
            onChange={e => setDifficultyFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700"
          >
            <option value="all">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-semibold text-slate-500">Loading history records...</p>
          </div>
        ) : filteredInterviews.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {filteredInterviews.map((session) => (
              <div
                key={session.id}
                className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition"
              >
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-extrabold text-base text-slate-900">{session.jobRole}</span>
                    <span className="text-[10px] px-2.5 py-0.5 bg-slate-100 font-semibold text-slate-600 rounded-full">
                      {session.interviewType}
                    </span>
                    <span className="text-[10px] px-2.5 py-0.5 bg-indigo-50 font-semibold text-indigo-700 rounded-full">
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
                    <span>•</span>
                    <span>{session.durationMinutes} mins allocated</span>
                  </div>
                </div>

                <div className="flex items-center space-x-4 shrink-0">
                  {session.evaluation ? (
                    <div className="text-right">
                      <span className="text-xl font-extrabold text-indigo-600 block leading-tight">
                        {session.evaluation.overallScore}/100
                      </span>
                      <span className="text-[11px] font-semibold text-emerald-600">
                        {session.evaluation.performanceLevel}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-amber-600 font-medium bg-amber-50 px-3 py-1 rounded-lg">
                      Incomplete
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
                    className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl transition flex items-center space-x-1"
                  >
                    <span>{session.evaluation ? 'View Report' : 'Resume'}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
              <History className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-800 text-sm">No Interviews Found</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No interview sessions matched your current filter criteria. Take a quick drill to generate your first score.
            </p>
            <button
              onClick={() => onNavigate('interview-config')}
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition"
            >
              Start Practice Session
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
