import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';

// Workers Builds may be configured as `npm run build`. Package the completed Next
// output for Workers without invoking the Next build again (and without recursion).
if (process.env.WORKERS_CI || process.env.WORKERS_CI_COMMIT_SHA) {
  const result = spawnSync(process.execPath, [resolve('node_modules/@opennextjs/cloudflare/dist/cli/index.js'), 'build', '--skipNextBuild'], { stdio: 'inherit', windowsHide: true });
  if (result.error) throw result.error;
  process.exit(result.status ?? 1);
}
