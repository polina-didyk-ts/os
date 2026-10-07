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
  metadataBase: new URL("https://digital-office-eta.vercel.app"),
  title: "Digital Office",
  description: "Techstack internal corporate tool",
  openGraph: {
    title: "Digital Office",
    description: "Techstack internal corporate tool",
    url: "https://digital-office-eta.vercel.app",
    siteName: "Digital Office",
    images: [{ url: "/opengraph-image.png", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Digital Office",
    description: "Techstack internal corporate tool",
    images: ["/opengraph-image.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${interTight.variable} ${techstack.variable} ${grotesk.variable}`}>
      <body className={`antialiased ${interTight.className}`}>{children}</body>
    </html>
  );
}
