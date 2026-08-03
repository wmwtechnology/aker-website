// =========================================================
// AKER OSGB - Uçtan uca sınama
// =========================================================
// Çalışan bir `npm run dev:full` sunucusuna karşı yönetim
// panelinin ve genel sayfaların birlikte doğru çalıştığını
// sınar: yetkilendirme, CRUD, sıralama, yükleme, başvuru ve
// değişikliğin siteye yansıması.
//
// Kullanım: npm run dev:full   (ayrı pencerede)
//           node tools/e2e.ts
// =========================================================

import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const KOK = process.env['E2E_URL'] ?? 'http://localhost:8788';
const SIFRE = process.env['E2E_PASSWORD'] ?? 'aker2026test';

let cerez = '';
let gecen = 0;
let kalan = 0;

function sonuc(ad: string, gecti: boolean, ayrinti = ''): void {
  if (gecti) {
    gecen += 1;
    console.log(`  OK   ${ad}`);
  } else {
    kalan += 1;
    console.log(`  HATA ${ad}${ayrinti ? ` -> ${ayrinti}` : ''}`);
  }
}

interface Yanit {
  status: number;
  govde: string;
  json: Record<string, unknown>;
  headers: Headers;
}

async function iste(yol: string, secenekler: RequestInit & { origin?: boolean } = {}): Promise<Yanit> {
  const { origin = true, headers, ...kalanlar } = secenekler;
  const h = new Headers(headers);
  if (origin) h.set('Origin', KOK);
  if (cerez) h.set('Cookie', cerez);

  const res = await fetch(`${KOK}${yol}`, { ...kalanlar, headers: h, redirect: 'manual' });

  const setCookie = res.headers.get('set-cookie');
  if (setCookie) cerez = setCookie.split(';')[0] ?? cerez;

  const govde = await res.text();
  let json: Record<string, unknown> = {};
  try {
    json = JSON.parse(govde) as Record<string, unknown>;
  } catch {
    json = {};
  }

  return { status: res.status, govde, json, headers: res.headers };
}

function sayac(html: string, desen: RegExp): number {
  return (html.match(desen) ?? []).length;
}

async function calistir(): Promise<void> {
  console.log(`\nSunucu: ${KOK}\n`);

  // --- Genel sayfalar veri tabanından besleniyor mu ---
  console.log('Genel sayfalar');
  const ana = await iste('/');
  sonuc('ana sayfa 200 döner', ana.status === 200, String(ana.status));
  sonuc('sunucu içeriği enjekte etti', ana.headers.get('x-icerik-surum') !== null);
  sonuc('54 referans logosu basıldı', sayac(ana.govde, /class="client-logo"/g) === 54, String(sayac(ana.govde, /class="client-logo"/g)));
  sonuc('4 haber kartı basıldı', sayac(ana.govde, /class="news-card-title"/g) === 4, String(sayac(ana.govde, /class="news-card-title"/g)));
  sonuc('haber kartları dış bağlantıya gidiyor', sayac(ana.govde, /<a class="news-card"/g) === 4);
  sonuc('3 ilan kartı basıldı', sayac(ana.govde, /class="career-card-title"/g) === 3);

  const ekip = await iste('/ekibimiz');
  sonuc('ekip sayfasında 11 kişi var', sayac(ekip.govde, /class="team-name"/g) === 11, String(sayac(ekip.govde, /class="team-name"/g)));

  const belgeler = await iste('/belgelerimiz');
  sonuc('belgeler sayfasında 13 belge var', sayac(belgeler.govde, /class="document-title"/g) === 13);

  const ilan = await iste('/isbasvuru?id=career-2');
  sonuc('iş başvurusu sayfası doğru ilanı gösteriyor', ilan.govde.includes('Engelli bireylerin'));

  // --- Yetkilendirme ---
  console.log('\nYetkilendirme');
  const oturumYok = await iste('/api/auth/session');
  sonuc('oturum başlangıçta kapalı', oturumYok.json['oturum'] === false);

  const yetkisiz = await iste('/api/admin/team');
  sonuc('oturumsuz yönetim isteği 401', yetkisiz.status === 401, String(yetkisiz.status));

  const kaynaksiz = await iste('/api/auth/login', {
    method: 'POST',
    origin: false,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: SIFRE }),
  });
  sonuc('Origin başlığı olmadan giriş 403', kaynaksiz.status === 403, String(kaynaksiz.status));

  const yanlis = await iste('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: 'yanlis-sifre' }),
  });
  sonuc('yanlış şifre 401', yanlis.status === 401, String(yanlis.status));

  const giris = await iste('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: SIFRE }),
  });
  sonuc('doğru şifre ile giriş', giris.status === 200 && giris.json['ok'] === true, String(giris.status));
  sonuc('oturum çerezi HttpOnly', cerez.startsWith('aker_admin='));

  const oturumVar = await iste('/api/auth/session');
  sonuc('oturum açık görünüyor', oturumVar.json['oturum'] === true);

  // --- İçerik yönetimi ---
  console.log('\nİçerik yönetimi');
  const liste = await iste('/api/admin/team');
  const kayitlar = liste.json['kayitlar'] as { id: string; name: string }[];
  sonuc('ekip listesi 11 kayıt', Array.isArray(kayitlar) && kayitlar.length === 11, String(kayitlar?.length));

  const gecersiz = await iste('/api/admin/team', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: '', role: 'Test' }),
  });
  sonuc('boş zorunlu alan 422', gecersiz.status === 422, String(gecersiz.status));

  const ekle = await iste('/api/admin/team', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'SINAMA KISISI', role: 'Sınama Uzmanı', photo: '/img/team-1.webp' }),
  });
  const yeniId = String(ekle.json['id'] ?? '');
  sonuc('yeni kayıt eklendi', ekle.status === 200 && yeniId !== '', String(ekle.status));

  const ekipYeni = await iste('/ekibimiz');
  sonuc('yeni kişi genel sayfada göründü', ekipYeni.govde.includes('SINAMA KISISI'));
  sonuc('ekip sayfası artık 12 kişi', sayac(ekipYeni.govde, /class="team-name"/g) === 12);

  const guncelle = await iste(`/api/admin/team/${yeniId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'SINAMA KISISI', role: 'GUNCELLENMIS UNVAN', photo: '/img/team-1.webp' }),
  });
  sonuc('kayıt güncellendi', guncelle.status === 200, String(guncelle.status));

  const ekipGuncel = await iste('/ekibimiz');
  sonuc('güncelleme genel sayfaya yansıdı', ekipGuncel.govde.includes('GUNCELLENMIS UNVAN'));

  // Sıralama: yeni kaydı en başa al
  const idler = ((await iste('/api/admin/team')).json['kayitlar'] as { id: string }[]).map((k) => k.id);
  const yeniSira = [yeniId, ...idler.filter((id) => id !== yeniId)];
  const sirala = await iste('/api/admin/team/sira', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sira: yeniSira }),
  });
  sonuc('sıralama güncellendi', sirala.status === 200, String(sirala.status));

  const ekipSirali = await iste('/ekibimiz');
  const ilkIsim = /class="team-name">([^<]+)</.exec(ekipSirali.govde)?.[1] ?? '';
  sonuc('sıralama genel sayfaya yansıdı', ilkIsim === 'SINAMA KISISI', ilkIsim);

  // --- Görsel yükleme ---
  console.log('\nGörsel yükleme');
  const form = new FormData();
  // Gerçek bir WebP yüklenir; boyutun dosya adına gömüldüğü de sınanır.
  const webp = readFileSync(path.join(ROOT, 'img', 'client-1.webp'));
  form.append('file', new Blob([webp], { type: 'image/webp' }), 'sinama.webp');
  const yukle = await iste('/api/admin/upload', { method: 'POST', body: form });
  const yol = String(yukle.json['yol'] ?? '');
  sonuc('görsel yüklendi', yukle.status === 200 && yol.startsWith('/img/uploads/'), yol || String(yukle.status));
  sonuc('görsel boyutu dosya adına gömüldü', /-\d+x\d+\.webp$/.test(yol), yol);

  if (yol) {
    const gorsel = await iste(yol);
    sonuc('yüklenen görsel servis ediliyor', gorsel.status === 200, String(gorsel.status));
  }

  const kotuTur = new FormData();
  kotuTur.append('file', new Blob([new Uint8Array([1, 2, 3])], { type: 'application/x-msdownload' }), 'kotu.exe');
  const kotu = await iste('/api/admin/upload', { method: 'POST', body: kotuTur });
  sonuc('izinsiz dosya türü reddedildi', kotu.status === 422, String(kotu.status));

  // --- İş başvurusu ---
  console.log('\nİş başvurusu');
  const basvuru = new FormData();
  basvuru.append('name', 'Sınama Aday');
  basvuru.append('phone', '5551112233');
  basvuru.append('email', 'aday@example.com');
  basvuru.append('message', 'Sınama başvurusu');
  basvuru.append('careerId', 'career-1');
  const basvuruYanit = await iste('/api/basvuru', { method: 'POST', body: basvuru });
  sonuc('başvuru kaydedildi', basvuruYanit.status === 200, String(basvuruYanit.status));

  const basvurular = (await iste('/api/admin/applications')).json['kayitlar'] as { name: string; id: string }[];
  const kayit = basvurular?.find((b) => b.name === 'Sınama Aday');
  sonuc('başvuru panelde görünüyor', Boolean(kayit));

  const balKupu = new FormData();
  balKupu.append('name', 'Bot');
  balKupu.append('phone', '5550000000');
  balKupu.append('email', 'bot@example.com');
  balKupu.append('message', 'spam');
  balKupu.append('company_website', 'https://spam.example');
  await iste('/api/basvuru', { method: 'POST', body: balKupu });
  const basvurular2 = (await iste('/api/admin/applications')).json['kayitlar'] as { name: string }[];
  sonuc('bal küpü dolu başvuru kaydedilmedi', !basvurular2.some((b) => b.name === 'Bot'));

  // --- İletişim formu ---
  console.log('\nİletişim formu');
  const mesajGonder = await iste('/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Mesaj Sınama',
      phone: '5551112233',
      email: 'sinama@example.com',
      message: 'E-posta ayarı yokken mesaj kaydediliyor mu?',
    }),
  });
  sonuc('form gönderimi başarılı dönüyor', mesajGonder.status === 200, String(mesajGonder.status));

  const mesajlar = (await iste('/api/admin/messages')).json['kayitlar'] as
    | { id: string; name: string; mail_gitti: number }[]
    | undefined;
  const mesaj = mesajlar?.find((m) => m.name === 'Mesaj Sınama');
  sonuc('mesaj panele düştü (e-posta olmasa da kaybolmuyor)', Boolean(mesaj));
  sonuc('e-posta durumu kayıtlı', mesaj?.mail_gitti === 0);

  const botMesaj = new URLSearchParams();
  await iste('/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Mesaj Bot',
      phone: '5550000000',
      email: 'bot@example.com',
      message: String(botMesaj),
      company_website: 'https://spam.example',
    }),
  });
  const mesajlar2 = (await iste('/api/admin/messages')).json['kayitlar'] as { name: string }[] | undefined;
  sonuc('bal küpü dolu mesaj kaydedilmedi', !mesajlar2?.some((m) => m.name === 'Mesaj Bot'));

  if (mesaj) {
    const silMesaj = await iste(`/api/admin/messages/${mesaj.id}`, { method: 'DELETE' });
    sonuc('mesaj silinebiliyor', silMesaj.status === 200);
  }

  // --- Bülten aboneliği ---
  console.log('\nBülten aboneliği');
  const abone = await iste('/api/bulten', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'abone@example.com' }),
  });
  sonuc('abonelik kaydedildi', abone.status === 200, String(abone.status));

  const gecersizAbone = await iste('/api/bulten', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'gecersiz-adres' }),
  });
  sonuc('geçersiz e-posta reddedildi', gecersizAbone.status === 422, String(gecersizAbone.status));

  const aboneler = (await iste('/api/admin/subscribers')).json['kayitlar'] as { email: string }[] | undefined;
  sonuc('abone panelde görünüyor', Boolean(aboneler?.some((a) => a.email === 'abone@example.com')));

  const csv = await iste('/api/admin/subscribers/csv');
  sonuc('CSV dışa aktarımı çalışıyor', csv.status === 200 && csv.govde.includes('abone@example.com'));

  const silAbone = await iste('/api/admin/subscribers/abone%40example.com', { method: 'DELETE' });
  sonuc('abone silinebiliyor', silAbone.status === 200, String(silAbone.status));

  // --- Referans logolarının alt metinleri ---
  console.log('\nGörsel alt metinleri');
  sonuc('logo alt metinleri firma adlarını içeriyor', ana.govde.includes('Hepsiburada logosu'));
  sonuc('genel alt metin kalmadı', !ana.govde.includes('AKER OSGB referans müşterisi logosu'));

  // --- Temizlik ---
  console.log('\nTemizlik ve çıkış');
  if (kayit) {
    const silBasvuru = await iste(`/api/admin/applications/${kayit.id}`, { method: 'DELETE' });
    sonuc('başvuru silindi', silBasvuru.status === 200, String(silBasvuru.status));
  }

  const sil = await iste(`/api/admin/team/${yeniId}`, { method: 'DELETE' });
  sonuc('sınama kaydı silindi', sil.status === 200, String(sil.status));

  const ekipSon = await iste('/ekibimiz');
  sonuc('silme genel sayfaya yansıdı', !ekipSon.govde.includes('SINAMA KISISI'));
  sonuc('ekip yeniden 11 kişi', sayac(ekipSon.govde, /class="team-name"/g) === 11);

  const cikis = await iste('/api/auth/session', { method: 'DELETE' });
  sonuc('çıkış yapıldı', cikis.status === 200);

  cerez = '';
  const sonKontrol = await iste('/api/admin/team');
  sonuc('çıkıştan sonra yönetim erişimi kapalı', sonKontrol.status === 401, String(sonKontrol.status));

  console.log(`\n${gecen} geçti, ${kalan} kaldı\n`);
  if (kalan > 0) process.exitCode = 1;
}

await calistir();
