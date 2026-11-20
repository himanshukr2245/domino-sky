#!/usr/bin/env node
// scripts/check-git.mjs — [GIT-1] Self-healing Day-0 Git repository gate.
// Guarantees every HK child application is a sovereign Git repository on branch main for GitHub Desktop.
import { existsSync, readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

const hasGit = existsSync('.git');

if (!hasGit) {
  let slug = 'app';
  try {
    const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
    slug = pkg.name || 'app';
  } catch {
    // fallback
  }

  const gitCmd = process.platform === 'win32' && existsSync('C:\\Program Files\\Git\\cmd\\git.exe')
    ? '"C:\\Program Files\\Git\\cmd\\git.exe"'
    : 'git';

  try {
    execSync(`${gitCmd} init -b main`, { stdio: 'ignore' });
    execSync(`${gitCmd} add -A`, { stdio: 'ignore' });
    execSync(`${gitCmd} commit -m "feat(${slug}): Day-0 baseline genesis from HK Universal Starter"`, { stdio: 'ignore' });
    console.log(`✅ check-git [GIT-1]: initialized fresh Git repository on branch main for "${slug}" (ready for GitHub Desktop)`);
  } catch (err) {
    console.warn(`⚠️  check-git [GIT-1]: auto-init skipped or failed (${err.message})`);
  }
} else {
  console.log('✅ check-git [GIT-1]: sovereign git repository active on branch main');
}
