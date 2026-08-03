// =========================================================
// AKER OSGB - Tarayıcı kodu derleyicisi
// =========================================================
// src/*.ts dosyalarını esbuild ile js/*.js olarak derler.
// Cloudflare Pages derleme yapmaz; çıktı repoya commit edilir.
//
// Kullanım: node tools/bundle.ts
// =========================================================

import { build } from 'esbuild';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const ENTRIES = [
  { in: 'src/script.ts', out: 'script' },
  { in: 'src/admin.ts', out: 'admin' },
];

const BANNER = '// Bu dosya src/ altındaki TypeScript kaynaklarından üretilir. Elle düzenlemeyin.';

const result = await build({
  entryPoints: ENTRIES.map((entry) => ({ in: path.join(ROOT, entry.in), out: entry.out })),
  outdir: path.join(ROOT, 'js'),
  bundle: true,
  format: 'iife',
  target: ['es2019'],
  charset: 'utf8',
  minify: false,
  sourcemap: false,
  legalComments: 'none',
  banner: { js: BANNER },
  metafile: true,
  logLevel: 'warning',
});

for (const [file, meta] of Object.entries(result.metafile.outputs)) {
  const name = path.relative(ROOT, path.resolve(ROOT, file)).replace(/\\/g, '/');
  console.log(`derlendi  ${name.padEnd(16)} ${(meta.bytes / 1024).toFixed(1)} KB`);
}
