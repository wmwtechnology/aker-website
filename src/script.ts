// =========================================================
// AKER OSGB - Site davranışı
// =========================================================
// Sayfa içerikleri HTML'e statik olarak gömülüdür. Buradaki
// render* fonksiyonları yalnızca yönetim panelinden bu tarayıcıda
// kayıt yapılmışsa çalışır; aksi hâlde statik içerik korunur.
// =========================================================

import { byId, escapeAttr, escapeHtml, isValidEmail, qs, qsa, showAlert } from './dom.ts';

document.addEventListener('DOMContentLoaded', () => {
  renderHeroSlides();
  renderClientLogos();
  renderCareers();
  renderNews();
  renderDocuments();
  renderTeam();
  initJobDetail();
  initHeroSwiper();
  initClientsSwiper();
  initCarousels();
  initContactForm();
  initNewsletterForm();
});

function shouldRerender(): boolean {
  return Boolean(window.AkerStore?.hasCustomData?.());
}

// ---------------------------------------------------------
// Ana sayfa slider görselleri
// ---------------------------------------------------------
function renderHeroSlides(): void {
  const wrapper = qs('.hero-slides-wrapper');
  if (!wrapper || !shouldRerender()) return;

  wrapper.innerHTML = window.AkerStore.getAll('slides')
    .map(
      (slide) =>
        `<div class="swiper-slide">` +
        `<img loading="lazy" decoding="async" src="${escapeAttr(slide.image)}" alt="AKER OSGB tanıtım görseli" class="slide-img">` +
        `</div>`,
    )
    .join('');
}

// ---------------------------------------------------------
// Referans / müşteri logoları
// ---------------------------------------------------------
function renderClientLogos(): void {
  const wrapper = qs('.clients-slides-wrapper');
  if (!wrapper || !shouldRerender()) return;

  wrapper.innerHTML = window.AkerStore.getAll('clients')
    .map(
      (client) =>
        `<div class="swiper-slide">` +
        `<img loading="lazy" decoding="async" src="${escapeAttr(client.image)}" alt="${escapeAttr(client.alt || 'AKER OSGB referansı')}" class="client-logo">` +
        `</div>`,
    )
    .join('');
}

// ---------------------------------------------------------
// Kariyer fırsatları
// ---------------------------------------------------------
function renderCareers(): void {
  const grid = qs('.careers-grid');
  if (!grid || !shouldRerender()) return;

  grid.innerHTML = window.AkerStore.getAll('careers')
    .map(
      (career) =>
        `<div class="career-card">` +
        `<div class="career-card-shadow">` +
        `<div class="career-card-image" style="background-image: url(&quot;${escapeAttr(career.cardImage)}&quot;);" role="img" aria-label="${escapeAttr(career.title)}"></div>` +
        `<div class="career-card-body">` +
        `<h3 class="career-card-title">${escapeHtml(career.title)}</h3>` +
        `<p class="career-card-text">${escapeHtml(career.text)}</p>` +
        `<a class="career-btn" href="/isbasvuru?id=${encodeURIComponent(career.id)}">Detayları Gör</a>` +
        `</div></div></div>`,
    )
    .join('');
}

// ---------------------------------------------------------
// Bizden haberler
// ---------------------------------------------------------
function renderNews(): void {
  const grid = qs('.news-grid');
  if (!grid || !shouldRerender()) return;

  grid.innerHTML = window.AkerStore.getAll('news')
    .map((item) => {
      const link = item.link?.trim();
      const open = link
        ? `<a class="news-card" href="${escapeAttr(link)}" target="_blank" rel="noopener">`
        : '<div class="news-card">';
      const close = link ? '</a>' : '</div>';

      return (
        open +
        `<div class="news-card-shadow">` +
        `<div class="news-card-image" style="background-image: url(&quot;${escapeAttr(item.image)}&quot;);" role="img" aria-label="${escapeAttr(item.title)}"></div>` +
        `<div class="news-card-body">` +
        `<h3 class="news-card-title">${escapeHtml(item.title)}</h3>` +
        `<p class="news-card-text">${escapeHtml(item.text)}</p>` +
        `</div></div>` +
        close
      );
    })
    .join('');
}

// ---------------------------------------------------------
// Belgelerimiz
// ---------------------------------------------------------
function renderDocuments(): void {
  const grid = qs('.documents-grid');
  if (!grid || !shouldRerender()) return;

  grid.innerHTML = window.AkerStore.getAll('documents')
    .map(
      (doc) =>
        `<div class="document-card">` +
        `<h2 class="document-title">${escapeHtml(doc.title)}</h2>` +
        `<div class="document-image"><img loading="lazy" decoding="async" src="${escapeAttr(doc.image)}" alt="${escapeAttr(doc.title)} belgesi" class="document-img"></div>` +
        `</div>`,
    )
    .join('');
}

// ---------------------------------------------------------
// Ekibimiz
// ---------------------------------------------------------
function renderTeam(): void {
  const grid = qs('.team-grid');
  if (!grid || !shouldRerender()) return;

  grid.innerHTML = window.AkerStore.getAll('team')
    .map(
      (member) =>
        `<div class="team-card">` +
        `<div class="team-photo" style="background-image: url(&quot;${escapeAttr(member.photo)}&quot;);" role="img" aria-label="${escapeAttr(member.name)}"></div>` +
        `<h2 class="team-name">${escapeHtml(member.name)}</h2>` +
        `<div class="team-role">${escapeHtml(member.role)}</div>` +
        `</div>`,
    )
    .join('');
}

// ---------------------------------------------------------
// İş başvurusu detay sayfası
// ---------------------------------------------------------
function initJobDetail(): void {
  const section = qs('.job-section');
  if (!section || !window.AkerStore) return;

  const id = new URLSearchParams(window.location.search).get('id');
  const career = window.AkerStore.getById('careers', id) ?? window.AkerStore.getAll('careers')[0];
  if (!career) return;

  const image = qs<HTMLImageElement>('.job-image img', section);
  const title = qs('.job-title', section);
  const text = qs('.job-text', section);
  if (image) image.src = career.image;
  if (title) title.textContent = career.title;
  if (text) text.textContent = career.text;

  const form = qs<HTMLElement>('.application-form', section);
  if (form) form.dataset['careerId'] = career.id;
}

// ---------------------------------------------------------
// Kaydırıcılar (Swiper)
// ---------------------------------------------------------
function initHeroSwiper(): void {
  const el = qs('.hero-swiper .swiper');
  if (!el || !window.Swiper) return;

  new window.Swiper(el, {
    loop: true,
    effect: 'fade',
    autoplay: { delay: 4000, disableOnInteraction: false },
    pagination: { el: qs('.swiper-pagination', el), clickable: true },
    navigation: {
      nextEl: qs('.swiper-button-next', el),
      prevEl: qs('.swiper-button-prev', el),
    },
  });
}

function initClientsSwiper(): void {
  const el = qs('.clients-swiper .swiper');
  if (!el || !window.Swiper) return;

  new window.Swiper(el, {
    loop: true,
    slidesPerView: 'auto',
    spaceBetween: 30,
    autoplay: { delay: 0, disableOnInteraction: false },
    speed: 4000,
    allowTouchMove: false,
  });
}

// ---------------------------------------------------------
// Haber ve kariyer karusellerindeki ok butonları
// ---------------------------------------------------------
function initCarousels(): void {
  for (const selector of ['.news-carousel', '.careers-carousel']) {
    const carousel = qs(selector);
    if (carousel) setupArrowScroll(carousel);
  }
}

function setupArrowScroll(carousel: HTMLElement): void {
  const grid = qs('[class$="-grid"]', carousel);
  const prev = qs<HTMLButtonElement>('.nav-prev', carousel);
  const next = qs<HTMLButtonElement>('.nav-next', carousel);
  if (!grid || !prev || !next) return;

  const amount = 320;
  prev.addEventListener('click', () => grid.scrollBy({ left: -amount, behavior: 'smooth' }));
  next.addEventListener('click', () => grid.scrollBy({ left: amount, behavior: 'smooth' }));
}

// ---------------------------------------------------------
// İletişim ve başvuru formu
// ---------------------------------------------------------
function isPdf(file: File): boolean {
  return file.type === 'application/pdf' || /\.pdf$/i.test(file.name);
}

function initContactForm(): void {
  const form = qs('.contact-form-block');
  if (!form) return;

  const submitBtn = qs<HTMLButtonElement>('.submit-btn', form);
  const kvkkCheckbox = qs<HTMLInputElement>('#kvkk-check', form);
  const recaptchaCheckbox = qs<HTMLInputElement>('.recaptcha-checkbox', form);
  const alertBox = qs('.form-alert', form);
  const fileInput = qs<HTMLInputElement>('.file-input-wrap input[type="file"]', form);
  const fileLabel = qs('.file-input-label', form);

  if (fileInput && fileLabel) {
    fileInput.addEventListener('change', () => {
      const file = fileInput.files?.[0];
      if (file && !isPdf(file)) {
        fileInput.value = '';
        fileLabel.textContent = 'Özgeçmiş Yükleyin';
        showAlert(alertBox, 'Lütfen özgeçmişinizi yalnızca PDF formatında yükleyin.');
        return;
      }
      fileLabel.textContent = file ? file.name : 'Özgeçmiş Yükleyin';
    });
  }

  function updateSubmitState(): void {
    if (!submitBtn) return;
    const kvkkOk = !kvkkCheckbox || kvkkCheckbox.checked;
    const recaptchaOk = !recaptchaCheckbox || recaptchaCheckbox.checked;
    submitBtn.disabled = !(kvkkOk && recaptchaOk);
  }

  kvkkCheckbox?.addEventListener('change', updateSubmitState);
  recaptchaCheckbox?.addEventListener('change', updateSubmitState);

  initKvkkModal();

  if (!submitBtn) return;

  submitBtn.addEventListener('click', (event) => {
    event.preventDefault();
    if (submitBtn.disabled) return;

    const inputs = qsa<HTMLInputElement>('.field-input', form);
    const [nameInput, phoneInput, emailInput] = inputs;
    const messageInput = qs<HTMLTextAreaElement>('.field-textarea', form);

    if (!nameInput || !phoneInput || !emailInput || !messageInput) return;
    if (!nameInput.value || !phoneInput.value || !emailInput.value || !messageInput.value) return;

    const resetForm = (message: string): void => {
      showAlert(alertBox, message);
      for (const input of inputs) input.value = '';
      messageInput.value = '';
      if (fileInput) fileInput.value = '';
      if (fileLabel) fileLabel.textContent = 'Özgeçmiş Yükleyin';
      if (kvkkCheckbox) kvkkCheckbox.checked = false;
      if (recaptchaCheckbox) recaptchaCheckbox.checked = false;
      submitBtn.disabled = true;
    };

    // İş başvurusu formu: kayıt yerelde tutulur, özgeçmiş dosyası da eklenir.
    if (form.classList.contains('application-form')) {
      const careerId = form.dataset['careerId'] ?? '';
      const career = window.AkerStore.getById('careers', careerId);
      const cvFile = fileInput?.files?.[0] ?? null;

      if (cvFile && !isPdf(cvFile)) {
        showAlert(alertBox, 'Lütfen özgeçmişinizi yalnızca PDF formatında yükleyin.');
        return;
      }

      const store = (cvFileData: string, cvFileType: string): void => {
        window.AkerApplications.add({
          careerId,
          careerTitle: career?.title ?? '',
          name: nameInput.value,
          phone: phoneInput.value,
          email: emailInput.value,
          message: messageInput.value,
          cvFileName: cvFile?.name ?? '',
          cvFileType,
          cvFileData,
        });
        resetForm('Başvurunuz alındı.');
      };

      if (cvFile) {
        const reader = new FileReader();
        reader.onload = () => store(String(reader.result ?? ''), cvFile.type);
        reader.onerror = () => store('', '');
        reader.readAsDataURL(cvFile);
      } else {
        store('', '');
      }
      return;
    }

    // İletişim formu: Cloudflare Pages Function üzerinden e-posta gönderilir.
    const honeypot = qs<HTMLInputElement>('.hp-field', form);
    submitBtn.disabled = true;

    fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: nameInput.value,
        phone: phoneInput.value,
        email: emailInput.value,
        message: messageInput.value,
        company_website: honeypot?.value ?? '',
      }),
    })
      .then(async (res) => {
        const data = (await res.json()) as { ok?: boolean; error?: string };
        return { ok: res.ok, data };
      })
      .then((result) => {
        if (result.ok && result.data.ok) {
          resetForm('Mesajınız başarıyla gönderildi.');
        } else {
          showAlert(alertBox, result.data.error ?? 'Bir hata oluştu, lütfen tekrar deneyin.');
          submitBtn.disabled = false;
        }
      })
      .catch(() => {
        showAlert(alertBox, 'Bağlantı hatası, lütfen tekrar deneyin.');
        submitBtn.disabled = false;
      });
  });
}

function initKvkkModal(): void {
  const link = byId('kvkk-link');
  const modal = byId('kvkk-modal');
  const close = byId('kvkk-modal-close');
  if (!link || !modal || !close) return;

  link.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    modal.classList.add('active');
  });

  close.addEventListener('click', () => modal.classList.remove('active'));
  modal.addEventListener('click', (event) => {
    if (event.target === modal) modal.classList.remove('active');
  });
}

// ---------------------------------------------------------
// E-posta bülteni
// ---------------------------------------------------------
function initNewsletterForm(): void {
  const emailInput = qs<HTMLInputElement>('.footer-input');
  const subscribeBtn = qs<HTMLButtonElement>('.footer-subscribe-btn');
  const alertBox = qs('.footer-alert');
  if (!emailInput || !subscribeBtn) return;

  emailInput.addEventListener('input', () => {
    subscribeBtn.disabled = !isValidEmail(emailInput.value);
  });

  subscribeBtn.addEventListener('click', (event) => {
    event.preventDefault();
    if (subscribeBtn.disabled) return;

    showAlert(alertBox, 'Abonelik talebiniz alındı.');
    emailInput.value = '';
    subscribeBtn.disabled = true;
  });
}
