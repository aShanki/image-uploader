export interface ImageMetadata {
  id: string;
  filename: string;
  size: number;
  createdAt: string;
  url: string;
}

export interface UploadResponse {
  success: boolean;
  error?: string;
  image?: ImageMetadata;
}

export interface ImageGridProps {
  images: ImageMetadata[];
}