import React, { useEffect, useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell,
  PieChart, Pie, ResponsiveContainer
} from 'recharts';
import ChartCard from '../components/ChartCard';
import { LoadingState, ErrorState } from '../components/LoadingState';
import { loadCustomers, loadKPIs, loadSimilarity } from '../services/dataService';
import { formatNumber, CHART_COLORS, titleCase } from '../utils/formatters';
import { Info, AlertTriangle } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <div className="tooltip-label">{label || payload[0]?.name}</div>
        <div className="tooltip-value">{formatNumber(payload[0]?.value)}</div>
      </div>
    );
  }
  return null;
};

export default function DataQuality() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [kpis, setKpis] = useState({});
  const [simData, setSimData] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [c, k, s] = await Promise.all([loadCustomers(), loadKPIs(), loadSimilarity()]);
        setCustomers(c);
        setKpis(k);
        setSimData(s);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const stats = useMemo(() => {
    if (!customers.length) return {};

    const pcts = customers.map(c => parseFloat(c.profileCompleteness)).filter(v => !isNaN(v));
    const avg = pcts.reduce((a, b) => a + b, 0) / pcts.length;
    const missingCounts = customers.map(c => parseInt(c.missingAttributes, 10)).filter(v => !isNaN(v));
    const totalMissingAttrs = missingCounts.reduce((a, b) => a + b, 0);
    const zeroMissing = missingCounts.filter(v => v === 0).length;
    const hasMissing = missingCounts.filter(v => v > 0).length;

    // Completeness buckets
    const buckets = {
      '100%': pcts.filter(v => v >= 1.0).length,
      '90–99%': pcts.filter(v => v >= 0.9 && v < 1.0).length,
      '80–89%': pcts.filter(v => v >= 0.8 && v < 0.9).length,
      '70–79%': pcts.filter(v => v >= 0.7 && v < 0.8).length,
      '50–69%': pcts.filter(v => v >= 0.5 && v < 0.7).length,
      '<50%': pcts.filter(v => v < 0.5).length,
    };

    // Status distribution
    const statusMap = {};
    customers.forEach(c => {
      const s = c.customerStatus || 'Unknown';
      statusMap[s] = (statusMap[s] || 0) + 1;
    });

    return {
      total: customers.length,
      avgCompleteness: avg,
      totalMissingAttrs,
      zeroMissing,
      hasMissing,
      buckets,
      statusMap,
    };
  }, [customers]);

  if (loading) return <LoadingState message="Loading data quality metrics..." />;
  if (error) return <ErrorState error={error} />;

  const bucketChart = Object.entries(stats.buckets || {}).map(([name, value]) => ({ name, value }));
  const statusChart = Object.entries(stats.statusMap || {}).map(([name, value]) => ({ name, value }));
  const simChart = simData.map(d => ({
    name: d.range.replace(/[()[\]]/g, '').replace(', ', '–'),
    value: d.count,
  }));

  const kpiRows = kpis['Total Profiles'] && {
    kpiTotal: kpis['Total Profiles'],
    csvTotal: customers.length,
    diff: Math.abs((kpis['Total Profiles'] || 0) - customers.length),
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Data Quality</h1>
        <p className="page-subtitle">
          Completeness metrics, standardization coverage, and source reconciliation
        </p>
      </div>

      {/* KPI vs CSV discrepancy note */}
      <div className="info-note" style={{ borderColor: 'rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.05)' }}>
        <AlertTriangle size={14} style={{ color: '#ef4444', flexShrink: 0, marginTop: 2 }} />
        <span className="info-note-text">
          <strong style={{ color: '#ef4444' }}>Known Data Discrepancy:</strong>{' '}
          <code>dashboard_kpis.csv</code> reports <strong>{formatNumber(kpis['Total Profiles'])}</strong> total profiles,
          while <code>dashboard_customer_data.csv</code> contains <strong>{formatNumber(customers.length)}</strong> rows —
          a difference of <strong>{formatNumber(Math.abs((kpis['Total Profiles'] || 0) - customers.length))}</strong> records.
          This discrepancy is retained as-is from the Colab pipeline export and is documented here for transparency.
          KPI cards use the KPI file; customer-level analysis uses the customer data file.
        </span>
      </div>

      {/* Summary Cards */}
      <div className="quality-grid">
        {[
          { label: 'Total Records (CSV)', value: formatNumber(stats.total), sub: 'dashboard_customer_data.csv', color: '#4f86f7' },
          { label: 'Total Profiles (KPI)', value: formatNumber(kpis['Total Profiles']), sub: 'dashboard_kpis.csv', color: '#8b5cf6' },
          { label: 'Avg Completeness', value: stats.avgCompleteness !== undefined ? `${(stats.avgCompleteness * 100).toFixed(2)}%` : '—', sub: 'Profile_Completeness field', color: '#10b981' },
          { label: 'Profiles with No Missing', value: formatNumber(stats.zeroMissing), sub: `${((stats.zeroMissing / stats.total) * 100).toFixed(1)}% fully complete`, color: '#22d3ee' },
          { label: 'Profiles with Missing Attrs', value: formatNumber(stats.hasMissing), sub: `${((stats.hasMissing / stats.total) * 100).toFixed(1)}% have gaps`, color: '#f59e0b' },
          { label: 'Total Missing Attr Slots', value: formatNumber(stats.totalMissingAttrs), sub: 'Sum of Missing_Attributes', color: '#f97316' },
          { label: 'Duplicate Candidates', value: formatNumber(kpis['Duplicate Candidates']), sub: 'From KPIs', color: '#ef4444' },
          { label: 'Master Profiles', value: formatNumber(kpis['Master Profiles']), sub: 'From KPIs', color: '#a78bfa' },
        ].map(item => (
          <div key={item.label} className="quality-card" style={{ borderColor: `${item.color}30` }}>
            <div className="quality-label">{item.label}</div>
            <div className="quality-value" style={{ color: item.color }}>{item.value}</div>
            <div className="quality-sub">{item.sub}</div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="chart-grid">
        {/* Completeness Buckets */}
        <ChartCard title="Profile Completeness Distribution" subtitle="Based on Profile_Completeness field">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={bucketChart} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,152,255,0.08)" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--text-secondary)' }} />
              <YAxis tick={{ fontSize: 9, fill: 'var(--text-muted)' }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {bucketChart.map((entry, i) => {
                  const colors = { '100%': '#10b981', '90–99%': '#22d3ee', '80–89%': '#4f86f7', '70–79%': '#8b5cf6', '50–69%': '#f59e0b', '<50%': '#ef4444' };
                  return <Cell key={i} fill={colors[entry.name] || CHART_COLORS[i]} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Status Distribution */}
        <ChartCard title="Customer Status Distribution" subtitle="By Customer_Status field">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={statusChart} cx="50%" cy="50%"
                outerRadius={100} dataKey="value"
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(1)}%)`}
                labelLine={{ strokeWidth: 0.5, stroke: 'var(--text-muted)' }}
              >
                {statusChart.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 10 }}
                formatter={(v) => formatNumber(v)} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Standardized Fields Coverage */}
      <div className="table-container">
        <div className="table-header">
          <span className="table-title">Standardized Field Coverage</span>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Based on actual _Standardized columns</span>
        </div>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Field</th>
                <th>Raw Column</th>
                <th>Standardized Column</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {[
                { field: 'Gender', raw: 'Gender', std: 'Gender_Standardized' },
                { field: 'Marital Status', raw: 'Marital Status', std: 'Marital Status_Standardized' },
                { field: 'Education Level', raw: 'Education Level', std: 'Education Level_Standardized' },
                { field: 'Location', raw: 'Geographic Information', std: 'Geographic Information_Standardized' },
                { field: 'Occupation', raw: 'Occupation', std: 'Occupation_Standardized' },
                { field: 'Policy Type', raw: 'Policy Type', std: 'Policy Type_Standardized' },
                { field: 'Preferred Language', raw: 'Preferred Language', std: 'Preferred Language_Standardized' },
                { field: 'Communication Channel', raw: 'Preferred Communication Channel', std: 'Preferred Communication Channel_Standardized' },
                { field: 'Contact Time', raw: 'Preferred Contact Time', std: 'Preferred Contact Time_Standardized' },
                { field: 'Segmentation Group', raw: 'Segmentation Group', std: 'Segmentation Group_Standardized' },
                { field: 'Age', raw: 'Age', std: 'Age_Standardized (normalized)' },
                { field: 'Income Level', raw: 'Income Level', std: 'Income Level_Standardized (normalized)' },
                { field: 'Coverage Amount', raw: 'Coverage Amount', std: 'Coverage Amount_Standardized (normalized)' },
                { field: 'Premium Amount', raw: 'Premium Amount', std: 'Premium Amount_Standardized (normalized)' },
              ].map(row => (
                <tr key={row.field}>
                  <td><strong>{row.field}</strong></td>
                  <td style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--text-secondary)' }}>{row.raw}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: 11, color: '#10b981' }}>{row.std}</td>
                  <td><span className="badge badge-high">✓ Available</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
