import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, CheckCircle, AlertCircle, Loader, Clock, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { QueueItem } from '@/types';

interface QueuePanelProps {
  items: QueueItem[];
  onAddUrls: (urls: string[]) => void;
  onRemoveItem: (id: string) => void;
  onClearDone: () => void;
  onClearAll: () => void;
}

function StatusIcon({ status }: { status: QueueItem['status'] }) {
  if (status === 'done') return <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />;
  if (status === 'error') return <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />;
  if (status === 'downloading')
    return <Loader className="w-3.5 h-3.5 text-violet-400 shrink-0 animate-spin" />;
  return <Clock className="w-3.5 h-3.5 text-slate-600 shrink-0" />;
}

export function QueuePanel({ items, onAddUrls, onRemoveItem, onClearDone, onClearAll }: QueuePanelProps) {
  const [input, setInput] = useState('');

  const handleAdd = useCallback(() => {
    const urls = input
      .split(/[\n\s,]+/)
      .map((s) => s.trim())
      .filter((s) => s.startsWith('http'));
    if (urls.length === 0) return;
    onAddUrls(urls);
    setInput('');
  }, [input, onAddUrls]);

  const pending = items.filter((i) => i.status === 'pending').length;
  const done = items.filter((i) => i.status === 'done' || i.status === 'error').length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500 uppercase tracking-wider">
          Queue{pending > 0 ? ` · ${pending} pending` : ''}
        </span>
        <div className="flex gap-1">
          {done > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearDone}
              className="text-slate-600 hover:text-slate-400 h-6 px-2 text-[10px]"
            >
              Clear done
            </Button>
          )}
          {items.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearAll}
              className="text-slate-600 hover:text-slate-400 h-6 px-2"
              aria-label="Clear all"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          )}
        </div>
      </div>

      {/* URL input */}
      <div className="space-y-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste URLs here (one per line)…"
          rows={3}
          className="w-full rounded-lg bg-white/5 border border-white/10 text-xs text-slate-300 placeholder:text-slate-600 px-3 py-2 resize-none focus:outline-none focus:border-violet-500/50 transition-colors"
        />
        <Button
          onClick={handleAdd}
          disabled={!input.trim()}
          size="sm"
          className="w-full"
          variant="outline"
        >
          <Plus className="w-3.5 h-3.5" />
          Add to queue
        </Button>
      </div>

      {/* Queue items */}
      {items.length === 0 ? (
        <div className="text-center py-6 text-slate-600 text-xs">Queue is empty</div>
      ) : (
        <div className="space-y-1.5">
          <AnimatePresence initial={false}>
            {items.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="glass p-2.5 flex items-start gap-2 group"
              >
                <StatusIcon status={item.status} />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-slate-400 truncate">{item.url}</p>
                  {item.status === 'downloading' && item.progress != null && (
                    <div className="mt-1 h-0.5 w-full rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full bg-violet-500 transition-all duration-300"
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                  )}
                  {item.status === 'error' && item.error && (
                    <p className="text-[10px] text-red-400 mt-0.5 line-clamp-2">{item.error}</p>
                  )}
                </div>
                {item.status === 'pending' && (
                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="shrink-0 text-slate-700 hover:text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Remove from queue"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
