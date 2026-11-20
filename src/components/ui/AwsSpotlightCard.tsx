'use client';

// components/ui/AwsSpotlightCard.tsx — Unified AWS Precision + Radial Spotlight Card.
// Fuses solid zero-blur surfaces, 1.5px hairline optical borders, and mouse-following
// radial spotlights with 0 React re-renders for locked 60 Hz hardware VSync.
import { useRef, type ReactNode, type MouseEvent, type ElementType } from 'react';
import { playHapticTick, unlockAudio } from '@/lib/audio/synthesizer';

export type SpotlightColorAccent =
  | 'cyan'
  | 'indigo'
  | 'rose'
  | 'emerald'
  | 'amber'
  | 'violet'
  | 'neutral';

export interface AwsSpotlightCardProps {
  children: ReactNode;
  className?: string;
  colorAccent?: SpotlightColorAccent;
  aurora?: boolean;
  sound?: boolean;
  as?: ElementType;
  id?: string;
  role?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
}

const ACCENT_CLASS_MAP: Record<SpotlightColorAccent, string> = {
  cyan: 'spotlight-cyan',
  indigo: 'spotlight-indigo',
  rose: 'spotlight-rose',
  emerald: 'spotlight-emerald',
  amber: 'spotlight-amber',
  violet: 'spotlight-violet',
  neutral: '',
};

export function AwsSpotlightCard({
  children,
  className = '',
  colorAccent = 'cyan',
  aurora = false,
  sound = false,
  as: Component = 'div',
  id,
  role,
  onClick,
  style,
}: AwsSpotlightCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty('--mouse-x', `${x}px`);
    card.style.setProperty('--mouse-y', `${y}px`);
  }

  function handleMouseEnter() {
    if (sound) {
      unlockAudio();
      playHapticTick();
    }
  }

  const colorClass = ACCENT_CLASS_MAP[colorAccent] || '';
  const cardBaseClass = aurora ? 'aws-card-aurora' : 'aws-card';

  return (
    <Component
      ref={cardRef}
      id={id}
      role={role}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      style={{
        contain: 'layout',
        isolation: 'isolate',
        ...style,
      }}
      className={`${cardBaseClass} spotlight-card ${colorClass} group relative overflow-hidden rounded-2xl p-5 sm:p-6 transition-all duration-300 ${className}`}
    >
      {/* Card Body */}
      <div className="relative z-10 w-full h-full flex flex-col justify-between">
        {children}
      </div>
    </Component>
  );
}
