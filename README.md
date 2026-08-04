# AKER OSGB Web Sitesi

[akerosgb.com.tr](https://akerosgb.com.tr) — Gebze ve Kocaeli'de hizmet veren
AKER Ortak Sağlık ve Güvenlik Birimi'nin kurumsal web sitesi ve yönetim paneli.

Statik HTML + Cloudflare Pages Functions. Derleme adımı lokalde çalışır, çıktı
repoya commit edilir; Cloudflare tarafında build komutu **yoktur**.

---

## Hızlı başlangıç

```bash
npm install                       # typescript, esbuild, tip paketleri
cp .dev.vars.example .dev.vars    # ADMIN_PASSWORD ve SESSION_SECRET doldurun
npm run db:setup                  # lokal D1: şema + tohum verisi
npm run dev:full                  # http://localhost:8788 (API ve veri tabanı dahil)
```

Yönetim paneli: `http://localhost:8788/admin` — şifre `.dev.vars` içindeki `ADMIN_PASSWORD`.

---

## Komutlar

| Komut | İş |
|---|---|
| `npm run dev:full` | Tam site: statik sayfalar + Functions + D1 + R2 |
| `npm run dev` | Yalnızca statik önizleme (API yok, hızlı) |
| `npm run build` | `bundle` + `pages`: tarayıcı kodunu derler, sayfaları üretir |
| `npm run bundle` | `src/*.ts` → `js/*.js` (esbuild) |
| `npm run pages` | Sayfaları ve `sitemap.xml`'i üretir |
| `npm run typecheck` | Üç tsconfig için tip denetimi |
| `npm run check` | SEO denetimi: alt, canonical, h1, kırık bağlantı, JSON-LD |
| `npm run verify` | `typecheck` + `build` + `check` |
| `npm run e2e` | 50 uçtan uca sınama (`dev:full` açıkken) |
| `npm run db:seed` | `src/cms-data.ts` → `db/seed.sql` |
| `npm run db:setup` / `db:setup:remote` | Şema + tohum verisini yükler |

**İçerik veya şablon değiştirdiyseniz `npm run build` çalıştırmadan commit etmeyin** —
üretilen HTML ve `js/` çıktısı güncellenmez.

---

## Dizin yapısı

```
src/                 Tarayıcı kaynak kodu (TypeScript)
  content-types.ts     İçerik modeli tipleri (tarayıcıdan bağımsız)
  cms-data.ts          Tohum içeriği; veri tabanı ilk kurulurken yüklenir
  render.ts            Paylaşılan işaretleme (build + middleware ortak kullanır)
  api.ts               Yönetim API istemcisi
  script.ts            Site davranışı (kaydırıcılar, formlar)
  admin.ts             Yönetim paneli
  image-sizes.gen.ts   Üretilir — görsel boyutları

js/                  esbuild çıktısı (script.js, admin.js) — REPOYA DAHİL
functions/           Cloudflare Pages Functions
  _middleware.ts       Statik HTML'e veri tabanı içeriğini enjekte eder
  _lib/                auth, content, media, validate, ratelimit, mail
  api/                 contact, basvuru, bulten, auth/*, admin/*
db/                  D1 şeması ve tohum verisi
tools/               Üretici ve denetim betikleri (Node 24 tip sıyırma)
  build.ts             Sayfaları ve sitemap'i üretir
  content/             Hizmet ve sayfa metinleri
img/                 Görseller (WebP) — Bubble CDN bağımlılığı yok
docs/NEREDE-KALDIK.md  Ayrıntılı durum ve devir notları
```

---

## İçerik nasıl değişir

**Yönetim panelinden** (`/admin`) — slider, referanslar, kariyer ilanları, belgeler,
haberler, ekip. Değişiklik siteye **anında** yansır, derleme gerekmez. Ayrıca gelen
iş başvuruları, iletişim mesajları ve bülten aboneleri buradan görülür.

**Kod tarafından** — hizmet sayfası metinleri `tools/content/hizmetler.ts`, diğer
sayfalar `tools/content/sayfalar.ts`, telefon/adres/menü `tools/site.ts`.
Değişiklik sonrası `npm run build`.

---

## Nasıl çalışıyor

Sayfalar statik HTML olarak repoda durur; içinde derleme anındaki içerik bulunur.
İstek geldiğinde `functions/_middleware.ts` HTML'deki işaretli bölgeleri
(`<!-- ekip:start --> ... <!-- ekip:end -->`) veri tabanındaki güncel içerikle
değiştirir.

Bu yaklaşım iki şeyi birden sağlar: arama motoru tam HTML görür (içerik tarayıcıda
çekilmez), panelden yapılan değişiklik de anında yayına girer. Veri tabanına
ulaşılamazsa derleme anındaki içerik servis edilir; site boş kalmaz.

Önbellek, `meta.surum` değerine göre anahtarlanır. Her yazma işleminde sürüm artar,
böylece kayıttan sonra eski sayfa servis edilmez. Yanıtta `ETag` döner, değişmemiş
sayfalar `304` ile geçilir.

---

## Dağıtım

```bash
npm run verify
npx wrangler pages deploy . --project-name aker-website --branch master
```

Cloudflare kaynakları: D1 `aker-website`, R2 `aker-website-media`,
Pages projesi `aker-website` (production branch: `master`).

Gerekli secret'lar (Pages → Settings → Environment variables):
`ADMIN_PASSWORD`, `SESSION_SECRET`, `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `MAIL_FROM`.

**Resend hesabı:** Flowick ile **ortak hesap** kullanılıyor — AKER için ayrı hesap
açılmadı. Aynı hesap Bubble'daki Flowick BPM uygulamasında ve `flowick-website`
reposunda da kullanılıyor; entegrasyon deseni birebir aynı (Resend HTTP API,
`POST /emails`, Bearer anahtar, `from`/`to`/`reply_to`).

> **ÖNEMLİ — `flowick.com` GEÇİCİDİR, CANLIYA BÖYLE ÇIKMAZ.**
> AKER'in kendi alan adı (`akerosgb.com.tr`) taşınacak ve gönderen adres
> `@akerosgb.com.tr` olacak. **Alan adı taşıma için AKER'den cevap bekleniyor** —
> bu gelmeden canlıya alma tamamlanmaz.

Hesapta şu an doğrulanmış tek alan adı `flowick.com`, o yüzden **lokal testte**
`MAIL_FROM = AKER OSGB <no-reply@flowick.com>` kullanılıyor. Bu geçici çözümdür.

Kalıcı kurulum (AKER'den cevap gelince):
1. `akerosgb.com.tr` Resend'e alan adı olarak eklenir.
2. Resend'in verdiği SPF/DKIM (+ DMARC) kayıtları alan adının DNS'ine girilir.
3. Doğrulama `verified` olunca `MAIL_FROM` `@akerosgb.com.tr` adresine çevrilir
   ve Pages secret güncellenir.

Alıcı (`CONTACT_TO_EMAIL`) canlıda `info@akerosgb.com.tr`, lokalde
`developer@flowick.com`.

Anahtar repoya **girmez**: lokalde `.dev.vars` (gitignore'lu), canlıda Pages secret.

---

## Dikkat edilecekler

- **Pages'te build komutu tanımlanmamalıdır.** Derleme lokalde yapılır, `js/` ve
  üretilen HTML repoya commit edilir.
- **Üç ayrı tsconfig var** çünkü üç ortamın global tipleri farklı: `tsconfig.json`
  (DOM), `tsconfig.tools.json` (Node), `tsconfig.functions.json` (Workers). Tek
  dosyada birleştirmek çakışma üretir.
- `aker-website.pages.dev` bazı ağlardan TLS SNI engeline takılabilir. Doğrulama
  için dışarıdan bir vekil kullanılabilir: `curl https://r.jina.ai/<adres>`.
- `wrangler.toml` içindeki `database_id` değişirse **lokal veri tabanı da sıfırlanır**;
  `npm run db:setup` ile yeniden kurun.
- Sitedeki "Robot olmadığımı onaylıyorum" kutusu gerçek bir doğrulama değildir; bot
  koruması sunucu tarafındaki hız sınırıdır (`functions/_lib/ratelimit.ts`).

Güncel durum, açık işler ve devir notları: [`docs/NEREDE-KALDIK.md`](docs/NEREDE-KALDIK.md)
