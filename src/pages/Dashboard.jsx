import React, { useEffect, useState, useCallback } from 'react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import {
  Users, GitMerge, Star, Copy, Layers, TrendingUp,
  AlertCircle, Activity, Info, ArrowRight
} from 'lucide-react';
import StatCard from '../components/StatCard';
import ChartCard from '../components/ChartCard';
import { LoadingState, ErrorState } from '../components/LoadingState';
import {
  loadKPIs, loadCustomerStatus, loadGender, loadEducation,
  loadOccupation, loadLocation, loadPolicy, loadLanguage, loadSimilarity
} from '../services/dataService';
import { formatNumber, CHART_COLORS, titleCase } from '../utils/formatters';

const DONUT_COLORS = ['#4f86f7', '#8b5cf6', '#f59e0b'];

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

const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
  if (percent < 0.04) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={10} fontWeight={600}>
      {`${(percent * 100).toFixed(1)}%`}
    </text>
  );
};

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [kpis, setKpis] = useState({});
  const [statusData, setStatusData] = useState([]);
  const [genderData, setGenderData] = useState([]);
  const [educationData, setEducationData] = useState([]);
  const [occupationData, setOccupationData] = useState([]);
  const [locationData, setLocationData] = useState([]);
  const [policyData, setPolicyData] = useState([]);
  const [languageData, setLanguageData] = useState([]);
  const [similarityData, setSimilarityData] = useState([]);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const [k, s, g, e, o, l, p, lang, sim] = await Promise.all([
        loadKPIs(),
        loadCustomerStatus(),
        loadGender(),
        loadEducation(),
        loadOccupation(),
        loadLocation(),
        loadPolicy(),
        loadLanguage(),
        loadSimilarity(),
      ]);
      setKpis(k);
      setStatusData(s);
      setGenderData(g);
      setEducationData(e);
      setOccupationData(o);
      setLocationData(l.slice(0, 15));
      setPolicyData(p);
      setLanguageData(lang);
      setSimilarityData(sim);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  if (loading) return <LoadingState message="Loading dashboard data..." />;
  if (error) return <ErrorState error={error} filename="dashboard CSV files" />;

  const genderChartData = genderData.map(d => ({ name: titleCase(d.gender), value: d.count }));
  const educationChartData = educationData.map(d => ({ name: titleCase(d.level), value: d.count }));
  const occupationChartData = occupationData.map(d => ({ name: titleCase(d.occupation), value: d.count }));
  const locationChartData = locationData.slice(0, 10).map(d => ({
    name: titleCase(d.location),
    value: d.count,
  }));
  const policyChartData = policyData.map(d => ({ name: titleCase(d.type), value: d.count }));
  const languageChartData = languageData.map(d => ({ name: titleCase(d.language), value: d.count }));
  const simChartData = similarityData.map(d => ({
    name: d.range.replace(/[()[\]]/g, '').replace(', ', '–'),
    value: d.count,
  }));
  const statusChartData = statusData.map(d => ({ name: d.status, value: d.count }));

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <h1 className="page-title">Social Media Profile Deduplication & Standardization</h1>
            <p className="page-subtitle">
              AI-assisted profile matching, duplicate detection and customer data standardization
            </p>
          </div>
          <span className="badge badge-blue" style={{ fontSize: 10, padding: '4px 10px' }}>IBM Q2D Project</span>
        </div>
      </div>

      {/* Data note */}
      <div className="info-note">
        <Info size={14} style={{ color: '#f59e0b', flexShrink: 0, marginTop: 2 }} />
        <span className="info-note-text">
          <strong style={{ color: '#f59e0b' }}>Data Source Note:</strong> KPI totals are sourced from{' '}
          <code>dashboard_kpis.csv</code> (53,503 profiles). The customer detail file{' '}
          <code>dashboard_customer_data.csv</code> contains 52,396 records. This discrepancy is retained as-is
          from the exported pipeline output and does not affect dashboard accuracy.
        </span>
      </div>

      {/* KPI Cards */}
      <div className="stat-grid">
        <StatCard
          icon={Users}
          iconBg="rgba(79,134,247,0.15)" iconColor="#4f86f7"
          title="Total Profiles"
          value={kpis['Total Profiles']}
          description="Total profiles processed in deduplication pipeline"
          badge="KPI Source"
        />
        <StatCard
          icon={Star}
          iconBg="rgba(139,92,246,0.15)" iconColor="#8b5cf6"
          title="Unique Customers"
          value={kpis['Unique Customers']}
          description="Profiles identified as unique (no duplicate found)"
          badge="Verified"
          badgeCls="badge-unique"
        />
        <StatCard
          icon={GitMerge}
          iconBg="rgba(16,185,129,0.15)" iconColor="#10b981"
          title="Master Profiles"
          value={kpis['Master Profiles']}
          description="Selected master records from duplicate groups"
          badge="Masters"
          badgeCls="badge-master"
        />
        <StatCard
          icon={Copy}
          iconBg="rgba(249,115,22,0.15)" iconColor="#f97316"
          title="Duplicate Candidates"
          value={kpis['Duplicate Candidates']}
          description="Profiles identified as potential duplicates"
          badge="Flagged"
          badgeCls="badge-duplicate"
        />
        <StatCard
          icon={Layers}
          iconBg="rgba(245,158,11,0.15)" iconColor="#f59e0b"
          title="Duplicate Groups"
          value={kpis['Duplicate Groups']}
          description="Groups of similar profiles clustered together"
        />
        <StatCard
          icon={TrendingUp}
          iconBg="rgba(34,211,238,0.15)" iconColor="#22d3ee"
          title="High Similarity Pairs"
          value={kpis['High Similarity Pairs']}
          description="Pairs with similarity score ≥ 0.90"
          badge="≥90%"
          badgeCls="badge-high"
        />
        <StatCard
          icon={AlertCircle}
          iconBg="rgba(139,92,246,0.12)" iconColor="#a78bfa"
          title="Possible Duplicate Pairs"
          value={kpis['Possible Duplicate Pairs']}
          description="Pairs with similarity score 0.75–0.89"
          badge="75–89%"
          badgeCls="badge-possible"
        />
        <StatCard
          icon={Activity}
          iconBg="rgba(16,185,129,0.12)" iconColor="#10b981"
          title="Average Similarity"
          value={kpis['Average Similarity']}
          description="Mean similarity score across all candidate pairs"
          format="percent"
          decimals={2}
        />
      </div>

      {/* Row 1: Status Donut + Similarity Area */}
      <div className="chart-grid">
        <ChartCard title="Customer Status Distribution" subtitle="Based on dashboard_customer_status.csv">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={statusChartData}
                cx="50%" cy="50%"
                innerRadius={65} outerRadius={105}
                dataKey="value"
                labelLine={false}
                label={renderCustomLabel}
              >
                {statusChartData.map((entry, index) => (
                  <Cell key={entry.name} fill={DONUT_COLORS[index % DONUT_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 10 }}
                formatter={(val) => formatNumber(val)}
              />
              <Legend
                formatter={(value) => <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Similarity Score Distribution" subtitle="Across all candidate pairs">
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={simChartData} margin={{ top: 5, right: 10, left: 0, bottom: 60 }}>
              <defs>
                <linearGradient id="simGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f86f7" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#4f86f7" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,152,255,0.08)" />
              <XAxis
                dataKey="name" tick={{ fontSize: 9, fill: 'var(--text-muted)' }}
                angle={-45} textAnchor="end" interval={0}
              />
              <YAxis tick={{ fontSize: 9, fill: 'var(--text-muted)' }} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="value" stroke="#4f86f7" fill="url(#simGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Row 2: Gender + Policy + Language */}
      <div className="chart-grid-3">
        <ChartCard title="Gender Distribution" subtitle="dashboard_gender.csv">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={genderChartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,152,255,0.08)" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
              <YAxis tick={{ fontSize: 9, fill: 'var(--text-muted)' }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {genderChartData.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Policy Type Distribution" subtitle="dashboard_policy.csv">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={policyChartData} cx="50%" cy="50%" outerRadius={80} dataKey="value">
                {policyChartData.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[(i + 2) % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 10 }}
                formatter={(val) => formatNumber(val)}
              />
              <Legend formatter={(v) => <span style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Preferred Language" subtitle="dashboard_language.csv">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={languageChartData} layout="vertical" margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,152,255,0.08)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 9, fill: 'var(--text-muted)' }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: 'var(--text-secondary)' }} width={65} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                {languageChartData.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[(i + 4) % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Row 3: Education + Occupation */}
      <div className="chart-grid">
        <ChartCard title="Education Level Distribution" subtitle="dashboard_education.csv">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={educationChartData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,152,255,0.08)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 9, fill: 'var(--text-muted)' }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: 'var(--text-secondary)' }} width={110} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                {educationChartData.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[(i + 1) % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Occupation Distribution" subtitle="Top occupations — dashboard_occupation.csv">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={occupationChartData} margin={{ top: 5, right: 10, left: 0, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,152,255,0.08)" />
              <XAxis dataKey="name" tick={{ fontSize: 9, fill: 'var(--text-muted)' }} angle={-35} textAnchor="end" interval={0} />
              <YAxis tick={{ fontSize: 9, fill: 'var(--text-muted)' }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {occupationChartData.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[(i + 3) % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Row 4: Location */}
      <div className="chart-full">
        <div className="chart-card-header">
          <div>
            <div className="chart-card-title">Geographic Distribution (Top 10 Locations)</div>
            <div className="chart-card-sub">dashboard_location.csv — Indian states & territories</div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={locationChartData} margin={{ top: 5, right: 10, left: 0, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,152,255,0.08)" />
            <XAxis dataKey="name" tick={{ fontSize: 9, fill: 'var(--text-muted)' }} angle={-35} textAnchor="end" interval={0} />
            <YAxis tick={{ fontSize: 9, fill: 'var(--text-muted)' }} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {locationChartData.map((_, i) => (
                <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
