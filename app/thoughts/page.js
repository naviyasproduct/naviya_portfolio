"use client";
import ThoughtsClient from './ThoughtsClient';

export default function ThoughtsPage() {
  return (
    <section className="max-w-5xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-5xl font-bold mb-3">Thoughts</h1>
        <p className="text-lg opacity-70">Daily reflections, ideas, and creative expressions</p>
      </div>
      <ThoughtsClient />
    </section>
  );
}
