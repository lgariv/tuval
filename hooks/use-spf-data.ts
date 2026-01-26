// hooks/use-spf-data.ts
'use client';

import { useState, useEffect, useCallback, useTransition, useRef } from 'react';
// We don't need server actions anymore as we'll use API routes directly
// import { getSPFServerData, applySPFServer, type SPFData } from '@/app/actions/spf-actions';

export interface SPFData {
  applicationCount: number;
  lastAppliedAt: string | null;
  streak: number;
  lastStreakDate: string | null;
}

const RATE_LIMIT_MS = 5_000; // 5 seconds


interface UseSPFDataReturn {
  data: SPFData;
  timeAgo: string;
  isPending: boolean;
  isLoading: boolean;
  cooldownSeconds: number;
  handleApplySPF: () => void;
}

/**
 * Format timestamp as relative time
 */
function formatTimeAgo(isoString: string | null): string {
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

export function useSPFData(): UseSPFDataReturn {
  const [data, setData] = useState<SPFData>({
    applicationCount: 0,
    lastAppliedAt: null,
    streak: 0,
    lastStreakDate: null,
  });

  const [timeAgo, setTimeAgo] = useState<string>(() => formatTimeAgo(data.lastAppliedAt));
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const lastClickRef = useRef<number>(0);

  // Load initial data on mount
  useEffect(() => {
    fetch('/api/spf')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then((serverData: SPFData) => {
        setData(serverData);
        setTimeAgo(formatTimeAgo(serverData.lastAppliedAt));
      })
      .catch((err) => console.error('Error loading SPF data:', err))
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  // Update time ago every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeAgo(formatTimeAgo(data.lastAppliedAt));
    }, 60_000);

    return () => clearInterval(interval);
  }, [data.lastAppliedAt]);

  const handleApplySPF = useCallback(() => {
    const now = Date.now();
    const elapsed = now - lastClickRef.current;

    // Rate limit check
    if (elapsed < RATE_LIMIT_MS) {
      return;
    }

    lastClickRef.current = now;
    setCooldownSeconds(Math.ceil(RATE_LIMIT_MS / 1000));

    startTransition(async () => {
      try {
        const res = await fetch('/api/spf', { method: 'POST' });
        if (!res.ok) throw new Error('Failed to apply SPF');
        const newData: SPFData = await res.json();
        setData(newData);
        setTimeAgo(formatTimeAgo(newData.lastAppliedAt));
      } catch (err) {
        console.error('Error applying SPF:', err);
      }
    });
  }, []);

  // Cooldown timer
  useEffect(() => {
    if (cooldownSeconds <= 0) return;

    const timer = setTimeout(() => {
      setCooldownSeconds((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [cooldownSeconds]);

  return { data, timeAgo, isPending, isLoading, cooldownSeconds, handleApplySPF };
}
