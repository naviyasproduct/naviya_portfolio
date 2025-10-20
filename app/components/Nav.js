"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ThemeToggle from './ThemeToggle';
import CursorAnimationToggle from './CursorAnimationToggle';

export default function Nav() {
  const pathname = usePathname();
  const isContactPage = pathname === '/contact';

  return (
    <nav className="w-full sticky top-0 z-[100]" style={{ 
      padding: '0.5rem 1rem',
      marginLeft: 0, 
      marginRight: 0 
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '30px auto',
        background: 'rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(30px)',
        WebkitBackdropFilter: 'blur(30px)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        borderRadius: '50px',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.15), inset 0 1px 0 0 rgba(255, 255, 255, 0.1)',
        padding: '0.4rem 1rem'
      }}>
        <div className="flex items-center justify-between">
          <Link href="/" className="text-base font-bold hover:opacity-80 transition-opacity">
            Naviya
          </Link>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex gap-3 text-xs">
              <Link href="/thoughts" className="hover:opacity-70 transition-opacity">Thoughts</Link>
              <Link href="/contact" className="hover:opacity-70 transition-opacity">Contact</Link>
            </div>
            {isContactPage && <CursorAnimationToggle />}
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
}
