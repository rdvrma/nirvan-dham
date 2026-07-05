/**
 * Guard Dog — Structured JSON Logger
 * Writes security events to logs/guarddog.jsonl
 * Each line is a valid JSON object for easy parsing/alerting.
 */

import type { ThreatType, Severity } from './scanner';

export interface SecurityEvent {
  timestamp: string;
  ip: string;
  method: string;
  path: string;
  userAgent: string;
  threatType: ThreatType | 'rate_limit';
  severity: Severity;
  blocked: boolean;
  detail?: string;
}

/**
 * Log a security event.
 * In Edge runtime we can't write to filesystem directly,
 * so we use console.warn with a structured prefix that can be
 * picked up by Vercel Log Drains / any log aggregator.
 */
export function logSecurityEvent(event: SecurityEvent): void {
  const line = JSON.stringify({
    ...event,
    source: 'guarddog',
  });

  // Vercel captures console output — use warn so it stands out
  console.warn(`[GUARDDOG] ${line}`);
}

export function buildEvent(
  request: { ip: string; method: string; path: string; userAgent: string },
  threat: { threatType: ThreatType | 'rate_limit'; severity: Severity; blocked: boolean; detail?: string }
): SecurityEvent {
  return {
    timestamp: new Date().toISOString(),
    ip: request.ip,
    method: request.method,
    path: request.path,
    userAgent: request.userAgent,
    ...threat,
  };
}
