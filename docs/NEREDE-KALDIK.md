# AKER OSGB Sitesi — Nerede Kaldık

Son güncelleme: 2026-08-03
Dal: `seo/altyapi`

## Durum özeti

Bu repodaki statik site **henüz canlıda değil**. `akerosgb.com.tr` şu an hâlâ Bubble
uygulamasını sunuyor (yanıt başlıklarında `X-Powered-By: Express`, `X-Bubble-Perf`,
`Set-Cookie: osgbaker_live_*`). Bu turda yapılan SEO çalışması, repo canlıya alındığında
etkili olacak.

Yapılanlar: teknik SEO altyapısı, semantik HTML, yapılandırılmış veri, görsellerin
repoya taşınması, performans temizliği ve 19 yeni içerik sayfası.

## Bu turda yapılanlar

### 1. Görseller Bubble CDN'den çıkarıldı
- 105 görsel indirildi, WebP'ye çevrildi, `img/` altına konuldu (toplam ~2,5 MB).
- Tüm HTML ve `js/data.js` referansları yerel yollara çevrildi.
- Flowick logosu 182 KB'lık SVG yerine 9,7 KB PNG olarak yeniden üretildi.
- Bubble CDN bağımlılığı sıfırlandı (tek istisna kalmadı).

Betikler: `tools/fetch-images.mjs`, `tools/image-info.mjs`, `tools/rewrite-images.mjs`

### 2. Teknik SEO
- `lang="en"` → `lang="tr"` (tüm sayfalar).
- Her sayfada canonical, benzersiz title ve description, OG/Twitter etiketleri,
  `max-image-preview:large`.
- `robots.txt` (yapay zekâ botları açık), `sitemap.xml` (22 adres) eklendi.
- `_headers` (güvenlik başlıkları + önbellek) ve `_redirects` (eski takma adlar) eklendi.
- `404.html` eklendi.
- Ana sayfa açıklaması 700+ karakterden 150 karaktere indirildi.

### 3. Semantik HTML
- Ana sayfada üç adet `h1` vardı; tek `h1`'e indirildi, bölüm başlıkları `h2` yapıldı.
- `header` / `nav` / `main` / `section` / `footer` elementleri kullanıldı.
- Form alanlarına `label` bağlandı, `skip-link` eklendi.
- Kırık `/static/icon_libraries/...` referansları (repoda olmayan dosyalar) satır içi
  SVG ile değiştirildi.

### 4. Yapılandırılmış veri (JSON-LD)
- Her sayfada `Organization` + `WebSite` + `BreadcrumbList`.
- Ana sayfa, şube ve lokasyon sayfalarında dört şube için `LocalBusiness`.
- Hizmet sayfalarında `Service` ve `FAQPage`.
- `/sss` sayfasında 12 soruluk `FAQPage`.

### 5. Performans
- Kullanılmayan 4 ikon font CDN'i kaldırıldı (mono-icons, remixicon, iconoir, css.gg).
- Kullanılmayan Bubble WhatsApp eklentisi betiği kaldırıldı.
- Tüm görsellere `width`/`height`/`loading`/`decoding` eklendi; hero görseline
  `fetchpriority="high"`.
- YouTube gömüsü `youtube-nocookie` + `loading="lazy"` yapıldı.
- Font çağrısı `display=swap` + `preconnect` ile yenilendi.
- Betikler `defer` ile yükleniyor.

### 6. İçerik HTML'e gömüldü
Haberler, kariyer ilanları, ekip, belgeler, hero ve müşteri logoları önceden yalnızca
JS ile `localStorage`'dan basılıyordu; HTML'de boş `div` vardı. Artık içerik HTML'e
statik olarak yazılıyor. `js/script.js` yalnızca yönetim panelinden o tarayıcıda kayıt
yapılmışsa yeniden çiziyor (`AkerStore.hasCustomData()`).

### 7. Yeni sayfalar (19)
- `/hizmetlerimiz` + 8 hizmet sayfası
- `/gebze-osgb`, `/dilovasi-osgb`, `/kocaeli-osgb`
- `/hakkimizda`, `/subelerimiz`, `/iletisim`, `/sss`, `/kariyer`, `/kvkk`, `/404`

### 8. TypeScript'e geçiş

Tarayıcı kodu, üretici betikler ve Cloudflare Functions TypeScript'e taşındı.
HTML ve CSS dosyaları statik kalmaya devam ediyor.

```
src/            tarayıcı kaynak kodu (TypeScript)
  content-types.ts  içerik modeli tipleri (tarayıcıdan bağımsız)
  types.ts          tarayıcı arayüzleri + window global tanımları
  cms-data.ts       varsayılan içerik (haber, ekip, belge, ilan, referans)
  data.ts           localStorage CMS deposu
  dom.ts            küçük DOM yardımcıları
  script.ts         site davranışı
  admin.ts          yönetim paneli
js/             esbuild çıktısı (data.js, script.js, admin.js) - REPOYA DAHİL
functions/      Cloudflare Pages Functions (.ts)
tools/          üretici betikler (.ts, Node 24 tip sıyırma ile çalışır)
```

Üç ayrı tsconfig var, çünkü üç ortamın global tipleri farklı:
`tsconfig.json` (DOM), `tsconfig.tools.json` (Node), `tsconfig.functions.json` (Workers).

## Nasıl çalışıyor

Sayfaların ortak bölümleri (head, menü, alt bilgi, WhatsApp butonu, hizmet listesi)
tek kaynaktan üretilir. HTML dosyalarındaki `<!-- head:start -->` gibi işaretlerin
arası derleme sırasında doldurulur.

```
npm install         # bir kez: typescript, esbuild, tip paketleri
npm run verify      # tip denetimi + derleme + SEO denetimi (hepsi bir arada)

npm run typecheck   # üç tsconfig için tip denetimi
npm run bundle      # src/*.ts -> js/*.js (esbuild)
npm run pages       # sayfaları ve sitemap.xml'i üretir/günceller
npm run check       # alt, canonical, h1, kırık bağlantı, JSON-LD denetimi
npm run dev         # http://localhost:8788 önizleme sunucusu
```

İçeriği değiştirmek için:
- Site geneli bilgi (telefon, adres, menü): `tools/site.ts`
- Hizmet sayfaları: `tools/content/hizmetler.ts`
- Diğer sayfalar: `tools/content/sayfalar.ts`
- Haber/ekip/belge/ilan/referans verisi: `src/cms-data.ts`

Değişiklikten sonra **mutlaka `npm run build` çalıştırılmalı**, yoksa üretilen HTML ve
`js/` çıktısı güncellenmez.

**Cloudflare Pages'te build komutu tanımlanmamalıdır.** Derleme lokalde yapılır,
çıktı (`js/*.js` ve üretilen HTML) repoya commit edilir; Pages dosyaları olduğu gibi
sunar. Böylece deploy davranışı TypeScript öncesiyle aynı kalır.

## SIRADAKİ: Canlıya alma

1. **Cloudflare Pages projesi bağlanır** (`wrangler.toml` hazır: `pages_build_output_dir = "."`,
   build komutu yok).
2. **`akerosgb.com.tr` DNS'i Bubble'dan Pages'e çevrilir.** Bubble'daki sayfa yapısı ile
   yeni yapı birebir aynı (`/`, `/belgelerimiz`, `/ekibimiz`, `/isbasvuru` — canlıda
   kontrol edildi, başka sayfa yok), bu yüzden ek 301 gerekmiyor.
3. **www → apex yönlendirmesi** Cloudflare panelinden Redirect Rule ile kurulmalı.
   `_redirects` dosyası alan adı düzeyinde yönlendirme yapamaz. Şu an `www.akerosgb.com.tr`
   DNS'te var ve içerik sunuyor — bu düzeltilmezse çift içerik olur.
4. **`.dev.vars` / Pages ortam değişkenleri**: iletişim formu Resend kullanıyor
   (`functions/api/contact.js`). Anahtar Pages proje ayarlarına girilmeli, yoksa form çalışmaz.
5. Canlıya alındıktan sonra: Search Console + Bing Webmaster kurulumu, sitemap gönderimi,
   Google Business Profile'da NAP'ın `tools/site.mjs`'teki adreslerle birebir aynı olması.

## AÇIK İŞLER / DIŞ GİRDİ BEKLEYENLER

- **Mevzuat rakamlarının doğrulanması (ÖNEMLİ).** Hizmet ve SSS sayfalarındaki süreler
  (görevlendirme dakikaları, risk değerlendirmesi ve eğitim yenileme aralıkları,
  ilkyardımcı oranları, periyodik muayene sıklıkları) 6331 sayılı Kanun ve ilgili
  yönetmeliklere göre yazıldı. Yayına almadan önce AKER'in iş güvenliği uzmanı
  tarafından güncel mevzuata karşı kontrol edilmeli.
- **KVKK metni.** `/kvkk` sayfasındaki metin, sitede zaten var olan firma-firma gizlilik
  sözleşmesidir; web sitesi ziyaretçisi için ayrı bir **aydınlatma metni** değildir.
  Hukukçu incelemesi gerekiyor.
- **Google for Jobs.** `/kariyer` sayfasına `JobPosting` şeması eklenmedi; ilan tarihi
  (`datePosted`) ve geçerlilik süresi (`validThrough`) bilgisi yok. Bu bilgiler alınırsa
  her ilan için ayrı sayfa + şema eklenebilir.
- **Şube koordinatları.** `LocalBusiness` şemasına `geo` eklenmedi (enlem/boylam yok).
  Google Business Profile'dan alınıp `tools/site.mjs`'e eklenebilir.
- **Açılış saatleri.** `openingHours` bilgisi yok; şemaya eklenmesi yerel SEO'ya katkı sağlar.
- **E-posta bülteni** formu hâlâ sahte (sadece "talebiniz alındı" mesajı veriyor,
  hiçbir yere kayıt olmuyor). Ya gerçek bir servise bağlanmalı ya da kaldırılmalı.
- **reCAPTCHA kutusu** gerçek reCAPTCHA değil, sadece bir onay kutusu. Gerçek bot koruması
  için Turnstile veya reCAPTCHA v3 bağlanmalı.
- **Yönetim paneli** (`admin.html`) verileri `localStorage`'da tutuyor; girilen içerik
  yalnızca o tarayıcıda görünür, siteye yansımaz. Kalıcı içerik yönetimi için
  D1/KV tabanlı bir çözüm gerekir. Şimdilik içerik `js/data.js` üzerinden değiştirilip
  `node tools/build.mjs` ile yayınlanıyor.
- **Ana sayfa müşteri logoları**: 8 logonun dosya adı anlamsız olduğu için alt metni
  genel ("AKER OSGB referans müşterisi logosu"). Firma adları bilinirse `js/data.js`
  içindeki `alt` alanları düzeltilebilir.

## Doğrulama kaydı (TypeScript geçişi)

- `npm run typecheck` → üç projede de hata yok (strict, `noUncheckedIndexedAccess` açık).
- `npm run build` → 3 bundle derlendi (data 13,5 KB / script 12,7 KB / admin 22,0 KB),
  22 adresli sitemap üretildi.
- Tarayıcıda çalıştırılarak doğrulandı (headless Chrome):
  - Ana sayfa: iki Swiper başlatıldı, 54 referans logosu ve 3 ilan kartı basıldı.
  - Veri deposu: `getAll`, `getById`, `move`, `reset`, `hasCustomData` beklendiği gibi.
  - Yönetim paneli: hatalı/doğru şifre, bölüm geçişi, 11 satırlık ekip tablosu,
    düzenleme modalı, kaydetme ve başvurular bölümü çalışıyor.
  - İletişim formu: KVKK + reCAPTCHA onayı olmadan buton kapalı, boş formda istek
    gitmiyor, dolu formda tek istek gidiyor, hata mesajı gösteriliyor.

## Doğrulama kaydı (SEO turu)

- `node tools/seo-check.mjs` → "Sorun bulunamadı" (alt, canonical, lang, h1 sayısı,
  benzersiz title/description, kırık iç bağlantı, JSON-LD geçerliliği).
- 18 adres yerel sunucuda tek tek açıldı; hepsinde tek `h1`, JSON-LD ve benzersiz title.
- Ana sayfa, hizmet detayı ve Gebze sayfası Chrome ile görsel olarak kontrol edildi;
  yerleşim bozulmadı.
