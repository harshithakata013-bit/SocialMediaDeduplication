import React from 'react';
import { formatNumber } from '../utils/formatters';

export default function StatCard({
  icon: Icon,
  iconBg = 'rgba(79,134,247,0.15)',
  iconColor = '#4f86f7',
  title,
  value,
  description,
  badge,
  badgeCls = 'badge-blue',
  format = 'number',
  decimals,
}) {
  const displayVal = (() => {
    if (value === null || value === undefined) return '—';
    if (format === 'percent') {
      return `${(Number(value) * 100).toFixed(decimals ?? 2)}%`;
    }
    if (format === 'decimal') {
      return Number(value).toFixed(decimals ?? 4);
    }
    return formatNumber(value, decimals ?? 0);
  })();

  return (
    <div className="stat-card">
      <div className="stat-card-header">
        <div
          className="stat-card-icon"
          style={{ background: iconBg }}
        >
          {Icon && <Icon size={18} color={iconColor} />}
        </div>
        {badge && (
          <span className={`badge ${badgeCls}`}>{badge}</span>
        )}
      </div>
      <div>
        <div className="stat-card-value">{displayVal}</div>
        <div className="stat-card-label">{title}</div>
      </div>
      {description && (
        <div className="stat-card-desc">{description}</div>
      )}
    </div>
  );
}
