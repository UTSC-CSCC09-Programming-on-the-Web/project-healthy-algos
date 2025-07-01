// backend/routes/authRoutes.js
import express from 'express';
import passport from 'passport';

const router = express.Router();

// Initiate login
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Handle callback
router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/login',
    session: true,
  }),
  (req, res) => {
    // Redirect to frontend or dashboard after login
    res.redirect('http://localhost:5173/');
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
    res.redirect('http://localhost:5173/login');
  });
});

export default router;
