import { json } from '../../_lib/http.ts';
import { clearSessionCookie, isAuthenticated, isSecureRequest } from '../../_lib/auth.ts';
import type { Ctx } from '../../_lib/env.ts';

/** Panel açılışında oturumun hâlâ geçerli olup olmadığını sorar. */
export const onRequestGet = async ({ request, env }: Ctx): Promise<Response> => {
  const acik = await isAuthenticated(request, env);
  return json({ oturum: acik });
};

/** Çıkış: çerezi geçersiz kılar. */
export const onRequestDelete = async ({ request }: Ctx): Promise<Response> =>
  json({ ok: true }, 200, { 'Set-Cookie': clearSessionCookie(isSecureRequest(request)) });
