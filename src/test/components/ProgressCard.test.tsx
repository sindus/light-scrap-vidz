import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ProgressCard } from '@/components/ProgressCard';
import type { DownloadProgress } from '@/types';

const mockProgress: DownloadProgress = {
  download_id: 'test-id',
  percent: 47.3,
  speed: '1.23MiB/s',
  eta: '00:09',
  filename: 'my_video.mp4',
  current_item: null,
  total_items: null,
};

const mockPlaylistProgress: DownloadProgress = {
  download_id: 'test-id',
  percent: 47.3,
  speed: '1.23MiB/s',
  eta: '00:09',
  filename: '003 - Some Video.mp4',
  current_item: 3,
  total_items: 10,
};

describe('ProgressCard', () => {
  it('renders nothing when status is idle', () => {
    const { container } = render(<ProgressCard status="idle" progress={null} error={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing when status is ready', () => {
    const { container } = render(<ProgressCard status="ready" progress={null} error={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('shows percent and speed during download', () => {
    render(<ProgressCard status="downloading" progress={mockProgress} error={null} />);
    expect(screen.getByText(/47\.3%/)).toBeInTheDocument();
    expect(screen.getByText(/1\.23MiB\/s/)).toBeInTheDocument();
    expect(screen.getByText(/ETA 00:09/)).toBeInTheDocument();
  });

  it('shows filename during download', () => {
    render(<ProgressCard status="downloading" progress={mockProgress} error={null} />);
    expect(screen.getByText('my_video.mp4')).toBeInTheDocument();
  });

  it('shows complete message', () => {
    render(<ProgressCard status="complete" progress={null} error={null} />);
    expect(screen.getByText(/download complete/i)).toBeInTheDocument();
  });

  it('shows error message', () => {
    render(<ProgressCard status="error" progress={null} error="Network error" />);
    expect(screen.getByText('Network error')).toBeInTheDocument();
  });

  it('shows cancelled message', () => {
    render(<ProgressCard status="cancelled" progress={null} error={null} />);
    expect(screen.getByText(/cancelled/i)).toBeInTheDocument();
  });

  it('shows "Video X / N" during playlist download', () => {
    render(<ProgressCard status="downloading" progress={mockPlaylistProgress} error={null} />);
    expect(screen.getByText('Video 3 / 10')).toBeInTheDocument();
  });

  it('does not show video counter for single-video download', () => {
    render(<ProgressCard status="downloading" progress={mockProgress} error={null} />);
    expect(screen.queryByText(/video \d+ \/ \d+/i)).not.toBeInTheDocument();
  });
});
