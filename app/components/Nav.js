"use client";
import Link from 'next/link';
import ThemeToggle from './ThemeToggle';

export default function Nav() {
  return (
    <nav className="w-full sticky top-0 z-50 mb-8" style={{ marginLeft: 0, marginRight: 0 }}>
      <div className="glass-card">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          <Link href="/" className="text-2xl font-bold hover:opacity-80 transition-opacity">
            Naviya
          </Link>
          <div className="flex items-center gap-6">
            <div className="hidden sm:flex gap-6">
              <Link href="/" className="hover:opacity-70 transition-opacity">Home</Link>
              <Link href="/thoughts" className="hover:opacity-70 transition-opacity">Thoughts</Link>
              <Link href="/contact" className="hover:opacity-70 transition-opacity">Contact</Link>
             
            </div>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
}
