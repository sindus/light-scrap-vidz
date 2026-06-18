import { invoke } from '@tauri-apps/api/core';
import type { PlaylistInfo, VideoInfo } from '@/types';

export const fetchVideoInfo = (url: string): Promise<VideoInfo> =>
  invoke('fetch_video_info', { url });

export const fetchPlaylistInfo = (url: string): Promise<PlaylistInfo> =>
  invoke('fetch_playlist_info', { url });

export const startDownload = (
  url: string,
  outputDir: string,
  quality: string,
  downloadId: string,
  playlistEnd?: number | null,
): Promise<void> =>
  invoke('start_download', {
    url,
    outputDir,
    quality,
    downloadId,
    playlistEnd: playlistEnd ?? null,
  });

export const cancelDownload = (downloadId: string): Promise<void> =>
  invoke('cancel_download', { downloadId });

export const openFolder = (path: string): Promise<void> => invoke('open_folder', { path });
