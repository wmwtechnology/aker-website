// =========================================================
// AKER OSGB - Yönetim Paneli
// =========================================================

(function () {
  var ADMIN_USER = 'admin';
  var ADMIN_PASS = 'aker2024';
  var SESSION_KEY = 'aker_admin_session';

  var COLLECTIONS = {
    clients: {
      label: 'Referanslar',
      fields: [
        { key: 'image', label: 'Logo', type: 'image' }
      ],
      columns: [
        { key: 'image', label: '', type: 'image' }
      ]
    },
    slides: {
      label: 'Ana Sayfa Slider',
      fields: [
        { key: 'image', label: 'Görsel', type: 'image' }
      ],
      columns: [
        { key: 'image', label: '', type: 'image' }
      ]
    },
    careers: {
      label: 'Kariyer İlanları',
      fields: [
        { key: 'title', label: 'Başlık', type: 'text' },
        { key: 'text', label: 'Açıklama', type: 'textarea' },
        { key: 'cardImage', label: 'Kart Görseli', type: 'image' },
        { key: 'image', label: 'Detay Görseli', type: 'image' }
      ],
      columns: [
        { key: 'cardImage', label: '', type: 'image' },
        { key: 'title', label: 'Başlık' },
        { key: 'text', label: 'Açıklama', truncate: true }
      ]
    },
    documents: {
      label: 'Belgelerimiz',
      fields: [
        { key: 'title', label: 'Başlık', type: 'text' },
        { key: 'image', label: 'Görsel', type: 'image' }
      ],
      columns: [
        { key: 'image', label: '', type: 'image' },
        { key: 'title', label: 'Başlık' }
      ]
    },
    news: {
      label: 'Bizden Haberler',
      fields: [
        { key: 'title', label: 'Başlık', type: 'text' },
        { key: 'text', label: 'Açıklama', type: 'textarea' },
        { key: 'image', label: 'Görsel', type: 'image' }
      ],
      columns: [
        { key: 'image', label: '', type: 'image' },
        { key: 'title', label: 'Başlık' },
        { key: 'text', label: 'Açıklama', truncate: true }
      ]
    },
    team: {
      label: 'Ekibimiz',
      fields: [
        { key: 'name', label: 'Ad Soyad', type: 'text' },
        { key: 'role', label: 'Unvan', type: 'text' },
        { key: 'photo', label: 'Fotoğraf', type: 'image' }
      ],
      columns: [
        { key: 'photo', label: '', type: 'image' },
        { key: 'name', label: 'Ad Soyad' },
        { key: 'role', label: 'Unvan' }
      ]
    }
  };

  var SECTION_ORDER = ['careers', 'documents', 'news', 'team', 'applications'];

  var ORDER_UP_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 15 12 9 18 15"></polyline></svg>';
  var ORDER_DOWN_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>';

  var state = {
    section: 'slides',
    editingId: null
  };

  document.addEventListener('DOMContentLoaded', function () {
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

  // -------------------------------------------------------
  // Giriş / Çıkış
  // -------------------------------------------------------
  function initLogin() {
    var loginBtn = document.getElementById('login-btn');
    var userInput = document.getElementById('login-username');
    var passInput = document.getElementById('login-password');
    var errorBox = document.getElementById('login-error');

    function attempt() {
      if (userInput.value === ADMIN_USER && passInput.value === ADMIN_PASS) {
        sessionStorage.setItem(SESSION_KEY, '1');
        errorBox.textContent = '';
        showDashboard();
        renderSection();
      } else {
        errorBox.textContent = 'Kullanıcı adı veya şifre hatalı.';
      }
    }

    loginBtn.addEventListener('click', attempt);
    [userInput, passInput].forEach(function (input) {
      input.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') attempt();
      });
    });

    document.getElementById('logout-btn').addEventListener('click', function () {
      sessionStorage.removeItem(SESSION_KEY);
      location.reload();
    });
  }

  function showDashboard() {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('admin-dashboard').style.display = 'flex';
  }

  // -------------------------------------------------------
  // Navigasyon
  // -------------------------------------------------------
  function initNav() {
    var buttons = document.querySelectorAll('.admin-nav-btn');
    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        buttons.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        state.section = btn.dataset.section;
        renderSection();
      });
    });
  }

  // -------------------------------------------------------
  // Bölüm İçeriği
  // -------------------------------------------------------
  function renderSection() {
    if (sessionStorage.getItem(SESSION_KEY) !== '1') return;

    var titleEl = document.getElementById('admin-section-title');
    var addBtn = document.getElementById('add-btn');
    var content = document.getElementById('admin-content');

    if (state.section === 'applications') {
      titleEl.textContent = 'Başvurular';
      addBtn.style.display = 'none';
      renderApplications(content);
      return;
    }

    var config = COLLECTIONS[state.section];
    titleEl.textContent = config.label;
    addBtn.style.display = 'inline-flex';
    renderTable(content, config);
  }

  function renderTable(content, config) {
    var items = window.AkerStore.getAll(state.section);

    if (items.length === 0) {
      content.innerHTML = '<div class="admin-empty">Henüz içerik eklenmedi.</div>';
      return;
    }

    var html = '<table class="admin-table"><thead><tr><th class="admin-order-col"></th>';
    config.columns.forEach(function (col) {
      html += '<th>' + col.label + '</th>';
    });
    html += '<th></th></tr></thead><tbody>';

    items.forEach(function (item, index) {
      html += '<tr>';
      html += '<td class="admin-row-order">' +
        '<button class="admin-order-btn" data-action="move-up" data-id="' + item.id + '"' + (index === 0 ? ' disabled' : '') + ' aria-label="Yukarı taşı">' + ORDER_UP_SVG + '</button>' +
        '<button class="admin-order-btn" data-action="move-down" data-id="' + item.id + '"' + (index === items.length - 1 ? ' disabled' : '') + ' aria-label="Aşağı taşı">' + ORDER_DOWN_SVG + '</button>' +
        '</td>';
      config.columns.forEach(function (col) {
        var value = item[col.key] || '';
        if (col.type === 'image') {
          html += '<td><img class="admin-thumb" src="' + escapeAttr(value) + '" alt=""></td>';
        } else if (col.truncate && value.length > 80) {
          html += '<td>' + escapeHtml(value.slice(0, 80)) + '…</td>';
        } else {
          html += '<td>' + escapeHtml(value) + '</td>';
        }
      });
      html += '<td class="admin-row-actions">' +
        '<button class="admin-icon-btn" data-action="edit" data-id="' + item.id + '">Düzenle</button>' +
        '<button class="admin-icon-btn admin-icon-btn-danger" data-action="delete" data-id="' + item.id + '">Sil</button>' +
        '</td></tr>';
    });

    html += '</tbody></table>';
    content.innerHTML = html;

    content.querySelectorAll('[data-action="move-up"]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        window.AkerStore.move(state.section, btn.dataset.id, -1);
        renderSection();
      });
    });
    content.querySelectorAll('[data-action="move-down"]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        window.AkerStore.move(state.section, btn.dataset.id, 1);
        renderSection();
      });
    });
    content.querySelectorAll('[data-action="edit"]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        openModal(btn.dataset.id);
      });
    });
    content.querySelectorAll('[data-action="delete"]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (confirm('Bu kaydı silmek istediğinize emin misiniz?')) {
          window.AkerStore.remove(state.section, btn.dataset.id);
          renderSection();
        }
      });
    });
  }

  // -------------------------------------------------------
  // Başvurular
  // -------------------------------------------------------
  function renderApplications(content) {
    var apps = window.AkerApplications.getAll();

    if (apps.length === 0) {
      content.innerHTML = '<div class="admin-empty">Henüz başvuru yok.</div>';
      return;
    }

    var html = '<table class="admin-table"><thead><tr>' +
      '<th>Tarih</th><th>Ad Soyad</th><th>Telefon</th><th>E-Posta</th><th>İlan</th><th>Özgeçmiş</th><th></th>' +
      '</tr></thead><tbody>';

    apps.forEach(function (app) {
      html += '<tr>' +
        '<td>' + formatDate(app.date) + '</td>' +
        '<td>' + escapeHtml(app.name) + '</td>' +
        '<td>' + escapeHtml(app.phone) + '</td>' +
        '<td>' + escapeHtml(app.email) + '</td>' +
        '<td>' + escapeHtml(app.careerTitle || '-') + '</td>' +
        '<td>' + escapeHtml(app.cvFileName || '-') + '</td>' +
        '<td class="admin-row-actions">' +
          '<button class="admin-icon-btn" data-action="view" data-id="' + app.id + '">Detay</button>' +
          '<button class="admin-icon-btn admin-icon-btn-danger" data-action="delete-app" data-id="' + app.id + '">Sil</button>' +
        '</td></tr>';
    });

    html += '</tbody></table>';
    content.innerHTML = html;

    content.querySelectorAll('[data-action="view"]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var app = apps.filter(function (a) { return a.id === btn.dataset.id; })[0];
        if (app) showApplicationDetail(app);
      });
    });
    content.querySelectorAll('[data-action="delete-app"]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (confirm('Bu başvuruyu silmek istediğinize emin misiniz?')) {
          window.AkerApplications.remove(btn.dataset.id);
          renderSection();
        }
      });
    });
  }

  function initAppDetailModal() {
    document.getElementById('app-detail-close').addEventListener('click', function () {
      document.getElementById('app-detail-modal').style.display = 'none';
    });
  }

  function showApplicationDetail(app) {
    var body = document.getElementById('app-detail-body');
    body.innerHTML =
      '<div class="admin-detail-row"><strong>Tarih:</strong> ' + formatDate(app.date) + '</div>' +
      '<div class="admin-detail-row"><strong>Ad Soyad:</strong> ' + escapeHtml(app.name) + '</div>' +
      '<div class="admin-detail-row"><strong>Telefon:</strong> ' + escapeHtml(app.phone) + '</div>' +
      '<div class="admin-detail-row"><strong>E-Posta:</strong> ' + escapeHtml(app.email) + '</div>' +
      '<div class="admin-detail-row"><strong>İlan:</strong> ' + escapeHtml(app.careerTitle || '-') + '</div>' +
      '<div class="admin-detail-row"><strong>Özgeçmiş:</strong> ' + escapeHtml(app.cvFileName || '-') + '</div>' +
      '<div class="admin-detail-row"><strong>Mesaj:</strong><br>' + escapeHtml(app.message || '') + '</div>';
    document.getElementById('app-detail-modal').style.display = 'flex';
  }

  // -------------------------------------------------------
  // Ekle / Düzenle Modalı
  // -------------------------------------------------------
  function initModal() {
    document.getElementById('add-btn').addEventListener('click', function () {
      openModal(null);
    });
    document.getElementById('modal-cancel').addEventListener('click', closeModal);
    document.getElementById('modal-save').addEventListener('click', function (event) {
      event.preventDefault();
      saveModal();
    });
  }

  function openModal(id) {
    state.editingId = id;
    var config = COLLECTIONS[state.section];
    var item = id ? window.AkerStore.getById(state.section, id) : {};

    document.getElementById('modal-title').textContent = id ? 'Düzenle' : 'Yeni Ekle';

    var form = document.getElementById('admin-form');
    form.innerHTML = config.fields.map(function (field) {
      var value = (item && item[field.key]) || '';
      if (field.type === 'textarea') {
        return '<div class="admin-field"><label>' + field.label + '</label>' +
          '<textarea name="' + field.key + '">' + escapeHtml(value) + '</textarea></div>';
      }
      if (field.type === 'image') {
        var preview = value
          ? '<img class="admin-image-preview" src="' + escapeAttr(value) + '" alt="">'
          : '<div class="admin-image-preview admin-image-preview-empty">Görsel yok</div>';
        return '<div class="admin-field"><label>' + field.label + '</label>' +
          preview +
          '<input type="file" accept="image/*" name="' + field.key + '"></div>';
      }
      return '<div class="admin-field"><label>' + field.label + '</label>' +
        '<input type="text" name="' + field.key + '" value="' + escapeAttr(value) + '"></div>';
    }).join('');

    form.querySelectorAll('input[type="file"]').forEach(function (input) {
      input.addEventListener('change', function () {
        var file = input.files && input.files[0];
        if (!file) return;

        var reader = new FileReader();
        reader.onload = function () {
          var preview = input.parentElement.querySelector('.admin-image-preview');
          if (preview && preview.tagName === 'IMG') {
            preview.src = reader.result;
          } else if (preview) {
            var img = document.createElement('img');
            img.className = 'admin-image-preview';
            img.src = reader.result;
            preview.replaceWith(img);
          }
        };
        reader.readAsDataURL(file);
      });
    });

    document.getElementById('admin-modal').style.display = 'flex';
  }

  function closeModal() {
    document.getElementById('admin-modal').style.display = 'none';
  }

  function saveModal() {
    var config = COLLECTIONS[state.section];
    var form = document.getElementById('admin-form');
    var existing = state.editingId ? window.AkerStore.getById(state.section, state.editingId) : null;

    var fieldPromises = config.fields.map(function (field) {
      var input = form.querySelector('[name="' + field.key + '"]');

      if (field.type === 'image') {
        var file = input.files && input.files[0];
        if (file) {
          return compressImage(file).then(function (dataUrl) {
            return { key: field.key, value: dataUrl };
          });
        }
        return Promise.resolve({ key: field.key, value: (existing && existing[field.key]) || '' });
      }

      return Promise.resolve({ key: field.key, value: input.value });
    });

    Promise.all(fieldPromises).then(function (results) {
      var changes = {};
      results.forEach(function (result) {
        changes[result.key] = result.value;
      });

      if (state.editingId) {
        window.AkerStore.update(state.section, state.editingId, changes);
      } else {
        window.AkerStore.add(state.section, changes);
      }

      closeModal();
      renderSection();
    });
  }

  function readFileAsDataURL(file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () { resolve(reader.result); };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // Görselleri localStorage kotasını aşmamak için yeniden boyutlandırıp
  // sıkıştırır (büyük telefon fotoğrafları MB'lardan KB'lara düşer).
  var MAX_IMAGE_DIMENSION = 1200;
  var JPEG_QUALITY = 0.82;
  var MAX_OUTPUT_BYTES = 700 * 1024;

  function compressImage(file) {
    return readFileAsDataURL(file).then(function (dataUrl) {
      return new Promise(function (resolve) {
        var img = new Image();
        img.onload = function () {
          var width = img.naturalWidth;
          var height = img.naturalHeight;
          var scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(width, height));
          var isPng = file.type === 'image/png' || file.type === 'image/gif';

          if (scale === 1 && file.size <= MAX_OUTPUT_BYTES) {
            resolve(dataUrl);
            return;
          }

          var canvas = document.createElement('canvas');
          canvas.width = Math.max(1, Math.round(width * scale));
          canvas.height = Math.max(1, Math.round(height * scale));

          var ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          if (isPng) {
            resolve(canvas.toDataURL('image/png'));
            return;
          }

          var quality = JPEG_QUALITY;
          var result = canvas.toDataURL('image/jpeg', quality);
          while (result.length > MAX_OUTPUT_BYTES && quality > 0.4) {
            quality -= 0.1;
            result = canvas.toDataURL('image/jpeg', quality);
          }
          resolve(result);
        };
        img.onerror = function () {
          resolve(dataUrl);
        };
        img.src = dataUrl;
      });
    });
  }

  // -------------------------------------------------------
  // Sıfırlama
  // -------------------------------------------------------
  function initReset() {
    document.getElementById('reset-btn').addEventListener('click', function () {
      if (confirm('Tüm içerikler varsayılan haline döndürülecek. Onaylıyor musunuz?')) {
        window.AkerStore.reset();
        renderSection();
      }
    });
  }

  // -------------------------------------------------------
  // Yardımcı fonksiyonlar
  // -------------------------------------------------------
  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function escapeAttr(value) {
    return escapeHtml(value).replace(/"/g, '&quot;');
  }

  function formatDate(isoString) {
    var date = new Date(isoString);
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
})();
