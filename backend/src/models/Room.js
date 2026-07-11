import mongoose from 'mongoose';

const memberSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    username: String,
    avatar: String,
    score: { type: Number, default: 0 },
    status: { type: String, enum: ['host', 'ready', 'waiting'], default: 'waiting' },
  },
  { _id: false }
);

const messageSchema = new mongoose.Schema(
  {
    sys: { type: Boolean, default: false },
    username: String,
    msg: String,
    at: { type: Date, default: Date.now },
  },
  { _id: false }
);

const roomSchema = new mongoose.Schema(
  {
    code: { type: String, unique: true, required: true, index: true },
    cat: { type: String, enum: ['code', 'apt', 'eng'], default: 'apt' },
    maxPlayers: { type: Number, default: 4 },
    host: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    members: { type: [memberSchema], default: [] },
    messages: { type: [messageSchema], default: [] },
    status: { type: String, enum: ['lobby', 'active', 'closed'], default: 'lobby' },
  },
  { timestamps: true }
);

export default mongoose.model('Room', roomSchema);
