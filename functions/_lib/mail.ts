export interface MailEnv {
  /** Resend API anahtarı. */
  RESEND_API_KEY: string;
  /** Virgülle ayrılmış alıcı adresleri. */
  CONTACT_TO_EMAIL: string;
  /** Gönderen adresi (Resend'de doğrulanmış alan adı). */
  MAIL_FROM: string;
}

export interface MailMessage {
  subject: string;
  html: string;
  replyTo?: string;
}

/** Resend HTTP API üzerinden tek bir e-posta gönderir. 2xx dışında hata fırlatır. */
export async function sendMail(env: MailEnv, { subject, html, replyTo }: MailMessage): Promise<void> {
  const to = env.CONTACT_TO_EMAIL.split(',')
    .map((address) => address.trim())
    .filter(Boolean);

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: env.MAIL_FROM,
      to,
      subject,
      html,
      ...(replyTo ? { reply_to: replyTo } : {}),
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`Resend ${res.status}: ${detail}`);
  }
}

const ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

/** Kullanıcı girdisinin e-posta gövdesine işaretleme enjekte etmesini engeller. */
export function esc(value: unknown): string {
  return String(value).replace(/[&<>"']/g, (char) => ESCAPES[char] ?? char);
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isEmail(value: unknown): value is string {
  return typeof value === 'string' && value.length <= 254 && EMAIL_RE.test(value);
}

export function isText(value: unknown, max: number): value is string {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= max;
}
