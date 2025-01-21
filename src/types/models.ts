import { Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  name?: string;
  image?: string;
  role: 'user' | 'admin';
  uploadCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IImage extends Document {
  filename: string;
  originalName: string;
  shortUrl: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  uploadedBy: IUser['_id'];
  isPublic: boolean;
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface UploadResponse {
  url: string;
  deleteUrl?: string;
  thumbnailUrl?: string;
}

export interface ErrorResponse {
  error: string;
  code?: string;
}