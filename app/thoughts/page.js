"use client";
import ThoughtsClient from './ThoughtsClient';
import ErrorBoundary from '../components/ErrorBoundary';

export default function ThoughtsPage() {
  return (
    <ErrorBoundary>
      <section 
      style={{ 
        padding: 'clamp(1.5rem, 4vw, 3rem) clamp(1rem, 3vw, 1.5rem)',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        maxWidth: '100vw',
        position: 'relative',
        zIndex: 10,
      }}
    >
      {/* Header */}
      <div 
        style={{
          marginBottom: 'clamp(2rem, 4vw, 3rem)',
          textAlign: 'center',
          width: '100%',
          maxWidth: '800px',
          padding: '0 1rem',
        }}
      >
        <h1 
          className="theme-text"
          style={{
            fontSize: 'clamp(2rem, 6vw, 4rem)',
            fontWeight: '800',
            marginBottom: 'clamp(0.75rem, 2vw, 1rem)',
          }}
        >
          Thoughts
        </h1>
        <p 
          style={{
            fontSize: 'clamp(0.95rem, 2.5vw, 1.1rem)',
            opacity: 0.7,
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: '1.6',
          }}
        >
          Everyone has a story to tell. Here are some of mine insights, ideas, and reflections I&apos;ve gathered along the way.
        </p>
      </div>

      {/* Thoughts Timeline */}
      <div style={{ width: '100%', maxWidth: '800px' }}>
        <ThoughtsClient />
      </div>
    </section>
    </ErrorBoundary>
  );
}
