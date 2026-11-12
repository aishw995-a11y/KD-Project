import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import {
  User,
  UserProfile,
  InterviewSession,
  EvaluationReport
} from './models.js';

interface DatabaseData {
  users: User[];
  profiles: UserProfile[];
  interviews: InterviewSession[];
  evaluations: EvaluationReport[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure data folder exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

let isMongoConnected = false;

// Initialize MongoDB if connection string exists
export async function initMongo(): Promise<boolean> {
  const uri = process.env.MONGODB_URI;
  if (!uri || uri.includes('username:password')) {
    console.log('[DB] No valid MONGODB_URI found. Using durable local JSON persistence (data/db.json).');
    return false;
  }
  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    isMongoConnected = true;
    console.log('[DB] Successfully connected to MongoDB Atlas.');
    return true;
  } catch (err) {
    console.warn('[DB] MongoDB connection failed. Falling back to local persistent JSON store:', (err as Error).message);
    isMongoConnected = false;
    return false;
  }
}

// Local Database Helper
function readLocalDb(): DatabaseData {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const initialData: DatabaseData = {
        users: [],
        profiles: [],
        interviews: [],
        evaluations: []
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
      return initialData;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw) as DatabaseData;
  } catch (err) {
    console.error('[DB] Error reading local db:', err);
    return { users: [], profiles: [], interviews: [], evaluations: [] };
  }
}

function writeLocalDb(data: DatabaseData): void {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('[DB] Error saving local db:', err);
  }
}

// Seed initial demo data if empty
export async function seedDemoData(): Promise<void> {
  const db = readLocalDb();
  if (db.users.length === 0) {
    console.log('[DB] Seeding demo student user...');
    const salt = await bcrypt.genSalt(10);
    const demoPasswordHash = await bcrypt.hash('Password123!', salt);
    const demoUser: User = {
      id: 'usr_demo_1001',
      name: 'Alex Carter',
      email: 'alex.carter@example.com',
      passwordHash: demoPasswordHash,
      createdAt: new Date().toISOString()
    };

    const demoProfile: UserProfile = {
      userId: demoUser.id,
      fullName: 'Alex Carter',
      email: 'alex.carter@example.com',
      phone: '+1 (555) 234-5678',
      dateOfBirth: '2002-05-18',
      college: 'Apex Institute of Technology',
      qualification: 'B.Tech in Artificial Intelligence & Data Science',
      department: 'AI & Data Science',
      graduationYear: '2026',
      technicalSkills: ['Python', 'Machine Learning', 'React.js', 'Node.js', 'SQL', 'FastAPI', 'Data Structures & Algorithms', 'PyTorch'],
      programmingLanguages: ['Python', 'JavaScript', 'TypeScript', 'C++', 'SQL'],
      projects: [
        {
          id: 'proj_1',
          title: 'Healthcare Predictive Diagnostic Assistant',
          description: 'Built a predictive machine learning pipeline using Random Forest and XGBoost with 92% diagnostic accuracy deployed as a REST API.',
          technologies: ['Python', 'Scikit-Learn', 'FastAPI', 'Docker']
        },
        {
          id: 'proj_2',
          title: 'Full Stack Collaborative Workspace',
          description: 'Developed an interactive dashboard with real-time websocket task synchronization and role-based permissions.',
          technologies: ['React', 'Node.js', 'Express', 'MongoDB']
        }
      ],
      internships: [
        {
          id: 'exp_1',
          company: 'Cognitive Insights Lab',
          role: 'AI / ML Intern',
          duration: 'June 2025 - August 2025 (3 months)',
          description: 'Automated document processing pipelines and fine-tuned embeddings for knowledge retrieval, speeding up search by 40%.'
        }
      ],
      workExperience: [],
      resumeFileName: 'Alex_Carter_Resume.pdf',
      resumeExtractedText: 'Alex Carter - AI & Data Science Candidate. Strong in Python, Machine Learning, React, REST APIs, SQL, Data Structures. Experience with LLM integration, Scikit-Learn, and full-stack development.',
      completionPercentage: 95,
      updatedAt: new Date().toISOString()
    };

    db.users.push(demoUser);
    db.profiles.push(demoProfile);
    writeLocalDb(db);
    console.log('[DB] Demo student seeded: alex.carter@example.com / Password123!');
  }
}

// Repository Methods
export const dbRepository = {
  // Users
  async createUser(user: User): Promise<User> {
    const db = readLocalDb();
    db.users.push(user);
    writeLocalDb(db);
    return user;
  },

  async findUserByEmail(email: string): Promise<User | null> {
    const db = readLocalDb();
    const normalized = email.toLowerCase().trim();
    const user = db.users.find(u => u.email.toLowerCase() === normalized);
    return user || null;
  },

  async findUserById(id: string): Promise<User | null> {
    const db = readLocalDb();
    const user = db.users.find(u => u.id === id);
    return user || null;
  },

  async updateUserPassword(id: string, newPasswordHash: string): Promise<boolean> {
    const db = readLocalDb();
    const user = db.users.find(u => u.id === id);
    if (!user) return false;
    user.passwordHash = newPasswordHash;
    writeLocalDb(db);
    return true;
  },

  // Profiles
  async getProfileByUserId(userId: string): Promise<UserProfile | null> {
    const db = readLocalDb();
    const profile = db.profiles.find(p => p.userId === userId);
    return profile || null;
  },

  async upsertProfile(profile: UserProfile): Promise<UserProfile> {
    const db = readLocalDb();
    const index = db.profiles.findIndex(p => p.userId === profile.userId);
    profile.updatedAt = new Date().toISOString();
    
    // Auto-calculate completion percentage
    let score = 20; // base for registration
    if (profile.fullName && profile.phone) score += 10;
    if (profile.college && profile.qualification) score += 15;
    if (profile.technicalSkills && profile.technicalSkills.length > 0) score += 15;
    if (profile.programmingLanguages && profile.programmingLanguages.length > 0) score += 10;
    if (profile.projects && profile.projects.length > 0) score += 15;
    if (profile.internships && profile.internships.length > 0) score += 5;
    if (profile.resumeFileName || profile.resumeExtractedText) score += 10;
    profile.completionPercentage = Math.min(100, score);

    if (index >= 0) {
      db.profiles[index] = profile;
    } else {
      db.profiles.push(profile);
    }
    writeLocalDb(db);
    return profile;
  },

  // Interviews
  async createInterview(interview: InterviewSession): Promise<InterviewSession> {
    const db = readLocalDb();
    db.interviews.push(interview);
    writeLocalDb(db);
    return interview;
  },

  async getInterviewById(id: string): Promise<InterviewSession | null> {
    const db = readLocalDb();
    const item = db.interviews.find(i => i.id === id);
    return item || null;
  },

  async updateInterview(id: string, updates: Partial<InterviewSession>): Promise<InterviewSession | null> {
    const db = readLocalDb();
    const index = db.interviews.findIndex(i => i.id === id);
    if (index === -1) return null;
    db.interviews[index] = { ...db.interviews[index], ...updates };
    writeLocalDb(db);
    return db.interviews[index];
  },

  async getInterviewsByUserId(userId: string): Promise<InterviewSession[]> {
    const db = readLocalDb();
    return db.interviews
      .filter(i => i.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  // Evaluations
  async createEvaluation(evalReport: EvaluationReport): Promise<EvaluationReport> {
    const db = readLocalDb();
    const existingIndex = db.evaluations.findIndex(e => e.interviewId === evalReport.interviewId);
    if (existingIndex >= 0) {
      db.evaluations[existingIndex] = evalReport;
    } else {
      db.evaluations.push(evalReport);
    }
    writeLocalDb(db);
    return evalReport;
  },

  async getEvaluationById(id: string): Promise<EvaluationReport | null> {
    const db = readLocalDb();
    const item = db.evaluations.find(e => e.id === id);
    return item || null;
  },

  async getEvaluationByInterviewId(interviewId: string): Promise<EvaluationReport | null> {
    const db = readLocalDb();
    const item = db.evaluations.find(e => e.interviewId === interviewId);
    return item || null;
  },

  async getEvaluationsByUserId(userId: string): Promise<EvaluationReport[]> {
    const db = readLocalDb();
    return db.evaluations
      .filter(e => e.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  getStatus() {
    return {
      mongoConnected: isMongoConnected,
      storageType: isMongoConnected ? 'MongoDB Atlas' : 'Local JSON Store (Persistent)',
      dataPath: DB_FILE
    };
  }
};
