import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { UrlInput } from '@/components/UrlInput';

describe('UrlInput', () => {
  it('renders the input and buttons', () => {
    render(<UrlInput onSubmit={vi.fn()} isLoading={false} />);
    expect(screen.getByRole('textbox', { name: /video url/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /get info/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /paste/i })).toBeInTheDocument();
  });

  it('calls onSubmit with a valid YouTube URL', async () => {
    const onSubmit = vi.fn();
    render(<UrlInput onSubmit={onSubmit} isLoading={false} />);
    const input = screen.getByRole('textbox', { name: /video url/i });
    await userEvent.type(input, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    fireEvent.click(screen.getByRole('button', { name: /get info/i }));
    expect(onSubmit).toHaveBeenCalledWith('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
  });

  it('shows error for invalid URL after blur', async () => {
    render(<UrlInput onSubmit={vi.fn()} isLoading={false} />);
    const input = screen.getByRole('textbox', { name: /video url/i });
    await userEvent.type(input, 'https://example.com/not-supported');
    fireEvent.blur(input);
    expect(screen.getByText(/not supported/i)).toBeInTheDocument();
  });

  it('does not call onSubmit for invalid URL', () => {
    const onSubmit = vi.fn();
    render(<UrlInput onSubmit={onSubmit} isLoading={false} />);
    const input = screen.getByRole('textbox', { name: /video url/i });
    fireEvent.change(input, { target: { value: 'not-a-url' } });
    fireEvent.click(screen.getByRole('button', { name: /get info/i }));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('shows loading state', () => {
    render(<UrlInput onSubmit={vi.fn()} isLoading={true} />);
    expect(screen.getByText(/fetching/i)).toBeInTheDocument();
  });

  it('submits on Enter key', async () => {
    const onSubmit = vi.fn();
    render(<UrlInput onSubmit={onSubmit} isLoading={false} />);
    const input = screen.getByRole('textbox', { name: /video url/i });
    await userEvent.type(input, 'https://youtu.be/dQw4w9WgXcQ{Enter}');
    expect(onSubmit).toHaveBeenCalledWith('https://youtu.be/dQw4w9WgXcQ');
  });
});
