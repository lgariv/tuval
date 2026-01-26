// components/home/protection-display.tsx
'use client';

import { cn } from '@/lib/utils';

interface ProtectionDisplayProps {
  count: number;
  className?: string;
}

export function ProtectionDisplay({ count, className }: ProtectionDisplayProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center',
        className
      )}
    >
      {/* TUVAL Acronym */}
      <div className="mb-8 flex flex-col items-center">
        <span className="text-4xl pb-1 font-bold tracking-[0.2em] text-tuval-navy">
          T.U.V.A.L
        </span>
        <span className="mt-1 rounded-full bg-white/50 px-3 py-1 text-[10px] font-medium tracking-[0.08em] text-tuval-label">
          <span className="font-semibold">T</span>otal{' '}
          <span className="font-semibold">UV</span>-protection{' '}
          <span className="font-semibold">A</span>pplied{' '}
          <span className="font-semibold">L</span>ayers
        </span>
      </div>

      {/* Large count display */}
      <div
        className="relative flex items-baseline"
        role="status"
        aria-live="polite"
      >
        <span
          className="tabular-nums text-[140px] font-bold leading-none text-tuval-navy"
          style={{ fontFamily: 'var(--font-geist-sans), system-ui, sans-serif' }}
          aria-label={`${count} applications`}
        >
          {count}
        </span>
        {/* Superscript "x" */}
        <span
          className="absolute -right-7 top-6 text-4xl font-medium text-tuval-label"
          aria-hidden="true"
        >
          x
        </span>
      </div>
    </div>
  );
}
