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

(async () => {
  await createDatabaseIfNotExists();
  const app = express();
  await initializeDatabase();

  app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }));

  app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
  }));

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
  app.use('/api/stripe', stripeRoutes);
  app.use('/api/game', gameAIRoutes);

  const PORT = process.env.PORT || 3000;

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });

})();