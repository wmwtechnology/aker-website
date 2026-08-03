// =========================================================
// AKER OSGB - Yazım denetimi yardımcısı
// =========================================================
// Sayfalardaki görünür metni çıkarır ve sık yapılan yazım
// hatalarını arar. Bulduğu her şey öneridir; insan gözüyle
// doğrulanması gerekir.
//
// Kullanım: node tools/metin-denetim.ts [adres]
// =========================================================

export {};

const ADRES = process.argv[2] ?? 'http://localhost:8788';

const YOLLAR = [
  '/', '/hakkimizda', '/hizmetlerimiz', '/hizmetlerimiz/is-guvenligi-uzmanligi',
  '/hizmetlerimiz/isyeri-hekimligi', '/hizmetlerimiz/diger-saglik-personeli',
  '/hizmetlerimiz/risk-degerlendirmesi', '/hizmetlerimiz/acil-durum-plani',
  '/hizmetlerimiz/isg-egitimleri', '/hizmetlerimiz/ise-giris-saglik-raporu',
  '/hizmetlerimiz/mobil-saglik-hizmetleri', '/gebze-osgb', '/dilovasi-osgb',
  '/kocaeli-osgb', '/subelerimiz', '/iletisim', '/sss', '/kariyer',
  '/belgelerimiz', '/ekibimiz', '/isbasvuru', '/404',
];

/** Sık karşılaşılan yazım hataları: yanlış -> doğru */
const HATALAR: { desen: RegExp; dogru: string }[] = [
  { desen: /\bherkez\b/gi, dogru: 'herkes' },
  { desen: /\byanlız\b/gi, dogru: 'yalnız' },
  { desen: /\byanlış anlaşılma\b/gi, dogru: '(kontrol)' },
  { desen: /\bfaaliyet gösteren\b/gi, dogru: '(kontrol)' },
  { desen: /\bbir kaç\b/gi, dogru: 'birkaç' },
  { desen: /\bher hangi\b/gi, dogru: 'herhangi' },
  { desen: /\bhiç bir\b/gi, dogru: 'hiçbir' },
  { desen: /\bbir çok\b/gi, dogru: 'birçok' },
  { desen: /\bbir şey\b/g, dogru: '(bir şey ayrı yazılır, doğru)' },
  { desen: /\byada\b/gi, dogru: 'ya da' },
  { desen: /\bveyahut\b/gi, dogru: 'veya' },
  { desen: /\bşuan\b/gi, dogru: 'şu an' },
  { desen: /\bheryer\b/gi, dogru: 'her yer' },
  { desen: /\bbirlikde\b/gi, dogru: 'birlikte' },
  { desen: /\bdahaönce\b/gi, dogru: 'daha önce' },
  { desen: /\bdiğerleri ile\b/gi, dogru: 'diğerleriyle' },
  { desen: /\bmüdahele\b/gi, dogru: 'müdahale' },
  { desen: /\bmüsade\b/gi, dogru: 'müsaade' },
  { desen: /\byalnış\b/gi, dogru: 'yanlış' },
  { desen: /\bpozitiv\b/gi, dogru: 'pozitif' },
  { desen: /\bdoküman\b/g, dogru: '(doküman/döküman: doküman doğru)' },
  { desen: /\bdöküman/gi, dogru: 'doküman' },
  { desen: /\bdökümantasyon/gi, dogru: 'dokümantasyon' },
  { desen: /\bsertifika sı\b/gi, dogru: 'sertifikası' },
  { desen: /\bmüracat\b/gi, dogru: 'müracaat' },
  { desen: /\bdeğerlendirilmesi gerekmektedir\b/gi, dogru: '(uzun anlatım)' },
  { desen: /\bişyeri hekimi\b/g, dogru: '(tutarlılık: işyeri hekimi)' },
  { desen: /\biş yeri hekimi\b/g, dogru: 'işyeri hekimi (tutarlılık)' },
  { desen: /\biş güvenliği uzmanı\b/g, dogru: '(tutarlılık)' },
  { desen: /\bISG\b/g, dogru: 'İSG' },
  { desen: /\bosgb\b/g, dogru: 'OSGB' },
  { desen: /\.\.(?!\.)/g, dogru: '(çift nokta)' },
  { desen: / +[,.;:]/g, dogru: '(noktalama öncesi boşluk)' },
  { desen: /[a-zçğıöşü]{2}[A-ZÇĞİÖŞÜ][a-zçğıöşü]/g, dogru: '(bitişik kelime olabilir)' },
];

/** Yalnızca uyarı olarak listelenecek, hata sayılmayacak desenler. */
const BILGI = new Set(['(kontrol)', '(bir şey ayrı yazılır, doğru)', '(doküman/döküman: doküman doğru)', '(tutarlılık)', '(tutarlılık: işyeri hekimi)']);

function gorunurMetin(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&rarr;/g, '→')
    .replace(/&middot;/g, '·')
    .replace(/&copy;/g, '©')
    .replace(/\s+/g, ' ')
    .trim();
}

let bulgu = 0;
const metinler: Record<string, string> = {};

for (const yol of YOLLAR) {
  const yanit = await fetch(`${ADRES}${yol}`);
  const metin = gorunurMetin(await yanit.text());
  metinler[yol] = metin;

  for (const hata of HATALAR) {
    const eslesmeler = [...metin.matchAll(hata.desen)];
    if (!eslesmeler.length) continue;
    if (BILGI.has(hata.dogru)) continue;

    for (const e of eslesmeler.slice(0, 3)) {
      const konum = e.index ?? 0;
      const cevre = metin.slice(Math.max(0, konum - 45), konum + 55).replace(/\n/g, ' ');
      console.log(`${yol}\n   "${e[0]}" -> ${hata.dogru}\n   ...${cevre}...`);
      bulgu += 1;
    }
  }
}

console.log(`\nToplam ${bulgu} olası düzeltme noktası.`);
console.log(`Toplam metin: ${Object.values(metinler).reduce((t, m) => t + m.length, 0)} karakter.`);
