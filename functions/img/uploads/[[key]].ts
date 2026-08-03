// Panelden yüklenen görselleri R2'den servis eder.
// Anahtarlar rastgeledir; içerik herkese açıktır ve uzun süre önbelleklenir.

import type { Ctx } from '../../_lib/env.ts';

export const onRequestGet = async ({ env, params }: Ctx): Promise<Response> => {
  const raw = params['key'];
  const anahtar = Array.isArray(raw) ? raw.join('/') : (raw ?? '');

  if (!anahtar || anahtar.includes('..')) return new Response('Bulunamadı', { status: 404 });

  const nesne = await env.MEDIA.get(anahtar);
  if (!nesne) return new Response('Bulunamadı', { status: 404 });

  const headers = new Headers();
  nesne.writeHttpMetadata(headers);
  headers.set('etag', nesne.httpEtag);
  headers.set('cache-control', 'public, max-age=31536000, immutable');

  return new Response(nesne.body, { headers });
};
