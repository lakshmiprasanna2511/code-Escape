import mongoose from 'mongoose';

const gameStateSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true, required: true, index: true },
    score: { type: Number, default: 0 },
    solved: { type: Number, default: 0 },
    att: { type: Number, default: 0 },
    corr: { type: Number, default: 0 },
    tPlayed: { type: Number, default: 0 },
    lStats: {
      type: Map,
      of: Number,
      default: () => ({ python: 0, java: 0, cpp: 0, c: 0, sql: 0, js: 0 }),
    },
    lvDone: { type: [Boolean], default: () => Array(6).fill(false) },
    objDone: { type: Map, of: Boolean, default: () => ({}) },
    aptScore: { type: Number, default: 0 },
    engScore: { type: Number, default: 0 },
    quizAptDone: { type: [Boolean], default: () => Array(3).fill(false) },
    quizEngDone: { type: [Boolean], default: () => Array(3).fill(false) },
  },
  { timestamps: true }
);

function mapToObj(m) {
  if (!m) return {};
  if (m instanceof Map) return Object.fromEntries(m);
  return m;
}

gameStateSchema.methods.toPublicJSON = function () {
  return {
    score: this.score,
    solved: this.solved,
    att: this.att,
    corr: this.corr,
    tPlayed: this.tPlayed,
    lStats: mapToObj(this.lStats),
    lvDone: this.lvDone,
    objDone: mapToObj(this.objDone),
    aptScore: this.aptScore,
    engScore: this.engScore,
    quizAptDone: this.quizAptDone,
    quizEngDone: this.quizEngDone,
  };
};

export default mongoose.model('GameState', gameStateSchema);
