// Bu dosya src/ altındaki TypeScript kaynaklarından üretilir. Elle düzenlemeyin.
"use strict";
(() => {
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
  var ADMIN_USER = "admin";
  var ADMIN_PASS = "aker2024";
  var SESSION_KEY = "aker_admin_session";
  var COLLECTIONS = {
    clients: {
      label: "Referanslar",
      fields: [
        { key: "image", label: "Logo", type: "image" },
        { key: "alt", label: "Firma adı (görsel alt metni)", type: "text" }
      ],
      columns: [{ key: "image", label: "", type: "image" }]
    },
    slides: {
      label: "Ana Sayfa Slider",
      fields: [{ key: "image", label: "Görsel", type: "image" }],
      columns: [{ key: "image", label: "", type: "image" }]
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
    editingId: null
  };
  function isCollection(value) {
    return value in COLLECTIONS;
  }
  function fieldValue(item, key) {
    if (!item) return "";
    const value = item[key];
    return typeof value === "string" ? value : "";
  }
  document.addEventListener("DOMContentLoaded", () => {
    initLogin();
    initNav();
    initModal();
    initAppDetailModal();
    initReset();
    if (sessionStorage.getItem(SESSION_KEY) === "1") {
      showDashboard();
      renderSection();
    }
  });
  function initLogin() {
    const loginBtn = byId("login-btn");
    const userInput = byId("login-username");
    const passInput = byId("login-password");
    const errorBox = byId("login-error");
    const logoutBtn = byId("logout-btn");
    if (!loginBtn || !userInput || !passInput || !errorBox) return;
    function attempt() {
      if (userInput.value === ADMIN_USER && passInput.value === ADMIN_PASS) {
        sessionStorage.setItem(SESSION_KEY, "1");
        errorBox.textContent = "";
        showDashboard();
        renderSection();
      } else {
        errorBox.textContent = "Kullanıcı adı veya şifre hatalı.";
      }
    }
    loginBtn.addEventListener("click", attempt);
    for (const input of [userInput, passInput]) {
      input.addEventListener("keydown", (event) => {
        if (event.key === "Enter") attempt();
      });
    }
    logoutBtn == null ? void 0 : logoutBtn.addEventListener("click", () => {
      sessionStorage.removeItem(SESSION_KEY);
      location.reload();
    });
  }
  function showDashboard() {
    const login = byId("login-screen");
    const dashboard = byId("admin-dashboard");
    if (login) login.style.display = "none";
    if (dashboard) dashboard.style.display = "flex";
  }
  function initNav() {
    const buttons = qsa(".admin-nav-btn");
    for (const btn of buttons) {
      btn.addEventListener("click", () => {
        var _a;
        for (const other of buttons) other.classList.remove("active");
        btn.classList.add("active");
        const section = (_a = btn.dataset["section"]) != null ? _a : "";
        state.section = section === "applications" || isCollection(section) ? section : "slides";
        renderSection();
      });
    }
  }
  function renderSection() {
    if (sessionStorage.getItem(SESSION_KEY) !== "1") return;
    const titleEl = byId("admin-section-title");
    const addBtn = byId("add-btn");
    const content = byId("admin-content");
    if (!titleEl || !addBtn || !content) return;
    if (state.section === "applications") {
      titleEl.textContent = "Başvurular";
      addBtn.style.display = "none";
      renderApplications(content);
      return;
    }
    const config = COLLECTIONS[state.section];
    titleEl.textContent = config.label;
    addBtn.style.display = "inline-flex";
    renderTable(content, config, state.section);
  }
  function renderTable(content, config, section) {
    const items = window.AkerStore.getAll(section);
    const countHtml = `<div class="admin-record-count">Toplam Kayıt Sayısı : ${items.length}</div>`;
    if (items.length === 0) {
      content.innerHTML = `${countHtml}<div class="admin-empty">Henüz içerik eklenmedi.</div>`;
      return;
    }
    const head = config.columns.map((col) => `<th>${escapeHtml(col.label)}</th>`).join("");
    const rows = items.map((item, index) => {
      const orderCell = `<td class="admin-row-order"><button class="admin-order-btn" data-action="move-up" data-id="${escapeAttr(item.id)}"${index === 0 ? " disabled" : ""} aria-label="Yukarı taşı">${ORDER_UP_SVG}</button><button class="admin-order-btn" data-action="move-down" data-id="${escapeAttr(item.id)}"${index === items.length - 1 ? " disabled" : ""} aria-label="Aşağı taşı">${ORDER_DOWN_SVG}</button></td>`;
      const cells = config.columns.map((col) => {
        const value = fieldValue(item, col.key);
        if (col.type === "image") return `<td><img class="admin-thumb" src="${escapeAttr(value)}" alt=""></td>`;
        if (col.truncate && value.length > 80) return `<td>${escapeHtml(value.slice(0, 80))}…</td>`;
        return `<td>${escapeHtml(value)}</td>`;
      }).join("");
      const actions = `<td class="admin-row-actions"><button class="admin-icon-btn" data-action="edit" data-id="${escapeAttr(item.id)}">Düzenle</button><button class="admin-icon-btn admin-icon-btn-danger" data-action="delete" data-id="${escapeAttr(item.id)}">Sil</button></td>`;
      return `<tr>${orderCell}${cells}${actions}</tr>`;
    }).join("");
    content.innerHTML = `${countHtml}<table class="admin-table"><thead><tr><th class="admin-order-col"></th>${head}<th></th></tr></thead><tbody>${rows}</tbody></table>`;
    bindRowAction(content, "move-up", (id) => {
      window.AkerStore.move(section, id, -1);
      renderSection();
    });
    bindRowAction(content, "move-down", (id) => {
      window.AkerStore.move(section, id, 1);
      renderSection();
    });
    bindRowAction(content, "edit", (id) => openModal(id));
    bindRowAction(content, "delete", (id) => {
      if (confirm("Bu kaydı silmek istediğinize emin misiniz?")) {
        window.AkerStore.remove(section, id);
        renderSection();
      }
    });
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
    const apps = window.AkerApplications.getAll();
    const countHtml = `<div class="admin-record-count">Toplam Kayıt Sayısı : ${apps.length}</div>`;
    if (apps.length === 0) {
      content.innerHTML = `${countHtml}<div class="admin-empty">Henüz başvuru yok.</div>`;
      return;
    }
    const rows = apps.map((app) => {
      const cvCell = app.cvFileData ? `<a href="javascript:void(0)" class="admin-cv-link" data-action="open-cv" data-id="${escapeAttr(app.id)}">${escapeHtml(app.cvFileName || "Özgeçmiş")}</a>` : escapeHtml(app.cvFileName || "-");
      return `<tr><td>${formatDate(app.date)}</td><td>${escapeHtml(app.name)}</td><td>${escapeHtml(app.phone)}</td><td>${escapeHtml(app.email)}</td><td>${escapeHtml(app.careerTitle || "-")}</td><td>${cvCell}</td><td class="admin-row-actions"><button class="admin-icon-btn" data-action="view" data-id="${escapeAttr(app.id)}">Detay</button><button class="admin-icon-btn admin-icon-btn-danger" data-action="delete-app" data-id="${escapeAttr(app.id)}">Sil</button></td></tr>`;
    }).join("");
    content.innerHTML = `${countHtml}<table class="admin-table"><thead><tr><th>Tarih</th><th>Ad Soyad</th><th>Telefon</th><th>E-Posta</th><th>İlan</th><th>Özgeçmiş</th><th></th></tr></thead><tbody>${rows}</tbody></table>`;
    const find = (id) => apps.find((a) => a.id === id);
    bindRowAction(content, "view", (id) => {
      const app = find(id);
      if (app) showApplicationDetail(app);
    });
    bindRowAction(content, "open-cv", (id) => {
      const app = find(id);
      if (app) openCvInNewTab(app);
    });
    bindRowAction(content, "delete-app", (id) => {
      if (confirm("Bu başvuruyu silmek istediğinize emin misiniz?")) {
        window.AkerApplications.remove(id);
        renderSection();
      }
    });
  }
  function dataUrlToBlob(dataUrl, fallbackType) {
    var _a, _b;
    const parts = dataUrl.split(",");
    const meta = (_a = parts[0]) == null ? void 0 : _a.match(/data:(.*);base64/);
    const mime = (meta == null ? void 0 : meta[1]) || fallbackType || "application/octet-stream";
    const binary = atob((_b = parts[1]) != null ? _b : "");
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
    return new Blob([bytes], { type: mime });
  }
  function openCvInNewTab(app) {
    if (!app.cvFileData) return;
    try {
      const url = URL.createObjectURL(dataUrlToBlob(app.cvFileData, app.cvFileType));
      window.open(url, "_blank");
    } catch {
      window.open(app.cvFileData, "_blank");
    }
  }
  function getFileExtension(fileName) {
    var _a, _b, _c;
    return (_c = (_b = (_a = /\.([a-z0-9]+)$/i.exec(fileName)) == null ? void 0 : _a[1]) == null ? void 0 : _b.toLowerCase()) != null ? _c : "";
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
    body.innerHTML = `<div class="admin-detail-row"><strong>Tarih:</strong> ${formatDate(app.date)}</div><div class="admin-detail-row"><strong>Ad Soyad:</strong> ${escapeHtml(app.name)}</div><div class="admin-detail-row"><strong>Telefon:</strong> ${escapeHtml(app.phone)}</div><div class="admin-detail-row"><strong>E-Posta:</strong> ${escapeHtml(app.email)}</div><div class="admin-detail-row"><strong>İlan:</strong> ${escapeHtml(app.careerTitle || "-")}</div><div class="admin-detail-row"><strong>Özgeçmiş:</strong> ${escapeHtml(app.cvFileName || "-")}</div><div class="admin-detail-row"><strong>Mesaj:</strong><br>${escapeHtml(app.message)}</div>` + renderCvPreview(app);
    modal.style.display = "flex";
    for (const el of qsa('[data-action="open-cv"]', body)) {
      el.addEventListener("click", () => openCvInNewTab(app));
    }
    renderCvPreviewAsync(app);
  }
  function renderCvPreview(app) {
    if (!app.cvFileData) return "";
    return '<div class="admin-detail-row admin-cv-preview-row"><strong>Özgeçmiş Önizleme:</strong><button class="admin-icon-btn" data-action="open-cv">Yeni Sekmede Aç</button><div id="admin-cv-preview-target" class="admin-cv-preview-loading">Önizleme yükleniyor...</div></div>';
  }
  var PREVIEW_FAILED = '<div class="admin-cv-preview-empty">Bu dosya önizlenemedi. Görüntülemek için yeni sekmede açın.</div>';
  function renderCvPreviewAsync(app) {
    var _a, _b;
    const target = byId("admin-cv-preview-target");
    if (!target || !app.cvFileData) return;
    const type = app.cvFileType;
    const ext = getFileExtension(app.cvFileName);
    target.classList.remove("admin-cv-preview-loading");
    if (type.startsWith("image/")) {
      target.innerHTML = `<img src="${escapeAttr(app.cvFileData)}" class="admin-cv-preview-img" data-action="open-cv" alt="Özgeçmiş önizleme (yeni sekmede açmak için tıklayın)">`;
      (_a = qs('[data-action="open-cv"]', target)) == null ? void 0 : _a.addEventListener("click", () => openCvInNewTab(app));
      return;
    }
    if (type === "application/pdf" || ext === "pdf") {
      target.innerHTML = `<iframe src="${escapeAttr(app.cvFileData)}" class="admin-cv-preview-frame" title="Özgeçmiş önizleme"></iframe>`;
      return;
    }
    if (ext === "docx" && window.docx) {
      const container = document.createElement("div");
      container.className = "admin-cv-preview-docx";
      target.innerHTML = "";
      target.appendChild(container);
      window.docx.renderAsync(dataUrlToBlob(app.cvFileData, app.cvFileType), container).catch(() => {
        target.innerHTML = PREVIEW_FAILED;
      });
      return;
    }
    if ((ext === "xlsx" || ext === "xls" || ext === "csv") && window.XLSX) {
      const xlsx = window.XLSX;
      try {
        const reader = new FileReader();
        reader.onload = () => {
          const workbook = xlsx.read(new Uint8Array(reader.result), { type: "array" });
          const firstName = workbook.SheetNames[0];
          const sheet = firstName ? workbook.Sheets[firstName] : void 0;
          target.innerHTML = sheet ? `<div class="admin-cv-preview-table">${xlsx.utils.sheet_to_html(sheet, { editable: false })}</div>` : PREVIEW_FAILED;
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
    if (type.startsWith("text/") || ext === "txt") {
      try {
        const binary = atob((_b = app.cvFileData.split(",")[1]) != null ? _b : "");
        const text = new TextDecoder().decode(Uint8Array.from(binary, (c) => c.charCodeAt(0)));
        target.innerHTML = `<pre class="admin-cv-preview-text">${escapeHtml(text)}</pre>`;
      } catch {
        target.innerHTML = PREVIEW_FAILED;
      }
      return;
    }
    target.innerHTML = '<div class="admin-cv-preview-empty">Bu dosya türü için önizleme yok. Görüntülemek için yeni sekmede açın.</div>';
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
  function openModal(id) {
    if (state.section === "applications") return;
    state.editingId = id;
    const config = COLLECTIONS[state.section];
    const item = id ? window.AkerStore.getById(state.section, id) : null;
    const titleEl = byId("modal-title");
    const form = byId("admin-form");
    const modal = byId("admin-modal");
    if (!titleEl || !form || !modal) return;
    titleEl.textContent = id ? "Düzenle" : "Yeni Ekle";
    form.innerHTML = config.fields.map((field) => {
      const value = fieldValue(item, field.key);
      if (field.type === "textarea") {
        return `<div class="admin-field"><label for="alan-${field.key}">${escapeHtml(field.label)}</label><textarea id="alan-${field.key}" name="${field.key}">${escapeHtml(value)}</textarea></div>`;
      }
      if (field.type === "image") {
        const preview = value ? `<img class="admin-image-preview" src="${escapeAttr(value)}" alt="">` : '<div class="admin-image-preview admin-image-preview-empty">Görsel yok</div>';
        return `<div class="admin-field"><label for="alan-${field.key}">${escapeHtml(field.label)}</label>${preview}<input type="file" id="alan-${field.key}" accept="image/*" name="${field.key}"></div>`;
      }
      return `<div class="admin-field"><label for="alan-${field.key}">${escapeHtml(field.label)}</label><input type="text" id="alan-${field.key}" name="${field.key}" value="${escapeAttr(value)}"></div>`;
    }).join("");
    for (const input of qsa('input[type="file"]', form)) {
      input.addEventListener("change", () => {
        var _a;
        const file = (_a = input.files) == null ? void 0 : _a[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
          var _a2, _b, _c;
          const preview = (_a2 = input.parentElement) == null ? void 0 : _a2.querySelector(".admin-image-preview");
          if (preview instanceof HTMLImageElement) {
            preview.src = String((_b = reader.result) != null ? _b : "");
          } else if (preview) {
            const img = document.createElement("img");
            img.className = "admin-image-preview";
            img.alt = "";
            img.src = String((_c = reader.result) != null ? _c : "");
            preview.replaceWith(img);
          }
        };
        reader.readAsDataURL(file);
      });
    }
    modal.style.display = "flex";
  }
  function closeModal() {
    const modal = byId("admin-modal");
    if (modal) modal.style.display = "none";
  }
  async function saveModal() {
    var _a;
    if (state.section === "applications") return;
    const section = state.section;
    const config = COLLECTIONS[section];
    const form = byId("admin-form");
    if (!form) return;
    const existing = state.editingId ? window.AkerStore.getById(section, state.editingId) : null;
    const changes = {};
    for (const field of config.fields) {
      const input = qs(`[name="${field.key}"]`, form);
      if (!input) continue;
      if (field.type === "image") {
        const file = input instanceof HTMLInputElement ? (_a = input.files) == null ? void 0 : _a[0] : void 0;
        changes[field.key] = file ? await compressImage(file) : fieldValue(existing, field.key);
      } else {
        changes[field.key] = input.value;
      }
    }
    if (state.editingId) {
      window.AkerStore.update(section, state.editingId, changes);
    } else {
      window.AkerStore.add(section, changes);
    }
    closeModal();
    renderSection();
  }
  function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        var _a;
        return resolve(String((_a = reader.result) != null ? _a : ""));
      };
      reader.onerror = () => reject(new Error("Dosya okunamadı"));
      reader.readAsDataURL(file);
    });
  }
  var MAX_IMAGE_DIMENSION = 1200;
  var JPEG_QUALITY = 0.82;
  var MAX_OUTPUT_BYTES = 700 * 1024;
  async function compressImage(file) {
    const dataUrl = await readFileAsDataURL(file);
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const { naturalWidth: width, naturalHeight: height } = img;
        const scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(width, height));
        const isLossless = file.type === "image/png" || file.type === "image/gif";
        if (scale === 1 && file.size <= MAX_OUTPUT_BYTES) {
          resolve(dataUrl);
          return;
        }
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(width * scale));
        canvas.height = Math.max(1, Math.round(height * scale));
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(dataUrl);
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        if (isLossless) {
          resolve(canvas.toDataURL("image/png"));
          return;
        }
        let quality = JPEG_QUALITY;
        let result = canvas.toDataURL("image/jpeg", quality);
        while (result.length > MAX_OUTPUT_BYTES && quality > 0.4) {
          quality -= 0.1;
          result = canvas.toDataURL("image/jpeg", quality);
        }
        resolve(result);
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    });
  }
  function initReset() {
    var _a;
    (_a = byId("reset-btn")) == null ? void 0 : _a.addEventListener("click", () => {
      if (confirm("Tüm içerikler varsayılan haline döndürülecek. Onaylıyor musunuz?")) {
        window.AkerStore.reset();
        renderSection();
      }
    });
  }
  function formatDate(isoString) {
    const date = new Date(isoString);
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
