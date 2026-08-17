import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { Search, X, ChevronUp, ChevronDown, User } from 'lucide-react';
import { LoadingState, ErrorState, EmptyState } from '../components/LoadingState';
import { loadCustomers } from '../services/dataService';
import { formatNumber, getStatusBadge } from '../utils/formatters';
import { useLocation } from 'react-router-dom';

const PAGE_SIZE = 50;

// ---- Profile Detail Modal ----
function ProfileModal({ customer, onClose }) {
  if (!customer) return null;

  const completeness = parseFloat(customer.profileCompleteness);
  const pct = isNaN(completeness) ? 0 : Math.round(completeness * 100);

  const Section = ({ title, children }) => (
    <div style={{ marginBottom: 16 }}>
      <div style={{
        fontSize: 10, fontWeight: 700, color: 'var(--text-secondary)',
        textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8,
        borderBottom: '1px solid var(--border-color)', paddingBottom: 6
      }}>{title}</div>
      {children}
    </div>
  );

  const Field = ({ label, value, highlight }) => (
    <div style={{
      display: 'flex', justifyContent: 'space-between', padding: '6px 10px',
      borderRadius: 6, marginBottom: 3,
      background: highlight ? 'rgba(79,134,247,0.06)' : 'transparent'
    }}>
      <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, minWidth: 140 }}>{label}</span>
      <span style={{ fontSize: 12, color: 'var(--text-primary)', textAlign: 'right', wordBreak: 'break-all' }}>
        {value || '—'}
      </span>
    </div>
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 640 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div className="modal-title">Customer Profile #{customer.id}</div>
            <div style={{ marginTop: 4, display: 'flex', gap: 6 }}>
              <span className={`badge ${getStatusBadge(customer.customerStatus).cls}`}>
                {customer.customerStatus || 'Unknown'}
              </span>
              {customer.masterProfile === 'True' && (
                <span className="badge badge-master">Master Profile</span>
              )}
            </div>
          </div>
          <button className="modal-close" onClick={onClose}><X size={14} /></button>
        </div>
        <div className="modal-body">
          {/* Profile Completeness */}
          <div style={{
            background: 'rgba(79,134,247,0.06)',
            border: '1px solid var(--border-color)',
            borderRadius: 10,
            padding: '12px 16px',
            marginBottom: 16,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600 }}>Profile Completeness</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: pct >= 80 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#ef4444' }}>
                {pct}%
              </span>
            </div>
            <div className="progress-bar-wrap">
              <div
                className="progress-bar-fill"
                style={{
                  width: `${pct}%`,
                  background: pct >= 80 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#ef4444'
                }}
              />
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>
              Missing attributes: {customer.missingAttributes ?? '0'}
            </div>
          </div>

          {/* Group info */}
          {customer.duplicateGroupId && customer.duplicateGroupId !== 'UNIQUE' && (
            <div style={{ marginBottom: 12 }}>
              <Field label="Duplicate Group ID" value={customer.duplicateGroupId} highlight />
              <Field label="Group Size" value={customer.groupSize} />
            </div>
          )}

          <Section title="Demographics">
            <Field label="Age" value={customer.age} />
            <Field label="Gender" value={customer.gender} />
            <Field label="Marital Status" value={customer.maritalStatus} />
            <Field label="Education Level" value={customer.educationLevel} />
            <Field label="Location" value={customer.location} />
            <Field label="Occupation" value={customer.occupation} />
            <Field label="Income Level" value={customer.incomeLevel} />
            <Field label="Segmentation Group" value={customer.segmentationGroup} />
          </Section>

          <Section title="Financial & Policy">
            <Field label="Behavioral Data" value={customer.behavioralData} />
            <Field label="Purchase History" value={customer.purchaseHistory} />
            <Field label="Insurance Products" value={customer.insuranceProducts} />
            <Field label="Coverage Amount" value={customer.coverageAmount ? `₹${formatNumber(customer.coverageAmount)}` : null} />
            <Field label="Premium Amount" value={customer.premiumAmount ? `₹${formatNumber(customer.premiumAmount)}` : null} />
            <Field label="Policy Type" value={customer.policyType} />
          </Section>

          <Section title="Communication Preferences">
            <Field label="Preferred Channel" value={customer.preferredChannel} />
            <Field label="Contact Time" value={customer.preferredContactTime} />
            <Field label="Language" value={customer.preferredLanguage} />
            <Field label="Customer Preferences" value={customer.customerPreferences} />
          </Section>

          <Section title="Standardized Values">
            <Field label="Gender (Std)" value={customer.genderStd} />
            <Field label="Education (Std)" value={customer.educationStd} />
            <Field label="Location (Std)" value={customer.locationStd} />
            <Field label="Policy Type (Std)" value={customer.policyTypeStd} />
            <Field label="Language (Std)" value={customer.languageStd} />
          </Section>
        </div>
      </div>
    </div>
  );
}

// ---- Main Page ----
export default function CustomerProfiles() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [genderFilter, setGenderFilter] = useState('All');
  const [educationFilter, setEducationFilter] = useState('All');
  const [policyFilter, setPolicyFilter] = useState('All');
  const [sortField, setSortField] = useState('id');
  const [sortDir, setSortDir] = useState('asc');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);

  const routerLocation = useLocation();
  const searchTimeout = useRef(null);

  useEffect(() => {
    const params = new URLSearchParams(routerLocation.search);
    const q = params.get('search');
    if (q) setSearch(q);
  }, [routerLocation.search]);

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
        const data = await loadCustomers();
        setCustomers(data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const uniqueStatuses = useMemo(() => ['All', ...new Set(customers.map(c => c.customerStatus).filter(Boolean))], [customers]);
  const uniqueGenders = useMemo(() => ['All', ...new Set(customers.map(c => c.gender).filter(Boolean))], [customers]);
  const uniqueEducations = useMemo(() => ['All', ...new Set(customers.map(c => c.educationLevel).filter(Boolean))], [customers]);
  const uniquePolicies = useMemo(() => ['All', ...new Set(customers.map(c => c.policyType).filter(Boolean))], [customers]);

  const filtered = useMemo(() => {
    let data = customers;
    if (debouncedSearch) {
      const s = debouncedSearch.toLowerCase();
      data = data.filter(c => c.id.toLowerCase().includes(s));
    }
    if (statusFilter !== 'All') data = data.filter(c => c.customerStatus === statusFilter);
    if (genderFilter !== 'All') data = data.filter(c => c.gender === genderFilter);
    if (educationFilter !== 'All') data = data.filter(c => c.educationLevel === educationFilter);
    if (policyFilter !== 'All') data = data.filter(c => c.policyType === policyFilter);

    data = [...data].sort((a, b) => {
      let va = a[sortField] ?? '';
      let vb = b[sortField] ?? '';
      if (sortField === 'id') {
        va = parseInt(va, 10) || 0;
        vb = parseInt(vb, 10) || 0;
      } else if (typeof va === 'string') {
        va = va.toLowerCase();
        vb = (vb || '').toLowerCase();
      }
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    return data;
  }, [customers, debouncedSearch, statusFilter, genderFilter, educationFilter, policyFilter, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
    setPage(1);
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <span className="sort-icon" style={{ opacity: 0.3 }}><ChevronUp size={10} /></span>;
    return <span className="sort-icon">{sortDir === 'asc' ? <ChevronUp size={10} /> : <ChevronDown size={10} />}</span>;
  };

  if (loading) return <LoadingState message="Loading customer profiles (52,396 records)..." />;
  if (error) return <ErrorState error={error} filename="dashboard_customer_data.csv" />;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Customer Profiles</h1>
        <p className="page-subtitle">
          Browse and search all {formatNumber(customers.length)} customer profiles — click any row for full details
        </p>
      </div>

      <div className="table-container">
        <div className="table-header">
          <span className="table-title">
            Customer Directory
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
              {search && (
                <button
                  onClick={() => { setSearch(''); setPage(1); }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                >
                  <X size={10} />
                </button>
              )}
            </div>
            <select className="select-field" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
              {uniqueStatuses.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select className="select-field" value={genderFilter} onChange={e => { setGenderFilter(e.target.value); setPage(1); }}>
              {uniqueGenders.map(g => <option key={g} value={g}>{g || 'All'}</option>)}
            </select>
            <select className="select-field" value={educationFilter} onChange={e => { setEducationFilter(e.target.value); setPage(1); }}>
              {uniqueEducations.map(e => <option key={e} value={e}>{e}</option>)}
            </select>
            <select className="select-field" value={policyFilter} onChange={e => { setPolicyFilter(e.target.value); setPage(1); }}>
              {uniquePolicies.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th onClick={() => handleSort('id')}>ID <SortIcon field="id" /></th>
                <th onClick={() => handleSort('age')}>Age <SortIcon field="age" /></th>
                <th onClick={() => handleSort('gender')}>Gender <SortIcon field="gender" /></th>
                <th onClick={() => handleSort('educationLevel')}>Education <SortIcon field="educationLevel" /></th>
                <th onClick={() => handleSort('location')}>Location <SortIcon field="location" /></th>
                <th onClick={() => handleSort('occupation')}>Occupation <SortIcon field="occupation" /></th>
                <th onClick={() => handleSort('policyType')}>Policy <SortIcon field="policyType" /></th>
                <th onClick={() => handleSort('customerStatus')}>Status <SortIcon field="customerStatus" /></th>
                <th onClick={() => handleSort('profileCompleteness')}>Completeness <SortIcon field="profileCompleteness" /></th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr>
                  <td colSpan={9}>
                    <EmptyState title="No customers match your filters" description="Try clearing some filters" />
                  </td>
                </tr>
              ) : paged.map(c => {
                const pct = parseFloat(c.profileCompleteness);
                const pctDisp = isNaN(pct) ? 0 : Math.round(pct * 100);
                const badge = getStatusBadge(c.customerStatus);
                return (
                  <tr key={c.id} style={{ cursor: 'pointer' }} onClick={() => setSelected(c)}>
                    <td><strong>#{c.id}</strong></td>
                    <td>{c.age}</td>
                    <td style={{ textTransform: 'capitalize' }}>{c.gender}</td>
                    <td style={{ textTransform: 'capitalize', maxWidth: 130, overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.educationLevel}</td>
                    <td style={{ textTransform: 'capitalize', maxWidth: 110, overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.location}</td>
                    <td style={{ textTransform: 'capitalize' }}>{c.occupation}</td>
                    <td style={{ textTransform: 'capitalize' }}>{c.policyType}</td>
                    <td><span className={`badge ${badge.cls}`}>{badge.label}</span></td>
                    <td>
                      <div className="completeness-bar">
                        <div style={{ width: 50, height: 4, background: 'rgba(0,0,0,0.3)', borderRadius: 2, overflow: 'hidden' }}>
                          <div style={{
                            width: `${pctDisp}%`, height: '100%', borderRadius: 2,
                            background: pctDisp >= 80 ? '#10b981' : pctDisp >= 50 ? '#f59e0b' : '#ef4444'
                          }} />
                        </div>
                        <span style={{ fontSize: 10, color: 'var(--text-secondary)', minWidth: 28 }}>{pctDisp}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

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
              if (p > totalPages) return null;
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

      {selected && <ProfileModal customer={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
