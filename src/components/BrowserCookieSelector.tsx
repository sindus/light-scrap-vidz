import { Cookie } from 'lucide-react';
import { Select } from '@/components/ui/select';
import type { CookiesBrowser } from '@/types';

const OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'No authentication' },
  { value: 'firefox', label: 'Firefox (logged in)' },
  { value: 'chrome', label: 'Chrome (logged in)' },
  { value: 'chromium', label: 'Chromium (logged in)' },
];

interface BrowserCookieSelectorProps {
  value: CookiesBrowser;
  onChange: (v: CookiesBrowser) => void;
  disabled?: boolean;
}

export function BrowserCookieSelector({ value, onChange, disabled }: BrowserCookieSelectorProps) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex items-center gap-1.5 text-sm text-slate-400 shrink-0">
        <Cookie className="w-3.5 h-3.5 text-violet-400" />
        Auth
      </span>
      <Select
        value={value ?? ''}
        onChange={(e) => onChange((e.target.value || null) as CookiesBrowser)}
        disabled={disabled}
        className="flex-1"
        aria-label="Browser for cookie authentication"
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
