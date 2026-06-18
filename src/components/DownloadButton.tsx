import { Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { DownloadStatus } from '@/types';

interface DownloadButtonProps {
  status: DownloadStatus;
  disabled?: boolean;
  onDownload: () => void;
  onCancel: () => void;
  onReset: () => void;
}

export function DownloadButton({
  status,
  disabled,
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
        <Button variant="outline" onClick={onReset} className="flex-1">
          Download another
        </Button>
      </div>
    );
  }

  return (
    <Button onClick={onDownload} disabled={disabled} className="w-full" size="lg">
      <Download className="w-4 h-4" />
      Download MP4
    </Button>
  );
}
