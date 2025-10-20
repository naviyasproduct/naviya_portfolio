"use client";
import Link from 'next/link';
import HeroSection from './components/HeroSection';

export default function Home() {
  return (
    <div style={{ 
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw', 
      height: '100vh',
      overflow: 'hidden',
      zIndex: 0
    }}>
      {/* Hero Section with 3D Animation */}
      <div style={{ 
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%', 
        height: '100%',
        zIndex: 0
      }}>
        <HeroSection />
        
        {/* Hero Content Overlay */}
        <div style={{ 
          position: 'absolute', 
          top: '40%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          zIndex: 10,
          width: '100%',
          maxWidth: '90vw',
          padding: '1rem'
        }}>
          <h1 style={{ 
            fontSize: 'clamp(2.5rem, 10vw, 6rem)', 
            fontWeight: 'bold', 
            marginBottom: 'clamp(1rem, 3vw, 1.5rem)',
            color: 'white',
            textShadow: '0 0 30px rgba(0,0,0,0.9), 0 0 60px rgba(0,0,0,0.7), 0 4px 8px rgba(0,0,0,0.8)',
            lineHeight: 1.1,
            WebkitTextStroke: '1.5px rgba(0,0,0,0.4)',
            letterSpacing: '0.05em'
          }}>
            Naviya
          </h1>
          <p style={{ 
            fontSize: 'clamp(1rem, 4vw, 1.5rem)', 
            opacity: 1, 
            maxWidth: '600px', 
            margin: '0 auto',
            color: 'white',
            textShadow: '0 0 20px rgba(0,0,0,0.9), 0 0 40px rgba(0,0,0,0.7), 0 2px 4px rgba(0,0,0,0.8)',
            lineHeight: 1.5,
            marginBottom: 'clamp(2rem, 5vw, 3rem)',
            fontWeight: '600',
            background: 'rgba(0,0,0,0.4)',
            padding: '1rem 1.5rem',
            borderRadius: '16px',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            Welcome to my portfolio. Explore my thoughts and creative work.
          </p>
          
          {/* Quick Navigation */}
          <div style={{ 
            display: 'flex', 
            gap: 'clamp(0.75rem, 2vw, 1rem)', 
            justifyContent: 'center',
            flexWrap: 'wrap',
            padding: '0 1rem'
          }}>
            <Link href="/thoughts" className="glass-button" style={{ 
              padding: 'clamp(0.75rem, 2vw, 1rem) clamp(1.5rem, 4vw, 2rem)', 
              fontSize: 'clamp(1rem, 2.5vw, 1.125rem)',
              fontWeight: '600',
              whiteSpace: 'nowrap',
              background: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(10px)',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.4)'
            }}>
              Thoughts
            </Link>
            <Link href="/contact" className="glass-button" style={{ 
              padding: 'clamp(0.75rem, 2vw, 1rem) clamp(1.5rem, 4vw, 2rem)', 
              fontSize: 'clamp(1rem, 2.5vw, 1.125rem)',
              fontWeight: '600',
              whiteSpace: 'nowrap',
              background: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(10px)',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.4)'
            }}>
              Contact
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
