// components/home/apply-spf-button.tsx
'use client';

import { Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ApplySPFButtonProps {
  onClick: () => void;
  isPending: boolean;
  cooldownSeconds: number;
}

export function ApplySPFButton({ onClick, isPending, cooldownSeconds }: ApplySPFButtonProps) {
  const isDisabled = isPending || cooldownSeconds > 0;

  return (
    <Button
      onClick={onClick}
      disabled={isDisabled}
      className={cn(
        'h-16 w-full max-w-[280px] rounded-full',
        'bg-[#f5b942] hover:bg-[#e5a832] active:bg-[#d59822]',
        'text-lg font-bold text-tuval-navy',
        'shadow-lg shadow-amber-200/50',
        'touch-manipulation',
        'transition-all duration-200',
        'active:scale-[0.98]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2',
        'disabled:opacity-70 disabled:cursor-not-allowed'
      )}
      aria-label={
        cooldownSeconds > 0
          ? `Wait ${cooldownSeconds} seconds`
          : isPending
            ? 'Applying sunscreen…'
            : 'Apply sunscreen'
      }
    >
      {isPending ? (
        <>
          <Loader2
            size={24}
            className="mr-2 animate-spin"
            aria-hidden="true"
          />
          <span>Applying…</span>
        </>
      ) : cooldownSeconds > 0 ? (
        <span className="tabular-nums">Wait {cooldownSeconds}s</span>
      ) : (
        <>
          <Plus
            size={24}
            className="mr-2"
            strokeWidth={3}
            aria-hidden="true"
          />
          <span>APPLY SPF</span>
        </>
      )}
    </Button>
  );
}
