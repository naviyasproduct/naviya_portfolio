"use client";
import ThoughtsClient from './ThoughtsClient';

export default function ThoughtsPage() {
  return (
    <>
      <section 
      style={{ 
        padding: '3rem 1.5rem',
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
          marginBottom: '3rem',
          textAlign: 'center',
          width: '100%',
          maxWidth: '800px',
        }}
      >
        <h1 
          className="theme-text"
          style={{
            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            fontWeight: '800',
            marginBottom: '1rem',
          }}
        >
          Thoughts
        </h1>
        <p 
          style={{
            fontSize: '1.1rem',
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
    </>
  );
}
