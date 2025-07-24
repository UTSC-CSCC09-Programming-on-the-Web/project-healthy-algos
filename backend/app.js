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

  const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

  const allowedOrigins = [
    'https://i-sim.app',
    'https://www.i-sim.app',
    'http://localhost:5173',
    FRONTEND_URL,
  ];

  app.use(cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS: ' + origin));
      }
    },
    credentials: true
  }));

  app.use(express.json());

  app.set('trust proxy', 1); 
  
  app.use(session({
    secret: process.env.SESSION_SECRET || 'fallback-dev-secret-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: 'none',
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
      message: 'Backend running with full authentication and AI features',
      endpoints: [
        '/api/game/ai-decision',
        '/api/game/health',
        '/api/auth/google',
        '/api/auth/logout', 
        '/api/stripe/create-payment-intent',
      ]
    });
  });

  const PORT = process.env.PORT || 3000;

  app.listen(PORT, () => {
    console.log(`Full-featured backend running on ${FRONTEND_URL} at port ${PORT}`);
    console.log(`Available endpoints:`);
    console.log(`GET  /                               - Health check`);
    console.log(`POST /api/game/ai-decision          - Request AI decision`);
    console.log(`GET  /api/game/health               - AI system health`);
    console.log(`GET  /api/auth/google               - Google OAuth login`);
    console.log(`POST /api/auth/logout               - Logout`);
    console.log(`POST /api/stripe/*                  - Stripe payment endpoints`);
  });

})();