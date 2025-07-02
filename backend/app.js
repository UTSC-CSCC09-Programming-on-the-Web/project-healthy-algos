import express from "express";
import cors from "cors";
import session from "express-session";
import passport from "passport";
import "./services/oauthService.js";
import authRoutes from "./routes/authRoutes.js";
import protectedRoutes from './routes/protectedRoutes.js';
import stripeRoutes from './routes/stripeRoutes.js';

export const app = express();

app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }));

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(session({
  secret: 'your-session-secret', // replace in production
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

app.use('/api/auth', authRoutes);

app.use('/api', protectedRoutes);

app.use('/api/stripe', stripeRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});