import {
  UserProfile,
  InterviewSession,
  EvaluationReport,
  AnalyticsSummary,
} from '../types';

const TOKEN_KEY = 'ai_interview_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeStoredToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers = new Headers(options.headers || {});

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // If not FormData, default content-type to application/json
  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = 'An unexpected error occurred.';
    try {
      const errorData = await response.json();
      errorMsg = errorData.error || errorData.message || errorMsg;
    } catch {
      errorMsg = response.statusText || errorMsg;
    }
    throw new Error(errorMsg);
  }

  return response.json();
}

export const api = {
  auth: {
    login: (credentials: { email: string; password: string }) =>
      request<{ message: string; token: string; user: { id: string; name: string; email: string } }>(
        '/api/auth/login',
        { method: 'POST', body: JSON.stringify(credentials) }
      ),

    register: (userData: { name: string; email: string; password: string; confirmPassword: string }) =>
      request<{ message: string; token: string; user: { id: string; name: string; email: string } }>(
        '/api/auth/register',
        { method: 'POST', body: JSON.stringify(userData) }
      ),

    getMe: () =>
      request<{ user: { id: string; name: string; email: string; createdAt: string } }>('/api/auth/me'),

    changePassword: (passwords: { currentPassword: string; newPassword: string; confirmPassword: string }) =>
      request<{ message: string }>('/api/auth/change-password', {
        method: 'POST',
        body: JSON.stringify(passwords),
      }),

    forgotPassword: (email: string) =>
      request<{ message: string; demoResetCode?: string; instruction?: string }>('/api/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      }),

    resetPassword: (payload: { email: string; newPassword: string; confirmPassword: string }) =>
      request<{ message: string }>('/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
  },

  profile: {
    get: () => request<{ profile: UserProfile }>('/api/profile'),

    update: (profileData: Partial<UserProfile>) =>
      request<{ message: string; profile: UserProfile }>('/api/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData),
      }),

    uploadPicture: (file?: File, imageBase64?: string) => {
      if (file) {
        const formData = new FormData();
        formData.append('picture', file);
        return request<{ message: string; profile: UserProfile }>('/api/profile/picture', {
          method: 'POST',
          body: formData,
        });
      }
      return request<{ message: string; profile: UserProfile }>('/api/profile/picture', {
        method: 'POST',
        body: JSON.stringify({ imageBase64 }),
      });
    },

    uploadResume: (file?: File, resumeText?: string, resumeFileName?: string) => {
      if (file) {
        const formData = new FormData();
        formData.append('resume', file);
        return request<{ message: string; profile: UserProfile; analysis: any }>('/api/profile/resume', {
          method: 'POST',
          body: formData,
        });
      }
      return request<{ message: string; profile: UserProfile; analysis: any }>('/api/profile/resume', {
        method: 'POST',
        body: JSON.stringify({ resumeText, resumeFileName }),
      });
    },
  },

  interviews: {
    generate: (config: {
      jobRole: string;
      interviewType: string;
      experienceLevel: string;
      difficulty: string;
      questionCount: number;
      durationMinutes?: number;
      useResumePersonalization?: boolean;
    }) =>
      request<{ session: InterviewSession }>('/api/interviews/generate', {
        method: 'POST',
        body: JSON.stringify(config),
      }),

    followUp: (payload: { jobRole: string; originalQuestion: string; userAnswer: string }) =>
      request<{ followUp: string }>('/api/interviews/follow-up', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),

    saveAnswer: (
      interviewId: string,
      answer: {
        questionId: string;
        questionText: string;
        category: string;
        userAnswer: string;
        timeSpentSeconds: number;
        isVoiceInput: boolean;
      }
    ) =>
      request<{ message: string; submittedAnswers: any[] }>(`/api/interviews/${interviewId}/answer`, {
        method: 'POST',
        body: JSON.stringify(answer),
      }),

    complete: (interviewId: string, finalAnswers?: any[]) =>
      request<{ message: string; session: InterviewSession; evaluation: EvaluationReport }>(
        `/api/interviews/${interviewId}/complete`,
        {
          method: 'POST',
          body: JSON.stringify({ finalAnswers }),
        }
      ),

    getHistory: (filters?: { role?: string; type?: string; difficulty?: string }) => {
      const params = new URLSearchParams();
      if (filters?.role) params.append('role', filters.role);
      if (filters?.type) params.append('type', filters.type);
      if (filters?.difficulty) params.append('difficulty', filters.difficulty);
      const query = params.toString() ? `?${params.toString()}` : '';
      return request<{ interviews: InterviewSession[] }>(`/api/interviews/history${query}`);
    },

    getById: (interviewId: string) =>
      request<{ session: InterviewSession; evaluation?: EvaluationReport }>(`/api/interviews/${interviewId}`),
  },

  evaluations: {
    getById: (id: string) =>
      request<{ report: EvaluationReport; interview?: InterviewSession }>(`/api/evaluations/${id}`),

    getByInterviewId: (interviewId: string) =>
      request<{ report: EvaluationReport; interview?: InterviewSession }>(`/api/evaluations/interview/${interviewId}`),

    reEvaluate: (interviewId: string) =>
      request<{ message: string; report: EvaluationReport }>(`/api/evaluations/re-evaluate/${interviewId}`, {
        method: 'POST',
      }),
  },

  analytics: {
    get: () => request<{ analytics: AnalyticsSummary }>('/api/analytics'),
  },

  status: {
    get: () =>
      request<{
        status: string;
        appName: string;
        geminiConfigured: boolean;
        geminiModel: string;
        database: { mongoConnected: boolean; storageType: string };
      }>('/api/status'),
  },
};
