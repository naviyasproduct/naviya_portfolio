import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Nav from './components/Nav';
import ClientThemeWrapper from './components/ClientThemeWrapper';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: 'swap',
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: 'swap',
  preload: true,
});

export const metadata = {
  title: "Naviya Portfolio",
  description: "Personal portfolio with thoughts and projects",
  keywords: ["portfolio", "thoughts", "projects", "naviya"],
  authors: [{ name: "Naviya" }],
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        <link rel="preconnect" href="https://res.cloudinary.com" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{ margin: 0, padding: 0 }}
      >
        <ClientThemeWrapper>
          <Nav />
          <main>
            {children}
          </main>
        </ClientThemeWrapper>
      </body>
    </html>
  );
}
