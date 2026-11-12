import { Router, Response } from 'express';
import { dbRepository } from '../db.js';
import { requireAuth, AuthenticatedRequest } from '../auth.js';
import { evaluateInterviewSession } from '../gemini.js';

export const evaluationRouter = Router();

// Get evaluation by evaluation ID
evaluationRouter.get('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const evalId = req.params.id;
    const report = await dbRepository.getEvaluationById(evalId);
    if (!report || report.userId !== req.user!.id) {
      res.status(404).json({ error: 'Evaluation report not found.' });
      return;
    }
    const interview = await dbRepository.getInterviewById(report.interviewId);
    res.json({ report, interview });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch evaluation report.' });
  }
});

// Get evaluation by interview ID
evaluationRouter.get('/interview/:interviewId', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const interviewId = req.params.interviewId;
    const report = await dbRepository.getEvaluationByInterviewId(interviewId);
    if (!report || report.userId !== req.user!.id) {
      res.status(404).json({ error: 'Evaluation report not found for this interview.' });
      return;
    }
    const interview = await dbRepository.getInterviewById(interviewId);
    res.json({ report, interview });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch evaluation report.' });
  }
});

// Re-evaluate interview
evaluationRouter.post('/re-evaluate/:interviewId', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const interviewId = req.params.interviewId;
    const interview = await dbRepository.getInterviewById(interviewId);
    if (!interview || interview.userId !== req.user!.id) {
      res.status(404).json({ error: 'Interview not found.' });
      return;
    }

    const report = await evaluateInterviewSession({
      interviewId: interview.id,
      userId: interview.userId,
      jobRole: interview.jobRole,
      interviewType: interview.interviewType,
      experienceLevel: interview.experienceLevel,
      difficulty: interview.difficulty,
      questions: interview.questions,
      answers: interview.submittedAnswers,
    });

    await dbRepository.createEvaluation(report);
    res.json({ message: 'Interview re-evaluated successfully!', report });
  } catch (err) {
    console.error('[Evaluation] Re-evaluate error:', err);
    res.status(500).json({ error: 'Failed to re-evaluate interview.' });
  }
});
