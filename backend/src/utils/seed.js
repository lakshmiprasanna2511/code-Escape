import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { connectDB } from '../config/db.js';
import User from '../models/User.js';
import GameState from '../models/GameState.js';
import mongoose from 'mongoose';

const DEMO_USERS = [
  { username: 'x0r_master', avatar: '💀', score: 4850, solved: 14 },
  { username: 'nullptr', avatar: '🤖', score: 4200, solved: 12 },
  { username: 'seg_fault', avatar: '🦾', score: 3700, solved: 11 },
  { username: 'dev_ninja', avatar: '🕵️', score: 2800, solved: 8 },
  { username: 'b1tshift', avatar: '👾', score: 2100, solved: 7 },
];

async function seed() {
  await connectDB();
  for (const d of DEMO_USERS) {
    let user = await User.findOne({ username: d.username });
    if (!user) {
      const passwordHash = await bcrypt.hash('demo12345', 10);
      user = await User.create({
        username: d.username, displayName: d.username, avatar: d.avatar,
        langs: ['python'], exp: 'advanced', verified: true, status: 'active', passwordHash,
      });
    }
    await GameState.findOneAndUpdate(
      { user: user._id },
      { $set: { score: d.score, solved: d.solved } },
      { upsert: true }
    );
    console.log(`Seeded ${d.username} — score ${d.score}`);
  }
  await mongoose.disconnect();
  console.log('✅ Seed complete');
}

seed().catch((err) => { console.error(err); process.exit(1); });
