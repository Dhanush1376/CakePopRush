import React from 'react'
import {
  Calendar, ChevronDown
} from 'lucide-react'
import styles from './AdminAnalytics.module.css'
import { AdminAnalyticsSkeleton } from '@/features/admin/components/AdminAnalyticsSkeleton';

// KPI Data
import { adminAnalyticsData } from '@/features/admin/api/adminDataProvider'

const kpiDataStatic = null;
const revenueDataStatic = null;
const salesDataStatic = null;
const ordersOverviewStatic = null;
const trafficSourcesStatic = null;
const bestSellingProductsStatic = null;
const userActivityStatic = null;

const Sparkline = ({ data, color }: { data: number[], color: string }) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const width = 100;
  const height = 40;
  const range = max - min || 1;
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((d - min) / range) * (height - 10) - 5;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className={styles.miniChart} preserveAspectRatio="none">
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {data.map((d, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - ((d - min) / range) * (height - 10) - 5;
        return <circle key={i} cx={x} cy={y} r="2" fill={color} />;
      })}
    </svg>
  );
};

const DonutChart = ({ data, centerText, centerLabel }: any) => {
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  let currentOffset = 0;

  return (
    <div className={styles.donutWrapper}>
      <div className={styles.donutSvgContainer}>
        <svg viewBox="0 0 140 140" width="100%" height="100%" style={{ transform: 'rotate(-90deg)' }}>
          {data.map((d: any, i: number) => {
            const strokeLength = (d.percentage / 100) * circumference;
            const renderLength = Math.max(0, strokeLength - 2); // Gap between segments
            const circle = (
              <circle
                key={i} cx="70" cy="70" r={radius} fill="transparent"
                stroke={d.color} strokeWidth="14"
                strokeDasharray={`${renderLength} ${circumference - renderLength}`}
                strokeDashoffset={-currentOffset} strokeLinecap="round"
              />
            );
            currentOffset += strokeLength;
            return circle;
          })}
        </svg>
        <div className={styles.donutCenter}>
          <span className={styles.donutCenterVal}>{centerText}</span>
          <span className={styles.donutCenterLabel}>{centerLabel}</span>
        </div>
      </div>

      <div className={styles.donutLegend}>
        {data.map((d: any, i: number) => (
          <div key={i} className={styles.donutLegendItem}>
            <div className={styles.donutLegendLabel}>
              <div className={styles.donutLegendDot} style={{ backgroundColor: d.color }} />
              <span>{d.label}</span>
            </div>
            <div className={styles.donutLegendValue}>
              <span style={{ fontWeight: 600, color: 'var(--admin-brown)' }}>{d.value.toLocaleString()}</span>
              <span>({d.percentage}%)</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const AreaChart = ({ data }: { data: number[] }) => {
  const width = 800;
  const height = 250;
  const padding = { top: 20, right: 20, bottom: 30, left: 40 };
  const graphWidth = width - padding.left - padding.right;
  const graphHeight = height - padding.top - padding.bottom;
  const maxVal = 100000;
  const yTicks = [0, 25000, 50000, 75000, 100000];

  const points = data.map((d, i) => {
    const x = padding.left + (i * (graphWidth / (data.length - 1)));
    const y = padding.top + graphHeight - ((d / maxVal) * graphHeight);
    return { x, y, val: d, label: `May ${18 + i}` };
  });

  let pathD = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const cpX = (p0.x + p1.x) / 2;
    pathD += ` C ${cpX} ${p0.y}, ${cpX} ${p1.y}, ${p1.x} ${p1.y}`;
  }
  const areaD = `${pathD} L ${points[points.length - 1].x} ${padding.top + graphHeight} L ${points[0].x} ${padding.top + graphHeight} Z`;

  return (
    <div className={styles.chartContainer}>
      <svg viewBox={`0 0 ${width} ${height}`} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'visible' }} preserveAspectRatio="none">
        <defs>
          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--admin-pink)" stopOpacity="0.2" />
            <stop offset="100%" stopColor="var(--admin-pink)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {yTicks.map((tick, i) => {
          const y = padding.top + graphHeight - ((tick / maxVal) * graphHeight);
          return (
            <g key={i}>
              <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="var(--color-border)" strokeDasharray={tick === 0 ? "0" : "4"} opacity={tick === 0 ? 1 : 0.5} />
              <text x={padding.left - 10} y={y + 4} textAnchor="end" fill="var(--color-text-muted)" fontSize="12" fontFamily="var(--font-family-body)">
                {tick === 0 ? '0' : `${tick / 1000}K`}
              </text>
            </g>
          )
        })}
        <path d={areaD} fill="url(#chartGradient)" />
        <path d={pathD} fill="none" stroke="var(--admin-pink)" strokeWidth="3" />
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="5" fill="var(--color-white)" stroke="var(--admin-pink)" strokeWidth="2" />
            <text x={p.x} y={height} textAnchor="middle" fill="var(--color-text-muted)" fontSize="12" fontFamily="var(--font-family-body)">
              {p.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  )
};

const BarChart = ({ data }: { data: number[] }) => {
  const width = 800;
  const height = 250;
  const padding = { top: 20, right: 20, bottom: 30, left: 40 };
  const graphWidth = width - padding.left - padding.right;
  const graphHeight = height - padding.top - padding.bottom;
  const maxVal = 100000;
  const yTicks = [0, 25000, 50000, 75000, 100000];
  const barWidth = 24;

  return (
    <div className={styles.chartContainer}>
      <svg viewBox={`0 0 ${width} ${height}`} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'visible' }} preserveAspectRatio="none">
        {yTicks.map((tick, i) => {
          const y = padding.top + graphHeight - ((tick / maxVal) * graphHeight);
          return (
            <g key={i}>
              <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="var(--color-border)" strokeDasharray={tick === 0 ? "0" : "4"} opacity={tick === 0 ? 1 : 0.5} />
              <text x={padding.left - 10} y={y + 4} textAnchor="end" fill="var(--color-text-muted)" fontSize="12" fontFamily="var(--font-family-body)">
                {tick === 0 ? '0' : `₹${tick / 1000}K`}
              </text>
            </g>
          )
        })}
        {data.map((d, i) => {
          const barH = (d / maxVal) * graphHeight;
          const x = padding.left + (i * (graphWidth / (data.length - 1))) - (barWidth / 2);
          const y = padding.top + graphHeight - barH;
          return (
            <g key={i}>
              <rect x={x} y={y} width={barWidth} height={barH} fill="var(--admin-pink)" rx="2" />
              <text x={x + barWidth / 2} y={y - 8} textAnchor="middle" fill="var(--admin-brown)" fontSize="11" fontWeight="600" fontFamily="var(--font-family-body)">
                ₹{Math.round(d / 1000)}K
              </text>
              <text x={x + barWidth / 2} y={height} textAnchor="middle" fill="var(--color-text-muted)" fontSize="12" fontFamily="var(--font-family-body)">
                May {18 + i}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
};


export function AdminAnalytics() {
  const [isLoading, setIsLoading] = React.useState(true);
  const [kpiData, setKpiData] = React.useState<any[]>([]);
  const [revenueData, setRevenueData] = React.useState<any[]>([]);
  const [salesData, setSalesData] = React.useState<any[]>([]);
  const [ordersOverview, setOrdersOverview] = React.useState<any[]>([]);
  const [trafficSources, setTrafficSources] = React.useState<any[]>([]);
  const [bestSellingProducts, setBestSellingProducts] = React.useState<any[]>([]);
  const [userActivity, setUserActivity] = React.useState<any[]>([]);

  React.useEffect(() => {
    Promise.all([
      adminAnalyticsData.getKpiStats(),
      adminAnalyticsData.getRevenueData(),
      adminAnalyticsData.getSalesData(),
      adminAnalyticsData.getOrdersOverview(),
      adminAnalyticsData.getTrafficSources(),
      adminAnalyticsData.getBestSellingProducts(),
      adminAnalyticsData.getUserActivity()
    ]).then(([kpi, rev, sal, ord, tr, b, u]) => {
      setKpiData(kpi);
      setRevenueData(rev);
      setSalesData(sal);
      setOrdersOverview(ord);
      setTrafficSources(tr);
      setBestSellingProducts(b);
      setUserActivity(u);
    }).finally(() => {
      setIsLoading(false);
    });
  }, []);

  if (isLoading) return <AdminAnalyticsSkeleton />;

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Analytics</h1>
          <p className={styles.subtitle}>Track your store performance and key metrics.</p>
        </div>
        <div className={styles.datePicker}>
          <Calendar size={16} className={styles.datePickerIcon} />
          <span>May 18 - May 24, 2025</span>
          <ChevronDown size={14} className={styles.datePickerIcon} style={{ marginLeft: '8px' }} />
        </div>
      </div>

      {/* KPI Grid */}
      <div className={styles.kpiGrid}>
        {kpiData.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.id} className={styles.kpiCard}>
              <div className={styles.kpiTop}>
                <div className={styles.kpiIconWrapper} style={{ backgroundColor: kpi.bg, color: kpi.color }}>
                  <Icon size={20} strokeWidth={2.5} />
                </div>
                <div className={styles.kpiContent}>
                  <span className={styles.kpiLabel}>{kpi.label}</span>
                  <span className={styles.kpiValue}>{kpi.value}</span>
                  <div className={styles.kpiTrend}>
                    <span className={kpi.isPositive ? styles.trendPositive : styles.trendNegative}>
                      {kpi.isPositive ? '↑' : '↓'} {kpi.trend}
                    </span>
                    <span className={styles.trendText}>vs last 7 days</span>
                  </div>
                </div>
              </div>
              <Sparkline data={kpi.chart} color={kpi.color} />
            </div>
          )
        })}
      </div>

      {/* Row 1: Charts */}
      <div className={styles.chartsRow1}>
        {/* Revenue Overview */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <h2 className={styles.chartTitle}>Revenue Overview</h2>
            <div className={styles.dropdown}>
              This Week <ChevronDown size={12} />
            </div>
          </div>
          <div className={styles.chartLegend}>
            <div className={styles.legendColor} style={{ backgroundColor: 'var(--admin-pink)' }} />
            <span>Revenue (₹)</span>
          </div>
          <AreaChart data={revenueData} />
        </div>

        {/* Orders Overview */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <h2 className={styles.chartTitle}>Orders Overview</h2>
            <div className={styles.dropdown}>
              This Week <ChevronDown size={12} />
            </div>
          </div>
          <DonutChart data={ordersOverview} centerText="1,248" centerLabel="Total Orders" />
        </div>

        {/* Top Traffic Sources */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <h2 className={styles.chartTitle}>Top Traffic Sources</h2>
            <div className={styles.dropdown}>
              This Week <ChevronDown size={12} />
            </div>
          </div>
          <DonutChart data={trafficSources} centerText="24,350" centerLabel="Total Views" />
        </div>
      </div>

      {/* Row 2: Charts and Lists */}
      <div className={styles.chartsRow2}>
        {/* Sales Over Time */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <h2 className={styles.chartTitle}>Sales Over Time</h2>
            <div className={styles.dropdown}>
              This Week <ChevronDown size={12} />
            </div>
          </div>
          <div className={styles.chartLegend}>
            <div className={styles.legendColor} style={{ backgroundColor: 'var(--admin-pink)' }} />
            <span>Sales (₹)</span>
          </div>
          <BarChart data={salesData} />
        </div>

        {/* Best Selling Products */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <h2 className={styles.chartTitle}>Best Selling Products</h2>
            <a href="#" className={styles.viewAll}>View All</a>
          </div>
          <div className={styles.bestSellingList}>
            {bestSellingProducts.map((product, index) => (
              <div key={product.id} className={styles.bestSellingItem}>
                <div className={styles.rankBadge}>{index + 1}</div>
                <img src={product.img} alt={product.name} className={styles.productImg} />
                <div className={styles.productInfo}>
                  <span className={styles.productName}>{product.name}</span>
                </div>
                <div className={styles.productSales}>
                  <span className={styles.salesCount}>{product.sales}</span>
                  <span className={styles.salesLabel}>Sold</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* User Activity */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <h2 className={styles.chartTitle}>User Activity</h2>
            <a href="#" className={styles.viewAll}>View All</a>
          </div>
          <div className={styles.activityList}>
            {userActivity.map((activity) => {
              const Icon = activity.icon;
              return (
                <div key={activity.id} className={styles.activityItem}>
                  <div className={styles.activityLeft}>
                    <div className={styles.activityIcon} style={{ backgroundColor: activity.bg, color: activity.color }}>
                      <Icon size={18} strokeWidth={2.5} />
                    </div>
                    <div className={styles.activityInfo}>
                      <span className={styles.activityName}>{activity.label}</span>
                      <span className={styles.activitySub}>{activity.sub}</span>
                    </div>
                  </div>
                  <div className={styles.activityRight}>
                    <span className={styles.activityVal}>{activity.value}</span>
                    <span className={styles.trendPositive}>↑ {activity.trend}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
