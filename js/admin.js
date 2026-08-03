// Bu dosya src/ altındaki TypeScript kaynaklarından üretilir. Elle düzenlemeyin.
"use strict";
(() => {
  // src/api.ts
  var ApiError = class extends Error {
    constructor(message, status) {
      super(message);
      this.name = "ApiError";
      this.status = status;
    }
  };
  async function istek(yol, secenekler = {}) {
    var _a;
    const yanit = await fetch(yol, {
      credentials: "same-origin",
      ...secenekler
    });
    let govde = null;
    try {
      govde = await yanit.json();
    } catch {
      govde = null;
    }
    if (!yanit.ok) {
      const mesaj = (_a = govde == null ? void 0 : govde.error) != null ? _a : yanit.status === 401 ? "Oturum sona erdi." : "İstek başarısız oldu.";
      throw new ApiError(mesaj, yanit.status);
    }
    return govde;
  }
  function jsonIstek(yol, method, govde) {
    return istek(yol, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(govde)
    });
  }
  var api = {
    oturumVarMi: () => istek("/api/auth/session"),
    girisYap: (password) => jsonIstek("/api/auth/login", "POST", { password }),
    cikisYap: () => istek("/api/auth/session", { method: "DELETE" }),
    listele: (koleksiyon) => istek(`/api/admin/${koleksiyon}`),
    ekle: (koleksiyon, kayit) => jsonIstek(`/api/admin/${koleksiyon}`, "POST", kayit),
    guncelle: (koleksiyon, id, kayit) => jsonIstek(`/api/admin/${koleksiyon}/${encodeURIComponent(id)}`, "PUT", kayit),
    sil: (koleksiyon, id) => istek(`/api/admin/${koleksiyon}/${encodeURIComponent(id)}`, { method: "DELETE" }),
    sirala: (koleksiyon, sira) => jsonIstek(`/api/admin/${koleksiyon}/sira`, "POST", { sira }),
    gorselYukle: async (dosya) => {
      const form = new FormData();
      form.append("file", dosya);
      const sonuc = await istek("/api/admin/upload", {
        method: "POST",
        body: form
      });
      return sonuc.yol;
    }
  };

  // src/dom.ts
  function qs(selector, root = document) {
    return root.querySelector(selector);
  }
  function qsa(selector, root = document) {
    return Array.from(root.querySelectorAll(selector));
  }
  function byId(id) {
    return document.getElementById(id);
  }
  function escapeHtml(value) {
    return String(value != null ? value : "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  function escapeAttr(value) {
    return escapeHtml(value).replace(/"/g, "&quot;");
  }

  // src/admin.ts
  var COLLECTIONS = {
    slides: {
      label: "Ana Sayfa Slider",
      fields: [
        { key: "image", label: "Görsel", type: "image" },
        { key: "alt", label: "Görsel açıklaması (alt metni)", type: "text" }
      ],
      columns: [{ key: "image", label: "", type: "image" }]
    },
    clients: {
      label: "Referanslar",
      fields: [
        { key: "image", label: "Logo", type: "image" },
        { key: "alt", label: "Firma adı (görsel alt metni)", type: "text" }
      ],
      columns: [
        { key: "image", label: "", type: "image" },
        { key: "alt", label: "Firma" }
      ]
    },
    careers: {
      label: "Kariyer İlanları",
      fields: [
        { key: "title", label: "Başlık", type: "text" },
        { key: "text", label: "Açıklama", type: "textarea" },
        { key: "cardImage", label: "Kart Görseli", type: "image" },
        { key: "image", label: "Detay Görseli", type: "image" }
      ],
      columns: [
        { key: "cardImage", label: "", type: "image" },
        { key: "title", label: "Başlık" },
        { key: "text", label: "Açıklama", truncate: true }
      ]
    },
    documents: {
      label: "Belgelerimiz",
      fields: [
        { key: "title", label: "Başlık", type: "text" },
        { key: "image", label: "Görsel", type: "image" }
      ],
      columns: [
        { key: "image", label: "", type: "image" },
        { key: "title", label: "Başlık" }
      ]
    },
    news: {
      label: "Bizden Haberler",
      fields: [
        { key: "title", label: "Başlık", type: "text" },
        { key: "text", label: "Açıklama", type: "textarea" },
        { key: "image", label: "Görsel", type: "image" },
        { key: "link", label: "Haber Linki (URL)", type: "text" }
      ],
      columns: [
        { key: "image", label: "", type: "image" },
        { key: "title", label: "Başlık" },
        { key: "text", label: "Açıklama", truncate: true }
      ]
    },
    team: {
      label: "Ekibimiz",
      fields: [
        { key: "name", label: "Ad Soyad", type: "text" },
        { key: "role", label: "Unvan", type: "text" },
        { key: "photo", label: "Fotoğraf", type: "image" }
      ],
      columns: [
        { key: "photo", label: "", type: "image" },
        { key: "name", label: "Ad Soyad" },
        { key: "role", label: "Unvan" }
      ]
    }
  };
  var ORDER_UP_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 15 12 9 18 15"></polyline></svg>';
  var ORDER_DOWN_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>';
  var state = {
    section: "slides",
    editingId: null,
    kayitlar: [],
    basvurular: []
  };
  document.addEventListener("DOMContentLoaded", () => {
    void baslat();
  });
  async function baslat() {
    initLogin();
    initNav();
    initModal();
    initAppDetailModal();
    try {
      const { oturum } = await api.oturumVarMi();
      if (oturum) {
        showDashboard();
        await renderSection();
      }
    } catch {
    }
  }
  function initLogin() {
    var _a;
    const loginBtn = byId("login-btn");
    const userInput = byId("login-username");
    const passInput = byId("login-password");
    const errorBox = byId("login-error");
    if (!loginBtn || !passInput || !errorBox) return;
    const dene = async () => {
      errorBox.textContent = "";
      loginBtn.disabled = true;
      try {
        await api.girisYap(passInput.value);
        passInput.value = "";
        showDashboard();
        await renderSection();
      } catch (err) {
        errorBox.textContent = err instanceof ApiError ? err.message : "Giriş yapılamadı.";
      } finally {
        loginBtn.disabled = false;
      }
    };
    loginBtn.addEventListener("click", () => void dene());
    for (const input of [userInput, passInput]) {
      input == null ? void 0 : input.addEventListener("keydown", (event) => {
        if (event.key === "Enter") void dene();
      });
    }
    (_a = byId("logout-btn")) == null ? void 0 : _a.addEventListener("click", () => {
      void api.cikisYap().finally(() => location.reload());
    });
  }
  function showDashboard() {
    const login = byId("login-screen");
    const dashboard = byId("admin-dashboard");
    if (login) login.style.display = "none";
    if (dashboard) dashboard.style.display = "flex";
  }
  function showLogin(mesaj) {
    const login = byId("login-screen");
    const dashboard = byId("admin-dashboard");
    const errorBox = byId("login-error");
    if (login) login.style.display = "flex";
    if (dashboard) dashboard.style.display = "none";
    if (errorBox) errorBox.textContent = mesaj;
  }
  function hatayiIsle(err) {
    if (err instanceof ApiError && err.status === 401) {
      showLogin("Oturumunuz sona erdi, tekrar giriş yapın.");
      return;
    }
    const content = byId("admin-content");
    const mesaj = err instanceof Error ? err.message : "Beklenmeyen bir hata oluştu.";
    if (content) content.innerHTML = `<div class="admin-empty">${escapeHtml(mesaj)}</div>`;
  }
  function initNav() {
    const buttons = qsa(".admin-nav-btn");
    for (const btn of buttons) {
      btn.addEventListener("click", () => {
        var _a;
        for (const other of buttons) other.classList.remove("active");
        btn.classList.add("active");
        state.section = (_a = btn.dataset["section"]) != null ? _a : "slides";
        void renderSection();
      });
    }
  }
  async function renderSection() {
    const titleEl = byId("admin-section-title");
    const addBtn = byId("add-btn");
    const content = byId("admin-content");
    if (!titleEl || !addBtn || !content) return;
    content.innerHTML = '<div class="admin-empty">Yükleniyor…</div>';
    try {
      if (state.section === "applications") {
        titleEl.textContent = "Başvurular";
        addBtn.style.display = "none";
        const { kayitlar: kayitlar2 } = await api.listele("applications");
        state.basvurular = kayitlar2;
        renderApplications(content);
        return;
      }
      const config = COLLECTIONS[state.section];
      if (!config) return;
      titleEl.textContent = config.label;
      addBtn.style.display = "inline-flex";
      const { kayitlar } = await api.listele(state.section);
      state.kayitlar = kayitlar;
      renderTable(content, config);
    } catch (err) {
      hatayiIsle(err);
    }
  }
  function renderTable(content, config) {
    const items = state.kayitlar;
    const countHtml = `<div class="admin-record-count">Toplam Kayıt Sayısı : ${items.length}</div>`;
    if (items.length === 0) {
      content.innerHTML = `${countHtml}<div class="admin-empty">Henüz içerik eklenmedi.</div>`;
      return;
    }
    const head = config.columns.map((col) => `<th>${escapeHtml(col.label)}</th>`).join("");
    const rows = items.map((item, index) => {
      const orderCell = `<td class="admin-row-order"><button class="admin-order-btn" data-action="move-up" data-id="${escapeAttr(item.id)}"${index === 0 ? " disabled" : ""} aria-label="Yukarı taşı">${ORDER_UP_SVG}</button><button class="admin-order-btn" data-action="move-down" data-id="${escapeAttr(item.id)}"${index === items.length - 1 ? " disabled" : ""} aria-label="Aşağı taşı">${ORDER_DOWN_SVG}</button></td>`;
      const cells = config.columns.map((col) => {
        var _a;
        const value = (_a = item[col.key]) != null ? _a : "";
        if (col.type === "image") return `<td><img class="admin-thumb" src="${escapeAttr(value)}" alt=""></td>`;
        if (col.truncate && value.length > 80) return `<td>${escapeHtml(value.slice(0, 80))}…</td>`;
        return `<td>${escapeHtml(value)}</td>`;
      }).join("");
      const actions = `<td class="admin-row-actions"><button class="admin-icon-btn" data-action="edit" data-id="${escapeAttr(item.id)}">Düzenle</button><button class="admin-icon-btn admin-icon-btn-danger" data-action="delete" data-id="${escapeAttr(item.id)}">Sil</button></td>`;
      return `<tr>${orderCell}${cells}${actions}</tr>`;
    }).join("");
    content.innerHTML = `${countHtml}<table class="admin-table"><thead><tr><th class="admin-order-col"></th>${head}<th></th></tr></thead><tbody>${rows}</tbody></table>`;
    bindRowAction(content, "move-up", (id) => void tasi(id, -1));
    bindRowAction(content, "move-down", (id) => void tasi(id, 1));
    bindRowAction(content, "edit", (id) => openModal(id));
    bindRowAction(content, "delete", (id) => void silKayit(id));
  }
  async function tasi(id, yon) {
    const ids = state.kayitlar.map((k) => k.id);
    const index = ids.indexOf(id);
    const hedef = index + yon;
    if (index === -1 || hedef < 0 || hedef >= ids.length) return;
    [ids[index], ids[hedef]] = [ids[hedef], ids[index]];
    try {
      await api.sirala(state.section, ids);
      await renderSection();
    } catch (err) {
      hatayiIsle(err);
    }
  }
  async function silKayit(id) {
    if (!confirm("Bu kaydı silmek istediğinize emin misiniz?")) return;
    try {
      await api.sil(state.section, id);
      await renderSection();
    } catch (err) {
      hatayiIsle(err);
    }
  }
  function bindRowAction(root, action, handler) {
    for (const btn of qsa(`[data-action="${action}"]`, root)) {
      btn.addEventListener("click", () => {
        const id = btn.dataset["id"];
        if (id) handler(id);
      });
    }
  }
  function renderApplications(content) {
    const apps = state.basvurular;
    const countHtml = `<div class="admin-record-count">Toplam Kayıt Sayısı : ${apps.length}</div>`;
    if (apps.length === 0) {
      content.innerHTML = `${countHtml}<div class="admin-empty">Henüz başvuru yok.</div>`;
      return;
    }
    const rows = apps.map((app) => {
      const cvCell = app.cvKey ? `<a class="admin-cv-link" href="/api/admin/cv/${escapeAttr(app.cvKey)}" target="_blank" rel="noopener">${escapeHtml(app.cvFileName || "Özgeçmiş")}</a>` : escapeHtml(app.cvFileName || "-");
      return `<tr><td>${formatDate(app.olusturuldu)}</td><td>${escapeHtml(app.name)}</td><td>${escapeHtml(app.phone)}</td><td>${escapeHtml(app.email)}</td><td>${escapeHtml(app.careerTitle || "-")}</td><td>${cvCell}</td><td class="admin-row-actions"><button class="admin-icon-btn" data-action="view" data-id="${escapeAttr(app.id)}">Detay</button><button class="admin-icon-btn admin-icon-btn-danger" data-action="delete-app" data-id="${escapeAttr(app.id)}">Sil</button></td></tr>`;
    }).join("");
    content.innerHTML = `${countHtml}<table class="admin-table"><thead><tr><th>Tarih</th><th>Ad Soyad</th><th>Telefon</th><th>E-Posta</th><th>İlan</th><th>Özgeçmiş</th><th></th></tr></thead><tbody>${rows}</tbody></table>`;
    bindRowAction(content, "view", (id) => {
      const app = apps.find((a) => a.id === id);
      if (app) showApplicationDetail(app);
    });
    bindRowAction(content, "delete-app", (id) => {
      if (!confirm("Bu başvuruyu silmek istediğinize emin misiniz?")) return;
      api.sil("applications", id).then(() => renderSection()).catch(hatayiIsle);
    });
  }
  function initAppDetailModal() {
    var _a;
    (_a = byId("app-detail-close")) == null ? void 0 : _a.addEventListener("click", () => {
      const modal = byId("app-detail-modal");
      if (modal) modal.style.display = "none";
    });
  }
  function showApplicationDetail(app) {
    const body = byId("app-detail-body");
    const modal = byId("app-detail-modal");
    if (!body || !modal) return;
    const cvSatiri = app.cvKey ? `<div class="admin-detail-row admin-cv-preview-row">
         <strong>Özgeçmiş:</strong>
         <a class="admin-icon-btn" href="/api/admin/cv/${escapeAttr(app.cvKey)}" target="_blank" rel="noopener">Yeni Sekmede Aç</a>
         <iframe src="/api/admin/cv/${escapeAttr(app.cvKey)}" class="admin-cv-preview-frame" title="Özgeçmiş önizleme"></iframe>
       </div>` : '<div class="admin-detail-row"><strong>Özgeçmiş:</strong> yüklenmemiş</div>';
    body.innerHTML = `<div class="admin-detail-row"><strong>Tarih:</strong> ${formatDate(app.olusturuldu)}</div><div class="admin-detail-row"><strong>Ad Soyad:</strong> ${escapeHtml(app.name)}</div><div class="admin-detail-row"><strong>Telefon:</strong> ${escapeHtml(app.phone)}</div><div class="admin-detail-row"><strong>E-Posta:</strong> ${escapeHtml(app.email)}</div><div class="admin-detail-row"><strong>İlan:</strong> ${escapeHtml(app.careerTitle || "-")}</div><div class="admin-detail-row"><strong>Mesaj:</strong><br>${escapeHtml(app.message)}</div>` + cvSatiri;
    modal.style.display = "flex";
  }
  function initModal() {
    var _a, _b, _c;
    (_a = byId("add-btn")) == null ? void 0 : _a.addEventListener("click", () => openModal(null));
    (_b = byId("modal-cancel")) == null ? void 0 : _b.addEventListener("click", closeModal);
    (_c = byId("modal-save")) == null ? void 0 : _c.addEventListener("click", (event) => {
      event.preventDefault();
      void saveModal();
    });
  }
  var yuklenenYollar = /* @__PURE__ */ new Map();
  function openModal(id) {
    const config = COLLECTIONS[state.section];
    if (!config) return;
    state.editingId = id;
    yuklenenYollar.clear();
    const item = id ? state.kayitlar.find((k) => k.id === id) : void 0;
    const titleEl = byId("modal-title");
    const form = byId("admin-form");
    const modal = byId("admin-modal");
    if (!titleEl || !form || !modal) return;
    titleEl.textContent = id ? "Düzenle" : "Yeni Ekle";
    form.innerHTML = config.fields.map((field) => {
      var _a;
      const value = (_a = item == null ? void 0 : item[field.key]) != null ? _a : "";
      if (field.type === "textarea") {
        return `<div class="admin-field"><label for="alan-${field.key}">${escapeHtml(field.label)}</label><textarea id="alan-${field.key}" name="${field.key}">${escapeHtml(value)}</textarea></div>`;
      }
      if (field.type === "image") {
        const preview = value ? `<img class="admin-image-preview" src="${escapeAttr(value)}" alt="">` : '<div class="admin-image-preview admin-image-preview-empty">Görsel yok</div>';
        return `<div class="admin-field" data-image-field="${field.key}"><label for="alan-${field.key}">${escapeHtml(field.label)}</label>${preview}<input type="file" id="alan-${field.key}" accept="image/*" data-field="${field.key}"><input type="hidden" name="${field.key}" value="${escapeAttr(value)}"><div class="admin-field-durum"></div></div>`;
      }
      return `<div class="admin-field"><label for="alan-${field.key}">${escapeHtml(field.label)}</label><input type="text" id="alan-${field.key}" name="${field.key}" value="${escapeAttr(value)}"></div>`;
    }).join("");
    for (const input of qsa('input[type="file"]', form)) {
      input.addEventListener("change", () => void gorselSec(input));
    }
    modal.style.display = "flex";
  }
  async function gorselSec(input) {
    var _a, _b;
    const file = (_a = input.files) == null ? void 0 : _a[0];
    const alan = (_b = input.dataset["field"]) != null ? _b : "";
    const kapsayici = input.closest(".admin-field");
    const durum = kapsayici ? qs(".admin-field-durum", kapsayici) : null;
    if (!file || !kapsayici) return;
    if (durum) durum.textContent = "Yükleniyor…";
    try {
      const yol = await api.gorselYukle(file);
      yuklenenYollar.set(alan, yol);
      const gizli = qs(`input[type="hidden"][name="${alan}"]`, kapsayici);
      if (gizli) gizli.value = yol;
      const onizleme = kapsayici.querySelector(".admin-image-preview");
      if (onizleme instanceof HTMLImageElement) {
        onizleme.src = yol;
      } else if (onizleme) {
        const img = document.createElement("img");
        img.className = "admin-image-preview";
        img.alt = "";
        img.src = yol;
        onizleme.replaceWith(img);
      }
      if (durum) durum.textContent = "Yüklendi.";
    } catch (err) {
      if (durum) durum.textContent = err instanceof Error ? err.message : "Yüklenemedi.";
      input.value = "";
    }
  }
  function closeModal() {
    const modal = byId("admin-modal");
    if (modal) modal.style.display = "none";
  }
  async function saveModal() {
    var _a, _b;
    const config = COLLECTIONS[state.section];
    const form = byId("admin-form");
    const saveBtn = byId("modal-save");
    if (!config || !form) return;
    const kayit = {};
    for (const field of config.fields) {
      const input = qs(`[name="${field.key}"]`, form);
      kayit[field.key] = (_b = (_a = yuklenenYollar.get(field.key)) != null ? _a : input == null ? void 0 : input.value) != null ? _b : "";
    }
    if (saveBtn) saveBtn.disabled = true;
    try {
      if (state.editingId) await api.guncelle(state.section, state.editingId, kayit);
      else await api.ekle(state.section, kayit);
      closeModal();
      await renderSection();
    } catch (err) {
      if (err instanceof ApiError && err.status === 422) {
        alert(err.message);
      } else {
        hatayiIsle(err);
        closeModal();
      }
    } finally {
      if (saveBtn) saveBtn.disabled = false;
    }
  }
  function formatDate(isoString) {
    const normalize = isoString.includes("T") ? isoString : `${isoString.replace(" ", "T")}Z`;
    const date = new Date(normalize);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleString("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  }
})();
