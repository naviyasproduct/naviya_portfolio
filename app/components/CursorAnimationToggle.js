"use client";
import { useCursorAnimation } from '../context/CursorAnimationContext';

export default function CursorAnimationToggle() {
  const { isCursorAnimationEnabled, toggleCursorAnimation, mounted } = useCursorAnimation();

  if (!mounted) {
    return (
      <button
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.3s ease'
        }}
      />
    );
  }

  return (
    <button
      onClick={toggleCursorAnimation}
      aria-label={isCursorAnimationEnabled ? "Disable cursor animation" : "Enable cursor animation"}
      style={{
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        background: isCursorAnimationEnabled 
          ? 'rgba(99, 102, 241, 0.3)' 
          : 'rgba(255, 255, 255, 0.15)',
        backdropFilter: 'blur(10px)',
        border: isCursorAnimationEnabled 
          ? '1px solid rgba(99, 102, 241, 0.5)' 
          : '1px solid rgba(255, 255, 255, 0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        flexShrink: 0,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.1)';
        if (isCursorAnimationEnabled) {
          e.currentTarget.style.background = 'rgba(99, 102, 241, 0.4)';
        } else {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        if (isCursorAnimationEnabled) {
          e.currentTarget.style.background = 'rgba(99, 102, 241, 0.3)';
        } else {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
        }
      }}
      title={isCursorAnimationEnabled ? "Turn off cursor animation" : "Turn on cursor animation"}
    >
      {isCursorAnimationEnabled ? (
        // OFF icon - showing user can turn it OFF (animation is currently ON)
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
        </svg>
      ) : (
        // ON icon - showing user can turn it ON (animation is currently OFF)
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
        </svg>
      )}
    </button>
  );
}
