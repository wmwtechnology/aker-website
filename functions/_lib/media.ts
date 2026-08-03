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

/**
 * Görsel başlığından genişlik ve yükseklik okur.
 *
 * Boyut, dosya adına gömülür (`...-800x600.webp`) ve sayfa üretilirken
 * `width`/`height` niteliğine dönüşür; böylece görsel yüklenirken
 * yerleşim kaymaz. Okunamayan biçimlerde boyut atlanır.
 */
export function gorselBoyutu(bytes: Uint8Array): { width: number; height: number } | null {
  const gor = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const ascii = (bas: number, son: number): string =>
    String.fromCharCode(...bytes.subarray(bas, son));

  // PNG: IHDR başlığındaki iki 32 bitlik değer
  if (bytes.length > 24 && ascii(1, 4) === 'PNG') {
    return { width: gor.getUint32(16), height: gor.getUint32(20) };
  }

  // GIF: başlıktan sonra iki 16 bitlik küçük sonlu değer
  if (bytes.length > 10 && ascii(0, 3) === 'GIF') {
    return { width: gor.getUint16(6, true), height: gor.getUint16(8, true) };
  }

  // WebP: VP8 / VP8L / VP8X biçimleri
  if (bytes.length > 30 && ascii(0, 4) === 'RIFF' && ascii(8, 12) === 'WEBP') {
    const bicim = ascii(12, 16);
    if (bicim === 'VP8 ') {
      return { width: gor.getUint16(26, true) & 0x3fff, height: gor.getUint16(28, true) & 0x3fff };
    }
    if (bicim === 'VP8L') {
      const b = gor.getUint32(21, true);
      return { width: (b & 0x3fff) + 1, height: ((b >> 14) & 0x3fff) + 1 };
    }
    if (bicim === 'VP8X') {
      const en = 1 + (bytes[24]! | (bytes[25]! << 8) | (bytes[26]! << 16));
      const boy = 1 + (bytes[27]! | (bytes[28]! << 8) | (bytes[29]! << 16));
      return { width: en, height: boy };
    }
    return null;
  }

  // JPEG: SOF çerçeve işaretçisi aranır
  if (bytes.length > 4 && bytes[0] === 0xff && bytes[1] === 0xd8) {
    let konum = 2;
    while (konum + 9 < bytes.length) {
      if (bytes[konum] !== 0xff) {
        konum += 1;
        continue;
      }
      const isaret = bytes[konum + 1]!;
      // SOF0-SOF3, SOF5-SOF7, SOF9-SOF11, SOF13-SOF15
      if (isaret >= 0xc0 && isaret <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(isaret)) {
        return { height: gor.getUint16(konum + 5), width: gor.getUint16(konum + 7) };
      }
      konum += 2 + gor.getUint16(konum + 2);
    }
  }

  return null;
}

export async function putImage(env: Env, file: File): Promise<UploadResult> {
  const uzanti = IMAGE_TYPES[file.type];
  if (!uzanti) return { ok: false, hata: 'Yalnızca WebP, JPEG, PNG, GIF veya SVG yükleyebilirsiniz.' };
  if (file.size > MAX_IMAGE_BYTES) return { ok: false, hata: 'Görsel en fazla 5 MB olabilir.' };
  if (file.size === 0) return { ok: false, hata: 'Dosya boş.' };

  const veri = await file.arrayBuffer();
  const boyut = uzanti === 'svg' ? null : gorselBoyutu(new Uint8Array(veri));
  const olcu = boyut ? `-${boyut.width}x${boyut.height}` : '';

  const anahtar = `gorsel/${randomKey()}${olcu}.${uzanti}`;
  await env.MEDIA.put(anahtar, veri, {
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
