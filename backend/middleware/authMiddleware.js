// backend/middleware/authMiddleware.js

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
