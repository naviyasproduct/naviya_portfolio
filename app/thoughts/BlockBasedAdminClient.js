"use client";
import { useEffect, useState } from 'react';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebaseConfig';

export default function BlockBasedAdminClient() {
  // Content blocks system
  const [title, setTitle] = useState('');
  const [mainImage, setMainImage] = useState(null);
  const [contentBlocks, setContentBlocks] = useState([]);
  
  // UI state
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showBlockMenu, setShowBlockMenu] = useState(false);

  // Block types
  const BLOCK_TYPES = {
    TEXT: 'text',
    IMAGE: 'image',
    VIDEO: 'video',
    AUDIO: 'audio',
    QUOTE: 'quote',
    DIVIDER: 'divider',
  };

  async function load() {
    try {
      const q = query(collection(db, 'thoughts'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      setPosts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error('[BlockBasedAdmin] load error:', err);
    }
  }

  useEffect(() => { load(); }, []);

  // Add a new content block
  const addBlock = (type) => {
    const newBlock = {
      id: Date.now(),
      type,
      content: '',
      file: null,
      alignment: 'left',
      size: 'medium',
    };
    setContentBlocks([...contentBlocks, newBlock]);
    setShowBlockMenu(false);
  };

  // Update block content
  const updateBlock = (id, field, value) => {
    setContentBlocks(contentBlocks.map(block => 
      block.id === id ? { ...block, [field]: value } : block
    ));
  };

  // Delete block
  const deleteBlock = (id) => {
    setContentBlocks(contentBlocks.filter(block => block.id !== id));
  };

  // Move block up/down
  const moveBlock = (index, direction) => {
    const newBlocks = [...contentBlocks];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= newBlocks.length) return;
    [newBlocks[index], newBlocks[newIndex]] = [newBlocks[newIndex], newBlocks[index]];
    setContentBlocks(newBlocks);
  };

  // Upload media to Cloudinary
  async function uploadToCloudinary(file) {
    const form = new FormData();
    form.append('file', file);
    form.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
      method: 'POST',
      body: form,
    });

    if (!res.ok) throw new Error('Upload failed');
    const data = await res.json();
    return {
      url: data.secure_url,
      type: data.resource_type === 'video' ? 'video/*' : file.type || data.format,
    };
  }

  // Process all blocks and create final content
  async function processBlocks() {
    let finalContent = '';
    let mediaUrl = null;
    let mediaType = null;
    const additionalMedia = [];

    // Upload main image first
    if (mainImage) {
      const uploaded = await uploadToCloudinary(mainImage);
      mediaUrl = uploaded.url;
      mediaType = uploaded.type;
    }

    // Process each block
    for (const block of contentBlocks) {
      if (block.type === BLOCK_TYPES.TEXT) {
        finalContent += block.content + '\n\n';
      } else if (block.type === BLOCK_TYPES.QUOTE) {
        finalContent += `"${block.content}"\n\n`;
      } else if (block.type === BLOCK_TYPES.DIVIDER) {
        finalContent += '---\n\n';
      } else if (block.type === BLOCK_TYPES.IMAGE && block.file) {
        const uploaded = await uploadToCloudinary(block.file);
        additionalMedia.push({
          type: 'image',
          url: uploaded.url,
          alignment: block.alignment,
          size: block.size,
        });
        finalContent += `[Image: ${block.alignment}, ${block.size}]\n\n`;
      } else if (block.type === BLOCK_TYPES.VIDEO && block.file) {
        const uploaded = await uploadToCloudinary(block.file);
        additionalMedia.push({
          type: 'video',
          url: uploaded.url,
          alignment: block.alignment,
          size: block.size,
        });
        finalContent += `[Video: ${block.alignment}, ${block.size}]\n\n`;
      } else if (block.type === BLOCK_TYPES.AUDIO && block.file) {
        const uploaded = await uploadToCloudinary(block.file);
        additionalMedia.push({
          type: 'audio',
          url: uploaded.url,
        });
        finalContent += `[Audio]\n\n`;
      }
    }

    return { finalContent: finalContent.trim(), mediaUrl, mediaType, additionalMedia };
  }

  async function handleCreate(e) {
    e.preventDefault();
    setError('');
    
    if (!title) {
      setError('Title is required!');
      return;
    }

    setLoading(true);
    
    try {
      const { finalContent, mediaUrl, mediaType, additionalMedia } = await processBlocks();

      const createRes = await fetch('/api/admin/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content: finalContent,
          mediaUrl,
          mediaType,
          additionalMedia,
        }),
      });

      const createData = await createRes.json();
      if (!createRes.ok) throw new Error(createData.error || 'Create failed');

      // Reset form
      setTitle('');
      setMainImage(null);
      setContentBlocks([]);
      await load();
    } catch (err) {
      console.error('Create failed', err);
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id, mediaUrl) {
    if (!confirm('Delete this post?')) return;
    try {
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
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
      {/* Create New Thought Section */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(30px)',
        border: '2px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '24px',
        padding: '2.5rem',
        marginBottom: '3rem',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
      }}>
        <h2 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '2rem' }}>
          ✨ Create New Thought
        </h2>

        <form onSubmit={handleCreate}>
          {/* Title - Required */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.75rem',
              fontSize: '1rem',
              fontWeight: '600',
              opacity: 0.9,
            }}>
              📝 Title <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Enter your thought title..."
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
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'rgba(99, 102, 241, 0.4)';
                e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          {/* Main Image - Required */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.75rem',
              fontSize: '1rem',
              fontWeight: '600',
              opacity: 0.9,
            }}>
              🖼️ Main Image
            </label>
            <div style={{
              padding: '1.5rem',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '2px dashed rgba(255, 255, 255, 0.2)',
              borderRadius: '12px',
              textAlign: 'center',
            }}>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setMainImage(e.target.files?.[0] || null)}
                style={{ marginBottom: '0.5rem' }}
              />
              {mainImage && (
                <div style={{ marginTop: '1rem', opacity: 0.7 }}>
                  ✅ {mainImage.name}
                </div>
              )}
            </div>
          </div>

          {/* Content Blocks */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1rem',
            }}>
              <label style={{
                fontSize: '1rem',
                fontWeight: '600',
                opacity: 0.9,
              }}>
                📦 Content Blocks
              </label>
              <button
                type="button"
                onClick={() => setShowBlockMenu(!showBlockMenu)}
                style={{
                  padding: '0.5rem 1rem',
                  background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}
              >
                + Add Block
              </button>
            </div>

            {/* Block Type Menu */}
            {showBlockMenu && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '0.75rem',
                marginBottom: '1.5rem',
                padding: '1rem',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}>
                <button type="button" onClick={() => addBlock(BLOCK_TYPES.TEXT)} style={blockButtonStyle}>
                  📝 Text
                </button>
                <button type="button" onClick={() => addBlock(BLOCK_TYPES.IMAGE)} style={blockButtonStyle}>
                  🖼️ Image
                </button>
                <button type="button" onClick={() => addBlock(BLOCK_TYPES.VIDEO)} style={blockButtonStyle}>
                  🎥 Video
                </button>
                <button type="button" onClick={() => addBlock(BLOCK_TYPES.AUDIO)} style={blockButtonStyle}>
                  🎵 Audio
                </button>
                <button type="button" onClick={() => addBlock(BLOCK_TYPES.QUOTE)} style={blockButtonStyle}>
                  💬 Quote
                </button>
                <button type="button" onClick={() => addBlock(BLOCK_TYPES.DIVIDER)} style={blockButtonStyle}>
                  ➖ Divider
                </button>
              </div>
            )}

            {/* Render Blocks */}
            {contentBlocks.length === 0 ? (
              <div style={{
                padding: '3rem',
                textAlign: 'center',
                opacity: 0.5,
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '12px',
                border: '1px dashed rgba(255, 255, 255, 0.1)',
              }}>
                No content blocks yet. Click &ldquo;+ Add Block&rdquo; to start building!
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {contentBlocks.map((block, index) => (
                  <BlockEditor
                    key={block.id}
                    block={block}
                    index={index}
                    totalBlocks={contentBlocks.length}
                    onUpdate={updateBlock}
                    onDelete={deleteBlock}
                    onMove={moveBlock}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div style={{
              padding: '1rem',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              color: '#ef4444',
              marginBottom: '1rem',
            }}>
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '1rem',
              background: loading 
                ? 'rgba(255, 255, 255, 0.1)' 
                : 'linear-gradient(135deg, #6366f1, #a855f7)',
              border: 'none',
              borderRadius: '12px',
              fontSize: '1.1rem',
              fontWeight: '700',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              opacity: loading ? 0.5 : 1,
            }}
          >
            {loading ? '⏳ Creating...' : '🚀 Publish Thought'}
          </button>
        </form>
      </div>

      {/* Existing Thoughts List */}
      <div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '1.5rem' }}>
          📚 Your Thoughts ({posts.length})
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {posts.map(post => (
            <div
              key={post.id}
              style={{
                padding: '1.5rem',
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(30px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                position: 'relative',
              }}
            >
              <button
                onClick={() => handleDelete(post.id, post.mediaUrl)}
                style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  padding: '0.5rem 1rem',
                  background: 'rgba(239, 68, 68, 0.2)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '8px',
                  color: '#ef4444',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                🗑️ Delete
              </button>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                {post.title}
              </h3>
              <div style={{ fontSize: '0.85rem', opacity: 0.6 }}>
                {post.createdAt?.toDate?.()?.toLocaleString() || 'No date'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Block Editor Component
function BlockEditor({ block, index, totalBlocks, onUpdate, onDelete, onMove }) {
  const BLOCK_TYPES = {
    TEXT: 'text',
    IMAGE: 'image',
    VIDEO: 'video',
    AUDIO: 'audio',
    QUOTE: 'quote',
    DIVIDER: 'divider',
  };

  return (
    <div style={{
      padding: '1.5rem',
      background: 'rgba(255, 255, 255, 0.03)',
      border: '1px solid rgba(255, 255, 255, 0.15)',
      borderRadius: '12px',
      position: 'relative',
    }}>
      {/* Block Controls */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1rem',
        paddingBottom: '0.75rem',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      }}>
        <div style={{ fontSize: '0.9rem', fontWeight: '600', opacity: 0.8 }}>
          {getBlockIcon(block.type)} {getBlockLabel(block.type)}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {index > 0 && (
            <button
              type="button"
              onClick={() => onMove(index, 'up')}
              style={controlButtonStyle}
              title="Move up"
            >
              ↑
            </button>
          )}
          {index < totalBlocks - 1 && (
            <button
              type="button"
              onClick={() => onMove(index, 'down')}
              style={controlButtonStyle}
              title="Move down"
            >
              ↓
            </button>
          )}
          <button
            type="button"
            onClick={() => onDelete(block.id)}
            style={{ ...controlButtonStyle, color: '#ef4444' }}
            title="Delete"
          >
            🗑️
          </button>
        </div>
      </div>

      {/* Block Content */}
      {block.type === BLOCK_TYPES.TEXT && (
        <textarea
          value={block.content}
          onChange={(e) => onUpdate(block.id, 'content', e.target.value)}
          placeholder="Type your text here..."
          rows={5}
          style={textareaStyle}
        />
      )}

      {block.type === BLOCK_TYPES.QUOTE && (
        <textarea
          value={block.content}
          onChange={(e) => onUpdate(block.id, 'content', e.target.value)}
          placeholder="Enter your quote..."
          rows={3}
          style={{ ...textareaStyle, fontStyle: 'italic' }}
        />
      )}

      {(block.type === BLOCK_TYPES.IMAGE || block.type === BLOCK_TYPES.VIDEO) && (
        <>
          <input
            type="file"
            accept={block.type === BLOCK_TYPES.IMAGE ? 'image/*' : 'video/*'}
            onChange={(e) => onUpdate(block.id, 'file', e.target.files?.[0] || null)}
            style={{ marginBottom: '1rem' }}
          />
          {block.file && (
            <div style={{ fontSize: '0.85rem', opacity: 0.7, marginBottom: '1rem' }}>
              ✅ {block.file.name}
            </div>
          )}
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.85rem', opacity: 0.7, display: 'block', marginBottom: '0.5rem' }}>
                Alignment:
              </label>
              <select
                value={block.alignment}
                onChange={(e) => onUpdate(block.id, 'alignment', e.target.value)}
                style={selectStyle}
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', opacity: 0.7, display: 'block', marginBottom: '0.5rem' }}>
                Size:
              </label>
              <select
                value={block.size}
                onChange={(e) => onUpdate(block.id, 'size', e.target.value)}
                style={selectStyle}
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
                <option value="full">Full Width</option>
              </select>
            </div>
          </div>
        </>
      )}

      {block.type === BLOCK_TYPES.AUDIO && (
        <>
          <input
            type="file"
            accept="audio/*"
            onChange={(e) => onUpdate(block.id, 'file', e.target.files?.[0] || null)}
          />
          {block.file && (
            <div style={{ fontSize: '0.85rem', opacity: 0.7, marginTop: '0.5rem' }}>
              ✅ {block.file.name}
            </div>
          )}
        </>
      )}

      {block.type === BLOCK_TYPES.DIVIDER && (
        <div style={{
          height: '2px',
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
          margin: '0.5rem 0',
        }} />
      )}
    </div>
  );
}

// Helper functions
function getBlockIcon(type) {
  const icons = {
    text: '📝',
    image: '🖼️',
    video: '🎥',
    audio: '🎵',
    quote: '💬',
    divider: '➖',
  };
  return icons[type] || '📦';
}

function getBlockLabel(type) {
  return type.charAt(0).toUpperCase() + type.slice(1);
}

// Styles
const blockButtonStyle = {
  padding: '0.75rem 1rem',
  background: 'rgba(255, 255, 255, 0.05)',
  border: '1px solid rgba(255, 255, 255, 0.15)',
  borderRadius: '8px',
  fontSize: '0.9rem',
  fontWeight: '600',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
};

const controlButtonStyle = {
  padding: '0.25rem 0.5rem',
  background: 'rgba(255, 255, 255, 0.05)',
  border: '1px solid rgba(255, 255, 255, 0.15)',
  borderRadius: '6px',
  fontSize: '0.85rem',
  cursor: 'pointer',
};

const textareaStyle = {
  width: '100%',
  padding: '0.75rem',
  background: 'rgba(255, 255, 255, 0.05)',
  border: '1px solid rgba(255, 255, 255, 0.15)',
  borderRadius: '8px',
  fontSize: '0.95rem',
  outline: 'none',
  resize: 'vertical',
  minHeight: '100px',
};

const selectStyle = {
  padding: '0.5rem',
  background: 'rgba(255, 255, 255, 0.05)',
  border: '1px solid rgba(255, 255, 255, 0.15)',
  borderRadius: '6px',
  fontSize: '0.9rem',
  outline: 'none',
  cursor: 'pointer',
};
