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
  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }
  function showAlert(box, message) {
    if (!box) return;
    box.textContent = message;
    box.style.display = "block";
    window.setTimeout(() => {
      box.style.display = "none";
    }, 4e3);
  }

  // src/script.ts
  document.addEventListener("DOMContentLoaded", () => {
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
  function shouldRerender() {
    var _a, _b;
    return Boolean((_b = (_a = window.AkerStore) == null ? void 0 : _a.hasCustomData) == null ? void 0 : _b.call(_a));
  }
  function renderHeroSlides() {
    const wrapper = qs(".hero-slides-wrapper");
    if (!wrapper || !shouldRerender()) return;
    wrapper.innerHTML = window.AkerStore.getAll("slides").map(
      (slide) => `<div class="swiper-slide"><img loading="lazy" decoding="async" src="${escapeAttr(slide.image)}" alt="AKER OSGB tanıtım görseli" class="slide-img"></div>`
    ).join("");
  }
  function renderClientLogos() {
    const wrapper = qs(".clients-slides-wrapper");
    if (!wrapper || !shouldRerender()) return;
    wrapper.innerHTML = window.AkerStore.getAll("clients").map(
      (client) => `<div class="swiper-slide"><img loading="lazy" decoding="async" src="${escapeAttr(client.image)}" alt="${escapeAttr(client.alt || "AKER OSGB referansı")}" class="client-logo"></div>`
    ).join("");
  }
  function renderCareers() {
    const grid = qs(".careers-grid");
    if (!grid || !shouldRerender()) return;
    grid.innerHTML = window.AkerStore.getAll("careers").map(
      (career) => `<div class="career-card"><div class="career-card-shadow"><div class="career-card-image" style="background-image: url(&quot;${escapeAttr(career.cardImage)}&quot;);" role="img" aria-label="${escapeAttr(career.title)}"></div><div class="career-card-body"><h3 class="career-card-title">${escapeHtml(career.title)}</h3><p class="career-card-text">${escapeHtml(career.text)}</p><a class="career-btn" href="/isbasvuru?id=${encodeURIComponent(career.id)}">Detayları Gör</a></div></div></div>`
    ).join("");
  }
  function renderNews() {
    const grid = qs(".news-grid");
    if (!grid || !shouldRerender()) return;
    grid.innerHTML = window.AkerStore.getAll("news").map((item) => {
      var _a;
      const link = (_a = item.link) == null ? void 0 : _a.trim();
      const open = link ? `<a class="news-card" href="${escapeAttr(link)}" target="_blank" rel="noopener">` : '<div class="news-card">';
      const close = link ? "</a>" : "</div>";
      return open + `<div class="news-card-shadow"><div class="news-card-image" style="background-image: url(&quot;${escapeAttr(item.image)}&quot;);" role="img" aria-label="${escapeAttr(item.title)}"></div><div class="news-card-body"><h3 class="news-card-title">${escapeHtml(item.title)}</h3><p class="news-card-text">${escapeHtml(item.text)}</p></div></div>` + close;
    }).join("");
  }
  function renderDocuments() {
    const grid = qs(".documents-grid");
    if (!grid || !shouldRerender()) return;
    grid.innerHTML = window.AkerStore.getAll("documents").map(
      (doc) => `<div class="document-card"><h2 class="document-title">${escapeHtml(doc.title)}</h2><div class="document-image"><img loading="lazy" decoding="async" src="${escapeAttr(doc.image)}" alt="${escapeAttr(doc.title)} belgesi" class="document-img"></div></div>`
    ).join("");
  }
  function renderTeam() {
    const grid = qs(".team-grid");
    if (!grid || !shouldRerender()) return;
    grid.innerHTML = window.AkerStore.getAll("team").map(
      (member) => `<div class="team-card"><div class="team-photo" style="background-image: url(&quot;${escapeAttr(member.photo)}&quot;);" role="img" aria-label="${escapeAttr(member.name)}"></div><h2 class="team-name">${escapeHtml(member.name)}</h2><div class="team-role">${escapeHtml(member.role)}</div></div>`
    ).join("");
  }
  function initJobDetail() {
    var _a;
    const section = qs(".job-section");
    if (!section || !window.AkerStore) return;
    const id = new URLSearchParams(window.location.search).get("id");
    const career = (_a = window.AkerStore.getById("careers", id)) != null ? _a : window.AkerStore.getAll("careers")[0];
    if (!career) return;
    const image = qs(".job-image img", section);
    const title = qs(".job-title", section);
    const text = qs(".job-text", section);
    if (image) image.src = career.image;
    if (title) title.textContent = career.title;
    if (text) text.textContent = career.text;
    const form = qs(".application-form", section);
    if (form) form.dataset["careerId"] = career.id;
  }
  function initHeroSwiper() {
    const el = qs(".hero-swiper .swiper");
    if (!el || !window.Swiper) return;
    new window.Swiper(el, {
      loop: true,
      effect: "fade",
      autoplay: { delay: 4e3, disableOnInteraction: false },
      pagination: { el: qs(".swiper-pagination", el), clickable: true },
      navigation: {
        nextEl: qs(".swiper-button-next", el),
        prevEl: qs(".swiper-button-prev", el)
      }
    });
  }
  function initClientsSwiper() {
    const el = qs(".clients-swiper .swiper");
    if (!el || !window.Swiper) return;
    new window.Swiper(el, {
      loop: true,
      slidesPerView: "auto",
      spaceBetween: 30,
      autoplay: { delay: 0, disableOnInteraction: false },
      speed: 4e3,
      allowTouchMove: false
    });
  }
  function initCarousels() {
    for (const selector of [".news-carousel", ".careers-carousel"]) {
      const carousel = qs(selector);
      if (carousel) setupArrowScroll(carousel);
    }
  }
  function setupArrowScroll(carousel) {
    const grid = qs('[class$="-grid"]', carousel);
    const prev = qs(".nav-prev", carousel);
    const next = qs(".nav-next", carousel);
    if (!grid || !prev || !next) return;
    const amount = 320;
    prev.addEventListener("click", () => grid.scrollBy({ left: -amount, behavior: "smooth" }));
    next.addEventListener("click", () => grid.scrollBy({ left: amount, behavior: "smooth" }));
  }
  function isPdf(file) {
    return file.type === "application/pdf" || /\.pdf$/i.test(file.name);
  }
  function initContactForm() {
    const form = qs(".contact-form-block");
    if (!form) return;
    const submitBtn = qs(".submit-btn", form);
    const kvkkCheckbox = qs("#kvkk-check", form);
    const recaptchaCheckbox = qs(".recaptcha-checkbox", form);
    const alertBox = qs(".form-alert", form);
    const fileInput = qs('.file-input-wrap input[type="file"]', form);
    const fileLabel = qs(".file-input-label", form);
    if (fileInput && fileLabel) {
      fileInput.addEventListener("change", () => {
        var _a;
        const file = (_a = fileInput.files) == null ? void 0 : _a[0];
        if (file && !isPdf(file)) {
          fileInput.value = "";
          fileLabel.textContent = "Özgeçmiş Yükleyin";
          showAlert(alertBox, "Lütfen özgeçmişinizi yalnızca PDF formatında yükleyin.");
          return;
        }
        fileLabel.textContent = file ? file.name : "Özgeçmiş Yükleyin";
      });
    }
    function updateSubmitState() {
      if (!submitBtn) return;
      const kvkkOk = !kvkkCheckbox || kvkkCheckbox.checked;
      const recaptchaOk = !recaptchaCheckbox || recaptchaCheckbox.checked;
      submitBtn.disabled = !(kvkkOk && recaptchaOk);
    }
    kvkkCheckbox == null ? void 0 : kvkkCheckbox.addEventListener("change", updateSubmitState);
    recaptchaCheckbox == null ? void 0 : recaptchaCheckbox.addEventListener("change", updateSubmitState);
    initKvkkModal();
    if (!submitBtn) return;
    submitBtn.addEventListener("click", (event) => {
      var _a, _b, _c, _d;
      event.preventDefault();
      if (submitBtn.disabled) return;
      const inputs = qsa(".field-input", form);
      const [nameInput, phoneInput, emailInput] = inputs;
      const messageInput = qs(".field-textarea", form);
      if (!nameInput || !phoneInput || !emailInput || !messageInput) return;
      if (!nameInput.value || !phoneInput.value || !emailInput.value || !messageInput.value) return;
      const resetForm = (message) => {
        showAlert(alertBox, message);
        for (const input of inputs) input.value = "";
        messageInput.value = "";
        if (fileInput) fileInput.value = "";
        if (fileLabel) fileLabel.textContent = "Özgeçmiş Yükleyin";
        if (kvkkCheckbox) kvkkCheckbox.checked = false;
        if (recaptchaCheckbox) recaptchaCheckbox.checked = false;
        submitBtn.disabled = true;
      };
      if (form.classList.contains("application-form")) {
        const careerId = (_a = form.dataset["careerId"]) != null ? _a : "";
        const career = window.AkerStore.getById("careers", careerId);
        const cvFile = (_c = (_b = fileInput == null ? void 0 : fileInput.files) == null ? void 0 : _b[0]) != null ? _c : null;
        if (cvFile && !isPdf(cvFile)) {
          showAlert(alertBox, "Lütfen özgeçmişinizi yalnızca PDF formatında yükleyin.");
          return;
        }
        const store = (cvFileData, cvFileType) => {
          var _a2, _b2;
          window.AkerApplications.add({
            careerId,
            careerTitle: (_a2 = career == null ? void 0 : career.title) != null ? _a2 : "",
            name: nameInput.value,
            phone: phoneInput.value,
            email: emailInput.value,
            message: messageInput.value,
            cvFileName: (_b2 = cvFile == null ? void 0 : cvFile.name) != null ? _b2 : "",
            cvFileType,
            cvFileData
          });
          resetForm("Başvurunuz alındı.");
        };
        if (cvFile) {
          const reader = new FileReader();
          reader.onload = () => {
            var _a2;
            return store(String((_a2 = reader.result) != null ? _a2 : ""), cvFile.type);
          };
          reader.onerror = () => store("", "");
          reader.readAsDataURL(cvFile);
        } else {
          store("", "");
        }
        return;
      }
      const honeypot = qs(".hp-field", form);
      submitBtn.disabled = true;
      fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: nameInput.value,
          phone: phoneInput.value,
          email: emailInput.value,
          message: messageInput.value,
          company_website: (_d = honeypot == null ? void 0 : honeypot.value) != null ? _d : ""
        })
      }).then(async (res) => {
        const data = await res.json();
        return { ok: res.ok, data };
      }).then((result) => {
        var _a2;
        if (result.ok && result.data.ok) {
          resetForm("Mesajınız başarıyla gönderildi.");
        } else {
          showAlert(alertBox, (_a2 = result.data.error) != null ? _a2 : "Bir hata oluştu, lütfen tekrar deneyin.");
          submitBtn.disabled = false;
        }
      }).catch(() => {
        showAlert(alertBox, "Bağlantı hatası, lütfen tekrar deneyin.");
        submitBtn.disabled = false;
      });
    });
  }
  function initKvkkModal() {
    const link = byId("kvkk-link");
    const modal = byId("kvkk-modal");
    const close = byId("kvkk-modal-close");
    if (!link || !modal || !close) return;
    link.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      modal.classList.add("active");
    });
    close.addEventListener("click", () => modal.classList.remove("active"));
    modal.addEventListener("click", (event) => {
      if (event.target === modal) modal.classList.remove("active");
    });
  }
  function initNewsletterForm() {
    const emailInput = qs(".footer-input");
    const subscribeBtn = qs(".footer-subscribe-btn");
    const alertBox = qs(".footer-alert");
    if (!emailInput || !subscribeBtn) return;
    emailInput.addEventListener("input", () => {
      subscribeBtn.disabled = !isValidEmail(emailInput.value);
    });
    subscribeBtn.addEventListener("click", (event) => {
      event.preventDefault();
      if (subscribeBtn.disabled) return;
      showAlert(alertBox, "Abonelik talebiniz alındı.");
      emailInput.value = "";
      subscribeBtn.disabled = true;
    });
  }
})();
