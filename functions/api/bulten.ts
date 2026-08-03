// =========================================================
// AKER OSGB - E-posta bülteni aboneliği (herkese açık)
// =========================================================
// Abonelikler veri tabanına yazılır ve yönetim panelinden
// dışa aktarılabilir. Aynı adres ikinci kez gönderilirse
// yeni kayıt oluşmaz, kullanıcıya yine olumlu yanıt döner.
// =========================================================

import { checkOrigin, json } from '../_lib/http.ts';
import { isEmail } from '../_lib/mail.ts';
import { clientIp } from '../_lib/auth.ts';
import { hizSiniri } from '../_lib/ratelimit.ts';
import type { Ctx } from '../_lib/env.ts';

export const onRequestPost = async ({ request, env }: Ctx): Promise<Response> => {
  if (!checkOrigin(request)) return json({ error: 'forbidden' }, 403);

  let body: { email?: unknown; company_website?: unknown };
  try {
    body = (await request.json()) as { email?: unknown; company_website?: unknown };
  } catch {
    return json({ error: 'bad request' }, 400);
  }

  if (typeof body.company_website === 'string' && body.company_website.trim() !== '') {
    return json({ ok: true });
  }

  if (!isEmail(body.email)) return json({ error: 'Geçerli bir e-posta girin.' }, 422);

  const limit = await hizSiniri(env, `bulten:${clientIp(request)}`, 5, 10 * 60 * 1000);
  if (!limit.izinli) {
    return json({ error: 'Çok fazla deneme yaptınız, biraz sonra tekrar deneyin.' }, 429);
  }

  try {
    await env.DB.prepare('INSERT OR IGNORE INTO subscribers (email) VALUES (?)')
      .bind(body.email.toLowerCase())
      .run();
  } catch (err) {
    console.error('bulten kaydi basarisiz', err);
    return json({ error: 'Kaydedilemedi, lütfen tekrar deneyin.' }, 502);
  }

  return json({ ok: true });
};
