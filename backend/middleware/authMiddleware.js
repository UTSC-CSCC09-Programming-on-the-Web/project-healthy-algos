// backend/middleware/authMiddleware.js
import pool from '../services/db.js';

export function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Not authenticated' });
}

export function ensureSubscribed(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) {
    if (req.user && req.user.subscribed) {
      return next();
    }
    return res.status(402).json({ error: 'Subscription required' });
  }
  res.status(401).json({ error: 'Not authenticated' });
}

export async function refreshUser(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated() && req.user?.email) {
    try {
      const { rows } = await pool.query(
        'SELECT * FROM users WHERE email = $1',
        [req.user.email]
      );
      if (rows.length > 0) {
        req.user = rows[0]; // update session with fresh DB state
      }
    } catch (err) {
      console.error('Failed to refresh user session:', err);
    }
  }
  next();
}
