import { setTimeout as delay } from 'node:timers/promises';
import type { BotDependencies } from './bot';
import type { GroupAccess } from './groups';

interface ChatMember { status: string; can_delete_messages?: boolean; can_restrict_members?: boolean }

export class TelegramTransportError extends Error {
  constructor(readonly code: number, readonly alreadyDeleted = false) { super(`Telegram delivery failed (${code}).`); }
}

export function createTelegramTransport(): Pick<BotDependencies, 'send' | 'typing' | 'ackCallback' | 'groupAccess' | 'moderate' | 'unban'> {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  if (!token || !/^\d+:[A-Za-z0-9_-]+$/.test(token)) throw new Error('Telegram bot is not configured.');
  async function call(method: string, data: Record<string, unknown>) {
    let response: Response;
    try {
      response = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
        signal: AbortSignal.timeout(15_000), cache: 'no-store',
      });
    } catch { throw new TelegramTransportError(0); }
    let result;
    try { result = await response.json(); } catch { throw new TelegramTransportError(response.status); }
    if (!response.ok || !result.ok) throw new TelegramTransportError(result.error_code || response.status, typeof result.description === 'string' && /message to delete not found/i.test(result.description));
    return result.result;
  }
  let botId: Promise<number> | undefined;
  const identity = () => botId ??= call('getMe', {}).then(result => result.id as number);
  async function groupAccess(chatId: number, userId: number): Promise<GroupAccess> {
    const [bot, user] = await Promise.all([
      identity().then(id => call('getChatMember', { chat_id: chatId, user_id: id })) as Promise<ChatMember>,
      call('getChatMember', { chat_id: chatId, user_id: userId }) as Promise<ChatMember>,
    ]);
    return { userIsAdmin: ['administrator', 'creator'].includes(user.status), botIsAdmin: bot.status === 'administrator',
      canDelete: bot.status === 'administrator' && !!bot.can_delete_messages,
      canRestrict: bot.status === 'administrator' && !!bot.can_restrict_members };
  }
  return {
    groupAccess,
    moderate: async (action) => {
      // Re-check immediately before side effects, including protection for admins.
      const access = await groupAccess(action.chatId, action.userId);
      if (access.userIsAdmin || !access.canDelete || !access.canRestrict) return false;
      try { await call('deleteMessage', { chat_id: action.chatId, message_id: action.messageId }); }
      catch (error) {
        // A retried outbox may already have removed the offending message.
        if (!(error instanceof TelegramTransportError) || !error.alreadyDeleted) throw error;
      }
      if (action.action !== 'warn') {
        // Never turn an expired temporary action into Telegram's implicit permanent restriction.
        if (action.until <= Math.floor(Date.now() / 1000) + 30) return true;
        await call('restrictChatMember', { chat_id: action.chatId, user_id: action.userId,
          until_date: action.until, use_independent_chat_permissions: true,
          permissions: { can_send_messages: false, can_send_audios: false, can_send_documents: false,
            can_send_photos: false, can_send_videos: false, can_send_video_notes: false,
            can_send_voice_notes: false, can_send_polls: false, can_send_other_messages: false,
            can_add_web_page_previews: false, can_invite_users: false } });
      }
      return true;
    },
    unban: async (chatId, userId) => {
      const access = await groupAccess(chatId, userId);
      if (!access.canRestrict || access.userIsAdmin) throw new TelegramTransportError(403);
      const member = await call('getChatMember', { chat_id: chatId, user_id: userId }) as ChatMember;
      if (member.status === 'kicked') await call('unbanChatMember', { chat_id: chatId, user_id: userId, only_if_banned: true });
      else if (member.status === 'restricted') {
        const chat = await call('getChat', { chat_id: chatId });
        if (!chat.permissions) throw new TelegramTransportError(403);
        await call('restrictChatMember', { chat_id: chatId, user_id: userId, until_date: 0,
          use_independent_chat_permissions: true, permissions: chat.permissions });
      }
    },
    typing: async (id) => { await call('sendChatAction', { chat_id: id, action: 'typing' }); },
    ackCallback: async (id) => { await call('answerCallbackQuery', { callback_query_id: id }); },
    send: async (id, text, messageId, first, keyboard, messageThreadId) => {
      await call('sendMessage', { chat_id: id, text, link_preview_options: { is_disabled: true },
        ...(first ? { reply_parameters: { message_id: messageId, allow_sending_without_reply: true } } : {}),
        ...(keyboard ? { reply_markup: keyboard } : {}),
        ...(messageThreadId ? { message_thread_id: messageThreadId } : {}),
      });
      // Telegram allows fewer messages per minute in groups than private chats.
      await delay(id < 0 ? 3100 : 1100);
    },
  };
}
