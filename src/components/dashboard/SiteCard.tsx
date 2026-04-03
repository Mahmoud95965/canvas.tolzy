'use client';

import { Site } from '@/types';

interface SiteCardProps {
  site: Site;
  onEdit: () => void;
  onDelete: () => void;
  onTogglePublish: () => void;
}

export default function SiteCard({ site, onEdit, onDelete, onTogglePublish }: SiteCardProps) {
  const formattedDate = new Date(site.updated_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="glass-card site-card" onClick={onEdit}>
      {/* Preview */}
      <div className="site-card-preview">
        {site.html_content ? (
          <iframe
            srcDoc={`
              <!DOCTYPE html>
              <html>
                <head><style>${site.css_content || ''}</style></head>
                <body>${site.html_content}</body>
              </html>
            `}
            title={site.name}
            sandbox="allow-same-origin"
          />
        ) : (
          <div className="site-card-preview-empty">🎨</div>
        )}
      </div>

      {/* Body */}
      <div className="site-card-body">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 className="site-card-name">{site.name}</h3>
          <span className={`badge ${site.is_published ? 'badge-published' : 'badge-draft'}`}>
            {site.is_published ? '● Live' : '● Draft'}
          </span>
        </div>
        <p className="site-card-subdomain">{site.subdomain}.tolzy.me</p>

        {/* Footer */}
        <div className="site-card-footer">
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Updated {formattedDate}
          </span>
          <div className="site-card-actions" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={onTogglePublish}
              className="btn btn-icon"
              title={site.is_published ? 'Unpublish' : 'Publish'}
              style={{ fontSize: '14px' }}
            >
              {site.is_published ? '📤' : '📥'}
            </button>
            {site.is_published && (
              <a
                href={`/sites/${site.subdomain}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-icon"
                title="View live site"
                style={{ fontSize: '14px' }}
              >
                🔗
              </a>
            )}
            <button
              onClick={onDelete}
              className="btn btn-icon"
              title="Delete site"
              style={{ fontSize: '14px', color: 'var(--danger)' }}
            >
              🗑
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
