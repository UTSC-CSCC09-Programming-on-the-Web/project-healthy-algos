// backend/routes/authRoutes.js
import express from 'express';
import passport from 'passport';

const router = express.Router();

// Initiate login
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Handle callback
router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/login',
    session: true,
  }),
  (req, res) => {
    // Redirect to frontend or dashboard after login
    res.redirect(FRONTEND_URL);
  }
);

// Check login status
router.get('/me', (req, res) => {
  if (req.isAuthenticated()) {
    res.json(req.user);
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

// Logout
router.get('/logout', (req, res) => {
  req.logout(() => {
    res.clearCookie('connect.sid');
    res.status(200).json({ message: 'Logged out' });
  });
});

export default router;
