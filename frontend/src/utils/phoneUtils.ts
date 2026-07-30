// Auto-format Uzbek phone numbers: e.g. "903503304" or "+998903503304" -> "+998 90 350 33 04"
export function formatUzPhone(input: string): string {
  if (!input) return '';

  // Extract digits
  let digits = input.replace(/\D/g, '');

  // Strip country code if user typed 998
  if (digits.startsWith('998')) {
    digits = digits.slice(3);
  }

  // Cap subscriber number to 9 digits
  digits = digits.slice(0, 9);

  let formatted = '+998';
  if (digits.length > 0) {
    formatted += ' ' + digits.slice(0, 2);
  }
  if (digits.length > 2) {
    formatted += ' ' + digits.slice(2, 5);
  }
  if (digits.length > 5) {
    formatted += ' ' + digits.slice(5, 7);
  }
  if (digits.length > 7) {
    formatted += ' ' + digits.slice(7, 9);
  }

  return formatted;
}

// Normalize phone number for clean matching regardless of spaces, pluses, etc.
export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  return digits.startsWith('998') ? digits : '998' + digits;
}
