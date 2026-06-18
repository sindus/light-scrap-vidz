import { Zap } from 'lucide-react';
import { Select } from '@/components/ui/select';
import type { Quality } from '@/types';

interface FormatSelectorProps {
  value: Quality;
  onChange: (quality: Quality) => void;
  disabled?: boolean;
}

const QUALITY_OPTIONS: Array<{ value: Quality; label: string }> = [
  { value: 'best', label: 'Best quality (auto)' },
  { value: '1080p', label: '1080p Full HD' },
  { value: '720p', label: '720p HD' },
  { value: '480p', label: '480p SD' },
];

export function FormatSelector({ value, onChange, disabled }: FormatSelectorProps) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex items-center gap-1.5 text-sm text-slate-400 shrink-0">
        <Zap className="w-3.5 h-3.5 text-violet-400" />
        Quality
      </span>
      <Select
        value={value}
        onChange={(e) => onChange(e.target.value as Quality)}
        disabled={disabled}
        className="flex-1"
        aria-label="Video quality"
      >
        {QUALITY_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-slate-900">
            {opt.label}
          </option>
        ))}
      </Select>
    </div>
  );
}
