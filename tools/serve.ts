// =========================================================
// AKER OSGB - Yerel önizleme sunucusu
// =========================================================
// Cloudflare Pages'in temiz URL davranışını taklit eder:
//   /sayfa.html  -> 301 -> /sayfa
//   /sayfa       -> sayfa.html
//   /klasor      -> klasor/index.html
//   bulunamayan  -> 404.html
//
// İletişim formu Pages Functions gerektirdiği için burada çalışmaz;
// formu denemek için `npx wrangler pages dev .` kullanın.
//
// Kullanım: node tools/serve.ts   (veya: npm run dev)
// =========================================================

import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = Number(process.env['PORT'] ?? 8788);

const TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.xml': 'application/xml',
  '.txt': 'text/plain; charset=utf-8',
};

/** İstek yolunu diskteki dosyaya çözer; bulunamazsa null döner. */
function resolveFile(urlPath: string): string | null {
  const base = path.join(ROOT, urlPath === '/' ? 'index.html' : urlPath);

  const candidates = [base, `${base}.html`, path.join(base, 'index.html')];
  for (const candidate of candidates) {
    if (!candidate.startsWith(ROOT)) continue; // dizin dışına çıkışı engelle
    if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
  }
  return null;
}

createServer((req, res) => {
  const urlPath = decodeURIComponent((req.url ?? '/').split('?')[0] ?? '/');

  // Pages davranışı: .html uzantılı adresler temiz adrese yönlendirilir.
  if (urlPath.endsWith('.html')) {
    const clean = urlPath === '/index.html' ? '/' : urlPath.slice(0, -'.html'.length);
    res.writeHead(301, { location: clean });
    res.end();
    return;
  }

  const file = resolveFile(urlPath);

  if (!file) {
    const notFound = path.join(ROOT, '404.html');
    res.writeHead(404, { 'content-type': 'text/html; charset=utf-8' });
    if (existsSync(notFound)) createReadStream(notFound).pipe(res);
    else res.end('404');
    return;
  }

  res.writeHead(200, { 'content-type': TYPES[path.extname(file)] ?? 'application/octet-stream' });
  createReadStream(file).pipe(res);
}).listen(PORT, () => {
  console.log(`AKER OSGB önizleme: http://localhost:${PORT}/`);
});
