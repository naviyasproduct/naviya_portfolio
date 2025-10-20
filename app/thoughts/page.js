"use client";
import ThoughtsClient from './ThoughtsClient';

export default function ThoughtsPage() {
  return (
    <section className="max-w-5xl mx-auto" style={{ padding: '2rem 1rem' }}>
      <div className="mb-8 text-center">
        <h1 className="text-5xl font-bold mb-3">Thoughts</h1>
        <p className="text-lg opacity-70">We all have Thoughts. These are my once. Hope you enjoy them.</p>
      </div>
      <ThoughtsClient />
    </section>
  );
}
