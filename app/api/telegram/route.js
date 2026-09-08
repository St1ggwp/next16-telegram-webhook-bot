const TELEGRAM_API = "https://api.telegram.org";

function getBotToken() {
  return process.env.TELEGRAM_BOT_TOKEN;
}

function json(data, status = 200) {
  return Response.json(data, { status });
}

async function telegram(method, payload = {}) {
  const token = getBotToken();

  if (!token) {
    throw new Error("TELEGRAM_BOT_TOKEN is not configured");
  }

  const response = await fetch(
    `${TELEGRAM_API}/bot${token}/${method}`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    }
  );

  const data = await response.json();

  if (!response.ok || !data.ok) {
    throw new Error(data.description || `Telegram API error (${response.status})`);
  }

  return data.result;
}

function getCommand(text = "") {
  const firstWord = text.trim().split(/\s+/)[0] || "";
  return firstWord.split("@")[0].toLowerCase();
}

function getCommandArgument(text = "") {
  return text.trim().split(/\s+/).slice(1).join(" ");
}

function buildReply(message) {
  const text = message.text || "";
  const command = getCommand(text);
  const argument = getCommandArgument(text);
  const chatId = message.chat?.id;

  switch (command) {
    case "/start":
      return [
        "Привіт! 👋",
        "",
        "Я Telegram-бот на Next.js 16.",
        "Надішли /help, щоб побачити доступні команди.",
      ].join("\n");

    case "/help":
      return [
        "Доступні команди:",
        "/start — запуск",
        "/help — ця довідка",
        "/about — інформація про бота",
        "/time — поточний UTC-час",
        "/id — ID поточного чату",
        "/echo <текст> — повторити текст",
      ].join("\n");

    case "/about":
      return [
        "ℹ️ Про бота",
        "Стек: Next.js 16 + App Router + JavaScript.",
        "Транспорт: Telegram Bot API через webhook.",
        "Залежності: лише next, react та react-dom.",
      ].join("\n");

    case "/time":
      return `🕐 UTC: ${new Date().toISOString()}`;

    case "/id":
      return `🆔 ID цього чату: ${chatId ?? "невідомий"}`;

    case "/echo":
      return argument
        ? `🔁 ${argument}`
        : "Використання: /echo <текст>";

    default:
      if (!text) {
        return "Я наразі обробляю лише текстові повідомлення. Напиши /help.";
      }

      return [
        "Я отримав твоє повідомлення:",
        `"${text}"`,
        "",
        "Напиши /help для списку команд.",
      ].join("\n");
  }
}

async function verifyWebhookSecret(request) {
  const expected = process.env.TELEGRAM_WEBHOOK_SECRET;

  // If no secret is configured, accept the webhook.
  if (!expected) return true;

  return request.headers.get("x-telegram-bot-api-secret-token") === expected;
}

export async function GET(request) {
  const token = request.nextUrl.searchParams.get("token");
  const setupToken = process.env.TELEGRAM_SETUP_TOKEN || getBotToken();

  if (!setupToken) {
    return json({ ok: false, error: "TELEGRAM_BOT_TOKEN is not configured" }, 500);
  }

  if (!token || token !== setupToken) {
    return json({ ok: false, error: "Unauthorized" }, 401);
  }

  const webhookUrl = new URL("/api/telegram", request.url).toString();
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;

  try {
    const result = await telegram("setWebhook", {
      url: webhookUrl,
      ...(secret ? { secret_token: secret } : {}),
      allowed_updates: ["message"],
    });

    return json({
      ok: true,
      message: "Webhook встановлено",
      webhookUrl,
      telegram: result,
    });
  } catch (error) {
    console.error("setWebhook failed:", error);
    return json(
      { ok: false, error: "Не вдалося встановити webhook" },
      502
    );
  }
}

export async function POST(request) {
  if (!(await verifyWebhookSecret(request))) {
    return json({ ok: false, error: "Unauthorized" }, 401);
  }

  let update;

  try {
    update = await request.json();
  } catch {
    return json({ ok: false, error: "Invalid JSON" }, 400);
  }

  // Telegram can send many update types. This minimal bot only needs messages.
  const message = update?.message;

  if (!message?.chat?.id) {
    return json({ ok: true, ignored: true });
  }

  try {
    const reply = buildReply(message);

    await telegram("sendMessage", {
      chat_id: message.chat.id,
      text: reply,
    });

    // Telegram only needs a successful HTTP response from the webhook.
    return json({ ok: true });
  } catch (error) {
    console.error("Webhook processing failed:", error);

    // Return 200 so a transient application error does not cause an immediate
    // retry storm. In production, add durable logging/monitoring as needed.
    return json({ ok: false, error: "Internal error" }, 200);
  }
}
