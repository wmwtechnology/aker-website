// =========================================================
// AKER OSGB - Ana JavaScript Dosyası
// =========================================================

document.addEventListener('DOMContentLoaded', function () {
  renderHeroSlides();
  renderClientLogos();
  renderCareers();
  renderNews();
  renderDocuments();
  renderTeam();
  initJobDetail();
  initHeroSwiper();
  initClientsSwiper();
  initNewsCarousel();
  initCareersCarousel();
  initContactForm();
  initNewsletterForm();
});

// Statik HTML'de zaten basılı olan bölümler, yalnızca yönetim
// panelinden bu tarayıcıda kayıt yapılmışsa yeniden çizilir.
function shouldRerender() {
  return !!(window.AkerStore && window.AkerStore.hasCustomData && window.AkerStore.hasCustomData());
}

// ---------------------------------------------------------
// Ana Sayfa Slider Görselleri (dinamik)
// ---------------------------------------------------------
function renderHeroSlides() {
  var wrapper = document.querySelector('.hero-slides-wrapper');
  if (!wrapper || !shouldRerender()) return;

  var slides = window.AkerStore.getAll('slides');
  wrapper.innerHTML = slides.map(function (slide) {
    return '' +
      '<div class="swiper-slide">' +
        '<img loading="lazy" decoding="async" src="' + escapeAttr(slide.image) + '" alt="AKER OSGB tanıtım görseli" class="slide-img">' +
      '</div>';
  }).join('');
}

// ---------------------------------------------------------
// Referanslar / Müşteri Logoları (dinamik)
// ---------------------------------------------------------
function renderClientLogos() {
  var wrapper = document.querySelector('.clients-slides-wrapper');
  if (!wrapper || !shouldRerender()) return;

  var clients = window.AkerStore.getAll('clients');
  wrapper.innerHTML = clients.map(function (client) {
    var alt = client.alt || 'AKER OSGB referansı';
    return '<div class="swiper-slide"><img loading="lazy" decoding="async" src="' + escapeAttr(client.image) + '" alt="' + escapeAttr(alt) + '" class="client-logo"></div>';
  }).join('');
}

// ---------------------------------------------------------
// Kariyer Fırsatları (dinamik)
// ---------------------------------------------------------
function renderCareers() {
  var grid = document.querySelector('.careers-grid');
  if (!grid || !shouldRerender()) return;

  var careers = window.AkerStore.getAll('careers');
  grid.innerHTML = careers.map(function (career) {
    return '' +
      '<div class="career-card">' +
        '<div class="career-card-shadow">' +
          '<div class="career-card-image" style="background-image: url(&quot;' + escapeAttr(career.cardImage) + '&quot;);" role="img" aria-label="' + escapeAttr(career.title) + '"></div>' +
          '<div class="career-card-body">' +
            '<h3 class="career-card-title">' + escapeAttr(career.title) + '</h3>' +
            '<p class="career-card-text">' + escapeAttr(career.text) + '</p>' +
            '<a class="career-btn" href="/isbasvuru?id=' + encodeURIComponent(career.id) + '">Detayları Gör</a>' +
          '</div>' +
        '</div>' +
      '</div>';
  }).join('');
}

// ---------------------------------------------------------
// Bizden Haberler (dinamik)
// ---------------------------------------------------------
function renderNews() {
  var grid = document.querySelector('.news-grid');
  if (!grid || !shouldRerender()) return;

  var news = window.AkerStore.getAll('news');
  grid.innerHTML = news.map(function (item) {
    var hasLink = item.link && item.link.trim();
    var tagOpen = hasLink
      ? '<a class="news-card" href="' + escapeAttr(item.link.trim()) + '" target="_blank" rel="noopener">'
      : '<div class="news-card">';
    var tagClose = hasLink ? '</a>' : '</div>';
    return '' +
      tagOpen +
        '<div class="news-card-shadow">' +
          '<div class="news-card-image" style="background-image: url(&quot;' + escapeAttr(item.image) + '&quot;);" role="img" aria-label="' + escapeAttr(item.title) + '"></div>' +
          '<div class="news-card-body">' +
            '<h3 class="news-card-title">' + escapeAttr(item.title) + '</h3>' +
            '<p class="news-card-text">' + escapeAttr(item.text) + '</p>' +
          '</div>' +
        '</div>' +
      tagClose;
  }).join('');
}

function escapeAttr(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ---------------------------------------------------------
// Belgelerimiz (dinamik)
// ---------------------------------------------------------
function renderDocuments() {
  var grid = document.querySelector('.documents-grid');
  if (!grid || !shouldRerender()) return;

  var documents = window.AkerStore.getAll('documents');
  grid.innerHTML = documents.map(function (doc) {
    return '' +
      '<div class="document-card">' +
        '<h2 class="document-title">' + escapeAttr(doc.title) + '</h2>' +
        '<div class="document-image"><img loading="lazy" decoding="async" src="' + escapeAttr(doc.image) + '" alt="' + escapeAttr(doc.title) + ' belgesi" class="document-img"></div>' +
      '</div>';
  }).join('');
}

// ---------------------------------------------------------
// Ekibimiz (dinamik)
// ---------------------------------------------------------
function renderTeam() {
  var grid = document.querySelector('.team-grid');
  if (!grid || !shouldRerender()) return;

  var team = window.AkerStore.getAll('team');
  grid.innerHTML = team.map(function (member) {
    return '' +
      '<div class="team-card">' +
        '<div class="team-photo" style="background-image: url(&quot;' + escapeAttr(member.photo) + '&quot;);" role="img" aria-label="' + escapeAttr(member.name) + '"></div>' +
        '<h2 class="team-name">' + escapeAttr(member.name) + '</h2>' +
        '<div class="team-role">' + escapeAttr(member.role) + '</div>' +
      '</div>';
  }).join('');
}

// ---------------------------------------------------------
// İş Başvurusu detay sayfası (dinamik)
// ---------------------------------------------------------
function initJobDetail() {
  var section = document.querySelector('.job-section');
  if (!section || !window.AkerStore) return;

  var params = new URLSearchParams(window.location.search);
  var id = params.get('id');
  var careers = window.AkerStore.getAll('careers');
  var career = window.AkerStore.getById('careers', id) || careers[0];
  if (!career) return;

  var imageEl = section.querySelector('.job-image img');
  var titleEl = section.querySelector('.job-title');
  var textEl = section.querySelector('.job-text');
  if (imageEl) imageEl.src = career.image;
  if (titleEl) titleEl.textContent = career.title;
  if (textEl) textEl.textContent = career.text;

  var form = section.querySelector('.application-form');
  if (form) form.dataset.careerId = career.id;
}

// ---------------------------------------------------------
// Hero görsel slider (Swiper)
// ---------------------------------------------------------
function initHeroSwiper() {
  const el = document.querySelector('.hero-swiper .swiper');
  if (!el || typeof Swiper === 'undefined') return;

  new Swiper(el, {
    loop: true,
    effect: 'fade',
    autoplay: {
      delay: 4000,
      disableOnInteraction: false,
    },
    pagination: {
      el: el.querySelector('.swiper-pagination'),
      clickable: true,
    },
    navigation: {
      nextEl: el.querySelector('.swiper-button-next'),
      prevEl: el.querySelector('.swiper-button-prev'),
    },
  });
}

// ---------------------------------------------------------
// Referans / müşteri logoları slider (Swiper)
// ---------------------------------------------------------
function initClientsSwiper() {
  const el = document.querySelector('.clients-swiper .swiper');
  if (!el || typeof Swiper === 'undefined') return;

  new Swiper(el, {
    loop: true,
    slidesPerView: 'auto',
    spaceBetween: 30,
    autoplay: {
      delay: 0,
      disableOnInteraction: false,
    },
    speed: 4000,
    allowTouchMove: false,
  });
}

// ---------------------------------------------------------
// Bizden Haberler ok butonları
// ---------------------------------------------------------
function initNewsCarousel() {
  const carousel = document.querySelector('.news-carousel');
  if (!carousel) return;
  setupArrowScroll(carousel);
}

// ---------------------------------------------------------
// Kariyer Fırsatları ok butonları
// ---------------------------------------------------------
function initCareersCarousel() {
  const carousel = document.querySelector('.careers-carousel');
  if (!carousel) return;
  setupArrowScroll(carousel);
}

// Belirtilen carousel içindeki sol/sağ ok butonlarına
// kaydırma davranışı ekler.
function setupArrowScroll(carousel) {
  const grid = carousel.querySelector('[class$="-grid"]');
  const prevBtn = carousel.querySelector('.nav-prev');
  const nextBtn = carousel.querySelector('.nav-next');
  if (!grid || !prevBtn || !nextBtn) return;

  const scrollAmount = 320;

  prevBtn.addEventListener('click', function () {
    grid.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
  });

  nextBtn.addEventListener('click', function () {
    grid.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  });
}

// ---------------------------------------------------------
// İletişim formu
// ---------------------------------------------------------
function initContactForm() {
  const form = document.querySelector('.contact-form-block');
  if (!form) return;

  const submitBtn = form.querySelector('.submit-btn');
  const kvkkCheckbox = form.querySelector('#kvkk-check');
  const recaptchaCheckbox = form.querySelector('.recaptcha-checkbox');
  const alertBox = form.querySelector('.form-alert');
  const fileInput = form.querySelector('.file-input-wrap input[type="file"]');
  const fileLabel = form.querySelector('.file-input-label');

  function isPdfFile(file) {
    return file.type === 'application/pdf' || /\.pdf$/i.test(file.name || '');
  }

  if (fileInput && fileLabel) {
    fileInput.addEventListener('change', function () {
      const file = fileInput.files && fileInput.files[0];
      if (file && !isPdfFile(file)) {
        fileInput.value = '';
        fileLabel.textContent = 'Özgeçmiş Yükleyin';
        showAlert(alertBox, 'Lütfen özgeçmişinizi yalnızca PDF formatında yükleyin.');
        return;
      }
      fileLabel.textContent = file ? file.name : 'Özgeçmiş Yükleyin';
    });
  }

  function updateSubmitState() {
    const kvkkOk = !kvkkCheckbox || kvkkCheckbox.checked;
    const recaptchaOk = !recaptchaCheckbox || recaptchaCheckbox.checked;
    submitBtn.disabled = !(kvkkOk && recaptchaOk);
  }

  if (kvkkCheckbox && submitBtn) {
    kvkkCheckbox.addEventListener('change', updateSubmitState);
  }

  if (recaptchaCheckbox && submitBtn) {
    recaptchaCheckbox.addEventListener('change', updateSubmitState);
  }

  const kvkkLink = document.getElementById('kvkk-link');
  const kvkkModal = document.getElementById('kvkk-modal');
  const kvkkModalClose = document.getElementById('kvkk-modal-close');

  if (kvkkLink && kvkkModal && kvkkModalClose) {
    kvkkLink.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
      kvkkModal.classList.add('active');
    });

    kvkkModalClose.addEventListener('click', function () {
      kvkkModal.classList.remove('active');
    });

    kvkkModal.addEventListener('click', function (event) {
      if (event.target === kvkkModal) {
        kvkkModal.classList.remove('active');
      }
    });
  }

  if (submitBtn) {
    submitBtn.addEventListener('click', function (event) {
      event.preventDefault();
      if (submitBtn.disabled) return;

      const nameInput = form.querySelectorAll('.field-input')[0];
      const phoneInput = form.querySelectorAll('.field-input')[1];
      const emailInput = form.querySelectorAll('.field-input')[2];
      const messageInput = form.querySelector('.field-textarea');

      if (!nameInput.value || !phoneInput.value || !emailInput.value || !messageInput.value) {
        return;
      }

      if (form.classList.contains('application-form') && window.AkerApplications) {
        const career = window.AkerStore ? window.AkerStore.getById('careers', form.dataset.careerId) : null;
        const cvFile = (fileInput && fileInput.files && fileInput.files[0]) ? fileInput.files[0] : null;

        if (cvFile && !isPdfFile(cvFile)) {
          showAlert(alertBox, 'Lütfen özgeçmişinizi yalnızca PDF formatında yükleyin.');
          return;
        }

        const addApplication = function (cvFileData, cvFileType) {
          window.AkerApplications.add({
            careerId: form.dataset.careerId || '',
            careerTitle: career ? career.title : '',
            name: nameInput.value,
            phone: phoneInput.value,
            email: emailInput.value,
            message: messageInput.value,
            cvFileName: cvFile ? cvFile.name : '',
            cvFileType: cvFileType || '',
            cvFileData: cvFileData || ''
          });

          finishSubmit('Mesajınız başarıyla gönderildi.');
        };

        if (cvFile) {
          const reader = new FileReader();
          reader.onload = function () {
            addApplication(reader.result, cvFile.type);
          };
          reader.onerror = function () {
            addApplication('', '');
          };
          reader.readAsDataURL(cvFile);
        } else {
          addApplication('', '');
        }
        return;
      }

      const honeypot = form.querySelector('.hp-field');
      submitBtn.disabled = true;

      fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: nameInput.value,
          phone: phoneInput.value,
          email: emailInput.value,
          message: messageInput.value,
          company_website: honeypot ? honeypot.value : ''
        })
      })
        .then(function (res) {
          return res.json().then(function (data) {
            return { ok: res.ok, data: data };
          });
        })
        .then(function (result) {
          if (result.ok && result.data.ok) {
            finishSubmit('Mesajınız başarıyla gönderildi.');
          } else {
            showAlert(alertBox, result.data.error || 'Bir hata oluştu, lütfen tekrar deneyin.');
            submitBtn.disabled = false;
          }
        })
        .catch(function () {
          showAlert(alertBox, 'Bağlantı hatası, lütfen tekrar deneyin.');
          submitBtn.disabled = false;
        });

      function finishSubmit(message) {
        showAlert(alertBox, message);
        form.querySelectorAll('.field-input').forEach(function (input) {
          input.value = '';
        });
        messageInput.value = '';
        if (fileInput) fileInput.value = '';
        if (fileLabel) fileLabel.textContent = 'Özgeçmiş Yükleyin';
        if (kvkkCheckbox) kvkkCheckbox.checked = false;
        if (recaptchaCheckbox) recaptchaCheckbox.checked = false;
        submitBtn.disabled = true;
      }
    });
  }
}

// ---------------------------------------------------------
// E-posta bülteni aboneliği
// ---------------------------------------------------------
function initNewsletterForm() {
  const emailInput = document.querySelector('.footer-input');
  const subscribeBtn = document.querySelector('.footer-subscribe-btn');
  const alertBox = document.querySelector('.footer-alert');
  if (!emailInput || !subscribeBtn) return;

  emailInput.addEventListener('input', function () {
    subscribeBtn.disabled = !isValidEmail(emailInput.value);
  });

  subscribeBtn.addEventListener('click', function (event) {
    event.preventDefault();
    if (subscribeBtn.disabled) return;

    showAlert(alertBox, 'Abonelik talebiniz alındı.');
    emailInput.value = '';
    subscribeBtn.disabled = true;
  });
}

// ---------------------------------------------------------
// Yardımcı fonksiyonlar
// ---------------------------------------------------------
function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function showAlert(alertBox, message) {
  if (!alertBox) return;
  alertBox.textContent = message;
  alertBox.style.display = 'block';
  setTimeout(function () {
    alertBox.style.display = 'none';
  }, 4000);
}
