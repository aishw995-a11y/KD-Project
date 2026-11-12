export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}

export interface ProjectItem {
  id: string;
  title: string;
  description: string;
  technologies: string[];
}

export interface ExperienceItem {
  id: string;
  company: string;
  role: string;
  duration: string;
  description: string;
}

export interface UserProfile {
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth?: string;
  college: string;
  qualification: string; // e.g., B.Tech, B.E., BCA, MCA, B.Sc
  department: string; // e.g., Computer Science, AI & DS, IT
  graduationYear: string;
  technicalSkills: string[];
  programmingLanguages: string[];
  projects: ProjectItem[];
  internships: ExperienceItem[];
  workExperience: ExperienceItem[];
  resumeUrl?: string;
  resumeFileName?: string;
  resumeExtractedText?: string;
  profileImageUrl?: string;
  completionPercentage: number;
  updatedAt: string;
}

export interface InterviewQuestion {
  id: string;
  questionNumber: number;
  question: string;
  category: 'Technical' | 'HR' | 'Behavioral' | 'Problem Solving';
  expectedKeyPoints: string[];
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export interface SubmittedAnswer {
  questionId: string;
  questionText: string;
  category: string;
  userAnswer: string;
  timeSpentSeconds: number;
  isVoiceInput: boolean;
}

export interface InterviewSession {
  id: string;
  userId: string;
  jobRole: string;
  interviewType: 'Technical Interview' | 'HR Interview' | 'Behavioral Interview' | 'Mixed Interview';
  experienceLevel: 'Fresher' | 'Intermediate' | 'Experienced';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  totalQuestions: number;
  durationMinutes: number;
  useResumePersonalization: boolean;
  status: 'configured' | 'in-progress' | 'completed';
  createdAt: string;
  completedAt?: string;
  questions: InterviewQuestion[];
  submittedAnswers: SubmittedAnswer[];
}

export interface QuestionFeedback {
  questionId: string;
  questionText: string;
  userAnswer: string;
  score: number; // 0 - 100
  whatWasGood: string;
  whatWasMissing: string;
  areasToImprove: string;
  improvedSampleAnswer: string;
}

export interface CategoryScores {
  technicalKnowledge: number;
  communicationSkills: number;
  problemSolving: number;
  answerRelevance: number;
  clarityAndConfidence: number;
}

export interface EvaluationReport {
  id: string;
  interviewId: string;
  userId: string;
  overallScore: number; // 0 - 100
  performanceLevel: 'Outstanding' | 'Proficient' | 'Needs Improvement' | 'Beginner';
  interviewSummary: string;
  categoryScores: CategoryScores;
  questionEvaluations: QuestionFeedback[];
  strengths: string[];
  weaknesses: string[];
  improvementSuggestions: string[];
  recommendedTopics: string[];
  learningRoadmap: {
    phase: string;
    focus: string;
    actionItems: string[];
  }[];
  createdAt: string;
}

export interface AnalyticsSummary {
  totalInterviews: number;
  averageScore: number;
  highestScore: number;
  totalTimeMinutes: number;
  categoryAverages: CategoryScores;
  scoreTrend: { date: string; score: number; role: string }[];
  rolePerformance: { role: string; count: number; avgScore: number }[];
  recommendedFocus: string[];
}
