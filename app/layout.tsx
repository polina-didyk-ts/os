import "./globals.css";
import { Inter_Tight } from "next/font/google";
import localFont from "next/font/local";

const interTight = Inter_Tight({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-inter-tight",
});

const techstack = localFont({
  src: "../public/fonts/Techstack-55Roman.otf",
  display: "swap",
  variable: "--font-techstack",
});

const grotesk = localFont({
  src: "../public/fonts/NHaasGroteskDSPro-65Md.otf",
  display: "swap",
  variable: "--font-grotesk",
});

export const metadata = {
  title: "Digital Office",
  description: "Techstack internal corporate tool",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${interTight.variable} ${techstack.variable} ${grotesk.variable}`}>
      <body className={`antialiased ${interTight.className}`}>{children}</body>
    </html>
  );
}
