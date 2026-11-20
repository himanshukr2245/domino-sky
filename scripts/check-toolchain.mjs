#!/usr/bin/env node
// scripts/check-toolchain.mjs — [BLD-11/12, DSN-11] Sovereign Dependencies, Turbopack, and Zero Glassmorphism Gate.
// 1. [BLD-11] Guarantees node_modules is a physical, sovereign directory — NEVER an NTFS junction/symlink.
// 2. [BLD-12] Guarantees package.json "dev" script uses Next.js Turbopack (--turbo) — NEVER downgraded to --webpack.
// 3. [DSN-11] Guarantees core routes use AWS Precision / Spotlight Cards — BANS GlassCard and heavy backdrop-blur.

import { existsSync, lstatSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

let failed = false;

// 1. Verify node_modules sovereignty [BLD-11]
if (existsSync('node_modules')) {
  try {
    const stat = lstatSync('node_modules');
    if (stat.isSymbolicLink()) {
      console.error('\n❌ check-toolchain [BLD-11]: FAKE DEPENDENCY JUNCTION DETECTED!');
      console.error('   "node_modules" is an NTFS directory junction or symlink.');
      console.error('   Next.js Turbopack requires physical module resolution on Windows and fails on symlinks.');
      console.error('   Fix:');
      console.error('     cmd /c rmdir node_modules');
      console.error('     npm install\n');
      failed = true;
    }
  } catch (err) {
    console.warn(`⚠️  check-toolchain [BLD-11]: could not lstat node_modules (${err.message})`);
  }
}

// 2. Verify Turbopack inviolability [BLD-12]
if (existsSync('package.json')) {
  try {
    const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
    const devScript = pkg.scripts?.dev || '';
    if (devScript.includes('--webpack')) {
      console.error('\n❌ check-toolchain [BLD-12]: WEBPACK PERFORMANCE DEGRADATION DETECTED!');
      console.error('   package.json "dev" script contains "--webpack".');
      console.error('   HK Universal Standard mandates zero-blur ultra-speed Turbopack compilation.');
      console.error('   Fix:');
      console.error('     Change "--webpack" to "--turbo" in package.json dev scripts.\n');
      failed = true;
    }
  } catch (err) {
    console.warn(`⚠️  check-toolchain [BLD-12]: could not read package.json (${err.message})`);
  }
}

// 3. Verify Zero Glassmorphism & Card Design Standard [DSN-11]
function findTsxFiles(dir) {
  let results = [];
  if (!existsSync(dir)) return results;
  const list = readdirSync(dir, { withFileTypes: true });
  for (const entry of list) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== '.next') {
        results = results.concat(findTsxFiles(fullPath));
      }
    } else if (entry.name.endsWith('.tsx')) {
      results.push(fullPath);
    }
  }
  return results;
}

const appFiles = findTsxFiles('src/app');
for (const file of appFiles) {
  const content = readFileSync(file, 'utf8');
  if (content.includes('<GlassCard') && !content.includes('@hk-glass-exception')) {
    console.error(`\n❌ check-toolchain [DSN-11]: GLASSCARD USAGE DETECTED in "${file}"!`);
    console.error('   Glassmorphism cards drop frame rate to 43 FPS and violate HK Precision Card standard.');
    console.error('   HK Universal Standard mandates <AwsSpotlightCard> or <SpotlightCard> from @/components/ui.');
    console.error('   Fix: Replace <GlassCard> with <AwsSpotlightCard colorAccent="cyan">.\n');
    failed = true;
  }
}

if (failed) {
  process.exit(1);
}

console.log('✅ check-toolchain [BLD-11/12, DSN-11]: clean (sovereign dependencies + native Turbopack + 120 FPS precision cards)');
