import { Hash } from 'lucide-react';
import { Select } from '@/components/ui/select';

const OPTIONS = [
  { value: '5', label: 'Latest 5 videos' },
  { value: '10', label: 'Latest 10 videos' },
  { value: '20', label: 'Latest 20 videos' },
  { value: '50', label: 'Latest 50 videos' },
  { value: '0', label: 'All videos' },
];

interface PlaylistEndSelectorProps {
  value: number;
  onChange: (n: number) => void;
  disabled?: boolean;
}

export function PlaylistEndSelector({ value, onChange, disabled }: PlaylistEndSelectorProps) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex items-center gap-1.5 text-sm text-slate-400 shrink-0">
        <Hash className="w-3.5 h-3.5 text-violet-400" />
        Download
      </span>
      <Select
        value={String(value)}
        onChange={(e) => onChange(Number(e.target.value))}
        disabled={disabled}
        className="flex-1"
        aria-label="Number of videos to download"
      >
        {OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-slate-900">
            {opt.label}
          </option>
        ))}
      </Select>
    </div>
  );
}
