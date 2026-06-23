import { useState, useCallback } from 'react';
import { open } from '@tauri-apps/plugin-dialog';
import { BrowserCookieSelector } from '@/components/BrowserCookieSelector';
import type { CookiesBrowser } from '@/types';

interface SettingsSheetProps {
  open: boolean;
  onClose: () => void;
  outputDir: string;
  onOutputDirChange: (dir: string) => void;
  cookiesBrowser: CookiesBrowser;
  onCookiesBrowserChange: (v: CookiesBrowser) => void;
  detectedBrowsers: string[];
}

const sectionLabelStyle: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  color: '#6F6960',
  marginTop: 14,
  marginBottom: 2,
};

const cardStyle: React.CSSProperties = {
  background: '#1A1916',
  borderRadius: 11,
  border: '1px solid rgba(255,255,255,0.06)',
  padding: 13,
};

export function SettingsButton({
  open: isOpen,
  onClose,
  outputDir,
  onOutputDirChange,
  cookiesBrowser,
  onCookiesBrowserChange,
  detectedBrowsers,
}: SettingsSheetProps) {
  const [notif, setNotif] = useState(true);

  const handlePickFolder = useCallback(async () => {
    const selected = await open({ directory: true, multiple: false });
    if (typeof selected === 'string' && selected) {
      onOutputDirChange(selected);
    }
  }, [onOutputDirChange]);

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 40 }}
      />

      {/* Panel */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: 330,
          height: '100%',
          background: '#161512',
          borderLeft: '1px solid rgba(255,255,255,0.09)',
          boxShadow: '-24px 0 60px rgba(0,0,0,0.5)',
          padding: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          zIndex: 41,
          animation: 'lsv-fade 0.18s ease',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '16px', fontWeight: 700, color: '#F1EDE6' }}>Settings</span>
          <button
            onClick={onClose}
            aria-label="Close settings"
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              background: '#211F1B',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#A39D93',
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6L6 18" />
              <path d="M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* DOWNLOADS section */}
        <div style={sectionLabelStyle}>Downloads</div>

        <div style={cardStyle}>
          <div style={{ fontSize: '12px', color: '#857F75', marginBottom: 8 }}>Default folder</div>
          <button
            onClick={handlePickFolder}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              width: '100%',
              background: 'transparent',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              color: outputDir ? '#D6D1C8' : '#6F6960',
              transition: 'all .15s',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#C9F25E'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = outputDir ? '#D6D1C8' : '#6F6960'; }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" />
            </svg>
            <span
              style={{
                fontSize: '12.5px',
                fontFamily: "'JetBrains Mono', monospace",
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                direction: 'rtl',
                textAlign: 'left',
              }}
            >
              {outputDir || 'Choose folder…'}
            </span>
          </button>
        </div>

        <div style={{ ...cardStyle, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#D6D1C8' }}>Notify on finish</div>
            <div style={{ fontSize: '11px', color: '#6F6960', marginTop: 2 }}>System notification</div>
          </div>
          <button
            onClick={() => setNotif((v) => !v)}
            aria-label="Toggle notification"
            style={{
              width: 42,
              height: 24,
              borderRadius: 999,
              border: 'none',
              cursor: 'pointer',
              background: notif ? '#C9F25E' : '#211F1B',
              position: 'relative',
              transition: 'all .15s',
              flexShrink: 0,
            }}
          >
            <span
              style={{
                position: 'absolute',
                top: 3,
                left: notif ? 21 : 3,
                width: 18,
                height: 18,
                borderRadius: '50%',
                background: notif ? '#14140C' : '#857F75',
                transition: 'all .15s',
              }}
            />
          </button>
        </div>

        {/* AUTHENTICATION section */}
        <div style={sectionLabelStyle}>Authentication</div>

        <div style={cardStyle}>
          <div style={{ fontSize: '12px', color: '#857F75', marginBottom: 9 }}>Use cookies from browser</div>
          <BrowserCookieSelector
            value={cookiesBrowser}
            onChange={onCookiesBrowserChange}
            detectedBrowsers={detectedBrowsers}
          />
        </div>

        {/* Footer */}
        <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 8, paddingTop: 12 }}>
          <div
            style={{
              width: 20,
              height: 20,
              borderRadius: 6,
              background: '#C9F25E',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#14140C',
              flexShrink: 0,
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M12 4v11" />
              <path d="M7 11l5 5 5-5" />
              <path d="M5 20h14" />
            </svg>
          </div>
          <span style={{ fontSize: '11.5px', fontFamily: "'JetBrains Mono', monospace", color: '#6F6960' }}>
            light-scrap-vidZ · v1.0 · yt-dlp bundled
          </span>
        </div>
      </div>
    </>
  );
}
