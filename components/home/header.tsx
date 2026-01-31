// components/home/header.tsx
'use client';

import { SignedIn, SignedOut, UserButton, useUser } from '@clerk/nextjs';
import { Badge } from '@/components/ui/badge';
import { Flame, User } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface HeaderProps {
  streak: number;
  isLoading?: boolean;
}

export function Header({ streak, isLoading }: HeaderProps) {
  const { user, isLoaded, isSignedIn } = useUser();
  const displayName = user?.firstName || 'Guest';
  const greeting = isSignedIn ? 'Hello' : 'Welcome';

  return (
    <header className="flex w-full items-center justify-between px-5 py-4">
      {/* Left side: Avatar + Greeting */}
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div>
          {!isLoaded || isLoading ? (
            <Skeleton className="h-11 w-11 rounded-full border-2 border-white shadow-md" />
          ) : (
            <>
              {/* Clerk avatar when signed in */}
              <SignedIn>
                <UserButton
                  appearance={{
                    elements: {
                      userButtonBox: '!h-11 !w-11',
                      userButtonTrigger: '!h-11 !w-11 rounded-full focus:shadow-none',
                      userButtonAvatarBox: '!h-11 !w-11',
                      avatarBox: '!h-11 !w-11 border-2 border-white shadow-md',
                      avatarImage: '!h-full !w-full',
                    },
                  }}
                />
              </SignedIn>

              {/* Fallback avatar when signed out - neutral user icon */}
              <SignedOut>
                <div className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-white bg-tuval-label/10 text-tuval-label shadow-md">
                  <User size={24} />
                </div>
              </SignedOut>
            </>
          )}
        </div>

        {/* Greeting text */}
        <div className="flex flex-col">
          <span className="text-xs font-medium uppercase tracking-wider text-tuval-label">
            {greeting}
          </span>
          {!isLoaded || isLoading ? (
            <Skeleton className="mt-1 h-6 w-24 rounded-md" />
          ) : (
            <span className="text-xl font-bold text-tuval-navy">
              {displayName}
            </span>
          )}
        </div>
      </div>

      {/* Right side: Streak badge */}
      <Badge
        variant="outline"
        className="flex items-center gap-1.5 rounded-full border-0 bg-white px-4 py-2 text-sm font-medium shadow-sm"
      >
        <Flame
          size={18}
          className="text-orange-500"
          fill="currentColor"
          aria-hidden="true"
        />
        <span className="tabular-nums text-tuval-navy">
          {isLoading ? (
            <Skeleton className="inline-block h-4 w-[24px] align-middle" />
          ) : (
            streak
          )}{' '}
          Day Streak
        </span>
      </Badge>
    </header>
  );
}
