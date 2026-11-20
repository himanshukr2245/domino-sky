// scripts/check-emojis.mjs — [DSN-10] pure vector iconography & zero-emoji interfaces.
//   node scripts/check-emojis.mjs
// Unicode emojis (🚀, 🛡️, 📊, 🔥, etc.) degrade enterprise and national-grade software into amateur student projects.
// All UI components must use pure inline SVGs or vector icons (e.g. Lucide / HK primitives).
// Escape hatches:
//   - "emojis-ok" on a line
//   - "/* emojis-ok-file: <reason> */" in a file (e.g. an emoji sentiment dataset or customer reaction selector)
import { readFileSync } from 'node:fs';
import { collect, report } from './lib/walk.mjs';

const EMOJI_REGEX = /\p{Extended_Pictographic}/u;
const COMMENT = /^\s*(\/\/|\/\*|\*)/;

const files = collect(['src'], ['.tsx', '.jsx', '.ts', '.js']);
const problems = [], warnings = [];

for (const f of files) {
  const text = readFileSync(f, 'utf8');

  if (text.includes('emojis-ok-file')) {
    const why = text.match(/emojis-ok-file:\s*([^\n*]{10,}?)\s*(?:\*\/|$)/m)?.[1];
    if (why) {
      warnings.push(`${f} opts out of zero-emoji gate: ${why.trim()}`);
    } else {
      problems.push(`${f}: emojis-ok-file needs a reason — "/* emojis-ok-file: <why emojis are domain data here> */"`);
    }
    continue;
  }

  text.split('\n').forEach((line, i) => {
    if (COMMENT.test(line) || line.includes('emojis-ok')) return;
    const m = line.match(EMOJI_REGEX);
    if (m) {
      problems.push(`${f}:${i + 1} → raw emoji "${m[0]}" found — use pure inline SVG or vector icon [DSN-10]`);
    }
  });
}

report('check-emojis', 'DSN-10', problems, warnings);
