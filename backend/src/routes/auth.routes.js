import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import GameState from '../models/GameState.js';
import { signToken, verifyToken } from '../utils/token.js';

const router = Router();

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRe = /^\+?\d{8,15}$/;
const usernameRe = /^[a-zA-Z0-9_]{3,20}$/;

function genOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function publicUserAndGame(user, game) {
  return { user: user.toPublicJSON(), game: game ? game.toPublicJSON() : null };
}

// ── POST /api/auth/signup ──────────────────────────────────────────────
router.post('/signup', async (req, res) => {
  try {
    const { method, email, phone, password } = req.body;
    if (!password || password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });
    if (method === 'email') {
      if (!emailRe.test(email || '')) return res.status(400).json({ error: 'Invalid email address' });
    } else if (method === 'phone') {
      if (!phoneRe.test((phone || '').replace(/\s/g, ''))) return res.status(400).json({ error: 'Invalid phone number' });
    } else {
      return res.status(400).json({ error: 'method must be email or phone' });
    }

    const query = method === 'email' ? { email: email.toLowerCase() } : { phone };
    const existingActive = await User.findOne({ ...query, status: 'active' });
    if (existingActive) return res.status(409).json({ error: 'An account already exists for this contact. Try signing in.' });

    const passwordHash = await bcrypt.hash(password, 10);
    const otp = genOtp();
    const otpDoc = { code: otp, contact: method === 'email' ? email : phone, method, expiresAt: new Date(Date.now() + 5 * 60 * 1000) };

    let user = await User.findOne({ ...query, status: 'pending' });
    if (user) {
      user.passwordHash = passwordHash;
      user.otp = otpDoc;
      if (method === 'email') user.email = email.toLowerCase(); else user.phone = phone;
    } else {
      user = new User({ [method]: method === 'email' ? email.toLowerCase() : phone, passwordHash, otp: otpDoc, status: 'pending' });
    }
    await user.save();

    res.json({ pendingId: user._id, contact: otpDoc.contact, otp /* demo mode: OTP echoed back */ });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Signup failed' });
  }
});

// ── POST /api/auth/resend-otp ──────────────────────────────────────────
router.post('/resend-otp', async (req, res) => {
  try {
    const { pendingId } = req.body;
    const user = await User.findById(pendingId);
    if (!user || user.status !== 'pending') return res.status(404).json({ error: 'Signup session not found' });
    const otp = genOtp();
    user.otp = { ...user.otp.toObject(), code: otp, expiresAt: new Date(Date.now() + 5 * 60 * 1000) };
    await user.save();
    res.json({ otp });
  } catch (err) {
    res.status(500).json({ error: 'Could not resend OTP' });
  }
});

// ── POST /api/auth/verify-otp ──────────────────────────────────────────
router.post('/verify-otp', async (req, res) => {
  try {
    const { pendingId, code } = req.body;
    const user = await User.findById(pendingId);
    if (!user || user.status !== 'pending' || !user.otp) return res.status(404).json({ error: 'Signup session not found' });
    if (!user.otp.code || user.otp.code !== code) return res.status(400).json({ error: 'Incorrect OTP' });
    if (user.otp.expiresAt && user.otp.expiresAt.getTime() < Date.now()) return res.status(400).json({ error: 'OTP expired, please resend' });

    user.verified = true;
    await user.save();

    const setupToken = jwt.sign({ sub: user._id.toString(), purpose: 'setup' }, process.env.JWT_SECRET || 'dev-secret-change-me', { expiresIn: '15m' });
    res.json({ setupToken });
  } catch (err) {
    res.status(500).json({ error: 'Verification failed' });
  }
});

// ── POST /api/auth/profile-setup ───────────────────────────────────────
router.post('/profile-setup', async (req, res) => {
  try {
    const { setupToken, username, displayName, avatar, langs, exp, bio } = req.body;
    let payload;
    try { payload = verifyToken(setupToken); } catch { return res.status(401).json({ error: 'Setup session expired, please sign up again' }); }
    if (payload.purpose !== 'setup') return res.status(401).json({ error: 'Invalid setup session' });

    if (!usernameRe.test(username || '')) return res.status(400).json({ error: 'Username must be 3-20 chars, letters/numbers/_' });
    const taken = await User.findOne({ username, _id: { $ne: payload.sub } });
    if (taken) return res.status(409).json({ error: 'Username already taken' });

    const user = await User.findById(payload.sub);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.username = username;
    user.displayName = (displayName || username).trim();
    user.avatar = avatar || '🤖';
    user.langs = Array.isArray(langs) ? langs.slice(0, 3) : [];
    user.exp = exp || 'beginner';
    user.bio = (bio || '').slice(0, 120);
    user.status = 'active';
    await user.save();

    let game = await GameState.findOne({ user: user._id });
    if (!game) game = await GameState.create({ user: user._id });

    const token = signToken({ sub: user._id.toString() });
    res.json({ token, ...publicUserAndGame(user, game) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Profile setup failed' });
  }
});

// ── POST /api/auth/login ───────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { method, email, phone, password } = req.body;
    if (!password) return res.status(400).json({ error: 'Password required' });
    const query = method === 'phone' ? { phone } : { email: (email || '').toLowerCase() };
    const user = await User.findOne({ ...query, status: 'active' });
    if (!user || !user.passwordHash) return res.status(401).json({ error: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    let game = await GameState.findOne({ user: user._id });
    if (!game) game = await GameState.create({ user: user._id });

    const token = signToken({ sub: user._id.toString() });
    res.json({ token, ...publicUserAndGame(user, game) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// ── POST /api/auth/guest ───────────────────────────────────────────────
router.post('/guest', async (req, res) => {
  try {
    const suffix = Math.floor(1000 + Math.random() * 9000);
    let username = `guest_${suffix}`;
    while (await User.findOne({ username })) username = `guest_${Math.floor(1000 + Math.random() * 9000)}`;

    const user = await User.create({
      username, displayName: 'Guest Agent', avatar: '👾', langs: ['python'], exp: 'beginner',
      bio: 'Playing as guest', verified: false, isGuest: true, status: 'active',
    });
    const game = await GameState.create({ user: user._id });
    const token = signToken({ sub: user._id.toString() });
    res.json({ token, ...publicUserAndGame(user, game) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Guest login failed' });
  }
});

// ── GET /api/auth/me ────────────────────────────────────────────────────
router.get('/me', async (req, res) => {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'No token' });
    const payload = verifyToken(token);
    const user = await User.findById(payload.sub);
    if (!user) return res.status(404).json({ error: 'User not found' });
    let game = await GameState.findOne({ user: user._id });
    if (!game) game = await GameState.create({ user: user._id });
    res.json(publicUserAndGame(user, game));
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
});

export default router;
