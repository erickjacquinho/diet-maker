const BRAZIL_COUNTRY_CODE = '55';
const MAX_LOCAL_DIGITS = 11;

function getDigits(value: string | undefined): string {
  return value?.replace(/\D/g, '') ?? '';
}

function getLocalDigits(value: string | undefined): string {
  const digits = getDigits(value);
  const withoutCountryCode = digits.startsWith(BRAZIL_COUNTRY_CODE) && digits.length > MAX_LOCAL_DIGITS
    ? digits.slice(BRAZIL_COUNTRY_CODE.length)
    : digits;

  return withoutCountryCode.slice(0, MAX_LOCAL_DIGITS);
}

/**
 * Formats a Brazilian WhatsApp number while the user types.
 * The visible value intentionally stays local; the country code is added when opening WhatsApp.
 */
export function formatWhatsappContact(value: string | undefined): string {
  const localDigits = getLocalDigits(value);
  if (!localDigits) return '';

  if (localDigits.length <= 2) {
    return `(${localDigits}`;
  }

  const areaCode = localDigits.slice(0, 2);
  const subscriber = localDigits.slice(2);
  const prefixLength = localDigits.length > 10 ? 5 : 4;
  const prefix = subscriber.slice(0, prefixLength);
  const suffix = subscriber.slice(prefixLength);

  return `(${areaCode}) ${prefix}${suffix ? `-${suffix}` : ''}`;
}

/**
 * Returns a wa.me URL for a valid Brazilian landline or mobile number.
 * Accepts both local numbers and values that already include country code 55.
 */
export function getWhatsappUrl(value: string | undefined): string | null {
  const digits = getDigits(value);
  const localDigits = digits.startsWith(BRAZIL_COUNTRY_CODE) && digits.length > MAX_LOCAL_DIGITS
    ? digits.slice(BRAZIL_COUNTRY_CODE.length)
    : digits;

  if (localDigits.length !== 10 && localDigits.length !== 11) {
    return null;
  }

  return `https://wa.me/${BRAZIL_COUNTRY_CODE}${localDigits}`;
}
