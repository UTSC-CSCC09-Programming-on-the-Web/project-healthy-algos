import express from "express";
import cors from "cors";
import session from "express-session";
import passport from "passport";
import "dotenv/config";
import "./services/oauthService.js";
import authRoutes from "./routes/authRoutes.js";
import protectedRoutes from './routes/protectedRoutes.js';
import stripeRoutes from './routes/stripeRoutes.js';
import gameAIRoutes from './routes/gameAIRoutes.js';
import { initializeDatabase } from './initDb.js';
import { createDatabaseIfNotExists } from './createDatabase.js';
import { ensureAuthenticated } from './middleware/authMiddleware.js';

(async () => {
  await createDatabaseIfNotExists();
  const app = express();
  await initializeDatabase();

  app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }));

  app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
  }));

  app.use(express.json());

  app.use(session({
    secret: process.env.SESSION_SECRET || 'fallback-dev-secret-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));

  app.use(passport.initialize());
  app.use(passport.session());
  app.use('/api/auth', authRoutes);
  app.use('/api', protectedRoutes);
  app.use('/api/stripe', ensureAuthenticated, stripeRoutes);
  app.use('/api/game', gameAIRoutes); 

  // Check if server is running
  app.get('/', (req, res) => {
    res.json({ 
      status: 'healthy', 
      message: 'Backend running with full features',
      endpoints: [
        '/api/auth/google',
        '/api/auth/logout', 
        '/api/stripe/create-payment-intent',
        '/api/game/ai-decision',
        '/api/game/health'
      ]
    });
  });

  const PORT = process.env.PORT || 3000;

  app.listen(PORT, () => {
    console.log(`Full-featured backend running on http://localhost:${PORT}`);
    console.log(`Available endpoints:`);
    console.log(`GET  /                               - Health check`);
    console.log(`GET  /api/auth/google                - OAuth login`);
    console.log(`GET  /api/auth/logout               - Logout`);
    console.log(`POST /api/stripe/create-payment-intent - Stripe payment`);
    console.log(`POST /api/game/ai-decision          - Request AI decision`);
    console.log(`GET  /api/game/health               - AI system health`);
  });

})();