// =========================================================
// Basit SEO / sağlamlık denetimi
// =========================================================
// Üretilen HTML dosyalarını tarar ve sık yapılan hataları
// raporlar: eksik alt, geçersiz JSON-LD, kırık yerel bağlantı,
// kalan Bubble adresi, tekrar eden başlık/açıklama.
//
// Kullanım: node tools/seo-check.mjs
// =========================================================

import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function htmlFiles(dir = ROOT, acc = []) {
  for (const entry of readdirSync(dir)) {
    if (['node_modules', '.git', 'tools', 'img', 'css', 'js', 'functions'].includes(entry)) continue;
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) htmlFiles(full, acc);
    else if (entry.endsWith('.html')) acc.push(full);
  }
  return acc;
}

const problems = [];
const titles = new Map();
const descriptions = new Map();

for (const file of htmlFiles()) {
  const rel = path.relative(ROOT, file).replace(/\\/g, '/');
  const src = readFileSync(file, 'utf8');
  const isAdmin = rel === 'admin.html';

  // 1) alt niteliği olmayan görseller
  for (const tag of src.match(/<img\b[^>]*>/g) || []) {
    if (!/\balt=/.test(tag)) problems.push(`${rel}: alt yok -> ${tag.slice(0, 80)}`);
  }

  // 2) JSON-LD geçerliliği
  for (const m of src.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try {
      JSON.parse(m[1]);
    } catch (e) {
      problems.push(`${rel}: JSON-LD ayrıştırılamadı (${e.message})`);
    }
  }

  // 3) kalan Bubble adresleri ve kırık ikon referansları
  if (/cdn\.bubble\.io/.test(src)) problems.push(`${rel}: hâlâ Bubble CDN adresi var`);
  if (/icon_libraries/.test(src)) problems.push(`${rel}: kırık /static/icon_libraries referansı var`);

  // 4) temel etiketler
  if (!isAdmin) {
    if (!/rel="canonical"/.test(src)) problems.push(`${rel}: canonical yok`);
    if (!/<html lang="tr"/.test(src)) problems.push(`${rel}: lang="tr" değil`);
    const h1 = (src.match(/<h1\b/g) || []).length;
    if (h1 !== 1) problems.push(`${rel}: h1 sayısı ${h1}`);

    const title = (src.match(/<title>([^<]*)<\/title>/) || [])[1];
    const desc = (src.match(/<meta name="description" content="([^"]*)"/) || [])[1];
    if (!title) problems.push(`${rel}: title yok`);
    else {
      if (title.length > 65) problems.push(`${rel}: title ${title.length} karakter (65+)`);
      if (titles.has(title)) problems.push(`${rel}: title ${titles.get(title)} ile aynı`);
      titles.set(title, rel);
    }
    if (!desc) problems.push(`${rel}: description yok`);
    else {
      if (desc.length > 165) problems.push(`${rel}: description ${desc.length} karakter (165+)`);
      if (descriptions.has(desc)) problems.push(`${rel}: description ${descriptions.get(desc)} ile aynı`);
      descriptions.set(desc, rel);
    }
  }

  // 5) yerel bağlantı ve varlıkların gerçekten var olması
  for (const m of src.matchAll(/(?:href|src)="(\/[^"#?]*)"/g)) {
    const target = m[1];
    if (target.startsWith('//')) continue;
    const candidates = [
      path.join(ROOT, target),
      path.join(ROOT, target + '.html'),
      path.join(ROOT, target, 'index.html'),
    ];
    if (target === '/') continue;
    if (!candidates.some((c) => existsSync(c))) problems.push(`${rel}: kırık bağlantı ${target}`);
  }
}

if (problems.length === 0) {
  console.log('Sorun bulunamadı.');
} else {
  console.log(`${problems.length} sorun:`);
  for (const p of problems) console.log('  - ' + p);
}
