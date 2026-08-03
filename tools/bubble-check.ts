// =========================================================
// AKER OSGB - Bubble bağımlılığı denetimi
// =========================================================
// Site Bubble'dan tamamen ayrıldı mı? Kaynak dosyalarda ve
// canlı sunucudan dönen HTML'de Bubble izleri arar.
//
// Kullanım: node tools/bubble-check.ts [adres]
// =========================================================

export {};

import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ADRES = process.argv[2] ?? 'http://localhost:8788';

const ATLA = new Set(['node_modules', '.git', '.wrangler', 'img', 'docs', 'tools']);

/** Aranan izler: adres, çalışma zamanı ve sunucu imzaları. */
const IZLER: { desen: RegExp; ad: string }[] = [
  { desen: /cdn\.bubble\.io/i, ad: 'Bubble CDN adresi' },
  { desen: /bubble_session_uid/i, ad: 'Bubble oturum değişkeni' },
  { desen: /appquery|\/package\/run_css/i, ad: 'Bubble çalışma zamanı isteği' },
  { desen: /version-test/i, ad: 'Bubble sürüm yolu' },
  { desen: /osgbaker_live|osgbaker_u1main/i, ad: 'Bubble çerezi' },
];

function dosyalar(dizin: string, toplanan: string[] = []): string[] {
  for (const girdi of readdirSync(dizin)) {
    if (ATLA.has(girdi)) continue;
    const tam = path.join(dizin, girdi);
    if (statSync(tam).isDirectory()) dosyalar(tam, toplanan);
    else if (/\.(html|ts|js|css|json|toml|sql|txt|xml)$/.test(girdi)) toplanan.push(tam);
  }
  return toplanan;
}

console.log('\n1) Kaynak dosyalar\n');
let kaynakBulgu = 0;
for (const dosya of dosyalar(ROOT)) {
  const icerik = readFileSync(dosya, 'utf8');
  for (const iz of IZLER) {
    if (iz.desen.test(icerik)) {
      console.log(`  BULUNDU ${path.relative(ROOT, dosya)} -> ${iz.ad}`);
      kaynakBulgu += 1;
    }
  }
}
console.log(kaynakBulgu === 0 ? '  Temiz: Bubble izi yok.' : `  ${kaynakBulgu} iz bulundu.`);

console.log('\n2) Sunucudan dönen sayfalar\n');
const YOLLAR = ['/', '/ekibimiz', '/belgelerimiz', '/isbasvuru', '/hizmetlerimiz', '/admin'];
let canliBulgu = 0;
const disKaynaklar = new Set<string>();

for (const yol of YOLLAR) {
  const yanit = await fetch(`${ADRES}${yol}`);
  const html = await yanit.text();

  for (const iz of IZLER) {
    if (iz.desen.test(html)) {
      console.log(`  BULUNDU ${yol} -> ${iz.ad}`);
      canliBulgu += 1;
    }
  }

  for (const eslesme of html.matchAll(/(?:src|href)="https?:\/\/([^/"]+)/g)) {
    if (eslesme[1]) disKaynaklar.add(eslesme[1]);
  }
}
console.log(canliBulgu === 0 ? '  Temiz: Bubble izi yok.' : `  ${canliBulgu} iz bulundu.`);

console.log('\n3) Sayfaların çağırdığı dış alan adları\n');
for (const alan of [...disKaynaklar].sort()) {
  console.log(`  ${alan}${/bubble/i.test(alan) ? '   <-- BUBBLE' : ''}`);
}

console.log(
  `\nSonuç: ${kaynakBulgu + canliBulgu === 0 ? 'Site Bubble’dan tamamen bağımsız.' : 'Bubble bağımlılığı sürüyor.'}\n`,
);
