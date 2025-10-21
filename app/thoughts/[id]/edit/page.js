"use client";
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../../lib/firebaseConfig';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function EditThoughtPage() {
  const params = useParams();
  const router = useRouter();
  const [thought, setThought] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  
  // Editable fields
  const [title, setTitle] = useState('');
  const [blocks, setBlocks] = useState([]);

  // Load thought data
  useEffect(() => {
    let mounted = true;
    
    async function loadThought() {
      if (!params?.id) return;
      
      setLoading(true);
      try {
        const docRef = doc(db, 'thoughts', params.id);
        const docSnap = await getDoc(docRef);
        
        if (!mounted) return;
        
        if (docSnap.exists()) {
          const data = { id: docSnap.id, ...docSnap.data() };
          setThought(data);
          setTitle(data.title || '');
          
          // Parse content into blocks
          const contentLines = (data.content || '').split('\n');
          const mediaItems = data.additionalMedia || [];
          let mediaIndex = 0;
          const parsedBlocks = [];
          
          contentLines.forEach((line, idx) => {
            const imageMatch = line.match(/\[Image:\s*(\w+),\s*(\d+)%\]/i);
            const videoMatch = line.match(/\[Video:\s*(\w+),\s*(\d+)%\]/i);
            
            if (imageMatch && mediaIndex < mediaItems.length) {
              parsedBlocks.push({
                id: `block-${parsedBlocks.length}`,
                type: 'image',
                mediaIndex: mediaIndex,
                url: mediaItems[mediaIndex].url,
                alignment: imageMatch[1] || 'center',
                widthPercent: parseInt(imageMatch[2]) || 70,
              });
              mediaIndex++;
            } else if (videoMatch && mediaIndex < mediaItems.length) {
              parsedBlocks.push({
                id: `block-${parsedBlocks.length}`,
                type: 'video',
                mediaIndex: mediaIndex,
                url: mediaItems[mediaIndex].url,
                alignment: videoMatch[1] || 'center',
                widthPercent: parseInt(videoMatch[2]) || 70,
              });
              mediaIndex++;
            } else if (line.trim()) {
              parsedBlocks.push({
                id: `block-${parsedBlocks.length}`,
                type: 'text',
                content: line,
              });
            }
          });
          
          setBlocks(parsedBlocks);
        } else {
          setError('Thought not found');
        }
      } catch (err) {
        console.error('[EditThoughtPage] Error loading thought:', err);
        if (mounted) {
          setError('Failed to load thought');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }
    
    loadThought();
    return () => { mounted = false };
  }, [params?.id]);

  // Delete a block
  const handleDeleteBlock = (blockId) => {
    if (!confirm('Are you sure you want to delete this block?')) return;
    setBlocks(blocks.filter(block => block.id !== blockId));
  };

  // Update text block content
  const handleUpdateTextBlock = (blockId, newContent) => {
    setBlocks(blocks.map(block => 
      block.id === blockId ? { ...block, content: newContent } : block
    ));
  };

  // Save changes
  const handleSave = async () => {
    if (!title.trim()) {
      alert('Title cannot be empty');
      return;
    }

    setSaving(true);
    try {
      // Reconstruct content and media
      const newContent = [];
      const newMedia = [];
      
      blocks.forEach(block => {
        if (block.type === 'text') {
          newContent.push(block.content);
        } else if (block.type === 'image') {
          newContent.push(`[Image: ${block.alignment}, ${block.widthPercent}%]`);
          newMedia.push({ url: block.url, type: 'image' });
        } else if (block.type === 'video') {
          newContent.push(`[Video: ${block.alignment}, ${block.widthPercent}%]`);
          newMedia.push({ url: block.url, type: 'video' });
        }
      });

      const response = await fetch('/api/admin/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: params.id,
          title: title.trim(),
          content: newContent.join('\n'),
          additionalMedia: newMedia,
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update thought');
      }

      alert('✅ Thought updated successfully!');
      router.push(`/thoughts/${params.id}`);
    } catch (err) {
      console.error('[EditThoughtPage] Error saving:', err);
      alert('Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

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
            Loading thought...
          </div>
        </div>
      </div>
    );
  }

  if (error || !thought) {
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
          maxWidth: '500px',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
        }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
            {error || 'Thought not found'}
          </h2>
          <Link 
            href="/thoughts"
            style={{
              display: 'inline-block',
              marginTop: '1rem',
              padding: '0.75rem 1.5rem',
              background: 'linear-gradient(135deg, #6366f1, #a855f7)',
              borderRadius: '12px',
              fontWeight: '600',
              transition: 'all 0.3s ease',
            }}
          >
            ← Back to Thoughts
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      padding: '3rem 1.5rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}>
      {/* Header */}
      <div style={{
        width: '100%',
        maxWidth: '900px',
        marginBottom: '2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '1rem',
      }}>
        <Link 
          href={`/thoughts/${params.id}`}
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
        >
          <span style={{ fontSize: '1.2rem' }}>←</span>
          <span>Cancel</span>
        </Link>

        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.5rem',
            background: saving 
              ? 'rgba(99, 102, 241, 0.2)'
              : 'linear-gradient(135deg, rgba(99, 102, 241, 0.3), rgba(168, 85, 247, 0.3))',
            backdropFilter: 'blur(30px)',
            border: '1px solid rgba(99, 102, 241, 0.4)',
            borderRadius: '12px',
            fontWeight: '600',
            fontSize: '0.95rem',
            cursor: saving ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 2px 8px rgba(99, 102, 241, 0.2)',
            opacity: saving ? 0.6 : 1,
          }}
          onMouseEnter={(e) => {
            if (!saving) {
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(99, 102, 241, 0.4), rgba(168, 85, 247, 0.4))';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(99, 102, 241, 0.3)';
            }
          }}
          onMouseLeave={(e) => {
            if (!saving) {
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(99, 102, 241, 0.3), rgba(168, 85, 247, 0.3))';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(99, 102, 241, 0.2)';
            }
          }}
        >
          <span style={{ fontSize: '1.1rem' }}>💾</span>
          <span>{saving ? 'Saving...' : 'Save Changes'}</span>
        </button>
      </div>

      {/* Edit Form */}
      <div style={{
        width: '100%',
        maxWidth: '900px',
        padding: 'clamp(1.5rem, 4vw, 3rem)',
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(30px)',
        border: '2px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '24px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
      }}>
        <h1 style={{
          fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
          fontWeight: '700',
          marginBottom: '2rem',
          textAlign: 'center',
          background: 'linear-gradient(135deg, #6366f1, #a855f7)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          ✏️ Edit Thought
        </h1>

        {/* Title Editor */}
        <div style={{ marginBottom: '2rem' }}>
          <label style={{
            display: 'block',
            marginBottom: '0.75rem',
            fontSize: '0.95rem',
            fontWeight: '600',
            opacity: 0.9,
          }}>
            Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter thought title..."
            style={{
              width: '100%',
              padding: '1rem 1.25rem',
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(10px)',
              border: '1.5px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '12px',
              fontSize: '1.1rem',
              fontWeight: '600',
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

        {/* Blocks Editor */}
        <div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem',
          }}>
            <label style={{
              fontSize: '0.95rem',
              fontWeight: '600',
              opacity: 0.9,
            }}>
              Content Blocks ({blocks.length})
            </label>
            <div style={{
              fontSize: '0.85rem',
              opacity: 0.6,
            }}>
              💡 Click delete to remove any block
            </div>
          </div>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}>
            {blocks.length === 0 ? (
              <div style={{
                padding: '3rem',
                textAlign: 'center',
                opacity: 0.5,
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '12px',
                border: '1px dashed rgba(255, 255, 255, 0.2)',
              }}>
                No content blocks yet
              </div>
            ) : (
              blocks.map((block, index) => (
                <div
                  key={block.id}
                  style={{
                    padding: '1.5rem',
                    background: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    position: 'relative',
                  }}
                >
                  {/* Block Header */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1rem',
                  }}>
                    <div style={{
                      fontSize: '0.85rem',
                      fontWeight: '600',
                      opacity: 0.7,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}>
                      {block.type === 'text' ? '📝 Text' : block.type === 'image' ? '🖼️ Image' : '🎥 Video'}
                      {' '}• Block {index + 1}
                    </div>
                    <button
                      onClick={() => handleDeleteBlock(block.id)}
                      style={{
                        padding: '0.5rem 1rem',
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: '8px',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        color: '#fca5a5',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                        e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.5)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                        e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
                      }}
                    >
                      🗑️ Delete
                    </button>
                  </div>

                  {/* Block Content */}
                  {block.type === 'text' ? (
                    <textarea
                      value={block.content}
                      onChange={(e) => handleUpdateTextBlock(block.id, e.target.value)}
                      style={{
                        width: '100%',
                        minHeight: '80px',
                        padding: '1rem',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '8px',
                        fontSize: '1rem',
                        lineHeight: '1.6',
                        outline: 'none',
                        resize: 'vertical',
                        fontFamily: 'inherit',
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = 'rgba(99, 102, 241, 0.3)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                      }}
                    />
                  ) : block.type === 'image' ? (
                    <div style={{
                      borderRadius: '8px',
                      overflow: 'hidden',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                    }}>
                      <Image
                        src={block.url}
                        alt="Content image"
                        width={600}
                        height={400}
                        loading="lazy"
                        quality={85}
                        placeholder="blur"
                        blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mM8c+bMfwAGgAL+DAhGLAAAAABJRU5ErkJggg=="
                        style={{
                          width: '100%',
                          height: 'auto',
                          display: 'block',
                        }}
                      />
                      <div style={{
                        padding: '0.75rem',
                        background: 'rgba(0, 0, 0, 0.3)',
                        fontSize: '0.85rem',
                        opacity: 0.7,
                      }}>
                        Alignment: {block.alignment} • Width: {block.widthPercent}%
                      </div>
                    </div>
                  ) : (
                    <div style={{
                      borderRadius: '8px',
                      overflow: 'hidden',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                    }}>
                      <video
                        src={block.url}
                        controls
                        style={{
                          width: '100%',
                          height: 'auto',
                          display: 'block',
                        }}
                      />
                      <div style={{
                        padding: '0.75rem',
                        background: 'rgba(0, 0, 0, 0.3)',
                        fontSize: '0.85rem',
                        opacity: 0.7,
                      }}>
                        Alignment: {block.alignment} • Width: {block.widthPercent}%
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Save Button (Bottom) */}
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            width: '100%',
            marginTop: '2rem',
            padding: '1rem',
            background: saving 
              ? 'rgba(99, 102, 241, 0.2)'
              : 'linear-gradient(135deg, #6366f1, #a855f7)',
            border: 'none',
            borderRadius: '12px',
            fontSize: '1.1rem',
            fontWeight: '600',
            cursor: saving ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease',
            opacity: saving ? 0.6 : 1,
          }}
          onMouseEnter={(e) => {
            if (!saving) {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(99, 102, 241, 0.3)';
            }
          }}
          onMouseLeave={(e) => {
            if (!saving) {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }
          }}
        >
          {saving ? '💾 Saving...' : '💾 Save Changes'}
        </button>
      </div>
    </div>
  );
}
