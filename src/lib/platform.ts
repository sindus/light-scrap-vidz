import type { Platform } from '@/types';

export interface PlatformMeta {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

export const PLATFORM_META: Record<Platform, PlatformMeta> = {
  youtube: {
    label: 'YouTube',
    color: '#ff4444',
    bgColor: 'rgba(255, 68, 68, 0.15)',
    borderColor: 'rgba(255, 68, 68, 0.3)',
  },
  tiktok: {
    label: 'TikTok',
    color: '#00f2ea',
    bgColor: 'rgba(0, 242, 234, 0.15)',
    borderColor: 'rgba(0, 242, 234, 0.3)',
  },
  instagram: {
    label: 'Instagram',
    color: '#e1306c',
    bgColor: 'rgba(225, 48, 108, 0.15)',
    borderColor: 'rgba(225, 48, 108, 0.3)',
  },
  facebook: {
    label: 'Facebook',
    color: '#1877f2',
    bgColor: 'rgba(24, 119, 242, 0.15)',
    borderColor: 'rgba(24, 119, 242, 0.3)',
  },
  unknown: {
    label: 'Unknown',
    color: '#94a3b8',
    bgColor: 'rgba(148, 163, 184, 0.15)',
    borderColor: 'rgba(148, 163, 184, 0.3)',
  },
};
