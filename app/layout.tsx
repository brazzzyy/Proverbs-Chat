import type { Metadata } from "next";
import { Lexend } from "next/font/google";
import "./globals.css";

const lexend = Lexend({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-lexend',
});

export const metadata: Metadata = {
  title: "Proverbs Chat",
  description: "Christian AI chatbot",
  icons: {
    icon: "/images/favicon.webp",
    apple: "/images/apple-icon.webp",
  },
  appleWebApp: { title: "Proverbs Chat" },
};

export default function RootLayout({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {

  return (
    <html lang="en" className="scrollbar-hide">
      <body className={`${lexend.variable} ${lexend.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}
