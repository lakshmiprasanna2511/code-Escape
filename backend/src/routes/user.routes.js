import { Router } from 'express';
import User from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

router.get('/me', async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ user: user.toPublicJSON() });
});

router.patch('/me', async (req, res) => {
  try {
    const { displayName, avatar, langs, exp, bio } = req.body;
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (displayName !== undefined) user.displayName = displayName.trim().slice(0, 30);
    if (avatar !== undefined) user.avatar = avatar;
    if (Array.isArray(langs)) user.langs = langs.slice(0, 3);
    if (exp !== undefined) user.exp = exp;
    if (bio !== undefined) user.bio = bio.slice(0, 120);
    await user.save();
    res.json({ user: user.toPublicJSON() });
  } catch (err) {
    res.status(500).json({ error: 'Update failed' });
  }
});

export default router;
