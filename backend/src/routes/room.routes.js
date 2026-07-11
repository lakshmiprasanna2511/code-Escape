import { Router } from 'express';
import Room from '../models/Room.js';
import User from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

const ADJ = ['ALPHA', 'BETA', 'GAMMA', 'DELTA', 'ECHO', 'ZETA', 'OMEGA', 'NOVA', 'APEX', 'XRAY', 'ZERO', 'FLUX'];

function genCode() {
  const adj = ADJ[Math.floor(Math.random() * ADJ.length)];
  return adj.slice(0, 4) + String(Math.floor(10 + Math.random() * 90));
}

router.post('/', async (req, res) => {
  try {
    const { cat = 'apt', maxPlayers = 4 } = req.body;
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    let code = genCode();
    while (await Room.findOne({ code })) code = genCode();

    const room = await Room.create({
      code, cat, maxPlayers, host: user._id,
      members: [{ user: user._id, username: user.username, avatar: user.avatar, score: 0, status: 'host' }],
      messages: [{ sys: true, msg: `Room ${code} created! Category: ${cat.toUpperCase()}` }],
    });
    res.json({ room });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not create room' });
  }
});

router.get('/:code', async (req, res) => {
  const room = await Room.findOne({ code: req.params.code.toUpperCase() });
  if (!room) return res.status(404).json({ error: 'Room not found' });
  res.json({ room });
});

router.post('/:code/join', async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const room = await Room.findOne({ code: req.params.code.toUpperCase() });
    if (!room) return res.status(404).json({ error: 'Room not found' });
    if (room.members.length >= room.maxPlayers) return res.status(400).json({ error: 'Room is full' });

    if (!room.members.find((m) => String(m.user) === String(user._id))) {
      room.members.push({ user: user._id, username: user.username, avatar: user.avatar, score: 0, status: 'ready' });
      room.messages.push({ sys: true, msg: `${user.username} joined the room` });
      await room.save();
    }
    res.json({ room });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not join room' });
  }
});

export default router;
