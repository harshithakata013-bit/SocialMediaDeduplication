import React from 'react';

export function LoadingState({ message = 'Loading data...' }) {
  return (
    <div className="loading-container">
      <div className="spinner" />
      <span className="loading-text">{message}</span>
    </div>
  );
}

export function LoadingSkeleton({ rows = 5 }) {
  return (
    <div style={{ padding: '16px' }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="skeleton"
          style={{
            height: 36,
            marginBottom: 8,
            opacity: 1 - i * 0.12,
          }}
        />
      ))}
    </div>
  );
}

export function EmptyState({ icon, title = 'No data found', description }) {
  return (
    <div className="empty-state">
      {icon && <div style={{ fontSize: 32, marginBottom: 8 }}>{icon}</div>}
      <div className="empty-state-title">{title}</div>
      {description && <div className="empty-state-desc">{description}</div>}
    </div>
  );
}

export function ErrorState({ error, filename }) {
  return (
    <div className="empty-state">
      <div style={{ fontSize: 28, marginBottom: 8 }}>⚠️</div>
      <div className="empty-state-title">
        {filename ? `Unable to load ${filename}` : 'Data load error'}
      </div>
      <div className="empty-state-desc">
        {error?.message || 'An unexpected error occurred. Check that CSV files exist in public/data/'}
      </div>
    </div>
  );
}
