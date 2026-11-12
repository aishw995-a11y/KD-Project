import React, { useState, useEffect } from 'react';
import {
  Award,
  Sparkles,
  Download,
  RotateCcw,
  LayoutDashboard,
  CheckCircle2,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  BookOpen,
  Compass,
  ArrowRight,
  TrendingUp,
  FileText,
  Printer,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import { EvaluationReport, InterviewSession } from '../types';
import { CircularProgress } from '../components/CircularProgress';

interface EvaluationReportPageProps {
  onNavigate: (page: string, params?: any) => void;
  interviewId?: string;
  reportId?: string;
}

export const EvaluationReportPage: React.FC<EvaluationReportPageProps> = ({
  onNavigate,
  interviewId,
  reportId,
}) => {
  const { user } = useAuth();
  const toast = useToast();

  const [report, setReport] = useState<EvaluationReport | null>(null);
  const [interview, setInterview] = useState<InterviewSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);

  useEffect(() => {
    async function loadReport() {
      try {
        setLoading(true);
        let res: { report: EvaluationReport; interview?: InterviewSession };
        if (interviewId) {
          res = await api.evaluations.getByInterviewId(interviewId);
        } else if (reportId) {
          res = await api.evaluations.getById(reportId);
        } else {
          // If no ID provided, fetch latest from history
          const hist = await api.interviews.getHistory();
          const firstCompleted = hist.interviews.find(i => i.evaluation);
          if (firstCompleted) {
            res = await api.evaluations.getByInterviewId(firstCompleted.id);
          } else {
            toast.error('No evaluation report found.');
            onNavigate('dashboard');
            return;
          }
        }

        setReport(res.report);
        if (res.interview) setInterview(res.interview);

        // Confetti celebration if score >= 80
        if (res.report && res.report.overallScore >= 80) {
          try {
            confetti({
              particleCount: 80,
              spread: 70,
              origin: { y: 0.6 },
            });
          } catch {}
        }
      } catch (err: any) {
        toast.error(err.message || 'Failed to load evaluation report.');
        onNavigate('dashboard');
      } finally {
        setLoading(false);
      }
    }

    loadReport();
  }, [interviewId, reportId]);

  const handlePrint = () => {
    window.print();
  };

  if (loading || !report) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-bold text-slate-700">Compiling Comprehensive Evaluation Report...</p>
        </div>
      </div>
    );
  }

  // Radar chart data
  const radarData = [
    { subject: 'Technical', value: report.categoryScores.technicalKnowledge || 70, fullMark: 100 },
    { subject: 'Communication', value: report.categoryScores.communicationSkills || 70, fullMark: 100 },
    { subject: 'Problem Solving', value: report.categoryScores.problemSolving || 70, fullMark: 100 },
    { subject: 'Relevance', value: report.categoryScores.answerRelevance || 70, fullMark: 100 },
    { subject: 'Clarity', value: report.categoryScores.clarityAndConfidence || 70, fullMark: 100 },
  ];

  // Bar chart data
  const barData = [
    { name: 'Technical Depth', score: report.categoryScores.technicalKnowledge },
    { name: 'Communication', score: report.categoryScores.communicationSkills },
    { name: 'Problem Solving', score: report.categoryScores.problemSolving },
    { name: 'Relevance', score: report.categoryScores.answerRelevance },
    { name: 'Clarity', score: report.categoryScores.clarityAndConfidence },
  ];

  const getBadgeStyle = (level: string) => {
    switch (level) {
      case 'Outstanding':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Proficient':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Needs Improvement':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8 print:p-0 print:m-0 print:max-w-none">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6 print:hidden">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 block mb-1">
            Official Assessment Report
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Interview Performance & Placement Evaluation
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Generated via Google Gemini 3.8 Flash • Session ID: {report.interviewId}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => onNavigate('dashboard')}
            className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-bold transition flex items-center space-x-1.5"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </button>
          <button
            onClick={() => onNavigate('interview-config', { defaultRole: interview?.jobRole })}
            className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold transition flex items-center space-x-1.5"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Retake Interview</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-500/20 transition flex items-center space-x-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>Download PDF / Print</span>
          </button>
        </div>
      </div>

      {/* Print-only Header Banner */}
      <div className="hidden print:block border-b-2 border-slate-800 pb-4 mb-6">
        <h2 className="text-2xl font-black text-slate-900">AI MOCK INTERVIEW AND EVALUATION SYSTEM</h2>
        <p className="text-sm text-slate-600">Candidate: {user?.name} • Role: {interview?.jobRole} • Date: {new Date(report.createdAt).toLocaleDateString()}</p>
      </div>

      {/* Overall Score & Performance Level Hero Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-10 shadow-xs grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
        {/* Radial Circular Progress */}
        <div className="flex flex-col items-center justify-center text-center">
          <CircularProgress
            score={report.overallScore}
            size={190}
            strokeWidth={16}
            label={report.performanceLevel}
            sublabel="Placement Benchmark"
          />
          <span
            className={`mt-4 px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider border ${getBadgeStyle(
              report.performanceLevel
            )}`}
          >
            {report.performanceLevel}
          </span>
        </div>

        {/* Executive Summary */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Interviewer Executive Summary
            </h3>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed font-normal whitespace-pre-line">
            {report.interviewSummary}
          </p>

          <div className="pt-2 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-400 block mb-0.5">Role Evaluated</span>
              <span className="font-bold text-slate-800">{interview?.jobRole || 'Software Developer'}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-400 block mb-0.5">Round Type</span>
              <span className="font-bold text-slate-800">{interview?.interviewType || 'Technical'}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-400 block mb-0.5">Question Count</span>
              <span className="font-bold text-slate-800">{report.questionEvaluations.length} Questions</span>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Analytics: Radar Chart & Category Scores */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Radar Competency Chart */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Skill Competency Matrix
            </h3>
            <span className="text-xs text-indigo-600 font-semibold bg-indigo-50 px-2.5 py-0.5 rounded-full">
              5-Point Assessment
            </span>
          </div>
          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 11, fontWeight: 600 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#cbd5e1" />
                <Radar name="Candidate" dataKey="value" stroke="#4f46e5" fill="#6366f1" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category-wise Breakdown Bar Chart */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Category Score Distribution
            </h3>
            <span className="text-xs text-slate-400">Target: 80+</span>
          </div>
          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} interval={0} angle={-15} textAnchor="end" />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  formatter={(val: any) => [`${val}/100`, 'Score']}
                  contentStyle={{ backgroundColor: '#1e293b', color: '#fff', borderRadius: '12px', border: 'none' }}
                />
                <Bar dataKey="score" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Individual Question-Wise Evaluations */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Detailed Question-by-Question Breakdown
            </h3>
            <p className="text-xs text-slate-500">
              Review what went well, what was missing, and inspect the ideal sample answer for each question.
            </p>
          </div>
          <span className="text-xs font-bold text-slate-400">
            {report.questionEvaluations.length} Evaluated
          </span>
        </div>

        <div className="space-y-4">
          {report.questionEvaluations.map((item, idx) => {
            const isExpanded = expandedQuestion === item.questionId || expandedQuestion === null && idx === 0;
            return (
              <div
                key={item.questionId || idx}
                className="rounded-2xl border border-slate-200 bg-slate-50/60 overflow-hidden transition"
              >
                {/* Question Header Accordion */}
                <div
                  onClick={() => setExpandedQuestion(isExpanded ? '' : item.questionId)}
                  className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-slate-100/70 transition"
                >
                  <div className="flex items-start space-x-3 pr-4">
                    <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 leading-snug">
                        {item.questionText}
                      </h4>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                        Answer submitted: "{item.userAnswer}"
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 shrink-0">
                    <span
                      className={`text-xs font-extrabold px-3 py-1 rounded-xl ${
                        item.score >= 80
                          ? 'bg-emerald-100 text-emerald-800'
                          : item.score >= 60
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {item.score}/100
                    </span>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="p-4 sm:p-6 border-t border-slate-200 bg-white space-y-5 animate-in slide-in-from-top-1">
                    {/* Candidate's submitted text */}
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                        Your Submitted Verbal Answer
                      </span>
                      <p className="text-xs text-slate-700 italic leading-relaxed">
                        "{item.userAnswer}"
                      </p>
                    </div>

                    {/* What Was Good vs What Was Missing */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-1">
                        <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-800 uppercase tracking-wider">
                          <ThumbsUp className="w-3.5 h-3.5 text-emerald-600" />
                          <span>What Was Good</span>
                        </div>
                        <p className="text-xs text-emerald-950 leading-relaxed font-medium">
                          {item.whatWasGood}
                        </p>
                      </div>

                      <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 space-y-1">
                        <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-800 uppercase tracking-wider">
                          <ThumbsDown className="w-3.5 h-3.5 text-amber-600" />
                          <span>What Was Missing</span>
                        </div>
                        <p className="text-xs text-amber-950 leading-relaxed font-medium">
                          {item.whatWasMissing}
                        </p>
                      </div>
                    </div>

                    {/* Areas to improve */}
                    <div className="text-xs text-slate-600 space-y-1">
                      <span className="font-bold text-slate-800">Key Takeaway for Revision:</span>
                      <p className="leading-relaxed">{item.areasToImprove}</p>
                    </div>

                    {/* Improved Model Sample Answer */}
                    <div className="p-4 rounded-2xl bg-indigo-50/80 border border-indigo-200 space-y-2">
                      <div className="flex items-center space-x-1.5 text-xs font-bold text-indigo-700 uppercase tracking-wider">
                        <BookOpen className="w-4 h-4 text-indigo-600" />
                        <span>Exemplary Model Answer (How FAANG Candidates Answer)</span>
                      </div>
                      <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-line font-medium">
                        {item.improvedSampleAnswer}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Strengths & Weaknesses Analysis */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        {/* Strengths */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Identified Strengths
            </h3>
          </div>
          <ul className="space-y-2.5 text-xs text-slate-700">
            {report.strengths.map((str, i) => (
              <li key={i} className="flex items-start space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <span className="leading-relaxed">{str}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Weaknesses */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 text-rose-600">
            <AlertCircle className="w-5 h-5" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Areas Requiring Polish
            </h3>
          </div>
          <ul className="space-y-2.5 text-xs text-slate-700">
            {report.weaknesses.map((wk, i) => (
              <li key={i} className="flex items-start space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                <span className="leading-relaxed">{wk}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Personalized Learning Roadmap */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center space-x-3 border-b border-slate-100 pb-4">
          <Compass className="w-5 h-5 text-indigo-600" />
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Personalized Learning Roadmap
            </h3>
            <p className="text-xs text-slate-500">
              Targeted revision milestones to elevate your placement readiness before real recruitment drives.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {report.learningRoadmap.map((phase, idx) => (
            <div key={idx} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <span className="text-[11px] font-extrabold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100 inline-block">
                {phase.phase}
              </span>
              <h4 className="font-bold text-sm text-slate-900">{phase.focus}</h4>
              <ul className="space-y-1.5 text-xs text-slate-600">
                {phase.actionItems.map((act, aIdx) => (
                  <li key={aIdx} className="flex items-start space-x-1.5">
                    <span className="text-indigo-500 font-bold">•</span>
                    <span>{act}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Recommended topics tags */}
        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-700 mr-2">Recommended Revision Topics:</span>
          {report.recommendedTopics.map((topic, i) => (
            <span
              key={i}
              className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-semibold border border-indigo-100"
            >
              {topic}
            </span>
          ))}
        </div>
      </div>

      {/* Bottom Retake & Next Steps Banner */}
      <div className="p-6 rounded-3xl bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h4 className="font-bold text-base">Ready to practice another round?</h4>
          <p className="text-xs text-slate-400 mt-0.5">
            Repeat drills regularly to build verbal fluency, reduce hesitation, and boost your score.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => onNavigate('dashboard')}
            className="px-5 py-2.5 border border-slate-700 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition"
          >
            Dashboard
          </button>
          <button
            onClick={() => onNavigate('interview-config', { defaultRole: interview?.jobRole })}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center space-x-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Retake Interview</span>
          </button>
        </div>
      </div>
    </div>
  );
};
