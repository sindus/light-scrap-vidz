import { Film, Music } from 'lucide-react';

interface AudioToggleProps {
  value: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}

export function AudioToggle({ value, onChange, disabled }: AudioToggleProps) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-slate-400 shrink-0">Output</span>
      <div className="flex rounded-lg overflow-hidden border border-white/10 flex-1">
        <button
          type="button"
          onClick={() => onChange(false)}
          disabled={disabled}
          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${
            !value
              ? 'bg-violet-600/30 text-violet-300 border-r border-white/10'
              : 'text-slate-500 hover:text-slate-400 border-r border-white/10'
          }`}
        >
          <Film className="w-3 h-3" />
          Video MP4
        </button>
        <button
          type="button"
          onClick={() => onChange(true)}
          disabled={disabled}
          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${
            value ? 'bg-violet-600/30 text-violet-300' : 'text-slate-500 hover:text-slate-400'
          }`}
        >
          <Music className="w-3 h-3" />
          Audio MP3
        </button>
      </div>
    </div>
  );
}
