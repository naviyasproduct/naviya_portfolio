"use client";
import { useEffect, useState } from 'react';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebaseConfig';

export default function AdminClient() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [file, setFile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    try {
      const q = query(collection(db, 'thoughts'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      setPosts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error('[AdminClient] load error:', err);
      console.error('[AdminClient] error code:', err.code);
      console.error('[AdminClient] error message:', err.message);
      // Don't throw, just log - we'll show empty state
    }
  }

  useEffect(() => { load(); }, []);

  async function handleCreate(e) {
    e.preventDefault();
    setError('');
    if (!title && !content && !file) {
      setError('Please provide a title, content or a file.');
      return;
    }
    setLoading(true);
    console.log('[AdminClient] create start', { title, content, file });
    // safety timeout in case something hangs
    let timedOut = false;
    const to = setTimeout(() => {
      timedOut = true;
      console.error('[AdminClient] create timed out');
      setError('Request timed out (30s). Check your network or Cloudinary settings.');
      setLoading(false);
    }, 30000);
    let mediaUrl = null;
    let mediaType = null;
    try {
      if (file) {
        // unsigned upload to Cloudinary from client with abort timeout
        console.log('[AdminClient] uploading file', { name: file.name, size: file.size, type: file.type });
        const form = new FormData();
        form.append('file', file);
        form.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);
        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
        console.log('[AdminClient] cloudName, preset', cloudName, process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);

        // We'll try one retry for transient network/timeout issues.
        const uploadOnce = async (signal) => {
          const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, { method: 'POST', body: form, signal });
          return res;
        };

        const maxAttempts = 2;
        let attempt = 0;
        let res = null;
        let lastErr = null;
        while (attempt < maxAttempts) {
          attempt += 1;
          const controller = new AbortController();
          const signal = controller.signal;
          // more generous timeout: 30s on first try, 45s on retry
          const timeoutMs = attempt === 1 ? 30000 : 45000;
          const abortTimeout = setTimeout(() => controller.abort(), timeoutMs);
          try {
            console.log(`[AdminClient] starting fetch to cloudinary (attempt ${attempt}/${maxAttempts}) with timeout=${timeoutMs}ms`);
            res = await uploadOnce(signal);
            console.log('[AdminClient] fetch finished', res && res.status);
            clearTimeout(abortTimeout);
            break; // success or non-network error — parse and evaluate below
          } catch (fetchErr) {
            clearTimeout(abortTimeout);
            lastErr = fetchErr;
            console.warn(`[AdminClient] cloudinary upload attempt ${attempt} failed:`, fetchErr && fetchErr.message);
            // if aborted, we'll retry once; otherwise rethrow for other errors only after attempts
            if (fetchErr.name === 'AbortError') {
              // retry loop will continue if attempt < maxAttempts
            } else {
              // non-abort/network error; break and let outer catch handle
              break;
            }
          }
        }

        if (!res) {
          throw new Error(lastErr?.message || 'Cloudinary upload failed (no response)');
        }

        const data = await res.json();
        console.log('[AdminClient] cloudinary upload response', data);
        if (!res.ok) {
          // include Cloudinary message where possible
          const cloudMsg = data?.error?.message || JSON.stringify(data).slice(0, 200);
          throw new Error(`Cloudinary upload failed (status ${res.status}): ${cloudMsg}`);
        }
        mediaUrl = data.secure_url;
        mediaType = data.resource_type === 'video' ? 'video/*' : file.type || data.format;
      }

      // Write via server-side admin endpoint (requires admin cookie)
      console.log('[AdminClient] sending post to /api/admin/create');
      const createRes = await fetch('/api/admin/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, mediaUrl, mediaType }),
      });
      const createData = await createRes.json();
      if (!createRes.ok) throw new Error(createData.error || 'Create failed');
      console.log('[AdminClient] server create response', createData);
      setTitle(''); setContent(''); setFile(null);
      await load();
      console.log('[AdminClient] reload posts done');
    } catch (err) {
      console.error('Create failed', err);
      setError(err.message || String(err));
    } finally {
      if (!timedOut) {
        clearTimeout(to);
      }
      setLoading(false);
    }
  }

  async function handleDelete(id, mediaUrl) {
    if (!confirm('Delete this post?')) return;
    try {
      // Call server-side delete endpoint (uses Admin SDK to bypass Firestore rules)
      const res = await fetch('/api/admin/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, mediaUrl })
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Delete failed');
      }
      
      await load();
    } catch (err) {
      console.error('Delete failed', err);
      alert('Delete failed: ' + (err.message || String(err)));
    }
  }

  return (
    <div className="grid gap-6 max-w-4xl mx-auto">
      <div className="glass-card p-8">
        <h2 className="text-2xl font-bold mb-6">Create New Thought</h2>
        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <input 
            value={title} 
            onChange={e => setTitle(e.target.value)} 
            placeholder="Title (optional)" 
            className="glass-input"
          />
          <textarea 
            value={content} 
            onChange={e => setContent(e.target.value)} 
            placeholder="Share your thoughts..." 
            className="glass-input min-h-[120px] resize-y"
          />
          <div className="glass-card p-4">
            <label className="block text-sm opacity-70 mb-2">Add media (image or video)</label>
            <input 
              type="file" 
              onChange={e => setFile(e.target.files?.[0] ?? null)}
              className="w-full"
            />
          </div>
          <button 
            disabled={loading} 
            className="glass-button px-6 py-3 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-transform"
          >
            {loading ? 'Creating...' : '✨ Create Thought'}
          </button>
          {error && <div className="glass-card p-4 text-red-500 bg-red-50 dark:bg-red-900/20">{error}</div>}
        </form>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Your Thoughts</h2>
        {posts.map(p => (
          <div key={p.id} className="glass-card p-6 relative">
            {/* Delete button - top right */}
            <button 
              onClick={() => handleDelete(p.id, p.mediaUrl)} 
              className="glass-button px-3 py-2 rounded-lg text-red-500 hover:scale-105 transition-transform absolute top-4 right-4"
              title="Delete post"
            >
              🗑️
            </button>
            
            {/* Title */}
            {p.title && <h4 className="font-bold text-xl mb-2 pr-12">{p.title}</h4>}
            
            {/* Date/Time - small, subtle */}
            {p.createdAt?.toDate && (
              <div className="text-xs opacity-40 mb-4">
                {p.createdAt.toDate().toLocaleString()}
              </div>
            )}
            
            {/* Image/Video - above the text, smaller */}
            {p.mediaUrl && (
              <div className="mb-4 rounded-xl overflow-hidden">
                {p.mediaType && p.mediaType.startsWith('video') ? (
                  <video controls src={p.mediaUrl} className="w-full max-h-96 object-contain rounded-xl bg-black/5" />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.mediaUrl} alt={p.title || 'media'} className="w-full max-h-96 object-contain rounded-xl" />
                )}
              </div>
            )}
            
            {/* Description/Content */}
            {p.content && <p className="opacity-80 whitespace-pre-wrap text-base leading-relaxed">{p.content}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
