// =========================================================
// AKER OSGB - Bubble CDN görsellerini repoya indirir
// =========================================================
// Bubble'ın cdn-cgi/image dönüştürücüsü Accept başlığına göre
// WebP döndürür. Bu betik her görseli istenen genişlikte WebP
// olarak indirip img/ altına yazar ve bir eşleme dosyası üretir.
//
// Kullanım: node tools/fetch-images.mjs
// =========================================================

import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const IMG_DIR = path.join(ROOT, 'img');
const MAP_FILE = path.join(ROOT, 'tools', 'image-map.json');

// Bubble CDN URL'ini istenen genişlikte dönüştürücüden geçir.
function transform(rawUrl, width) {
  let url = rawUrl.startsWith('//') ? 'https:' + rawUrl : rawUrl;
  const opts = `w=${width},h=,f=webp,q=82,dpr=1,fit=contain`;
  const marker = '/cdn-cgi/image/';
  const idx = url.indexOf(marker);
  if (idx !== -1) {
    const after = url.slice(idx + marker.length);
    const slash = after.indexOf('/');
    return url.slice(0, idx + marker.length) + opts + after.slice(slash);
  }
  const u = new URL(url);
  return `${u.origin}/cdn-cgi/image/${opts}${u.pathname}`;
}

async function download(rawUrl, width, name) {
  const url = transform(rawUrl, width);
  const res = await fetch(url, {
    headers: {
      accept: 'image/webp,image/avif,image/*,*/*;q=0.8',
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0 Safari/537.36',
    },
  });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  const type = res.headers.get('content-type') || '';
  const ext = type.includes('webp') ? 'webp'
    : type.includes('png') ? 'png'
    : type.includes('svg') ? 'svg'
    : type.includes('gif') ? 'gif'
    : 'jpg';
  const buf = Buffer.from(await res.arrayBuffer());
  const file = `${name}.${ext}`;
  await writeFile(path.join(IMG_DIR, file), buf);
  return { file, bytes: buf.length, type };
}

// ---------------------------------------------------------
// data.js içindeki koleksiyonlardan URL listesi çıkar
// ---------------------------------------------------------
async function collectFromData() {
  const src = await readFile(path.join(ROOT, 'js', 'data.js'), 'utf8');
  const items = [];

  const grab = (section, re, handler) => {
    const start = src.indexOf(`${section}: [`);
    if (start === -1) throw new Error(`bölüm bulunamadı: ${section}`);
    const end = src.indexOf('\n    ],', start);
    const block = src.slice(start, end === -1 ? src.length : end);
    let m;
    while ((m = re.exec(block)) !== null) handler(m);
  };

  grab('clients', /id: '(client-\d+)', image: '([^']+)'/g, (m) =>
    items.push({ name: m[1], url: m[2], width: 240 }));
  grab('slides', /id: '(slide-\d+)', image: '([^']+)'/g, (m) =>
    items.push({ name: m[1], url: m[2], width: 1920 }));
  grab('careers', /id: '(career-\d+)'[\s\S]*?cardImage: '([^']+)'[\s\S]*?image: '([^']+)'/g, (m) => {
    items.push({ name: `${m[1]}-kart`, url: m[2], width: 480 });
    items.push({ name: m[1], url: m[3], width: 1200 });
  });
  grab('documents', /id: '(doc-\d+)',[\s\S]*?image: '([^']+)'/g, (m) =>
    items.push({ name: m[1], url: m[2], width: 800 }));
  grab('news', /id: '(news-\d+)',[\s\S]*?image: '([^']+)'/g, (m) =>
    items.push({ name: m[1], url: m[2], width: 512 }));
  grab('team', /id: '(team-\d+)', name: '[^']*', role: '[^']*', photo: '([^']+)'/g, (m) =>
    items.push({ name: m[1], url: m[2], width: 384 }));

  return items;
}

// ---------------------------------------------------------
// HTML içinde sabit duran görseller
// ---------------------------------------------------------
const B1 = 'https://e0c771e7ae3bd68159a239fb345fe0e3.cdn.bubble.io';
const B2 = 'https://6e2d58ea2e17ae467bdf1712f1ace591.cdn.bubble.io';

const STATIC_IMAGES = [
  { name: 'aker-osgb-logo', width: 240, url: `${B1}/f1722426808612x933120373654326300/akerosgb-logo-kopya.png` },
  { name: 'aker-osgb-logo-footer', width: 240, url: `${B1}/f1721898840738x195475059741890180/aker_osgb_cover-removebg-preview.png` },
  { name: 'favicon-kaynak', width: 512, url: `${B2}/f1723194062425x528427348987603000/Yeni%20Proje.png` },
  { name: 'og-gorsel-kaynak', width: 1200, url: `${B2}/f1723194243106x298821456218776960/Yeni%20Proje.png` },
  { name: 'banner', width: 1920, url: `${B1}/f1722235485702x758644626793770500/Yeni%20Proje%20%281%29.jpg` },
  { name: 'isbasvuru-banner', width: 1536, url: `${B2}/f1726642826049x171993071999559040/WhatsApp%20Image%202024-09-18%20at%2009.56.55.jpeg` },
  // Hizmet ikonları
  { name: 'ikon-is-guvenligi-uzmanligi', width: 128, url: `${B1}/f1722233931620x585091510413726600/helmet.png` },
  { name: 'ikon-ise-giris-saglik-raporu', width: 128, url: `${B1}/f1722234445061x991351752413906800/insurance.png` },
  { name: 'ikon-yerinde-ambulans', width: 128, url: `${B1}/f1722422137205x124940739417926500/icons8-ambulance-64.png` },
  { name: 'ikon-isyeri-hekimligi', width: 128, url: `${B1}/f1722422164872x360621482505366660/icons8-doctor-50.png` },
  { name: 'ikon-egitim-danismanlik', width: 128, url: `${B1}/f1722234476013x874242062857438700/safety.png` },
  { name: 'ikon-diger-saglik-personeli', width: 128, url: `${B1}/f1722234514930x927116177785451800/public-safety.png` },
  { name: 'ikon-risk-degerlendirmesi', width: 128, url: `${B1}/f1722234584168x114639306519539900/software-testing.png` },
  { name: 'ikon-acil-durum-plani', width: 128, url: `${B1}/f1722234642664x153104915112466800/siren.png` },
  { name: 'ikon-isg-egitimi', width: 128, url: `${B1}/f1722234699216x870950293207190900/fire-extinguisher.png` },
];

async function main() {
  if (!existsSync(IMG_DIR)) await mkdir(IMG_DIR, { recursive: true });

  const items = [...STATIC_IMAGES, ...(await collectFromData())];
  const map = {};
  const failed = [];
  let total = 0;

  for (const item of items) {
    try {
      const out = await download(item.url, item.width, item.name);
      map[item.url] = `img/${out.file}`;
      total += out.bytes;
      console.log(`OK   ${out.file.padEnd(34)} ${(out.bytes / 1024).toFixed(0)} KB`);
    } catch (err) {
      failed.push({ name: item.name, url: item.url, error: String(err.message) });
      console.log(`HATA ${item.name}: ${err.message}`);
    }
  }

  await writeFile(MAP_FILE, JSON.stringify(map, null, 2) + '\n', 'utf8');
  console.log(`\n${Object.keys(map).length} görsel indirildi, toplam ${(total / 1024 / 1024).toFixed(2)} MB`);
  if (failed.length) console.log(`${failed.length} görsel başarısız:`, failed);
}

main();
