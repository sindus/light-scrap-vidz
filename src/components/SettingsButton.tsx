import { useState, useRef, useEffect } from 'react';
import { Settings, RefreshCw, Check, AlertCircle } from 'lucide-react';
import { updateYtDlp } from '@/lib/tauri-commands';

type UpdateState = 'idle' | 'loading' | 'done' | 'error';

export function SettingsButton() {
  const [open, setOpen] = useState(false);
  const [updateState, setUpdateState] = useState<UpdateState>('idle');
  const [message, setMessage] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleUpdate = async () => {
    setUpdateState('loading');
    setMessage('');
    try {
      const result = await updateYtDlp();
      setUpdateState('done');
      setMessage(result.includes('already') || result.includes('up-to-date') ? 'Already up to date' : 'Updated!');
    } catch (err) {
      setUpdateState('error');
      setMessage(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-600 hover:text-slate-400 hover:bg-white/5 transition-colors"
        aria-label="Settings"
      >
        <Settings className="w-4 h-4" />
      </button>

      {open && (
        <div className="absolute right-0 top-9 z-50 w-56 glass rounded-xl border border-white/10 shadow-2xl p-2">
          <p className="text-[10px] text-slate-600 uppercase tracking-wider px-2 pb-1.5">Settings</p>

          <button
            onClick={() => void handleUpdate()}
            disabled={updateState === 'loading'}
            className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm text-slate-300 hover:bg-white/5 disabled:opacity-50 transition-colors"
          >
            {updateState === 'loading' ? (
              <RefreshCw className="w-3.5 h-3.5 text-violet-400 animate-spin" />
            ) : updateState === 'done' ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : updateState === 'error' ? (
              <AlertCircle className="w-3.5 h-3.5 text-red-400" />
            ) : (
              <RefreshCw className="w-3.5 h-3.5 text-violet-400" />
            )}
            <span>
              {updateState === 'loading'
                ? 'Updating yt-dlp…'
                : updateState === 'done'
                  ? 'yt-dlp updated'
                  : updateState === 'error'
                    ? 'Update failed'
                    : 'Update yt-dlp'}
            </span>
          </button>

          {message && (
            <p
              className={`text-[10px] px-2 pb-1 ${updateState === 'error' ? 'text-red-400' : 'text-slate-500'}`}
            >
              {message}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
