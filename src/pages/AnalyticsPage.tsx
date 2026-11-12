import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Award,
  Clock,
  Sparkles,
  Target,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { AnalyticsSummary } from '../types';

interface AnalyticsPageProps {
  onNavigate: (page: string, params?: any) => void;
}

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ onNavigate }) => {
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        setLoading(true);
        const res = await api.analytics.get();
        setData(res.analytics);
      } catch (err) {
        console.error('Error fetching analytics:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, []);

  if (loading || !data) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-500">Calculating Longitudinal Analytics...</p>
        </div>
      </div>
    );
  }

  // Radar metrics
  const radarData = [
    { subject: 'Technical', score: data.categoryAverages.technicalKnowledge || 70 },
    { subject: 'Communication', score: data.categoryAverages.communicationSkills || 70 },
    { subject: 'Problem Solving', score: data.categoryAverages.problemSolving || 70 },
    { subject: 'Relevance', score: data.categoryAverages.answerRelevance || 70 },
    { subject: 'Clarity', score: data.categoryAverages.clarityAndConfidence || 70 },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100 w-fit mb-2">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Placement Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Performance & Skill Analytics
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Data-backed metrics across verbal articulation, technical knowledge, and historical interview trends.
          </p>
        </div>

        <button
          onClick={() => onNavigate('interview-config')}
          className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-500/20 transition flex items-center space-x-2 shrink-0"
        >
          <Sparkles className="w-4 h-4" />
          <span>Practice Another Drill</span>
        </button>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Total Completed
          </span>
          <div className="text-3xl font-extrabold text-slate-900">{data.totalInterviews}</div>
          <p className="text-[11px] text-slate-500">Full mock interviews</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Average Score
          </span>
          <div className="text-3xl font-extrabold text-indigo-600">
            {data.averageScore > 0 ? `${data.averageScore}/100` : '—'}
          </div>
          <p className="text-[11px] text-slate-500">Benchmark across all rounds</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Highest Score
          </span>
          <div className="text-3xl font-extrabold text-emerald-600">
            {data.highestScore > 0 ? `${data.highestScore}/100` : '—'}
          </div>
          <p className="text-[11px] text-slate-500">Personal peak performance</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Practice Time
          </span>
          <div className="text-3xl font-extrabold text-purple-600">{data.totalTimeMinutes}m</div>
          <p className="text-[11px] text-slate-500">Verbal simulation time</p>
        </div>
      </div>

      {/* Main Charts Grid: Progression Line Chart + Radar Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Score Trend Line Chart */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Score Trajectory Over Time
            </h3>
            <span className="text-xs text-indigo-600 font-semibold bg-indigo-50 px-2.5 py-0.5 rounded-full">
              Trend
            </span>
          </div>

          <div className="h-64 sm:h-72 w-full">
            {data.scoreTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.scoreTrend} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip
                    formatter={(val: any) => [`${val}/100`, 'Score']}
                    contentStyle={{ backgroundColor: '#1e293b', color: '#fff', borderRadius: '12px', border: 'none' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#4f46e5"
                    strokeWidth={3}
                    dot={{ fill: '#4f46e5', r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                Complete at least one interview to view your score trend line.
              </div>
            )}
          </div>
        </div>

        {/* Radar Overall Mastery Chart */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Aggregate Category Mastery
            </h3>
            <span className="text-xs text-slate-400">Overall Benchmark</span>
          </div>

          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 11, fontWeight: 600 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#cbd5e1" />
                <Radar name="Mastery" dataKey="score" stroke="#10b981" fill="#34d399" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Role Performance Distribution & AI Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Role Performance Bar Chart (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Performance by Target Role
            </h3>
            <span className="text-xs text-slate-400">Average Score</span>
          </div>

          <div className="h-64 w-full">
            {data.rolePerformance.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.rolePerformance} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="role" tick={{ fontSize: 10, fill: '#64748b' }} interval={0} angle={-15} textAnchor="end" />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip
                    formatter={(val: any) => [`${val}/100`, 'Avg Score']}
                    contentStyle={{ backgroundColor: '#1e293b', color: '#fff', borderRadius: '12px', border: 'none' }}
                  />
                  <Bar dataKey="avgScore" fill="#6366f1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                Take interviews in multiple job roles to compare results.
              </div>
            )}
          </div>
        </div>

        {/* AI Recommendations Panel */}
        <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl space-y-5">
          <div className="flex items-center space-x-2 text-indigo-400">
            <Sparkles className="w-5 h-5" />
            <h3 className="text-sm font-bold uppercase tracking-wider">
              AI Strategic Insights
            </h3>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Automated recommendations based on pattern analysis across your answers:
          </p>

          <div className="space-y-3">
            <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-1">
              <span className="text-xs font-bold text-white block">Prioritize Weakest Matrix Area</span>
              <p className="text-[11px] text-slate-300">
                Focus on: <span className="font-semibold text-indigo-300">{data.recommendedFocus.join(', ')}</span>.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-1">
              <span className="text-xs font-bold text-white block">Speed & Articulation Cadence</span>
              <p className="text-[11px] text-slate-300">
                Keep verbal responses structured under 2 minutes. State your answer in 3 concise bullet points.
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('interview-config')}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 shadow-md"
          >
            <span>Target Next Improvement Drill</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
