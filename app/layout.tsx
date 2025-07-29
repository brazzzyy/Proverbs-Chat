import type { Metadata } from "next";
import { Lexend } from "next/font/google";
import "./globals.css";

const lexend = Lexend({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700']
});

export const metadata: Metadata = {
  title: "Proverbs Chat",
  description: "Christian AI chatbot",
};

export default function RootLayout({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {

  return (
    <html lang="en" className="scrollbar-hide">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="apple-mobile-web-app-title" content="MyWebSite" />
      </head>
      <body className={lexend.className}>
        {children}
      </body>
    </html>
  );
}
