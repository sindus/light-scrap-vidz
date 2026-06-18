import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UrlInput } from '@/components/UrlInput';
import { VideoPreview } from '@/components/VideoPreview';
import { PlaylistPreview } from '@/components/PlaylistPreview';
import { FormatSelector } from '@/components/FormatSelector';
import { PlaylistEndSelector } from '@/components/PlaylistEndSelector';
import { FolderPicker } from '@/components/FolderPicker';
import { DownloadButton } from '@/components/DownloadButton';
import { ProgressCard } from '@/components/ProgressCard';
import { HistoryList } from '@/components/HistoryList';
import { Separator } from '@/components/ui/separator';
import { useVideoInfo } from '@/hooks/useVideoInfo';
import { usePlaylistInfo } from '@/hooks/usePlaylistInfo';
import { useDownload } from '@/hooks/useDownload';
import { useHistory } from '@/hooks/useHistory';
import { isPlaylistUrl } from '@/lib/url-validator';
import type { Quality, UrlKind } from '@/types';

export default function App() {
  const [url, setUrl] = useState('');
  const [quality, setQuality] = useState<Quality>('best');
  const [outputDir, setOutputDir] = useState('');
  const [urlKind, setUrlKind] = useState<UrlKind>('single');
  const [playlistEnd, setPlaylistEnd] = useState<number>(10);

  const {
    info,
    status: infoStatus,
    error: infoError,
    fetchInfo,
    reset: resetInfo,
  } = useVideoInfo();

  const {
    info: plInfo,
    status: plStatus,
    error: plError,
    fetchInfo: fetchPlInfo,
    reset: resetPlInfo,
  } = usePlaylistInfo();

  const { status, progress, error: dlError, download, cancel, reset: resetDownload } = useDownload();
  const { entries, clearHistory } = useHistory();

  const activeInfoStatus = urlKind === 'single' ? infoStatus : plStatus;
  const activeError = urlKind === 'single' ? infoError : plError;
  const isBusy = activeInfoStatus === 'loading' || status === 'downloading';
  const isActive =
    status === 'downloading' ||
    status === 'complete' ||
    status === 'error' ||
    status === 'cancelled';
  const showContent =
    (urlKind === 'single' && !!info) || (urlKind === 'playlist' && !!plInfo);

  const handleFetchInfo = useCallback(
    async (submittedUrl: string) => {
      setUrl(submittedUrl);
      resetDownload();
      resetInfo();
      resetPlInfo();

      if (isPlaylistUrl(submittedUrl)) {
        setUrlKind('playlist');
        await fetchPlInfo(submittedUrl);
      } else {
        setUrlKind('single');
        await fetchInfo(submittedUrl);
      }
    },
    [fetchInfo, fetchPlInfo, resetDownload, resetInfo, resetPlInfo],
  );

  const handleDownload = useCallback(async () => {
    if (!outputDir) return;
    if (urlKind === 'playlist' && plInfo) {
      await download(url, outputDir, quality, null, plInfo, playlistEnd);
    } else if (info) {
      await download(url, outputDir, quality, info, null, null);
    }
  }, [info, plInfo, outputDir, url, quality, urlKind, playlistEnd, download]);

  const handleReset = useCallback(() => {
    setUrl('');
    setUrlKind('single');
    resetInfo();
    resetPlInfo();
    resetDownload();
  }, [resetInfo, resetPlInfo, resetDownload]);

  return (
    <div className="h-screen flex flex-col overflow-hidden select-none">
      {/* Header */}
      <header className="px-6 pt-5 pb-4 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-base">
            ⬇️
          </div>
          <div>
            <h1 className="text-sm font-semibold text-slate-100 leading-none">light-scrap-vidZ</h1>
            <p className="text-[10px] text-slate-600 mt-0.5">Download any video as MP4</p>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-hidden flex">
        {/* Main panel */}
        <main className="flex-1 overflow-y-auto px-6 pb-6 space-y-4">
          {/* URL Input */}
          <div className="glass p-4">
            <UrlInput
              onSubmit={handleFetchInfo}
              isLoading={activeInfoStatus === 'loading'}
              disabled={isBusy}
            />
            {activeInfoStatus === 'error' && (
              <p className="mt-3 text-xs text-red-400">{activeError}</p>
            )}
          </div>

          {/* Preview + options */}
          <AnimatePresence>
            {showContent && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="space-y-3"
              >
                {urlKind === 'single' && info && <VideoPreview info={info} url={url} />}
                {urlKind === 'playlist' && plInfo && <PlaylistPreview info={plInfo} url={url} />}

                <div className="glass p-4 space-y-3">
                  <FormatSelector
                    value={quality}
                    onChange={setQuality}
                    disabled={isBusy || isActive}
                  />

                  {urlKind === 'playlist' && (
                    <>
                      <Separator />
                      <PlaylistEndSelector
                        value={playlistEnd}
                        onChange={setPlaylistEnd}
                        disabled={isBusy || isActive}
                      />
                    </>
                  )}

                  <Separator />
                  <FolderPicker
                    value={outputDir}
                    onChange={setOutputDir}
                    disabled={isBusy || isActive}
                  />
                </div>

                <ProgressCard status={status} progress={progress} error={dlError} />

                <DownloadButton
                  status={status}
                  disabled={!outputDir || isBusy}
                  onDownload={handleDownload}
                  onCancel={cancel}
                  onReset={handleReset}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* History sidebar */}
        <aside className="w-64 shrink-0 border-l border-white/5 px-4 py-4 overflow-y-auto">
          <HistoryList entries={entries} onClear={clearHistory} />
        </aside>
      </div>
    </div>
  );
}
