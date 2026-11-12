import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

dotenv.config();

import { initMongo, seedDemoData, dbRepository } from './server/db.js';
import { authRouter } from './server/routes/auth.js';
import { profileRouter } from './server/routes/profile.js';
import { interviewRouter } from './server/routes/interviews.js';
import { evaluationRouter } from './server/routes/evaluations.js';
import { analyticsRouter } from './server/routes/analytics.js';

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const isProd = process.env.NODE_ENV === 'production';

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Ensure uploads folder exists and serve statically
const uploadsDir = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// System Health & Diagnostics API
app.get('/api/status', (req, res) => {
  const dbStatus = dbRepository.getStatus();
  res.json({
    status: 'online',
    appName: 'AI Mock Interview and Evaluation System',
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
    geminiModel: 'gemini-3.8-flash',
    database: dbStatus,
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/profile', profileRouter);
app.use('/api/interviews', interviewRouter);
app.use('/api/evaluations', evaluationRouter);
app.use('/api/analytics', analyticsRouter);

async function startServer() {
  // Initialize Database (MongoDB Atlas if URI present, else persistent local JSON store)
  await initMongo();
  await seedDemoData();

  if (!isProd) {
    // Development mode: attach Vite dev server middleware
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: PORT,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production mode: serve static build
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] AI Mock Interview System listening on http://0.0.0.0:${PORT}`);
    console.log(`[Server] Environment: ${isProd ? 'production' : 'development'}`);
  });
}

startServer().catch((err) => {
  console.error('[Server] Fatal startup error:', err);
  process.exit(1);
});
