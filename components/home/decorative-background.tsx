// components/home/decorative-background.tsx
import { Droplet } from 'lucide-react';

/**
 * Sun icon with rays - matches the design
 */
function SunIcon() {
  return (
    <svg
      width="80"
      height="80"
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Sun circle */}
      <circle cx="40" cy="40" r="18" fill="#f5b942" />
      {/* Rays - short thick lines */}
      <rect x="38" y="6" width="4" height="12" rx="2" fill="#f5b942" />
      <rect x="38" y="62" width="4" height="12" rx="2" fill="#f5b942" />
      <rect x="6" y="38" width="12" height="4" rx="2" fill="#f5b942" />
      <rect x="62" y="38" width="12" height="4" rx="2" fill="#f5b942" />
      {/* Diagonal rays */}
      <rect x="14" y="14" width="4" height="10" rx="2" fill="#f5b942" transform="rotate(-45 16 19)" />
      <rect x="56" y="14" width="4" height="10" rx="2" fill="#f5b942" transform="rotate(45 58 19)" />
      <rect x="14" y="56" width="4" height="10" rx="2" fill="#f5b942" transform="rotate(45 16 61)" />
      <rect x="56" y="56" width="4" height="10" rx="2" fill="#f5b942" transform="rotate(-45 58 61)" />
    </svg>
  );
}

/**
 * Star icon - simple 5-point star
 */
function StarIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="text-amber-300/70"
    >
      <path d="M12 2l2.4 7.4h7.6l-6 4.6 2.3 7-6.3-4.6-6.3 4.6 2.3-7-6-4.6h7.6z" />
    </svg>
  );
}

/**
 * Sunscreen bottle icon
 */
function SunscreenBottle() {
  return (
    <svg
      width="52"
      height="64"
      viewBox="0 0 52 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Bottle body */}
      <rect
        x="8"
        y="20"
        width="28"
        height="40"
        rx="6"
        fill="#5bb8e0"
      />
      {/* Pump top */}
      <rect
        x="16"
        y="6"
        width="12"
        height="14"
        rx="3"
        fill="#5bb8e0"
      />
      {/* Cross/plus symbol */}
      <path
        d="M22 34v12M16 40h12"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {/* Droplets */}
      <circle cx="42" cy="28" r="3" fill="#5bb8e0" opacity="0.7" />
      <circle cx="48" cy="20" r="2" fill="#5bb8e0" opacity="0.5" />
    </svg>
  );
}

export function DecorativeBackground() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      {/* Sun - top right */}
      <div className="absolute right-4 top-24">
        <SunIcon />
      </div>

      {/* Star - top left */}
      <div className="absolute left-8 top-[180px]">
        <StarIcon />
      </div>

      {/* Water droplet - right side, same level as button */}
      <div className="absolute bottom-[168px] right-4">
        <Droplet
          size={18}
          className="text-sky-400"
          fill="currentColor"
        />
      </div>

      {/* Sunscreen bottle - left side, above button */}
      <div className="absolute bottom-[200px] left-3">
        <SunscreenBottle />
      </div>
    </div>
  );
}
