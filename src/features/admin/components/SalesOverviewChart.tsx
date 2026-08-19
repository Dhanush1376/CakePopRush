import styles from './AdminComponents.module.css'
import { adminDashboardData } from '@/features/admin/api/mockAdminDataProvider';
export function SalesOverviewChart() {
  const salesData = adminDashboardData.getSalesData();
  // SVG Chart dimensions
  const width = 800;
  const height = 300;
  const padding = { top: 20, right: 20, bottom: 30, left: 40 };
  const graphWidth = width - padding.left - padding.right;
  const graphHeight = height - padding.top - padding.bottom;

  const maxVal = 100000;
  const yTicks = [0, 25000, 50000, 75000, 100000];

  const points = salesData.map((d: any, i: number) => {
    const x = padding.left + (i * (graphWidth / (salesData.length - 1)));
    const y = padding.top + graphHeight - ((d.value / maxVal) * graphHeight);
    return { x, y, val: d.value, label: d.date };
  });

  // Create smooth bezier curve path
  let pathD = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const cpX = (p0.x + p1.x) / 2;
    pathD += ` C ${cpX} ${p0.y}, ${cpX} ${p1.y}, ${p1.x} ${p1.y}`;
  }

  // Create filled area path
  const areaD = `${pathD} L ${points[points.length - 1].x} ${padding.top + graphHeight} L ${points[0].x} ${padding.top + graphHeight} Z`;

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h2 className={styles.cardTitle}>Sales Overview</h2>
        <div className={styles.dropdown}>
          This Week
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
        </div>
      </div>
      
      <div style={{ position: 'relative', width: '100%', paddingBottom: '38%', minHeight: '200px' }}>
        <svg 
          viewBox={`0 0 ${width} ${height}`} 
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'visible' }}
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--admin-pink)" stopOpacity="0.2" />
              <stop offset="100%" stopColor="var(--admin-pink)" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {yTicks.map((tick, i) => {
            const y = padding.top + graphHeight - ((tick / maxVal) * graphHeight);
            return (
              <g key={i}>
                <line 
                  x1={padding.left} 
                  y1={y} 
                  x2={width - padding.right} 
                  y2={y} 
                  stroke="var(--color-border)" 
                  strokeWidth="1" 
                  strokeDasharray={tick === 0 ? "0" : "4"}
                  opacity={tick === 0 ? 1 : 0.5}
                />
                <text 
                  x={padding.left - 10} 
                  y={y + 4} 
                  textAnchor="end" 
                  fill="var(--color-text-muted)" 
                  fontSize="12"
                  fontFamily="var(--font-family-body)"
                >
                  {tick === 0 ? '0' : `${tick / 1000}K`}
                </text>
              </g>
            )
          })}

          {/* Area fill */}
          <path d={areaD} fill="url(#chartGradient)" />

          {/* Line */}
          <path d={pathD} fill="none" stroke="var(--admin-pink)" strokeWidth="3" />

          {/* Points & X-axis labels */}
          {points.map((p, i) => (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r="5" fill="var(--color-white)" stroke="var(--admin-pink)" strokeWidth="2" />
              <text 
                x={p.x} 
                y={height} 
                textAnchor="middle" 
                fill="var(--color-text-muted)" 
                fontSize="12"
                fontFamily="var(--font-family-body)"
              >
                {p.label}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  )
}
