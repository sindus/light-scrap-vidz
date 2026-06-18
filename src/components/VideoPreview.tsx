import { Clock, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { PLATFORM_META } from '@/lib/platform';
import { formatDuration } from '@/lib/utils';
import { getPlatform } from '@/lib/url-validator';
import type { VideoInfo } from '@/types';

interface VideoPreviewProps {
  info: VideoInfo;
  url: string;
}

export function VideoPreview({ info, url }: VideoPreviewProps) {
  const platform = getPlatform(url);
  const meta = PLATFORM_META[platform];

  return (
    <div className="glass p-4 flex gap-4">
      <div className="relative shrink-0 w-32 h-20 rounded-xl overflow-hidden bg-white/5">
        {info.thumbnail ? (
          <img
            src={info.thumbnail}
            alt={info.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-600">
            <span className="text-2xl">🎬</span>
          </div>
        )}
        {info.duration > 0 && (
          <span className="absolute bottom-1.5 right-1.5 bg-black/70 text-white text-[10px] font-medium px-1.5 py-0.5 rounded-md backdrop-blur-sm">
            {formatDuration(info.duration)}
          </span>
        )}
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
            {meta.label}
          </Badge>
          <h3 className="text-sm font-medium text-slate-100 line-clamp-2 leading-snug">
            {info.title}
          </h3>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-500">
          {info.uploader && (
            <span className="flex items-center gap-1">
              <User className="w-3 h-3" />
              {info.uploader}
            </span>
          )}
          {info.duration > 0 && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDuration(info.duration)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
