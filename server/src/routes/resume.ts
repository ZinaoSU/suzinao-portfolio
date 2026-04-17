import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../utils/prisma.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { chatWithResume } from '../services/resume.js';
import { AppError } from '../middleware/errorHandler.js';

export const resumeRouter = Router();

const chatSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty'),
  history: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string()
  })).optional()
});

// Resume context endpoint
resumeRouter.get('/context', authenticate, async (_req: AuthRequest, res, next) => {
  try {
    // Return the static resume context
    // In production, this could be from a database or external source
    const context = {
      name: '苏梓铙',
      title: '产品经理 / AI产品',
      location: '香港',
      summary: '热爱AI与产品交叉领域，致力于将AI技术转化为用户喜爱的产品解决方案。',
      skills: [
        '产品设计', 'AI产品', '数据分析', '用户研究',
        '项目管理', '跨团队协作'
      ],
      experience: [
        {
          company: '待填充',
          position: '产品经理',
          duration: '待填充',
          description: '待填充'
        }
      ],
      education: [
        {
          school: '待填充',
          degree: '待填充',
          duration: '待填充'
        }
      ]
    };

    res.json({
      success: true,
      data: context
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/resume/chat - Chat with resume
resumeRouter.post('/chat', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { message, history } = chatSchema.parse(req.body);

    // Get AI response
    const response = await chatWithResume(message, history || []);

    // Save to chat history
    await prisma.chatMessage.createMany({
      data: [
        { userId: req.userId!, role: 'user', content: message, model: 'gpt-4' },
        { userId: req.userId!, role: 'assistant', content: response, model: 'gpt-4' }
      ]
    });

    res.json({
      success: true,
      data: {
        message: response,
        history: [
          ...(history || []),
          { role: 'user' as const, content: message },
          { role: 'assistant' as const, content: response }
        ]
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/resume/history - Get chat history
resumeRouter.get('/history', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const messages = await prisma.chatMessage.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: (page - 1) * limit
    });

    res.json({
      success: true,
      data: messages.reverse()
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/resume/history - Clear chat history
resumeRouter.delete('/history', authenticate, async (req: AuthRequest, res, next) => {
  try {
    await prisma.chatMessage.deleteMany({
      where: { userId: req.userId }
    });

    res.json({
      success: true,
      message: 'Chat history cleared'
    });
  } catch (error) {
    next(error);
  }
});
