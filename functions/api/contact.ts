import { checkOrigin, json } from '../_lib/http.ts';
import { esc, isEmail, isText, sendMail, type MailEnv } from '../_lib/mail.ts';

interface ContactBody {
  name?: unknown;
  phone?: unknown;
  email?: unknown;
  message?: unknown;
  /** Bal küpü alanı: gerçek kullanıcılar boş bırakır, botlar doldurur. */
  company_website?: unknown;
}

/** İletişim formu (ana sayfa #iletisim ve /iletisim). JSON gövde, dosya eki yok. */
export const onRequestPost = async (
  context: { request: Request; env: MailEnv },
): Promise<Response> => {
  const { request, env } = context;

  if (!checkOrigin(request)) return json({ error: 'forbidden' }, 403);

  let body: ContactBody;
  try {
    body = (await request.json()) as ContactBody;
  } catch {
    return json({ error: 'bad request' }, 400);
  }

  if (typeof body.company_website === 'string' && body.company_website.trim() !== '') {
    return json({ ok: true }); // sessizce kabul et, gönderme
  }

  if (!isText(body.name, 120)) return json({ error: 'Ad Soyad gerekli' }, 422);
  if (!isText(body.phone, 30)) return json({ error: 'Telefon gerekli' }, 422);
  if (!isEmail(body.email)) return json({ error: 'Geçerli bir e-posta girin' }, 422);
  if (!isText(body.message, 4000)) return json({ error: 'Mesaj gerekli' }, 422);

  try {
    await sendMail(env, {
      subject: `İletişim formu — ${body.name}`,
      replyTo: body.email,
      html:
        '<h2>Yeni iletişim formu mesajı</h2>' +
        `<p><b>Ad Soyad:</b> ${esc(body.name)}</p>` +
        `<p><b>Telefon:</b> ${esc(body.phone)}</p>` +
        `<p><b>E-posta:</b> ${esc(body.email)}</p>` +
        `<p><b>Mesaj:</b><br>${esc(body.message).replace(/\n/g, '<br>')}</p>`,
    });
  } catch (err) {
    console.error('contact mail failed', err);
    return json({ error: 'Gönderilemedi, lütfen tekrar deneyin.' }, 502);
  }

  return json({ ok: true });
};
