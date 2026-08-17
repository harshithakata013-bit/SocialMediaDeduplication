import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { Search, X, ChevronUp, ChevronDown, Filter, AlertTriangle } from 'lucide-react';
import StatCard from '../components/StatCard';
import { LoadingState, ErrorState, EmptyState } from '../components/LoadingState';
import { loadDuplicatePairs, loadCustomers } from '../services/dataService';
import {
  formatNumber, formatScore, getSimilarityBadge, getStatusBadge, CHART_COLORS
} from '../utils/formatters';

const PAGE_SIZE = 50;

// ---- Comparison Modal ----
function ComparisonModal({ pair, customers, onClose }) {
  if (!pair) return null;

  const custMap = useMemo(() => {
    const m = {};
    customers.forEach(c => { m[c.id] = c; });
    return m;
  }, [customers]);

  const profileA = custMap[pair.id1];
  const profileB = custMap[pair.id2];

  const FIELDS = [
    { label: 'Age', keyA: 'age', keyB: 'age' },
    { label: 'Gender', keyA: 'gender', keyB: 'gender' },
    { label: 'Marital Status', keyA: 'maritalStatus', keyB: 'maritalStatus' },
    { label: 'Education Level', keyA: 'educationLevel', keyB: 'educationLevel' },
    { label: 'Location', keyA: 'location', keyB: 'location' },
    { label: 'Occupation', keyA: 'occupation', keyB: 'occupation' },
    { label: 'Income Level', keyA: 'incomeLevel', keyB: 'incomeLevel' },
    { label: 'Behavioral Data', keyA: 'behavioralData', keyB: 'behavioralData' },
    { label: 'Insurance Products', keyA: 'insuranceProducts', keyB: 'insuranceProducts' },
    { label: 'Coverage Amount', keyA: 'coverageAmount', keyB: 'coverageAmount' },
    { label: 'Premium Amount', keyA: 'premiumAmount', keyB: 'premiumAmount' },
    { label: 'Policy Type', keyA: 'policyType', keyB: 'policyType' },
    { label: 'Pref. Channel', keyA: 'preferredChannel', keyB: 'preferredChannel' },
    { label: 'Contact Time', keyA: 'preferredContactTime', keyB: 'preferredContactTime' },
    { label: 'Language', keyA: 'preferredLanguage', keyB: 'preferredLanguage' },
    { label: 'Segmentation', keyA: 'segmentationGroup', keyB: 'segmentationGroup' },
    { label: 'Customer Status', keyA: 'customerStatus', keyB: 'customerStatus' },
  ];

  const simBadge = getSimilarityBadge(pair.similarityScore);

  const renderProfile = (profile, id) => {
    if (!profile) {
      return (
        <div className="profile-card">
          <div className="profile-card-header">
            <div className="profile-id">#{id}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
              Profile not in customer data file
            </div>
          </div>
          <div className="profile-fields">
            <div className="empty-state" style={{ padding: 20 }}>
              <div className="empty-state-desc">
                Customer ID {id} exists in duplicate pairs but was not found in dashboard_customer_data.csv.
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="profile-card">
        <div className="profile-card-header">
          <div className="profile-id">#{profile.id}</div>
          <div style={{ marginTop: 8, display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap' }}>
            {profile.masterProfile === 'True' && (
              <span className="badge badge-master">Master Profile</span>
            )}
            <span className={`badge ${getStatusBadge(profile.customerStatus).cls}`}>
              {getStatusBadge(profile.customerStatus).label}
            </span>
          </div>
        </div>
        <div className="profile-fields">
          {FIELDS.map(({ label, keyA }) => {
            const valA = profile[keyA];
            const other = id === pair.id1 ? custMap[pair.id2] : custMap[pair.id1];
            const valB = other?.[keyA];
            const matches = valA && valB && String(valA).toLowerCase() === String(valB).toLowerCase();
            const differs = valA && valB && !matches;
            return (
              <div
                key={label}
                className={`profile-field ${matches ? 'profile-field-match' : differs ? 'profile-field-diff' : ''}`}
              >
                <span className="profile-field-label">{label}</span>
                <span className="profile-field-value">{valA || '—'}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 960 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">Duplicate Pair Comparison</span>
          <button className="modal-close" onClick={onClose}><X size={14} /></button>
        </div>
        <div className="modal-body">
          {/* Score Summary */}
          <div className="score-display">
            <div className="score-item">
              <span className="score-label">Similarity Score</span>
              <span className="score-value" style={{ color: 'var(--accent-blue)' }}>
                {(pair.similarityScore * 100).toFixed(2)}%
              </span>
            </div>
            <div className="score-divider" />
            <div className="score-item">
              <span className="score-label">Categorical Score</span>
              <span className="score-value">
                {pair.categoricalScore !== null ? (pair.categoricalScore * 100).toFixed(2) + '%' : '—'}
              </span>
            </div>
            <div className="score-divider" />
            <div className="score-item">
              <span className="score-label">Numeric Score</span>
              <span className="score-value">
                {pair.numericScore !== null ? (pair.numericScore * 100).toFixed(2) + '%' : '—'}
              </span>
            </div>
            <div className="score-divider" />
            <div className="score-item">
              <span className="score-label">Status</span>
              <span className={`badge ${simBadge.cls}`} style={{ fontSize: 12, padding: '4px 10px' }}>
                {pair.status || simBadge.label}
              </span>
            </div>
          </div>

          {/* Field legend */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 12, fontSize: 11, flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 10, height: 10, background: 'rgba(16,185,129,0.2)', borderRadius: 2, display: 'inline-block' }} />
              <span style={{ color: 'var(--text-secondary)' }}>Matching field</span>
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 10, height: 10, background: 'rgba(239,68,68,0.15)', borderRadius: 2, display: 'inline-block' }} />
              <span style={{ color: 'var(--text-secondary)' }}>Differing field</span>
            </span>
          </div>

          {/* Two profiles side by side */}
          <div className="comparison-grid">
            {renderProfile(profileA, pair.id1)}
            <div className="comparison-vs">VS</div>
            {renderProfile(profileB, pair.id2)}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---- Main Page ----
export default function DuplicateDetection() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pairs, setPairs] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [custLoading, setCustLoading] = useState(false);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [minSim, setMinSim] = useState('');
  const [maxSim, setMaxSim] = useState('');
  const [sortField, setSortField] = useState('similarityScore');
  const [sortDir, setSortDir] = useState('desc');
  const [page, setPage] = useState(1);
  const [selectedPair, setSelectedPair] = useState(null);

  const searchTimeout = useRef(null);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(searchTimeout.current);
  }, [search]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await loadDuplicatePairs();
        setPairs(data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Lazy-load customer data when a pair is clicked
  const handleRowClick = useCallback(async (pair) => {
    setSelectedPair(pair);
    if (customers.length === 0) {
      try {
        setCustLoading(true);
        const data = await loadCustomers();
        setCustomers(data);
      } catch (e) {
        console.error('Failed to load customer data for comparison', e);
      } finally {
        setCustLoading(false);
      }
    }
  }, [customers.length]);

  const statusOptions = useMemo(() => {
    const statuses = [...new Set(pairs.map(p => p.status).filter(Boolean))];
    return ['All', ...statuses];
  }, [pairs]);

  const filtered = useMemo(() => {
    let data = pairs;

    if (debouncedSearch) {
      const s = debouncedSearch.toLowerCase();
      data = data.filter(p =>
        p.id1.toLowerCase().includes(s) || p.id2.toLowerCase().includes(s)
      );
    }

    if (statusFilter !== 'All') {
      data = data.filter(p => p.status === statusFilter);
    }

    const minVal = parseFloat(minSim);
    const maxVal = parseFloat(maxSim);
    if (!isNaN(minVal)) data = data.filter(p => p.similarityScore >= minVal);
    if (!isNaN(maxVal)) data = data.filter(p => p.similarityScore <= maxVal);

    // Sort
    data = [...data].sort((a, b) => {
      let va = a[sortField] ?? 0;
      let vb = b[sortField] ?? 0;
      if (typeof va === 'string') va = va.toLowerCase();
      if (typeof vb === 'string') vb = vb.toLowerCase();
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    return data;
  }, [pairs, debouncedSearch, statusFilter, minSim, maxSim, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const highSim = pairs.filter(p => p.similarityScore >= 0.90).length;
  const possible = pairs.filter(p => p.similarityScore >= 0.75 && p.similarityScore < 0.90).length;
  const avgSim = pairs.length > 0
    ? (pairs.reduce((s, p) => s + p.similarityScore, 0) / pairs.length).toFixed(4)
    : 0;

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
    setPage(1);
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <span className="sort-icon" style={{ opacity: 0.3 }}><ChevronUp size={10} /></span>;
    return (
      <span className="sort-icon">
        {sortDir === 'asc' ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
      </span>
    );
  };

  if (loading) return <LoadingState message="Loading duplicate pairs data..." />;
  if (error) return <ErrorState error={error} filename="dashboard_duplicate_pairs.csv" />;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Duplicate Detection</h1>
        <p className="page-subtitle">
          Investigate potential duplicate profiles — self-pairs and reverse duplicates are automatically removed
        </p>
      </div>

      {/* Data quality note */}
      <div className="info-note">
        <AlertTriangle size={14} style={{ color: '#f59e0b', flexShrink: 0, marginTop: 2 }} />
        <span className="info-note-text">
          <strong style={{ color: '#f59e0b' }}>Data Quality Applied:</strong> Self-pairs (ID₁ = ID₂),
          duplicate reverse pairs, and invalid similarity scores have been filtered out.
          Showing <strong>{formatNumber(pairs.length)}</strong> clean candidate pairs from the original 104,898 rows.
        </span>
      </div>

      {/* Summary Cards */}
      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}>
        <StatCard
          icon={Filter} iconBg="rgba(16,185,129,0.15)" iconColor="#10b981"
          title="High Similarity" value={highSim}
          description="Pairs with score ≥ 90%" badge="≥90%" badgeCls="badge-high"
        />
        <StatCard
          icon={AlertTriangle} iconBg="rgba(245,158,11,0.15)" iconColor="#f59e0b"
          title="Possible Duplicates" value={possible}
          description="Pairs with score 75–89%" badge="75–89%" badgeCls="badge-possible"
        />
        <StatCard
          icon={Search} iconBg="rgba(79,134,247,0.15)" iconColor="#4f86f7"
          title="Total Clean Pairs" value={pairs.length}
          description="After data quality filtering"
        />
        <StatCard
          icon={ChevronUp} iconBg="rgba(139,92,246,0.15)" iconColor="#8b5cf6"
          title="Avg. Similarity" value={avgSim}
          description="Mean score across clean pairs" format="percent" decimals={2}
        />
      </div>

      {/* Table */}
      <div className="table-container">
        {/* Filters */}
        <div className="table-header">
          <span className="table-title">
            Duplicate Pair Explorer
            <span style={{ color: 'var(--text-muted)', fontWeight: 400, marginLeft: 8, fontSize: 12 }}>
              {formatNumber(filtered.length)} results
            </span>
          </span>
          <div className="filter-bar">
            <div className="search-wrapper">
              <Search size={12} style={{ color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search by Customer ID..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
              />
            </div>
            <select
              className="select-field"
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            >
              {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <input
              type="number" step="0.01" min="0" max="1"
              className="input-field" placeholder="Min score" style={{ width: 90 }}
              value={minSim}
              onChange={e => { setMinSim(e.target.value); setPage(1); }}
            />
            <input
              type="number" step="0.01" min="0" max="1"
              className="input-field" placeholder="Max score" style={{ width: 90 }}
              value={maxSim}
              onChange={e => { setMaxSim(e.target.value); setPage(1); }}
            />
          </div>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th onClick={() => handleSort('id1')}>Customer ID 1 <SortIcon field="id1" /></th>
                <th onClick={() => handleSort('id2')}>Customer ID 2 <SortIcon field="id2" /></th>
                <th onClick={() => handleSort('categoricalScore')}>Categorical Score <SortIcon field="categoricalScore" /></th>
                <th onClick={() => handleSort('numericScore')}>Numeric Score <SortIcon field="numericScore" /></th>
                <th onClick={() => handleSort('similarityScore')}>Similarity Score <SortIcon field="similarityScore" /></th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <EmptyState
                      title="No pairs match your filters"
                      description="Try adjusting the search or filter criteria"
                    />
                  </td>
                </tr>
              ) : paged.map((pair, i) => {
                const simBadge = getSimilarityBadge(pair.similarityScore);
                const statusBadge = pair.status
                  ? { label: pair.status, cls: pair.status.includes('High') ? 'badge-high' : 'badge-possible' }
                  : simBadge;
                return (
                  <tr key={`${pair.id1}-${pair.id2}-${i}`} style={{ cursor: 'pointer' }} onClick={() => handleRowClick(pair)}>
                    <td><strong>#{pair.id1}</strong></td>
                    <td><strong>#{pair.id2}</strong></td>
                    <td>{pair.categoricalScore !== null ? (pair.categoricalScore * 100).toFixed(2) + '%' : '—'}</td>
                    <td>{pair.numericScore !== null ? (pair.numericScore * 100).toFixed(2) + '%' : '—'}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{
                          width: 40, height: 4, borderRadius: 2,
                          background: 'rgba(0,0,0,0.3)', overflow: 'hidden'
                        }}>
                          <div style={{
                            width: `${pair.similarityScore * 100}%`,
                            height: '100%',
                            background: pair.similarityScore >= 0.9 ? '#10b981' : pair.similarityScore >= 0.75 ? '#f59e0b' : '#6b7280',
                          }} />
                        </div>
                        <strong>{(pair.similarityScore * 100).toFixed(2)}%</strong>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${statusBadge.cls}`}>{statusBadge.label}</span>
                    </td>
                    <td>
                      <span style={{ fontSize: 11, color: 'var(--accent-blue)', cursor: 'pointer' }}>
                        Compare →
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="pagination">
          <span className="pagination-info">
            Showing {formatNumber((page - 1) * PAGE_SIZE + 1)}–{formatNumber(Math.min(page * PAGE_SIZE, filtered.length))} of {formatNumber(filtered.length)}
          </span>
          <div className="pagination-controls">
            <button className="page-btn" onClick={() => setPage(1)} disabled={page === 1}>«</button>
            <button className="page-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>‹</button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const start = Math.max(1, Math.min(page - 2, totalPages - 4));
              const p = start + i;
              return (
                <button
                  key={p}
                  className={`page-btn ${page === p ? 'active' : ''}`}
                  onClick={() => setPage(p)}
                >
                  {p}
                </button>
              );
            })}
            <button className="page-btn" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>›</button>
            <button className="page-btn" onClick={() => setPage(totalPages)} disabled={page === totalPages}>»</button>
          </div>
        </div>
      </div>

      {/* Comparison Modal */}
      {selectedPair && (
        custLoading
          ? <div className="modal-overlay"><LoadingState message="Loading customer profiles..." /></div>
          : <ComparisonModal
              pair={selectedPair}
              customers={customers}
              onClose={() => setSelectedPair(null)}
            />
      )}
    </div>
  );
}
