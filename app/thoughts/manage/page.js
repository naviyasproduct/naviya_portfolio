"use client";
import { useEffect, useState, useMemo } from 'react';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../../../lib/firebaseConfig';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import ErrorBoundary from '../../components/ErrorBoundary';

export default function ManageThoughtsPage() {
  const router = useRouter();
  const [thoughts, setThoughts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Load all thoughts
  useEffect(() => {
    const loadThoughts = async () => {
      try {
        const q = query(collection(db, 'thoughts'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        const thoughtsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate() : new Date(),
        }));
        setThoughts(thoughtsData);
      } catch (err) {
        console.error('Error loading thoughts:', err);
      } finally {
        setLoading(false);
      }
    };

    loadThoughts();
  }, []);

  // Delete thought
  const handleDelete = async (id, mediaUrl) => {
    if (!confirm('Are you sure you want to delete this thought? This action cannot be undone.')) return;

    setDeleting(id);
    try {
      const response = await fetch('/api/admin/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, mediaUrl })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete thought');
      }

      // Remove from UI
      setThoughts(thoughts.filter(t => t.id !== id));
      alert('✅ Thought deleted successfully!');
    } catch (err) {
      console.error('Error deleting thought:', err);
      alert('Failed to delete thought. Please try again.');
    } finally {
      setDeleting(null);
    }
  };

  // Filter thoughts by search term
  const filteredThoughts = thoughts.filter(thought =>
    thought.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    thought.content?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group thoughts by date
  const groupedThoughts = filteredThoughts.reduce((acc, thought) => {
    const dateString = thought.createdAt.toDateString();
    if (!acc[dateString]) {
      acc[dateString] = [];
    }
    acc[dateString].push(thought);
    return acc;
  }, {});

  // Sort dates in descending order
  const sortedDates = Object.keys(groupedThoughts).sort((a, b) => {
    return new Date(b) - new Date(a);
  });

  // Check if today
  const today = new Date().toDateString();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
      }}>
        <div style={{
          padding: '3rem',
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(30px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '24px',
          textAlign: 'center',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
        }}>
          <div className="animate-pulse" style={{ fontSize: '1.1rem', opacity: 0.7 }}>
            Loading thoughts...
          </div>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div style={{
        minHeight: '100vh',
        padding: 'clamp(1.5rem, 4vw, 3rem) clamp(1rem, 3vw, 1.5rem)',
      }}>
        <div style={{
          maxWidth: '1400px',
        margin: '0 auto',
      }}>
        {/* Header */}
        <div style={{
          marginBottom: '2rem',
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem',
            gap: '1rem',
            flexWrap: 'wrap',
          }}>
            <h1 style={{
              fontSize: 'clamp(2rem, 5vw, 2.75rem)',
              fontWeight: '700',
              background: 'linear-gradient(135deg, #6366f1, #a855f7)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              📋 Manage All Thoughts
            </h1>

            <Link
              href="/thoughts/admin"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(30px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                fontWeight: '600',
                fontSize: '0.95rem',
                transition: 'all 0.3s ease',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <span style={{ fontSize: '1.1rem' }}>←</span>
              <span>Back to Admin</span>
            </Link>
          </div>

          {/* Search Bar */}
          <div style={{
            marginBottom: '1rem',
          }}>
            <input
              type="text"
              placeholder="🔍 Search thoughts by title or content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: 'clamp(0.75rem, 2vw, 1rem) clamp(1rem, 3vw, 1.5rem)',
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(30px)',
                border: '1.5px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '16px',
                fontSize: 'clamp(0.9rem, 2vw, 1rem)',
                outline: 'none',
                transition: 'all 0.3s ease',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'rgba(99, 102, 241, 0.4)';
                e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1), 0 4px 12px rgba(0, 0, 0, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)';
              }}
            />
          </div>

          {/* Stats */}
          <div style={{
            display: 'flex',
            gap: '1rem',
            flexWrap: 'wrap',
          }}>
            <div style={{
              padding: '0.75rem 1.5rem',
              background: 'rgba(99, 102, 241, 0.1)',
              border: '1px solid rgba(99, 102, 241, 0.2)',
              borderRadius: '12px',
              fontSize: '0.9rem',
              fontWeight: '600',
            }}>
              Total: {thoughts.length} thoughts
            </div>
            {searchTerm && (
              <div style={{
                padding: '0.75rem 1.5rem',
                background: 'rgba(168, 85, 247, 0.1)',
                border: '1px solid rgba(168, 85, 247, 0.2)',
                borderRadius: '12px',
                fontSize: '0.9rem',
                fontWeight: '600',
              }}>
                Found: {filteredThoughts.length} thoughts
              </div>
            )}
            <div style={{
              padding: '0.75rem 1.5rem',
              background: 'rgba(34, 197, 94, 0.1)',
              border: '1px solid rgba(34, 197, 94, 0.2)',
              borderRadius: '12px',
              fontSize: '0.9rem',
              fontWeight: '600',
            }}>
              Dates: {sortedDates.length}
            </div>
          </div>
        </div>

        {/* Thoughts Grouped by Date */}
        {sortedDates.length === 0 ? (
          <div style={{
            padding: '4rem 2rem',
            textAlign: 'center',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px dashed rgba(255, 255, 255, 0.2)',
            borderRadius: '24px',
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🤔</div>
            <p style={{ fontSize: '1.2rem', opacity: 0.7 }}>
              {searchTerm ? 'No thoughts found matching your search.' : 'No thoughts yet. Create your first one!'}
            </p>
          </div>
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'clamp(1.5rem, 3vw, 2rem)',
          }}>
            {sortedDates.map(dateString => {
              const datePosts = groupedThoughts[dateString];
              const isToday = dateString === today;
              const date = new Date(dateString);
              
              return (
                <div key={dateString}>
                  {/* Date Header */}
                  <div style={{
                    padding: isToday ? '1.5rem 2rem' : '1rem 1.5rem',
                    background: isToday 
                      ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(168, 85, 247, 0.15))'
                      : 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(30px)',
                    border: isToday 
                      ? '2px solid rgba(99, 102, 241, 0.3)'
                      : '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '20px',
                    marginBottom: '1rem',
                    boxShadow: isToday 
                      ? '0 8px 32px rgba(99, 102, 241, 0.2), 0 2px 8px rgba(0, 0, 0, 0.1)'
                      : '0 4px 16px rgba(0, 0, 0, 0.1)',
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1.5rem',
                      flexWrap: 'wrap',
                    }}>
                      {/* Calendar Icon & Date */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                      }}>
                        <div style={{
                          width: isToday ? '70px' : '60px',
                          height: isToday ? '70px' : '60px',
                          background: isToday 
                            ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.3), rgba(168, 85, 247, 0.3))'
                            : 'rgba(255, 255, 255, 0.08)',
                          borderRadius: '16px',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: isToday 
                            ? '2px solid rgba(99, 102, 241, 0.4)'
                            : '1px solid rgba(255, 255, 255, 0.15)',
                          flexShrink: 0,
                        }}>
                          <div style={{
                            fontSize: isToday ? '0.75rem' : '0.65rem',
                            fontWeight: '600',
                            opacity: 0.7,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                          }}>
                            {date.toLocaleDateString('default', { month: 'short' })}
                          </div>
                          <div style={{
                            fontSize: isToday ? '1.75rem' : '1.5rem',
                            fontWeight: '700',
                            lineHeight: 1,
                          }}>
                            {date.getDate()}
                          </div>
                        </div>
                        
                        <div>
                          <div style={{
                            fontSize: isToday ? '1.5rem' : '1.25rem',
                            fontWeight: '700',
                            marginBottom: '0.25rem',
                          }}>
                            {isToday ? '✨ Today' : date.toLocaleDateString('default', { 
                              weekday: 'long',
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </div>
                          <div style={{
                            fontSize: '0.9rem',
                            opacity: 0.6,
                          }}>
                            {datePosts.length} {datePosts.length === 1 ? 'thought' : 'thoughts'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Thoughts Grid for this Date */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                    gap: 'clamp(1rem, 2vw, 1.5rem)',
                  }}>
                    {datePosts.map((thought) => (
              <div
                key={thought.id}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(30px)',
                  border: '2px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
                  display: 'flex',
                  flexDirection: 'column',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.3)';
                  e.currentTarget.style.boxShadow = '0 8px 32px rgba(99, 102, 241, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.1)';
                }}
              >
                {/* Thumbnail */}
                {thought.mediaUrl && (
                  <div style={{
                    width: '100%',
                    height: '200px',
                    position: 'relative',
                    background: 'rgba(0, 0, 0, 0.3)',
                  }}>
                    <Image
                      src={thought.mediaUrl}
                      alt={thought.title}
                      fill
                      loading="lazy"
                      quality={85}
                      placeholder="blur"
                      blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mM8c+bMfwAGgAL+DAhGLAAAAABJRU5ErkJggg=="
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                )}

                {/* Content */}
                <div style={{ padding: 'clamp(1rem, 3vw, 1.5rem)', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  {/* Title */}
                  <h3 style={{
                    fontSize: 'clamp(1.1rem, 2.5vw, 1.35rem)',
                    fontWeight: '700',
                    marginBottom: '0.75rem',
                    lineHeight: '1.4',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}>
                    {thought.title}
                  </h3>

                  {/* Preview */}
                  <p style={{
                    fontSize: '0.9rem',
                    lineHeight: '1.6',
                    opacity: 0.7,
                    marginBottom: '1rem',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    flex: 1,
                  }}>
                    {thought.content?.replace(/\[Image:.*?\]/g, '').replace(/\[Video:.*?\]/g, '').substring(0, 150)}...
                  </p>

                  {/* Meta */}
                  <div style={{
                    fontSize: '0.8rem',
                    opacity: 0.5,
                    marginBottom: '1rem',
                  }}>
                    {thought.createdAt.toLocaleDateString('default', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                    {' • '}
                    {thought.likeCount || 0} likes
                  </div>

                  {/* Actions */}
                  <div style={{
                    display: 'flex',
                    gap: '0.75rem',
                  }}>
                    {/* View Button */}
                    <Link
                      href={`/thoughts/${thought.id}`}
                      style={{
                        flex: 1,
                        padding: '0.75rem',
                        background: 'rgba(99, 102, 241, 0.1)',
                        border: '1px solid rgba(99, 102, 241, 0.3)',
                        borderRadius: '10px',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        textAlign: 'center',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(99, 102, 241, 0.2)';
                        e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.5)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(99, 102, 241, 0.1)';
                        e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.3)';
                      }}
                    >
                      👁️ View
                    </Link>

                    {/* Edit Button */}
                    <Link
                      href={`/thoughts/${thought.id}/edit`}
                      style={{
                        flex: 1,
                        padding: '0.75rem',
                        background: 'rgba(168, 85, 247, 0.1)',
                        border: '1px solid rgba(168, 85, 247, 0.3)',
                        borderRadius: '10px',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        textAlign: 'center',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(168, 85, 247, 0.2)';
                        e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.5)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(168, 85, 247, 0.1)';
                        e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.3)';
                      }}
                    >
                      ✏️ Edit
                    </Link>

                    {/* Delete Button */}
                    <button
                      onClick={() => handleDelete(thought.id, thought.mediaUrl)}
                      disabled={deleting === thought.id}
                      style={{
                        flex: 1,
                        padding: '0.75rem',
                        background: deleting === thought.id
                          ? 'rgba(239, 68, 68, 0.2)'
                          : 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: '10px',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        cursor: deleting === thought.id ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s ease',
                        color: '#fca5a5',
                        opacity: deleting === thought.id ? 0.5 : 1,
                      }}
                      onMouseEnter={(e) => {
                        if (deleting !== thought.id) {
                          e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                          e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.5)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (deleting !== thought.id) {
                          e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                          e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
                        }
                      }}
                    >
                      {deleting === thought.id ? '🗑️ Deleting...' : '🗑️ Delete'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        </div>
      </div>
    </ErrorBoundary>
  );
}