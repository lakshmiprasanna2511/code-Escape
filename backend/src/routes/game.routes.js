import { Router } from 'express';
import GameState from '../models/GameState.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

router.get('/state', async (req, res) => {
  let game = await GameState.findOne({ user: req.userId });
  if (!game) game = await GameState.create({ user: req.userId });
  res.json({ game: game.toPublicJSON() });
});

// Full-state sync: the frontend keeps authoritative game state locally (mirroring
// the original single-file app's logic) and periodically persists it here so it
// survives across devices/sessions.
router.put('/state', async (req, res) => {
  try {
    const allowed = ['score', 'solved', 'att', 'corr', 'tPlayed', 'lStats', 'lvDone', 'objDone', 'aptScore', 'engScore', 'quizAptDone', 'quizEngDone'];
    const patch = {};
    for (const k of allowed) if (req.body[k] !== undefined) patch[k] = req.body[k];

    const game = await GameState.findOneAndUpdate(
      { user: req.userId },
      { $set: patch },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    res.json({ game: game.toPublicJSON() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not save game state' });
  }
});

router.post('/reset', async (req, res) => {
  await GameState.findOneAndDelete({ user: req.userId });
  const game = await GameState.create({ user: req.userId });
  res.json({ game: game.toPublicJSON() });
});

export default router;
