"use client";
import { ThemeProvider } from '../context/ThemeContext';
import { CursorAnimationProvider } from '../context/CursorAnimationContext';

export default function ClientThemeWrapper({ children }) {
  return (
    <ThemeProvider>
      <CursorAnimationProvider>
        {children}
      </CursorAnimationProvider>
    </ThemeProvider>
  );
}
