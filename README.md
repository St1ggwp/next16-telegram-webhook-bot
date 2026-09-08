# Next.js 16 Telegram Webhook Bot

Мінімальний Telegram-бот на **Next.js 16**, **App Router**, **JavaScript**, без TypeScript і без Tailwind.

## Що є

- `POST /api/telegram` — приймає Telegram webhook updates.
- `GET /api/telegram?token=...` — встановлює webhook на поточний origin.
- Токен бота береться з `TELEGRAM_BOT_TOKEN`.
- Опційний `TELEGRAM_WEBHOOK_SECRET` захищає webhook через заголовок Telegram.
- Команди:
  - `/start`
  - `/help`
  - `/about`
  - `/time`
  - `/id`
  - `/echo <текст>`
- Будь-який інший текст отримує інформаційну відповідь.

## Запуск локально

Потрібен Node.js 20.9+.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Заповни `.env.local`:

```env
TELEGRAM_BOT_TOKEN=123456789:...
TELEGRAM_SETUP_TOKEN=довгий_секрет
TELEGRAM_WEBHOOK_SECRET=ще_один_довгий_секрет
```

## Production

Розгорни застосунок на HTTPS-хості (наприклад, Vercel або іншому Node.js-хостингу).

Після деплою відкрий:

```text
https://YOUR-DOMAIN.example/api/telegram?token=TELEGRAM_SETUP_TOKEN
```

У відповідь має прийти JSON із `ok: true` та URL webhook.

Важливо: якщо `TELEGRAM_SETUP_TOKEN` не заданий, endpoint для встановлення webhook використовує `TELEGRAM_BOT_TOKEN`. Для production краще задати окремий `TELEGRAM_SETUP_TOKEN`, щоб не передавати bot token у URL.

## Перевірка

У Telegram відкрий бота й надішли:

```text
/start
/help
/about
/time
/id
/echo hello
```

## Примітки

Telegram webhook працює через HTTPS. Не коміть `.env.local` у Git.

Цей приклад навмисно не використовує Telegram SDK: достатньо прямого HTTP-виклику до Bot API.
