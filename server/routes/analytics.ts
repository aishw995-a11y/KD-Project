import { Router, Response } from 'express';
import { dbRepository } from '../db.js';
import { requireAuth, AuthenticatedRequest } from '../auth.js';
import { AnalyticsSummary, CategoryScores } from '../models.js';

export const analyticsRouter = Router();

analyticsRouter.get('/', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const interviews = await dbRepository.getInterviewsByUserId(userId);
    const evaluations = await dbRepository.getEvaluationsByUserId(userId);

    const completedInterviews = interviews.filter(i => i.status === 'completed');
    const totalInterviews = completedInterviews.length;

    let averageScore = 0;
    let highestScore = 0;
    let totalTimeMinutes = 0;

    const categorySum: CategoryScores = {
      technicalKnowledge: 0,
      communicationSkills: 0,
      problemSolving: 0,
      answerRelevance: 0,
      clarityAndConfidence: 0,
    };

    evaluations.forEach(ev => {
      if (ev.overallScore > highestScore) highestScore = ev.overallScore;
      categorySum.technicalKnowledge += ev.categoryScores.technicalKnowledge || 0;
      categorySum.communicationSkills += ev.categoryScores.communicationSkills || 0;
      categorySum.problemSolving += ev.categoryScores.problemSolving || 0;
      categorySum.answerRelevance += ev.categoryScores.answerRelevance || 0;
      categorySum.clarityAndConfidence += ev.categoryScores.clarityAndConfidence || 0;
    });

    completedInterviews.forEach(i => {
      totalTimeMinutes += i.durationMinutes || 15;
    });

    const evalCount = evaluations.length;
    if (evalCount > 0) {
      const sum = evaluations.reduce((acc, curr) => acc + curr.overallScore, 0);
      averageScore = Math.round(sum / evalCount);
    }

    const categoryAverages: CategoryScores = {
      technicalKnowledge: evalCount ? Math.round(categorySum.technicalKnowledge / evalCount) : 0,
      communicationSkills: evalCount ? Math.round(categorySum.communicationSkills / evalCount) : 0,
      problemSolving: evalCount ? Math.round(categorySum.problemSolving / evalCount) : 0,
      answerRelevance: evalCount ? Math.round(categorySum.answerRelevance / evalCount) : 0,
      clarityAndConfidence: evalCount ? Math.round(categorySum.clarityAndConfidence / evalCount) : 0,
    };

    // Score trend (oldest to newest)
    const scoreTrend = evaluations
      .slice()
      .reverse()
      .map(ev => {
        const interview = completedInterviews.find(i => i.id === ev.interviewId);
        return {
          date: new Date(ev.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
          score: ev.overallScore,
          role: interview?.jobRole || 'General',
        };
      });

    // Role performance aggregation
    const roleMap: Record<string, { count: number; totalScore: number }> = {};
    evaluations.forEach(ev => {
      const interview = completedInterviews.find(i => i.id === ev.interviewId);
      const role = interview?.jobRole || 'Software Developer';
      if (!roleMap[role]) {
        roleMap[role] = { count: 0, totalScore: 0 };
      }
      roleMap[role].count += 1;
      roleMap[role].totalScore += ev.overallScore;
    });

    const rolePerformance = Object.keys(roleMap).map(role => ({
      role,
      count: roleMap[role].count,
      avgScore: Math.round(roleMap[role].totalScore / roleMap[role].count),
    }));

    // AI recommended focus areas based on lowest categories
    const categoriesSorted = [
      { name: 'Technical Knowledge', val: categoryAverages.technicalKnowledge },
      { name: 'Communication Skills', val: categoryAverages.communicationSkills },
      { name: 'Problem Solving', val: categoryAverages.problemSolving },
      { name: 'Answer Relevance', val: categoryAverages.answerRelevance },
      { name: 'Clarity and Confidence', val: categoryAverages.clarityAndConfidence },
    ].sort((a, b) => a.val - b.val);

    const lowest = categoriesSorted.slice(0, 2).map(c => c.name);
    const recommendedFocus = lowest.length > 0 && evalCount > 0
      ? lowest
      : ['System Design & Scalability', 'STAR Technique for Behavioral Scenarios'];

    const summary: AnalyticsSummary = {
      totalInterviews,
      averageScore,
      highestScore,
      totalTimeMinutes,
      categoryAverages,
      scoreTrend,
      rolePerformance,
      recommendedFocus,
    };

    res.json({ analytics: summary });
  } catch (err) {
    console.error('[Analytics] Error:', err);
    res.status(500).json({ error: 'Failed to compute analytics.' });
  }
});
