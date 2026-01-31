'use client';

import { Header } from '@/components/home/header';
import { BottomNavigation } from '@/components/home/bottom-navigation';
import { DecorativeBackground } from '@/components/home/decorative-background';
import { useSPFData } from '@/hooks/use-spf-data';
import { ViewCountCard } from '@/components/settings/view-count-card';
import { ShareQRCodeCard } from '@/components/settings/share-qr-card';
import { useLanguage } from '@/hooks/use-language';
import { Languages } from 'lucide-react';

export function LanguageToggle() {
    const { language, toggleLanguage, t } = useLanguage();

    return (
        <div
            onClick={toggleLanguage}
            className="flex items-center justify-between rounded-3xl bg-white/60 p-5 shadow-sm backdrop-blur-sm cursor-pointer active:scale-[0.98] transition-transform"
        >
            <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-500">
                    <Languages size={24} />
                </div>
                <div className="flex flex-col">
                    <span className="text-sm font-medium text-tuval-label">{t('language')}</span>
                    <span className="text-xl font-bold text-tuval-navy">
                        {language === 'he' ? 'עברית' : 'English'}
                    </span>
                </div>
            </div>
        </div>
    );
}

export default function SettingsPage() {
    const { data, isLoading } = useSPFData();
    const { t } = useLanguage();

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
                    <h1 className="text-2xl font-bold text-tuval-navy">{t('nav_settings')}</h1>
                </div>

                {/* Settings Content */}
                <div className="flex flex-col gap-4 px-6">
                    <ViewCountCard />
                    <LanguageToggle />
                    <ShareQRCodeCard />
                </div>
            </main>

            {/* Bottom navigation */}
            <BottomNavigation />
        </div>
    );
}
