"use client";
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function EditThoughtPage() {
  const params = useParams();
  const router = useRouter();
  const [thought, setThought] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState('');
  const [blocks, setBlocks] = useState([]);
  const [comments, setComments] = useState([]);
  const [deletingComment, setDeletingComment] = useState(null);
  const [showAddBlock, setShowAddBlock] = useState(false);

  // Load thought and comments via API
  useEffect(() => {
    const loadThought = async () => {
      try {
        // Fetch thought from API
        const response = await fetch(`/api/thoughts/${params.id}`);
        const data = await response.json();
        
        if (data.success) {
          const thought = data.thought;
          console.log('Loaded thought:', thought);
          
          setThought(thought);
          setTitle(thought.title || '');
          
          // Convert old structure (content + mediaUrl + additionalMedia) to new block structure
          let thoughtBlocks = [];
          
          if (thought.blocks && Array.isArray(thought.blocks)) {
            // New structure with blocks - use as is
            thoughtBlocks = thought.blocks;
          } else {
            // Old structure - convert to blocks
            console.log('Converting old structure to blocks...');
            console.log('Content:', thought.content);
            console.log('Additional Media:', thought.additionalMedia);
            console.log('Main MediaUrl:', thought.mediaUrl);
            
            // Add main media FIRST if it exists (main image/video is displayed first)
            if (thought.mediaUrl) {
              thoughtBlocks.push({
                type: thought.mediaType?.includes('video') ? 'video' : 'image',
                url: thought.mediaUrl,
                alignment: 'center',
                widthPercent: 80,
              });
            }
            
            // Parse content text and look for media placeholders
            const content = thought.content || '';
            const lines = content.split('\n');
            const additionalMedia = thought.additionalMedia || [];
            let mediaIndex = 0;
            let currentTextBlock = '';
            
            console.log('Lines to parse:', lines);
            
            lines.forEach((line, idx) => {
              // Check for media placeholders
              const imageMatch = line.match(/\[Image:\s*(\w+),\s*(\d+)%\]/i);
              const videoMatch = line.match(/\[Video:\s*(\w+),\s*(\d+)%\]/i);
              
              if (imageMatch && mediaIndex < additionalMedia.length) {
                // Save any accumulated text first
                if (currentTextBlock.trim()) {
                  thoughtBlocks.push({
                    type: 'text',
                    content: currentTextBlock.trim(),
                  });
                  currentTextBlock = '';
                }
                
                // Add image block
                const media = additionalMedia[mediaIndex];
                thoughtBlocks.push({
                  type: 'image',
                  url: media.url,
                  alignment: imageMatch[1] || 'center',
                  widthPercent: parseInt(imageMatch[2]) || 70,
                });
                mediaIndex++;
              } else if (videoMatch && mediaIndex < additionalMedia.length) {
                // Save any accumulated text first
                if (currentTextBlock.trim()) {
                  thoughtBlocks.push({
                    type: 'text',
                    content: currentTextBlock.trim(),
                  });
                  currentTextBlock = '';
                }
                
                // Add video block
                const media = additionalMedia[mediaIndex];
                thoughtBlocks.push({
                  type: 'video',
                  url: media.url,
                  alignment: videoMatch[1] || 'center',
                  widthPercent: parseInt(videoMatch[2]) || 70,
                });
                mediaIndex++;
              } else {
                // Regular text line
                currentTextBlock += (currentTextBlock ? '\n' : '') + line;
              }
            });
            
            // Add any remaining text
            if (currentTextBlock.trim()) {
              thoughtBlocks.push({
                type: 'text',
                content: currentTextBlock.trim(),
              });
            }
          }
          
          console.log('Converted blocks:', thoughtBlocks);
          setBlocks(thoughtBlocks);
        } else {
          alert('Thought not found');
          router.push('/thoughts/manage');
          return;
        }

        // Load comments
        const commentsResponse = await fetch(`/api/thoughts/${params.id}/comments`);
        const commentsData = await commentsResponse.json();
        
        if (commentsData.success) {
          const formattedComments = commentsData.comments.map(comment => ({
            ...comment,
            createdAt: new Date(comment.createdAt),
          }));
          setComments(formattedComments);
        }
      } catch (error) {
        console.error('Error loading thought:', error);
        alert('Error loading thought: ' + error.message);
        router.push('/thoughts/manage');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      loadThought();
    }
  }, [params.id, router]);

  // Add new block
  const addBlock = (type) => {
    const newBlock = {
      type,
      content: type === 'text' ? '' : '',
      url: type !== 'text' ? '' : undefined,
      alignment: type !== 'text' ? 'center' : undefined,
      widthPercent: type !== 'text' ? 80 : undefined,
    };
    setBlocks([...blocks, newBlock]);
    setShowAddBlock(false);
  };

  // Update block
  const updateBlock = (index, field, value) => {
    const newBlocks = [...blocks];
    newBlocks[index] = { ...newBlocks[index], [field]: value };
    setBlocks(newBlocks);
  };

  // Delete block
  const deleteBlock = (index) => {
    if (confirm('Are you sure you want to delete this block?')) {
      setBlocks(blocks.filter((_, i) => i !== index));
    }
  };

  // Move block up/down
  const moveBlock = (index, direction) => {
    const newBlocks = [...blocks];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= newBlocks.length) return;
    [newBlocks[index], newBlocks[newIndex]] = [newBlocks[newIndex], newBlocks[index]];
    setBlocks(newBlocks);
  };

  // Delete comment
  const handleDeleteComment = async (commentId) => {
    if (!confirm('Are you sure you want to delete this comment? This cannot be undone.')) return;

    setDeletingComment(commentId);
    try {
      const response = await fetch('/api/admin/comments/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commentId }),
      });

      const data = await response.json();

      if (data.success) {
        setComments(comments.filter(c => c.id !== commentId));
        alert('Comment deleted successfully');
      } else {
        alert('Failed to delete comment: ' + data.error);
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Error deleting comment');
    } finally {
      setDeletingComment(null);
    }
  };

  // Save changes
  const handleSave = async () => {
    if (!title.trim()) {
      alert('Please enter a title');
      return;
    }

    setSaving(true);
    try {
      // Always save using the new block structure
      const response = await fetch(`/api/thoughts/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          blocks: blocks,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert('Thought updated successfully!');
        router.push(`/thoughts/${params.id}`);
      } else {
        alert('Error saving thought: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error saving thought:', error);
      alert('Error saving thought: ' + error.message);
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
      }}>
        <p style={{ fontSize: '1.25rem', opacity: 0.7 }}>Loading...</p>
      </div>
    );
  }

  if (!thought) {
    return null;
  }

  return (
    <div style={{
      minHeight: '100vh',
      padding: 'clamp(1.5rem, 4vw, 3rem) clamp(1rem, 3vw, 1.5rem)',
    }}>
      <div style={{
        maxWidth: '900px',
        margin: '0 auto',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
          gap: '1rem',
          flexWrap: 'wrap',
        }}>
          <h1 style={{
            fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
            fontWeight: '700',
            margin: 0,
          }}>
            ✏️ Edit Thought
          </h1>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link
              href={`/thoughts/${params.id}`}
              style={{
                padding: '0.65rem 1.25rem',
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '10px',
                fontSize: '0.95rem',
                fontWeight: '500',
                transition: 'all 0.2s ease',
                textDecoration: 'none',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
              }}
            >
              Cancel
            </Link>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                padding: '0.65rem 1.25rem',
                background: saving ? 'rgba(99, 102, 241, 0.3)' : 'rgba(99, 102, 241, 0.2)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                borderRadius: '10px',
                fontSize: '0.95rem',
                fontWeight: '500',
                color: 'inherit',
                cursor: saving ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                if (!saving) {
                  e.currentTarget.style.background = 'rgba(99, 102, 241, 0.3)';
                }
              }}
              onMouseLeave={(e) => {
                if (!saving) {
                  e.currentTarget.style.background = 'rgba(99, 102, 241, 0.2)';
                }
              }}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* Edit Form */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          padding: 'clamp(1.5rem, 3vw, 2rem)',
          marginBottom: '2rem',
        }}>
          {/* Title */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontSize: '1rem',
              fontWeight: '600',
              opacity: 0.9,
            }}>
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter title..."
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '10px',
                fontSize: '1rem',
                color: 'inherit',
                outline: 'none',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.5)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
              }}
            />
          </div>

          {/* Blocks */}
          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem',
            }}>
              <label style={{
                fontSize: '1rem',
                fontWeight: '600',
                opacity: 0.9,
              }}>
                Content Blocks
              </label>
              <button
                onClick={() => setShowAddBlock(!showAddBlock)}
                style={{
                  padding: '0.5rem 1rem',
                  background: 'rgba(99, 102, 241, 0.2)',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  color: 'inherit',
                }}
              >
                + Add Block
              </button>
            </div>

            {/* Add Block Menu */}
            {showAddBlock && (
              <div style={{
                marginBottom: '1rem',
                padding: '1rem',
                background: 'rgba(99, 102, 241, 0.1)',
                border: '1px solid rgba(99, 102, 241, 0.2)',
                borderRadius: '10px',
              }}>
                <p style={{ marginBottom: '0.75rem', fontSize: '0.9rem', opacity: 0.8 }}>
                  Select block type:
                </p>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button onClick={() => addBlock('text')} style={blockButtonStyle}>📝 Text</button>
                  <button onClick={() => addBlock('image')} style={blockButtonStyle}>🖼️ Image</button>
                  <button onClick={() => addBlock('video')} style={blockButtonStyle}>🎥 Video</button>
                </div>
              </div>
            )}

            {(!blocks || blocks.length === 0) ? (
              <p style={{
                textAlign: 'center',
                padding: '2rem',
                opacity: 0.6,
                fontSize: '0.95rem',
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '10px',
              }}>
                No content blocks yet. Click &quot;+ Add Block&quot; to add content.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {blocks.map((block, index) => (
                  <div
                    key={index}
                    style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      padding: '1rem',
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '0.75rem',
                      flexWrap: 'wrap',
                      gap: '0.5rem',
                    }}>
                      <span style={{
                        fontSize: '0.85rem',
                        padding: '0.25rem 0.5rem',
                        background: 'rgba(99, 102, 241, 0.2)',
                        borderRadius: '6px',
                        fontWeight: '500',
                      }}>
                        {block.type}
                      </span>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => moveBlock(index, 'up')}
                          disabled={index === 0}
                          style={{
                            padding: '0.35rem 0.65rem',
                            background: 'rgba(255, 255, 255, 0.08)',
                            border: '1px solid rgba(255, 255, 255, 0.15)',
                            borderRadius: '6px',
                            fontSize: '0.85rem',
                            cursor: index === 0 ? 'not-allowed' : 'pointer',
                            opacity: index === 0 ? 0.5 : 1,
                          }}
                        >
                          ↑
                        </button>
                        <button
                          onClick={() => moveBlock(index, 'down')}
                          disabled={index === blocks.length - 1}
                          style={{
                            padding: '0.35rem 0.65rem',
                            background: 'rgba(255, 255, 255, 0.08)',
                            border: '1px solid rgba(255, 255, 255, 0.15)',
                            borderRadius: '6px',
                            fontSize: '0.85rem',
                            cursor: index === blocks.length - 1 ? 'not-allowed' : 'pointer',
                            opacity: index === blocks.length - 1 ? 0.5 : 1,
                          }}
                        >
                          ↓
                        </button>
                        <button
                          onClick={() => deleteBlock(index)}
                          style={{
                            padding: '0.35rem 0.75rem',
                            background: 'rgba(239, 68, 68, 0.15)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            borderRadius: '6px',
                            fontSize: '0.85rem',
                            color: '#ef4444',
                            cursor: 'pointer',
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    {block.type === 'text' ? (
                      <textarea
                        value={block.content || ''}
                        onChange={(e) => updateBlock(index, 'content', e.target.value)}
                        placeholder="Enter text..."
                        rows={4}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '8px',
                          fontSize: '0.95rem',
                          color: 'inherit',
                          outline: 'none',
                          resize: 'vertical',
                          fontFamily: 'inherit',
                        }}
                      />
                    ) : (
                      <div>
                        <input
                          type="url"
                          value={block.url || ''}
                          onChange={(e) => updateBlock(index, 'url', e.target.value)}
                          placeholder={`Enter ${block.type} URL (e.g., Cloudinary URL)...`}
                          style={{
                            width: '100%',
                            padding: '0.75rem',
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '8px',
                            fontSize: '0.95rem',
                            color: 'inherit',
                            outline: 'none',
                            marginBottom: '0.75rem',
                          }}
                        />
                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                          <div>
                            <label style={{ fontSize: '0.85rem', opacity: 0.8, marginBottom: '0.25rem', display: 'block' }}>
                              Alignment
                            </label>
                            <select
                              value={block.alignment || 'center'}
                              onChange={(e) => updateBlock(index, 'alignment', e.target.value)}
                              style={{
                                padding: '0.5rem',
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '6px',
                                color: 'inherit',
                                fontSize: '0.9rem',
                              }}
                            >
                              <option value="left">Left</option>
                              <option value="center">Center</option>
                              <option value="right">Right</option>
                            </select>
                          </div>
                          <div>
                            <label style={{ fontSize: '0.85rem', opacity: 0.8, marginBottom: '0.25rem', display: 'block' }}>
                              Width (%)
                            </label>
                            <input
                              type="number"
                              min="20"
                              max="100"
                              value={block.widthPercent || 80}
                              onChange={(e) => updateBlock(index, 'widthPercent', parseInt(e.target.value))}
                              style={{
                                padding: '0.5rem',
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '6px',
                                color: 'inherit',
                                fontSize: '0.9rem',
                                width: '80px',
                              }}
                            />
                          </div>
                        </div>
                        {block.url && (
                          <div style={{ marginTop: '0.75rem' }}>
                            {block.type === 'image' ? (
                              <Image
                                src={block.url}
                                alt="Preview"
                                width={400}
                                height={300}
                                style={{
                                  maxWidth: '100%',
                                  height: 'auto',
                                  borderRadius: '8px',
                                }}
                              />
                            ) : (
                              <video
                                src={block.url}
                                controls
                                style={{
                                  maxWidth: '100%',
                                  height: 'auto',
                                  borderRadius: '8px',
                                }}
                              />
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Comments Section */}
        {comments.length > 0 && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            padding: 'clamp(1.5rem, 3vw, 2rem)',
          }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              marginBottom: '1.5rem',
            }}>
              💬 Comments ({comments.length})
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    padding: '1rem',
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '0.5rem',
                    gap: '1rem',
                  }}>
                    <div style={{ flex: 1 }}>
                      <p style={{
                        fontWeight: '600',
                        marginBottom: '0.25rem',
                        fontSize: '0.95rem',
                      }}>
                        {comment.name}
                      </p>
                      <p style={{
                        fontSize: '0.85rem',
                        opacity: 0.6,
                      }}>
                        {comment.createdAt.toLocaleDateString()} at {comment.createdAt.toLocaleTimeString()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      disabled={deletingComment === comment.id}
                      style={{
                        padding: '0.5rem 1rem',
                        background: deletingComment === comment.id ? 'rgba(239, 68, 68, 0.3)' : 'rgba(239, 68, 68, 0.15)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: '8px',
                        fontSize: '0.85rem',
                        color: '#ef4444',
                        cursor: deletingComment === comment.id ? 'not-allowed' : 'pointer',
                        fontWeight: '500',
                      }}
                    >
                      {deletingComment === comment.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                  <p style={{
                    fontSize: '0.95rem',
                    lineHeight: 1.6,
                    whiteSpace: 'pre-wrap',
                  }}>
                    {comment.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


