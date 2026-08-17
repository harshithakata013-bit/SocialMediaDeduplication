/**
 * utils/formatters.js
 * Shared formatting and helper utilities
 */

export function formatNumber(n, decimals = 0) {
  if (n === null || n === undefined || isNaN(n)) return '—';
  return Number(n).toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatPercent(n, decimals = 1) {
  if (n === null || n === undefined || isNaN(n)) return '—';
  return `${(Number(n) * 100).toFixed(decimals)}%`;
}

export function formatScore(n, decimals = 4) {
  if (n === null || n === undefined || isNaN(n)) return '—';
  return Number(n).toFixed(decimals);
}

export function getSimilarityBadge(score) {
  if (score === null || score === undefined || isNaN(score)) {
    return { label: 'Unknown', cls: 'badge-low' };
  }
  if (score >= 0.90) return { label: 'High Similarity', cls: 'badge-high' };
  if (score >= 0.75) return { label: 'Possible Duplicate', cls: 'badge-possible' };
  return { label: 'Low Similarity', cls: 'badge-low' };
}

export function getStatusBadge(status) {
  if (!status) return { label: 'Unknown', cls: 'badge-low' };
  const s = status.trim();
  if (s === 'Unique Customer') return { label: 'Unique Customer', cls: 'badge-unique' };
  if (s === 'Master Profile') return { label: 'Master Profile', cls: 'badge-master' };
  if (s === 'Duplicate Candidate') return { label: 'Duplicate Candidate', cls: 'badge-duplicate' };
  if (s.includes('High')) return { label: s, cls: 'badge-high' };
  if (s.includes('Possible')) return { label: s, cls: 'badge-possible' };
  return { label: s, cls: 'badge-low' };
}

export function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function titleCase(str) {
  if (!str) return '';
  return str.replace(/\b\w/g, c => c.toUpperCase());
}

export function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

export const CHART_COLORS = [
  '#4f86f7', '#8b5cf6', '#22d3ee', '#10b981',
  '#f59e0b', '#f97316', '#ef4444', '#ec4899',
  '#a78bfa', '#6ee7b7',
];

export const SIMILARITY_COLORS = {
  high: '#10b981',
  possible: '#f59e0b',
  low: '#6b7280',
};
