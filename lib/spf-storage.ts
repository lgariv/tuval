// lib/spf-storage.ts

/**
 * SPF Data Interface
 */
export interface SPFData {
  applicationCount: number;
  lastAppliedAt: string | null;
  streak: number;
  lastStreakDate: string | null;
}

const STORAGE_KEY = 'tuval:spf-data:v1';

const DEFAULT_DATA: SPFData = {
  applicationCount: 0,
  lastAppliedAt: null,
  streak: 0,
  lastStreakDate: null,
};

/**
 * Read SPF data from localStorage
 */
export function getSPFData(): SPFData {
  if (typeof window === 'undefined') {
    return DEFAULT_DATA;
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return DEFAULT_DATA;
    }

    const parsed = JSON.parse(stored) as SPFData;

    if (
      typeof parsed.applicationCount !== 'number' ||
      typeof parsed.streak !== 'number'
    ) {
      return DEFAULT_DATA;
    }

    return parsed;
  } catch {
    return DEFAULT_DATA;
  }
}

/**
 * Save SPF data to localStorage
 */
export function saveSPFData(data: SPFData): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Silently fail
  }
}

/**
 * Calculate streak based on last application date
 */
function calculateStreak(
  currentStreak: number,
  lastStreakDate: string | null
): number {
  if (!lastStreakDate) {
    return 1;
  }

  const last = new Date(lastStreakDate);
  const now = new Date();

  last.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);

  const diffMs = now.getTime() - last.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return currentStreak;
  } else if (diffDays === 1) {
    return currentStreak + 1;
  } else {
    return 1;
  }
}

/**
 * Apply SPF and update data
 */
export function applySPF(): SPFData {
  const current = getSPFData();
  const now = new Date().toISOString();
  const today = new Date().toISOString().split('T')[0];

  const newData: SPFData = {
    applicationCount: current.applicationCount + 1,
    lastAppliedAt: now,
    streak: calculateStreak(current.streak, current.lastStreakDate),
    lastStreakDate: today,
  };

  saveSPFData(newData);
  return newData;
}

/**
 * Format timestamp as relative time
 */
export function formatTimeAgo(isoString: string | null): string {
  if (!isoString) {
    return 'Never';
  }

  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();

  if (diffMs < 0) {
    return 'Just now';
  }

  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffSeconds < 60) {
    return 'Just now';
  } else if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  } else {
    return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  }
}
