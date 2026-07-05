/**
 * Guard Dog — Threat Scanner
 * Detects SQL injection, XSS, prompt injection, path traversal, and bot patterns.
 */

export type ThreatType =
  | 'sql_injection'
  | 'xss'
  | 'prompt_injection'
  | 'path_traversal'
  | 'bad_bot'
  | 'suspicious_header';

export type Severity = 'low' | 'medium' | 'high' | 'critical';

export interface ThreatResult {
  detected: boolean;
  threatType?: ThreatType;
  severity?: Severity;
  detail?: string;
}

// ─── Pattern Banks ────────────────────────────────────────────────────────────

const SQL_PATTERNS = [
  /(\bSELECT\b.*\bFROM\b|\bUNION\b.*\bSELECT\b|\bDROP\b.*\bTABLE\b|\bINSERT\b.*\bINTO\b|\bDELETE\b.*\bFROM\b)/i,
  /('|--|;|\/\*|\*\/|xp_|exec\s*\(|EXECUTE\s*\()/i,
  /(CAST\s*\(|CONVERT\s*\(|CHAR\s*\(|NCHAR\s*\()/i,
];

const XSS_PATTERNS = [
  /<script[\s\S]*?>[\s\S]*?<\/script>/i,
  /javascript\s*:/i,
  /on\w+\s*=\s*["']?[^"'>]*/i,
  /<iframe|<object|<embed|<link|<meta/i,
  /document\.(cookie|location|write)|window\.location/i,
  /eval\s*\(|setTimeout\s*\(|setInterval\s*\(/i,
];

const PROMPT_INJECTION_PATTERNS = [
  /ignore\s+(previous|all|above|prior)\s+(instructions?|prompts?|rules?|context)/i,
  /\b(system|assistant|user)\s*:\s*\[/i,
  /(jailbreak|DAN|do anything now|act as if you have no restrictions)/i,
  /forget\s+(everything|all|your)\s+(you.ve|previous|prior|instructions)/i,
  /(pretend|act)\s+(you\s+are|as if)\s+(a\s+)?(?!Aadisatv|spiritual|guide)/i,
  /(<\|system\|>|<\|user\|>|<\|assistant\|>|\[INST\]|\[\/INST\])/i,
  /reveal\s+(your\s+)?(system\s+)?(prompt|instructions|training)/i,
];

const PATH_TRAVERSAL_PATTERNS = [
  /\.\.[\/\\]/,
  /%2e%2e[%2f%5c]/i,
  /\.\.\%2f/i,
  /etc\/passwd|etc\/shadow|win\.ini|boot\.ini/i,
];

const BAD_BOT_AGENTS = [
  'sqlmap', 'nikto', 'nmap', 'masscan', 'zgrab', 'dirbuster',
  'gobuster', 'wfuzz', 'hydra', 'metasploit', 'nessus',
  'acunetix', 'burpsuite', 'w3af', 'havij', 'pangolin',
  'scrapy', 'python-requests/2.2', 'go-http-client/1.1',
  'curl/7.', 'libwww-perl', 'lwp-trivial',
];

// ─── Scan Functions ───────────────────────────────────────────────────────────

export function scanUserAgent(ua: string): ThreatResult {
  const lower = ua.toLowerCase();
  for (const bot of BAD_BOT_AGENTS) {
    if (lower.includes(bot)) {
      return {
        detected: true,
        threatType: 'bad_bot',
        severity: 'high',
        detail: `Matched bad bot pattern: ${bot}`,
      };
    }
  }
  return { detected: false };
}

export function scanText(text: string): ThreatResult {
  // SQL injection
  for (const pattern of SQL_PATTERNS) {
    if (pattern.test(text)) {
      return { detected: true, threatType: 'sql_injection', severity: 'critical', detail: text.slice(0, 120) };
    }
  }

  // XSS
  for (const pattern of XSS_PATTERNS) {
    if (pattern.test(text)) {
      return { detected: true, threatType: 'xss', severity: 'high', detail: text.slice(0, 120) };
    }
  }

  // Path traversal
  for (const pattern of PATH_TRAVERSAL_PATTERNS) {
    if (pattern.test(text)) {
      return { detected: true, threatType: 'path_traversal', severity: 'high', detail: text.slice(0, 120) };
    }
  }

  return { detected: false };
}

export function scanPrompt(text: string): ThreatResult {
  for (const pattern of PROMPT_INJECTION_PATTERNS) {
    if (pattern.test(text)) {
      return {
        detected: true,
        threatType: 'prompt_injection',
        severity: 'critical',
        detail: text.slice(0, 120),
      };
    }
  }
  // Also run general text scan
  return scanText(text);
}

export function scanUrl(url: string): ThreatResult {
  const decoded = decodeURIComponent(url);
  return scanText(decoded);
}
