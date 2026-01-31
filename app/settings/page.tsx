'use client';

import { Header } from '@/components/home/header';
import { BottomNavigation } from '@/components/home/bottom-navigation';
import { DecorativeBackground } from '@/components/home/decorative-background';
import { useSPFData } from '@/hooks/use-spf-data';
import { ViewCountCard } from '@/components/settings/view-count-card';

export default function SettingsPage() {
    const { data, isLoading } = useSPFData();

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
                    <span className="text-2xl" role="img" aria-label="settings">⚙️</span>
                    <h1 className="text-2xl font-bold text-tuval-navy">Settings</h1>
                </div>

                {/* Settings Content */}
                <div className="flex flex-col gap-4 px-6">
                    <ViewCountCard />
                </div>
            </main>

            {/* Bottom navigation */}
            <BottomNavigation />
        </div>
    );
}
