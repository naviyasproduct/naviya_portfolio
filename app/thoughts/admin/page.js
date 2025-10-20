"use client";
import AdminClient from '../AdminClient';

export default function AdminPage() {
  return (
    <section className="max-w-4xl mx-auto py-8" style={{ padding: '2rem 1rem' }}>
      <h1 className="text-2xl font-bold mb-4">Manage Thoughts</h1>
      <AdminClient />
    </section>
  );
}
