// hooks/use-spf-data.ts
'use client';

import { useState, useEffect, useCallback, useTransition, useRef } from 'react';
import { pb } from '@/lib/pocketbase';

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

  const [timeAgo, setTimeAgo] = useState<string>('Never');
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const lastClickRef = useRef<number>(0);

  // Initial Data Load & Realtime Subscription
  useEffect(() => {
    // 1. Fetch initial data via API
    fetch('/api/spf')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((serverData: SPFData) => {
        setData(serverData);
        setTimeAgo(formatTimeAgo(serverData.lastAppliedAt));
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('SPF Hook: Error loading data:', err);
        setIsLoading(false);
      });

    // 2. Subscribe to realtime updates
    pb.collection('spf_data').subscribe('*', function (e) {
      if (e.action === 'update' || e.action === 'create') {
        const record = e.record;

        const updatedData: SPFData = {
          applicationCount: record.applicationCount,
          lastAppliedAt: record.lastAppliedAt,
          streak: record.streak,
          lastStreakDate: record.lastStreakDate,
        };

        setData(updatedData);
        setTimeAgo(formatTimeAgo(updatedData.lastAppliedAt));
        setIsLoading(false); // Ensure loading is off if we missed the initial fetch
      }
    }).catch(err => console.error("SPF Hook: Realtime subscription error:", err));

    return () => {
      pb.collection('spf_data').unsubscribe('*');
    };
  }, []);

  // Update time ago every minute
  useEffect(() => {
    const updateTime = () => {
      setTimeAgo(formatTimeAgo(data.lastAppliedAt));
    };

    updateTime();
    const interval = setInterval(updateTime, 60_000);

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
        // State updates via Realtime Subscription
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

  return {
    data,
    timeAgo,
    isPending,
    isLoading,
    cooldownSeconds,
    handleApplySPF
  };
}
