import React, { useState, useEffect, useRef } from 'react';
import {
  User,
  Mail,
  Phone,
  Calendar,
  GraduationCap,
  Building,
  Code2,
  FileText,
  Upload,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  Sparkles,
  Camera,
  Layers,
  Briefcase,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import { UserProfile, ProjectItem, ExperienceItem } from '../types';

interface ProfilePageProps {
  onNavigate: (page: string) => void;
}

const COMMON_SKILLS = [
  'Data Structures & Algorithms',
  'Object-Oriented Programming',
  'React.js',
  'Node.js',
  'Express.js',
  'Python',
  'Java',
  'SQL & Database Indexing',
  'MongoDB',
  'RESTful APIs',
  'System Design',
  'Machine Learning',
  'FastAPI',
  'Docker',
  'Git & GitHub',
];

const COMMON_LANGUAGES = [
  'Python',
  'JavaScript',
  'TypeScript',
  'Java',
  'C++',
  'C',
  'SQL',
  'Go',
  'HTML/CSS',
];

export const ProfilePage: React.FC<ProfilePageProps> = ({ onNavigate }) => {
  const { user, profile, setProfileState, refreshProfile } = useAuth();
  const toast = useToast();

  const [formData, setFormData] = useState<Partial<UserProfile>>({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: '',
    dateOfBirth: '',
    college: '',
    qualification: 'B.Tech / B.E.',
    department: 'Computer Science & Engineering',
    graduationYear: '2026',
    technicalSkills: [],
    programmingLanguages: [],
    projects: [],
    internships: [],
    workExperience: [],
  });

  const [newSkill, setNewSkill] = useState('');
  const [newLanguage, setNewLanguage] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [uploadingPicture, setUploadingPicture] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const pictureInputRef = useRef<HTMLInputElement>(null);

  // Sync state when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.fullName || user?.name || '',
        email: profile.email || user?.email || '',
        phone: profile.phone || '',
        dateOfBirth: profile.dateOfBirth || '',
        college: profile.college || '',
        qualification: profile.qualification || 'B.Tech / B.E.',
        department: profile.department || 'Computer Science & Engineering',
        graduationYear: profile.graduationYear || '2026',
        technicalSkills: profile.technicalSkills || [],
        programmingLanguages: profile.programmingLanguages || [],
        projects: profile.projects || [],
        internships: profile.internships || [],
        workExperience: profile.workExperience || [],
        resumeFileName: profile.resumeFileName,
        resumeUrl: profile.resumeUrl,
        resumeExtractedText: profile.resumeExtractedText,
        profileImageUrl: profile.profileImageUrl,
      });
    }
  }, [profile, user]);

  const handleSaveProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      setSaving(true);
      const res = await api.profile.update(formData);
      setProfileState(res.profile);
      toast.success('Profile saved and persisted to database!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save profile.');
    } finally {
      setSaving(false);
    }
  };

  // Picture upload handler
  const handlePictureChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (PNG, JPG, WebP).');
      return;
    }

    try {
      setUploadingPicture(true);
      const res = await api.profile.uploadPicture(file);
      setProfileState(res.profile);
      setFormData(prev => ({ ...prev, profileImageUrl: res.profile.profileImageUrl }));
      toast.success('Profile picture updated successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to upload photo.');
    } finally {
      setUploadingPicture(false);
    }
  };

  // Resume upload handler
  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      toast.error('Please upload a PDF format resume.');
      return;
    }

    try {
      setUploadingResume(true);
      toast.info('Extracting skills, projects, and text from PDF using AI...');
      const res = await api.profile.uploadResume(file);
      setProfileState(res.profile);
      setFormData(prev => ({
        ...prev,
        resumeFileName: res.profile.resumeFileName,
        resumeUrl: res.profile.resumeUrl,
        resumeExtractedText: res.profile.resumeExtractedText,
        technicalSkills: res.profile.technicalSkills,
      }));
      toast.success('Resume parsed! Extracted skills have been added to your profile.');
    } catch (err: any) {
      toast.error(err.message || 'Failed to process resume.');
    } finally {
      setUploadingResume(false);
    }
  };

  // Skill toggles
  const handleToggleSkill = (skill: string) => {
    const current = formData.technicalSkills || [];
    if (current.includes(skill)) {
      setFormData(prev => ({ ...prev, technicalSkills: current.filter(s => s !== skill) }));
    } else {
      setFormData(prev => ({ ...prev, technicalSkills: [...current, skill] }));
    }
  };

  const handleAddCustomSkill = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    e.preventDefault();
    if (!newSkill.trim()) return;
    const current = formData.technicalSkills || [];
    if (!current.includes(newSkill.trim())) {
      setFormData(prev => ({ ...prev, technicalSkills: [...current, newSkill.trim()] }));
    }
    setNewSkill('');
  };

  // Language toggles
  const handleToggleLanguage = (lang: string) => {
    const current = formData.programmingLanguages || [];
    if (current.includes(lang)) {
      setFormData(prev => ({ ...prev, programmingLanguages: current.filter(l => l !== lang) }));
    } else {
      setFormData(prev => ({ ...prev, programmingLanguages: [...current, lang] }));
    }
  };

  const handleAddCustomLanguage = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    e.preventDefault();
    if (!newLanguage.trim()) return;
    const current = formData.programmingLanguages || [];
    if (!current.includes(newLanguage.trim())) {
      setFormData(prev => ({ ...prev, programmingLanguages: [...current, newLanguage.trim()] }));
    }
    setNewLanguage('');
  };

  // Projects management
  const handleAddProject = () => {
    const newProj: ProjectItem = {
      id: `proj_${Date.now()}`,
      title: 'New Technical Project',
      description: 'Describe the problem statement, architecture, and impact.',
      technologies: ['Python', 'SQL'],
    };
    setFormData(prev => ({ ...prev, projects: [...(prev.projects || []), newProj] }));
  };

  const handleUpdateProject = (id: string, field: keyof ProjectItem, value: any) => {
    setFormData(prev => ({
      ...prev,
      projects: (prev.projects || []).map(p => (p.id === id ? { ...p, [field]: value } : p)),
    }));
  };

  const handleDeleteProject = (id: string) => {
    setFormData(prev => ({
      ...prev,
      projects: (prev.projects || []).filter(p => p.id !== id),
    }));
  };

  // Internship management
  const handleAddInternship = () => {
    const newExp: ExperienceItem = {
      id: `exp_${Date.now()}`,
      company: 'Tech Company / Startup',
      role: 'Software Intern',
      duration: '3 Months (Summer 2025)',
      description: 'Worked on feature implementation, code reviews, and testing.',
    };
    setFormData(prev => ({ ...prev, internships: [...(prev.internships || []), newExp] }));
  };

  const handleUpdateInternship = (id: string, field: keyof ExperienceItem, value: any) => {
    setFormData(prev => ({
      ...prev,
      internships: (prev.internships || []).map(e => (e.id === id ? { ...e, [field]: value } : e)),
    }));
  };

  const handleDeleteInternship = (id: string) => {
    setFormData(prev => ({
      ...prev,
      internships: (prev.internships || []).filter(e => e.id !== id),
    }));
  };

  const completion = profile?.completionPercentage || 40;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Candidate Profile & Placement Resume
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Personalize your AI mock interviews by keeping your skills, university credentials, and projects up to date.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => onNavigate('interview-config')}
            className="px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-sm font-bold transition flex items-center space-x-1.5"
          >
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>Practice Interview</span>
          </button>
          <button
            onClick={() => handleSaveProfile()}
            disabled={saving}
            className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-sm font-bold shadow-md shadow-indigo-500/20 transition flex items-center space-x-2 disabled:opacity-60"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Profile'}</span>
          </button>
        </div>
      </div>

      {/* Profile Completion Card */}
      <div className="bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 rounded-3xl p-6 text-white shadow-lg shadow-indigo-500/15 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center space-x-2">
            <span className="text-xs uppercase tracking-wider font-extrabold bg-white/20 px-2.5 py-0.5 rounded-full">
              Placement Readiness
            </span>
            <span className="text-xs text-indigo-100">
              {completion === 100 ? 'All parameters complete!' : `${100 - completion}% more to unlock highest AI accuracy`}
            </span>
          </div>
          <h3 className="text-xl font-bold">
            Profile Completion: {completion}%
          </h3>
          <p className="text-xs text-indigo-100 leading-relaxed">
            The Gemini interviewer personalizes question difficulty, edge-cases, and architecture challenges using your uploaded resume and projects.
          </p>
        </div>

        <div className="w-full sm:w-48 shrink-0">
          <div className="w-full bg-white/20 h-3 rounded-full overflow-hidden mb-2">
            <div
              className="bg-white h-full rounded-full transition-all duration-700"
              style={{ width: `${completion}%` }}
            />
          </div>
          <span className="text-[11px] text-white/90 block text-right font-medium">
            {completion}% Completed
          </span>
        </div>
      </div>

      <form onSubmit={handleSaveProfile} className="space-y-8">
        {/* Section 1: Basic Information & Photo */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center space-x-3 border-b border-slate-100 pb-4">
            <User className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-slate-900">Personal Information</h2>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Avatar */}
            <div className="relative group shrink-0">
              <div className="w-24 h-24 rounded-full bg-indigo-100 border-2 border-indigo-200 flex items-center justify-center overflow-hidden shadow-inner text-indigo-700 text-2xl font-bold">
                {formData.profileImageUrl ? (
                  <img
                    src={formData.profileImageUrl}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  (formData.fullName || user?.name || 'A').charAt(0).toUpperCase()
                )}
              </div>
              <button
                type="button"
                onClick={() => pictureInputRef.current?.click()}
                disabled={uploadingPicture}
                className="absolute bottom-0 right-0 p-2 rounded-full bg-indigo-600 text-white shadow-md hover:bg-indigo-700 transition"
                title="Change Photo"
              >
                <Camera className="w-4 h-4" />
              </button>
              <input
                ref={pictureInputRef}
                type="file"
                accept="image/*"
                onChange={handlePictureChange}
                className="hidden"
              />
            </div>

            {/* Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Alex Carter"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Email Address (Verified)
                </label>
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 (555) 234-5678"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Date of Birth (Optional)
                </label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={e => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Education & Academic Details */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center space-x-3 border-b border-slate-100 pb-4">
            <GraduationCap className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-slate-900">Academic & Educational Qualifications</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                College / University Name
              </label>
              <input
                type="text"
                value={formData.college}
                onChange={e => setFormData({ ...formData, college: e.target.value })}
                placeholder="Apex Institute of Technology"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Degree / Qualification
              </label>
              <input
                type="text"
                value={formData.qualification}
                onChange={e => setFormData({ ...formData, qualification: e.target.value })}
                placeholder="B.Tech, B.E., MCA, B.Sc"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Department / Specialization
              </label>
              <input
                type="text"
                value={formData.department}
                onChange={e => setFormData({ ...formData, department: e.target.value })}
                placeholder="Artificial Intelligence & Data Science"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Graduation Year
              </label>
              <input
                type="text"
                value={formData.graduationYear}
                onChange={e => setFormData({ ...formData, graduationYear: e.target.value })}
                placeholder="2026"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Resume PDF Upload & AI Analysis */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center space-x-3">
              <FileText className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-bold text-slate-900">Resume Upload & AI Parsing</h2>
            </div>
            <span className="text-xs bg-indigo-50 text-indigo-700 font-semibold px-2.5 py-1 rounded-full border border-indigo-100">
              PDF Format
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
            <div className="lg:col-span-2">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-indigo-500 bg-slate-50/70 hover:bg-indigo-50/20 rounded-2xl p-6 text-center cursor-pointer transition group"
              >
                <div className="mx-auto w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Upload className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-slate-800">
                  {uploadingResume ? 'Analyzing Resume with Gemini AI...' : 'Click to Upload or Drag and Drop Resume'}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Supported format: PDF up to 10MB. Text will be parsed automatically.
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf,.pdf"
                  onChange={handleResumeUpload}
                  className="hidden"
                />
              </div>
            </div>

            {/* Current Resume Status */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Attached Resume
              </span>
              {formData.resumeFileName ? (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm font-semibold text-slate-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="truncate">{formData.resumeFileName}</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {formData.resumeExtractedText
                      ? `Extracted ${formData.resumeExtractedText.length} characters of readable text.`
                      : 'Resume uploaded.'}
                  </p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs font-bold text-indigo-600 hover:underline"
                  >
                    Replace Resume PDF
                  </button>
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">
                  No resume attached yet. Upload a PDF to automatically generate personalized interview questions based on your resume projects.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Section 4: Technical Skills & Languages */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center space-x-3 border-b border-slate-100 pb-4">
            <Code2 className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-slate-900">Technical Skills & Programming Languages</h2>
          </div>

          {/* Technical Skills */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Technical Concepts & Frameworks
            </label>
            <div className="flex flex-wrap gap-2">
              {COMMON_SKILLS.map(skill => {
                const isSelected = (formData.technicalSkills || []).includes(skill);
                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => handleToggleSkill(skill)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {skill} {isSelected ? '✓' : '+'}
                  </button>
                );
              })}
            </div>

            {/* Custom Skill Input */}
            <div className="flex items-center space-x-2 pt-2">
              <input
                type="text"
                value={newSkill}
                onChange={e => setNewSkill(e.target.value)}
                onKeyDown={handleAddCustomSkill}
                placeholder="Add custom skill (e.g. GraphQL, Kubernetes)..."
                className="w-full sm:w-80 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={handleAddCustomSkill}
                className="px-3.5 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-900 transition flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
          </div>

          {/* Programming Languages */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Programming Languages
            </label>
            <div className="flex flex-wrap gap-2">
              {COMMON_LANGUAGES.map(lang => {
                const isSelected = (formData.programmingLanguages || []).includes(lang);
                return (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => handleToggleLanguage(lang)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                      isSelected
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {lang} {isSelected ? '✓' : '+'}
                  </button>
                );
              })}
            </div>

            {/* Custom Language Input */}
            <div className="flex items-center space-x-2 pt-2">
              <input
                type="text"
                value={newLanguage}
                onChange={e => setNewLanguage(e.target.value)}
                onKeyDown={handleAddCustomLanguage}
                placeholder="Add custom language (e.g. Rust, Kotlin)..."
                className="w-full sm:w-80 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                type="button"
                onClick={handleAddCustomLanguage}
                className="px-3.5 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-900 transition flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
          </div>
        </div>

        {/* Section 5: Projects */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center space-x-3">
              <Layers className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-bold text-slate-900">Key Technical Projects</h2>
            </div>
            <button
              type="button"
              onClick={handleAddProject}
              className="px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl text-xs font-bold transition flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Project</span>
            </button>
          </div>

          <div className="space-y-4">
            {(formData.projects || []).map(p => (
              <div key={p.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <input
                    type="text"
                    value={p.title}
                    onChange={e => handleUpdateProject(p.id, 'title', e.target.value)}
                    placeholder="Project Title"
                    className="font-bold text-sm bg-transparent border-b border-slate-300 focus:border-indigo-600 focus:outline-none w-full max-w-md pb-0.5"
                  />
                  <button
                    type="button"
                    onClick={() => handleDeleteProject(p.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <textarea
                  value={p.description}
                  onChange={e => handleUpdateProject(p.id, 'description', e.target.value)}
                  placeholder="Describe the architecture, features, algorithms used, and results..."
                  rows={2}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <input
                  type="text"
                  value={p.technologies.join(', ')}
                  onChange={e =>
                    handleUpdateProject(
                      p.id,
                      'technologies',
                      e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                    )
                  }
                  placeholder="Technologies used (comma separated, e.g. React, Node.js, MongoDB)..."
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            ))}

            {(formData.projects || []).length === 0 && (
              <p className="text-xs text-slate-400 text-center py-4 italic">
                No projects added yet. Click "+ Add Project" to give the AI real projects to ask you about.
              </p>
            )}
          </div>
        </div>

        {/* Section 6: Internships & Work Experience */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center space-x-3">
              <Briefcase className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-bold text-slate-900">Internships & Professional Experience</h2>
            </div>
            <button
              type="button"
              onClick={handleAddInternship}
              className="px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl text-xs font-bold transition flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Internship</span>
            </button>
          </div>

          <div className="space-y-4">
            {(formData.internships || []).map(exp => (
              <div key={exp.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full max-w-2xl">
                    <input
                      type="text"
                      value={exp.company}
                      onChange={e => handleUpdateInternship(exp.id, 'company', e.target.value)}
                      placeholder="Company Name"
                      className="font-bold text-sm bg-transparent border-b border-slate-300 focus:border-indigo-600 focus:outline-none pb-0.5"
                    />
                    <input
                      type="text"
                      value={exp.role}
                      onChange={e => handleUpdateInternship(exp.id, 'role', e.target.value)}
                      placeholder="Role (e.g. AI Intern)"
                      className="text-xs text-slate-700 bg-transparent border-b border-slate-300 focus:border-indigo-600 focus:outline-none pb-0.5"
                    />
                    <input
                      type="text"
                      value={exp.duration}
                      onChange={e => handleUpdateInternship(exp.id, 'duration', e.target.value)}
                      placeholder="Duration (e.g. 3 Months)"
                      className="text-xs text-slate-500 bg-transparent border-b border-slate-300 focus:border-indigo-600 focus:outline-none pb-0.5"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteInternship(exp.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <textarea
                  value={exp.description}
                  onChange={e => handleUpdateInternship(exp.id, 'description', e.target.value)}
                  placeholder="Key responsibilities, tools utilized, and outcomes delivered..."
                  rows={2}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            ))}

            {(formData.internships || []).length === 0 && (
              <p className="text-xs text-slate-400 text-center py-4 italic">
                No internships recorded. Fresh graduates can highlight academic lab work or capstone projects.
              </p>
            )}
          </div>
        </div>

        {/* Bottom Save Bar */}
        <div className="sticky bottom-6 z-30 p-4 rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200 shadow-xl flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs text-slate-500">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Changes persist securely in your database account.</span>
          </div>
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => onNavigate('dashboard')}
              className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50 transition"
            >
              Back to Dashboard
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-500/20 transition flex items-center space-x-2 disabled:opacity-60"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving Profile...' : 'Save Profile Details'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
