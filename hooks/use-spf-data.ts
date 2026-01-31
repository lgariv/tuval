// hooks/use-spf-data.ts
'use client';

import { useState, useEffect, useCallback, useTransition, useRef } from 'react';
import { useAuth, useClerk } from '@clerk/nextjs';
import { pb } from '@/lib/pocketbase';
import { useLanguage } from '@/hooks/use-language';

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
  isLoaded: boolean;
  userId: string | null | undefined;
  cooldownSeconds: number;
  handleApplySPF: () => void;
}

/**
 * Format timestamp as relative time using Intl.RelativeTimeFormat
 */
function formatTimeAgo(isoString: string | null, language: string, t: (key: string) => string): string {
  if (!isoString) {
    return t('never');
  }

  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();

  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  const rtf = new Intl.RelativeTimeFormat(language === 'he' ? 'he-IL' : 'en-US', { numeric: 'auto' });

  if (diffSeconds < 60) {
    return t('just_now');
  } else if (diffMinutes < 60) {
    return rtf.format(-diffMinutes, 'minute');
  } else if (diffHours < 24) {
    return rtf.format(-diffHours, 'hour');
  } else {
    return rtf.format(-diffDays, 'day');
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
  const { userId, isLoaded } = useAuth();
  const { openSignIn } = useClerk();
  const { language, t } = useLanguage();

  /**
   * Helper to recalculate remaining cooldown from the current data
   */
  const updateCooldownFromData = useCallback((lastApplied: string | null) => {
    if (!lastApplied) return 0;
    const last = new Date(lastApplied).getTime();
    const now = Date.now();
    const elapsed = now - last;
    const remaining = Math.ceil((RATE_LIMIT_MS - elapsed) / 1000);
    const value = remaining > 0 ? remaining : 0;
    setCooldownSeconds(value);
    return value;
  }, []);

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
        setTimeAgo(formatTimeAgo(serverData.lastAppliedAt, language, t));
        updateCooldownFromData(serverData.lastAppliedAt);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('SPF Hook: Error loading data:', err);
        setIsLoading(false);
      });

    // 2. Subscribe to realtime updates
    // PocketBase real-time ensures that if User A clicks, User B gets the new 'lastAppliedAt'
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
        // This line is key: it triggers the local cooldown logic for ALL clients
        updateCooldownFromData(updatedData.lastAppliedAt);
        setTimeAgo(formatTimeAgo(updatedData.lastAppliedAt, language, t));
        setIsLoading(false);
      }
    }).catch(err => console.error("SPF Hook: Realtime subscription error:", err));

    return () => {
      pb.collection('spf_data').unsubscribe('*');
    };
  }, [updateCooldownFromData]);

  // Update relative time ("2 mins ago") periodically
  useEffect(() => {
    const updateTime = () => setTimeAgo(formatTimeAgo(data.lastAppliedAt, language, t));
    updateTime();
    const interval = setInterval(updateTime, 60_000);
    return () => clearInterval(interval);
  }, [data.lastAppliedAt, language, t]);

  // Cooldown ticking logic: ensures the UI counts down smoothly
  // This runs for all clients whenever a cooldown is active
  useEffect(() => {
    if (cooldownSeconds <= 0) return;

    const timer = setInterval(() => {
      // Re-calculate based on timestamp to prevent drift across devices
      const remaining = updateCooldownFromData(data.lastAppliedAt);
      if (remaining <= 0) {
        clearInterval(timer);
      }
    }, 500); // 500ms for extra precision

    return () => clearInterval(timer);
  }, [cooldownSeconds, data.lastAppliedAt, updateCooldownFromData]);

  const handleApplySPF = useCallback(() => {
    // Immediate haptic feedback for the click
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(5);
    }

    // 1. Auth check
    if (!userId) {
      openSignIn();
      return;
    }

    // 2. Shared rate limit check
    if (cooldownSeconds > 0) return;

    startTransition(async () => {
      try {
        const res = await fetch('/api/spf', { method: 'POST' });
        if (!res.ok) throw new Error('Failed to apply SPF');

        // Haptic feedback
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate(15);
        }
      } catch (err) {
        console.error('Error applying SPF:', err);
      }
    });
  }, [cooldownSeconds, userId, openSignIn]);

  return {
    data,
    timeAgo,
    isPending,
    isLoading,
    isLoaded,
    userId,
    cooldownSeconds,
    handleApplySPF
  };
}
