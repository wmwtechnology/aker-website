// =========================================================
// data.js içindeki görsel yollarını düzeltir
// =========================================================
//  - kart görselleri küçük sürümü (career-N-kart) kullanır
//  - tüm yollar kök göreli (/img/...) hâle getirilir
// Tek sefer çalıştırılır.
// =========================================================

import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const file = path.join(ROOT, 'js', 'data.js');
let src = readFileSync(file, 'utf8');

src = src.replace(/cardImage: 'img\/(career-\d+)\.webp'/g, "cardImage: 'img/$1-kart.webp'");
src = src.replace(/'img\//g, "'/img/");

writeFileSync(file, src, 'utf8');
console.log('data.js görsel yolları düzeltildi');
