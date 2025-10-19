"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  async function submit(e) {
    e.preventDefault();
    setError('');
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      router.push('/thoughts/admin');
    } else {
      const data = await res.json();
      setError(data?.message || 'Login failed');
    }
  }

  return (
    <div className="max-w-md mx-auto min-h-[70vh] flex items-center justify-center">
      <div className="glass-card p-10 w-full">
        <h1 className="text-3xl font-bold mb-6 text-center">Admin Login</h1>
        <form onSubmit={submit} className="flex flex-col gap-4">
          <input 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            type="password" 
            placeholder="Enter password" 
            className="glass-input w-full"
          />
          <button className="glass-button px-6 py-3 rounded-xl font-semibold hover:scale-105 transition-transform">
            Sign in
          </button>
          {error && <div className="text-red-500 text-center mt-2">{error}</div>}
        </form>
      </div>
    </div>
  );
}
