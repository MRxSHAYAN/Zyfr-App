import mongoose from 'mongoose';

/**
 * User Schema
 * Defines the core structure for application users.
 * Hashes passwords on save and generates default avatars using UI-Avatars API if none provided.
 */
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      minlength: [3, 'Username must be at least 3 characters long'],
    },
    fullName: {
      type: String,
      trim: true,
      default: '',
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
    },
    avatar: {
      type: String,
      default: '',
    },
    bio: {
      type: String,
      default: 'Hey there! I am using ZYFR.',
      trim: true,
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    lastSeen: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // Auto-generates createdAt and updatedAt fields
  }
);

// Fallback to dynamic avatar and default fullName generation before saving if missing
userSchema.pre('save', function (next) {
  if (!this.fullName) {
    this.fullName = this.username;
  }
  if (!this.avatar) {
    this.avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(this.fullName || this.username)}&background=00a884&color=fff&bold=true`;
  }
  next();
});

const User = mongoose.model('User', userSchema);
export default User;
