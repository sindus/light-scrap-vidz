import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, XCircle, Loader } from 'lucide-react';
import type { DownloadProgress, DownloadStatus } from '@/types';

interface ProgressCardProps {
  status: DownloadStatus;
  progress: DownloadProgress | null;
  error: string | null;
}

export function ProgressCard({ status, progress, error }: ProgressCardProps) {
  if (status === 'idle' || status === 'ready' || status === 'fetching') return null;

  const percent = progress?.percent ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass p-4 space-y-3"
      role="status"
      aria-live="polite"
    >
      {status === 'downloading' && (
        <>
          {progress?.current_item != null && progress.total_items != null && (
            <div className="flex items-center gap-2 text-xs text-violet-400 font-medium">
              <span>Video {progress.current_item} / {progress.total_items}</span>
            </div>
          )}
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-slate-300">
              <Loader className="w-3.5 h-3.5 animate-spin text-violet-400" />
              {progress?.filename ? (
                <span className="truncate max-w-[260px] text-slate-400 text-xs">
                  {progress.filename}
                </span>
              ) : (
                'Starting download…'
              )}
            </span>
            <span className="font-mono text-violet-300 font-medium tabular-nums">
              {percent.toFixed(1)}%
            </span>
          </div>

          <div className="relative h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
            <motion.div
              className="absolute inset-y-0 left-0 rounded-full"
              style={{
                background: 'linear-gradient(90deg, #7c3aed 0%, #a78bfa 50%, #60a5fa 100%)',
                boxShadow: '0 0 12px rgba(167,139,250,0.6)',
              }}
              animate={{ width: `${percent}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              aria-valuenow={percent}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>

          {progress && (
            <div className="flex items-center gap-4 text-xs text-slate-500 tabular-nums">
              {progress.speed && progress.speed !== 'Unknown B/s' && (
                <span>{progress.speed}</span>
              )}
              {progress.eta && progress.eta !== 'Unknown' && (
                <span>ETA {progress.eta}</span>
              )}
            </div>
          )}
        </>
      )}

      {status === 'complete' && (
        <div className="flex items-center gap-2 text-emerald-400">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span className="text-sm font-medium">Download complete</span>
        </div>
      )}

      {status === 'error' && (
        <div className="flex items-start gap-2 text-red-400">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span className="text-sm">{error ?? 'An error occurred'}</span>
        </div>
      )}

      {status === 'cancelled' && (
        <div className="flex items-center gap-2 text-slate-500">
          <XCircle className="w-4 h-4 shrink-0" />
          <span className="text-sm">Download cancelled</span>
        </div>
      )}
    </motion.div>
  );
}
