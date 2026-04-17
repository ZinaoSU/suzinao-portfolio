import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from 'dotenv';
import { authRouter } from './routes/auth.js';
import { interviewRouter } from './routes/interview.js';
import { resumeRouter } from './routes/resume.js';
import { errorHandler } from './middleware/errorHandler.js';

// Load environment variables
config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRouter);
app.use('/api/interview', interviewRouter);
app.use('/api/resume', resumeRouter);

// Error handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════╗
║   🚀 AI Lab Server Running                ║
║   Port: ${PORT}                              ║
║   Mode: ${process.env.NODE_ENV || 'development'}                ║
╚════════════════════════════════════════════╝
  `);
});

export default app;
