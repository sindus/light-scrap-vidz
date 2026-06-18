import { FolderOpen, Clock, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PLATFORM_META } from '@/lib/platform';
import { openFolder } from '@/lib/tauri-commands';
import type { HistoryEntry } from '@/types';

interface HistoryListProps {
  entries: HistoryEntry[];
  onClear: () => void;
}

function timeAgo(ms: number): string {
  const diff = Date.now() - ms;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function HistoryList({ entries, onClear }: HistoryListProps) {
  if (entries.length === 0) {
    return (
      <div className="text-center py-8 text-slate-600 text-sm">
        No downloads yet
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-slate-500 uppercase tracking-wider">Recent</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          className="text-slate-600 hover:text-slate-400 h-6 px-2"
          aria-label="Clear history"
        >
          <Trash2 className="w-3 h-3 mr-1" />
          Clear
        </Button>
      </div>

      <AnimatePresence initial={false}>
        {entries.map((entry) => {
          const meta = PLATFORM_META[entry.platform];
          return (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="glass p-3 flex items-center gap-3 group"
            >
              {entry.thumbnail && (
                <img
                  src={entry.thumbnail}
                  alt={entry.title}
                  className="w-12 h-8 rounded-lg object-cover shrink-0"
                  loading="lazy"
                />
              )}

              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-300 truncate">{entry.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge
                    className="text-[10px] px-1.5 py-0"
                    style={{
                      color: meta.color,
                      backgroundColor: meta.bgColor,
                      borderColor: meta.borderColor,
                    }}
                  >
                    {meta.label}
                  </Badge>
                  <span className="flex items-center gap-0.5 text-[10px] text-slate-600">
                    <Clock className="w-2.5 h-2.5" />
                    {timeAgo(entry.downloaded_at)}
                  </span>
                </div>
              </div>

              <button
                onClick={() => openFolder(entry.filepath)}
                className="shrink-0 text-slate-600 hover:text-violet-400 transition-colors opacity-0 group-hover:opacity-100"
                aria-label="Open folder"
                title="Reveal in folder"
              >
                <FolderOpen className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
