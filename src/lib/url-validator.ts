import type { Platform } from '@/types';

const PLATFORM_PATTERNS: Array<{ platform: Platform; patterns: RegExp[] }> = [
  {
    platform: 'youtube',
    patterns: [
      /^https?:\/\/(www\.)?youtube\.com\/watch\?.*v=/,
      /^https?:\/\/youtu\.be\//,
      /^https?:\/\/(www\.)?youtube\.com\/shorts\//,
    ],
  },
  {
    platform: 'tiktok',
    patterns: [
      /^https?:\/\/(www\.)?tiktok\.com\/@[^/]+\/video\//,
      /^https?:\/\/vm\.tiktok\.com\//,
      /^https?:\/\/vt\.tiktok\.com\//,
    ],
  },
  {
    platform: 'instagram',
    patterns: [/^https?:\/\/(www\.)?instagram\.com\/(p|reel|tv)\//],
  },
  {
    platform: 'facebook',
    patterns: [
      /^https?:\/\/(www\.)?facebook\.com\/.+\/videos\//,
      /^https?:\/\/(www\.)?facebook\.com\/watch/,
      /^https?:\/\/fb\.watch\//,
    ],
  },
];

export function getPlatform(url: string): Platform {
  for (const { platform, patterns } of PLATFORM_PATTERNS) {
    if (patterns.some((p) => p.test(url))) return platform;
  }
  return 'unknown';
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
  } catch {
    return false;
  }
  return getPlatform(url) !== 'unknown';
}
