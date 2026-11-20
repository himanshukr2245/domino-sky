import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { readFileSync, writeFileSync } from 'node:fs';

// Workers Builds may be configured as `npm run build`. Package the completed Next
// output for Workers without invoking the Next build again (and without recursion).
if (process.env.WORKERS_CI || process.env.WORKERS_CI_COMMIT_SHA) {
  // Next 16.4 moved preview properties into a separately loaded manifest.
  // Adapter 1.20.8 must inline that file too: workerd has no runtime filesystem.
  const pluginPath = resolve('node_modules/@opennextjs/cloudflare/dist/cli/build/patches/plugins/load-manifest.js');
  const original = readFileSync(pluginPath, 'utf8');
  const before = '**/{*-manifest,required-server-files,prefetch-hints}.json';
  const after = '**/{*-manifest,required-server-files,prefetch-hints,preview-props}.json';
  if (!original.includes(after)) {
    if (!original.includes(before)) throw new Error('OpenNext manifest patch no longer matches; review adapter compatibility.');
    writeFileSync(pluginPath, original.replace(before, after));
  }
  const result = spawnSync(process.execPath, [resolve('node_modules/@opennextjs/cloudflare/dist/cli/index.js'), 'build', '--skipNextBuild'], { stdio: 'inherit', windowsHide: true });
  if (result.error) throw result.error;
  process.exit(result.status ?? 1);
}
