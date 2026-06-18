export type Platform = 'youtube' | 'tiktok' | 'instagram' | 'facebook' | 'unknown';

export type Quality = 'best' | '1080p' | '720p' | '480p';

export type DownloadStatus =
  | 'idle'
  | 'fetching'
  | 'ready'
  | 'downloading'
  | 'complete'
  | 'error'
  | 'cancelled';

export interface VideoFormat {
  format_id: string;
  ext: string;
  height: number | null;
  filesize: number | null;
  vcodec: string | null;
  acodec: string | null;
}

export interface VideoInfo {
  id: string;
  title: string;
  thumbnail: string;
  duration: number;
  uploader: string;
  webpage_url: string;
  extractor: string;
  formats: VideoFormat[];
}

export interface DownloadProgress {
  download_id: string;
  percent: number;
  speed: string;
  eta: string;
  filename: string;
}

export interface DownloadComplete {
  download_id: string;
  filepath: string;
}

export interface DownloadError {
  download_id: string;
  message: string;
}

export interface HistoryEntry {
  id: string;
  url: string;
  title: string;
  thumbnail: string;
  platform: Platform;
  filepath: string;
  downloaded_at: number;
  quality: Quality;
}
