import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../utils/prisma.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { analyzeInterview } from '../services/openai.js';
import { AppError } from '../middleware/errorHandler.js';

export const interviewRouter = Router();

const analyzeSchema = z.object({
  content: z.string().min(10, 'Content must be at least 10 characters'),
  title: z.string().optional()
});

// POST /api/interview/analyze - Analyze interview content
interviewRouter.post('/analyze', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { content, title } = analyzeSchema.parse(req.body);

    // Analyze with OpenAI
    const analysis = await analyzeInterview(content);

    // Save to database
    const interview = await prisma.interview.create({
      data: {
        userId: req.userId!,
        title: title || `面试复盘 ${new Date().toLocaleDateString('zh-CN')}`,
        content,
        analysis: JSON.stringify(analysis)
      }
    });

    res.json({
      success: true,
      data: {
        ...interview,
        analysis: JSON.parse(interview.analysis!)
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/interview/history - Get user's interview history
interviewRouter.get('/history', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [interviews, total] = await Promise.all([
      prisma.interview.findMany({
        where: { userId: req.userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          title: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              // No related records in current schema
            }
          }
        }
      }),
      prisma.interview.count({
        where: { userId: req.userId }
      })
    ]);

    res.json({
      success: true,
      data: {
        interviews,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/interview/:id - Get single interview analysis
interviewRouter.get('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const interview = await prisma.interview.findFirst({
      where: {
        id: req.params.id,
        userId: req.userId
      }
    });

    if (!interview) {
      throw new AppError('Interview not found', 404);
    }

    res.json({
      success: true,
      data: {
        ...interview,
        analysis: interview.analysis ? JSON.parse(interview.analysis) : null
      }
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/interview/:id - Delete interview record
interviewRouter.delete('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const interview = await prisma.interview.findFirst({
      where: {
        id: req.params.id,
        userId: req.userId
      }
    });

    if (!interview) {
      throw new AppError('Interview not found', 404);
    }

    await prisma.interview.delete({
      where: { id: req.params.id }
    });

    res.json({
      success: true,
      message: 'Interview deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});
