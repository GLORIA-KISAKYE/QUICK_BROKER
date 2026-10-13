import { Router } from 'express';
import { query } from '../../db';
import { authenticate, AuthRequest } from '../../middleware/auth';

const router = Router();

// Store push subscription
router.post('/subscribe', authenticate, async (req: AuthRequest, res) => {
  try {
    const { subscription } = req.body;
    if (!subscription) {
      return res.status(400).json({ error: 'Subscription required' });
    }

    // Store or update push subscription for user
    await query(
      `INSERT INTO push_subscriptions (user_id, subscription, created_at)
      VALUES ($1, $2, now())
      ON CONFLICT (user_id) DO UPDATE SET subscription = $2, updated_at = now()`,
      [req.user!.id, JSON.stringify(subscription)]
    );

    res.json({ message: 'Push subscription saved' });
  } catch (error) {
    console.error('Push subscribe error:', error);
    res.status(500).json({ error: 'Failed to save subscription' });
  }
});

// Unsubscribe from push
router.post('/unsubscribe', authenticate, async (req: AuthRequest, res) => {
  try {
    await query(
      'DELETE FROM push_subscriptions WHERE user_id = $1',
      [req.user!.id]
    );
    res.json({ message: 'Unsubscribed from push notifications' });
  } catch (error) {
    console.error('Push unsubscribe error:', error);
    res.status(500).json({ error: 'Failed to unsubscribe' });
  }
});

// Send push notification (internal use)
router.post('/send', authenticate, async (req: AuthRequest, res) => {
  try {
    const { userId, title, body } = req.body;

    // Get user's push subscription
    const result = await query(
      'SELECT subscription FROM push_subscriptions WHERE user_id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No push subscription found' });
    }

    // In production, use web-push library to send actual notifications
    // For now, log the notification
    console.log(`Push notification to user ${userId}: ${title} - ${body}`);

    res.json({ message: 'Notification queued', title, body });
  } catch (error) {
    console.error('Push send error:', error);
    res.status(500).json({ error: 'Failed to send notification' });
  }
});

export default router;
