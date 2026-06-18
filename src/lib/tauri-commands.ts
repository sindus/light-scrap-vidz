import { invoke } from '@tauri-apps/api/core';
import type { VideoInfo } from '@/types';

export const fetchVideoInfo = (url: string): Promise<VideoInfo> =>
  invoke('fetch_video_info', { url });

export const startDownload = (
  url: string,
  outputDir: string,
  quality: string,
  downloadId: string,
): Promise<void> => invoke('start_download', { url, outputDir, quality, downloadId });

export const cancelDownload = (downloadId: string): Promise<void> =>
  invoke('cancel_download', { downloadId });

export const openFolder = (path: string): Promise<void> => invoke('open_folder', { path });
