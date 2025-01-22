import mongoose from 'mongoose';
import { IImage } from '@/types/models';
import { nanoid } from 'nanoid';

const imageSchema = new mongoose.Schema<IImage>(
  {
    filename: {
      type: String,
      required: true,
      unique: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    shortUrl: {
      type: String,
      required: true,
      unique: true,
      default: () => nanoid(10),
    },
    mimeType: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    width: Number,
    height: Number,
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes
imageSchema.index({ shortUrl: 1 });
imageSchema.index({ uploadedBy: 1 });
imageSchema.index({ createdAt: -1 });

// Virtual for full URL
imageSchema.virtual('url').get(function() {
  return `${process.env.SITE_URL}/i/${this.shortUrl}`;
});

// Virtual for delete URL
imageSchema.virtual('deleteUrl').get(function() {
  return `${process.env.SITE_URL}/api/images/${this.shortUrl}/delete`;
});

// Only create the model if it doesn't exist
export const Image = mongoose.models.Image || mongoose.model<IImage>('Image', imageSchema);