import { checkOrigin, json } from '../../_lib/http.ts';
import {
  checkAttempts,
  clearFailures,
  clientIp,
  createSessionCookie,
  isSecureRequest,
  passwordMatches,
  recordFailure,
} from '../../_lib/auth.ts';
import type { Ctx } from '../../_lib/env.ts';

export const onRequestPost = async ({ request, env }: Ctx): Promise<Response> => {
  if (!checkOrigin(request)) return json({ error: 'forbidden' }, 403);
  if (!env.ADMIN_PASSWORD || !env.SESSION_SECRET) {
    return json({ error: 'Yönetim paneli yapılandırılmamış.' }, 503);
  }

  const ip = clientIp(request);
  const attempts = await checkAttempts(env, ip);
  if (!attempts.izinli) {
    return json({ error: 'Çok fazla hatalı deneme. 15 dakika sonra tekrar deneyin.' }, 429);
  }

  let body: { password?: unknown };
  try {
    body = (await request.json()) as { password?: unknown };
  } catch {
    return json({ error: 'bad request' }, 400);
  }

  if (!passwordMatches(body.password, env.ADMIN_PASSWORD)) {
    await recordFailure(env, ip);
    // Deneme hızını düşürmek için kısa gecikme.
    await new Promise((resolve) => setTimeout(resolve, 400));
    return json({ error: 'Şifre hatalı.' }, 401);
  }

  await clearFailures(env, ip);
  const cookie = await createSessionCookie(env, isSecureRequest(request));
  return json({ ok: true }, 200, { 'Set-Cookie': cookie });
};
