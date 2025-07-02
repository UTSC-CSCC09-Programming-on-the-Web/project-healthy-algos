// backend/routes/protectedRoutes.js
import express from 'express';
import { ensureSubscribed } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/world', ensureSubscribed, (req, res) => {
  res.json({ message: 'Welcome to the World page!' });
});

export default router;
