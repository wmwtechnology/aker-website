// =========================================================
// AKER OSGB - R2 dosya deposu
// =========================================================
// Panelden yüklenen görseller ve başvuru özgeçmişleri R2'de
// saklanır. Görseller /img/uploads/<anahtar> adresinden servis
// edilir; özgeçmişler yalnızca oturum açmış yöneticiye açılır.
// =========================================================

import type { Env } from './env.ts';

/** İzin verilen görsel türleri ve dosya uzantıları. */
const IMAGE_TYPES: Record<string, string> = {
  'image/webp': 'webp',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/svg+xml': 'svg',
};

/** Yükleme sınırları. */
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_CV_BYTES = 8 * 1024 * 1024;

export interface UploadResult {
  ok: boolean;
  yol?: string;
  anahtar?: string;
  hata?: string;
}

function randomKey(): string {
  return `${Date.now().toString(36)}-${crypto.randomUUID().slice(0, 8)}`;
}

/** Dosya adını güvenli hâle getirir (yalnızca gösterim amaçlı saklanır). */
export function safeName(name: string): string {
  return name.replace(/[^\w.\-() ]+/g, '_').slice(0, 120);
}

export async function putImage(env: Env, file: File): Promise<UploadResult> {
  const uzanti = IMAGE_TYPES[file.type];
  if (!uzanti) return { ok: false, hata: 'Yalnızca WebP, JPEG, PNG, GIF veya SVG yükleyebilirsiniz.' };
  if (file.size > MAX_IMAGE_BYTES) return { ok: false, hata: 'Görsel en fazla 5 MB olabilir.' };
  if (file.size === 0) return { ok: false, hata: 'Dosya boş.' };

  const anahtar = `gorsel/${randomKey()}.${uzanti}`;
  await env.MEDIA.put(anahtar, await file.arrayBuffer(), {
    httpMetadata: { contentType: file.type, cacheControl: 'public, max-age=31536000, immutable' },
  });

  return { ok: true, yol: `/img/uploads/${anahtar}`, anahtar };
}

export async function putCv(env: Env, file: File): Promise<UploadResult> {
  const pdfMi = file.type === 'application/pdf' || /\.pdf$/i.test(file.name);
  if (!pdfMi) return { ok: false, hata: 'Özgeçmişi yalnızca PDF olarak yükleyebilirsiniz.' };
  if (file.size > MAX_CV_BYTES) return { ok: false, hata: 'Özgeçmiş en fazla 8 MB olabilir.' };
  if (file.size === 0) return { ok: false, hata: 'Dosya boş.' };

  const anahtar = `ozgecmis/${randomKey()}.pdf`;
  await env.MEDIA.put(anahtar, await file.arrayBuffer(), {
    httpMetadata: { contentType: 'application/pdf' },
  });

  return { ok: true, anahtar };
}

export async function deleteObject(env: Env, anahtar: string): Promise<void> {
  await env.MEDIA.delete(anahtar);
}
