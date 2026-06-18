import { useState, useCallback } from 'react';
import { Link, ClipboardPaste, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { isValidUrl } from '@/lib/url-validator';

interface UrlInputProps {
  onSubmit: (url: string) => void;
  isLoading: boolean;
  disabled?: boolean;
}

export function UrlInput({ onSubmit, isLoading, disabled }: UrlInputProps) {
  const [value, setValue] = useState('');
  const [touched, setTouched] = useState(false);

  const isValid = isValidUrl(value.trim());
  const showError = touched && value.trim().length > 0 && !isValid;

  const handleSubmit = useCallback(() => {
    const url = value.trim();
    if (!isValid) {
      setTouched(true);
      return;
    }
    onSubmit(url);
  }, [value, isValid, onSubmit]);

  const handlePaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      setValue(text.trim());
      setTouched(false);
    } catch {
      // clipboard access denied
    }
  }, []);

  const handleClear = useCallback(() => {
    setValue('');
    setTouched(false);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') handleSubmit();
    },
    [handleSubmit],
  );

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Link className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
          <Input
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setTouched(false);
            }}
            onBlur={() => setTouched(true)}
            onKeyDown={handleKeyDown}
            placeholder="Paste a YouTube, TikTok, Instagram or Facebook URL…"
            className="pl-10 pr-10"
            disabled={disabled || isLoading}
            aria-label="Video URL"
            aria-invalid={showError}
          />
          {value && (
            <button
              onClick={handleClear}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
              aria-label="Clear URL"
              tabIndex={-1}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={handlePaste}
          disabled={disabled || isLoading}
          aria-label="Paste from clipboard"
          title="Paste from clipboard"
          className="shrink-0 w-11 h-11"
        >
          <ClipboardPaste className="w-4 h-4" />
        </Button>

        <Button
          onClick={handleSubmit}
          disabled={disabled || isLoading || !value.trim()}
          className="shrink-0"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Fetching…
            </span>
          ) : (
            'Get Info'
          )}
        </Button>
      </div>

      {showError && (
        <p className="text-xs text-red-400 px-1">
          This URL is not supported. Please use a YouTube, TikTok, Instagram or Facebook URL.
        </p>
      )}
    </div>
  );
}
