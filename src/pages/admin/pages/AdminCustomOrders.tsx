import React from 'react'
import { 
  Search, Plus, Download, ChevronDown, Filter, 
  Calendar, CheckCircle, Clock, XCircle, ChevronRight, ChevronLeft,
  User, Image as ImageIcon, Briefcase, Heart, Star, Cake, Edit2, MoreVertical, Eye
} from 'lucide-react'
import styles from './AdminCustomOrders.module.css'
import { CustomSelect } from '../components/CustomSelect'
import { ViewToggle } from '../components/ViewToggle'
import { AdminCustomOrdersSkeleton } from '../components/AdminCustomOrdersSkeleton';

const statsData = [
  { id: 1, label: 'TOTAL REQUESTS', value: '1,452', trend: '12.5%', isPositive: true, comparison: 'vs last 7 days', icon: Briefcase, color: 'var(--admin-pink)', bg: '#FFF0F5' },
  { id: 2, label: 'PENDING QUOTES', value: '34', trend: '8.2%', isPositive: false, comparison: 'vs last 7 days', icon: Clock, color: '#F59E0B', bg: '#FFF8E1' },
  { id: 3, label: 'APPROVED', value: '892', trend: '18.4%', isPositive: true, comparison: 'vs last 7 days', icon: CheckCircle, color: 'var(--admin-cyan)', bg: '#E0FAFC' },
  { id: 4, label: 'COMPLETED', value: '458', trend: '24.5%', isPositive: true, comparison: 'vs last 7 days', icon: Star, color: '#10B981', bg: '#D1FAE5' },
];

const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'pending', label: 'Pending Quote' },
  { value: 'quoted', label: 'Quoted' },
  { value: 'approved', label: 'Approved' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'rejected', label: 'Rejected' },
];

const occasionOptions = [
  { value: 'all', label: 'All Occasions' },
  { value: 'wedding', label: 'Wedding' },
  { value: 'birthday', label: 'Birthday' },
  { value: 'corporate', label: 'Corporate Event' },
  { value: 'baby_shower', label: 'Baby Shower' },
  { value: 'custom', label: 'Other/Custom' },
];

const dateOptions = [
  { value: 'all', label: 'All Time' },
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
];

const customOrders = [
  {
    id: 'REQ-0842', customerName: 'Sarah Jenkins', email: 'sarah.j@example.com', phone: '+1 555-0123', initials: 'SJ', avatarColor: 'var(--admin-pink)', avatarBg: '#FFF0F5',
    occasion: 'Wedding', quantity: 250, targetDate: 'Aug 15, 2025', createdDate: 'May 24, 2025',
    status: 'Pending Quote', statusClass: styles.pending,
    designImg: '/images/Products/mini valentine cake.jpeg'
  },
  {
    id: 'REQ-0841', customerName: 'Michael Chen', email: 'm.chen@techcorp.com', phone: '+1 555-0987', initials: 'MC', avatarColor: '#F59E0B', avatarBg: '#FFF8E1',
    occasion: 'Corporate', quantity: 500, targetDate: 'Jun 10, 2025', createdDate: 'May 23, 2025',
    status: 'Approved', statusClass: styles.approved,
    designImg: '/images/Products/asorted flavours of cookies.jpeg'
  },
  {
    id: 'REQ-0840', customerName: 'Emily Rodriguez', email: 'emily.r@example.com', phone: '+1 555-4567', initials: 'ER', avatarColor: 'var(--admin-cyan)', avatarBg: '#E0FAFC',
    occasion: 'Baby Shower', quantity: 50, targetDate: 'Jul 05, 2025', createdDate: 'May 22, 2025',
    status: 'Quoted', statusClass: styles.quoted,
    designImg: '/images/Products/Oreo pops.jpeg'
  },
  {
    id: 'REQ-0839', customerName: 'David Kim', email: 'dkim@example.com', phone: '+1 555-7890', initials: 'DK', avatarColor: '#8B5CF6', avatarBg: '#EDE9FE',
    occasion: 'Birthday', quantity: 100, targetDate: 'Jun 20, 2025', createdDate: 'May 21, 2025',
    status: 'In Progress', statusClass: styles.inProgress,
    designImg: '/images/Products/Red velvet cookies.jpeg'
  },
  {
    id: 'REQ-0838', customerName: 'Jessica Taylor', email: 'jess.t@example.com', phone: '+1 555-2345', initials: 'JT', avatarColor: '#EC4899', avatarBg: '#FCE7F3',
    occasion: 'Custom', quantity: 75, targetDate: 'May 30, 2025', createdDate: 'May 20, 2025',
    status: 'Completed', statusClass: styles.completed,
    designImg: '/images/Products/Dark choclate cakepops.jpeg'
  },
  {
    id: 'REQ-0837', customerName: 'Robert Wilson', email: 'r.wilson@example.com', phone: '+1 555-3456', initials: 'RW', avatarColor: '#64748B', avatarBg: '#F1F5F9',
    occasion: 'Corporate', quantity: 1000, targetDate: 'Sep 01, 2025', createdDate: 'May 19, 2025',
    status: 'Rejected', statusClass: styles.rejected,
    designImg: '/images/Products/asorted flavours of cookies.jpeg'
  },
];

const OccasionIconMap: Record<string, React.ElementType> = {
  'Wedding': Heart,
  'Birthday': Cake,
  'Corporate': Briefcase,
  'Baby Shower': Star,
  'Custom': Star,
};

const OccasionColorMap: Record<string, {bg: string, color: string}> = {
  'Wedding': { bg: '#FFF0F5', color: 'var(--admin-pink)' },
  'Birthday': { bg: '#FFF8E1', color: '#F59E0B' },
  'Corporate': { bg: '#E0FAFC', color: 'var(--admin-cyan)' },
  'Baby Shower': { bg: '#FCE7F3', color: '#EC4899' },
  'Custom': { bg: '#F3F4F6', color: '#6B7280' },
};

export function AdminCustomOrders() {
  const [isLoading, setIsLoading] = React.useState(true);
  
  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const [statusFilter, setStatusFilter] = React.useState('all');
  const [occasionFilter, setOccasionFilter] = React.useState('all');
  const [dateFilter, setDateFilter] = React.useState('all');
  const [view, setView] = React.useState<'list' | 'grid'>('list');

  if (isLoading) return <AdminCustomOrdersSkeleton />;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Custom Orders</h1>
          <p className={styles.subtitle}>Manage bespoke cake pop requests and quotes.</p>
        </div>
        <button className={styles.addBtn}>
          <Plus size={18} strokeWidth={2.5} />
          New Request
        </button>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.searchWrapper}>
          <Search size={16} className={styles.searchIcon} />
          <input type="text" placeholder="Search requests by ID, customer name or email..." className={styles.searchInput} />
        </div>
        
        <CustomSelect
          options={statusOptions}
          value={statusFilter}
          onChange={setStatusFilter}
          className={styles.filterSelect}
          variant="yellow"
        />
        <CustomSelect
          options={occasionOptions}
          value={occasionFilter}
          onChange={setOccasionFilter}
          className={styles.filterSelect}
          variant="pink"
        />
        <CustomSelect
          options={dateOptions}
          value={dateFilter}
          onChange={setDateFilter}
          className={styles.filterSelect}
          variant="turquoise"
        />

        <button className={styles.btnOutline}>
          <Filter size={14} />
          Filter
        </button>

        <button className={styles.btnOutline}>
          <Download size={14} />
          Export
        </button>

        <ViewToggle view={view} onViewChange={setView} />
      </div>

      <div className={styles.statsGrid}>
        {statsData.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.id} className={styles.statCard}>
              <div className={styles.statIconWrapper} style={{ backgroundColor: stat.bg, color: stat.color }}>
                <Icon size={20} strokeWidth={2.5} />
              </div>
              <div className={styles.statLabel}>{stat.label}</div>
              <div className={styles.statValue}>{stat.value}</div>
              <div className={styles.statTrend}>
                <span className={stat.isPositive ? styles.positive : styles.negative}>
                  {stat.isPositive ? '↑' : '↓'} {stat.trend}
                </span>
                <span className={styles.statTrendText}>{stat.comparison}</span>
              </div>
            </div>
          )
        })}
      </div>

      

      <div className={styles.tableCard}>
        {view === 'list' && (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>REQUEST ID</th>
                  <th>CUSTOMER</th>
                  <th>DESIGN</th>
                  <th>OCCASION</th>
                  <th>QTY</th>
                  <th>TARGET DATE</th>
                  <th>STATUS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {customOrders.map(order => {
                  const OccasionIcon = OccasionIconMap[order.occasion] || Star;
                  const occColors = OccasionColorMap[order.occasion] || { bg: '#FFF0F5', color: 'var(--admin-pink)' };

                  return (
                    <tr key={order.id}>
                      <td>
                        <div className={styles.orderId}>{order.id}</div>
                        <div className={styles.orderDate}>{order.createdDate}</div>
                      </td>
                      <td>
                        <div className={styles.customerCell}>
                          <div className={styles.avatar} style={{ backgroundColor: order.avatarBg, color: order.avatarColor }}>
                            {order.initials}
                          </div>
                          <div className={styles.customerInfo}>
                            <span className={styles.customerName}>{order.customerName}</span>
                            <span className={styles.customerContact}>{order.email}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <img src={order.designImg} alt={`${order.occasion} design`} className={styles.designPreview} />
                      </td>
                      <td>
                        <div className={styles.occasionCell}>
                          <div className={styles.occasionIconWrapper} style={{ backgroundColor: occColors.bg, color: occColors.color }}>
                            <OccasionIcon size={14} />
                          </div>
                          <span className={styles.occasionText}>{order.occasion}</span>
                        </div>
                      </td>
                      <td>
                        <span className={styles.qtyValue}>{order.quantity}</span>
                      </td>
                      <td>
                        <div className={styles.targetDate}>
                          <Calendar size={14} className={styles.targetDateIcon} />
                          {order.targetDate}
                        </div>
                      </td>
                      <td>
                        <span className={`${styles.statusBadge} ${order.statusClass}`}>
                          {order.status}
                        </span>
                      </td>
                      <td>
                        <div className={styles.actionsCell}>
                          <button className={styles.actionBtn} aria-label="View Details"><Eye size={16} /></button>
                          <button className={styles.actionBtn} aria-label="Edit Request"><Edit2 size={16} /></button>
                          <button className={styles.actionBtn} aria-label="More Actions"><MoreVertical size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {view === 'grid' && (
          <div className={styles.itemsGrid}>
            {customOrders.map(order => {
              const OccasionIcon = OccasionIconMap[order.occasion] || Star;
              const occColors = OccasionColorMap[order.occasion] || { bg: '#FFF0F5', color: 'var(--admin-pink)' };

              return (
                <div key={`grid-${order.id}`} className={styles.gridCard}>
                  <div className={styles.mcHeader}>
                    <div className={styles.orderCell}>
                      <span className={styles.orderId}>{order.id}</span>
                      <span className={styles.orderDate}>{order.createdDate}</span>
                    </div>
                    <span className={`${styles.statusBadge} ${order.statusClass}`}>
                      {order.status}
                    </span>
                  </div>

                  <div className={styles.customerCell} style={{ marginTop: '8px' }}>
                    <div className={styles.avatar} style={{ backgroundColor: order.avatarBg, color: order.avatarColor }}>
                      {order.initials}
                    </div>
                    <div className={styles.customerInfo}>
                      <span className={styles.customerName}>{order.customerName}</span>
                    </div>
                  </div>
                  
                  <div className={styles.mcContact}>
                    <span className={styles.customerContact}>{order.phone}</span>
                    <span className={styles.customerContact}>{order.email}</span>
                  </div>

                  <div className={styles.mcDesignRow}>
                    <img src={order.designImg} alt={`${order.occasion} design`} className={styles.designPreview} style={{ width: '60px', height: '40px' }} />
                    <div className={styles.mcDesignInfo}>
                      <div className={styles.occasionCell} style={{ gap: '4px' }}>
                        <div className={styles.occasionIconWrapper} style={{ backgroundColor: occColors.bg, color: occColors.color, width: '24px', height: '24px' }}>
                          <OccasionIcon size={12} />
                        </div>
                        <span className={styles.occasionText}>{order.occasion}</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.mcStats}>
                    <div className={styles.mcStatItem}>
                      <span className={styles.qtyLabel}>Quantity</span>
                      <span className={styles.qtyValue}>{order.quantity}</span>
                    </div>
                    <div className={styles.mcStatItem}>
                      <span className={styles.qtyLabel}>Target Date</span>
                      <div className={styles.targetDate} style={{ fontSize: '13px' }}>
                        <Calendar size={12} className={styles.targetDateIcon} />
                        {order.targetDate}
                      </div>
                    </div>
                  </div>

                  <div className={styles.mcActions}>
                    <button className={styles.btnOutline} style={{ flex: 1, justifyContent: 'center' }}>
                      <Eye size={14} /> View Details
                    </button>
                    <button className={styles.actionBtn}><Edit2 size={16} /></button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Mobile View */}
        <div className={styles.mobileCards}>
          {customOrders.map(order => {
            const OccasionIcon = OccasionIconMap[order.occasion] || Star;
            const occColors = OccasionColorMap[order.occasion] || { bg: '#FFF0F5', color: 'var(--admin-pink)' };

            return (
              <div key={order.id} className={styles.mobileCard}>
                <div className={styles.mcHeader}>
                  <div className={styles.orderCell}>
                    <span className={styles.orderId}>{order.id}</span>
                    <span className={styles.orderDate}>{order.createdDate}</span>
                  </div>
                  <span className={`${styles.statusBadge} ${order.statusClass}`}>
                    {order.status}
                  </span>
                </div>

                <div className={styles.customerCell} style={{ marginTop: '8px' }}>
                  <div className={styles.avatar} style={{ backgroundColor: order.avatarBg, color: order.avatarColor }}>
                    {order.initials}
                  </div>
                  <div className={styles.customerInfo}>
                    <span className={styles.customerName}>{order.customerName}</span>
                  </div>
                </div>
                
                <div className={styles.mcContact}>
                  <span className={styles.customerContact}>{order.phone}</span>
                  <span className={styles.customerContact}>{order.email}</span>
                </div>

                <div className={styles.mcDesignRow}>
                  <img src={order.designImg} alt={`${order.occasion} design`} className={styles.designPreview} style={{ width: '60px', height: '40px' }} />
                  <div className={styles.mcDesignInfo}>
                    <div className={styles.occasionCell} style={{ gap: '4px' }}>
                      <div className={styles.occasionIconWrapper} style={{ backgroundColor: occColors.bg, color: occColors.color, width: '24px', height: '24px' }}>
                        <OccasionIcon size={12} />
                      </div>
                      <span className={styles.occasionText}>{order.occasion}</span>
                    </div>
                  </div>
                </div>

                <div className={styles.mcStats}>
                  <div className={styles.mcStatItem}>
                    <span className={styles.qtyLabel}>Quantity</span>
                    <span className={styles.qtyValue}>{order.quantity}</span>
                  </div>
                  <div className={styles.mcStatItem}>
                    <span className={styles.qtyLabel}>Target Date</span>
                    <div className={styles.targetDate} style={{ fontSize: '13px' }}>
                      <Calendar size={12} className={styles.targetDateIcon} />
                      {order.targetDate}
                    </div>
                  </div>
                </div>

                <div className={styles.mcActions}>
                  <button className={styles.btnOutline} style={{ flex: 1, justifyContent: 'center' }}>
                    <Eye size={14} /> View Details
                  </button>
                  <button className={styles.actionBtn}><Edit2 size={16} /></button>
                </div>
              </div>
            )
          })}
        </div>

        <div className={styles.pagination}>
          <span className={styles.pageInfo}>Showing 1 to 6 of 1,452 requests</span>
          <div className={styles.pageControls}>
            <button className={styles.pageBtn}><ChevronLeft size={16} /></button>
            <button className={`${styles.pageBtn} ${styles.active}`}>1</button>
            <button className={styles.pageBtn}>2</button>
            <button className={styles.pageBtn}>3</button>
            <span className={styles.pageEllipsis}>...</span>
            <button className={styles.pageBtn}>242</button>
            <button className={styles.pageBtn}><ChevronRight size={16} /></button>
          </div>
        </div>
      </div>
    </div>
  )
}
