"use client";
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ThemeToggle from './ThemeToggle';
import CursorAnimationToggle from './CursorAnimationToggle';

export default function Nav() {
  const pathname = usePathname();
  const isContactPage = pathname === '/contact';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="w-full sticky top-0 z-[100]" style={{ 
      padding: '0.5rem clamp(0.5rem, 2vw, 1rem)',
      marginLeft: 0, 
      marginRight: 0 
    }}>
      <div style={{
        maxWidth: '800px',
        margin: 'clamp(15px, 4vw, 30px) auto',
        background: 'rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(30px)',
        WebkitBackdropFilter: 'blur(30px)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        borderRadius: '50px',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.15), inset 0 1px 0 0 rgba(255, 255, 255, 0.1)',
        padding: '0.5rem 0.85rem',
        display: 'flex',
        alignItems: 'center',
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          width: '100%',
        }}>
          <Link 
            href="/" 
            style={{
              fontSize: 'clamp(0.95rem, 2.5vw, 1rem)',
              fontWeight: 'bold',
              textDecoration: 'none',
              transition: 'opacity 0.3s ease',
              flexShrink: 0,
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
          >
            Naviya
          </Link>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem',
            marginLeft: 'auto',
          }}>
            {/* Desktop Links */}
            <div className="hidden sm:flex gap-3 text-xs">
              <Link href="/thoughts" className="hover:opacity-70 transition-opacity">Thoughts</Link>
              <Link href="/contact" className="hover:opacity-70 transition-opacity">Contact</Link>
            </div>
            
            {/* Mobile Hamburger - Only show on mobile */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex sm:hidden"
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '0.35rem',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px',
                width: '36px',
                height: '36px',
                flexShrink: 0,
              }}
              aria-label="Toggle menu"
            >
              <span style={{
                display: 'block',
                width: '22px',
                height: '2.5px',
                background: 'currentColor',
                borderRadius: '2px',
                transition: 'all 0.3s ease',
                transform: mobileMenuOpen ? 'rotate(45deg) translateY(7.5px)' : 'none',
              }} />
              <span style={{
                display: 'block',
                width: '22px',
                height: '2.5px',
                background: 'currentColor',
                borderRadius: '2px',
                transition: 'all 0.3s ease',
                opacity: mobileMenuOpen ? 0 : 1,
              }} />
              <span style={{
                display: 'block',
                width: '22px',
                height: '2.5px',
                background: 'currentColor',
                borderRadius: '2px',
                transition: 'all 0.3s ease',
                transform: mobileMenuOpen ? 'rotate(-45deg) translateY(-7.5px)' : 'none',
              }} />
            </button>
            
            {/* Cursor Animation Toggle - Show on contact page for all devices */}
            {isContactPage && (
              <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                <CursorAnimationToggle />
              </div>
            )}
            
            <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div 
          className="sm:hidden"
          style={{
            position: 'absolute',
            top: 'clamp(70px, 15vw, 90px)',
            left: 'clamp(0.5rem, 2vw, 1rem)',
            right: 'clamp(0.5rem, 2vw, 1rem)',
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(30px)',
            WebkitBackdropFilter: 'blur(30px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '20px',
            padding: 'clamp(0.75rem, 2.5vw, 1rem)',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.2)',
            animation: 'slideDown 0.3s ease',
            zIndex: 90,
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <Link 
              href="/thoughts" 
              onClick={() => setMobileMenuOpen(false)}
              style={{
                padding: '0.75rem',
                borderRadius: '12px',
                textAlign: 'center',
                background: pathname === '/thoughts' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                transition: 'all 0.2s ease',
              }}
            >
              💭 Thoughts
            </Link>
            <Link 
              href="/contact" 
              onClick={() => setMobileMenuOpen(false)}
              style={{
                padding: '0.75rem',
                borderRadius: '12px',
                textAlign: 'center',
                background: pathname === '/contact' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                transition: 'all 0.2s ease',
              }}
            >
              📧 Contact
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
