// hooks/use-spf-data.ts
'use client';

import { useState, useEffect, useCallback, useTransition, useRef } from 'react';
import { getSPFServerData, applySPFServer, type SPFData } from '@/app/actions/spf-actions';

const RATE_LIMIT_MS = 5_000; // 5 seconds


interface UseSPFDataReturn {
  data: SPFData;
  timeAgo: string;
  isPending: boolean;
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

  const [timeAgo, setTimeAgo] = useState<string>('Never');
  const [isPending, startTransition] = useTransition();
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const lastClickRef = useRef<number>(0);

  // Load initial data on mount
  useEffect(() => {
    getSPFServerData().then((serverData) => {
      setData(serverData);
      setTimeAgo(formatTimeAgo(serverData.lastAppliedAt));
    });
  }, []);

  // Update time ago every minute
  useEffect(() => {
    setTimeAgo(formatTimeAgo(data.lastAppliedAt));

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
      const newData = await applySPFServer();
      setData(newData);
      setTimeAgo(formatTimeAgo(newData.lastAppliedAt));
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

  return { data, timeAgo, isPending, cooldownSeconds, handleApplySPF };
}
