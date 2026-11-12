import { Router, Response } from 'express';
import { dbRepository } from '../db.js';
import { requireAuth, AuthenticatedRequest } from '../auth.js';
import { generateInterviewQuestions, generateFollowUpQuestion, evaluateInterviewSession } from '../gemini.js';
import { InterviewSession, SubmittedAnswer } from '../models.js';

export const interviewRouter = Router();

// Configure & Generate AI Interview Questions
interviewRouter.post('/generate', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const {
      jobRole,
      interviewType,
      experienceLevel,
      difficulty,
      questionCount,
      durationMinutes,
      useResumePersonalization = true,
    } = req.body;

    if (!jobRole || !interviewType || !experienceLevel || !difficulty) {
      res.status(400).json({ error: 'Please select all interview configuration parameters.' });
      return;
    }

    const count = Number(questionCount) || 5;
    const duration = Number(durationMinutes) || (count === 5 ? 15 : count === 10 ? 30 : 45);

    let userProfile = null;
    if (useResumePersonalization) {
      userProfile = await dbRepository.getProfileByUserId(userId);
    }

    // Call Gemini API for personalized questions
    const questions = await generateInterviewQuestions({
      jobRole,
      interviewType,
      experienceLevel,
      difficulty,
      questionCount: count,
      userProfile,
    });

    const session: InterviewSession = {
      id: `int_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId,
      jobRole,
      interviewType,
      experienceLevel,
      difficulty,
      totalQuestions: questions.length,
      durationMinutes: duration,
      useResumePersonalization: Boolean(useResumePersonalization),
      status: 'in-progress',
      createdAt: new Date().toISOString(),
      questions,
      submittedAnswers: [],
    };

    const saved = await dbRepository.createInterview(session);
    res.status(201).json({ session: saved });
  } catch (err) {
    console.error('[Interview] Generation error:', err);
    res.status(500).json({ error: 'Failed to generate interview. Please try again.' });
  }
});

// Follow-up question generator
interviewRouter.post('/follow-up', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { jobRole, originalQuestion, userAnswer } = req.body;
    if (!originalQuestion || !userAnswer) {
      res.status(400).json({ error: 'Original question and answer are required.' });
      return;
    }
    const followUp = await generateFollowUpQuestion({
      jobRole: jobRole || 'Software Developer',
      originalQuestion,
      userAnswer,
    });
    res.json({ followUp });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate follow-up.' });
  }
});

// Save or update an answer in real-time
interviewRouter.post('/:id/answer', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const interviewId = req.params.id;
    const session = await dbRepository.getInterviewById(interviewId);
    if (!session || session.userId !== req.user!.id) {
      res.status(404).json({ error: 'Interview not found.' });
      return;
    }

    const { questionId, questionText, category, userAnswer, timeSpentSeconds, isVoiceInput } = req.body;
    if (!questionId) {
      res.status(400).json({ error: 'questionId is required.' });
      return;
    }

    const newAnswer: SubmittedAnswer = {
      questionId,
      questionText: questionText || '',
      category: category || 'Technical',
      userAnswer: userAnswer || '',
      timeSpentSeconds: Number(timeSpentSeconds) || 0,
      isVoiceInput: Boolean(isVoiceInput),
    };

    const existingIdx = session.submittedAnswers.findIndex(a => a.questionId === questionId);
    if (existingIdx >= 0) {
      session.submittedAnswers[existingIdx] = newAnswer;
    } else {
      session.submittedAnswers.push(newAnswer);
    }

    await dbRepository.updateInterview(interviewId, { submittedAnswers: session.submittedAnswers });
    res.json({ message: 'Answer saved', submittedAnswers: session.submittedAnswers });
  } catch (err) {
    console.error('[Interview] Save answer error:', err);
    res.status(500).json({ error: 'Failed to save answer.' });
  }
});

// Finish interview & trigger AI Evaluation
interviewRouter.post('/:id/complete', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const interviewId = req.params.id;
    const session = await dbRepository.getInterviewById(interviewId);
    if (!session || session.userId !== req.user!.id) {
      res.status(404).json({ error: 'Interview not found.' });
      return;
    }

    const { finalAnswers } = req.body;
    const answersToUse = Array.isArray(finalAnswers) && finalAnswers.length > 0
      ? finalAnswers
      : session.submittedAnswers;

    const completedAt = new Date().toISOString();
    await dbRepository.updateInterview(interviewId, {
      status: 'completed',
      completedAt,
      submittedAnswers: answersToUse,
    });

    // Run AI Evaluation
    const evaluation = await evaluateInterviewSession({
      interviewId: session.id,
      userId: session.userId,
      jobRole: session.jobRole,
      interviewType: session.interviewType,
      experienceLevel: session.experienceLevel,
      difficulty: session.difficulty,
      questions: session.questions,
      answers: answersToUse,
    });

    await dbRepository.createEvaluation(evaluation);

    res.json({
      message: 'Interview completed and evaluated successfully!',
      session: { ...session, status: 'completed', completedAt, submittedAnswers: answersToUse },
      evaluation,
    });
  } catch (err) {
    console.error('[Interview] Complete & Evaluate error:', err);
    res.status(500).json({ error: 'Failed to complete interview evaluation.' });
  }
});

// History list with filtering
interviewRouter.get('/history', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { role, type, difficulty } = req.query;

    let interviews = await dbRepository.getInterviewsByUserId(userId);

    if (role && role !== 'all') {
      interviews = interviews.filter(i => i.jobRole.toLowerCase() === String(role).toLowerCase());
    }
    if (type && type !== 'all') {
      interviews = interviews.filter(i => i.interviewType.toLowerCase() === String(type).toLowerCase());
    }
    if (difficulty && difficulty !== 'all') {
      interviews = interviews.filter(i => i.difficulty.toLowerCase() === String(difficulty).toLowerCase());
    }

    // Attach evaluation report summary if available
    const evaluations = await dbRepository.getEvaluationsByUserId(userId);
    const enriched = interviews.map(i => {
      const ev = evaluations.find(e => e.interviewId === i.id);
      return {
        ...i,
        evaluation: ev
          ? {
              id: ev.id,
              overallScore: ev.overallScore,
              performanceLevel: ev.performanceLevel,
            }
          : null,
      };
    });

    res.json({ interviews: enriched });
  } catch (err) {
    console.error('[Interview] History error:', err);
    res.status(500).json({ error: 'Failed to fetch interview history.' });
  }
});

// Single interview session
interviewRouter.get('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const interviewId = req.params.id;
    const session = await dbRepository.getInterviewById(interviewId);
    if (!session || session.userId !== req.user!.id) {
      res.status(404).json({ error: 'Interview session not found.' });
      return;
    }

    const evaluation = await dbRepository.getEvaluationByInterviewId(interviewId);
    res.json({ session, evaluation });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch interview.' });
  }
});
