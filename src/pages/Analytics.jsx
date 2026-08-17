import React, { useEffect, useState, useCallback } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell,
  PieChart, Pie, Legend, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import ChartCard from '../components/ChartCard';
import { LoadingState, ErrorState } from '../components/LoadingState';
import {
  loadGender, loadEducation, loadOccupation, loadLocation,
  loadPolicy, loadLanguage, loadSimilarity
} from '../services/dataService';
import { formatNumber, CHART_COLORS, titleCase } from '../utils/formatters';

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

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [genderData, setGenderData] = useState([]);
  const [educationData, setEducationData] = useState([]);
  const [occupationData, setOccupationData] = useState([]);
  const [locationData, setLocationData] = useState([]);
  const [policyData, setPolicyData] = useState([]);
  const [languageData, setLanguageData] = useState([]);
  const [similarityData, setSimilarityData] = useState([]);
  const [locationLimit, setLocationLimit] = useState(10);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [g, e, o, l, p, lang, sim] = await Promise.all([
          loadGender(), loadEducation(), loadOccupation(),
          loadLocation(), loadPolicy(), loadLanguage(), loadSimilarity()
        ]);
        setGenderData(g);
        setEducationData(e);
        setOccupationData(o);
        setLocationData(l);
        setPolicyData(p);
        setLanguageData(lang);
        setSimilarityData(sim);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <LoadingState message="Loading analytics data..." />;
  if (error) return <ErrorState error={error} />;

  const genderChart = genderData.map(d => ({ name: titleCase(d.gender), value: d.count }));
  const educationChart = educationData.map(d => ({ name: titleCase(d.level), value: d.count }));
  const occupationChart = occupationData.map(d => ({ name: titleCase(d.occupation), value: d.count }));
  const locationChart = locationData.slice(0, locationLimit).map(d => ({ name: titleCase(d.location), value: d.count }));
  const policyChart = policyData.map(d => ({ name: titleCase(d.type), value: d.count }));
  const languageChart = languageData.map(d => ({ name: titleCase(d.language), value: d.count }));
  const simChart = similarityData.map(d => ({
    name: d.range.replace(/[()[\]]/g, '').replace(', ', '–'),
    value: d.count,
    fill: d.count > 100000 ? '#4f86f7' : d.count > 10000 ? '#8b5cf6' : d.count > 1000 ? '#22d3ee' : '#10b981'
  }));

  const total = genderData.reduce((s, d) => s + d.count, 0);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Analytics</h1>
        <p className="page-subtitle">
          Deep-dive charts across all profile dimensions — {formatNumber(total)} profiles analyzed
        </p>
      </div>

      {/* Gender */}
      <div className="chart-grid" style={{ marginBottom: 16 }}>
        <ChartCard title="Gender Distribution" subtitle={`${formatNumber(total)} total profiles`}>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={genderChart} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,152,255,0.08)" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {genderChart.map((_, i) => <Cell key={i} fill={CHART_COLORS[i]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Policy Type Distribution" subtitle="By policy category">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={policyChart} cx="50%" cy="50%" outerRadius={95} dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={{ stroke: 'var(--text-muted)', strokeWidth: 0.5 }}
              >
                {policyChart.map((_, i) => <Cell key={i} fill={CHART_COLORS[(i + 2) % CHART_COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 10 }}
                formatter={(v) => formatNumber(v)} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Education + Occupation */}
      <div className="chart-grid" style={{ marginBottom: 16 }}>
        <ChartCard title="Education Level Distribution" subtitle="All 5 education levels">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={educationChart} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,152,255,0.08)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 9, fill: 'var(--text-muted)' }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: 'var(--text-secondary)' }} width={115} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                {educationChart.map((_, i) => <Cell key={i} fill={CHART_COLORS[(i + 1) % CHART_COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Occupation Distribution" subtitle="All 8 occupations">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={occupationChart} margin={{ top: 5, right: 10, left: 0, bottom: 50 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,152,255,0.08)" />
              <XAxis dataKey="name" tick={{ fontSize: 9, fill: 'var(--text-muted)' }} angle={-35} textAnchor="end" interval={0} />
              <YAxis tick={{ fontSize: 9, fill: 'var(--text-muted)' }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {occupationChart.map((_, i) => <Cell key={i} fill={CHART_COLORS[(i + 3) % CHART_COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Language */}
      <div className="chart-grid" style={{ marginBottom: 16 }}>
        <ChartCard title="Preferred Language Distribution" subtitle="5 languages in dataset">
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={languageChart} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,152,255,0.08)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 9, fill: 'var(--text-muted)' }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: 'var(--text-secondary)' }} width={70} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                {languageChart.map((_, i) => <Cell key={i} fill={CHART_COLORS[(i + 5) % CHART_COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Similarity Score Distribution" subtitle="All candidate pairs by score range">
          <ResponsiveContainer width="100%" height={230}>
            <AreaChart data={simChart} margin={{ top: 5, right: 10, left: 0, bottom: 60 }}>
              <defs>
                <linearGradient id="simGrad2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,152,255,0.08)" />
              <XAxis dataKey="name" tick={{ fontSize: 9, fill: 'var(--text-muted)' }} angle={-40} textAnchor="end" interval={0} />
              <YAxis tick={{ fontSize: 9, fill: 'var(--text-muted)' }} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="value" stroke="#8b5cf6" fill="url(#simGrad2)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Geographic - full width with toggle */}
      <div className="chart-full">
        <div className="chart-card-header">
          <div>
            <div className="chart-card-title">Geographic Distribution — Indian States & Territories</div>
            <div className="chart-card-sub">
              {locationData.length} unique locations — showing top {locationLimit}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {[10, 20, 36].map(n => (
              <button
                key={n}
                onClick={() => setLocationLimit(n)}
                className="page-btn"
                style={locationLimit === n ? { background: 'var(--accent-blue)', color: 'white', border: 'none' } : {}}
              >
                {n === 36 ? 'All' : `Top ${n}`}
              </button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={locationChart} margin={{ top: 5, right: 10, left: 0, bottom: 90 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,152,255,0.08)" />
            <XAxis dataKey="name" tick={{ fontSize: 8, fill: 'var(--text-muted)' }} angle={-45} textAnchor="end" interval={0} />
            <YAxis tick={{ fontSize: 9, fill: 'var(--text-muted)' }} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {locationChart.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
