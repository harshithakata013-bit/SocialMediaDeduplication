import React, { useEffect, useState, useMemo } from 'react';
import { ArrowDown, Check, RefreshCw } from 'lucide-react';
import { LoadingState, ErrorState } from '../components/LoadingState';
import { loadCustomers } from '../services/dataService';
import { formatNumber } from '../utils/formatters';

// Fields to show in the standardization table
const STD_FIELDS = [
  { label: 'Gender', raw: 'gender', std: 'genderStd' },
  { label: 'Marital Status', raw: 'maritalStatus', std: 'maritalStatusStd' },
  { label: 'Education Level', raw: 'educationLevel', std: 'educationStd' },
  { label: 'Location', raw: 'location', std: 'locationStd' },
  { label: 'Occupation', raw: 'occupation', std: 'occupationStd' },
  { label: 'Policy Type', raw: 'policyType', std: 'policyTypeStd' },
  { label: 'Preferred Language', raw: 'preferredLanguage', std: 'languageStd' },
  { label: 'Communication Channel', raw: 'preferredChannel', std: 'channelStd' },
  { label: 'Contact Time', raw: 'preferredContactTime', std: 'contactTimeStd' },
  { label: 'Segmentation Group', raw: 'segmentationGroup', std: 'segmentationStd' },
];

const PIPELINE_STEPS = [
  { label: 'Raw Customer Data', sub: 'Input: profile attributes as-entered', color: '#4f86f7', num: 1 },
  { label: 'Data Cleaning', sub: 'Remove nulls, fix formats, trim whitespace', color: '#8b5cf6', num: 2 },
  { label: 'Standardization', sub: 'Lowercase normalization, category mapping', color: '#22d3ee', num: 3 },
  { label: 'Blocking', sub: 'Candidate pair generation by blocking key', color: '#10b981', num: 4 },
  { label: 'Candidate Matching', sub: 'Pairwise profile comparison', color: '#f59e0b', num: 5 },
  { label: 'Similarity Scoring', sub: 'Categorical + Numeric weighted score', color: '#f97316', num: 6 },
  { label: 'Duplicate Grouping', sub: 'Cluster similar profiles into groups', color: '#ef4444', num: 7 },
  { label: 'Master Profile Selection', sub: 'Pick most complete record per group', color: '#ec4899', num: 8 },
  { label: 'Analytics Dashboard', sub: 'Visualize deduplication results', color: '#a78bfa', num: 9 },
];

export default function Standardization() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [sampleRows, setSampleRows] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await loadCustomers();
        setCustomers(data);

        // Pick sample rows that show actual variation
        // Look for rows where at least one std field differs from raw
        const samples = [];
        for (const c of data) {
          if (samples.length >= 20) break;
          const hasDiff = STD_FIELDS.some(f => {
            const raw = (c[f.raw] || '').toLowerCase().trim();
            const std = (c[f.std] || '').toLowerCase().trim();
            return raw && std && raw !== std;
          });
          if (hasDiff || samples.length < 5) samples.push(c);
        }
        setSampleRows(samples.slice(0, 10));
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const completenessStats = useMemo(() => {
    if (!customers.length) return {};
    const pcts = customers.map(c => parseFloat(c.profileCompleteness)).filter(v => !isNaN(v));
    const avg = pcts.reduce((a, b) => a + b, 0) / pcts.length;
    const perfect = pcts.filter(v => v >= 1.0).length;
    const high = pcts.filter(v => v >= 0.8 && v < 1.0).length;
    const medium = pcts.filter(v => v >= 0.5 && v < 0.8).length;
    const low = pcts.filter(v => v < 0.5).length;
    return { avg, perfect, high, medium, low, total: pcts.length };
  }, [customers]);

  if (loading) return <LoadingState message="Loading standardization data..." />;
  if (error) return <ErrorState error={error} filename="dashboard_customer_data.csv" />;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Data Standardization</h1>
        <p className="page-subtitle">
          Profile attribute normalization pipeline — transforming raw inputs into clean, comparable values
        </p>
      </div>

      {/* Pipeline Visual */}
      <div className="chart-card" style={{ marginBottom: 24 }}>
        <div className="chart-card-header">
          <div>
            <div className="chart-card-title">Deduplication Pipeline</div>
            <div className="chart-card-sub">End-to-end data processing workflow</div>
          </div>
        </div>
        <div className="pipeline">
          {PIPELINE_STEPS.map((step, i) => (
            <React.Fragment key={step.num}>
              <div className="pipeline-step">
                <div
                  className="pipeline-step-icon"
                  style={{ background: `${step.color}22`, border: `1px solid ${step.color}44` }}
                >
                  <span style={{ fontSize: 13, fontWeight: 800, color: step.color }}>{step.num}</span>
                </div>
                <div>
                  <div className="pipeline-step-text">{step.label}</div>
                  <div className="pipeline-step-sub">{step.sub}</div>
                </div>
                <div style={{ marginLeft: 'auto' }}>
                  <Check size={14} style={{ color: step.color }} />
                </div>
              </div>
              {i < PIPELINE_STEPS.length - 1 && <div className="pipeline-arrow" />}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div className="chart-card" style={{ marginBottom: 24 }}>
        <div className="chart-card-header">
          <div className="chart-card-title">Standardization Methodology</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
          {[
            { title: 'Case Normalization', desc: 'All text attributes converted to lowercase for consistent comparison (e.g., "Female" → "female")', color: '#4f86f7' },
            { title: 'Category Mapping', desc: 'Category labels mapped to canonical forms (e.g., education levels, policy types, segmentation groups)', color: '#8b5cf6' },
            { title: 'Numeric Normalization', desc: 'Numeric fields (Age, Income, Coverage, Premium) scaled to 0–1 range for similarity comparison', color: '#22d3ee' },
            { title: 'Missing Attribute Tracking', desc: 'Profile completeness score computed from non-null field count (0–1 scale)', color: '#10b981' },
            { title: 'Blocking Key', desc: 'Composite key (Gender + Education + Location) reduces comparison space from O(n²) to manageable pairs', color: '#f59e0b' },
            { title: 'Dual Scoring', desc: 'Categorical score + Numeric score combined into a weighted Similarity Score for each candidate pair', color: '#f97316' },
          ].map(item => (
            <div key={item.title} style={{
              background: `${item.color}10`,
              border: `1px solid ${item.color}30`,
              borderRadius: 10,
              padding: '14px 16px',
            }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: item.color, marginBottom: 6 }}>{item.title}</div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Before/After Table */}
      <div className="table-container" style={{ marginBottom: 24 }}>
        <div className="table-header">
          <span className="table-title">Before / After Standardization Examples</span>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            Actual records from dashboard_customer_data.csv
          </span>
        </div>
        <div className="table-wrapper">
          <table className="std-table">
            <thead>
              <tr>
                <th>Customer ID</th>
                <th>Field</th>
                <th>Original Value</th>
                <th style={{ textAlign: 'center' }}></th>
                <th>Standardized Value</th>
                <th>Changed?</th>
              </tr>
            </thead>
            <tbody>
              {sampleRows.flatMap(c =>
                STD_FIELDS.map(f => {
                  const raw = c[f.raw] || '';
                  const std = c[f.std] || '';
                  if (!raw && !std) return null;
                  const changed = raw.toLowerCase().trim() !== std.toLowerCase().trim();
                  return (
                    <tr key={`${c.id}-${f.label}`}>
                      <td style={{ color: 'var(--accent-blue)', fontWeight: 600 }}>#{c.id}</td>
                      <td style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{f.label}</td>
                      <td className="std-original">{raw || '—'}</td>
                      <td className="std-arrow">→</td>
                      <td className="std-standardized">{std || '—'}</td>
                      <td>
                        {changed ? (
                          <span className="badge badge-possible">Normalized</span>
                        ) : (
                          <span className="badge" style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)' }}>
                            <Check size={8} /> Same
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                }).filter(Boolean)
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Profile Completeness Stats */}
      <div className="chart-card">
        <div className="chart-card-header">
          <div className="chart-card-title">Profile Completeness Distribution</div>
          <div className="chart-card-sub">Based on Missing_Attributes and Profile_Completeness fields</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
          {[
            { label: 'Perfect (100%)', value: completenessStats.perfect, color: '#10b981', pct: completenessStats.perfect / completenessStats.total },
            { label: 'High (80–99%)', value: completenessStats.high, color: '#22d3ee', pct: completenessStats.high / completenessStats.total },
            { label: 'Medium (50–79%)', value: completenessStats.medium, color: '#f59e0b', pct: completenessStats.medium / completenessStats.total },
            { label: 'Low (<50%)', value: completenessStats.low, color: '#ef4444', pct: completenessStats.low / completenessStats.total },
          ].map(item => (
            <div key={item.label} style={{
              background: `${item.color}0f`,
              border: `1px solid ${item.color}30`,
              borderRadius: 10,
              padding: '14px 16px',
            }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: item.color, marginBottom: 4 }}>
                {formatNumber(item.value || 0)}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 8 }}>{item.label}</div>
              <div className="progress-bar-wrap">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${((item.pct || 0) * 100).toFixed(1)}%`, background: item.color }}
                />
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>
                {((item.pct || 0) * 100).toFixed(1)}% of profiles
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 16, padding: '10px 14px', background: 'rgba(79,134,247,0.06)', borderRadius: 8, fontSize: 12, color: 'var(--text-secondary)' }}>
          Average Profile Completeness: <strong style={{ color: 'var(--accent-blue)' }}>
            {completenessStats.avg !== undefined ? (completenessStats.avg * 100).toFixed(2) : '—'}%
          </strong> across {formatNumber(completenessStats.total || 0)} profiles
        </div>
      </div>
    </div>
  );
}
