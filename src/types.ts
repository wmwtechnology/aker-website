// =========================================================
// AKER OSGB - Tarayıcı tarafı tipler
// =========================================================
// İçerik modeli content-types.ts dosyasındadır (Node ve
// Cloudflare Functions oradan okur). Burada yalnızca tarayıcıya
// özgü global tanımlar bulunur.
// =========================================================

export type {
  Application,
  Career,
  CertificateDoc,
  Client,
  CmsData,
  CmsItem,
  CollectionName,
  ItemOf,
  NewsItem,
  Slide,
  TeamMember,
} from './content-types.ts';

declare global {
  interface Window {
    /** Ana sayfadaki kaydırıcılar için Swiper (CDN'den yüklenir). */
    Swiper?: new (element: Element, options: Record<string, unknown>) => unknown;
  }
}
