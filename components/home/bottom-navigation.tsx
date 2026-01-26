// components/home/bottom-navigation.tsx
'use client';

import { Calendar, Home, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

type Tab = 'history' | 'home' | 'settings';

interface BottomNavigationProps {
  activeTab: Tab;
  onTabChange?: (tab: Tab) => void;
}

const tabs = [
  { id: 'history' as const, label: 'History', icon: Calendar },
  { id: 'home' as const, label: 'Home', icon: Home },
  { id: 'settings' as const, label: 'Settings', icon: Settings },
];

export function BottomNavigation({
  activeTab,
  onTabChange,
}: BottomNavigationProps) {
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
            <button
              key={tab.id}
              onClick={() => onTabChange?.(tab.id)}
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
            </button>
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
