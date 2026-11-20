#!/usr/bin/env node
// scripts/spawn-app.mjs — 1-Shot App Spawner & Genesis Engine (HK Universal Library v3.1).
// Usage: node scripts/spawn-app.mjs <app-folder-name> [--archetype <archetype>] [--track <track>] [--tagline <tagline>]
// Example: node scripts/spawn-app.mjs 11-avishkar-ayush --archetype cyber-saas --track "Avishkar 2026"
import { existsSync, cpSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { execSync } from 'node:child_process';

const ARCHETYPES = {
  'cyber-saas': {
    name: 'Cyber-Accented Modern SaaS',
    badgeTone: 'cyan',
    desc: 'Deep obsidian, electric cyan #00e5ff, live pulsing beacons, high judge wow-factor.',
  },
  productivity: {
    name: 'Precision Data-Dense Productivity',
    badgeTone: 'neutral',
    desc: 'DigitalPlat / AWS Console / Bloomberg style — monospace figures, high density, zero blur.',
  },
  editorial: {
    name: 'Editorial Ambient Minimalism',
    badgeTone: 'warning',
    desc: 'Claude + Linear style — elegant typography, spotlight glow cards, generous breathing room.',
  },
  notes: {
    name: 'Quiet Flat Minimalism',
    badgeTone: 'neutral',
    desc: 'ChatGPT + Obsidian style — split-pane, distraction-free markdown canvas, flat opaque surfaces.',
  },
  game: {
    name: 'Cyber-Kinetic High-Feedback',
    badgeTone: 'success',
    desc: 'Arcade HUD + Web Audio — 48px touch targets, spring-pop physics, rich tactile soundboard.',
  },
  storytelling: {
    name: 'Editorial Romance & Creative Storytelling',
    badgeTone: 'warning',
    desc: 'Substack + Apple Books style — cream ivory/midnight sepia, serif typography, reading focus mode.',
  },
};

const args = process.argv.slice(2);
const folderArg = args.find((a) => !a.startsWith('--'));

if (!folderArg) {
  console.log(`
⚡ HK Universal 1-Shot App Spawner & Genesis Engine
Usage:
  node scripts/spawn-app.mjs <app-folder-name> [options]

Arguments:
  app-folder-name       Must follow HK Naming Law: "<NN>-<name>" (e.g. 11-avishkar-ayush, 12-sih-suraksha)

Options:
  --archetype <name>    cyber-saas | productivity | editorial | notes | game | storytelling (default: cyber-saas)
  --track <string>      Hackathon or Product track (e.g. "Avishkar 2026", "SIH 2026")
  --tagline <string>    Custom app tagline
  --title <string>      Human-readable app title (default: derived from folder name)
`);
  process.exit(0);
}

// 1. Validate Directory Naming Law
if (!/^\d{2}-[a-z0-9-]+$/.test(folderArg)) {
  console.error(`\n❌ HK Directory Naming Violation: "${folderArg}"`);
  console.error('Every project in 4-Projects/ MUST follow the pattern: "<NN>-<app_name>" (e.g. 11-avishkar-ayush)');
  process.exit(1);
}

const archetypeArg = args.find((_, i, arr) => arr[i - 1] === '--archetype') || 'cyber-saas';
const trackArg = args.find((_, i, arr) => arr[i - 1] === '--track') || 'General';
const taglineArg = args.find((_, i, arr) => arr[i - 1] === '--tagline') || 'High-performance situational intelligence engine.';
const titleArg = args.find((_, i, arr) => arr[i - 1] === '--title') || folderArg.replace(/^\d+-/, '').split('-').map(s => s.toUpperCase()).join(' ');

const archetype = ARCHETYPES[archetypeArg] || ARCHETYPES['cyber-saas'];
const slug = folderArg.replace(/^\d+-/, '');

const workspaceRoot = process.cwd();
const templateDir = resolve(workspaceRoot, '4-Projects', '00-hk-starter');
const targetDir = resolve(workspaceRoot, '4-Projects', folderArg);

if (!existsSync(templateDir)) {
  console.error(`❌ Template directory not found at: ${templateDir}`);
  process.exit(1);
}

if (existsSync(targetDir)) {
  console.error(`❌ Target directory already exists at: ${targetDir}`);
  process.exit(1);
}

console.log(`\n🚀 Spawning New Application: "${titleArg}" (${folderArg})`);
console.log(`📐 Archetype: ${archetype.name}`);
console.log(`🏷️ Track: ${trackArg}`);
console.log(`🎯 Target Path: ${targetDir}\n`);

// 2. Clean Clone of 00-hk-starter (excluding heavy build & cache directories)
console.log('📦 Cloning foundational baseline from 00-hk-starter...');
const EXCLUDE_DIRS = new Set(['node_modules', '.next', '.open-next', '.wrangler', '.git', 'coverage', 'test-results', 'playwright-report']);

cpSync(templateDir, targetDir, {
  recursive: true,
  filter: (src) => {
    const parts = src.split(/[/\\]/);
    return !parts.some((p) => EXCLUDE_DIRS.has(p));
  },
});
console.log('✅ Foundational files cloned successfully.');

// 3. Customize package.json
try {
  const pkgPath = join(targetDir, 'package.json');
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
  pkg.name = folderArg;
  pkg.description = taglineArg;
  pkg.version = '1.0.0';
  writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
  console.log('✅ Customized package.json');
} catch (err) {
  console.error('Failed to update package.json:', err.message);
}

// 4. Customize src/lib/site.ts
try {
  const sitePath = join(targetDir, 'src', 'lib', 'site.ts');
  const siteContent = `// lib/site.ts — Authoritative application identity and navigation contract.
export interface NavItem {
  readonly href: string;
  readonly label: string;
  readonly badge?: string;
  readonly external?: boolean;
}

export const SITE = {
  name: '${titleArg}',
  shortName: '${titleArg}',
  tagline: '${taglineArg}',
  description: '${taglineArg}',
  url: (process.env.NEXT_PUBLIC_SITE_URL || 'https://${slug}.hkr.dpdns.org').replace(/\\/+$/, ''),
  slug: '${slug}',
  author: 'Himanshu Kumar (Team DELTA)',
  track: '${trackArg}',
  nav: [
    { href: '/', label: 'Home' },
    { href: '/app', label: 'Workbench' },
    { href: '/about', label: 'About' },
    { href: '/support', label: 'Support' },
    { href: '/settings', label: 'Settings' },
  ] as readonly NavItem[],
} as const;

export const RELEASE = process.env.NEXT_PUBLIC_RELEASE ?? 'local';
`;
  writeFileSync(sitePath, siteContent, 'utf8');
  console.log('✅ Configured src/lib/site.ts with dynamic routes and track identity');
} catch (err) {
  console.error('Failed to update src/lib/site.ts:', err.message);
}

// 5. Place Clean Pristine Canvas in src/app/page.tsx (No Nested Header!)
try {
  const pagePath = join(targetDir, 'src', 'app', 'page.tsx');
  const pageContent = `'use client';

// app/page.tsx — ${titleArg} Core Workspace & Command Console.
// Unified under HK Universal Library v3.2 standards.
// ⛔ MANDATORY LAW: RootLayout renders the authoritative <Header />. Never create a nested <header>.
// ⛔ MANDATORY LAW [DSN-11]: Zero glassmorphism. Always use AWS Precision / Spotlight Cards for locked hardware VSync.
import { SITE } from '@/lib/site';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { AwsSpotlightCard } from '@/components/ui/AwsSpotlightCard';
import { FpsCounter } from '@/components/ui/FpsCounter';
import { ExternalLinkIcon } from '@/components/ui/icons';
import { playLaserZip, unlockAudio } from '@/lib/audio/synthesizer';

export default function HomePage() {
  function handleTriggerAction() {
    unlockAudio();
    playLaserZip();
  }

  return (
    <div className="mx-auto max-w-7xl space-y-10 py-6 sm:py-10 animate-fade-in" style={{ contain: 'layout' }}>
      {/* ── Performance & VSync HUD ── */}
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
          </span>
          <span className="text-xs font-mono font-bold tracking-wider uppercase text-fg-muted">
            {SITE.track} Active Node
          </span>
        </div>
        <FpsCounter />
      </div>

      {/* ── Hero Section (Solid High-Contrast, Zero-Blur, Hardware VSync) ── */}
      <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-surface/98 p-6 sm:p-12 shadow-md">
        <div className="max-w-3xl space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-2 px-3 py-1 text-xs font-mono font-semibold text-fg-muted">
            <Badge tone="success" live>LIVE STAGE</Badge>
            <span>v1.0.0 Stable</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-fg leading-tight">
            {SITE.name}
          </h1>

          <p className="text-base sm:text-lg text-fg-muted leading-relaxed">
            {SITE.description}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <ButtonLink
              href="/app"
              variant="cyber-solid"
              sound="laser"
              size="lg"
            >
              <span>LAUNCH WORKBENCH</span>
              <span className="text-sm font-bold">→</span>
            </ButtonLink>
            <ButtonLink
              variant="secondary"
              sound="tick"
              href="/about"
            >
              <span>Architecture &amp; Docs</span>
            </ButtonLink>
          </div>
        </div>
      </div>

      {/* ── Three Key Forensic Pillars Grid (AWS Precision Cards — Hardware VSync) ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-1 -mt-1" style={{ contain: 'layout', isolation: 'isolate' }}>
        <AwsSpotlightCard colorAccent="cyan" sound>
          <div className="p-2 space-y-3">
            <div className="flex items-center justify-between">
              <span className="rounded-md bg-surface-2 px-2.5 py-0.5 text-[10.5px] font-mono font-medium tracking-tight text-fg-muted border border-border/60">
                PILLAR 01
              </span>
              <Badge tone="info">&lt;100ms</Badge>
            </div>
            <h3 className="text-lg font-bold tracking-tight text-fg group-hover:text-cyan transition-colors sm:text-xl">
              Real-Time Reactive Analysis
            </h3>
            <p className="text-sm text-fg-muted leading-relaxed">
              Instant sub-millisecond local processing directly on-device with zero network latency wait.
            </p>
          </div>
        </AwsSpotlightCard>

        <AwsSpotlightCard colorAccent="emerald" sound>
          <div className="p-2 space-y-3">
            <div className="flex items-center justify-between">
              <span className="rounded-md bg-surface-2 px-2.5 py-0.5 text-[10.5px] font-mono font-medium tracking-tight text-fg-muted border border-border/60">
                PILLAR 02
              </span>
              <Badge tone="success">Forensic</Badge>
            </div>
            <h3 className="text-lg font-bold tracking-tight text-fg group-hover:text-emerald transition-colors sm:text-xl">
              Evidence Truth Dossier
            </h3>
            <p className="text-sm text-fg-muted leading-relaxed">
              Cryptographically timestamped audit trails formatted for compliance verification.
            </p>
          </div>
        </AwsSpotlightCard>

        <AwsSpotlightCard colorAccent="amber" sound>
          <div className="p-2 space-y-3">
            <div className="flex items-center justify-between">
              <span className="rounded-md bg-surface-2 px-2.5 py-0.5 text-[10.5px] font-mono font-medium tracking-tight text-fg-muted border border-border/60">
                PILLAR 03
              </span>
              <Badge tone="warning">Offline-Proof</Badge>
            </div>
            <h3 className="text-lg font-bold tracking-tight text-fg group-hover:text-amber transition-colors sm:text-xl">
              Sovereign Local-First
            </h3>
            <p className="text-sm text-fg-muted leading-relaxed">
              Full outbox survivability with IndexedDB persistence and seamless cloud edge sync.
            </p>
          </div>
        </AwsSpotlightCard>
      </div>
    </div>
  );
}
`;
  writeFileSync(pagePath, pageContent, 'utf8');
  console.log('✅ Generated pristine archetype canvas in src/app/page.tsx (AWS Precision Cards, zero glassmorphism)');
} catch (err) {
  console.error('Failed to create src/app/page.tsx:', err.message);
}

// 5.1. Inherit 3-Step Universal Action Workbench in src/app/app/page.tsx (LAW-17)
const appPagePath = join(targetDir, 'src', 'app', 'app', 'page.tsx');
if (existsSync(appPagePath)) {
  console.log('✅ Inherited 3-Step Universal Action Workbench in src/app/app/page.tsx (LAW-17)');
} else {
  console.warn('⚠️ src/app/app/page.tsx missing from starter; ensure starter has 5+1 workbench');
}

// 5.2. Purge starter showcase demo routes from newly spawned app (Zero Clutter)
const demoRoutes = ['editorial', 'notes', 'showcase', 'studio', 'design'];
for (const route of demoRoutes) {
  const routePath = join(targetDir, 'src', 'app', route);
  if (existsSync(routePath)) {
    rmSync(routePath, { recursive: true, force: true });
  }
}
console.log('✅ Purged starter demo routes (editorial, notes, showcase, studio, design) for clean 5+1 topology');

// 6. Day-0 Sovereign Git Genesis
console.log('🌱 Initializing sovereign Git repository on branch main...');
const gitCmd = process.platform === 'win32' && existsSync('C:\\Program Files\\Git\\cmd\\git.exe')
  ? '"C:\\Program Files\\Git\\cmd\\git.exe"'
  : 'git';

try {
  execSync(`${gitCmd} init -b main`, { cwd: targetDir, stdio: 'ignore' });
  execSync(`${gitCmd} add -A`, { cwd: targetDir, stdio: 'ignore' });
  execSync(`${gitCmd} commit -m "feat(${slug}): initial Day-0 baseline genesis from HK Universal Starter"`, { cwd: targetDir, stdio: 'ignore' });
  console.log('✅ Fresh sovereign Git repository created with baseline commit.');
} catch (err) {
  console.warn('⚠️ Git init skipped or failed:', err.message);
}

// 7. Sovereign Physical Dependency Installation [BLD-11]
const skipInstall = args.includes('--no-install');
if (!skipInstall) {
  console.log('📦 Installing sovereign physical dependencies (npm install)...');
  try {
    execSync('npm install', { cwd: targetDir, stdio: 'inherit' });
    console.log('✅ Sovereign dependencies installed successfully. Turbopack engine ready.');
  } catch (err) {
    console.warn(`⚠️ Automated npm install skipped or failed (${err.message}). Run "npm install" manually inside the project directory.`);
  }
} else {
  console.log('⚠️ --no-install specified: Sovereign node_modules NOT installed.');
  console.log('   Run "npm install" inside the directory before running dev.');
  console.log('   ⛔ NEVER create an NTFS junction (mklink /J) for node_modules, as this violates [BLD-11] and breaks Turbopack!');
}

console.log(`
🎉 Genesis Complete for "${titleArg}"!
📁 Location: 4-Projects/${folderArg}
🌐 GitHub Desktop: Open "4-Projects/${folderArg}" directly — repository is immediately recognized.

Next Steps:
  1. cd "4-Projects/${folderArg}"
  2. npm run check:fast   (verifies 100% green gate status)
  3. npm run dev          (opens Turbopack dev server at 120 FPS)
`);
