import React from 'react';
import {
  Sparkles,
  Bot,
  Mic,
  FileText,
  BarChart2,
  CheckCircle,
  ArrowRight,
  ShieldCheck,
  Target,
  Zap,
  Award,
  Users,
  PlayCircle,
  Terminal,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LandingPageProps {
  onNavigate: (page: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        {/* Subtle background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] pointer-events-none opacity-40 blur-3xl -z-10 bg-gradient-to-tr from-blue-300 via-indigo-200 to-purple-300" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs font-semibold shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-spin" style={{ animationDuration: '4s' }} />
              <span>Next-Gen Placement Preparation Platform</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
              Practice Smarter.{' '}
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Interview Better.
              </span>{' '}
              Get Hired.
            </h1>

            <p className="text-lg sm:text-xl text-slate-600 leading-relaxed font-normal">
              An AI-powered interview preparation platform designed for college students, fresh graduates, and job seekers. Practice real voice interviews tailored to your exact resume, projects, and target roles.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <button
                onClick={() => onNavigate(user ? 'interview-config' : 'register')}
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-md shadow-indigo-500/25 active:scale-95 transition flex items-center justify-center space-x-2 text-base"
              >
                <span>{user ? 'Start AI Interview Now' : 'Get Started Free'}</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <a
                href="#features"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-xs transition text-center text-base"
              >
                Explore Features
              </a>
            </div>

            {/* Fast Demo Credentials helper */}
            <div className="pt-4 flex items-center justify-center space-x-2 text-xs text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Pre-loaded demo student profile ready for instant testing:</span>
              <button
                onClick={() => onNavigate('login')}
                className="font-semibold text-indigo-600 hover:underline"
              >
                alex.carter@example.com (Password123!)
              </button>
            </div>
          </div>

          {/* Interactive Hero Illustration Card */}
          <div className="mt-14 max-w-4xl mx-auto rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 sm:p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Window bar */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-rose-500" />
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="ml-2 text-xs text-slate-400 font-mono">live-mock-session.ai</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-xs text-emerald-400 font-medium">AI Interviewer Active</span>
              </div>
            </div>

            {/* Simulated Live Interview Dialogue */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              {/* Interviewer Box */}
              <div className="md:col-span-2 space-y-4">
                <div className="flex items-start space-x-3 bg-slate-800/80 p-4 rounded-2xl border border-slate-700/80">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shrink-0">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-xs font-bold text-indigo-400 uppercase tracking-wide">AI Senior Interviewer</span>
                      <span className="text-[10px] bg-indigo-950 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-800">
                        Technical • Medium
                      </span>
                    </div>
                    <p className="text-sm text-slate-200 font-medium leading-relaxed">
                      "I noticed on your resume you built a Healthcare ML diagnostic API. How did you structure your model evaluation to prevent data leakage between training and cross-validation folds?"
                    </p>
                  </div>
                </div>

                {/* Candidate Speech Box */}
                <div className="flex items-start space-x-3 bg-indigo-950/40 p-4 rounded-2xl border border-indigo-900/60">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center shrink-0 text-white font-bold text-sm">
                    AC
                  </div>
                  <div className="w-full">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-300">Candidate Live Speech</span>
                      <span className="flex items-center space-x-1 text-[10px] text-emerald-400 font-mono">
                        <Mic className="w-3 h-3 animate-pulse" />
                        <span>Transcribing Audio...</span>
                      </span>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed italic">
                      "We strictly applied Stratified K-Fold splitting before any imputation or feature scaling occurred, ensuring no data from the test fold informed normalization parameters..."
                    </p>
                  </div>
                </div>
              </div>

              {/* Instant Evaluation Card */}
              <div className="bg-slate-800/90 rounded-2xl p-5 border border-slate-700 space-y-4">
                <div className="text-center">
                  <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Live Score Metric</span>
                  <div className="text-4xl font-extrabold text-emerald-400 mt-1">92<span className="text-base text-slate-400 font-normal">/100</span></div>
                  <span className="inline-block mt-1 text-[11px] font-semibold bg-emerald-950 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-800">
                    High Placement Probability
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <div className="flex justify-between text-slate-400 mb-1">
                      <span>Technical Depth</span>
                      <span className="text-slate-200 font-semibold">94%</span>
                    </div>
                    <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-blue-500 h-full rounded-full w-[94%]" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-slate-400 mb-1">
                      <span>STAR Communication</span>
                      <span className="text-slate-200 font-semibold">90%</span>
                    </div>
                    <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-indigo-400 h-full rounded-full w-[90%]" />
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onNavigate(user ? 'interview-config' : 'login')}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1"
                >
                  <span>Try It Yourself</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Social Proof Stats */}
          <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
              <p className="text-3xl font-extrabold text-indigo-600">15,000+</p>
              <p className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wider">Interviews Completed</p>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
              <p className="text-3xl font-extrabold text-blue-600">92%</p>
              <p className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wider">Placement Readiness</p>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
              <p className="text-3xl font-extrabold text-purple-600">10+ Roles</p>
              <p className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wider">Tech & HR Domains</p>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
              <p className="text-3xl font-extrabold text-emerald-600">100%</p>
              <p className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wider">Objective AI Scoring</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <h2 className="text-xs font-bold text-indigo-600 uppercase tracking-widest">
              Core Capabilities
            </h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Engineered for Real Placement Success
            </p>
            <p className="text-base text-slate-600">
              Unlike generic questionnaires, our system personalizes every single inquiry to your individual resume and academic projects.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:shadow-md transition space-y-3">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Resume-Based AI Questioning</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Upload your PDF resume. Gemini extracts your exact technical skills, frameworks, and projects to challenge you on your actual claimed experience.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:shadow-md transition space-y-3">
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                <Mic className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Voice-Powered Speech Interaction</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Speak your answers naturally using browser speech recognition. Practice verbal articulation and receive feedback on communication structure.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:shadow-md transition space-y-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">7-Point Objective Evaluation</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Every answer is rigorously scored on Technical Correctness, Communication, Problem Solving, Relevance, and Clarity with sample ideal answers.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:shadow-md transition space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Adaptive AI Follow-Ups</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Simulates real interview pressure: if an answer lacks depth or mentions an architectural choice, the AI interviewer probes your reasoning in real time.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:shadow-md transition space-y-3">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <BarChart2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Performance Analytics & Radar</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Track historical progress across Technical, HR, and Behavioral rounds with interactive Recharts radar graphs and longitudinal score trends.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:shadow-md transition space-y-3">
              <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Actionable Study Roadmap</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Receive customized weekly roadmaps highlighting exact topics, algorithms, and design patterns to study before attending actual campus drives.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-slate-50 border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <h2 className="text-xs font-bold text-indigo-600 uppercase tracking-widest">
              Simple 4-Step Process
            </h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              How the System Works
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs relative">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center mb-4 text-base">
                1
              </div>
              <h4 className="font-bold text-slate-900 text-base mb-2">Build Profile & Resume</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Add your technical skills, college department, and upload your PDF resume for automatic AI extraction.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs relative">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center mb-4 text-base">
                2
              </div>
              <h4 className="font-bold text-slate-900 text-base mb-2">Configure Mock Interview</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Select your target job role, interview type (Technical, HR, Behavioral), difficulty, and question count.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs relative">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center mb-4 text-base">
                3
              </div>
              <h4 className="font-bold text-slate-900 text-base mb-2">Live Voice Interaction</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Listen to the AI question, click the microphone, articulate your answer, review the transcript, and submit.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs relative">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center mb-4 text-base">
                4
              </div>
              <h4 className="font-bold text-slate-900 text-base mb-2">Get Evaluated & Roadmap</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Review calibrated scores, strengths, weaknesses, improved sample answers, and download your comprehensive PDF report.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section id="why-us" className="py-20 bg-white border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">
                The Placement Edge
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Why Students & Job Seekers Love AI Mock Interview
              </h2>
              <p className="text-slate-600 leading-relaxed">
                Traditional interview prep relies on memorizing static leetcode questions or awkward peer roleplay. Our AI interviewer acts as an unbiased senior engineering director with infinite patience.
              </p>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Zero Nervousness in Real Drives</h4>
                    <p className="text-xs text-slate-600">Build verbal muscle memory so speaking under pressure feels natural and calm.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Actual Ideal Model Answers</h4>
                    <p className="text-xs text-slate-600">See how top FAANG engineers would answer each question you were asked.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">100% Private Academic Evaluation</h4>
                    <p className="text-xs text-slate-600">Your recordings and session reports are encrypted and accessible only to you.</p>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => onNavigate(user ? 'interview-config' : 'register')}
                  className="px-6 py-3 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-500/20 transition flex items-center space-x-2"
                >
                  <span>Start Your First Mock Interview</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200/90 rounded-3xl p-8 shadow-sm space-y-6">
              <div className="flex items-center space-x-4 border-b border-slate-200 pb-5">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg">
                  🎓
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">Academic Project Showcase</h4>
                  <p className="text-xs text-slate-500">B.Tech Artificial Intelligence & Data Science</p>
                </div>
              </div>

              <div className="space-y-3 text-xs text-slate-600">
                <p>
                  Developed as a comprehensive full-stack AI evaluation engine. Bridges the gap between collegiate textbook learning and industry hiring standards.
                </p>
                <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium text-slate-500">AI Architecture:</span>
                    <span className="font-semibold text-slate-800">Google Gemini 3.8 Flash</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-slate-500">Database Layer:</span>
                    <span className="font-semibold text-slate-800">MongoDB / Persistent Store</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-slate-500">Voice Recognition:</span>
                    <span className="font-semibold text-slate-800">HTML5 Web Speech API</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-slate-500">Security:</span>
                    <span className="font-semibold text-slate-800">JWT + Bcrypt Hashing</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="py-16 bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to Ace Your Next Technical & HR Interview?
          </h2>
          <p className="text-indigo-100 text-base max-w-2xl mx-auto">
            Join thousands of college candidates preparing for campus recruitment drives with realistic AI simulation.
          </p>
          <div className="pt-2">
            <button
              onClick={() => onNavigate(user ? 'interview-config' : 'register')}
              className="px-8 py-3.5 bg-white text-indigo-700 font-bold rounded-xl hover:bg-slate-100 shadow-lg shadow-black/10 transition active:scale-95"
            >
              Get Started Right Now
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
