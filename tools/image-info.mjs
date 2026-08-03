// =========================================================
// img/ altındaki görsellerin gerçek boyutlarını okur
// =========================================================
// WebP (VP8 / VP8L / VP8X) başlıklarını çözerek genişlik ve
// yükseklik değerlerini çıkarır. Sonuç tools/image-sizes.json
// dosyasına yazılır; HTML'de width/height vermek için kullanılır.
//
// Kullanım: node tools/image-info.mjs
// =========================================================

import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const IMG_DIR = path.join(ROOT, 'img');

function webpSize(buf) {
  if (buf.toString('ascii', 0, 4) !== 'RIFF' || buf.toString('ascii', 8, 12) !== 'WEBP') return null;
  const chunk = buf.toString('ascii', 12, 16);

  if (chunk === 'VP8 ') {
    return { width: buf.readUInt16LE(26) & 0x3fff, height: buf.readUInt16LE(28) & 0x3fff };
  }
  if (chunk === 'VP8L') {
    const b = buf.readUInt32LE(21);
    return { width: (b & 0x3fff) + 1, height: ((b >> 14) & 0x3fff) + 1 };
  }
  if (chunk === 'VP8X') {
    const width = 1 + (buf[24] | (buf[25] << 8) | (buf[26] << 16));
    const height = 1 + (buf[27] | (buf[28] << 8) | (buf[29] << 16));
    return { width, height };
  }
  return null;
}

const sizes = {};
for (const file of readdirSync(IMG_DIR)) {
  if (!file.endsWith('.webp')) continue;
  const size = webpSize(readFileSync(path.join(IMG_DIR, file)));
  if (size) sizes[file] = size;
  else console.log(`boyut okunamadı: ${file}`);
}

writeFileSync(path.join(ROOT, 'tools', 'image-sizes.json'), JSON.stringify(sizes, null, 2) + '\n', 'utf8');
console.log(`${Object.keys(sizes).length} görselin boyutu yazıldı`);
