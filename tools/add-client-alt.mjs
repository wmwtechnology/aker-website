// =========================================================
// Müşteri logolarına alt metni ekler
// =========================================================
// Firma adı, Bubble'daki özgün dosya adından türetilir
// (image-map.json üzerinden). Anlamsız dosya adlarında
// genel bir alt metin kullanılır. Tek sefer çalıştırılır.
//
// Kullanım: node tools/add-client-alt.mjs
// =========================================================

import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const map = JSON.parse(readFileSync(path.join(ROOT, 'tools', 'image-map.json'), 'utf8'));

// yerel yol -> özgün dosya adı
const nameByLocal = {};
for (const [url, local] of Object.entries(map)) {
  const file = decodeURIComponent(url.split('/').pop());
  nameByLocal[local] = file.replace(/\.[a-z0-9]+$/i, '');
}

const GENERIC = /^(logo|images?|site_logo|WhatsApp Image|resim_|indir|download|Yeni Proje|template)/i;

function firmName(raw) {
  if (!raw || GENERIC.test(raw)) return null;
  return raw.replace(/[_-]+/g, ' ').replace(/\s+\(\d+\)$/, '').trim();
}

const file = path.join(ROOT, 'js', 'data.js');
let src = readFileSync(file, 'utf8');
let added = 0;

src = src.replace(/(\{ id: 'client-\d+', image: ')([^']+)(' \})/g, (whole, pre, local, post) => {
  const firm = firmName(nameByLocal[local]);
  const alt = firm ? `${firm} logosu` : 'AKER OSGB referans müşterisi logosu';
  added++;
  return `${pre}${local}', alt: '${alt.replace(/'/g, "\\'")}' }`;
});

writeFileSync(file, src, 'utf8');
console.log(`${added} müşteri logosuna alt metni eklendi`);
