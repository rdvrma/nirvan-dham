import type { AnswerDepth, GuideMessage } from '../ai-guide/answer';
import { BOT_LANGUAGES, isBotLanguage, languageKeyboard, type BotLanguage, type LanguageKeyboard } from './languages';
import { localizeControlText } from './ui';
import { inspectSpam, moderationNotice, reserveGroupIntake, type GroupAccess, type GroupRuntime, type ModerationAction } from './groups';
import type { GroupMessageAnalysis } from './answer';

export const TELEGRAM_BOT_USERNAME = 'NirvanDhamGuideBot';

interface TelegramSender { id: number; is_bot?: boolean; username?: string }

export interface TelegramUpdate {
  update_id: number;
  message?: {
    message_id: number;
    date: number;
    text?: string;
    caption?: string;
    entities?: { type: string; url?: string }[];
    caption_entities?: { type: string; url?: string }[];
    message_thread_id?: number;
    chat: { id: number; type: string };
    from?: TelegramSender;
    reply_to_message?: { from?: TelegramSender; message_id?: number };
  };
  callback_query?: {
    id: string;
    data?: string;
    from: { id: number; is_bot?: boolean };
    message?: { message_id: number; chat: { id: number; type: string } };
  };
}

interface Seeker {
  lang: BotLanguage;
  depth: 'detailed' | 'short';
  history: GuideMessage[];
  lastSeen: number;
}

interface Usage {
  day: string;
  count: number;
  recent: number[];
}

interface PendingAnswer {
  updateId: number;
  chatId: number;
  messageId: number;
  seekerId?: string;
  languageCode?: string;
  moderation?: ModerationAction;
  messageThreadId?: number;
  question?: string;
  lang: BotLanguage;
  depth: 'detailed' | 'short';
  history: GuideMessage[];
  chunks?: string[];
  answer?: string;
  nextChunk: number;
  keyboard?: LanguageKeyboard;
}

export interface BotState {
  version: 1;
  offset: number;
  users: Record<string, Seeker>;
  usage: Record<string, Usage>;
  globalUsage: { day: string; count: number };
  pending?: PendingAnswer;
  groups?: GroupRuntime;
}

export interface BotDependencies {
  save: () => Promise<void>;
  send: (chatId: number, text: string, messageId: number, first: boolean, keyboard?: LanguageKeyboard, messageThreadId?: number) => Promise<void>;
  ackCallback?: (id: string) => Promise<void>;
  typing: (chatId: number) => Promise<void>;
  answer: (input: { question: string; lang: BotLanguage; depth: AnswerDepth; history: GuideMessage[]; languageCode?: string }) => Promise<string>;
  analyze?: (text: string) => Promise<GroupMessageAnalysis>;
  groupAccess?: (chatId: number, userId: number) => Promise<GroupAccess>;
  moderate?: (action: ModerationAction) => Promise<boolean>;
  unban?: (chatId: number, userId: number) => Promise<void>;
  now: () => number;
  dailyLimit: number;
  globalDailyLimit: number;
}

export function emptyBotState(): BotState {
  return { version: 1, offset: 0, users: {}, usage: {}, globalUsage: { day: '', count: 0 } };
}

/** Group context belongs to one sender in one chat, never to the entire group. */
export function telegramConversation(update: TelegramUpdate, automatic = false): { key: string; usageId: string; text: string; group: boolean; addressed: boolean } | null {
  const message = update.message;
  if (!message?.from || message.from.is_bot) return null;
  const text = (message.text ?? message.caption)?.trim() ?? '';
  if (message.chat.type === 'private') return message.from.id === message.chat.id
    ? { key: String(message.chat.id), usageId: String(message.from.id), text, group: false, addressed: true } : null;
  if (!['group', 'supergroup'].includes(message.chat.type) || message.from.id <= 0) return null;
  const command = text.match(/^\/(\w+)(?:@([A-Za-z0-9_]+))?(?:\s|$)/);
  const username = TELEGRAM_BOT_USERNAME.toLowerCase();
  // Commands aimed at another bot must never be consumed, even in a reply.
  if (command?.[2] && command[2].toLowerCase() !== username) return null;
  const ownCommand = command?.[2]?.toLowerCase() === username;
  const ownReply = message.reply_to_message?.from?.is_bot === true
    && message.reply_to_message.from.username?.toLowerCase() === username;
  const mention = new RegExp(`@${TELEGRAM_BOT_USERNAME}(?![A-Za-z0-9_])`, 'ig');
  const mentioned = mention.test(text);
  const automaticCommand = automatic && !!command && ['auto', 'moderation', 'modstatus', 'unban', 'help', 'start', 'language', 'languages', 'lang', 'short', 'detailed', 'new', 'forget', 'privacy', 'course', 'hindi', 'english'].includes(command[1].toLowerCase());
  const addressed = ownCommand || ownReply || mentioned || command?.[1].toLowerCase() === 'ask' || automaticCommand;
  if (!addressed && (!automatic || !text)) return null;
  return {
    key: `group:${message.chat.id}:${message.from.id}`, usageId: String(message.from.id), group: true, addressed,
    text: text.replace(mention, '').replace(/^\/ask(?:\s|$)/i, '').trim(),
  };
}

function groupHelp(lang: BotLanguage, automatic = false): string {
  if (automatic) return lang === 'hi'
    ? 'अपना सवाल सीधे लिखें; /ask या mention ज़रूरी नहीं। जवाब आपके नए प्रश्न की भाषा में मिलेगा। सामान्य अभिवादन पर bot चुप रहता है।\n/short — छोटे उत्तर\n/detailed — विस्तृत उत्तर\n/new — अपना नया संवाद\n/forget — अपनी संवाद-स्मृति हटाएँ\n\nहर सदस्य का संदर्भ अलग है। Group के प्रश्न-जवाब सभी सदस्यों को दिखते हैं। प्रश्न पहचानने के लिए नए text messages Sarvam AI को भेजे जाते हैं; उत्तर के लिए आपका प्रश्न और इसी group का आपका हाल का bot संवाद भेजा जाता है। Private chat की memory यहाँ नहीं आती। Spam जाँच के लिए संदेशों के fingerprints एक दिन तक और हाल की 50 कार्रवाइयों का विवरण सहेजा जाता है।\n\nसीमा: 2000 अक्षर, प्रति व्यक्ति 30 प्रश्न/दिन; सभी chats मिलाकर 300 उत्तर/दिन। प्रश्न पहचानने की अलग सीमा 90 messages/व्यक्ति/दिन और कुल 600/दिन है। Admin: /auto off, /moderation off, /modstatus।\nPrivate chat: https://t.me/NirvanDhamGuideBot'
    : 'Write your question directly; no /ask or mention is needed. Answers follow the language of each new question. Greetings stay quiet.\n/short — shorter answers\n/detailed — detailed answers\n/new — your fresh conversation\n/forget — remove your conversation memory\n\nEach member has separate context. Questions and answers are visible to everyone in this group. New text messages are sent to Sarvam AI to identify questions; your question and your recent bot conversation in this group are sent to generate answers. Private chat history is never used here. Spam checks retain message fingerprints for up to a day and the latest 50 moderation actions.\n\nLimits: 2000 characters, 30 questions/person/day, 300 answers/day across all chats. Classification has a separate 90 messages/person/day and 600/day total limit. Admin: /auto off, /moderation off, /modstatus.\nPrivate chat: https://t.me/NirvanDhamGuideBot';
  return lang === 'hi'
    ? 'इस group में सवाल ऐसे पूछें:\n/ask@NirvanDhamGuideBot साक्षीभाव क्या है?\n\nअगला सवाल मेरे जवाब पर Reply करके पूछें।\n/language@NirvanDhamGuideBot या /lang@NirvanDhamGuideBot en से अपनी भाषा चुनें।\n/short@NirvanDhamGuideBot — छोटा जवाब\n/detailed@NirvanDhamGuideBot — विस्तृत जवाब\n/new@NirvanDhamGuideBot — अपना नया संवाद\n\nहर सदस्य की भाषा और संदर्भ अलग हैं। Group में प्रश्न और जवाब सभी सदस्यों को दिखाई देते हैं; आपके private bot संवाद का संदर्भ यहाँ इस्तेमाल नहीं होता। सवाल और इस group में आपके हाल के bot संवाद Sarvam AI को उत्तर बनाने के लिए भेजे जाते हैं। निजी बातचीत: https://t.me/NirvanDhamGuideBot'
    : 'Ask in this group:\n/ask@NirvanDhamGuideBot What is witness awareness?\n\nReply to my answer to ask a follow-up.\n/lang@NirvanDhamGuideBot en — choose your language code\n/short@NirvanDhamGuideBot — shorter answers\n/detailed@NirvanDhamGuideBot — detailed answers\n/new@NirvanDhamGuideBot — your fresh conversation\n\nEach member has separate preferences and context. Group questions and answers are visible to all members; private bot history is never used here. Your question and recent bot conversation in this group are sent to Sarvam AI to answer. Private chat: https://t.me/NirvanDhamGuideBot';
}

function groupLanguages(lang: BotLanguage): string {
  const instruction = lang === 'hi'
    ? 'अपनी भाषा का code भेजें, जैसे /lang@NirvanDhamGuideBot hi या /lang@NirvanDhamGuideBot es। यह पसंद केवल इस group में आपके लिए बदलेगी।'
    : 'Send your language code, for example /lang@NirvanDhamGuideBot en or /lang@NirvanDhamGuideBot es. This changes only your preference in this group.';
  return `${instruction}\n\n${Object.entries(BOT_LANGUAGES).map(([code, value]) => `${code} — ${value.label}`).join('\n')}`;
}

/** Plain text avoids Markdown escaping failures; split on paragraphs where possible. */
export function splitTelegramText(text: string, limit = 3500): string[] {
  let remaining = text.trim();
  const chunks: string[] = [];
  while (remaining.length > limit) {
    let end = remaining.lastIndexOf('\n\n', limit);
    if (end < limit / 2) end = remaining.lastIndexOf(' ', limit);
    if (end < limit / 2) end = limit;
    // Do not separate UTF-16 surrogate pairs (for example emoji).
    if (/[\uD800-\uDBFF]/.test(remaining[end - 1])) end -= 1;
    chunks.push(remaining.slice(0, end).trim());
    remaining = remaining.slice(end).trim();
  }
  if (remaining) chunks.push(remaining);
  return chunks;
}

function welcome(lang: BotLanguage): string {
  return lang === 'hi'
    ? 'निर्वाण धाम AI साथी में आपका स्वागत है। यह सभी साधकों के लिए निःशुल्क है। अपना प्रश्न सीधे लिखें—आत्मविचार, साक्षीभाव, ध्यान या किसी शिक्षण से जुड़ा संदेह।\n\nमैं प्रकाशित शिक्षाओं से सहायता लेकर उत्तर देता हूँ; मैं आदिसत्व या मानव गुरु नहीं हूँ। सामान्य आध्यात्मिक मार्गदर्शन को आदिसत्व का निजी कथन नहीं बताऊँगा।\n\nविस्तृत उत्तर अभी चुने हुए हैं। /short से छोटे और /detailed से विस्तृत उत्तर चुनें। /english या /hindi से भाषा बदलें। /new से नया संवाद शुरू करें।\n\nपिछले कुछ संदेश follow-up समझने के लिए रखे जाते हैं और उत्तर के लिए Sarvam AI को भेजे जाते हैं। /privacy में विवरण और /forget से bot की संवाद-स्मृति हटाएँ।\n\nशुरुआत करें: “साक्षीभाव को दैनिक जीवन में कैसे समझूँ?”'
    : 'Welcome to the Nirvan Dham AI companion. Access is free for all seekers. Write your question about self-inquiry, witness awareness, meditation or a teaching.\n\nI draw on published teachings and am an AI guide, not Aadisatv or a human guru. General spiritual guidance is not attributed to him as a personal statement.\n\nDetailed answers are selected. Use /short or /detailed, /hindi or /english, and /new for a fresh conversation. Recent messages are retained for follow-ups and sent to Sarvam AI to answer. See /privacy or use /forget to remove the bot’s conversation memory.\n\nTry: “How can I understand witness awareness in everyday life?”';
}

function controlReply(text: string, seeker: Seeker): string | undefined {
  const command = text.match(/^\/(\w+)(?:@\w+)?(?:\s|$)/)?.[1]?.toLowerCase();
  const hi = () => seeker.lang === 'hi';
  switch (command) {
    case 'language':
    case 'languages': return hi() ? 'अपनी भाषा चुनें। और भाषाओं के लिए नीचे वाला बटन दबाएँ।' : 'Choose your language. Use the last button for more languages.';
    case 'lang': {
      const code = text.split(/\s+/)[1]?.toLowerCase();
      if (!code) return hi() ? 'अपनी भाषा चुनें।' : 'Choose your language.';
      if (!isBotLanguage(code)) return hi() ? 'यह भाषा उपलब्ध नहीं है। /language से उपलब्ध भाषाएँ चुनें।' : 'That language is not available. Choose a supported language with /language.';
      seeker.lang = code;
      return `✅ ${BOT_LANGUAGES[code].label}\n${code === 'hi' ? 'अब अपना प्रश्न हिंदी में लिखें।' : localizeControlText('Language selected. Write your question.', code)}`;
    }
    case 'start': seeker.depth = 'detailed'; return welcome(seeker.lang);
    case 'help': return hi()
      ? 'अपना प्रश्न सीधे लिखें।\n/language — 33 भाषाओं में से चुनें\n/hindi — हिंदी\n/english — English\n/short — छोटे उत्तर\n/detailed — विस्तृत उत्तर\n/new — नया संवाद\n/forget — संवाद-स्मृति हटाएँ\n/course — निर्वाण सूत्र course\n/privacy — डेटा की जानकारी'
      : 'Write your question directly.\n/language — choose from 33 languages\n/hindi — Hindi\n/english — English\n/short — shorter answers\n/detailed — detailed answers\n/new — fresh conversation\n/forget — remove conversation memory\n/course — Nirvana Sutra course\n/privacy — data information';
    case 'hindi': seeker.lang = 'hi'; return 'अब उत्तर हिंदी की देवनागरी लिपि में मिलेंगे। अपना प्रश्न लिखें।';
    case 'english': seeker.lang = 'en'; return 'Answers will now be in English. Write your question.';
    case 'short': seeker.depth = 'short'; return hi() ? 'अब छोटे और सीधे उत्तर मिलेंगे। विस्तृत उत्तरों के लिए /detailed भेजें।' : 'Short answers selected. Use /detailed for longer explanations.';
    case 'detailed': seeker.depth = 'detailed'; return hi() ? 'अब विस्तार से उत्तर मिलेंगे। छोटे उत्तरों के लिए /short भेजें।' : 'Detailed answers selected. Use /short for shorter replies.';
    case 'new': seeker.history = []; return hi() ? 'नया संवाद शुरू है। पिछले संदर्भ के बिना अपना प्रश्न लिखें।' : 'A fresh conversation is ready. Write your question.';
    case 'forget': seeker.history = []; return hi() ? 'Bot की सहेजी हुई संवाद-स्मृति हटा दी गई है। Telegram chat के संदेश अपने आप नहीं मिटते। भाषा की पसंद और उपयोग की गिनती बनी रहती है।' : 'The bot’s saved conversation memory has been removed. Telegram chat messages are not automatically deleted. Language preferences and usage counts remain.';
    case 'course': return hi() ? 'निर्वाण सूत्र course यहाँ खोलें:\nhttps://www.nirvandham.in/course\n\nCourse और certificate के नियम website पर उपलब्ध जानकारी के अनुसार हैं। Bot बातचीत से stage या certificate पूरा नहीं होता।' : 'Open the Nirvana Sutra course:\nhttps://www.nirvandham.in/course\n\nSee the website for course and certificate requirements. Bot conversations do not complete course stages or certificates.';
    case 'privacy': return hi()
      ? 'आपका Telegram chat ID, भाषा की पसंद और पिछले अधिकतम 8 संवाद संदेश bot के सुरक्षित storage में रखे जाते हैं। Cloud version में यह Supabase database है। प्रश्न और हाल का संवाद उत्तर बनाने के लिए Sarvam AI को भेजे जाते हैं; उत्तर Telegram पर आता है। नाम, phone number और contacts नहीं सहेजे जाते।\n\n/forget से संवाद-स्मृति हटाएँ। निष्क्रिय संवाद-स्मृति 7 दिन बाद अगले संदेश के समय साफ होती है। Telegram या Sarvam के पास मौजूद डेटा इससे नहीं मिटता। संवेदनशील निजी जानकारी भेजना आवश्यक नहीं है।'
      : 'The bot stores your Telegram chat ID, language preference and at most 8 recent conversation messages in private storage. The cloud version uses a Supabase database. Questions and recent conversation are sent to Sarvam AI to generate answers; replies are delivered through Telegram. Names, phone numbers and contacts are not stored.\n\nUse /forget to remove conversation memory. Inactive conversation memory is cleared after 7 days when the bot next processes a message. This does not delete data held by Telegram or Sarvam. You do not need to send sensitive personal information.';
    default: return command ? (hi() ? 'यह command उपलब्ध नहीं है। /help देखें या अपना प्रश्न सीधे लिखें।' : 'Unknown command. See /help or write your question directly.') : undefined;
  }
}

/** Persistent quotas survive restarts and /forget. All commands remain available at the limit. */
function reserveQuestion(state: BotState, id: string, deps: BotDependencies): boolean {
  const now = deps.now();
  const day = new Date(now).toISOString().slice(0, 10);
  let usage = state.usage[id];
  if (!usage || usage.day !== day) usage = state.usage[id] = { day, count: 0, recent: [] };
  usage.recent = usage.recent.filter((time) => now - time < 60_000);
  if (state.globalUsage.day !== day) state.globalUsage = { day, count: 0 };
  if (usage.count >= deps.dailyLimit || usage.recent.length >= 5 || state.globalUsage.count >= deps.globalDailyLimit) return false;
  usage.count += 1;
  usage.recent.push(now);
  state.globalUsage.count += 1;
  return true;
}

/** Resume a saved outbox before asking Telegram for another update. */
export async function finishPending(state: BotState, deps: BotDependencies): Promise<void> {
  const pending = state.pending;
  if (!pending) return;
  if (!pending.chunks) {
    if (pending.moderation) {
      if (!deps.moderate) throw new Error('Moderation transport unavailable');
      const applied = await deps.moderate(pending.moderation);
      const runtime = state.groups ??= {};
      runtime.audit = [...(runtime.audit ?? []), { ...pending.moderation, time: deps.now(), applied }].slice(-50);
      pending.chunks = [moderationNotice(pending.moderation, applied)];
      await deps.save();
    }
  }
  if (!pending.chunks) {
    await deps.typing(pending.chatId).catch(() => undefined);
    try {
      const answer = await deps.answer({ question: pending.question!, lang: pending.lang, history: pending.history, depth: pending.depth, ...(pending.languageCode ? { languageCode: pending.languageCode } : {}) });
      if (!answer.trim()) throw new Error('empty answer');
      pending.answer = answer;
      pending.chunks = splitTelegramText(answer);
    } catch {
      pending.chunks = [pending.lang === 'hi' ? 'इस समय उत्तर तैयार नहीं हो पाया। कृपया थोड़ी देर बाद प्रश्न फिर भेजें।' : localizeControlText('I could not prepare an answer right now. Please try your question again shortly.', pending.lang)];
    }
    await deps.save();
  }
  while (pending.nextChunk < pending.chunks.length) {
    await deps.send(pending.chatId, pending.chunks[pending.nextChunk], pending.messageId, pending.nextChunk === 0, pending.nextChunk === 0 ? pending.keyboard : undefined, pending.messageThreadId);
    pending.nextChunk += 1;
    await deps.save();
  }
  if (pending.answer && pending.question) {
    const seeker = state.users[pending.seekerId ?? String(pending.chatId)];
    if (seeker) seeker.history = [...pending.history, { role: 'user', content: pending.question }, { role: 'assistant', content: pending.answer }].slice(-8) as GuideMessage[];
  }
  state.offset = Math.max(state.offset, pending.updateId + 1);
  delete state.pending;
  await deps.save();
}

export async function handleTelegramUpdate(update: TelegramUpdate, state: BotState, deps: BotDependencies): Promise<void> {
  if (!Number.isSafeInteger(update.update_id) || update.update_id < state.offset) return;
  if (state.pending) await finishPending(state, deps);
  if (update.update_id < state.offset) return;
  const callback = update.callback_query;
  if (callback) await deps.ackCallback?.(callback.id).catch(() => undefined);
  let message = update.message;
  if (callback?.message && callback.data && callback.message.chat.type === 'private' && callback.from.id === callback.message.chat.id && !callback.from.is_bot) {
    const data = callback.data;
    if (data.startsWith('lang:') && isBotLanguage(data.slice(5))) {
      message = { message_id: callback.message.message_id, date: Math.floor(deps.now() / 1000), chat: callback.message.chat, from: callback.from, text: `/lang ${data.slice(5)}` };
    } else if (data === 'langs:global' || data === 'langs:more') {
      message = { message_id: callback.message.message_id, date: Math.floor(deps.now() / 1000), chat: callback.message.chat, from: callback.from, text: `/language ${data.slice(6)}` };
    }
  }
  const groupSettings = message ? state.groups?.settings?.[String(message.chat.id)] : undefined;
  const conversation = telegramConversation({ ...update, message }, groupSettings?.autoReply || groupSettings?.moderation);
  if (!message || !conversation) {
    state.offset = update.update_id + 1;
    await deps.save();
    return;
  }
  const now = deps.now();
  const id = conversation.key;
  // Store bounded conversation context, and discard old histories even without /forget.
  for (const [key, user] of Object.entries(state.users)) {
    if (now - user.lastSeen > 7 * 86_400_000) delete state.users[key];
  }
  const day = new Date(now).toISOString().slice(0, 10);
  for (const [key, usage] of Object.entries(state.usage)) {
    if (usage.day !== day) delete state.usage[key];
  }
  const seeker = state.users[id] ??= { lang: 'hi', depth: 'detailed', history: [], lastSeen: now };
  seeker.lastSeen = now;
  const text = conversation.text;
  const command = text.match(/^\/(\w+)(?:@\w+)?(?:\s|$)/)?.[1]?.toLowerCase();
  let groupReply: string | undefined;
  if (conversation.group && ['auto', 'moderation', 'unban', 'modstatus'].includes(command ?? '')) {
    const access = await deps.groupAccess?.(message.chat.id, message.from!.id);
    if (!access?.userIsAdmin) groupReply = 'यह command केवल group admins के लिए है।';
    else {
      const runtime = state.groups ??= {};
      const settings = (runtime.settings ??= {})[String(message.chat.id)] ??= { autoReply: false, moderation: false };
      const arg = text.split(/\s+/)[1]?.toLowerCase();
      if (command === 'modstatus') groupReply = `Automatic answers: ${settings.autoReply ? 'ON' : 'OFF'}\nSpam moderation: ${settings.moderation ? 'ON' : 'OFF'}\nBot delete/restrict: ${access.canDelete}/${access.canRestrict}\nRecent moderation actions: ${runtime.audit?.filter(item => item.chatId === message.chat.id).length ?? 0}`;
      else if (command === 'unban') {
        const userId = arg ? Number(arg) : message.reply_to_message?.from?.id;
        if (!Number.isSafeInteger(userId) || userId! <= 0 || !deps.unban) groupReply = 'सदस्य के पुराने message पर Reply करके /unban भेजें, या /unban USER_ID लिखें।';
        else if (!runtime.audit?.some(item => item.chatId === message.chat.id && item.userId === userId && item.applied && item.action !== 'warn' && item.until * 1000 > now)) groupReply = 'इस सदस्य के लिए bot की कोई सक्रिय posting रोक दर्ज नहीं है। दूसरी रोक Telegram की member settings से जाँचें।';
        else {
          await deps.unban(message.chat.id, userId!);
          if (runtime.spam) delete runtime.spam[`${message.chat.id}:${userId}`];
          for (const item of runtime.audit ?? []) if (item.chatId === message.chat.id && item.userId === userId) item.until = 0;
          groupReply = 'इस सदस्य की bot द्वारा लगाई गई रोक हटा दी गई है।';
        }
      } else if (!['on', 'off'].includes(arg ?? '')) groupReply = `/${command} on या /${command} off भेजें।`;
      else if (arg === 'on' && (!access.botIsAdmin || (command === 'moderation' && (!access.canDelete || !access.canRestrict)))) groupReply = 'पहले bot को group admin बनाकर delete और restrict members के अधिकार दें।';
      else {
        if (command === 'auto') settings.autoReply = arg === 'on'; else settings.moderation = arg === 'on';
        groupReply = command === 'auto' && settings.autoReply
          ? 'Automatic जवाब चालू हैं। अब सीधे अपना सवाल लिखें; /ask या mention ज़रूरी नहीं। जवाब हर सवाल की भाषा में होगा। शुभकामनाओं और सामान्य घोषणाओं पर bot चुप रहेगा। प्रश्न पहचानने के लिए इस group के नए text messages Sarvam AI को भेजे जाते हैं; निजी chat की memory यहाँ इस्तेमाल नहीं होती। /auto off से admin इसे बंद कर सकते हैं।'
          : command === 'moderation' && settings.moderation
            ? 'Spam moderation चालू है: स्पष्ट scam promotion हटाकर चेतावनी, repeated links/flood पर 1 घंटे की posting रोक, एक दिन में 3 उल्लंघन पर 24 घंटे posting block। पुराने messages बने रहेंगे। Admin accounts पर automatic कार्रवाई नहीं होगी। /moderation off से बंद करें; /unban से bot की रोक हटाएँ।'
            : `${command === 'auto' ? 'Automatic जवाब' : 'Spam moderation'} बंद है।`;
      }
    }
  }
  // Moderation uses conservative deterministic evidence, never an LLM's ban decision.
  if (conversation.group && groupSettings?.moderation && !command && text) {
    const runtime = state.groups ??= {};
    const action = inspectSpam(runtime, { chatId: message.chat.id, userId: message.from!.id,
      messageId: message.message_id, text, now,
      links: [...(message.entities ?? []), ...(message.caption_entities ?? [])].flatMap(item => item.url ? [item.url] : []),
    });
    if (action) {
      const access = await deps.groupAccess?.(message.chat.id, message.from!.id);
      if (access && !access.userIsAdmin && access.canDelete && access.canRestrict && deps.moderate) {
        state.pending = { updateId: update.update_id, chatId: message.chat.id, messageId: message.message_id,
          seekerId: id, lang: seeker.lang, depth: seeker.depth, history: [], nextChunk: 0, moderation: action,
          messageThreadId: message.message_thread_id };
        await deps.save(); await finishPending(state, deps); return;
      }
    }
  }
  // Quietly acknowledge unrelated group traffic, including non-question media.
  if (conversation.group && !conversation.addressed && (!groupSettings?.autoReply || command || !text || text.length > 2000 || now - message.date * 1000 > 10 * 60_000)) {
    state.offset = update.update_id + 1; await deps.save(); return;
  }
  let languageCode: string | undefined;
  if (conversation.group && groupSettings?.autoReply && !command && text && text.length <= 2000 && now - message.date * 1000 <= 10 * 60_000 && !groupReply) {
    const runtime = state.groups ??= {};
    if (!deps.analyze || !reserveGroupIntake(runtime, message.from!.id, now)) {
      state.offset = update.update_id + 1; await deps.save(); return;
    }
    await deps.save();
    const analysis = await deps.analyze(text);
    if (!analysis.isQuestion && !conversation.addressed) { state.offset = update.update_id + 1; await deps.save(); return; }
    languageCode = analysis.languageCode;
    if (isBotLanguage(languageCode)) seeker.lang = languageCode;
  }
  const keyboard = conversation.group ? undefined : command === 'start' ? languageKeyboard('welcome')
    : ['language', 'languages'].includes(command ?? '') || (command === 'lang' && !isBotLanguage(text.split(/\s+/)[1] ?? '')) ? languageKeyboard(text.split(/\s+/)[1] === 'more' ? 'more' : 'global') : undefined;
  const groupLanguageMenu = ['language', 'languages'].includes(command ?? '')
    || (command === 'lang' && !isBotLanguage(text.split(/\s+/)[1] ?? ''));
  let reply = groupReply ?? (conversation.group && groupLanguageMenu ? groupLanguages(seeker.lang)
    : conversation.group && (['start', 'help', 'privacy'].includes(command ?? '') || !text)
      ? groupHelp(seeker.lang, groupSettings?.autoReply) : controlReply(text, seeker));
  if (!reply && (!text || text.length > 2000)) reply = seeker.lang === 'hi' ? 'कृपया अपना प्रश्न text में लिखें, अधिकतम 2000 अक्षर। अभी photo और voice का विश्लेषण उपलब्ध नहीं है।' : 'Please write a text question of at most 2000 characters. Photo and voice analysis are not available yet.';
  if (!reply && now - message.date * 1000 > 10 * 60_000) reply = seeker.lang === 'hi' ? 'आपका प्रश्न bot के offline होने के समय आया था। कृपया फिर भेजें ताकि अब उसका उत्तर दे सकूँ।' : 'Your question arrived while the bot was offline. Please send it again so I can answer now.';
  if (!reply && !reserveQuestion(state, conversation.usageId, deps)) reply = seeker.lang === 'hi' ? 'अभी उपयोग सीमा पूरी हुई है। लगातार प्रश्नों के बीच एक मिनट रुकें; दैनिक सीमा के लिए अगले दिन फिर प्रयास करें। /help और /course उपलब्ध हैं।' : 'The usage limit has been reached. Wait a minute between repeated questions, or return tomorrow for the daily limit. /help and /course remain available.';
  if (reply) reply = localizeControlText(reply, seeker.lang);
  state.pending = {
    updateId: update.update_id, chatId: message.chat.id, messageId: message.message_id, seekerId: id,
    lang: seeker.lang, depth: seeker.depth, history: [...seeker.history], nextChunk: 0,
    ...(languageCode ? { languageCode } : {}),
    ...(message.message_thread_id ? { messageThreadId: message.message_thread_id } : {}),
    ...(keyboard ? { keyboard } : {}),
    ...(reply ? { chunks: splitTelegramText(reply) } : { question: text }),
  };
  await deps.save();
  await finishPending(state, deps);
}
