import { Download, X, Play, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { openFile, openFolder } from '@/lib/tauri-commands';
import type { DownloadStatus } from '@/types';

interface DownloadButtonProps {
  status: DownloadStatus;
  disabled?: boolean;
  audioOnly?: boolean;
  completedPath?: string | null;
  onDownload: () => void;
  onCancel: () => void;
  onReset: () => void;
}

export function DownloadButton({
  status,
  disabled,
  audioOnly,
  completedPath,
  onDownload,
  onCancel,
  onReset,
}: DownloadButtonProps) {
  if (status === 'downloading') {
    return (
      <Button variant="destructive" onClick={onCancel} className="w-full">
        <X className="w-4 h-4" />
        Cancel
      </Button>
    );
  }

  if (status === 'complete' || status === 'error' || status === 'cancelled') {
    return (
      <div className="flex gap-2">
        {status === 'complete' && completedPath && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => void openFile(completedPath)}
              className="shrink-0 text-violet-400 hover:text-violet-300"
              title="Open file"
            >
              <Play className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => void openFolder(completedPath)}
              className="shrink-0 text-slate-500 hover:text-slate-300"
              title="Reveal in folder"
            >
              <FolderOpen className="w-3.5 h-3.5" />
            </Button>
          </>
        )}
        <Button variant="outline" onClick={onReset} className="flex-1">
          Download another
        </Button>
      </div>
    );
  }

  const label = audioOnly ? 'Extract MP3' : 'Download MP4';
  return (
    <Button onClick={onDownload} disabled={disabled} className="w-full" size="lg">
      <Download className="w-4 h-4" />
      {label}
    </Button>
  );
}
