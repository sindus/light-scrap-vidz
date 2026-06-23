interface PlaylistEndSelectorProps {
  value: number;
  onChange: (n: number) => void;
  disabled?: boolean;
}

const OPTIONS = [
  { value: '5', label: 'Latest 5' },
  { value: '10', label: 'Latest 10' },
  { value: '20', label: 'Latest 20' },
  { value: '50', label: 'Latest 50' },
  { value: '0', label: 'All videos' },
];

export function PlaylistEndSelector({ value, onChange, disabled }: PlaylistEndSelectorProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
      <span style={{ fontSize: '13px', fontWeight: 600, color: '#C2BCB2', flexShrink: 0 }}>Count</span>
      <select
        value={String(value)}
        onChange={(e) => onChange(Number(e.target.value))}
        disabled={disabled}
        aria-label="Number of videos to download"
        style={{
          background: '#211F1B',
          border: '1px solid rgba(255,255,255,0.10)',
          color: '#D6D1C8',
          borderRadius: 8,
          fontSize: '12.5px',
          fontWeight: 600,
          padding: '6px 10px',
          cursor: disabled ? 'default' : 'pointer',
          outline: 'none',
        }}
      >
        {OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value} style={{ background: '#1A1916' }}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
