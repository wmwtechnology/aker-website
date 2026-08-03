# AKER OSGB Sitesi — Nerede Kaldık

Son güncelleme: 2026-08-03
Dal: `master`

## Durum özeti

Bu repodaki statik site **henüz canlıda değil**. `akerosgb.com.tr` şu an hâlâ Bubble
uygulamasını sunuyor (yanıt başlıklarında `X-Powered-By: Express`, `X-Bubble-Perf`,
`Set-Cookie: osgbaker_live_*`). Bu turda yapılan SEO çalışması, repo canlıya alındığında
etkili olacak.

Yapılanlar: teknik SEO altyapısı, semantik HTML, yapılandırılmış veri, görsellerin
repoya taşınması, performans temizliği, 19 yeni içerik sayfası, TypeScript geçişi ve
yönetim panelinin gerçek (sunucu tabanlı) panele dönüştürülmesi.

## Bu turda yapılanlar

### 1. Görseller Bubble CDN'den çıkarıldı
- 105 görsel indirildi, WebP'ye çevrildi, `img/` altına konuldu (toplam ~2,5 MB).
- Tüm HTML ve `src/cms-data.ts` referansları yerel yollara çevrildi.
- Flowick logosu 182 KB'lık SVG yerine 9,7 KB PNG olarak yeniden üretildi.
- Bubble CDN bağımlılığı sıfırlandı (tek istisna kalmadı).

Betikler: `tools/fetch-images.ts`, `tools/image-info.ts`

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
JS ile basılıyordu; HTML'de boş `div` vardı. Artık içerik HTML'de: derleme anında statik
yedek olarak yazılıyor, istek anında ise middleware güncel veri tabanı içeriğiyle
değiştiriyor (bkz. 9. madde).

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
  cms-data.ts       tohum içeriği (veri tabanı ilk kurulurken yüklenir)
  image-sizes.gen.ts  görsel boyutları (üretilir)
  render.ts         paylaşılan içerik işaretlemesi (build + middleware)
  api.ts            yönetim API istemcisi
  dom.ts            küçük DOM yardımcıları
  script.ts         site davranışı
  admin.ts          yönetim paneli
js/             esbuild çıktısı (script.js, admin.js) - REPOYA DAHİL
db/             D1 şeması ve tohum verisi
functions/      Cloudflare Pages Functions (.ts)
tools/          üretici betikler (.ts, Node 24 tip sıyırma ile çalışır)
```

Üç ayrı tsconfig var, çünkü üç ortamın global tipleri farklı:
`tsconfig.json` (DOM), `tsconfig.tools.json` (Node), `tsconfig.functions.json` (Workers).

### 9. Yönetim paneli gerçek panele dönüştürüldü

Panel önceden `localStorage` kullanıyordu: sahibin girdiği içerik yalnızca kendi
tarayıcısında görünüyor, siteye hiç yansımıyordu. Ayrıca şifre istemci kodunda düz
metin duruyordu. İkisi de çözüldü.

**Veri akışı**

```
Ziyaretçi -> Cloudflare Edge -> statik HTML + D1'deki güncel içerik -> tam HTML
Sahip     -> /admin -> API -> D1'e yaz -> içerik sürümü artar -> sayfa anında tazelenir
```

- İçerik `D1` veri tabanında (`db/schema.sql`), görseller ve özgeçmişler `R2`'de.
- `functions/_middleware.ts` statik HTML'deki işaretli bölgeleri istek anında
  veri tabanı içeriğiyle değiştirir. İçerik tarayıcıda çekilmediği için **SEO bozulmaz**;
  bot da ziyaretçi de tam HTML alır.
- Veri tabanına ulaşılamazsa sayfa derleme anındaki içerikle servis edilir; site boş kalmaz.
- Her yazma işleminde `meta.surum` artar. Sayfa önbelleği bu sürüme göre anahtarlanır,
  böylece kayıttan sonra bayat sayfa servis edilmez. Yanıtta `ETag` döner, değişmemiş
  sayfalar 304 ile geçilir.

**Kimlik doğrulama**

- Şifre koddan çıktı, `ADMIN_PASSWORD` secret'ında.
- Giriş başarılı olduğunda HMAC-SHA256 imzalı `HttpOnly` + `SameSite=Strict` çerez, 8 saat.
- Tüm `/api/admin/*` uçları çerez ister; yazma isteklerinde ayrıca Origin denetimi (CSRF).
- IP başına 8 hatalı denemeden sonra 15 dakika kilit.

**Yeni uçlar**

| Uç | İş |
|---|---|
| `POST /api/auth/login` | giriş |
| `GET/DELETE /api/auth/session` | oturum sorgusu / çıkış |
| `GET/POST /api/admin/<koleksiyon>` | listele / ekle |
| `PUT/DELETE /api/admin/<koleksiyon>/<id>` | güncelle / sil |
| `POST /api/admin/<koleksiyon>/sira` | sıralama |
| `POST /api/admin/upload` | görsel yükleme (R2) |
| `GET /api/admin/applications` | başvurular |
| `GET /api/admin/cv/<anahtar>` | özgeçmiş (yalnızca oturumla) |
| `POST /api/basvuru` | iş başvurusu (herkese açık) |
| `GET /img/uploads/<anahtar>` | yüklenen görsel |

**Yan etkiler**

- Başvurular artık tarayıcıda değil veri tabanında; özgeçmiş R2'ye PDF olarak yükleniyor.
- KVKK metni her sayfada açılan kutucuktan çıkarılıp `/kvkk` sayfasına taşındı
  (iki sayfada ~10 KB tasarruf, aynı metnin site içinde tekrarı kalktı).
- Panelden `jszip`, `docx-preview`, `xlsx` CDN bağımlılıkları kaldırıldı; özgeçmiş
  önizlemesi PDF olduğu için tarayıcının kendi görüntüleyicisi yeterli.
- `js/data.js` kaldırıldı; genel sayfalar artık içerik için JavaScript çalıştırmıyor.

## Nasıl çalışıyor

Sayfaların ortak bölümleri (head, menü, alt bilgi, WhatsApp butonu, hizmet listesi)
tek kaynaktan üretilir. HTML dosyalarındaki `<!-- head:start -->` gibi işaretlerin
arası derleme sırasında doldurulur.

```
npm install            # bir kez: typescript, esbuild, tip paketleri
cp .dev.vars.example .dev.vars   # şifre ve oturum anahtarını doldurun
npm run db:setup       # lokal D1: şema + tohum verisi

npm run dev:full       # wrangler pages dev - API ve veri tabanı dahil TAM site
npm run e2e            # 36 uçtan uca sınama (dev:full açıkken)

npm run verify         # tip denetimi + derleme + SEO denetimi
npm run typecheck      # üç tsconfig için tip denetimi
npm run bundle         # src/*.ts -> js/*.js (esbuild)
npm run pages          # statik sayfaları ve sitemap.xml'i üretir
npm run check          # alt, canonical, h1, kırık bağlantı, JSON-LD denetimi
npm run db:seed        # src/cms-data.ts -> db/seed.sql
npm run dev            # yalnızca statik önizleme (API yok, hızlı)
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

0. ~~Veri tabanı, depo ve gizli değerler~~ — **TAMAMLANDI 2026-08-03**:
   - D1 `aker-website` oluşturuldu (`e4e73ca8-8ac6-4fa3-9511-3686e45ac3ef`), şema + tohum yüklendi
   - R2 kovası `aker-website-media` oluşturuldu
   - `ADMIN_PASSWORD` ve `SESSION_SECRET` Pages secret olarak tanımlandı
   - Site `aker-website` Pages projesine deploy edildi (production branch: `master`)
   - **Eksik:** `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `MAIL_FROM` — bunlar girilene kadar
     iletişim formu e-posta göndermez (başvurular yine de veri tabanına kaydedilir).

1. ~~Cloudflare Pages projesi bağlanır~~ — **TAMAMLANDI**. Deploy komutu:

   ```
   npm run verify
   npx wrangler pages deploy . --project-name aker-website --branch master
   ```
   > **Not:** `aker-website.pages.dev` bu ofisin ağından açılmıyor (TLS SNI engeli).
   > Doğrulama dışarıdan bir vekil sunucu üzerinden yapıldı. Panel ancak alan adı
   > bağlandıktan sonra buradan kullanılabilir.

2. **`akerosgb.com.tr` DNS'i Bubble'dan Pages'e çevrilir.** (Wrangler yetkisi zone
   üzerinde yalnızca okuma olduğu için bu adım panelden elle yapılmalıdır:
   Cloudflare Dashboard → Pages → aker-website → Custom domains → Set up a domain.) Bubble'daki sayfa yapısı ile
   yeni yapı birebir aynı (`/`, `/belgelerimiz`, `/ekibimiz`, `/isbasvuru` — canlıda
   kontrol edildi, başka sayfa yok), bu yüzden ek 301 gerekmiyor.
3. **www → apex yönlendirmesi** Cloudflare panelinden Redirect Rule ile kurulmalı.
   `_redirects` dosyası alan adı düzeyinde yönlendirme yapamaz. Şu an `www.akerosgb.com.tr`
   DNS'te var ve içerik sunuyor — bu düzeltilmezse çift içerik olur.
4. **`.dev.vars` / Pages ortam değişkenleri**: iletişim formu Resend kullanıyor
   (`functions/api/contact.js`). Anahtar Pages proje ayarlarına girilmeli, yoksa form çalışmaz.
5. Canlıya alındıktan sonra: Search Console + Bing Webmaster kurulumu, sitemap gönderimi,
   Google Business Profile'da NAP'ın `tools/site.ts`'teki adreslerle birebir aynı olması.

## YARININ İLK İŞİ: iletişim formu e-postası

Canlıda `CONTACT_TO_EMAIL` ve `MAIL_FROM` **tanımlı değil**. Bu hâliyle:

- İletişim formu gönderilemiyor; kullanıcı "Gönderilemedi, lütfen tekrar deneyin." görüyor.
- İş başvuruları panele kaydediliyor ama bildirim e-postası gitmiyor.

Alan adı Pages'e bağlanmadan **önce** çözülmeli, yoksa siteye giren ilk müşteri
formu doldurduğunda hata alır.

Karar verilecekler:
1. **Alıcı** — `info@akerosgb.com.tr` (kullanıcı bunu seçti).
2. **Gönderen** — Resend'de hangi alan adı doğrulanmış? `flowick.com` doğrulanmışsa
   `no-reply@flowick.com` hemen çalışır. `akerosgb.com.tr` tercih edilecekse önce
   Resend'e eklenip SPF/DKIM kayıtları girilmeli (alan adı zaten Cloudflare'de).

Değerler belirlenince:

```
npx wrangler pages secret put CONTACT_TO_EMAIL --project-name aker-website
npx wrangler pages secret put MAIL_FROM --project-name aker-website
npx wrangler pages deploy . --project-name aker-website --branch master
```

Sonrasında gerçek bir gönderim denemesi yapılıp kutuya düştüğü doğrulanmalı.

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
  Google Business Profile'dan alınıp `tools/site.ts`'e eklenebilir.
- **Açılış saatleri.** `openingHours` bilgisi yok; şemaya eklenmesi yerel SEO'ya katkı sağlar.
- **E-posta bülteni** formu hâlâ sahte (sadece "talebiniz alındı" mesajı veriyor,
  hiçbir yere kayıt olmuyor). Ya gerçek bir servise bağlanmalı ya da kaldırılmalı.
- **reCAPTCHA kutusu** gerçek reCAPTCHA değil, sadece bir onay kutusu. Gerçek bot koruması
  için Turnstile veya reCAPTCHA v3 bağlanmalı.
- **Ana sayfa müşteri logoları**: 8 logonun dosya adı anlamsız olduğu için alt metni
  genel ("AKER OSGB referans müşterisi logosu"). Firma adları panelden düzeltilebilir.
- **Görsel boyutları**: panelden yüklenen görsellerde `width`/`height` niteliği yok
  (sunucuda boyut okunmuyor). Yerleşim kaymasını tamamen bitirmek için yükleme sırasında
  boyut saklanabilir.
- **Cloudflare Access**: panel şifresi artık sunucuda, ancak `/admin` yolunu Access ile
  ikinci bir katmana almak yine de önerilir.

## Doğrulama kaydı (yönetim paneli)

- `npm run e2e` → **36 sınamanın 36'sı geçti**: yetkisiz erişim 401, Origin'siz istek 403,
  yanlış şifre 401, giriş/çıkış, listeleme, ekleme, güncelleme, sıralama, silme,
  görsel yükleme, izinsiz dosya türü reddi, başvuru kaydı, bal küpü filtresi ve
  her değişikliğin genel sayfaya yansıması.
- Tarayıcıda panel sürülerek doğrulandı (headless Chrome, `/admin` üzerinden):
  hatalı şifre reddi, giriş, bölüm geçişi, 11 satırlık tablo, yeni kayıt ekleme,
  düzenleme, silme ve her adımın `/ekibimiz` sayfasına yansıması.
- Önbellek davranışı: yanıt `public, no-cache, must-revalidate` + `ETag`;
  değişmemiş sayfa ikinci istekte **304** dönüyor, kayıttan sonra sürüm artıp
  içerik anında tazeleniyor.

## Doğrulama kaydı (TypeScript geçişi)

- `npm run typecheck` → üç projede de hata yok (strict, `noUncheckedIndexedAccess` açık).
- `npm run build` → bundle'lar derlendi, 22 adresli sitemap üretildi.
- İletişim formu: KVKK + reCAPTCHA onayı olmadan buton kapalı, boş formda istek
  gitmiyor, dolu formda tek istek gidiyor, hata mesajı gösteriliyor.

## Doğrulama kaydı (SEO turu)

- `node tools/seo-check.mjs` → "Sorun bulunamadı" (alt, canonical, lang, h1 sayısı,
  benzersiz title/description, kırık iç bağlantı, JSON-LD geçerliliği).
- 18 adres yerel sunucuda tek tek açıldı; hepsinde tek `h1`, JSON-LD ve benzersiz title.
- Ana sayfa, hizmet detayı ve Gebze sayfası Chrome ile görsel olarak kontrol edildi;
  yerleşim bozulmadı.
