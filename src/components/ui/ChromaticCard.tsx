'use client';

// components/ui/ChromaticCard.tsx — The Signature HK Luminous Aurora Hero Card (Design 2).
// Features dual-box gradient perimeter border (#ec4899 pink -> #8b5cf6 violet -> #06b6d4 cyan),
// radiant ambient bloom, locked 60 Hz VSync CSS containment, and zero fake specular top sheen.
import { useRef, type ReactNode, type ElementType } from 'react';
import { playHapticTick, unlockAudio } from '@/lib/audio/synthesizer';

export interface ChromaticCardProps {
  children: ReactNode;
  className?: string;
  active?: boolean;
  sound?: boolean;
  as?: ElementType;
  id?: string;
  role?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
}

export function ChromaticCard({
  children,
  className = '',
  active = true,
  sound = false,
  as: Component = 'div',
  id,
  role,
  onClick,
  style,
}: ChromaticCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  function handleMouseEnter() {
    if (sound) {
      unlockAudio();
      playHapticTick();
    }
  }

  return (
    <Component
      ref={cardRef}
      id={id}
      role={role}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      style={{
        contain: 'layout',
        isolation: 'isolate',
        ...style,
      }}
      className={`group relative overflow-hidden rounded-2xl p-5 sm:p-6 transition-all duration-300 ${
        active ? 'aws-card-aurora' : 'aws-card hover:border-border-strong hover:bg-surface-2/60'
      } ${className}`}
    >
      <div className="relative z-10 w-full h-full flex flex-col justify-between">
        {children}
      </div>
    </Component>
  );
}
