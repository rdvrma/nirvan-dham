import type { AnswerDepth, GuideMessage } from '../ai-guide/answer';
import { BOT_LANGUAGES, isBotLanguage, languageKeyboard, type BotLanguage, type LanguageKeyboard } from './languages';
import { localizeControlText } from './ui';

export const TELEGRAM_BOT_USERNAME = 'NirvanDhamGuideBot';

interface TelegramSender { id: number; is_bot?: boolean; username?: string }

export interface TelegramUpdate {
  update_id: number;
  message?: {
    message_id: number;
    date: number;
    text?: string;
    chat: { id: number; type: string };
    from?: TelegramSender;
    reply_to_message?: { from?: TelegramSender };
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
}

export interface BotDependencies {
  save: () => Promise<void>;
  send: (chatId: number, text: string, messageId: number, first: boolean, keyboard?: LanguageKeyboard) => Promise<void>;
  ackCallback?: (id: string) => Promise<void>;
  typing: (chatId: number) => Promise<void>;
  answer: (input: { question: string; lang: BotLanguage; depth: AnswerDepth; history: GuideMessage[] }) => Promise<string>;
  now: () => number;
  dailyLimit: number;
  globalDailyLimit: number;
}

export function emptyBotState(): BotState {
  return { version: 1, offset: 0, users: {}, usage: {}, globalUsage: { day: '', count: 0 } };
}

/** Group context belongs to one sender in one chat, never to the entire group. */
export function telegramConversation(update: TelegramUpdate): { key: string; usageId: string; text: string; group: boolean } | null {
  const message = update.message;
  if (!message?.from || message.from.is_bot) return null;
  const text = message.text?.trim() ?? '';
  if (message.chat.type === 'private') return message.from.id === message.chat.id
    ? { key: String(message.chat.id), usageId: String(message.from.id), text, group: false } : null;
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
  if (!ownCommand && !ownReply && !mentioned && command?.[1].toLowerCase() !== 'ask') return null;
  return {
    key: `group:${message.chat.id}:${message.from.id}`, usageId: String(message.from.id), group: true,
    text: text.replace(mention, '').replace(/^\/ask(?:\s|$)/i, '').trim(),
  };
}

function groupHelp(lang: BotLanguage): string {
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
    await deps.typing(pending.chatId).catch(() => undefined);
    try {
      const answer = await deps.answer({ question: pending.question!, lang: pending.lang, history: pending.history, depth: pending.depth });
      if (!answer.trim()) throw new Error('empty answer');
      pending.answer = answer;
      pending.chunks = splitTelegramText(answer);
    } catch {
      pending.chunks = [pending.lang === 'hi' ? 'इस समय उत्तर तैयार नहीं हो पाया। कृपया थोड़ी देर बाद प्रश्न फिर भेजें।' : localizeControlText('I could not prepare an answer right now. Please try your question again shortly.', pending.lang)];
    }
    await deps.save();
  }
  while (pending.nextChunk < pending.chunks.length) {
    await deps.send(pending.chatId, pending.chunks[pending.nextChunk], pending.messageId, pending.nextChunk === 0, pending.nextChunk === 0 ? pending.keyboard : undefined);
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
  const conversation = telegramConversation({ ...update, message });
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
  const keyboard = conversation.group ? undefined : command === 'start' ? languageKeyboard('welcome')
    : ['language', 'languages'].includes(command ?? '') || (command === 'lang' && !isBotLanguage(text.split(/\s+/)[1] ?? '')) ? languageKeyboard(text.split(/\s+/)[1] === 'more' ? 'more' : 'global') : undefined;
  const groupLanguageMenu = ['language', 'languages'].includes(command ?? '')
    || (command === 'lang' && !isBotLanguage(text.split(/\s+/)[1] ?? ''));
  let reply = conversation.group && groupLanguageMenu ? groupLanguages(seeker.lang)
    : conversation.group && (['start', 'help', 'privacy'].includes(command ?? '') || !text)
      ? groupHelp(seeker.lang) : controlReply(text, seeker);
  if (!reply && (!text || text.length > 2000)) reply = seeker.lang === 'hi' ? 'कृपया अपना प्रश्न text में लिखें, अधिकतम 2000 अक्षर। अभी photo और voice का विश्लेषण उपलब्ध नहीं है।' : 'Please write a text question of at most 2000 characters. Photo and voice analysis are not available yet.';
  if (!reply && now - message.date * 1000 > 10 * 60_000) reply = seeker.lang === 'hi' ? 'आपका प्रश्न bot के offline होने के समय आया था। कृपया फिर भेजें ताकि अब उसका उत्तर दे सकूँ।' : 'Your question arrived while the bot was offline. Please send it again so I can answer now.';
  if (!reply && !reserveQuestion(state, conversation.usageId, deps)) reply = seeker.lang === 'hi' ? 'अभी उपयोग सीमा पूरी हुई है। लगातार प्रश्नों के बीच एक मिनट रुकें; दैनिक सीमा के लिए अगले दिन फिर प्रयास करें। /help और /course उपलब्ध हैं।' : 'The usage limit has been reached. Wait a minute between repeated questions, or return tomorrow for the daily limit. /help and /course remain available.';
  if (reply) reply = localizeControlText(reply, seeker.lang);
  state.pending = {
    updateId: update.update_id, chatId: message.chat.id, messageId: message.message_id, seekerId: id,
    lang: seeker.lang, depth: seeker.depth, history: [...seeker.history], nextChunk: 0,
    ...(keyboard ? { keyboard } : {}),
    ...(reply ? { chunks: splitTelegramText(reply) } : { question: text }),
  };
  await deps.save();
  await finishPending(state, deps);
}
