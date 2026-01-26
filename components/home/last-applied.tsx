// components/home/last-applied.tsx
'use client';

import { Clock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface LastAppliedProps {
  timeAgo: string;
  isLoading?: boolean;
}

export function LastApplied({ timeAgo, isLoading }: LastAppliedProps) {
  return (
    <div
      className="flex items-center justify-center gap-2 rounded-full bg-white/50 px-5 py-2.5 backdrop-blur-sm"
      suppressHydrationWarning
    >
      <Clock
        size={16}
        className="text-tuval-label"
        aria-hidden="true"
      />
      <span className="text-sm text-tuval-label" suppressHydrationWarning>
        Last applied:{' '}
        {isLoading ? (
          <Skeleton className="inline-block h-4 w-[80px] align-middle" />
        ) : (
          <span className="font-medium">{timeAgo}</span>
        )}
      </span>
    </div>
  );
}
