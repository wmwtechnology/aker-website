// =========================================================
// AKER OSGB - Paylaşılan içerik işaretlemesi
// =========================================================
// Aynı HTML'i iki yer üretir:
//   - tools/build.ts     : statik yedek içerik (derleme anında)
//   - functions/_middleware.ts : veri tabanındaki güncel içerik (istek anında)
// İkisinin görsel olarak birebir aynı olması için işaretleme
// yalnızca burada tanımlanır.
// =========================================================

import type { Career, CertificateDoc, Client, NewsItem, Slide, TeamMember } from './content-types.ts';
import { IMAGE_SIZES } from './image-sizes.gen.ts';

export function esc(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Bilinen yerel görseller için width/height nitelikleri; yüklenenlerde boş döner. */
function dims(src: string): string {
  const size = IMAGE_SIZES[src.replace('/img/', '')];
  return size ? ` width="${size.width}" height="${size.height}"` : '';
}

export function renderSlides(slides: Slide[]): string {
  return slides
    .map((slide, index) => {
      const alt = slide.alt?.trim() || 'AKER OSGB tanıtım görseli';
      const priority = index === 0 ? ' fetchpriority="high"' : ' loading="lazy"';
      return `        <div class="swiper-slide"><img src="${esc(slide.image)}" alt="${esc(alt)}"${dims(slide.image)} class="slide-img"${priority} decoding="async"></div>`;
    })
    .join('\n');
}

export function renderClients(clients: Client[]): string {
  return clients
    .map(
      (client) =>
        `        <div class="swiper-slide"><img src="${esc(client.image)}" alt="${esc(client.alt || 'AKER OSGB referansı')}"${dims(client.image)} class="client-logo" loading="lazy" decoding="async"></div>`,
    )
    .join('\n');
}

export function renderNews(news: NewsItem[]): string {
  return news
    .map((item) => {
      const link = item.link?.trim();
      const open = link
        ? `<a class="news-card" href="${esc(link)}" target="_blank" rel="noopener">`
        : '<div class="news-card">';
      const close = link ? '</a>' : '</div>';

      // Bağlantısı olmayan haber kartı tıklanabilir görünmez.
      const okuBagi = link ? '\n              <span class="news-card-link">Haberi oku &rarr;</span>' : '';

      return `        ${open}
          <div class="news-card-shadow">
            <div class="news-card-image" style="background-image: url(&quot;${esc(item.image)}&quot;);" role="img" aria-label="${esc(item.title)}"></div>
            <div class="news-card-body">
              <h3 class="news-card-title">${esc(item.title)}</h3>
              <p class="news-card-text">${esc(item.text)}</p>${okuBagi}
            </div>
          </div>
        ${close}`;
    })
    .join('\n');
}

export function renderCareerCards(careers: Career[]): string {
  return careers
    .map(
      (career) => `        <div class="career-card">
          <div class="career-card-shadow">
            <div class="career-card-image" style="background-image: url(&quot;${esc(career.cardImage)}&quot;);" role="img" aria-label="${esc(career.title)}"></div>
            <div class="career-card-body">
              <h3 class="career-card-title">${esc(career.title)}</h3>
              <p class="career-card-text">${esc(career.text)}</p>
              <a class="career-btn" href="/isbasvuru?id=${encodeURIComponent(career.id)}">Detayları Gör</a>
            </div>
          </div>
        </div>`,
    )
    .join('\n');
}

/** /kariyer sayfasındaki ayrıntılı ilan listesi. */
export function renderCareerList(careers: Career[]): string {
  return careers
    .map(
      (career) => `      <li class="career-item">
        <div class="career-item-image"><img src="${esc(career.cardImage)}" alt="${esc(career.title)}"${dims(career.cardImage)} loading="lazy" decoding="async"></div>
        <div class="career-item-body">
          <h3 class="career-item-title">${esc(career.title)}</h3>
          <p class="career-item-text">${esc(career.text)}</p>
          <a class="career-item-btn" href="/isbasvuru?id=${encodeURIComponent(career.id)}">Detayları gör ve başvur</a>
        </div>
      </li>`,
    )
    .join('\n');
}

export function renderDocuments(documents: CertificateDoc[]): string {
  return documents
    .map(
      (doc) => `      <div class="document-card">
        <h2 class="document-title">${esc(doc.title)}</h2>
        <div class="document-image"><img src="${esc(doc.image)}" alt="${esc(doc.title)} belgesi"${dims(doc.image)} class="document-img" loading="lazy" decoding="async"></div>
      </div>`,
    )
    .join('\n');
}

export function renderTeam(team: TeamMember[]): string {
  return team
    .map(
      (member) => `      <div class="team-card">
        <div class="team-photo" style="background-image: url(&quot;${esc(member.photo)}&quot;);" role="img" aria-label="${esc(member.name)}"></div>
        <h2 class="team-name">${esc(member.name)}</h2>
        <div class="team-role">${esc(member.role)}</div>
      </div>`,
    )
    .join('\n');
}

/** İş başvurusu sayfasındaki ilan başlığı, metni ve görseli. */
export function renderJobDetail(career: Career): string {
  return `    <div class="job-image">
      <img src="${esc(career.image)}" alt="${esc(career.title)}"${dims(career.image)} fetchpriority="high" decoding="async">
    </div>

    <h1 class="job-title">${esc(career.title)}</h1>
    <p class="job-text">${esc(career.text)}</p>`;
}
