import type { Quality } from '@/types';

interface FormatSelectorProps {
  audioOnly: boolean;
  onAudioOnlyChange: (v: boolean) => void;
  quality: Quality;
  onQualityChange: (q: Quality) => void;
  disabled?: boolean;
}

const QUALITIES: { value: Quality; label: string }[] = [
  { value: 'best', label: 'Best' },
  { value: '1080p', label: '1080p' },
  { value: '720p', label: '720p' },
  { value: '480p', label: '480p' },
];

export function FormatSelector({
  audioOnly,
  onAudioOnlyChange,
  quality,
  onQualityChange,
  disabled,
}: FormatSelectorProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
      {/* Format row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <span style={{ fontSize: '13px', fontWeight: 600, color: '#C2BCB2' }}>Format</span>
        <div
          style={{
            display: 'flex',
            gap: 3,
            padding: 3,
            background: '#211F1B',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 10,
          }}
        >
          {[
            { v: false, label: 'Video · MP4' },
            { v: true, label: 'Audio · MP3' },
          ].map((seg) => {
            const active = audioOnly === seg.v;
            return (
              <button
                key={seg.label}
                onClick={() => onAudioOnlyChange(seg.v)}
                disabled={disabled}
                style={{
                  padding: '6px 14px',
                  borderRadius: 8,
                  border: 'none',
                  cursor: disabled ? 'default' : 'pointer',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  background: active ? '#C9F25E' : 'transparent',
                  color: active ? '#14140C' : '#9C968C',
                  boxShadow: active ? '0 2px 8px rgba(201,242,94,0.25)' : 'none',
                  transition: 'all .15s',
                }}
              >
                {seg.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Quality row */}
      {!audioOnly && (
        <>
          <div style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#C2BCB2' }}>Quality</span>
            <div style={{ display: 'flex', gap: 6 }}>
              {QUALITIES.map((q) => {
                const active = quality === q.value;
                return (
                  <button
                    key={q.value}
                    onClick={() => onQualityChange(q.value)}
                    disabled={disabled}
                    style={{
                      padding: '5px 11px',
                      borderRadius: 8,
                      cursor: disabled ? 'default' : 'pointer',
                      fontSize: '12.5px',
                      fontWeight: 600,
                      background: active ? '#C9F25E' : '#211F1B',
                      color: active ? '#14140C' : '#B6B0A6',
                      border: active ? '1px solid transparent' : '1px solid rgba(255,255,255,0.10)',
                      transition: 'all .15s',
                    }}
                  >
                    {q.label}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
