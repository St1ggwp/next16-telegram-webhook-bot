const commands = [
  ["/start", "Запуск бота"],
  ["/help", "Список команд"],
  ["/about", "Інформація про бота"],
  ["/time", "Поточний UTC-час"],
  ["/id", "ID вашого чату"],
  ["/echo текст", "Повторити текст"],
];

export default function Home() {
  return (
    <main style={{
      maxWidth: 760,
      margin: "60px auto",
      padding: "0 20px",
      fontFamily: "system-ui, sans-serif",
      lineHeight: 1.6
    }}>
      <h1>Telegram Webhook Bot</h1>
      <p>
        Мінімальний Telegram-бот на Next.js 16 App Router без TypeScript і Tailwind.
      </p>

      <h2>Команди</h2>
      <ul>
        {commands.map(([command, description]) => (
          <li key={command}>
            <code>{command}</code> — {description}
          </li>
        ))}
      </ul>

      <p>
        Webhook endpoint: <code>/api/telegram</code>
      </p>
    </main>
  );
}
