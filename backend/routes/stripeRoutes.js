import express from 'express';
import Stripe from 'stripe';
import dotenv from 'dotenv';
import pool from '../services/db.js';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const router = express.Router();
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

router.post('/create-checkout-session', async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{
        price: process.env.STRIPE_PRICE_ID,
        quantity: 1,
      }],
      success_url: `${FRONTEND_URL}/success`,
      cancel_url: `${FRONTEND_URL}/subscribe`,
      customer_email: req.user?.email,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Stripe error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// --- Webhook route ---
const stripeWebhookRouter = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const email = session.customer_email;

    if (email) {
      try {
        await pool.query(
          'UPDATE users SET subscribed = true WHERE email = $1',
          [email]
        );
        console.log(`User ${email} is now subscribed.`);
      } catch (dbErr) {
        console.error('DB update failed:', dbErr.message);
      }
    }
  }

  res.status(200).json({ received: true });
};

export { router as stripeRoutes, stripeWebhookRouter };