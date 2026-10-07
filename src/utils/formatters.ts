/**
 * Masks and input helpers for Whirlpool Special Days
 */

/**
 * Formats invoice code as A1-B2-C3-D4 (4 blocks of 2 chars separated by hyphens)
 */
export function formatInvoiceCode(value: string): string {
  const cleaned = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 8);
  const parts: string[] = [];
  for (let i = 0; i < cleaned.length; i += 2) {
    parts.push(cleaned.slice(i, i + 2));
  }
  return parts.join('-');
}

/**
 * Validates invoice code format (8 alphanumeric chars)
 */
export function isValidInvoiceCode(value: string): boolean {
  const cleaned = value.replace(/[^a-zA-Z0-9]/g, '');
  return cleaned.length === 8;
}

/**
 * Formats distributor promo code as WP-XXXXXX (6 alphanumeric after WP-)
 */
export function formatPromoCode(value: string): string {
  let cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (cleaned.startsWith('WP')) {
    cleaned = cleaned.slice(2);
  }
  cleaned = cleaned.slice(0, 6);
  if (cleaned.length === 0) return 'WP-';
  return `WP-${cleaned}`;
}

/**
 * Validates promo code (must be WP- + 6 characters)
 */
export function isValidPromoCode(value: string): boolean {
  const match = value.match(/^WP-[A-Z0-9]{6}$/i);
  return !!match;
}

/**
 * Formats phone number into 8 digits with hyphen: 7XXX-XXXX
 */
export function formatPhoneNumber(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 4) return digits;
  return `${digits.slice(0, 4)}-${digits.slice(4)}`;
}

export function isValidPhoneNumber(value: string): boolean {
  const digits = value.replace(/\D/g, '');
  // Bolivian mobile numbers are 8 digits starting with 6 or 7
  return digits.length === 8 && /^[67]/.test(digits);
}

/**
 * Formats CI: numbers followed by optional department extension (e.g., 8765432-SC)
 */
export function formatCI(value: string): string {
  const upper = value.toUpperCase().replace(/[^0-9A-Z-]/g, '').slice(0, 12);
  return upper;
}

export function isValidCI(value: string): boolean {
  const cleaned = value.trim();
  return cleaned.length >= 6;
}

export function formatCurrencyBOB(amount: number): string {
  return `Bs. ${amount.toLocaleString('es-BO')}`;
}

export function formatFriendlyDate(dateString: string): string {
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString('es-BO', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
}
