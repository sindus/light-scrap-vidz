import { PLATFORM_META, PLATFORM_TINT } from '@/lib/platform';
import { getPlatform } from '@/lib/url-validator';
import type { PlaylistInfo } from '@/types';

interface PlaylistPreviewProps {
  info: PlaylistInfo;
  url: string;
}

export function PlaylistPreview({ info, url }: PlaylistPreviewProps) {
  const platform = getPlatform(url);
  const meta = PLATFORM_META[platform] ?? PLATFORM_META['unknown'];
  const tint = PLATFORM_TINT[platform] ?? PLATFORM_TINT['unknown'];
  const count = info.playlist_count ?? info.entries?.length ?? 0;

  return (
    <div
      style={{
        display: 'flex',
        gap: 15,
        padding: 15,
        background: '#1A1916',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 14,
      }}
    >
      {/* Thumbnail placeholder */}
      <div
        style={{
          position: 'relative',
          flexShrink: 0,
          width: 124,
          height: 78,
          borderRadius: 9,
          overflow: 'hidden',
          background: 'repeating-linear-gradient(135deg, #211F1A 0 7px, #1A1815 7px 14px)',
        }}
      >
        <div style={{ position: 'absolute', inset: 0, background: tint, opacity: 0.12 }} />
      </div>

      {/* Right column */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 7 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              padding: '2px 8px',
              borderRadius: 999,
              fontSize: '10px',
              fontWeight: 700,
              color: meta.color,
              background: meta.bgColor,
              border: `1px solid ${meta.borderColor}`,
            }}
          >
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: tint }} />
            {meta.label}
          </span>
          <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#857F75' }}>
            Playlist
          </span>
        </div>

        <h3
          style={{
            margin: 0,
            fontSize: '15.5px',
            fontWeight: 700,
            color: '#F1EDE6',
            letterSpacing: '-0.01em',
            lineHeight: 1.25,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {info.title || 'Untitled Playlist'}
        </h3>

        <div style={{ fontSize: '12.5px', fontFamily: "'JetBrains Mono', monospace", color: '#857F75' }}>
          {[info.uploader, `Playlist · ${count} videos`].filter(Boolean).join(' · ')}
        </div>
      </div>
    </div>
  );
}
