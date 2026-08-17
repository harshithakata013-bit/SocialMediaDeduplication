import React from 'react';

/**
 * ChartCard: wrapper for recharts charts with title and subtitle
 */
export default function ChartCard({ title, subtitle, children, style, extra }) {
  return (
    <div className="chart-card" style={style}>
      <div className="chart-card-header">
        <div>
          <div className="chart-card-title">{title}</div>
          {subtitle && <div className="chart-card-sub">{subtitle}</div>}
        </div>
        {extra}
      </div>
      {children}
    </div>
  );
}
