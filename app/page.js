import Link from 'next/link';

export default function Home() {
  return (
    <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      {/* Hero Section */}
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h1 style={{ fontSize: 'clamp(3rem, 8vw, 6rem)', fontWeight: 'bold', marginBottom: '1.5rem' }}>
          Naviya
        </h1>
        <p style={{ fontSize: 'clamp(1.25rem, 3vw, 1.5rem)', opacity: 0.7, maxWidth: '42rem', margin: '0 auto', padding: '0 1rem' }}>
          Welcome to my portfolio. Explore my thoughts, projects, and creative work.
        </p>
      </div>

      {/* Feature Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', width: '100%', maxWidth: '80rem', marginBottom: '4rem', padding: '0 1rem' }}>
        <Link href="/thoughts" className="glass-card" style={{ padding: '2rem', textAlign: 'center', display: 'block' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>💭</div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.75rem' }}>Thoughts</h2>
          <p style={{ opacity: 0.7 }}>
            Daily reflections, ideas, and creative expressions
          </p>
        </Link>

        <Link href="/contact" className="glass-card" style={{ padding: '2rem', textAlign: 'center', display: 'block' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📧</div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.75rem' }}>Contact</h2>
          <p style={{ opacity: 0.7 }}>
            Get in touch for collaborations or inquiries
          </p>
        </Link>

        <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🚀</div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.75rem' }}>Projects</h2>
          <p style={{ opacity: 0.7 }}>
            Showcasing creative work and development
          </p>
        </div>
      </div>

      {/* About Section */}
      <div className="glass-card" style={{ padding: '2.5rem', maxWidth: '48rem', width: '100%', margin: '0 1rem' }}>
        <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '1rem' }}>About Me</h2>
        <p style={{ fontSize: '1.125rem', opacity: 0.8, lineHeight: '1.75' }}>
          I&apos;m a creative professional passionate about building meaningful experiences. 
          This portfolio is a space where I share my thoughts, document my journey, 
          and showcase my work. Feel free to explore and connect!
        </p>
      </div>
    </div>
  );
}
