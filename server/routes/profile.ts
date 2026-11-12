import { Router, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { PDFParse } from 'pdf-parse';
import { dbRepository } from '../db.js';
import { requireAuth, AuthenticatedRequest } from '../auth.js';
import { analyzeResumeText } from '../gemini.js';
import { UserProfile } from '../models.js';

export const profileRouter = Router();

const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// Get profile
profileRouter.get('/', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    let profile = await dbRepository.getProfileByUserId(userId);

    if (!profile) {
      profile = {
        userId,
        fullName: req.user!.name,
        email: req.user!.email,
        phone: '',
        college: '',
        qualification: '',
        department: '',
        graduationYear: '2026',
        technicalSkills: [],
        programmingLanguages: [],
        projects: [],
        internships: [],
        workExperience: [],
        completionPercentage: 30,
        updatedAt: new Date().toISOString(),
      };
      await dbRepository.upsertProfile(profile);
    }

    res.json({ profile });
  } catch (err) {
    console.error('[Profile] Error getting profile:', err);
    res.status(500).json({ error: 'Failed to retrieve profile.' });
  }
});

// Update profile details
profileRouter.put('/', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const existing = await dbRepository.getProfileByUserId(userId);

    const updatedProfile: UserProfile = {
      userId,
      fullName: req.body.fullName ?? existing?.fullName ?? req.user!.name,
      email: req.user!.email,
      phone: req.body.phone ?? existing?.phone ?? '',
      dateOfBirth: req.body.dateOfBirth ?? existing?.dateOfBirth,
      college: req.body.college ?? existing?.college ?? '',
      qualification: req.body.qualification ?? existing?.qualification ?? '',
      department: req.body.department ?? existing?.department ?? '',
      graduationYear: req.body.graduationYear ?? existing?.graduationYear ?? '',
      technicalSkills: Array.isArray(req.body.technicalSkills) ? req.body.technicalSkills : existing?.technicalSkills || [],
      programmingLanguages: Array.isArray(req.body.programmingLanguages) ? req.body.programmingLanguages : existing?.programmingLanguages || [],
      projects: Array.isArray(req.body.projects) ? req.body.projects : existing?.projects || [],
      internships: Array.isArray(req.body.internships) ? req.body.internships : existing?.internships || [],
      workExperience: Array.isArray(req.body.workExperience) ? req.body.workExperience : existing?.workExperience || [],
      profileImageUrl: req.body.profileImageUrl ?? existing?.profileImageUrl,
      resumeUrl: existing?.resumeUrl,
      resumeFileName: existing?.resumeFileName,
      resumeExtractedText: existing?.resumeExtractedText,
      completionPercentage: 0,
      updatedAt: new Date().toISOString(),
    };

    const saved = await dbRepository.upsertProfile(updatedProfile);
    res.json({ message: 'Profile updated successfully!', profile: saved });
  } catch (err) {
    console.error('[Profile] Update error:', err);
    res.status(500).json({ error: 'Failed to update profile.' });
  }
});

// Upload profile picture (accepts base64 or file upload)
profileRouter.post('/picture', requireAuth, upload.single('picture'), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const profile = await dbRepository.getProfileByUserId(userId);
    if (!profile) {
      res.status(404).json({ error: 'Profile not found.' });
      return;
    }

    let imageUrl = '';
    if (req.file) {
      const fileName = `avatar_${userId}_${Date.now()}${path.extname(req.file.originalname) || '.png'}`;
      const filePath = path.join(UPLOADS_DIR, fileName);
      fs.writeFileSync(filePath, req.file.buffer);
      imageUrl = `/uploads/${fileName}`;
    } else if (req.body.imageBase64) {
      imageUrl = req.body.imageBase64;
    } else {
      res.status(400).json({ error: 'No image file or base64 provided.' });
      return;
    }

    profile.profileImageUrl = imageUrl;
    const saved = await dbRepository.upsertProfile(profile);
    res.json({ message: 'Profile picture updated successfully!', profile: saved });
  } catch (err) {
    console.error('[Profile] Picture upload error:', err);
    res.status(500).json({ error: 'Failed to upload profile picture.' });
  }
});

// Upload and analyze PDF resume
profileRouter.post('/resume', requireAuth, upload.single('resume'), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const profile = await dbRepository.getProfileByUserId(userId);
    if (!profile) {
      res.status(404).json({ error: 'Profile not found.' });
      return;
    }

    let extractedText = '';
    let fileName = 'Candidate_Resume.pdf';

    if (req.file) {
      fileName = req.file.originalname;
      const savedFileName = `resume_${userId}_${Date.now()}.pdf`;
      const filePath = path.join(UPLOADS_DIR, savedFileName);
      fs.writeFileSync(filePath, req.file.buffer);
      profile.resumeUrl = `/uploads/${savedFileName}`;
      profile.resumeFileName = fileName;

      try {
        const parser = new (PDFParse as any)({ data: req.file.buffer });
        if (typeof parser.load === 'function') await parser.load();
        if (typeof parser.getText === 'function') {
          const resText = await parser.getText();
          extractedText = typeof resText === 'string' ? resText : (resText?.text || '');
        }
      } catch (pdfErr) {
        console.warn('[PDF] PDFParse failed, using buffer string fallback:', pdfErr);
        extractedText = req.file.buffer.toString('utf-8').replace(/[^\x20-\x7E\n]/g, ' ');
      }
    } else if (req.body.resumeText) {
      extractedText = req.body.resumeText;
      profile.resumeFileName = req.body.resumeFileName || 'Pasted_Resume_Text.pdf';
    } else {
      res.status(400).json({ error: 'Please upload a PDF resume file or provide resume text.' });
      return;
    }

    profile.resumeExtractedText = extractedText.trim();

    // Run AI analysis on resume to extract skills, projects, and suggested roles
    const analysis = await analyzeResumeText(profile.resumeExtractedText);

    // Merge extracted skills with existing profile skills without duplicates
    const combinedSkills = Array.from(
      new Set([...(profile.technicalSkills || []), ...(analysis.extractedSkills || [])])
    );
    profile.technicalSkills = combinedSkills;

    const saved = await dbRepository.upsertProfile(profile);

    res.json({
      message: 'Resume analyzed and profile enriched with AI successfully!',
      profile: saved,
      analysis,
    });
  } catch (err) {
    console.error('[Profile] Resume analysis error:', err);
    res.status(500).json({ error: 'Failed to process resume. Please try again.' });
  }
});
