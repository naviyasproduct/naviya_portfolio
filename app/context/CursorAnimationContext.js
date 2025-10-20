"use client";
import { createContext, useContext, useState, useEffect } from 'react';

const CursorAnimationContext = createContext({
  isCursorAnimationEnabled: true,
  toggleCursorAnimation: () => {},
  mounted: false
});

export function CursorAnimationProvider({ children }) {
  const [isCursorAnimationEnabled, setIsCursorAnimationEnabled] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Load saved preference from localStorage
    const saved = localStorage.getItem('cursorAnimation');
    if (saved !== null) {
      setIsCursorAnimationEnabled(saved === 'true');
    }
  }, []);

  const toggleCursorAnimation = () => {
    setIsCursorAnimationEnabled((prev) => {
      const newValue = !prev;
      localStorage.setItem('cursorAnimation', newValue.toString());
      return newValue;
    });
  };

  return (
    <CursorAnimationContext.Provider 
      value={{ 
        isCursorAnimationEnabled, 
        toggleCursorAnimation,
        mounted 
      }}
    >
      {children}
    </CursorAnimationContext.Provider>
  );
}

export function useCursorAnimation() {
  const context = useContext(CursorAnimationContext);
  if (context === undefined) {
    throw new Error('useCursorAnimation must be used within a CursorAnimationProvider');
  }
  return context;
}
