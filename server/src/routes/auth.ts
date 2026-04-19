import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../utils/prisma.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';

export const authRouter = Router();

// Validation schemas
const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().optional()
});

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string()
});

// POST /api/auth/register
authRouter.post('/register', async (req, res, next) => {
  try {
    const { email, password, name } = registerSchema.parse(req.body);

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      throw new AppError('Email already registered', 400);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true
      }
    });

    // Generate token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      data: {
        user,
        token
      }
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/login
authRouter.post('/login', async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      throw new AppError('Invalid email or password', 401);
    }

    // Generate token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          createdAt: user.createdAt
        },
        token
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/auth/me
authRouter.get('/me', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        _count: {
          select: {
            interviews: true,
            chatHistory: true
          }
        }
      }
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/auth/profile
authRouter.put('/profile', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { name } = req.body;

    const user = await prisma.user.update({
      where: { id: req.userId },
      data: { name },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true
      }
    });

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
});
