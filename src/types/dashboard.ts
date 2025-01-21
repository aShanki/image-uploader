export interface ImageItem {
  id: string;
  filename: string;
  originalName: string;
  shortUrl: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  views: number;
  createdAt: string;
  url: string;
  deleteUrl: string;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface ImagesResponse {
  images: ImageItem[];
  pagination: PaginationInfo;
}

export interface ImageGridProps {
  images: ImageItem[];
  onDelete: (id: string) => Promise<void>;
  onCopyUrl: (url: string) => void;
}

export interface ImageCardProps {
  image: ImageItem;
  onDelete: (id: string) => Promise<void>;
  onCopyUrl: (url: string) => void;
}

export interface DashboardState {
  search: string;
  page: number;
  limit: number;
  isLoading: boolean;
  error: string | null;
}

export interface ImageStats {
  totalImages: number;
  totalViews: number;
  totalSize: number;
  recentUploads: number;
}