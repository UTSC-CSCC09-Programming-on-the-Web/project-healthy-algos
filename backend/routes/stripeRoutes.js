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

router.get('/membership-info', async (req, res) => {
  try {
    const { email } = req.user;
    const { rows } = await pool.query('SELECT stripe_subscription_id FROM users WHERE email = $1', [email]);
    const subscriptionId = rows[0]?.stripe_subscription_id;
    // console.log('Subscription ID from DB:', subscriptionId);

    if (!subscriptionId) {
      return res.status(404).json({ error: 'No subscription found' });
    }

    const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
      expand: ['items.data']
    });
    // console.log('Stripe subscription object:', subscription);

    res.json({
      status: subscription.status,
      cancel_at: subscription.cancel_at,
      current_period_end: subscription.current_period_end
        ? subscription.current_period_end * 1000
        : subscription.items?.data?.[0]?.current_period_end
          ? subscription.items.data[0].current_period_end * 1000
          : null,
      cancel_at_period_end: subscription.cancel_at_period_end,
    });
  } catch (err) {
    console.error('Get membership info failed:', err);
    res.status(500).json({ error: 'Failed to fetch subscription info' });
  }
});

router.post('/cancel-membership', async (req, res) => {
  try {
    const { email } = req.user;
    const { rows } = await pool.query('SELECT stripe_subscription_id FROM users WHERE email = $1', [email]);
    const subscriptionId = rows[0]?.stripe_subscription_id;

    if (!subscriptionId) {
      return res.status(404).json({ error: 'No subscription found' });
    }

    await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });

    res.json({ success: true });
  } catch (err) {
    console.error('Cancel membership failed:', err);
    res.status(500).json({ error: 'Cancellation failed' });
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
    const subscriptionId = session.subscription;

    if (email) {
      try {
        await pool.query(
          'UPDATE users SET subscribed = true, stripe_subscription_id = $1 WHERE email = $2',
          [subscriptionId, email]
        );
        console.log(`User ${email} is now subscribed.`);
      } catch (dbErr) {
        console.error('DB update failed:', dbErr.message);
      }
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object;
    const subscriptionId = subscription.id;

    try {
      const { rows } = await pool.query(
        'SELECT email FROM users WHERE stripe_subscription_id = $1',
        [subscriptionId]
      );

      if (rows.length > 0) {
        const email = rows[0].email;

        await pool.query(
          'UPDATE users SET subscribed = false, stripe_subscription_id = NULL WHERE email = $1',
          [email]
        );

        console.log(`User ${email}'s subscription was fully cancelled.`);
      } else {
        console.warn(`No user found for canceled subscription ID ${subscriptionId}`);
      }
    } catch (err) {
      console.error('Failed to update user after subscription cancellation:', err);
    }
  }

  res.status(200).json({ received: true });
};

export { router as stripeRoutes, stripeWebhookRouter };