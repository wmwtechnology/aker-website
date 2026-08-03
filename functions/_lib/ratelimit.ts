// =========================================================
// AKER OSGB - Form gönderimlerinde hız sınırı
// =========================================================
// Sitedeki "Ben robot değilim" kutusu gerçek bir doğrulama
// değildir; bot koruması sunucu tarafında burada yapılır.
// IP başına, sabit bir zaman penceresinde izin verilen gönderim
// sayısı sınırlanır.
// =========================================================

import type { Env } from './env.ts';

export interface LimitSonuc {
  izinli: boolean;
  /** Sınır aşıldıysa kaç saniye sonra tekrar denenebilir. */
  bekle: number;
}

/**
 * @param anahtar  Sınırlanacak birim (örn. `iletisim:1.2.3.4`)
 * @param limit    Pencere başına izin verilen istek sayısı
 * @param pencereMs Pencere uzunluğu
 */
export async function hizSiniri(
  env: Env,
  anahtar: string,
  limit: number,
  pencereMs: number,
): Promise<LimitSonuc> {
  const simdi = Date.now();

  try {
    const kayit = await env.DB.prepare('SELECT sayac, pencere FROM form_limits WHERE anahtar = ?')
      .bind(anahtar)
      .first<{ sayac: number; pencere: number }>();

    // Pencere dolmuşsa ya da kayıt yoksa sayaç sıfırdan başlar.
    if (!kayit || simdi - kayit.pencere > pencereMs) {
      await env.DB.prepare(
        `INSERT INTO form_limits (anahtar, sayac, pencere) VALUES (?, 1, ?)
         ON CONFLICT(anahtar) DO UPDATE SET sayac = 1, pencere = ?`,
      )
        .bind(anahtar, simdi, simdi)
        .run();
      return { izinli: true, bekle: 0 };
    }

    if (kayit.sayac >= limit) {
      return { izinli: false, bekle: Math.ceil((pencereMs - (simdi - kayit.pencere)) / 1000) };
    }

    await env.DB.prepare('UPDATE form_limits SET sayac = sayac + 1 WHERE anahtar = ?').bind(anahtar).run();
    return { izinli: true, bekle: 0 };
  } catch (err) {
    // Sınır kontrolü çalışmazsa gönderim engellenmez; amaç kötüye
    // kullanımı yavaşlatmak, meşru kullanıcıyı durdurmak değil.
    console.error('hiz siniri kontrolu basarisiz', err);
    return { izinli: true, bekle: 0 };
  }
}
