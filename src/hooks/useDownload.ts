import { useState, useCallback, useRef, useEffect } from 'react';
import { listen, type UnlistenFn } from '@tauri-apps/api/event';
import { v4 as uuidv4 } from 'uuid';
import { startDownload, cancelDownload } from '@/lib/tauri-commands';
import type {
  DownloadStatus,
  DownloadProgress,
  DownloadComplete,
  DownloadError,
  HistoryEntry,
  Quality,
  VideoInfo,
} from '@/types';
import { getPlatform } from '@/lib/url-validator';
import { useHistory } from './useHistory';

interface UseDownloadReturn {
  status: DownloadStatus;
  progress: DownloadProgress | null;
  completedPath: string | null;
  error: string | null;
  download: (url: string, outputDir: string, quality: Quality, info: VideoInfo) => Promise<void>;
  cancel: () => Promise<void>;
  reset: () => void;
}

export function useDownload(): UseDownloadReturn {
  const [status, setStatus] = useState<DownloadStatus>('idle');
  const [progress, setProgress] = useState<DownloadProgress | null>(null);
  const [completedPath, setCompletedPath] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { addEntry } = useHistory();

  const downloadIdRef = useRef<string | null>(null);
  const unlistenRefs = useRef<UnlistenFn[]>([]);
  const currentInfoRef = useRef<{ url: string; info: VideoInfo; quality: Quality } | null>(null);

  const cleanup = useCallback(() => {
    unlistenRefs.current.forEach((fn) => fn());
    unlistenRefs.current = [];
  }, []);

  useEffect(() => () => cleanup(), [cleanup]);

  const download = useCallback(
    async (url: string, outputDir: string, quality: Quality, info: VideoInfo) => {
      cleanup();
      const id = uuidv4();
      downloadIdRef.current = id;
      currentInfoRef.current = { url, info, quality };
      setStatus('downloading');
      setProgress(null);
      setError(null);
      setCompletedPath(null);

      const unlistenProgress = await listen<DownloadProgress>('download://progress', (event) => {
        if (event.payload.download_id === id) {
          setProgress(event.payload);
        }
      });

      const unlistenComplete = await listen<DownloadComplete>('download://complete', (event) => {
        if (event.payload.download_id === id) {
          setStatus('complete');
          setCompletedPath(event.payload.filepath);
          cleanup();

          if (currentInfoRef.current) {
            const entry: HistoryEntry = {
              id,
              url: currentInfoRef.current.url,
              title: currentInfoRef.current.info.title,
              thumbnail: currentInfoRef.current.info.thumbnail,
              platform: getPlatform(currentInfoRef.current.url),
              filepath: event.payload.filepath,
              downloaded_at: Date.now(),
              quality: currentInfoRef.current.quality,
            };
            addEntry(entry);
          }
        }
      });

      const unlistenError = await listen<DownloadError>('download://error', (event) => {
        if (event.payload.download_id === id) {
          setStatus('error');
          setError(event.payload.message);
          cleanup();
        }
      });

      unlistenRefs.current = [unlistenProgress, unlistenComplete, unlistenError];

      try {
        await startDownload(url, outputDir, quality, id);
      } catch (err) {
        setStatus('error');
        setError(err instanceof Error ? err.message : String(err));
        cleanup();
      }
    },
    [cleanup, addEntry],
  );

  const cancel = useCallback(async () => {
    if (downloadIdRef.current) {
      try {
        await cancelDownload(downloadIdRef.current);
      } catch {
        // ignore
      }
    }
    setStatus('cancelled');
    cleanup();
  }, [cleanup]);

  const reset = useCallback(() => {
    setStatus('idle');
    setProgress(null);
    setCompletedPath(null);
    setError(null);
    downloadIdRef.current = null;
    currentInfoRef.current = null;
    cleanup();
  }, [cleanup]);

  return { status, progress, completedPath, error, download, cancel, reset };
}
