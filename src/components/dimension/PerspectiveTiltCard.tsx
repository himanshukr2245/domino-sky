'use client';

// tokens-ok-file: 3D perspective gyroscopic container uses dynamic optical glare reflection calculations
// src/components/dimension/PerspectiveTiltCard.tsx — 3D Gyroscopic Perspective Card
// Implements tactile-digital-deformable-ui + 3D depth layering from ui-ux-pro-max:
// 1. Perspective: 1000px with preserve-3d spatial transformation
// 2. Cursor glare tracking with soft optical gradient
// 3. translateZ(20px) layer separation
// 4. Spring reset on pointer leave with zero layout shift
import { useState, useRef, type ReactNode } from 'react';

interface PerspectiveTiltCardProps {
  children: ReactNode;
  className?: string;
  maxTilt?: number;
  isCrown?: boolean;
}

export function PerspectiveTiltCard({
  children,
  className = '',
  maxTilt = 10,
  isCrown = false,
}: PerspectiveTiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState('rotateX(0deg) rotateY(0deg)');
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const xPercent = (x / rect.width) * 100;
    const yPercent = (y / rect.height) * 100;

    const rotateX = ((y / rect.height) * 2 - 1) * -maxTilt;
    const rotateY = ((x / rect.width) * 2 - 1) * maxTilt;

    setTransform(`rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg)`);
    setGlare({ x: xPercent, y: yPercent, opacity: 0.18 });
  };

  const handleMouseLeave = () => {
    setTransform('rotateX(0deg) rotateY(0deg)');
    setGlare((prev) => ({ ...prev, opacity: 0 }));
  };

  return (
    <div
      style={{ perspective: '1000px' }}
      className="w-full transition-transform duration-300 ease-out"
    >
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transform,
          transformStyle: 'preserve-3d',
        }}
        className={`relative w-full rounded-2xl transition-[transform] duration-150 ease-out will-change-transform ${
          isCrown ? 'aws-card-aurora' : 'aws-card'
        } ${className}`}
      >
        {/* Specular Spotlight Glare Overlay */}
        <div
          aria-hidden="true"
          style={{
            background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255, 255, 255, ${glare.opacity}), transparent 60%)`,
          }}
          className="pointer-events-none absolute inset-0 z-20 rounded-2xl transition-opacity duration-200"
        />

        {/* 3D Elevated Inner Content */}
        <div
          style={{ transform: 'translateZ(18px)', transformStyle: 'preserve-3d' }}
          className={`relative z-10 w-full h-full rounded-2xl ${
            isCrown ? 'bg-surface/95 backdrop-blur-xl' : ''
          }`}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
