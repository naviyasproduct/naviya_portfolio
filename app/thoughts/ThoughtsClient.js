"use client";
import { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebaseConfig';

export default function ThoughtsClient() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const q = query(collection(db, 'thoughts'), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        if (!mounted) return;
        setPosts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error('[ThoughtsClient] Error loading posts:', err);
        console.error('[ThoughtsClient] Error code:', err.code);
        console.error('[ThoughtsClient] Error message:', err.message);
        if (mounted) {
          setPosts([]); // Show empty state on error
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }
    load();
    return () => { mounted = false };
  }, []);

  if (loading) return (
    <div className="glass-card p-8 text-center">
      <div className="animate-pulse">Loading thoughts...</div>
    </div>
  );
  
  if (!posts.length) return (
    <div className="glass-card p-12 text-center">
      <p className="text-lg opacity-70">No thoughts shared yet. Check back soon! ✨</p>
    </div>
  );

  return (
    <div className="grid gap-6">
      {posts.map(p => (
        <article key={p.id} className="glass-card p-8">
          {/* Title */}
          {p.title && <h3 className="font-bold text-2xl mb-2">{p.title}</h3>}
          
          {/* Date/Time - small, subtle */}
          {p.createdAt?.toDate && (
            <div className="text-xs opacity-40 mb-4">
              {p.createdAt.toDate().toLocaleString()}
            </div>
          )}
          
          {/* Image/Video - above the text */}
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
          {p.content && <p className="text-base leading-relaxed opacity-90 whitespace-pre-wrap">{p.content}</p>}
        </article>
      ))}
    </div>
  );
}
