// components/home/header.tsx
'use client';

import { SignedIn, SignedOut, UserButton, useUser } from '@clerk/nextjs';
import { Badge } from '@/components/ui/badge';
import { Flame } from 'lucide-react';

interface HeaderProps {
  streak: number;
}

export function Header({ streak }: HeaderProps) {
  const { user } = useUser();
  const displayName = user?.firstName || 'Sunshine';

  return (
    <header className="flex w-full items-center justify-between px-5 py-4">
      {/* Left side: Avatar + Greeting */}
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div>
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

          {/* Fallback avatar when signed out - stylized woman */}
          <SignedOut>
            <div className="h-11 w-11 overflow-hidden rounded-full border-2 border-white shadow-md">
              <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
                {/* Background */}
                <rect width="56" height="56" fill="#e8ded5" />
                {/* Hair background */}
                <ellipse cx="28" cy="24" rx="20" ry="18" fill="#2d1810" />
                {/* Hair sides */}
                <path d="M8 28 Q8 56 28 56 L8 56 Z" fill="#2d1810" />
                <path d="M48 28 Q48 56 28 56 L48 56 Z" fill="#2d1810" />
                {/* Face */}
                <ellipse cx="28" cy="30" rx="13" ry="14" fill="#f5d5c8" />
                {/* Hair bangs */}
                <path d="M14 22 Q20 12 28 14 Q36 12 42 22 Q38 24 28 22 Q18 24 14 22" fill="#2d1810" />
                {/* Neck */}
                <rect x="22" y="42" width="12" height="8" fill="#f5d5c8" />
                {/* Shirt */}
                <ellipse cx="28" cy="60" rx="20" ry="16" fill="#7ec8a8" />
              </svg>
            </div>
          </SignedOut>

        </div>

        {/* Greeting text */}
        <div className="flex flex-col">
          <span className="text-xs font-medium uppercase tracking-wider text-tuval-label">
            Hello
          </span>
          <span className="text-xl font-bold text-tuval-navy">
            {displayName}
          </span>
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
          {streak} Day Streak
        </span>
      </Badge>
    </header>
  );
}
