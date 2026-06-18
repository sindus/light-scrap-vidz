import { invoke } from '@tauri-apps/api/core';
import type { CookiesBrowser, PlaylistInfo, VideoInfo } from '@/types';

export const fetchVideoInfo = (url: string, cookiesBrowser?: CookiesBrowser): Promise<VideoInfo> =>
  invoke('fetch_video_info', { url, cookiesBrowser: cookiesBrowser ?? null });

export const fetchPlaylistInfo = (
  url: string,
  cookiesBrowser?: CookiesBrowser,
): Promise<PlaylistInfo> =>
  invoke('fetch_playlist_info', { url, cookiesBrowser: cookiesBrowser ?? null });

export const startDownload = (
  url: string,
  outputDir: string,
  quality: string,
  downloadId: string,
  playlistEnd?: number | null,
  cookiesBrowser?: CookiesBrowser,
): Promise<void> =>
  invoke('start_download', {
    url,
    outputDir,
    quality,
    downloadId,
    playlistEnd: playlistEnd ?? null,
    cookiesBrowser: cookiesBrowser ?? null,
  });

export const cancelDownload = (downloadId: string): Promise<void> =>
  invoke('cancel_download', { downloadId });

export const openFolder = (path: string): Promise<void> => invoke('open_folder', { path });
