# Nirvan Dham Telegram AI companion

Free access for seekers: open the bot and press **Start**, then write a question.
No application, payment or separate website account is needed. Hindi in Devanagari
and detailed answers are the defaults. `/language` opens native-label buttons for
33 languages; `/lang es`, `/lang fr`, etc. also work. `/english`, `/hindi`, `/short`, `/detailed`,
`/new`, `/forget`, `/course`, `/privacy`, and `/help` are available.

The bot uses the same Sarvam 105B answer function and published blog content as
the website guide. It does not import PDF answers or implement the proposed
17-stage course, private group, assessments or certificates. Course-specific
grounding will require approved lesson transcripts later.

For languages other than Hindi and English, `gemma4` on Sarvam's `/v2/chat/completions`
translates the question and recent context into English. The existing Sarvam 105B
brain answers using published site content, then Gemma translates the answer into
the selected language and script. This uses the same `SARVAM_API_KEY`; no separate
Google/Gemini key is used. Gemma access is per-key beta access, verified for the
current local key. A different key may require Sarvam to enable it. Translation
requests add API usage. Empty, malformed or truncated translations are rejected.

Language buttons: Hindi, English, Spanish, French, German, Portuguese, Italian,
Arabic, Simplified Chinese, Japanese, Korean, Russian, Turkish, Indonesian,
Vietnamese, Thai, Bengali, Gujarati, Marathi, Tamil, Telugu, Kannada, Malayalam,
Punjabi, Odia, Urdu, Nepali, Ukrainian, Polish, Dutch, Swedish, Persian and Hebrew.
Language preference survives restarts and can change during a conversation.
Command/help text is translated ahead of time in `ui-translations.json`, so UI
commands do not consume API calls. Regenerate public UI copy after changes with
`npm run bot:publish-languages`; review generated translations before publishing.

## Cloud deployment (PC can be off)

The route `/api/telegram/webhook` runs on Vercel with a 300-second maximum
duration. Its private Supabase state has RLS enabled and no anonymous/browser
access. Existing course tables and login are unchanged.

1. Run `supabase/telegram-bot.sql` in the existing project's SQL editor.
2. Set `TELEGRAM_BOT_TOKEN`, random 32+ character `TELEGRAM_WEBHOOK_SECRET`,
   `SARVAM_API_KEY` and `SUPABASE_SERVICE_ROLE_KEY` in Vercel Production.
   The existing `SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_URL` is also required.
3. Deploy; verify the route and its unauthorized POST response.
4. Stop local polling with `npm run bot:stop`; confirm `npm run bot:status`.
   Save the same keys in the ignored local environment for one-time setup, then
   run `npm run bot:webhook:enable`. It verifies storage and the cloud endpoint,
   preserves local preferences/quotas if the cloud is empty, and enables delivery
   with `max_connections: 1`, without discarding queued Telegram updates.
5. Run `npm run bot:webhook:status`; test a live question with local polling stopped.

Acknowledgment is sent only after reply delivery and persistence. Temporary
errors return 503 for Telegram retries. A database lease prevents concurrent
writes/double quota spending and expires after 330 seconds if the worker crashes.
The last 5000 completed IDs deduplicate retries and allow out-of-order updates.
Ambiguous send-message failures can still duplicate a chunk because Telegram
has no idempotency key. Messages are processed serially at the initial bounded
300-question/day budget. Data and delivery checkpoints survive PC shutdown.

Cloud availability depends on Vercel, Supabase and Sarvam, including free-tier
limits. Sarvam requests remain billable. The existing Supabase keepalive cron
is retained. No paid hosting plan is automatically enabled.

## Local polling fallback

1. Create a bot with the verified `@BotFather` account using `/newbot`.
2. Set `TELEGRAM_BOT_TOKEN` in `.env.local`. The existing `SARVAM_API_KEY` is reused.
   Never put either token in committed files or shared logs.
3. Run `npm run bot:telegram` from the repository. Keep it running.
4. Open the printed `https://t.me/...` link and send `/start`.

For background operation, use `npm run bot:start`. Check `npm run bot:status`;
use `npm run bot:stop` to request a graceful stop. Logs are in the same private
folder as `state.json`. Run only one instance. After a reboot, start it again;
automatic startup is not installed by these commands.

This version uses Telegram long polling. No public webhook, paid Telegram
subscription, Vercel deployment, inbound port or additional database is required.
The computer must remain awake and online. Closing the process, shutting down
or sleeping the computer stops replies. For continuous availability, move this
process and its private state to an always-on host. This script cannot run as a
Vercel Function. Sarvam API usage and the host's electricity/network still have costs.

## Data and reliability

Default private state location on Windows:
`%LOCALAPPDATA%/NirvanDham/telegram-bot/state.json`. Change it with
`TELEGRAM_STATE_FILE` if needed. It stores chat IDs, language/depth preferences,
up to eight recent messages, quota counters, the Telegram offset and a pending
answer outbox. Treat this file as private user data. Back it up only to private
storage. It contains no Telegram/Sarvam credentials.

`/forget` clears the bot's conversation memory but does not delete messages from
Telegram or data retained by Sarvam. Inactive histories are removed after seven
days when another message is processed. User histories are separated by chat ID.
Names, phone numbers and contacts are not stored. Questions and recent messages
are transmitted to Sarvam to generate a reply; disclose this before use.

Only private chats are processed. Group messages and messages from bots are
ignored. Pending answers are saved before delivery and resumed after restarts;
successfully checkpointed chunks are not resent. Telegram does not provide an
idempotency key for `sendMessage`: a crash between successful sending and saving,
or an ambiguous network timeout, can still duplicate a chunk. An active webhook
is detected and left unchanged. A local lock prevents two processes sharing one
state file; do not run another copy with a different state path for the same bot.

Default quotas: **30 questions per seeker per UTC day**, **300 total per UTC day**,
and **5 questions per minute per seeker**. Set positive integer values with
`TELEGRAM_DAILY_LIMIT` and `TELEGRAM_GLOBAL_DAILY_LIMIT`. Commands remain usable
when a quota is reached. Failed AI attempts count toward the budget. Quotas
survive restarts and `/forget`. They bound calls, not an exact currency spend.

Text questions are limited to 2000 characters. Long replies are split into
plain-text messages below Telegram's 4096-character limit. Photo/voice analysis
and automatic multilingual audio are not included. Questions older than ten
minutes receive a resend prompt to avoid generating stale answers after downtime.

## Verification

`npm run test:telegram` checks user isolation, length/language settings, quota
enforcement, forgetting, duplicate update handling, long reply delivery and
saved outbox recovery. It also checks website answer defaults and provider error
handling with mocked external calls. `npm run build` verifies the website.

References: [Telegram Bot API](https://core.telegram.org/bots/api),
[BotFather](https://core.telegram.org/bots/features#botfather),
[Sarvam 105B](https://docs.sarvam.ai/api/getting-started/models/sarvam-105b),
[Sarvam Gemma 4](https://docs.sarvam.ai/api/getting-started/models/openweight/gemma-4-31b).
