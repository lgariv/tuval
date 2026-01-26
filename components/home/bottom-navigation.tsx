// components/home/bottom-navigation.tsx
'use client';

import { Calendar, Home, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

type Tab = 'history' | 'home' | 'settings';

interface BottomNavigationProps {
  activeTab?: Tab; // Now optional as we can derive it from pathname
}

const tabs = [
  { id: 'history' as const, label: 'History', icon: Calendar, href: '/history' },
  { id: 'home' as const, label: 'Home', icon: Home, href: '/' },
  { id: 'settings' as const, label: 'Settings', icon: Settings, href: '/settings' },
];

export function BottomNavigation({
  activeTab: manualActiveTab,
}: BottomNavigationProps) {
  const pathname = usePathname();

  // Determine active tab from pathname if not manually provided
  const activeTab = manualActiveTab || (
    pathname === '/' ? 'home' :
      pathname.startsWith('/history') ? 'history' :
        pathname.startsWith('/settings') ? 'settings' :
          'home'
  );

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 bg-[#f5f8fa]"
      aria-label="Main navigation"
    >
      <div className="mx-auto flex max-w-md items-center justify-around py-3">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <Link
              key={tab.id}
              href={tab.href}
              className={cn(
                'flex flex-col items-center gap-1 rounded-2xl px-8 py-2',
                'touch-manipulation',
                'transition-all duration-200',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400',
                isActive
                  ? 'bg-white text-tuval-navy shadow-sm'
                  : 'text-tuval-label'
              )}
              aria-current={isActive ? 'page' : undefined}
              aria-label={tab.label}
            >
              <Icon
                size={22}
                className={cn(
                  'transition-colors',
                  isActive ? 'text-amber-500' : 'text-tuval-label'
                )}
                fill={tab.id === 'home' && isActive ? 'currentColor' : 'none'}
                aria-hidden="true"
              />
              <span
                className={cn(
                  'text-xs font-medium',
                  isActive && 'text-tuval-navy'
                )}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>

      {/* Safe area for notched devices */}
      <div
        className="bg-[#f5f8fa]"
        style={{ height: 'env(safe-area-inset-bottom, 0px)' }}
      />
    </nav>
  );
}
