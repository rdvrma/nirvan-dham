import { createHash } from 'node:crypto';

export interface GroupSettings { autoReply: boolean; moderation: boolean }
export interface GroupAccess { userIsAdmin: boolean; botIsAdmin: boolean; canDelete: boolean; canRestrict: boolean }
export interface SpamRecord {
  recent: { time: number; fingerprint: string }[];
  strikes: number;
  lastViolation: number;
}
export interface ModerationAction {
  chatId: number; userId: number; messageId: number;
  action: 'warn' | 'mute' | 'block'; reason: 'scam-promotion' | 'repeated-links' | 'flood';
  until: number;
}
export interface ModerationEvent extends ModerationAction { time: number; applied: boolean }
export interface GroupRuntime {
  settings?: Record<string, GroupSettings>;
  spam?: Record<string, SpamRecord>;
  audit?: ModerationEvent[];
  intakeUsage?: Record<string, { day: string; count: number; recent: number[] }>;
}

/** Language names come from ICU, never from instructions supplied in chat. */
export function languageName(code: string): string | null {
  if (!/^[a-z]{2,3}(?:-[A-Z]{2})?$/.test(code)) return null;
  try {
    const name = new Intl.DisplayNames(['en'], { type: 'language', fallback: 'none' }).of(code);
    return name && name !== code ? name : null;
  } catch { return null; }
}

/** Bounded separate budget: even non-question traffic can incur classification cost. */
export function reserveGroupIntake(runtime: GroupRuntime, userId: number, now: number): boolean {
  const day = new Date(now).toISOString().slice(0, 10);
  const counters = runtime.intakeUsage ??= {};
  for (const [key, value] of Object.entries(counters)) if (value.day !== day) delete counters[key];
  const user = counters[String(userId)] ??= { day, count: 0, recent: [] };
  const total = counters.global ??= { day, count: 0, recent: [] };
  user.recent = user.recent.filter(time => now - time < 60_000);
  if (user.count >= 90 || user.recent.length >= 10 || total.count >= 600) return false;
  user.count++; total.count++; user.recent.push(now);
  return true;
}

/** Conservative rules: links alone and unfamiliar languages are never a violation. */
export function inspectSpam(runtime: GroupRuntime, input: {
  chatId: number; userId: number; messageId: number; text: string; links?: string[]; now: number;
}): ModerationAction | null {
  const records = runtime.spam ??= {};
  for (const [key, value] of Object.entries(records)) {
    const last = value.recent.at(-1)?.time ?? value.lastViolation;
    if (input.now - last > 86_400_000) delete records[key];
  }
  // Bound memory for a public group even if many accounts send one message each.
  if (Object.keys(records).length >= 1000) {
    const oldest = Object.entries(records).sort((a, b) => (a[1].recent.at(-1)?.time ?? 0) - (b[1].recent.at(-1)?.time ?? 0))[0];
    if (oldest) delete records[oldest[0]];
  }
  const key = `${input.chatId}:${input.userId}`;
  const record = records[key] ??= { recent: [], strikes: 0, lastViolation: 0 };
  const normalized = input.text.normalize('NFKC').replace(/[\u200B-\u200D\uFEFF]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
  const fingerprint = createHash('sha256').update(normalized).digest('hex').slice(0, 24);
  record.recent = record.recent.filter(item => input.now - item.time < 60_000).slice(-11);
  record.recent.push({ time: input.now, fingerprint });
  const hasLink = /(?:https?:\/\/|www\.|t\.me\/)/i.test(normalized) || !!input.links?.length;
  const promotion = /(?:guaranteed\s+(?:profit|returns?)|double\s+your\s+money|free\s+crypto\s+airdrop|casino\s+(?:bonus|signup)|porn\s+(?:chat|video)|xxx\s+(?:chat|video)|पैस[ाे]\s+दोगुन[ाे]|गारंटीड\s+(?:कमाई|मुनाफा))/i.test(normalized);
  const quotedWarning = /(?:scam|fraud|beware|avoid|don't|do not|धोखाधड़ी|सावधान|फ्रॉड|ठगी)/i.test(normalized);
  let reason: ModerationAction['reason'] | undefined;
  if (hasLink && promotion && !quotedWarning) reason = 'scam-promotion';
  else if (hasLink && normalized.length >= 30 && record.recent.filter(item => item.fingerprint === fingerprint).length >= 4) reason = 'repeated-links';
  else if (record.recent.filter(item => input.now - item.time < 20_000).length >= 10) reason = 'flood';
  if (!reason) return null;
  if (input.now - record.lastViolation > 86_400_000) record.strikes = 0;
  record.strikes++; record.lastViolation = input.now;
  // First promotional violation warns; floods pause posting for one hour.
  // Three violations block posting for 24 hours. Restrictions preserve old history;
  // Telegram's banChatMember would forcibly erase all messages in a supergroup.
  const action = record.strikes >= 3 ? 'block' : reason === 'scam-promotion' ? 'warn' : 'mute';
  return { chatId: input.chatId, userId: input.userId, messageId: input.messageId, action, reason,
    until: Math.floor(input.now / 1000) + (action === 'block' ? 86_400 : action === 'mute' ? 3600 : 0) };
}

export function moderationNotice(action: ModerationAction, applied: boolean): string {
  if (!applied) return 'Spam की पहचान हुई, लेकिन कार्रवाई के लिए bot के delete/restrict अधिकार जाँचने होंगे।';
  if (action.action === 'block') return `बार-बार spam मिलने पर इस account की posting 24 घंटे के लिए block की गई है। Admin /unban ${action.userId} से रोक हटा सकते हैं।`;
  if (action.action === 'mute') return `बार-बार एक जैसे messages या तेज़ flood मिलने पर posting 1 घंटे के लिए रोकी गई है। Admin /unban ${action.userId} से रोक हटा सकते हैं।`;
  return 'Spam promotion हटाया गया है। कृपया ऐसी promotion दोबारा न भेजें; बार-बार मिलने पर इस account की posting रोकी जाएगी।';
}
