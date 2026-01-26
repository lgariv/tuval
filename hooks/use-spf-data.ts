// hooks/use-spf-data.ts
'use client';

import { useState, useEffect, useCallback, useTransition, useRef } from 'react';
import {
  getSPFData,
  applySPF as applySPFStorage,
  formatTimeAgo,
  type SPFData,
} from '@/lib/spf-storage';

const RATE_LIMIT_MS = 5_000; // 5 seconds

interface UseSPFDataReturn {
  data: SPFData;
  timeAgo: string;
  isPending: boolean;
  cooldownSeconds: number;
  handleApplySPF: () => void;
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
    const stored = getSPFData();
    setData(stored);
    setTimeAgo(formatTimeAgo(stored.lastAppliedAt));
  }, []);

  // Update time ago every minute
  useEffect(() => {
    setTimeAgo(formatTimeAgo(data.lastAppliedAt));

    const interval = setInterval(() => {
      setTimeAgo(formatTimeAgo(data.lastAppliedAt));
    }, 60_000);

    return () => clearInterval(interval);
  }, [data.lastAppliedAt]);

  // Cross-tab sync
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'tuval:spf-data:v1' && e.newValue) {
        try {
          const newData = JSON.parse(e.newValue) as SPFData;
          setData(newData);
          setTimeAgo(formatTimeAgo(newData.lastAppliedAt));
        } catch {
          // Ignore
        }
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const handleApplySPF = useCallback(() => {
    const now = Date.now();
    const elapsed = now - lastClickRef.current;

    // Rate limit check
    if (elapsed < RATE_LIMIT_MS) {
      return;
    }

    lastClickRef.current = now;
    setCooldownSeconds(Math.ceil(RATE_LIMIT_MS / 1000));

    startTransition(() => {
      const newData = applySPFStorage();
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
