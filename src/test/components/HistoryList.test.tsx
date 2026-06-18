import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { HistoryList } from '@/components/HistoryList';
import type { HistoryEntry } from '@/types';

const mockEntry: HistoryEntry = {
  id: 'entry-1',
  url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  title: 'Rick Astley - Never Gonna Give You Up',
  thumbnail: '',
  platform: 'youtube',
  filepath: '/home/user/Downloads/Rick Astley.mp4',
  downloaded_at: Date.now() - 60000,
  quality: 'best',
};

describe('HistoryList', () => {
  it('shows empty state when no entries', () => {
    render(<HistoryList entries={[]} onClear={vi.fn()} />);
    expect(screen.getByText(/no downloads yet/i)).toBeInTheDocument();
  });

  it('renders history entries', () => {
    render(<HistoryList entries={[mockEntry]} onClear={vi.fn()} />);
    expect(screen.getByText('Rick Astley - Never Gonna Give You Up')).toBeInTheDocument();
    expect(screen.getByText('YouTube')).toBeInTheDocument();
  });

  it('calls onClear when Clear button clicked', () => {
    const onClear = vi.fn();
    render(<HistoryList entries={[mockEntry]} onClear={onClear} />);
    fireEvent.click(screen.getByRole('button', { name: /clear history/i }));
    expect(onClear).toHaveBeenCalledOnce();
  });
});
