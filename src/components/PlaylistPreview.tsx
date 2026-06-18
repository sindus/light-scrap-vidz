import { List, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { PLATFORM_META } from '@/lib/platform';
import { getPlatform } from '@/lib/url-validator';
import type { PlaylistInfo } from '@/types';

interface PlaylistPreviewProps {
  info: PlaylistInfo;
  url: string;
}

export function PlaylistPreview({ info, url }: PlaylistPreviewProps) {
  const platform = getPlatform(url);
  const meta = PLATFORM_META[platform] ?? PLATFORM_META['unknown'];

  return (
    <div className="glass p-4 flex gap-4">
      <div className="shrink-0 w-32 h-20 rounded-xl bg-white/5 flex items-center justify-center">
        <List className="w-8 h-8 text-slate-600" />
      </div>

      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
        <div className="space-y-1.5">
          <Badge
            style={{
              color: meta.color,
              backgroundColor: meta.bgColor,
              borderColor: meta.borderColor,
            }}
          >
            {meta.label} Playlist
          </Badge>
          <h3 className="text-sm font-medium text-slate-100 line-clamp-2 leading-snug">
            {info.title || 'Untitled Playlist'}
          </h3>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-500">
          {info.uploader && (
            <span className="flex items-center gap-1">
              <User className="w-3 h-3" />
              {info.uploader}
            </span>
          )}
          {info.playlist_count != null && (
            <span className="flex items-center gap-1">
              <List className="w-3 h-3" />
              {info.playlist_count} videos
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
