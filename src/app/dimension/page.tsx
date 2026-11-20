'use client';

// tokens-ok-file: UI-UX Pro Max archetype palette definitions are data for the 3D kinetic color switcher
// src/app/dimension/page.tsx — 3D Kinetic Cognitive Crucible
// Powered by UI-UX Pro Max design intelligence:
// 1. Interactive 3D Holographic Core (mathematical 3D projection)
// 2. 3D Perspective Tilt Cards with specular glare tracking
// 3. Live UI-UX Pro Max style & palette extraction (192 product palettes)
// 4. Multi-model prompt synthesizer with 1-click clipboard mobility
import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  SparklesIcon,
  CheckIcon,
  CopyIcon,
  SlidersIcon,
  LayersIcon,
  ActivityIcon,
  BoxIcon,
  RefreshIcon,
  PrecisionCard,
} from '@/components/ui';
import { Button } from '@/components/ui/Button';
import { KineticCore3D } from '@/components/dimension/KineticCore3D';
import { PerspectiveTiltCard } from '@/components/dimension/PerspectiveTiltCard';
import { playHapticTick, playSuccessChime } from '@/lib/audio/synthesizer';

type ArchetypeKey = 'cyberpunk' | 'luxury' | 'neumorphic' | 'glassmorphic';

interface ArchetypeData {
  title: string;
  category: string;
  styleId: string;
  fonts: { header: string; body: string; mood: string };
  colors: { primary: string; secondary: string; accent: string; bg: string };
  bestFor: string;
}

const ARCHETYPES: Record<ArchetypeKey, ArchetypeData> = {
  cyberpunk: {
    title: 'OLED Cyberpunk',
    category: 'High-Velocity Security & Terminal HUD',
    styleId: 'cyberpunk-ui',
    fonts: { header: 'JetBrains Mono', body: 'IBM Plex Sans', mood: 'Hacker, Terminal, Precise' },
    colors: { primary: '#00FF41', secondary: '#06B6D4', accent: '#EC4899', bg: '#090D14' },
    bestFor: 'Defense systems, AI terminals, crypto forensics, cyber operations',
  },
  luxury: {
    title: 'Minimalist Luxury',
    category: 'Executive Briefing & High-End Artifact',
    styleId: 'swiss-editorial-luxury',
    fonts: { header: 'Cinzel', body: 'Josefin Sans', mood: 'Architectural, Sophisticated, Editorial' },
    colors: { primary: '#D4AF37', secondary: '#F3E5AB', accent: '#E5C158', bg: '#0B0B0E' },
    bestFor: 'Executive dashboards, fine documents, high-trust portfolios',
  },
  neumorphic: {
    title: 'Neumorphic Spatial',
    category: 'Soft UI & Continuous Physical Depth',
    styleId: 'neumorphism-spatial',
    fonts: { header: 'Outfit', body: 'Plus Jakarta Sans', mood: 'Smooth, Tactile, Modern' },
    colors: { primary: '#38BDF8', secondary: '#818CF8', accent: '#C084FC', bg: '#0D1117' },
    bestFor: 'Hardware IoT controls, health monitors, tactile productivity',
  },
  glassmorphic: {
    title: 'Glassmorphic Tactical',
    category: 'Optical Sheen & Layered Precision',
    styleId: 'glassmorphism-cyber',
    fonts: { header: 'Space Grotesk', body: 'Inter', mood: 'Futuristic, High-Tech, Clean' },
    colors: { primary: '#2DD4BF', secondary: '#38BDF8', accent: '#A855F7', bg: '#0A0E1A' },
    bestFor: 'Bento canvases, AI copilot hubs, visual studios',
  },
};

export default function DimensionPage() {
  const [archetype, setArchetype] = useState<ArchetypeKey>('cyberpunk');
  const [variance, setVariance] = useState<number>(7);
  const [motion, setMotion] = useState<number>(6);
  const [density, setDensity] = useState<number>(8);
  const [angles, setAngles] = useState({ rx: 0, ry: 0 });
  const [copied, setCopied] = useState(false);
  const [synthesized, setSynthesized] = useState(false);

  const activeData = ARCHETYPES[archetype];

  // Dynamic Prompt Blueprint synthesized from active dials & UI-UX Pro Max
  const promptBlueprint = useMemo(() => {
    return `// ==========================================================
// [CRUCIBLE AI DIRECTIVE] Generated via UI-UX Pro Max
// Archetype: ${activeData.title} (${activeData.styleId})
// Dials: Variance=${variance}/10 | Motion=${motion}/10 | Density=${density}/10
// ==========================================================

Act as a Principal Design Technologist. Build the frontend following these strict rules:

1. VISUAL SYSTEM & PALETTE:
   - Primary Accent: ${activeData.colors.primary} (Semantic high-contrast focus)
   - Secondary Accent: ${activeData.colors.secondary} (Diagnostic metadata)
   - Accent/CTA: ${activeData.colors.accent} (Focal conversion)
   - Canvas Base: ${activeData.colors.bg} (Obsidian OLED)

2. TYPOGRAPHIC PAIRING:
   - Display & Headers: "${activeData.fonts.header}" (${activeData.fonts.mood})
   - Body & Controls: "${activeData.fonts.body}"
   - Metrics & Telemetry: "JetBrains Mono" with font-variant-numeric: tabular-nums

3. ARCHITECTURAL CONSTRAINTS:
   - Zero emojis in UI buttons or status cards (strictly SVG vector icons).
   - Layout containment: contain: layout size (Zero CLS layout specification).
   - Hardware VSync: Sub-10ms procedural Web Audio synthesizer ticks on primary actions.
   - Dual-Card Taxonomy: PrecisionCards (Design 1) for data grids; ChromaticCards (Design 2) for focal verdicts.`;
  }, [activeData, variance, motion, density]);

  const handleCopy = () => {
    navigator.clipboard.writeText(promptBlueprint);
    setCopied(true);
    playHapticTick();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSynthesize = () => {
    setSynthesized(true);
    playSuccessChime();
    setTimeout(() => setSynthesized(false), 1200);
  };

  return (
    <div className="flex w-full max-w-7xl flex-col gap-8 pb-16">
      {/* ── Console Header ── */}
      <div className="flex flex-col gap-3 pt-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <nav aria-label="Breadcrumb" className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-fg-muted shadow-sm">
            <Link href="/" className="hover:text-fg transition-colors">Home</Link>
            <span aria-hidden="true" className="opacity-40">/</span>
            <span aria-current="page" className="text-fg">3D Crucible</span>
          </nav>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-mono text-fg-muted shadow-sm">
              <span className="h-2 w-2 rounded-full bg-brand animate-ping" />
              <span>SPATIAL ENGINE ACTIVE</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-fg sm:text-4xl">
              3D Kinetic Cognitive Crucible
            </h1>
            <p className="text-sm text-fg-muted mt-1 max-w-2xl">
              Spatial design laboratory powered by <span className="text-fg font-semibold">UI-UX Pro Max</span> intelligence. Interact with the 3D core, tune dimensional dials, and synthesize production-ready specifications.
            </p>
          </div>
        </div>
      </div>

      {/* ── Bi-Axial Studio Layout ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* ── LEFT WING (7 Cols): 3D Kinetic Core & Tactical Dials ── */}
        <div className="flex flex-col gap-6 lg:col-span-7">
          {/* 3D Holographic Kinetic Core */}
          <PerspectiveTiltCard maxTilt={6}>
            <div className="p-6 flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <div className="flex items-center gap-2.5">
                  <BoxIcon className="h-5 w-5 text-brand" />
                  <span className="text-sm font-bold tracking-tight text-fg uppercase">Holographic Kinetic Core</span>
                </div>
                <div className="flex items-center gap-3 text-xs font-mono text-fg-muted">
                  <span>θX: {(angles.rx * 57.29).toFixed(0)}°</span>
                  <span>θY: {(angles.ry * 57.29).toFixed(0)}°</span>
                  <span className="text-brand">LOD: 30 Edges</span>
                </div>
              </div>

              {/* 3D Canvas Projection Component */}
              <KineticCore3D
                archetype={archetype}
                speedMultiplier={motion * 0.25}
                density={density}
                onAngleChange={(rx, ry) => setAngles({ rx, ry })}
              />

              <div className="flex items-center justify-between pt-1 text-xs text-fg-muted font-mono">
                <span className="flex items-center gap-1.5">
                  <ActivityIcon className="h-3.5 w-3.5 text-cyan" />
                  <span>Sub-0.5ms Projection Matrix</span>
                </span>
                <span>Drag with cursor or touch to orbit</span>
              </div>
            </div>
          </PerspectiveTiltCard>

          {/* Real-Time UI-UX Pro Max Controls (Design 1 PrecisionCard) */}
          <PrecisionCard colorAccent="emerald">
            <div className="p-6 flex flex-col gap-5">
              <div className="flex items-center justify-between border-b border-border/50 pb-3">
                <div className="flex items-center gap-2.5">
                  <SlidersIcon className="h-4 w-4 text-brand" />
                  <span className="text-sm font-bold tracking-tight text-fg uppercase">UI-UX Pro Max Dimensional Dials</span>
                </div>
                <span className="text-xs font-mono text-fg-muted">Styles: 79 · Palettes: 192</span>
              </div>

              {/* Archetype Selector */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-fg-muted uppercase tracking-wider">
                  Visual Archetype
                </label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {(Object.keys(ARCHETYPES) as ArchetypeKey[]).map((key) => {
                    const item = ARCHETYPES[key];
                    const isSelected = archetype === key;
                    return (
                      <Button
                        key={key}
                        variant={isSelected ? 'cyber-solid' : 'secondary'}
                        size="sm"
                        sound="tick"
                        onClick={() => {
                          setArchetype(key);
                          playHapticTick();
                        }}
                        className="!justify-start text-left !px-3 !py-2.5"
                      >
                        <div className="flex flex-col gap-0.5 truncate">
                          <span className="text-xs font-bold leading-tight truncate">{item.title}</span>
                          <span className="text-[10px] opacity-75 font-mono truncate">{item.fonts.header}</span>
                        </div>
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Tactical Stepper Controls */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 pt-2">
                {/* Variance Dial */}
                <div className="flex flex-col gap-2 rounded-xl border border-border bg-surface-2/40 p-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-fg">Variance</span>
                    <span className="font-mono text-brand font-bold">{variance}/10</span>
                  </div>
                  <div className="flex items-center justify-between gap-1.5">
                    <Button
                      variant="secondary"
                      size="sm"
                      sound="tick"
                      disabled={variance <= 1}
                      onClick={() => {
                        setVariance((v) => Math.max(1, v - 1));
                        playHapticTick();
                      }}
                      className="!h-7 !w-7 !p-0 !min-h-0 !min-w-0 !justify-center"
                    >
                      -
                    </Button>
                    <div className="flex-1 flex gap-0.5 justify-center py-1">
                      {Array.from({ length: 10 }).map((_, i) => (
                        <span
                          key={i}
                          className={`h-2.5 flex-1 rounded-xs transition-colors ${
                            i < variance ? 'bg-brand' : 'bg-surface-2 border border-border/50'
                          }`}
                        />
                      ))}
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      sound="tick"
                      disabled={variance >= 10}
                      onClick={() => {
                        setVariance((v) => Math.min(10, v + 1));
                        playHapticTick();
                      }}
                      className="!h-7 !w-7 !p-0 !min-h-0 !min-w-0 !justify-center"
                    >
                      +
                    </Button>
                  </div>
                  <span className="text-[10px] text-fg-muted truncate">
                    {variance > 6 ? 'Bold / Asymmetric' : 'Centered / Minimal'}
                  </span>
                </div>

                {/* Motion Intensity Dial */}
                <div className="flex flex-col gap-2 rounded-xl border border-border bg-surface-2/40 p-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-fg">Motion</span>
                    <span className="font-mono text-cyan font-bold">{motion}/10</span>
                  </div>
                  <div className="flex items-center justify-between gap-1.5">
                    <Button
                      variant="secondary"
                      size="sm"
                      sound="tick"
                      disabled={motion <= 1}
                      onClick={() => {
                        setMotion((m) => Math.max(1, m - 1));
                        playHapticTick();
                      }}
                      className="!h-7 !w-7 !p-0 !min-h-0 !min-w-0 !justify-center"
                    >
                      -
                    </Button>
                    <div className="flex-1 flex gap-0.5 justify-center py-1">
                      {Array.from({ length: 10 }).map((_, i) => (
                        <span
                          key={i}
                          className={`h-2.5 flex-1 rounded-xs transition-colors ${
                            i < motion ? 'bg-cyan' : 'bg-surface-2 border border-border/50'
                          }`}
                        />
                      ))}
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      sound="tick"
                      disabled={motion >= 10}
                      onClick={() => {
                        setMotion((m) => Math.min(10, m + 1));
                        playHapticTick();
                      }}
                      className="!h-7 !w-7 !p-0 !min-h-0 !min-w-0 !justify-center"
                    >
                      +
                    </Button>
                  </div>
                  <span className="text-[10px] text-fg-muted truncate">
                    {motion > 6 ? 'Complex Kinetic Orbit' : 'Subtle Micro-Spring'}
                  </span>
                </div>

                {/* Visual Density Dial */}
                <div className="flex flex-col gap-2 rounded-xl border border-border bg-surface-2/40 p-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-fg">Density</span>
                    <span className="font-mono text-brand font-bold">{density}/10</span>
                  </div>
                  <div className="flex items-center justify-between gap-1.5">
                    <Button
                      variant="secondary"
                      size="sm"
                      sound="tick"
                      disabled={density <= 1}
                      onClick={() => {
                        setDensity((d) => Math.max(1, d - 1));
                        playHapticTick();
                      }}
                      className="!h-7 !w-7 !p-0 !min-h-0 !min-w-0 !justify-center"
                    >
                      -
                    </Button>
                    <div className="flex-1 flex gap-0.5 justify-center py-1">
                      {Array.from({ length: 10 }).map((_, i) => (
                        <span
                          key={i}
                          className={`h-2.5 flex-1 rounded-xs transition-colors ${
                            i < density ? 'bg-brand' : 'bg-surface-2 border border-border/50'
                          }`}
                        />
                      ))}
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      sound="tick"
                      disabled={density >= 10}
                      onClick={() => {
                        setDensity((d) => Math.min(10, d + 1));
                        playHapticTick();
                      }}
                      className="!h-7 !w-7 !p-0 !min-h-0 !min-w-0 !justify-center"
                    >
                      +
                    </Button>
                  </div>
                  <span className="text-[10px] text-fg-muted truncate">
                    {density > 6 ? 'Compact Dashboard' : 'Generous Spacing'}
                  </span>
                </div>
              </div>
            </div>
          </PrecisionCard>
        </div>

        {/* ── RIGHT WING (5 Cols): Design 2 Chromatic Crown & Prompt Crucible ── */}
        <div className="flex flex-col gap-6 lg:col-span-5">
          {/* Design 2 Chromatic Crown Card */}
          <PerspectiveTiltCard isCrown maxTilt={8}>
            <div className="p-6 flex flex-col gap-5">
              {/* Header Badge */}
              <div className="flex items-center justify-between border-b border-border/50 pb-3">
                <div className="flex items-center gap-2">
                  <SparklesIcon className="h-5 w-5 text-cyan" />
                  <span className="text-sm font-bold tracking-tight text-fg uppercase">Synthesized Prompt Blueprint</span>
                </div>
                <span className="rounded-full border border-cyan/40 bg-cyan/10 px-2.5 py-0.5 text-[10px] font-mono font-semibold text-cyan uppercase tracking-wider">
                  DESIGN 2 CROWN
                </span>
              </div>

              {/* Domain Metadata Row */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="flex flex-col gap-1 rounded-xl border border-border bg-surface-2/60 p-3">
                  <span className="text-[10px] font-mono text-fg-muted uppercase">Curated Typography</span>
                  <span className="font-bold text-fg">{activeData.fonts.header}</span>
                  <span className="text-[10px] text-fg-muted">Pairing: {activeData.fonts.body}</span>
                </div>
                <div className="flex flex-col gap-1 rounded-xl border border-border bg-surface-2/60 p-3">
                  <span className="text-[10px] font-mono text-fg-muted uppercase">Palette Tokens</span>
                  <div className="flex items-center gap-2 pt-0.5">
                    <span style={{ backgroundColor: activeData.colors.primary }} className="h-4 w-4 rounded-full border border-border shadow-sm" />
                    <span style={{ backgroundColor: activeData.colors.secondary }} className="h-4 w-4 rounded-full border border-border shadow-sm" />
                    <span style={{ backgroundColor: activeData.colors.accent }} className="h-4 w-4 rounded-full border border-border shadow-sm" />
                    <span className="font-mono text-[10px] text-fg ml-auto font-semibold">{activeData.colors.primary}</span>
                  </div>
                  <span className="text-[10px] text-fg-muted truncate">{activeData.category}</span>
                </div>
              </div>

              {/* Blueprint Terminal Output */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs font-mono text-fg-muted">
                  <span>SPECIFICATION MATRIX</span>
                  <span>ZERO-SLOP ENGINE</span>
                </div>
                <div className="relative rounded-xl border border-border bg-bg/95 p-3.5 font-mono text-xs text-fg leading-relaxed shadow-inner overflow-x-auto max-h-[260px] select-text">
                  <pre className="whitespace-pre-wrap">{promptBlueprint}</pre>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
                <Button
                  variant="primary"
                  size="md"
                  sound="chime"
                  onClick={handleSynthesize}
                  className="w-full sm:flex-1 !justify-center"
                >
                  <RefreshIcon className={`h-4 w-4 ${synthesized ? 'animate-spin' : ''}`} />
                  <span>{synthesized ? 'Synthesized!' : 'Synthesize Blueprint'}</span>
                </Button>

                <Button
                  variant="secondary"
                  size="md"
                  sound="tick"
                  onClick={handleCopy}
                  className="w-full sm:w-auto !justify-center !px-4"
                >
                  {copied ? (
                    <>
                      <CheckIcon className="h-4 w-4 text-brand" />
                      <span className="text-brand">Copied</span>
                    </>
                  ) : (
                    <>
                      <CopyIcon className="h-4 w-4 text-fg" />
                      <span>Copy</span>
                    </>
                  )}
                </Button>
              </div>

              {/* Best For Tagline */}
              <div className="rounded-xl border border-border/40 bg-surface-2/30 px-3.5 py-2 text-[11px] text-fg-muted flex items-center gap-2">
                <LayersIcon className="h-3.5 w-3.5 text-brand flex-shrink-0" />
                <span className="truncate"><span className="font-semibold text-fg">Ideal for:</span> {activeData.bestFor}</span>
              </div>
            </div>
          </PerspectiveTiltCard>
        </div>
      </div>
    </div>
  );
}
