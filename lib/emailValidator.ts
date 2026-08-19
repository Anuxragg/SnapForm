// Standard Email Validation with Real-Time DNS MX & Disposable Provider Fingerprinting
import dns from 'dns/promises';
import disposableDomainsList from 'disposable-email-domains';

// 1. 5,000+ Verified Disposable Email Domains
const DISPOSABLE_DOMAINS_SET = new Set<string>(
  (disposableDomainsList as string[]).map((d) => d.toLowerCase().trim())
);

// 2. Known Disposable Mail Exchange (MX) Server Fingerprints
const DISPOSABLE_MX_FINGERPRINTS = [
  'temp-mail',
  'tempmail',
  'burnermail',
  'mailinator',
  'yopmail',
  'guerrillamail',
  'sharklasers',
  '1secmail',
  'inboxkitten',
  'dropmail',
  'dispostable',
  'mail.tm',
  'tmailor',
  'throwaway',
  'minuteinbox',
  'fakemail',
  'mohmal',
  'crazymailing',
  'generator.email',
  'emailondeck',
  'trashmail',
  'mailpoof',
  'nada.ltd',
  'getnada',
  'anonbox',
  'spambox',
  'tempr',
  'maildrop',
  'chitthi',
];

// 3. Common Burner Keywords (Heuristic pattern detection for new/unlisted domains)
const BURNER_KEYWORDS = [
  'tempmail',
  'temp-mail',
  'burnermail',
  'disposable',
  '10min',
  '10minute',
  'throwaway',
  'fakemail',
  'fakeinbox',
  'trashmail',
  'guerrillamail',
  'sharklaser',
  'mailinator',
  'yopmail',
  'mohmal',
  'inboxkitten',
  'minuteinbox',
  '1secmail',
  'dropmail',
  'dispostable',
  'generator.email',
  'emailondeck',
  'spambox',
  'discard.email',
  'mytemp',
  'tmailor',
  'chitthi',
  'tempail',
  'anonbox',
  'crazymailing',
  'getairmail',
  'maildrop',
  'nada.ltd',
  'getnada',
  'burner',
  'tempr',
  'mailpoof',
  'spam4',
];

export interface EmailValidationResult {
  isValid: boolean;
  error?: string;
  domain?: string;
}

/**
 * Synchronous fast check (RFC syntax, 5,000+ domain database, and keyword heuristics).
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

  // 4. Exact match in 5,000+ disposable domain database
  if (DISPOSABLE_DOMAINS_SET.has(domain)) {
    return {
      isValid: false,
      error: 'Disposable, temporary, or burner email addresses are not permitted. Please use a standard personal or work email.',
      domain,
    };
  }

  // 5. Subdomain check (e.g. sub.mailinator.com)
  for (let i = 1; i < domainParts.length - 1; i++) {
    const parentDomain = domainParts.slice(i).join('.');
    if (DISPOSABLE_DOMAINS_SET.has(parentDomain)) {
      return {
        isValid: false,
        error: 'Disposable, temporary, or burner email addresses are not permitted. Please use a standard personal or work email.',
        domain,
      };
    }
  }

  // 6. Heuristic Keyword Matching
  const domainLower = domain.toLowerCase();
  for (const keyword of BURNER_KEYWORDS) {
    if (domainLower.includes(keyword)) {
      return {
        isValid: false,
        error: 'Disposable, temporary, or burner email addresses are not permitted. Please use a standard personal or work email.',
        domain,
      };
    }
  }

  return { isValid: true, domain };
}

/**
 * Real-Time Async DNS MX & Mail Server Fingerprinting (Used by ChatGPT / OpenAI / Stripe).
 * Performs a live DNS MX lookup on the domain to detect burner mail servers and verify real mail routing.
 */
export async function validateStandardEmailAsync(email: string): Promise<EmailValidationResult> {
  // First run fast synchronous rules
  const syncResult = validateStandardEmail(email);
  if (!syncResult.isValid || !syncResult.domain) {
    return syncResult;
  }

  const domain = syncResult.domain;

  // Major known legitimate email domains can skip external DNS latency
  const trustedMajorDomains = new Set([
    'gmail.com',
    'googlemail.com',
    'google.com',
    'yahoo.com',
    'yahoo.co.uk',
    'yahoo.fr',
    'yahoo.co.in',
    'outlook.com',
    'hotmail.com',
    'live.com',
    'msn.com',
    'icloud.com',
    'me.com',
    'mac.com',
    'aol.com',
    'proton.me',
    'protonmail.com',
    'zoho.com',
    'fastmail.com',
  ]);

  if (trustedMajorDomains.has(domain)) {
    return { isValid: true, domain };
  }

  try {
    // Live DNS MX Lookup
    const mxRecords = await dns.resolveMx(domain);

    if (!mxRecords || mxRecords.length === 0) {
      return {
        isValid: false,
        error: `The email domain "${domain}" has no active mail server (MX records). Please provide a valid email.`,
        domain,
      };
    }

    // Check MX Server Hostnames against known disposable mail exchangers
    for (const record of mxRecords) {
      const exchangeHost = (record.exchange || '').toLowerCase();
      
      for (const fingerprint of DISPOSABLE_MX_FINGERPRINTS) {
        if (exchangeHost.includes(fingerprint)) {
          return {
            isValid: false,
            error: 'Disposable, temporary, or burner email infrastructure detected. Please use a standard personal or work email.',
            domain,
          };
        }
      }
    }

    return { isValid: true, domain };
  } catch (dnsErr: any) {
    // If DNS resolution fails (NXDOMAIN / ENOTFOUND), domain does not exist or has no mail servers
    if (dnsErr.code === 'ENOTFOUND' || dnsErr.code === 'ENODATA' || dnsErr.code === 'SERVFAIL') {
      return {
        isValid: false,
        error: `The email domain "${domain}" does not exist or cannot receive emails.`,
        domain,
      };
    }

    // On network timeout, fallback to synchronous validation result
    return { isValid: true, domain };
  }
}
