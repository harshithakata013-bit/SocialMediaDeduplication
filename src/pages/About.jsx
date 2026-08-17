import React from 'react';
import { Network, Database, Code2, GitMerge, Star, ArrowRight } from 'lucide-react';

const PIPELINE = [
  { label: 'Raw Customer Data', sub: 'Input CSV with 60+ profile attributes', color: '#4f86f7', num: '01' },
  { label: 'Data Cleaning', sub: 'Null handling, whitespace trimming, format fixes', color: '#8b5cf6', num: '02' },
  { label: 'Standardization', sub: 'Lowercase normalization, category mapping, numeric scaling', color: '#22d3ee', num: '03' },
  { label: 'Blocking', sub: 'Composite key reduces O(n²) comparisons', color: '#10b981', num: '04' },
  { label: 'Candidate Generation', sub: 'Pairwise comparison within blocks', color: '#f59e0b', num: '05' },
  { label: 'Similarity Scoring', sub: 'Categorical + Numeric weighted scoring', color: '#f97316', num: '06' },
  { label: 'Duplicate Grouping', sub: 'Connected components clustering', color: '#ef4444', num: '07' },
  { label: 'Master Profile Selection', sub: 'Most complete record chosen per group', color: '#ec4899', num: '08' },
  { label: 'Analytics Dashboard', sub: 'Interactive React visualization', color: '#a78bfa', num: '09' },
];

const TECH = [
  { name: 'Python 3.x', cat: 'Backend' },
  { name: 'Pandas', cat: 'Data Processing' },
  { name: 'NumPy', cat: 'Numerics' },
  { name: 'Fuzzy Matching', cat: 'Similarity' },
  { name: 'React 18', cat: 'Frontend' },
  { name: 'Vite', cat: 'Build Tool' },
  { name: 'Recharts', cat: 'Visualization' },
  { name: 'PapaParse', cat: 'CSV Parsing' },
  { name: 'Lucide React', cat: 'Icons' },
  { name: 'React Router', cat: 'Navigation' },
  { name: 'Google Colab', cat: 'Processing' },
  { name: 'JavaScript ES6+', cat: 'Frontend' },
];

const OBJECTIVES = [
  'Detect potential duplicate profiles using similarity-based matching',
  'Normalize and standardize profile attributes for consistent comparison',
  'Generate a blocking key to reduce comparison complexity',
  'Score candidate pairs using categorical and numeric similarity',
  'Group similar profiles into duplicate clusters',
  'Select master profiles as the canonical record per group',
  'Visualize deduplication results through an interactive web dashboard',
];

export default function About() {
  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
          <div style={{
            width: 60, height: 60, borderRadius: 14,
            background: 'linear-gradient(135deg, #4f86f7, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, boxShadow: '0 0 24px rgba(79,134,247,0.3)'
          }}>
            <Network size={28} color="white" />
          </div>
          <div>
            <h1 className="page-title">Social Media Profile Data Deduplication & Standardization</h1>
            <p className="page-subtitle" style={{ marginTop: 6 }}>
              IBM Q2D College Project — Profile attribute matching, duplicate detection and data standardization
            </p>
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <span className="badge badge-blue">IBM Q2D</span>
              <span className="badge badge-master">College Project</span>
              <span className="badge badge-high">Data Pipeline</span>
            </div>
          </div>
        </div>
      </div>

      <div className="about-grid">
        {/* Left column */}
        <div>
          {/* Problem Statement */}
          <div className="about-section">
            <div className="about-section-title">
              <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Database size={14} color="#ef4444" />
              </div>
              Problem Statement
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              User registration systems often store redundant accounts created by the same person using minor
              variations or similar profile attributes. This leads to inflated profile counts, inaccurate analytics,
              and inefficient customer management.
            </p>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, marginTop: 10 }}>
              This project designs and demonstrates a <strong style={{ color: 'var(--text-primary)' }}>data
              deduplication and standardization pipeline</strong> that identifies <em>potential duplicate</em> or{' '}
              <em>similar profiles</em> using profile attribute matching — without relying on unique personal
              identifiers such as email addresses or phone numbers.
            </p>
          </div>

          {/* Objectives */}
          <div className="about-section">
            <div className="about-section-title">
              <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Star size={14} color="#10b981" />
              </div>
              Project Objectives
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {OBJECTIVES.map((obj, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <div style={{
                    width: 20, height: 20, borderRadius: 6,
                    background: 'rgba(79,134,247,0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, marginTop: 1
                  }}>
                    <span style={{ fontSize: 9, fontWeight: 800, color: 'var(--accent-blue)' }}>{i + 1}</span>
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{obj}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Dataset Description */}
          <div className="about-section">
            <div className="about-section-title">
              <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(34,211,238,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Code2 size={14} color="#22d3ee" />
              </div>
              Dataset Description
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 12 }}>
              The dataset consists of <strong style={{ color: 'var(--text-primary)' }}>customer/profile records</strong> with
              60+ attributes per profile. The data does not contain direct personal identifiers (e.g., email, phone number).
              Deduplication is performed entirely on profile attributes.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
              {[
                { label: 'Total Profiles', value: '53,503 (KPI)' },
                { label: 'Customer Records', value: '52,396 (CSV)' },
                { label: 'Profile Attributes', value: '60+' },
                { label: 'Duplicate Groups', value: '719' },
                { label: 'Candidate Pairs', value: '~104,898' },
                { label: 'Indian States', value: '35' },
              ].map(item => (
                <div key={item.label} style={{
                  background: 'rgba(79,134,247,0.06)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 8, padding: '10px 14px',
                }}>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8 }}>{item.label}</div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)', marginTop: 2 }}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Limitations */}
          <div className="about-section">
            <div className="about-section-title">⚠️ Limitations & Disclaimer</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                'Results represent candidate/potential duplicates, not confirmed identity matches',
                'No direct personal identifiers (email, phone, SSN) are present in the dataset',
                'Similarity thresholds may produce false positives or false negatives',
                'KPI total (53,503) and CSV row count (52,396) differ — documented as a known pipeline export discrepancy',
                'Blocking reduces comparison space but may miss some cross-block duplicates',
              ].map((lim, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  <span style={{ color: '#f59e0b', flexShrink: 0, marginTop: 2 }}>•</span>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{lim}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div>
          {/* Technology Stack */}
          <div className="about-section">
            <div className="about-section-title">
              <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(139,92,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Code2 size={14} color="#8b5cf6" />
              </div>
              Technology Stack
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {TECH.map(t => (
                <div key={t.name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <span className="tech-badge">{t.name}</span>
                  <span style={{ fontSize: 9, color: 'var(--text-muted)', marginTop: 3 }}>{t.cat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pipeline */}
          <div className="about-section">
            <div className="about-section-title">
              <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(79,134,247,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <GitMerge size={14} color="#4f86f7" />
              </div>
              Processing Pipeline
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {PIPELINE.map((step, i) => (
                <React.Fragment key={step.num}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    background: `${step.color}0f`,
                    border: `1px solid ${step.color}30`,
                    borderRadius: 10, padding: '10px 14px',
                    width: '100%', transition: 'all 0.2s',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.borderColor = step.color + '80'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.borderColor = step.color + '30'; }}
                  >
                    <div style={{
                      width: 32, height: 32, borderRadius: 8,
                      background: step.color + '20', border: `1px solid ${step.color}40`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <span style={{ fontSize: 10, fontWeight: 800, color: step.color }}>{step.num}</span>
                    </div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>{step.label}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{step.sub}</div>
                    </div>
                  </div>
                  {i < PIPELINE.length - 1 && (
                    <div style={{
                      width: 2, height: 16,
                      background: `linear-gradient(to bottom, ${step.color}, ${PIPELINE[i + 1].color})`,
                      margin: '2px 0',
                    }} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
