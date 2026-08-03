// =========================================================
// AKER OSGB - Küçük DOM yardımcıları
// =========================================================

/** Tek eleman seçer; tipini çağıran belirler. */
export function qs<T extends Element = HTMLElement>(
  selector: string,
  root: ParentNode = document,
): T | null {
  return root.querySelector<T>(selector);
}

/** Eşleşen tüm elemanları dizi olarak döner. */
export function qsa<T extends Element = HTMLElement>(
  selector: string,
  root: ParentNode = document,
): T[] {
  return Array.from(root.querySelectorAll<T>(selector));
}

/** Kimliğe göre eleman seçer. */
export function byId<T extends HTMLElement = HTMLElement>(id: string): T | null {
  return document.getElementById(id) as T | null;
}

/** Metni HTML gövdesine gömülebilecek biçimde kaçırır. */
export function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/** Metni HTML niteliği içine gömülebilecek biçimde kaçırır. */
export function escapeAttr(value: unknown): string {
  return escapeHtml(value).replace(/"/g, '&quot;');
}

/** Basit e-posta biçim denetimi. */
export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/** Uyarı kutusunu gösterir ve birkaç saniye sonra gizler. */
export function showAlert(box: HTMLElement | null, message: string): void {
  if (!box) return;
  box.textContent = message;
  box.style.display = 'block';
  window.setTimeout(() => {
    box.style.display = 'none';
  }, 4000);
}
