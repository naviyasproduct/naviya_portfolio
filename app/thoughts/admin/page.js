"use client";
import BlockBasedAdminClient from '../BlockBasedAdminClient';

export default function AdminPage() {
  return (
    <section style={{ minHeight: '100vh', padding: '2rem 0' }}>
      <BlockBasedAdminClient />
    </section>
  );
}
