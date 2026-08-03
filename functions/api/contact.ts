import { checkOrigin, json } from '../_lib/http.ts';
import { esc, isEmail, isText, sendMail } from '../_lib/mail.ts';
import { newId } from '../_lib/content.ts';
import type { Ctx } from '../_lib/env.ts';

interface ContactBody {
  name?: unknown;
  phone?: unknown;
  email?: unknown;
  message?: unknown;
  /** Bal küpü alanı: gerçek kullanıcılar boş bırakır, botlar doldurur. */
  company_website?: unknown;
}

/**
 * İletişim formu (ana sayfa #iletisim ve /iletisim).
 *
 * Mesaj her durumda veri tabanına yazılır. E-posta gönderimi yalnızca
 * gerekli değişkenler tanımlıysa denenir; gönderim başarısız olsa bile
 * kullanıcıya hata gösterilmez, çünkü mesaj kaydedilmiş olur ve
 * yönetim panelinden görülebilir.
 */
export const onRequestPost = async ({ request, env }: Ctx): Promise<Response> => {
  if (!checkOrigin(request)) return json({ error: 'forbidden' }, 403);

  let body: ContactBody;
  try {
    body = (await request.json()) as ContactBody;
  } catch {
    return json({ error: 'bad request' }, 400);
  }

  if (typeof body.company_website === 'string' && body.company_website.trim() !== '') {
    return json({ ok: true }); // sessizce kabul et, kaydetme
  }

  if (!isText(body.name, 120)) return json({ error: 'Ad Soyad gerekli' }, 422);
  if (!isText(body.phone, 30)) return json({ error: 'Telefon gerekli' }, 422);
  if (!isEmail(body.email)) return json({ error: 'Geçerli bir e-posta girin' }, 422);
  if (!isText(body.message, 4000)) return json({ error: 'Mesaj gerekli' }, 422);

  const mailYapilandirildi = Boolean(env.RESEND_API_KEY && env.CONTACT_TO_EMAIL && env.MAIL_FROM);
  let mailGitti = false;

  if (mailYapilandirildi) {
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
      mailGitti = true;
    } catch (err) {
      console.error('iletisim maili gonderilemedi', err);
    }
  }

  try {
    await env.DB.prepare(
      'INSERT INTO messages (id, name, phone, email, message, mail_gitti) VALUES (?, ?, ?, ?, ?, ?)',
    )
      .bind(newId('mesaj'), body.name, body.phone, body.email, body.message, mailGitti ? 1 : 0)
      .run();
  } catch (err) {
    console.error('iletisim mesaji kaydedilemedi', err);
    // Ne kayıt ne de e-posta başarılıysa kullanıcıya hata döndürülür.
    if (!mailGitti) return json({ error: 'Gönderilemedi, lütfen telefonla ulaşın.' }, 502);
  }

  return json({ ok: true });
};
