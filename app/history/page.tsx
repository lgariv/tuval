// app/history/page.tsx
'use client';

import { Header } from '@/components/home/header';
import { BottomNavigation } from '@/components/home/bottom-navigation';
import { DecorativeBackground } from '@/components/home/decorative-background';
import { HistoryCard } from '@/components/history/history-card';
import { useSPFData } from '@/hooks/use-spf-data';
import { useInfiniteHistory } from '@/hooks/use-infinite-history';
import { useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';

export default function HistoryPage() {
    const { data, isLoading: isSpfLoading } = useSPFData();
    const {
        history,
        isLoading: isHistoryLoading,
        hasMore,
        loadMore
    } = useInfiniteHistory(10);

    const observerTarget = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting && hasMore && !isHistoryLoading) {
                    loadMore();
                }
            },
            { threshold: 0.1 }
        );

        if (observerTarget.current) {
            observer.observe(observerTarget.current);
        }

        return () => observer.disconnect();
    }, [hasMore, isHistoryLoading, loadMore]);

    const getDayName = (dateStr: string) => {
        return new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(new Date(dateStr)).toUpperCase();
    };

    const getDateLabel = (dateStr: string) => {
        const d = new Date(dateStr);
        const today = new Date();
        if (d.toDateString() === today.toDateString()) return 'Today';
        return d.getDate().toString().padStart(2, '0');
    };

    return (
        <div className="relative flex min-h-dvh flex-col bg-tuval-gradient">
            {/* Decorative floating icons */}
            <DecorativeBackground />

            {/* Main content */}
            <main className="relative z-10 flex flex-1 flex-col pb-28">
                {/* Header with avatar and streak */}
                <Header streak={data.streak} isLoading={isSpfLoading} />

                {/* Section Title */}
                <div className="flex items-center gap-3 px-6 py-6 pt-8">
                    <span className="text-2xl" role="img" aria-label="calendar">🗓️</span>
                    <h1 className="text-2xl font-bold text-tuval-navy">Daily History</h1>
                </div>

                {/* History List */}
                <div className="flex flex-col gap-3 px-6">
                    {history.map((entry: any) => (
                        <div key={entry.id} style={{ contentVisibility: 'auto', containIntrinsicSize: '0 96px' }}>
                            <HistoryCard
                                dayName={getDayName(entry.date)}
                                date={getDateLabel(entry.date)}
                                count={entry.count}
                            />
                        </div>
                    ))}

                    {/* Observer target / Load more spinner */}
                    <div ref={observerTarget} className="flex justify-center py-6 h-20">
                        {isHistoryLoading && (
                            <Loader2 className="h-6 w-6 animate-spin text-tuval-golden" />
                        )}
                        {!hasMore && history.length > 0 && (
                            <p className="text-sm text-tuval-label opacity-40">No more history to show</p>
                        )}
                    </div>

                    {!isHistoryLoading && history.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 text-tuval-label">
                            <span className="text-4xl mb-4 opacity-20">🗓️</span>
                            <p>No history yet. Start applying SPF!</p>
                        </div>
                    )}
                </div>
            </main>

            {/* Bottom navigation */}
            <BottomNavigation />
        </div>
    );
}
