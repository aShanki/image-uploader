import mongoose from 'mongoose';
import { IUser } from '@/types/models';

const userSchema = new mongoose.Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      trim: true,
    },
    image: String,
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    uploadCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Only create the model if it doesn't exist
const User = mongoose.models.User || mongoose.model<IUser>('User', userSchema);

export default User;