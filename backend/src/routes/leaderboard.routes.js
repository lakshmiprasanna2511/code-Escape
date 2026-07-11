import { Router } from 'express';
import GameState from '../models/GameState.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 20, 100);
    const top = await GameState.find({})
      .sort({ score: -1 })
      .limit(limit)
      .populate('user', 'username avatar')
      .lean();

    const rows = top
      .filter((g) => g.user)
      .map((g, i) => ({
        rank: i + 1,
        username: g.user.username,
        avatar: g.user.avatar,
        score: g.score,
        solved: g.solved,
        badge: g.score > 1000 ? 'hard' : 'easy',
      }));
    res.json({ leaderboard: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not load leaderboard' });
  }
});

export default router;
