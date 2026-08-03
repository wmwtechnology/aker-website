import type { MailEnv } from './mail.ts';

export interface Env extends MailEnv {
  /** İçerik veri tabanı. */
  DB: D1Database;
  /** Panelden yüklenen görseller ve özgeçmişler. */
  MEDIA: R2Bucket;
  /** Yönetim paneli şifresi (Pages secret). */
  ADMIN_PASSWORD: string;
  /** Oturum çerezini imzalayan anahtar (Pages secret). */
  SESSION_SECRET: string;
  SITE_ORIGIN?: string;
}

/** Pages Functions bağlam tipi. */
export interface Ctx {
  request: Request;
  env: Env;
  params: Record<string, string | string[]>;
  next: () => Promise<Response>;
  waitUntil: (promise: Promise<unknown>) => void;
}
