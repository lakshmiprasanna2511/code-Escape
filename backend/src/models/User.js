import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema(
  {
    code: String,
    contact: String,
    method: { type: String, enum: ['email', 'phone'] },
    expiresAt: Date,
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    username: { type: String, unique: true, sparse: true, trim: true, minlength: 3, maxlength: 20 },
    displayName: { type: String, trim: true, maxlength: 30 },
    email: { type: String, lowercase: true, trim: true, sparse: true, index: true },
    phone: { type: String, trim: true, sparse: true, index: true },
    passwordHash: { type: String },
    avatar: { type: String, default: '🤖' },
    langs: { type: [String], default: [] },
    exp: { type: String, enum: ['beginner', 'intermediate', 'advanced', 'expert'], default: 'beginner' },
    bio: { type: String, maxlength: 120, default: '' },
    verified: { type: Boolean, default: false },
    isGuest: { type: Boolean, default: false },
    status: { type: String, enum: ['pending', 'active'], default: 'pending' },
    otp: otpSchema,
  },
  { timestamps: true }
);

userSchema.methods.toPublicJSON = function () {
  return {
    id: this._id,
    username: this.username,
    displayName: this.displayName,
    email: this.email || '',
    phone: this.phone || '',
    avatar: this.avatar,
    langs: this.langs,
    exp: this.exp,
    bio: this.bio,
    verified: this.verified,
    isGuest: this.isGuest,
    joinedAt: this.createdAt ? new Date(this.createdAt).toLocaleDateString() : '',
  };
};

export default mongoose.model('User', userSchema);
