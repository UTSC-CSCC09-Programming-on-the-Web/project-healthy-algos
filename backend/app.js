import express from "express";
import cors from "cors";
import session from "express-session";
import passport from "passport";
import "dotenv/config";
// import "./services/oauthService.js";  // ❌ Temporarily disabled - requires OAuth credentials
// import authRoutes from "./routes/authRoutes.js";  // ❌ Temporarily disabled
// import protectedRoutes from './routes/protectedRoutes.js';  // ❌ Temporarily disabled
// import stripeRoutes from './routes/stripeRoutes.js';  // ❌ Temporarily disabled
import gameAIRoutes from './routes/gameAIRoutes.js';  // ✅ Keep AI routes
// import { initializeDatabase } from './initDb.js';  // ❌ Temporarily disabled
// import { createDatabaseIfNotExists } from './createDatabase.js';  // ❌ Temporarily disabled

(async () => {
  // await createDatabaseIfNotExists();  // ❌ Temporarily disabled
  const app = express();
  // await initializeDatabase();  // ❌ Temporarily disabled

  // app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }));  // ❌ Temporarily disabled

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
  // app.use('/api/auth', authRoutes);  // ❌ Temporarily disabled
  // app.use('/api', protectedRoutes);  // ❌ Temporarily disabled
  // app.use('/api/stripe', stripeRoutes);  // ❌ Temporarily disabled
  app.use('/api/game', gameAIRoutes); 

  // Check if AI worker is running
  app.get('/', (req, res) => {
    res.json({ 
      status: 'healthy', 
      message: 'AI-only backend running',
      endpoints: ['/api/game/ai-decision', '/api/game/health']
    });
  });

  const PORT = process.env.PORT || 3000;

  app.listen(PORT, () => {
    console.log(`AI-focused backend running on http://localhost:${PORT}`);
    console.log(`Available endpoints:`);
    console.log(`GET  /                     - Health check`);
    console.log(`POST /api/game/ai-decision - Request AI decision`);
    console.log(`GET  /api/game/health      - AI system health`);
  });

})();