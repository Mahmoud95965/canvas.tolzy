'use client';

import { useState } from 'react';

interface CreateSiteModalProps {
  onClose: () => void;
  onCreate: (name: string, subdomain: string) => Promise<void>;
}

export default function CreateSiteModal({ onClose, onCreate }: CreateSiteModalProps) {
  const [name, setName] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async () => {
    const siteName = name.trim() || 'Untitled Site';
    setCreating(true);
    setError('');
    
    // Generate a temporary random subdomain
    const tempSubdomain = `draft-${Math.random().toString(36).substring(2, 10)}`;

    try {
      await onCreate(siteName, tempSubdomain);
    } catch {
      setError('Failed to create site');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">Create New Site</h2>
        <p className="modal-subtitle">Give your site a name to get started.</p>

        {error && (
          <div style={{
            padding: '10px 14px',
            background: 'rgba(255, 107, 107, 0.1)',
            border: '1px solid rgba(255, 107, 107, 0.2)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--danger)',
            fontSize: '13px',
            marginBottom: '16px',
          }}>
            {error}
          </div>
        )}

        <div style={{ marginBottom: '24px' }}>
          <label className="input-label" htmlFor="site-name">Project Name (Optional)</label>
          <input
            id="site-name"
            type="text"
            className="input-field"
            placeholder="My Awesome Website"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
        </div>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button onClick={onClose} className="btn btn-secondary" disabled={creating}>
            Cancel
          </button>
          <button onClick={handleCreate} className="btn btn-primary" disabled={creating}>
            {creating ? (
              <>
                <div className="spinner" style={{ width: '16px', height: '16px' }} />
                Starting...
              </>
            ) : (
              'Start Building →'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

