// =========================================================
// AKER OSGB - Veri Deposu (CMS)
// =========================================================
// Sitedeki dinamik içerikleri (kariyer ilanları, belgeler,
// haberler, ekip üyeleri) ve iş başvurularını localStorage
// üzerinde saklayan veri katmanı. Yönetim panelinden yapılan
// değişiklikler buradan okunur/yazılır.
//
// Sayfa içerikleri HTML'e statik olarak gömülüdür; bu depo
// yalnızca panelden kayıt yapılmış tarayıcılarda devreye girer.
// =========================================================

import { DEFAULT_DATA } from './cms-data.ts';
import type {
  AkerApplicationsApi,
  AkerStoreApi,
  Application,
  CmsData,
  CollectionName,
  ItemOf,
} from './types.ts';

const DATA_KEY = 'aker_cms_data_v1';
const APPLICATIONS_KEY = 'aker_cms_applications_v1';

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

let cache: CmsData | null = null;

const Store: AkerStoreApi = {
  load(): CmsData {
    if (cache) return cache;

    let raw: Partial<CmsData> | null = null;
    try {
      raw = JSON.parse(localStorage.getItem(DATA_KEY) ?? 'null') as Partial<CmsData> | null;
    } catch {
      raw = null;
    }

    if (!raw) {
      cache = clone(DEFAULT_DATA);
      return cache;
    }

    // Eksik veya bozuk koleksiyonlar varsayılandan tamamlanır.
    const merged = raw as CmsData;
    for (const key of Object.keys(DEFAULT_DATA) as CollectionName[]) {
      if (!Array.isArray(merged[key])) {
        (merged as Record<CollectionName, unknown>)[key] = clone(DEFAULT_DATA[key]);
      }
    }
    cache = merged;
    return cache;
  },

  save(): void {
    try {
      localStorage.setItem(DATA_KEY, JSON.stringify(this.load()));
    } catch {
      alert('Kaydedilemedi: Tarayıcı depolama alanı dolu. Lütfen daha küçük bir görsel seçin.');
    }
  },

  // Statik HTML zaten basılı olduğundan, JS ile yeniden çizim yalnızca
  // yönetim panelinden kayıt yapılmış tarayıcılarda gerekir.
  hasCustomData(): boolean {
    try {
      return localStorage.getItem(DATA_KEY) !== null;
    } catch {
      return false;
    }
  },

  getAll<K extends CollectionName>(collection: K): CmsData[K] {
    return this.load()[collection];
  },

  getById<K extends CollectionName>(collection: K, id: string | null): ItemOf<K> | null {
    if (!id) return null;
    const items = this.getAll(collection) as ItemOf<K>[];
    return items.find((item) => item.id === id) ?? null;
  },

  add<K extends CollectionName>(collection: K, item: Partial<ItemOf<K>>): ItemOf<K> {
    const created = { ...item, id: generateId(collection) } as ItemOf<K>;
    (this.load()[collection] as ItemOf<K>[]).push(created);
    this.save();
    return created;
  },

  update<K extends CollectionName>(
    collection: K,
    id: string,
    changes: Partial<ItemOf<K>>,
  ): ItemOf<K> | null {
    const item = this.getById(collection, id);
    if (!item) return null;
    Object.assign(item, changes);
    this.save();
    return item;
  },

  remove(collection: CollectionName, id: string): void {
    const data = this.load();
    const items = data[collection] as { id: string }[];
    (data as Record<CollectionName, unknown>)[collection] = items.filter((item) => item.id !== id);
    this.save();
  },

  move(collection: CollectionName, id: string, direction: number): void {
    const items = this.load()[collection] as { id: string }[];
    const index = items.findIndex((item) => item.id === id);
    if (index === -1) return;

    const target = index + direction;
    if (target < 0 || target >= items.length) return;

    const current = items[index]!;
    items[index] = items[target]!;
    items[target] = current;
    this.save();
  },

  reset(): void {
    cache = clone(DEFAULT_DATA);
    this.save();
  },
};

const Applications: AkerApplicationsApi = {
  getAll(): Application[] {
    try {
      return (JSON.parse(localStorage.getItem(APPLICATIONS_KEY) ?? 'null') as Application[] | null) ?? [];
    } catch {
      return [];
    }
  },

  add(application): Application {
    const all = this.getAll();
    const created: Application = {
      ...application,
      id: generateId('app'),
      date: new Date().toISOString(),
    };
    all.unshift(created);
    localStorage.setItem(APPLICATIONS_KEY, JSON.stringify(all));
    return created;
  },

  remove(id: string): void {
    const all = this.getAll().filter((item) => item.id !== id);
    localStorage.setItem(APPLICATIONS_KEY, JSON.stringify(all));
  },
};

window.AkerStore = Store;
window.AkerApplications = Applications;
