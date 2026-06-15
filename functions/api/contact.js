import { json, checkOrigin } from '../_lib/http.js';
import { sendMail, esc, isEmail, isText } from '../_lib/mail.js';

/** Contact form (index.html, #iletisim section). JSON body, no attachments. */
export const onRequestPost = async ({ request, env }) => {
  if (!checkOrigin(request)) return json({ error: 'forbidden' }, 403);

  let b;
  try {
    b = await request.json();
  } catch {
    return json({ error: 'bad request' }, 400);
  }

  // Honeypot: real users leave this empty; bots tend to fill it.
  if (typeof b.company_website === 'string' && b.company_website.trim() !== '') {
    return json({ ok: true }); // silently accept & drop
  }

  if (!isText(b.name, 120)) return json({ error: 'Ad Soyad gerekli' }, 422);
  if (!isText(b.phone, 30)) return json({ error: 'Telefon gerekli' }, 422);
  if (!isEmail(b.email)) return json({ error: 'Geçerli bir e-posta girin' }, 422);
  if (!isText(b.message, 4000)) return json({ error: 'Mesaj gerekli' }, 422);

  try {
    await sendMail(env, {
      subject: `İletişim formu — ${b.name}`,
      replyTo: b.email,
      html:
        '<h2>Yeni iletişim formu mesajı</h2>' +
        `<p><b>Ad Soyad:</b> ${esc(b.name)}</p>` +
        `<p><b>Telefon:</b> ${esc(b.phone)}</p>` +
        `<p><b>E-posta:</b> ${esc(b.email)}</p>` +
        `<p><b>Mesaj:</b><br>${esc(b.message).replace(/\n/g, '<br>')}</p>`,
    });
  } catch (err) {
    console.error('contact mail failed', err);
    return json({ error: 'Gönderilemedi, lütfen tekrar deneyin.' }, 502);
  }
  return json({ ok: true });
};
