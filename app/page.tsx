// app/page.tsx
'use client';

import { Header } from '@/components/home/header';
import { ProtectionDisplay } from '@/components/home/protection-display';
import { ApplySPFButton } from '@/components/home/apply-spf-button';
import { LastApplied } from '@/components/home/last-applied';
import { BottomNavigation } from '@/components/home/bottom-navigation';
import { DecorativeBackground } from '@/components/home/decorative-background';
import { useSPFData } from '@/hooks/use-spf-data';

export default function HomePage() {
  const {
    data,
    timeAgo,
    isPending,
    isLoading,
    isLoaded,
    userId,
    cooldownSeconds,
    handleApplySPF
  } = useSPFData();

  return (
    <div className="relative flex min-h-dvh flex-col bg-tuval-gradient">
      {/* Decorative floating icons */}
      <DecorativeBackground />

      {/* Main content */}
      <main className="relative z-10 flex flex-1 flex-col pb-28">
        {/* Header with avatar and streak */}
        <Header streak={data.streak} isLoading={isLoading} />

        {/* Protection count display - centered */}
        <div className="flex flex-1 items-center justify-center">
          <ProtectionDisplay count={data.applicationCount} isLoading={isLoading} />
        </div>

        {/* Action area */}
        <div className="flex flex-col items-center gap-5 px-6 pb-6">
          <ApplySPFButton
            onClick={handleApplySPF}
            isPending={isPending}
            cooldownSeconds={cooldownSeconds}
            isLoaded={isLoaded}
            isAuthenticated={!!userId}
          />
          <LastApplied timeAgo={timeAgo} isLoading={isLoading} />
        </div>
      </main>

      {/* Bottom navigation */}
      <BottomNavigation />
    </div>
  );
}
