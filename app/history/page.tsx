// app/history/page.tsx
'use client';

import { Header } from '@/components/home/header';
import { BottomNavigation } from '@/components/home/bottom-navigation';
import { DecorativeBackground } from '@/components/home/decorative-background';
import { HistoryCard } from '@/components/history/history-card';
import { useSPFData } from '@/hooks/use-spf-data';
import { Calendar } from 'lucide-react';

export default function HistoryPage() {
    const { data, isLoading } = useSPFData();

    // Mock data for the fallback/initial view or if history is empty
    // In a real app, this would come from the API
    const history = (data as any).history || [];

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
                <Header streak={data.streak} isLoading={isLoading} />

                {/* Section Title */}
                <div className="flex items-center gap-3 px-6 py-6 pt-8">
                    <span className="text-2xl" role="img" aria-label="calendar">🗓️</span>
                    <h1 className="text-2xl font-bold text-tuval-navy">Daily History</h1>
                </div>

                {/* History List */}
                <div className="flex flex-col gap-3 px-6">
                    {isLoading ? (
                        // Loading skeletons could go here
                        Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="h-24 w-full animate-pulse rounded-3xl bg-white/40" />
                        ))
                    ) : history.length > 0 ? (
                        history.map((entry: any, index: number) => (
                            <HistoryCard
                                key={entry.date}
                                dayName={getDayName(entry.date)}
                                date={getDateLabel(entry.date)}
                                count={entry.count}
                            />
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-tuval-label">
                            <Calendar size={48} className="mb-4 opacity-20" />
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
