import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Nav from './components/Nav';
import ClientThemeWrapper from './components/ClientThemeWrapper';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Naviya Portfolio",
  description: "Personal portfolio with thoughts and projects",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
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
