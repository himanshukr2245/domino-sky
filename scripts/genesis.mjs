#!/usr/bin/env node
// scripts/genesis.mjs — 1-Shot App Spawner & Archetype Configurator (HK Universal Library v3).
// Usage: node scripts/genesis.mjs "My App Name" --archetype [productivity|editorial|notes|cyber-saas|game|storytelling] [--tagline "Tagline"] [--reset-git]
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';

const ARCHETYPES = {
  productivity: {
    name: 'Precision Data-Dense Productivity',
    theme: 'data-dense-productivity',
    desc: 'DigitalPlat / AWS Console / Bloomberg style — monospace figures, high density, alabaster/slate, zero blur.',
  },
  editorial: {
    name: 'Editorial Ambient Minimalism',
    theme: 'editorial-minimalism',
    desc: 'Claude + Linear style — elegant typography, spotlight glow cards, generous breathing room.',
  },
  notes: {
    name: 'Quiet Flat Minimalism',
    theme: 'quiet-flat',
    desc: 'ChatGPT + Notion + Obsidian style — split-pane, distraction-free markdown canvas, flat opaque surfaces.',
  },
  'cyber-saas': {
    name: 'Cyber-Accented Modern SaaS',
    theme: 'cyber-saas',
    desc: 'Vercel + Linear + Antigravity style — deep obsidian, electric cyan #00e5ff, live pulsing beacons.',
  },
  game: {
    name: 'Cyber-Kinetic High-Feedback',
    theme: 'kinetic-game',
    desc: 'Arcade HUD + Web Audio — 48px touch targets, spring-pop physics, rich tactile soundboard.',
  },
  storytelling: {
    name: 'Editorial Romance & Creative Storytelling',
    theme: 'editorial-romance',
    desc: 'Substack + Apple Books style — cream ivory/midnight sepia, serif typography, reading focus mode, ambient audio.',
  },
};

const args = process.argv.slice(2);
const appName = args.find((a) => !a.startsWith('--'));

if (!appName) {
  console.log(`
⚡ HK Starter Genesis Engine v5.0

Usage:
  node scripts/genesis.mjs "App Name" [options]

Options:
  --archetype <name>    productivity | editorial | notes | cyber-saas | game | storytelling
  --tagline <string>    Custom app tagline
  --no-git              Skip automatic git init & initial commit
`);
  process.exit(0);
}

const archetypeArg = args.find((_, i, arr) => arr[i - 1] === '--archetype') || 'productivity';
const taglineArg = args.find((_, i, arr) => arr[i - 1] === '--tagline') || 'Built on the HK Universal Starter v5.0';
const skipGit = args.includes('--no-git');

const archetype = ARCHETYPES[archetypeArg] || ARCHETYPES.productivity;
const slug = appName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

console.log(`\n🚀 Initializing App: "${appName}"`);
console.log(`📐 Selected Archetype: ${archetype.name}`);
console.log(`💡 Description: ${archetype.desc}\n`);

// 1. Update src/lib/site.ts
try {
  let siteTs = readFileSync('src/lib/site.ts', 'utf8');
  siteTs = siteTs.replace(/name: '.*?'/, `name: '${appName}'`);
  siteTs = siteTs.replace(/shortName: '.*?'/, `shortName: '${appName}'`);
  siteTs = siteTs.replace(/description: '.*?'/, `description: '${taglineArg}'`);
  siteTs = siteTs.replace(/slug: '.*?'/, `slug: '${slug}'`);
  writeFileSync('src/lib/site.ts', siteTs, 'utf8');
  console.log('✅ Updated src/lib/site.ts');
} catch (err) {
  console.error('Failed to update src/lib/site.ts:', err.message);
}

// 2. Update package.json
try {
  const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
  pkg.name = slug;
  pkg.description = taglineArg;
  writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n', 'utf8');
  console.log('✅ Updated package.json');
} catch (err) {
  console.error('Failed to update package.json:', err.message);
}

// 3. Initialize Git repository on branch main (Day-0 GitHub Desktop readiness)
if (!skipGit) {
  try {
    const hasGit = existsSync('.git');
    if (!hasGit) {
      const gitCmd = process.platform === 'win32' && existsSync('C:\\Program Files\\Git\\cmd\\git.exe')
        ? '"C:\\Program Files\\Git\\cmd\\git.exe"'
        : 'git';
      execSync(`${gitCmd} init -b main`, { stdio: 'ignore' });
      execSync(`${gitCmd} add -A`, { stdio: 'ignore' });
      execSync(`${gitCmd} commit -m "feat(${slug}): initial commit for ${appName} from HK Universal Starter"`, { stdio: 'ignore' });
      console.log('✅ Fresh git repository initialized on branch main (ready for GitHub Desktop)');
    } else {
      console.log('ℹ️ Git repository already exists (.git detected)');
    }
  } catch (err) {
    console.warn('⚠️ Git init skipped or failed:', err.message);
  }
}

console.log(`
🎉 Genesis Complete!
Remember the 5 Mandatory Laws for Every Child App:
  1. Unified Topbar Law: Update SITE.nav in src/lib/site.ts to define your app's live routes. Header.tsx automatically renders them. NEVER create a duplicate <header> inside page.tsx!
  2. App-Dedicated Homepage: Completely replace src/app/page.tsx with your app's dedicated showcase.
  3. Dedicated Working Engine: Adapt /studio into your app's functional workspace.
  4. Desktop-Responsive Viewport: No narrow tubes (max-w-4xl); use responsive multi-column grids.
  5. Commercial-Safe Typography & Pure SVG Icons: Zero demo fonts, pure SVG vector icons only.

Run \`npm run check:fast\` to verify quality gates, then start building with \`npm run dev\`.
`);
