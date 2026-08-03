// =========================================================
// AKER OSGB - Tarayıcı tarafı tipler
// =========================================================
// İçerik modeli content-types.ts dosyasındadır (Node tarafı da
// oradan okur). Burada yalnızca tarayıcıya özgü arayüzler ve
// global tanımlar bulunur.
// =========================================================

import type { Application, CmsData, CollectionName, ItemOf } from './content-types.ts';

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

export interface AkerStoreApi {
  load(): CmsData;
  save(): void;
  hasCustomData(): boolean;
  getAll<K extends CollectionName>(collection: K): CmsData[K];
  getById<K extends CollectionName>(collection: K, id: string | null): ItemOf<K> | null;
  add<K extends CollectionName>(collection: K, item: Partial<ItemOf<K>>): ItemOf<K>;
  update<K extends CollectionName>(collection: K, id: string, changes: Partial<ItemOf<K>>): ItemOf<K> | null;
  remove(collection: CollectionName, id: string): void;
  move(collection: CollectionName, id: string, direction: number): void;
  reset(): void;
}

export interface AkerApplicationsApi {
  getAll(): Application[];
  add(application: Omit<Application, 'id' | 'date'>): Application;
  remove(id: string): void;
}

declare global {
  interface Window {
    AkerStore: AkerStoreApi;
    AkerApplications: AkerApplicationsApi;
    /** Ana sayfadaki kaydırıcılar için Swiper (CDN'den yüklenir). */
    Swiper?: new (element: Element, options: Record<string, unknown>) => unknown;
    /** Yönetim panelindeki DOCX önizlemesi (isteğe bağlı, CDN'den yüklenir). */
    docx?: { renderAsync(data: Blob, container: HTMLElement): Promise<unknown> };
    /** Yönetim panelindeki tablo önizlemesi (isteğe bağlı, CDN'den yüklenir). */
    XLSX?: {
      read(data: Uint8Array, options: { type: string }): { SheetNames: string[]; Sheets: Record<string, unknown> };
      utils: { sheet_to_html(sheet: unknown, options: { editable: boolean }): string };
    };
  }
}
