"use client";
import { ThemeProvider } from '../context/ThemeContext';

export default function ClientThemeWrapper({ children }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}
