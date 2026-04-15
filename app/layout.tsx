import "./globals.css";

export const metadata = {
  title: "ts-web-starter",
  description: "Modern TypeScript web starter with Next.js, Prisma, and Better Auth",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
