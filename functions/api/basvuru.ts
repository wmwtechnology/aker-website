// =========================================================
// AKER OSGB - İş başvurusu ucu (herkese açık)
// =========================================================
// Başvurular D1'e yazılır, özgeçmiş R2'ye kaydedilir ve
// yapılandırılmışsa bildirim e-postası gönderilir.
// =========================================================

import { checkOrigin, json } from '../_lib/http.ts';
import { esc, isEmail, isText, sendMail } from '../_lib/mail.ts';
import { putCv, safeName } from '../_lib/media.ts';
import { newId } from '../_lib/content.ts';
import type { Ctx } from '../_lib/env.ts';

export const onRequestPost = async ({ request, env }: Ctx): Promise<Response> => {
  if (!checkOrigin(request)) return json({ error: 'forbidden' }, 403);

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return json({ error: 'bad request' }, 400);
  }

  const alan = (name: string): string => String(form.get(name) ?? '').trim();

  // Bal küpü: gerçek kullanıcılar boş bırakır.
  if (alan('company_website') !== '') return json({ ok: true });

  const name = alan('name');
  const phone = alan('phone');
  const email = alan('email');
  const message = alan('message');
  const careerId = alan('careerId');

  if (!isText(name, 120)) return json({ error: 'Ad Soyad gerekli' }, 422);
  if (!isText(phone, 30)) return json({ error: 'Telefon gerekli' }, 422);
  if (!isEmail(email)) return json({ error: 'Geçerli bir e-posta girin' }, 422);
  if (!isText(message, 4000)) return json({ error: 'Mesaj gerekli' }, 422);

  const ilan = careerId
    ? await env.DB.prepare('SELECT title FROM careers WHERE id = ?').bind(careerId).first<{ title: string }>()
    : null;

  let cvKey = '';
  let cvFileName = '';
  // workers-types FormData değerlerini string olarak daraltıyor; dosya için açıkça dönüştürülür.
  const cv = form.get('cv') as unknown as File | string | null;
  if (cv && typeof cv !== 'string' && cv.size > 0) {
    const sonuc = await putCv(env, cv);
    if (!sonuc.ok) return json({ error: sonuc.hata }, 422);
    cvKey = sonuc.anahtar ?? '';
    cvFileName = safeName(cv.name);
  }

  await env.DB.prepare(
    `INSERT INTO applications (id, careerId, careerTitle, name, phone, email, message, cvFileName, cvFileType, cvKey)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(newId('basvuru'), careerId, ilan?.title ?? '', name, phone, email, message, cvFileName, 'application/pdf', cvKey)
    .run();

  // E-posta bildirimi yapılandırılmamışsa başvuru yine de kaydedilmiş olur.
  if (env.RESEND_API_KEY && env.CONTACT_TO_EMAIL && env.MAIL_FROM) {
    try {
      await sendMail(env, {
        subject: `İş başvurusu — ${name}`,
        replyTo: email,
        html:
          '<h2>Yeni iş başvurusu</h2>' +
          `<p><b>İlan:</b> ${esc(ilan?.title ?? '-')}</p>` +
          `<p><b>Ad Soyad:</b> ${esc(name)}</p>` +
          `<p><b>Telefon:</b> ${esc(phone)}</p>` +
          `<p><b>E-posta:</b> ${esc(email)}</p>` +
          `<p><b>Özgeçmiş:</b> ${esc(cvFileName || 'yüklenmedi')}</p>` +
          `<p><b>Mesaj:</b><br>${esc(message).replace(/\n/g, '<br>')}</p>` +
          '<p>Başvuru yönetim panelinden görüntülenebilir.</p>',
      });
    } catch (err) {
      console.error('basvuru maili gonderilemedi', err);
    }
  }

  return json({ ok: true });
};
