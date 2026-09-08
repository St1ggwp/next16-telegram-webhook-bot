export const metadata = {
  title: "Telegram Webhook Bot",
  description: "Minimal Next.js 16 Telegram bot",
};

export default function RootLayout({ children }) {
  return (
    <html lang="uk">
      <body>{children}</body>
    </html>
  );
}
