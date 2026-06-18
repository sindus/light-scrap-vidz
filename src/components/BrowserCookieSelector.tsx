import { Cookie } from 'lucide-react';
import { Select } from '@/components/ui/select';
import type { CookiesBrowser } from '@/types';

const ALL_OPTIONS: { value: string; label: string; browser: string | null }[] = [
  { value: '', label: 'No authentication', browser: null },
  { value: 'firefox', label: 'Firefox', browser: 'firefox' },
  { value: 'chrome', label: 'Chrome', browser: 'chrome' },
  { value: 'chromium', label: 'Chromium', browser: 'chromium' },
];

interface BrowserCookieSelectorProps {
  value: CookiesBrowser;
  onChange: (v: CookiesBrowser) => void;
  disabled?: boolean;
  detectedBrowsers?: string[];
}

export function BrowserCookieSelector({
  value,
  onChange,
  disabled,
  detectedBrowsers,
}: BrowserCookieSelectorProps) {
  // Show all options if detection not done yet; otherwise only detected + none
  const options =
    detectedBrowsers && detectedBrowsers.length > 0
      ? ALL_OPTIONS.filter((o) => o.browser === null || detectedBrowsers.includes(o.browser))
      : ALL_OPTIONS;

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
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-slate-900">
            {opt.browser ? `${opt.label} (logged in)` : opt.label}
          </option>
        ))}
      </Select>
    </div>
  );
}
