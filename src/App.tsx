import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UrlInput } from '@/components/UrlInput';
import { VideoPreview } from '@/components/VideoPreview';
import { PlaylistPreview } from '@/components/PlaylistPreview';
import { FormatSelector } from '@/components/FormatSelector';
import { AudioToggle } from '@/components/AudioToggle';
import { PlaylistEndSelector } from '@/components/PlaylistEndSelector';
import { FolderPicker } from '@/components/FolderPicker';
import { BrowserCookieSelector } from '@/components/BrowserCookieSelector';
import { DownloadButton } from '@/components/DownloadButton';
import { ProgressCard } from '@/components/ProgressCard';
import { HistoryList } from '@/components/HistoryList';
import { QueuePanel } from '@/components/QueuePanel';
import { SettingsButton } from '@/components/SettingsButton';
import { Separator } from '@/components/ui/separator';
import { useVideoInfo } from '@/hooks/useVideoInfo';
import { usePlaylistInfo } from '@/hooks/usePlaylistInfo';
import { useDownload } from '@/hooks/useDownload';
import { useHistory } from '@/hooks/useHistory';
import { useQueue } from '@/hooks/useQueue';
import { isPlaylistUrl, getPlatform } from '@/lib/url-validator';
import { detectInstalledBrowsers } from '@/lib/tauri-commands';
import type { CookiesBrowser, Quality, UrlKind } from '@/types';

const OUTPUT_DIR_KEY = 'light-scrap-vidZ:outputDir';
const NEEDS_AUTH_PLATFORMS = new Set(['instagram', 'tiktok', 'facebook']);

export default function App() {
  const [url, setUrl] = useState('');
  const [quality, setQuality] = useState<Quality>('best');
  const [outputDir, setOutputDir] = useState(() => localStorage.getItem(OUTPUT_DIR_KEY) ?? '');
  const [urlKind, setUrlKind] = useState<UrlKind>('single');
  const [playlistEnd, setPlaylistEnd] = useState<number>(10);
  const [cookiesBrowser, setCookiesBrowser] = useState<CookiesBrowser>(null);
  const [audioOnly, setAudioOnly] = useState(false);
  const [detectedBrowsers, setDetectedBrowsers] = useState<string[]>([]);
  const [sidebarTab, setSidebarTab] = useState<'history' | 'queue'>('history');

  // Persist output folder
  const handleSetOutputDir = useCallback((dir: string) => {
    setOutputDir(dir);
    localStorage.setItem(OUTPUT_DIR_KEY, dir);
  }, []);

  // Detect installed browsers on mount
  useEffect(() => {
    void detectInstalledBrowsers().then(setDetectedBrowsers).catch(() => {});
  }, []);

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

  const { status, progress, completedPath, error: dlError, download, cancel, reset: resetDownload } = useDownload();

  const { entries, clearHistory } = useHistory();

  const { items: queueItems, isActive: queueActive, addItems: addToQueue, removeItem: removeQueueItem, clearDone: clearQueueDone, clearAll: clearQueueAll } = useQueue();

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

  // Auto-suggest browser for platforms that need auth
  const handleUrlChange = useCallback((submittedUrl: string) => {
    const platform = getPlatform(submittedUrl);
    if (NEEDS_AUTH_PLATFORMS.has(platform) && !cookiesBrowser && detectedBrowsers.length > 0) {
      setCookiesBrowser(detectedBrowsers[0] as CookiesBrowser);
    }
  }, [cookiesBrowser, detectedBrowsers]);

  const handleFetchInfo = useCallback(
    async (submittedUrl: string) => {
      setUrl(submittedUrl);
      resetDownload();
      resetInfo();
      resetPlInfo();
      handleUrlChange(submittedUrl);

      if (isPlaylistUrl(submittedUrl)) {
        setUrlKind('playlist');
        await fetchPlInfo(submittedUrl, cookiesBrowser ?? undefined);
      } else {
        setUrlKind('single');
        await fetchInfo(submittedUrl, cookiesBrowser ?? undefined);
      }
    },
    [fetchInfo, fetchPlInfo, resetDownload, resetInfo, resetPlInfo, cookiesBrowser, handleUrlChange],
  );

  const handleDownload = useCallback(async () => {
    if (!outputDir) return;
    if (urlKind === 'playlist' && plInfo) {
      await download(url, outputDir, quality, null, plInfo, playlistEnd, cookiesBrowser, audioOnly);
    } else if (info) {
      await download(url, outputDir, quality, info, null, null, cookiesBrowser, audioOnly);
    }
  }, [info, plInfo, outputDir, url, quality, urlKind, playlistEnd, cookiesBrowser, audioOnly, download]);

  const handleAddToQueue = useCallback(
    (urls: string[]) => {
      if (!outputDir) return;
      addToQueue(
        urls.map((u) => ({
          url: u,
          outputDir,
          quality,
          audioOnly,
          playlistEnd: isPlaylistUrl(u) ? playlistEnd : null,
          cookiesBrowser,
        })),
      );
      setSidebarTab('queue');
    },
    [addToQueue, outputDir, quality, audioOnly, playlistEnd, cookiesBrowser],
  );

  const handleReset = useCallback(() => {
    setUrl('');
    setUrlKind('single');
    resetInfo();
    resetPlInfo();
    resetDownload();
  }, [resetInfo, resetPlInfo, resetDownload]);

  // Switch to queue tab when queue becomes active
  useEffect(() => {
    if (queueActive) setSidebarTab('queue');
  }, [queueActive]);

  const pendingCount = queueItems.filter((i) => i.status === 'pending').length;

  return (
    <div className="h-screen flex flex-col overflow-hidden select-none">
      {/* Header */}
      <header className="px-6 pt-5 pb-4 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-base">
            ⬇️
          </div>
          <div className="flex-1">
            <h1 className="text-sm font-semibold text-slate-100 leading-none">light-scrap-vidZ</h1>
            <p className="text-[10px] text-slate-600 mt-0.5">Download any video as MP4</p>
          </div>
          <SettingsButton />
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
                  <AudioToggle
                    value={audioOnly}
                    onChange={setAudioOnly}
                    disabled={isBusy || isActive}
                  />

                  {!audioOnly && (
                    <>
                      <Separator />
                      <FormatSelector
                        value={quality}
                        onChange={setQuality}
                        disabled={isBusy || isActive}
                      />
                    </>
                  )}

                  <Separator />
                  <BrowserCookieSelector
                    value={cookiesBrowser}
                    onChange={setCookiesBrowser}
                    disabled={isBusy || isActive}
                    detectedBrowsers={detectedBrowsers}
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
                    onChange={handleSetOutputDir}
                    disabled={isBusy || isActive}
                  />
                </div>

                <ProgressCard status={status} progress={progress} error={dlError} />

                <DownloadButton
                  status={status}
                  disabled={!outputDir || isBusy}
                  audioOnly={audioOnly}
                  completedPath={completedPath}
                  onDownload={handleDownload}
                  onCancel={cancel}
                  onReset={handleReset}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Sidebar */}
        <aside className="w-64 shrink-0 border-l border-white/5 flex flex-col">
          {/* Tabs */}
          <div className="flex border-b border-white/5 shrink-0">
            <button
              onClick={() => setSidebarTab('history')}
              className={`flex-1 py-2.5 text-xs font-medium transition-colors ${
                sidebarTab === 'history'
                  ? 'text-slate-300 border-b border-violet-500'
                  : 'text-slate-600 hover:text-slate-400'
              }`}
            >
              Recent
            </button>
            <button
              onClick={() => setSidebarTab('queue')}
              className={`flex-1 py-2.5 text-xs font-medium transition-colors relative ${
                sidebarTab === 'queue'
                  ? 'text-slate-300 border-b border-violet-500'
                  : 'text-slate-600 hover:text-slate-400'
              }`}
            >
              Queue
              {pendingCount > 0 && (
                <span className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full bg-violet-600 text-[9px] text-white">
                  {pendingCount}
                </span>
              )}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4">
            {sidebarTab === 'history' ? (
              <HistoryList entries={entries} onClear={clearHistory} />
            ) : (
              <QueuePanel
                items={queueItems}
                onAddUrls={handleAddToQueue}
                onRemoveItem={removeQueueItem}
                onClearDone={clearQueueDone}
                onClearAll={clearQueueAll}
              />
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
