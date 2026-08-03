// =========================================================
// AKER OSGB - Görselleri yeniden indirir
// =========================================================
// Site görselleri bir zamanlar Bubble CDN'inde tutuluyordu; artık
// img/ altında yerel olarak duruyor. tools/image-map.json dosyası
// özgün Bubble adresi ile yerel dosya eşlemesini saklar.
//
// Bu betik yalnızca bir görsel kaybolduğunda veya farklı çözünürlükte
// yeniden üretilmesi gerektiğinde kullanılır; normal geliştirmede
// çalıştırılmasına gerek yoktur.
//
// Kullanım: node tools/fetch-images.ts [dosya-adı ...]
//   Argüman verilmezse eşlemedeki bütün görseller indirilir.
// =========================================================

import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const IMG_DIR = path.join(ROOT, 'img');
const MAP_FILE = path.join(ROOT, 'tools', 'image-map.json');

/** Yerel dosya adına göre indirme genişliği. */
const WIDTHS: { pattern: RegExp; width: number }[] = [
  { pattern: /^slide-/, width: 1920 },
  { pattern: /^banner/, width: 1920 },
  { pattern: /^isbasvuru-banner/, width: 1536 },
  { pattern: /^career-\d+-kart/, width: 480 },
  { pattern: /^career-/, width: 1200 },
  { pattern: /^doc-/, width: 800 },
  { pattern: /^news-/, width: 512 },
  { pattern: /^team-/, width: 384 },
  { pattern: /^client-/, width: 240 },
  { pattern: /^ikon-/, width: 128 },
  { pattern: /^og-gorsel/, width: 1200 },
  { pattern: /^favicon/, width: 512 },
  { pattern: /^aker-osgb-logo/, width: 240 },
];

function widthFor(fileName: string): number {
  return WIDTHS.find((entry) => entry.pattern.test(fileName))?.width ?? 800;
}

/** Bubble CDN adresini istenen genişlikte WebP döndürecek biçime çevirir. */
function transform(rawUrl: string, width: number): string {
  const url = rawUrl.startsWith('//') ? `https:${rawUrl}` : rawUrl;
  const options = `w=${width},h=,f=webp,q=82,dpr=1,fit=contain`;
  const marker = '/cdn-cgi/image/';
  const index = url.indexOf(marker);

  if (index !== -1) {
    const after = url.slice(index + marker.length);
    return url.slice(0, index + marker.length) + options + after.slice(after.indexOf('/'));
  }

  const parsed = new URL(url);
  return `${parsed.origin}/cdn-cgi/image/${options}${parsed.pathname}`;
}

async function download(rawUrl: string, localPath: string): Promise<number> {
  const res = await fetch(transform(rawUrl, widthFor(path.basename(localPath))), {
    headers: {
      accept: 'image/webp,image/avif,image/*,*/*;q=0.8',
      'user-agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0 Safari/537.36',
    },
  });
  if (!res.ok) throw new Error(`${res.status} ${rawUrl}`);

  const buffer = Buffer.from(await res.arrayBuffer());
  writeFileSync(path.join(ROOT, localPath), buffer);
  return buffer.length;
}

const map = JSON.parse(await readFile(MAP_FILE, 'utf8')) as Record<string, string>;
const wanted = process.argv.slice(2);

if (!existsSync(IMG_DIR)) mkdirSync(IMG_DIR, { recursive: true });

const entries = Object.entries(map).filter(
  ([, localPath]) => wanted.length === 0 || wanted.includes(path.basename(localPath)),
);

if (entries.length === 0) {
  console.log('Eşleşen görsel yok. Dosya adlarını img/ altındaki adlarla verin.');
} else {
  let total = 0;
  const failed: string[] = [];

  for (const [url, localPath] of entries) {
    try {
      const bytes = await download(url, localPath);
      total += bytes;
      console.log(`OK   ${localPath.padEnd(34)} ${(bytes / 1024).toFixed(0)} KB`);
    } catch (err) {
      const message = (err as Error).message;
      failed.push(`${localPath}: ${message}`);
      console.log(`HATA ${localPath}: ${message}`);
    }
  }

  console.log(
    `\n${entries.length - failed.length} görsel indirildi, toplam ${(total / 1024 / 1024).toFixed(2)} MB`,
  );
  if (failed.length) console.log(`${failed.length} görsel başarısız:\n${failed.join('\n')}`);
  console.log('Boyutları güncellemek için: node tools/image-info.ts');
}
