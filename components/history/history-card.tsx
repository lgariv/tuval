// components/history/history-card.tsx
'use client';

import { Sun } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/hooks/use-language';

interface HistoryCardProps {
    date: string; // ISO date string or formatted label like "Today"
    dayName: string; // e.g., "FRI"
    count: number;
}

export function HistoryCard({ date, dayName, count }: HistoryCardProps) {
    const { t } = useLanguage();
    const isToday = date.toLowerCase() === 'today' || date === 'היום';
    const displayDate = date.toLowerCase() === 'today' ? t('today') : date;

    return (
        <div className="flex items-center justify-between rounded-3xl bg-white/60 p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] backdrop-blur-sm transition-all hover:bg-white/80">
            {/* Date section */}
            <div className="flex w-16 flex-col items-center border-e border-tuval-label/10 pe-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-tuval-label/60">
                    {dayName}
                </span>
                <span className={cn(
                    "text-lg font-bold leading-tight",
                    isToday ? "text-tuval-navy" : "text-tuval-label"
                )}>
                    {displayDate}
                </span>
            </div>

            {/* Sun icons section */}
            <div className="flex flex-1 items-center gap-1 px-6 overflow-hidden">
                {Array.from({ length: count }).map((_, i) => (
                    <Sun
                        key={i}
                        size={22}
                        className="text-[#fcc42d] fill-[#fcc42d]"
                        aria-hidden="true"
                    />
                ))}
            </div>

            {/* Count badge */}
            <div className={cn(
                "flex h-8 min-w-[70px] items-center justify-center rounded-full px-4 text-xs font-bold tabular-nums",
                count > 0
                    ? "bg-[#fff7e2] text-[#c09440]"
                    : "bg-tuval-label/5 text-tuval-label/40"
            )}>
                {count} {count === 1 ? t('count_singular') : t('count_plural')}
            </div>
        </div>
    );
}
