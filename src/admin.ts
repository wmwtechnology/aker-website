// =========================================================
// AKER OSGB - Yönetim Paneli
// =========================================================
// UYARI: Giriş denetimi tamamen istemci tarafındadır ve gerçek
// bir güvenlik katmanı değildir. Panel canlıya alınmadan önce
// kimlik doğrulama sunucu tarafına taşınmalıdır.
// =========================================================

import { byId, escapeAttr, escapeHtml, qs, qsa } from './dom.ts';
import type { Application, CmsItem, CollectionName } from './types.ts';

const ADMIN_USER = 'admin';
const ADMIN_PASS = 'aker2024';
const SESSION_KEY = 'aker_admin_session';

type FieldType = 'text' | 'textarea' | 'image';

interface FieldConfig {
  key: string;
  label: string;
  type?: FieldType;
}

interface ColumnConfig {
  key: string;
  label: string;
  type?: 'image';
  truncate?: boolean;
}

interface CollectionConfig {
  label: string;
  fields: FieldConfig[];
  columns: ColumnConfig[];
}

const COLLECTIONS: Record<CollectionName, CollectionConfig> = {
  clients: {
    label: 'Referanslar',
    fields: [
      { key: 'image', label: 'Logo', type: 'image' },
      { key: 'alt', label: 'Firma adı (görsel alt metni)', type: 'text' },
    ],
    columns: [{ key: 'image', label: '', type: 'image' }],
  },
  slides: {
    label: 'Ana Sayfa Slider',
    fields: [{ key: 'image', label: 'Görsel', type: 'image' }],
    columns: [{ key: 'image', label: '', type: 'image' }],
  },
  careers: {
    label: 'Kariyer İlanları',
    fields: [
      { key: 'title', label: 'Başlık', type: 'text' },
      { key: 'text', label: 'Açıklama', type: 'textarea' },
      { key: 'cardImage', label: 'Kart Görseli', type: 'image' },
      { key: 'image', label: 'Detay Görseli', type: 'image' },
    ],
    columns: [
      { key: 'cardImage', label: '', type: 'image' },
      { key: 'title', label: 'Başlık' },
      { key: 'text', label: 'Açıklama', truncate: true },
    ],
  },
  documents: {
    label: 'Belgelerimiz',
    fields: [
      { key: 'title', label: 'Başlık', type: 'text' },
      { key: 'image', label: 'Görsel', type: 'image' },
    ],
    columns: [
      { key: 'image', label: '', type: 'image' },
      { key: 'title', label: 'Başlık' },
    ],
  },
  news: {
    label: 'Bizden Haberler',
    fields: [
      { key: 'title', label: 'Başlık', type: 'text' },
      { key: 'text', label: 'Açıklama', type: 'textarea' },
      { key: 'image', label: 'Görsel', type: 'image' },
      { key: 'link', label: 'Haber Linki (URL)', type: 'text' },
    ],
    columns: [
      { key: 'image', label: '', type: 'image' },
      { key: 'title', label: 'Başlık' },
      { key: 'text', label: 'Açıklama', truncate: true },
    ],
  },
  team: {
    label: 'Ekibimiz',
    fields: [
      { key: 'name', label: 'Ad Soyad', type: 'text' },
      { key: 'role', label: 'Unvan', type: 'text' },
      { key: 'photo', label: 'Fotoğraf', type: 'image' },
    ],
    columns: [
      { key: 'photo', label: '', type: 'image' },
      { key: 'name', label: 'Ad Soyad' },
      { key: 'role', label: 'Unvan' },
    ],
  },
};

const ORDER_UP_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 15 12 9 18 15"></polyline></svg>';
const ORDER_DOWN_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>';

const state: { section: CollectionName | 'applications'; editingId: string | null } = {
  section: 'slides',
  editingId: null,
};

function isCollection(value: string): value is CollectionName {
  return value in COLLECTIONS;
}

/** Koleksiyon elemanının alanına tip güvenli erişim. */
function fieldValue(item: CmsItem | Record<string, unknown> | null, key: string): string {
  if (!item) return '';
  const value = (item as Record<string, unknown>)[key];
  return typeof value === 'string' ? value : '';
}

document.addEventListener('DOMContentLoaded', () => {
  initLogin();
  initNav();
  initModal();
  initAppDetailModal();
  initReset();

  if (sessionStorage.getItem(SESSION_KEY) === '1') {
    showDashboard();
    renderSection();
  }
});

// ---------------------------------------------------------
// Giriş / Çıkış
// ---------------------------------------------------------
function initLogin(): void {
  const loginBtn = byId<HTMLButtonElement>('login-btn');
  const userInput = byId<HTMLInputElement>('login-username');
  const passInput = byId<HTMLInputElement>('login-password');
  const errorBox = byId('login-error');
  const logoutBtn = byId<HTMLButtonElement>('logout-btn');
  if (!loginBtn || !userInput || !passInput || !errorBox) return;

  function attempt(): void {
    if (userInput!.value === ADMIN_USER && passInput!.value === ADMIN_PASS) {
      sessionStorage.setItem(SESSION_KEY, '1');
      errorBox!.textContent = '';
      showDashboard();
      renderSection();
    } else {
      errorBox!.textContent = 'Kullanıcı adı veya şifre hatalı.';
    }
  }

  loginBtn.addEventListener('click', attempt);
  for (const input of [userInput, passInput]) {
    input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') attempt();
    });
  }

  logoutBtn?.addEventListener('click', () => {
    sessionStorage.removeItem(SESSION_KEY);
    location.reload();
  });
}

function showDashboard(): void {
  const login = byId('login-screen');
  const dashboard = byId('admin-dashboard');
  if (login) login.style.display = 'none';
  if (dashboard) dashboard.style.display = 'flex';
}

// ---------------------------------------------------------
// Gezinme
// ---------------------------------------------------------
function initNav(): void {
  const buttons = qsa<HTMLButtonElement>('.admin-nav-btn');
  for (const btn of buttons) {
    btn.addEventListener('click', () => {
      for (const other of buttons) other.classList.remove('active');
      btn.classList.add('active');

      const section = btn.dataset['section'] ?? '';
      state.section = section === 'applications' || isCollection(section) ? section : 'slides';
      renderSection();
    });
  }
}

// ---------------------------------------------------------
// Bölüm içeriği
// ---------------------------------------------------------
function renderSection(): void {
  if (sessionStorage.getItem(SESSION_KEY) !== '1') return;

  const titleEl = byId('admin-section-title');
  const addBtn = byId('add-btn');
  const content = byId('admin-content');
  if (!titleEl || !addBtn || !content) return;

  if (state.section === 'applications') {
    titleEl.textContent = 'Başvurular';
    addBtn.style.display = 'none';
    renderApplications(content);
    return;
  }

  const config = COLLECTIONS[state.section];
  titleEl.textContent = config.label;
  addBtn.style.display = 'inline-flex';
  renderTable(content, config, state.section);
}

function renderTable(content: HTMLElement, config: CollectionConfig, section: CollectionName): void {
  const items = window.AkerStore.getAll(section) as CmsItem[];
  const countHtml = `<div class="admin-record-count">Toplam Kayıt Sayısı : ${items.length}</div>`;

  if (items.length === 0) {
    content.innerHTML = `${countHtml}<div class="admin-empty">Henüz içerik eklenmedi.</div>`;
    return;
  }

  const head = config.columns.map((col) => `<th>${escapeHtml(col.label)}</th>`).join('');
  const rows = items
    .map((item, index) => {
      const orderCell =
        '<td class="admin-row-order">' +
        `<button class="admin-order-btn" data-action="move-up" data-id="${escapeAttr(item.id)}"${index === 0 ? ' disabled' : ''} aria-label="Yukarı taşı">${ORDER_UP_SVG}</button>` +
        `<button class="admin-order-btn" data-action="move-down" data-id="${escapeAttr(item.id)}"${index === items.length - 1 ? ' disabled' : ''} aria-label="Aşağı taşı">${ORDER_DOWN_SVG}</button>` +
        '</td>';

      const cells = config.columns
        .map((col) => {
          const value = fieldValue(item, col.key);
          if (col.type === 'image') return `<td><img class="admin-thumb" src="${escapeAttr(value)}" alt=""></td>`;
          if (col.truncate && value.length > 80) return `<td>${escapeHtml(value.slice(0, 80))}…</td>`;
          return `<td>${escapeHtml(value)}</td>`;
        })
        .join('');

      const actions =
        '<td class="admin-row-actions">' +
        `<button class="admin-icon-btn" data-action="edit" data-id="${escapeAttr(item.id)}">Düzenle</button>` +
        `<button class="admin-icon-btn admin-icon-btn-danger" data-action="delete" data-id="${escapeAttr(item.id)}">Sil</button>` +
        '</td>';

      return `<tr>${orderCell}${cells}${actions}</tr>`;
    })
    .join('');

  content.innerHTML =
    `${countHtml}<table class="admin-table"><thead><tr><th class="admin-order-col"></th>${head}<th></th></tr></thead>` +
    `<tbody>${rows}</tbody></table>`;

  bindRowAction(content, 'move-up', (id) => {
    window.AkerStore.move(section, id, -1);
    renderSection();
  });
  bindRowAction(content, 'move-down', (id) => {
    window.AkerStore.move(section, id, 1);
    renderSection();
  });
  bindRowAction(content, 'edit', (id) => openModal(id));
  bindRowAction(content, 'delete', (id) => {
    if (confirm('Bu kaydı silmek istediğinize emin misiniz?')) {
      window.AkerStore.remove(section, id);
      renderSection();
    }
  });
}

function bindRowAction(root: HTMLElement, action: string, handler: (id: string) => void): void {
  for (const btn of qsa<HTMLButtonElement>(`[data-action="${action}"]`, root)) {
    btn.addEventListener('click', () => {
      const id = btn.dataset['id'];
      if (id) handler(id);
    });
  }
}

// ---------------------------------------------------------
// Başvurular
// ---------------------------------------------------------
function renderApplications(content: HTMLElement): void {
  const apps = window.AkerApplications.getAll();
  const countHtml = `<div class="admin-record-count">Toplam Kayıt Sayısı : ${apps.length}</div>`;

  if (apps.length === 0) {
    content.innerHTML = `${countHtml}<div class="admin-empty">Henüz başvuru yok.</div>`;
    return;
  }

  const rows = apps
    .map((app) => {
      const cvCell = app.cvFileData
        ? `<a href="javascript:void(0)" class="admin-cv-link" data-action="open-cv" data-id="${escapeAttr(app.id)}">${escapeHtml(app.cvFileName || 'Özgeçmiş')}</a>`
        : escapeHtml(app.cvFileName || '-');

      return (
        '<tr>' +
        `<td>${formatDate(app.date)}</td>` +
        `<td>${escapeHtml(app.name)}</td>` +
        `<td>${escapeHtml(app.phone)}</td>` +
        `<td>${escapeHtml(app.email)}</td>` +
        `<td>${escapeHtml(app.careerTitle || '-')}</td>` +
        `<td>${cvCell}</td>` +
        '<td class="admin-row-actions">' +
        `<button class="admin-icon-btn" data-action="view" data-id="${escapeAttr(app.id)}">Detay</button>` +
        `<button class="admin-icon-btn admin-icon-btn-danger" data-action="delete-app" data-id="${escapeAttr(app.id)}">Sil</button>` +
        '</td></tr>'
      );
    })
    .join('');

  content.innerHTML =
    `${countHtml}<table class="admin-table"><thead><tr>` +
    '<th>Tarih</th><th>Ad Soyad</th><th>Telefon</th><th>E-Posta</th><th>İlan</th><th>Özgeçmiş</th><th></th>' +
    `</tr></thead><tbody>${rows}</tbody></table>`;

  const find = (id: string): Application | undefined => apps.find((a) => a.id === id);

  bindRowAction(content, 'view', (id) => {
    const app = find(id);
    if (app) showApplicationDetail(app);
  });
  bindRowAction(content, 'open-cv', (id) => {
    const app = find(id);
    if (app) openCvInNewTab(app);
  });
  bindRowAction(content, 'delete-app', (id) => {
    if (confirm('Bu başvuruyu silmek istediğinize emin misiniz?')) {
      window.AkerApplications.remove(id);
      renderSection();
    }
  });
}

/** data: URL'yi Blob'a çevirir. */
function dataUrlToBlob(dataUrl: string, fallbackType?: string): Blob {
  const parts = dataUrl.split(',');
  const meta = parts[0]?.match(/data:(.*);base64/);
  const mime = meta?.[1] || fallbackType || 'application/octet-stream';
  const binary = atob(parts[1] ?? '');
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

// Büyük PDF'lerde data: URL'lerin yeni sekmede açılması bazı tarayıcılarda
// engellendiği için blob URL'ye çevrilir.
function openCvInNewTab(app: Application): void {
  if (!app.cvFileData) return;
  try {
    const url = URL.createObjectURL(dataUrlToBlob(app.cvFileData, app.cvFileType));
    window.open(url, '_blank');
  } catch {
    window.open(app.cvFileData, '_blank');
  }
}

function getFileExtension(fileName: string): string {
  return /\.([a-z0-9]+)$/i.exec(fileName)?.[1]?.toLowerCase() ?? '';
}

function initAppDetailModal(): void {
  byId('app-detail-close')?.addEventListener('click', () => {
    const modal = byId('app-detail-modal');
    if (modal) modal.style.display = 'none';
  });
}

function showApplicationDetail(app: Application): void {
  const body = byId('app-detail-body');
  const modal = byId('app-detail-modal');
  if (!body || !modal) return;

  body.innerHTML =
    `<div class="admin-detail-row"><strong>Tarih:</strong> ${formatDate(app.date)}</div>` +
    `<div class="admin-detail-row"><strong>Ad Soyad:</strong> ${escapeHtml(app.name)}</div>` +
    `<div class="admin-detail-row"><strong>Telefon:</strong> ${escapeHtml(app.phone)}</div>` +
    `<div class="admin-detail-row"><strong>E-Posta:</strong> ${escapeHtml(app.email)}</div>` +
    `<div class="admin-detail-row"><strong>İlan:</strong> ${escapeHtml(app.careerTitle || '-')}</div>` +
    `<div class="admin-detail-row"><strong>Özgeçmiş:</strong> ${escapeHtml(app.cvFileName || '-')}</div>` +
    `<div class="admin-detail-row"><strong>Mesaj:</strong><br>${escapeHtml(app.message)}</div>` +
    renderCvPreview(app);

  modal.style.display = 'flex';

  for (const el of qsa('[data-action="open-cv"]', body)) {
    el.addEventListener('click', () => openCvInNewTab(app));
  }

  renderCvPreviewAsync(app);
}

function renderCvPreview(app: Application): string {
  if (!app.cvFileData) return '';
  return (
    '<div class="admin-detail-row admin-cv-preview-row">' +
    '<strong>Özgeçmiş Önizleme:</strong>' +
    '<button class="admin-icon-btn" data-action="open-cv">Yeni Sekmede Aç</button>' +
    '<div id="admin-cv-preview-target" class="admin-cv-preview-loading">Önizleme yükleniyor...</div>' +
    '</div>'
  );
}

const PREVIEW_FAILED =
  '<div class="admin-cv-preview-empty">Bu dosya önizlenemedi. Görüntülemek için yeni sekmede açın.</div>';

// Özgeçmiş önizlemesini dosya türüne göre doldurur. Resim ve PDF tarayıcıda
// doğrudan, DOCX docx-preview ile, XLSX/XLS/CSV SheetJS ile gösterilir.
function renderCvPreviewAsync(app: Application): void {
  const target = byId('admin-cv-preview-target');
  if (!target || !app.cvFileData) return;

  const type = app.cvFileType;
  const ext = getFileExtension(app.cvFileName);
  target.classList.remove('admin-cv-preview-loading');

  if (type.startsWith('image/')) {
    target.innerHTML = `<img src="${escapeAttr(app.cvFileData)}" class="admin-cv-preview-img" data-action="open-cv" alt="Özgeçmiş önizleme (yeni sekmede açmak için tıklayın)">`;
    qs('[data-action="open-cv"]', target)?.addEventListener('click', () => openCvInNewTab(app));
    return;
  }

  if (type === 'application/pdf' || ext === 'pdf') {
    target.innerHTML = `<iframe src="${escapeAttr(app.cvFileData)}" class="admin-cv-preview-frame" title="Özgeçmiş önizleme"></iframe>`;
    return;
  }

  if (ext === 'docx' && window.docx) {
    const container = document.createElement('div');
    container.className = 'admin-cv-preview-docx';
    target.innerHTML = '';
    target.appendChild(container);
    window.docx
      .renderAsync(dataUrlToBlob(app.cvFileData, app.cvFileType), container)
      .catch(() => {
        target.innerHTML = PREVIEW_FAILED;
      });
    return;
  }

  if ((ext === 'xlsx' || ext === 'xls' || ext === 'csv') && window.XLSX) {
    const xlsx = window.XLSX;
    try {
      const reader = new FileReader();
      reader.onload = () => {
        const workbook = xlsx.read(new Uint8Array(reader.result as ArrayBuffer), { type: 'array' });
        const firstName = workbook.SheetNames[0];
        const sheet = firstName ? workbook.Sheets[firstName] : undefined;
        target.innerHTML = sheet
          ? `<div class="admin-cv-preview-table">${xlsx.utils.sheet_to_html(sheet, { editable: false })}</div>`
          : PREVIEW_FAILED;
      };
      reader.onerror = () => {
        target.innerHTML = PREVIEW_FAILED;
      };
      reader.readAsArrayBuffer(dataUrlToBlob(app.cvFileData, app.cvFileType));
    } catch {
      target.innerHTML = PREVIEW_FAILED;
    }
    return;
  }

  if (type.startsWith('text/') || ext === 'txt') {
    try {
      const binary = atob(app.cvFileData.split(',')[1] ?? '');
      const text = new TextDecoder().decode(Uint8Array.from(binary, (c) => c.charCodeAt(0)));
      target.innerHTML = `<pre class="admin-cv-preview-text">${escapeHtml(text)}</pre>`;
    } catch {
      target.innerHTML = PREVIEW_FAILED;
    }
    return;
  }

  target.innerHTML =
    '<div class="admin-cv-preview-empty">Bu dosya türü için önizleme yok. Görüntülemek için yeni sekmede açın.</div>';
}

// ---------------------------------------------------------
// Ekle / Düzenle modalı
// ---------------------------------------------------------
function initModal(): void {
  byId('add-btn')?.addEventListener('click', () => openModal(null));
  byId('modal-cancel')?.addEventListener('click', closeModal);
  byId('modal-save')?.addEventListener('click', (event) => {
    event.preventDefault();
    void saveModal();
  });
}

function openModal(id: string | null): void {
  if (state.section === 'applications') return;

  state.editingId = id;
  const config = COLLECTIONS[state.section];
  const item = id ? window.AkerStore.getById(state.section, id) : null;

  const titleEl = byId('modal-title');
  const form = byId('admin-form');
  const modal = byId('admin-modal');
  if (!titleEl || !form || !modal) return;

  titleEl.textContent = id ? 'Düzenle' : 'Yeni Ekle';

  form.innerHTML = config.fields
    .map((field) => {
      const value = fieldValue(item, field.key);

      if (field.type === 'textarea') {
        return `<div class="admin-field"><label for="alan-${field.key}">${escapeHtml(field.label)}</label><textarea id="alan-${field.key}" name="${field.key}">${escapeHtml(value)}</textarea></div>`;
      }

      if (field.type === 'image') {
        const preview = value
          ? `<img class="admin-image-preview" src="${escapeAttr(value)}" alt="">`
          : '<div class="admin-image-preview admin-image-preview-empty">Görsel yok</div>';
        return `<div class="admin-field"><label for="alan-${field.key}">${escapeHtml(field.label)}</label>${preview}<input type="file" id="alan-${field.key}" accept="image/*" name="${field.key}"></div>`;
      }

      return `<div class="admin-field"><label for="alan-${field.key}">${escapeHtml(field.label)}</label><input type="text" id="alan-${field.key}" name="${field.key}" value="${escapeAttr(value)}"></div>`;
    })
    .join('');

  for (const input of qsa<HTMLInputElement>('input[type="file"]', form)) {
    input.addEventListener('change', () => {
      const file = input.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = () => {
        const preview = input.parentElement?.querySelector('.admin-image-preview');
        if (preview instanceof HTMLImageElement) {
          preview.src = String(reader.result ?? '');
        } else if (preview) {
          const img = document.createElement('img');
          img.className = 'admin-image-preview';
          img.alt = '';
          img.src = String(reader.result ?? '');
          preview.replaceWith(img);
        }
      };
      reader.readAsDataURL(file);
    });
  }

  modal.style.display = 'flex';
}

function closeModal(): void {
  const modal = byId('admin-modal');
  if (modal) modal.style.display = 'none';
}

async function saveModal(): Promise<void> {
  if (state.section === 'applications') return;

  const section = state.section;
  const config = COLLECTIONS[section];
  const form = byId('admin-form');
  if (!form) return;

  const existing = state.editingId ? window.AkerStore.getById(section, state.editingId) : null;
  const changes: Record<string, string> = {};

  for (const field of config.fields) {
    const input = qs<HTMLInputElement | HTMLTextAreaElement>(`[name="${field.key}"]`, form);
    if (!input) continue;

    if (field.type === 'image') {
      const file = input instanceof HTMLInputElement ? input.files?.[0] : undefined;
      changes[field.key] = file ? await compressImage(file) : fieldValue(existing, field.key);
    } else {
      changes[field.key] = input.value;
    }
  }

  if (state.editingId) {
    window.AkerStore.update(section, state.editingId, changes as never);
  } else {
    window.AkerStore.add(section, changes as never);
  }

  closeModal();
  renderSection();
}

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(new Error('Dosya okunamadı'));
    reader.readAsDataURL(file);
  });
}

// Görselleri localStorage kotasını aşmamak için yeniden boyutlandırıp sıkıştırır
// (büyük telefon fotoğrafları MB'lardan KB'lara düşer).
const MAX_IMAGE_DIMENSION = 1200;
const JPEG_QUALITY = 0.82;
const MAX_OUTPUT_BYTES = 700 * 1024;

async function compressImage(file: File): Promise<string> {
  const dataUrl = await readFileAsDataURL(file);

  return new Promise((resolve) => {
    const img = new Image();

    img.onload = () => {
      const { naturalWidth: width, naturalHeight: height } = img;
      const scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(width, height));
      const isLossless = file.type === 'image/png' || file.type === 'image/gif';

      if (scale === 1 && file.size <= MAX_OUTPUT_BYTES) {
        resolve(dataUrl);
        return;
      }

      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(width * scale));
      canvas.height = Math.max(1, Math.round(height * scale));

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(dataUrl);
        return;
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      if (isLossless) {
        resolve(canvas.toDataURL('image/png'));
        return;
      }

      let quality = JPEG_QUALITY;
      let result = canvas.toDataURL('image/jpeg', quality);
      while (result.length > MAX_OUTPUT_BYTES && quality > 0.4) {
        quality -= 0.1;
        result = canvas.toDataURL('image/jpeg', quality);
      }
      resolve(result);
    };

    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

// ---------------------------------------------------------
// Sıfırlama
// ---------------------------------------------------------
function initReset(): void {
  byId('reset-btn')?.addEventListener('click', () => {
    if (confirm('Tüm içerikler varsayılan haline döndürülecek. Onaylıyor musunuz?')) {
      window.AkerStore.reset();
      renderSection();
    }
  });
}

// ---------------------------------------------------------
// Yardımcı
// ---------------------------------------------------------
function formatDate(isoString: string): string {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
