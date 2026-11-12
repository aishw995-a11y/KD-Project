import React from 'react';
import { Bot, Heart, Sparkles, CheckCircle2, ShieldCheck, Github, Linkedin, Mail } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white shadow-md">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold text-lg text-white block leading-tight">
                  AI Mock Interview
                </span>
                <span className="text-[10px] tracking-wider font-semibold text-indigo-400 uppercase">
                  Evaluation System
                </span>
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Empowering students and job seekers with realistic voice interviews, resume-driven questions, and objective AI evaluation.
            </p>
            <div className="flex items-center space-x-2 text-xs text-emerald-400 font-medium bg-emerald-950/60 border border-emerald-800/60 px-3 py-1.5 rounded-full w-fit">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Gemini 3.8 Flash AI Model Active</span>
            </div>
          </div>

          {/* Practice Domains */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-200 mb-4">
              Interview Roles
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>Software Developer / SDE</li>
              <li>Python & Backend Engineer</li>
              <li>Full Stack & Web Developer</li>
              <li>AI / ML & Data Science</li>
              <li>Data Analyst & SQL Specialist</li>
              <li>HR & Behavioral Rounds</li>
            </ul>
          </div>

          {/* Features */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-200 mb-4">
              Key Capabilities
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>Real-time Speech Recognition</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>Resume PDF Parser & Analyzer</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>Multi-Category Scoring Matrix</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>Adaptive Follow-up Inquiries</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>Personalized Learning Roadmap</span>
              </li>
            </ul>
          </div>

          {/* Academic & Project Context */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-200 mb-4">
              Academic Project
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              Designed as a final year B.Tech Artificial Intelligence & Data Science capstone platform to simulate realistic corporate placement drives.
            </p>
            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Stack:</span>
                <span className="font-semibold text-white">MERN + Gemini AI</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Auth:</span>
                <span className="font-semibold text-white">JWT + Bcrypt</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Speech:</span>
                <span className="font-semibold text-white">Web Speech API</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} AI Mock Interview and Evaluation System. All rights reserved.</p>
          <div className="flex items-center space-x-4 mt-4 sm:mt-0">
            <span>Built for student career readiness</span>
            <span>•</span>
            <span className="flex items-center space-x-1 text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Private & Secure Candidate Records</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
