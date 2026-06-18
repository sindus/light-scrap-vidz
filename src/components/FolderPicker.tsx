import { useCallback } from 'react';
import { FolderOpen } from 'lucide-react';
import { open } from '@tauri-apps/plugin-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface FolderPickerProps {
  value: string;
  onChange: (path: string) => void;
  disabled?: boolean;
}

export function FolderPicker({ value, onChange, disabled }: FolderPickerProps) {
  const handlePick = useCallback(async () => {
    const selected = await open({ directory: true, multiple: false });
    if (typeof selected === 'string' && selected) {
      onChange(selected);
    }
  }, [onChange]);

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-slate-400 shrink-0">
        <FolderOpen className="inline w-3.5 h-3.5 mr-1.5 text-violet-400" />
        Save to
      </span>
      <div className="flex flex-1 gap-2">
        <Input
          value={value}
          readOnly
          placeholder="Choose output folder…"
          className="flex-1 cursor-default"
          aria-label="Output folder"
        />
        <Button
          variant="outline"
          onClick={handlePick}
          disabled={disabled}
          className="shrink-0"
          aria-label="Browse folders"
        >
          Browse
        </Button>
      </div>
    </div>
  );
}
