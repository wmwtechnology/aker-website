// =========================================================
// Bubble CDN görsel adreslerini yerel img/ yollarına çevirir
// =========================================================
// Her Bubble dosyasının URL'inde benzersiz bir kimlik bulunur
// (örn. f1722426808612x933120373654326300). Bu betik o kimliği
// anahtar alarak HTML ve JS dosyalarındaki tüm Bubble adreslerini
// indirilmiş yerel dosyayla değiştirir.
//
// Kullanım: node tools/rewrite-images.mjs
// =========================================================

import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const map = JSON.parse(readFileSync(path.join(ROOT, 'tools', 'image-map.json'), 'utf8'));

// Bubble dosya kimliği -> yerel yol
const byFileId = {};
for (const [url, local] of Object.entries(map)) {
  const m = url.match(/\/(f\d+x\d+)\//);
  if (m) byFileId[m[1]] = local;
}

const TARGETS = ['index.html', 'belgelerimiz.html', 'ekibimiz.html', 'isbasvuru.html', 'admin.html', 'js/data.js'];

let changed = 0;
for (const rel of TARGETS) {
  const file = path.join(ROOT, rel);
  let src = readFileSync(file, 'utf8');
  const before = src;

  // Tam Bubble URL'ini (protokolsüz veya https) yakala, kimliğe göre değiştir
  src = src.replace(
    /(?:https:)?\/\/[0-9a-f]+\.cdn\.bubble\.io\/(?:cdn-cgi\/image\/[^/]*\/)?(f\d+x\d+)\/[^"'\s)]+/g,
    (whole, fileId) => byFileId[fileId] || whole
  );

  if (src !== before) {
    writeFileSync(file, src, 'utf8');
    const count = (before.match(/cdn\.bubble\.io/g) || []).length - (src.match(/cdn\.bubble\.io/g) || []).length;
    changed += count;
    console.log(`${rel}: ${count} adres değiştirildi`);
  }
}

const remaining = TARGETS.flatMap((rel) => {
  const src = readFileSync(path.join(ROOT, rel), 'utf8');
  return (src.match(/[0-9a-f]+\.cdn\.bubble\.io\/[^"'\s)]+/g) || []).map((u) => `${rel}: ${u}`);
});

console.log(`\nToplam ${changed} adres yerelleştirildi.`);
if (remaining.length) console.log(`Kalan Bubble adresleri (${remaining.length}):\n` + remaining.join('\n'));
else console.log('Bubble CDN bağımlılığı kalmadı.');
