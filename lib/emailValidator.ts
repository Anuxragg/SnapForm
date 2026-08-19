// Standard Email Validation & Disposable Domain Blocker

// List of disposable/temporary/burner email domains
const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com',
  'tempmail.com',
  'temp-mail.org',
  '10minutemail.com',
  'guerrillamail.com',
  'guerrillamail.net',
  'guerrillamail.org',
  'sharklasers.com',
  'trashmail.com',
  'trashmail.net',
  'yopmail.com',
  'yopmail.net',
  'yopmail.fr',
  'throwawaymail.com',
  'fakemailgenerator.com',
  'dispostable.com',
  'getairmail.com',
  'maildrop.cc',
  'getnada.com',
  'inboxkitten.com',
  'mohmal.com',
  'burnermail.io',
  'crazymailing.com',
  'generator.email',
  'emailondeck.com',
  'mytemp.email',
  'minuteinbox.com',
  'tempmailaddress.com',
  'fakeinbox.com',
  'tempail.com',
  'discard.email',
  'spambox.us',
  'mytempemail.com',
]);

export interface EmailValidationResult {
  isValid: boolean;
  error?: string;
  domain?: string;
}

/**
 * Validates whether an email address is a standard, non-disposable email format.
 */
export function validateStandardEmail(email: string): EmailValidationResult {
  if (!email || typeof email !== 'string') {
    return { isValid: false, error: 'Email address is required' };
  }

  const trimmed = email.trim().toLowerCase();

  // 1. Standard RFC 5322 Compliant Regex Check
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  if (!emailRegex.test(trimmed)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }

  const parts = trimmed.split('@');
  if (parts.length !== 2) {
    return { isValid: false, error: 'Invalid email address format' };
  }

  const [localPart, domain] = parts;

  // 2. Length constraints
  if (localPart.length > 64 || trimmed.length > 254) {
    return { isValid: false, error: 'Email address exceeds maximum length' };
  }

  // 3. TLD validation (must have at least 2 characters)
  const domainParts = domain.split('.');
  const tld = domainParts[domainParts.length - 1];
  if (!tld || tld.length < 2 || /^\d+$/.test(tld)) {
    return { isValid: false, error: 'Please use an email with a valid domain extension' };
  }

  // 4. Block disposable/temporary email providers
  if (DISPOSABLE_DOMAINS.has(domain)) {
    return {
      isValid: false,
      error: 'Disposable/temporary email addresses are not accepted. Please use a standard email provider.',
      domain,
    };
  }

  return { isValid: true, domain };
}
