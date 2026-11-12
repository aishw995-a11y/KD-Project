import React, { useState } from 'react';
import {
  Sparkles,
  Bot,
  BrainCircuit,
  Sliders,
  Clock,
  HelpCircle,
  FileText,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
  GraduationCap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';

interface InterviewConfigPageProps {
  onNavigate: (page: string, params?: any) => void;
  defaultRole?: string;
}

const JOB_ROLES = [
  'Software Developer',
  'Python Developer',
  'Java Developer',
  'Data Analyst',
  'AI/ML Engineer',
  'Web Developer',
  'Full Stack Developer',
  'Database Administrator',
  'Other',
];

const INTERVIEW_TYPES = [
  { id: 'Technical Interview', desc: 'Focuses on algorithms, system design, language fundamentals, and architecture.' },
  { id: 'HR Interview', desc: 'Evaluates cultural fit, career goals, teamwork ethics, and company alignment.' },
  { id: 'Behavioral Interview', desc: 'Tests situational judgment, conflict resolution, and the STAR methodology.' },
  { id: 'Mixed Interview', desc: 'A holistic round combining technical deep-dives and behavioral problem-solving.' },
];

const EXPERIENCE_LEVELS = [
  { id: 'Fresher', label: 'Fresher / College Graduate', desc: 'For students, recent grads, and entry-level aspirants.' },
  { id: 'Intermediate', label: 'Intermediate (1 - 3 yrs)', desc: 'For candidates with junior engineering experience.' },
  { id: 'Experienced', label: 'Experienced (3+ yrs)', desc: 'Higher expectations on trade-offs and leadership.' },
];

const DIFFICULTIES = [
  { id: 'Easy', label: 'Easy', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  { id: 'Medium', label: 'Medium (Standard Placement)', color: 'text-blue-600 bg-blue-50 border-blue-200' },
  { id: 'Hard', label: 'Hard (Top Tier / FAANG)', color: 'text-purple-600 bg-purple-50 border-purple-200' },
];

const QUESTION_COUNTS = [
  { count: 5, duration: 15, label: '5 Questions', durationText: '~15 Minutes (Quick Drill)' },
  { count: 10, duration: 30, label: '10 Questions', durationText: '~30 Minutes (Standard Round)' },
  { count: 15, duration: 45, label: '15 Questions', durationText: '~45 Minutes (Full Placement Simulation)' },
];

export const InterviewConfigPage: React.FC<InterviewConfigPageProps> = ({ onNavigate, defaultRole }) => {
  const { user, profile } = useAuth();
  const toast = useToast();

  const [jobRole, setJobRole] = useState(defaultRole || 'Software Developer');
  const [customRole, setCustomRole] = useState('');
  const [interviewType, setInterviewType] = useState('Technical Interview');
  const [experienceLevel, setExperienceLevel] = useState('Fresher');
  const [difficulty, setDifficulty] = useState('Medium');
  const [questionCount, setQuestionCount] = useState(5);
  const [durationMinutes, setDurationMinutes] = useState(15);
  const [useResumePersonalization, setUseResumePersonalization] = useState(true);
  const [generating, setGenerating] = useState(false);

  const selectedRole = jobRole === 'Other' ? (customRole || 'Software Engineer') : jobRole;

  const handleStartInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (jobRole === 'Other' && !customRole.trim()) {
      toast.error('Please specify your custom job role.');
      return;
    }

    try {
      setGenerating(true);
      toast.info('Generating personalized interview questions using Gemini 3.8 Flash...');

      const res = await api.interviews.generate({
        jobRole: selectedRole,
        interviewType,
        experienceLevel,
        difficulty,
        questionCount,
        durationMinutes,
        useResumePersonalization,
      });

      toast.success('Interview initialized! Prepare your microphone.');
      onNavigate('interview-session', { interviewId: res.session.id });
    } catch (err: any) {
      toast.error(err.message || 'Failed to start interview. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const hasResume = Boolean(profile?.resumeFileName || profile?.resumeExtractedText);
  const skillsCount = profile?.technicalSkills?.length || 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Title Bar */}
      <div className="border-b border-slate-200/80 pb-6 space-y-2">
        <div className="inline-flex items-center space-x-2 text-xs font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
          <BrainCircuit className="w-3.5 h-3.5 text-indigo-600" />
          <span>AI-Powered Personalization Engine</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Configure Your Mock Interview
        </h1>
        <p className="text-sm text-slate-500">
          Select your target role, difficulty, and interview format. The AI adapts questions to test your real conceptual depth.
        </p>
      </div>

      <form onSubmit={handleStartInterview} className="space-y-8">
        {/* Personalization Toggle & Resume Banner */}
        <div className="p-5 rounded-3xl bg-gradient-to-br from-indigo-50/80 via-white to-purple-50/80 border border-indigo-100 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">
                  Resume & Skill-Based AI Questioning
                </h3>
                <p className="text-xs text-slate-500">
                  {hasResume
                    ? `Attached: ${profile?.resumeFileName} (${skillsCount} skills detected)`
                    : 'No resume uploaded yet. Generic role questions will be supplemented.'}
                </p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={useResumePersonalization}
                onChange={e => setUseResumePersonalization(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              <span className="ml-3 text-xs font-bold text-slate-700">
                Personalize with Resume
              </span>
            </label>
          </div>

          {!hasResume && (
            <div className="flex items-center justify-between p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
              <span>Upload your PDF resume to have the AI probe your actual university projects!</span>
              <button
                type="button"
                onClick={() => onNavigate('profile')}
                className="font-bold underline text-amber-900 hover:text-amber-950 ml-2"
              >
                Upload Resume Now
              </button>
            </div>
          )}
        </div>

        {/* 1. Job Role Selection */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-4">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            1. Target Job Role
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {JOB_ROLES.map(role => (
              <button
                key={role}
                type="button"
                onClick={() => setJobRole(role)}
                className={`p-3.5 rounded-2xl text-xs font-bold text-left transition border ${
                  jobRole === role
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-xs ring-2 ring-indigo-500/20'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                }`}
              >
                {role}
              </button>
            ))}
          </div>

          {jobRole === 'Other' && (
            <div className="pt-2">
              <input
                type="text"
                value={customRole}
                onChange={e => setCustomRole(e.target.value)}
                placeholder="Enter specific role (e.g. Cloud DevOps Engineer, Embedded Systems)..."
                required
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          )}
        </div>

        {/* 2. Interview Type */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-4">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            2. Interview Type & Focus
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {INTERVIEW_TYPES.map(type => (
              <div
                key={type.id}
                onClick={() => setInterviewType(type.id)}
                className={`p-4 rounded-2xl cursor-pointer border transition ${
                  interviewType === type.id
                    ? 'border-indigo-600 bg-indigo-50/70 shadow-xs ring-2 ring-indigo-500/20'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-bold text-sm text-slate-900">{type.id}</h4>
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      interviewType === type.id
                        ? 'border-indigo-600 bg-indigo-600 text-white'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {interviewType === type.id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">{type.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Experience Level & Difficulty */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Experience Level */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-4">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              3. Target Experience Level
            </label>
            <div className="space-y-2.5">
              {EXPERIENCE_LEVELS.map(lvl => (
                <div
                  key={lvl.id}
                  onClick={() => setExperienceLevel(lvl.id)}
                  className={`p-3 rounded-2xl cursor-pointer border text-xs transition ${
                    experienceLevel === lvl.id
                      ? 'border-indigo-600 bg-indigo-50 font-semibold text-indigo-900'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <p className="font-bold text-sm">{lvl.label}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{lvl.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-4">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              4. Question Difficulty
            </label>
            <div className="space-y-2.5">
              {DIFFICULTIES.map(diff => (
                <div
                  key={diff.id}
                  onClick={() => setDifficulty(diff.id)}
                  className={`p-3.5 rounded-2xl cursor-pointer border transition flex items-center justify-between ${
                    difficulty === diff.id
                      ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-500/20'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                  }`}
                >
                  <span className="font-bold text-xs text-slate-800">{diff.label}</span>
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      difficulty === diff.id ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300'
                    }`}
                  >
                    {difficulty === diff.id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 4. Question Count & Duration */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-4">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            5. Session Length & Time Allocation
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {QUESTION_COUNTS.map(q => (
              <div
                key={q.count}
                onClick={() => {
                  setQuestionCount(q.count);
                  setDurationMinutes(q.duration);
                }}
                className={`p-4 rounded-2xl cursor-pointer border text-center transition ${
                  questionCount === q.count
                    ? 'border-indigo-600 bg-indigo-50/70 shadow-xs ring-2 ring-indigo-500/20'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                }`}
              >
                <div className="text-xl font-extrabold text-slate-900">{q.label}</div>
                <div className="text-xs text-slate-500 mt-1 flex items-center justify-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{q.durationText}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Start Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={generating}
            className="w-full py-4 px-6 rounded-2xl text-base font-extrabold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-indigo-700 shadow-xl shadow-indigo-600/25 active:scale-98 transition flex items-center justify-center space-x-3 disabled:opacity-60"
          >
            {generating ? (
              <span className="inline-flex items-center space-x-3">
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Generating Personalized Questions with Gemini AI...</span>
              </span>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Launch Mock Interview Session</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
