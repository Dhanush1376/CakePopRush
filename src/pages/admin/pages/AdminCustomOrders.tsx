import { ActionDropdown } from '@/features/admin/components/ActionDropdown'
import React from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { Search, Plus, Download, Filter, Calendar, ChevronRight, ChevronLeft, Image as Briefcase, Heart, Star, Cake, Edit2, MoreVertical, Eye, AlertTriangle, Trash2, X, MessageSquare, Archive } from 'lucide-react'
import styles from './AdminCustomOrders.module.css'
import deleteBtnStyles from '@/features/admin/components/AdminDeleteButton.module.css'
import { CustomSelect } from '@/features/admin/components/CustomSelect'
import { AdminFilterModal } from '@/features/admin/components/AdminFilterModal'
import filterModalStyles from '@/features/admin/components/AdminFilterModal.module.css'
import { ViewToggle } from '@/features/admin/components/ViewToggle'
import { AdminCustomOrdersSkeleton } from '@/features/admin/components/AdminCustomOrdersSkeleton'

import { adminCustomOrderData } from '@/features/admin/api/adminDataProvider'

const statsDataStatic = null;
const customOrdersStatic = null;

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
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedItems, setSelectedItems] = React.useState<string[]>([]);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = React.useState(false);
  const [confirmAction, setConfirmAction] = React.useState('');

  const [statsData, setStatsData] = React.useState<any[]>([]);
  const [customOrders, setCustomOrders] = React.useState<any[]>([]);

  React.useEffect(() => {
    Promise.all([
      adminCustomOrderData.getStats(),
      adminCustomOrderData.getCustomOrders()
    ]).then(([stats, orders]) => {
      setStatsData(stats);
      setCustomOrders(orders);
    }).finally(() => {
      setIsLoading(false);
    });
  }, []);

  const [statusFilter, setStatusFilter] = React.useState('all');
  const [occasionFilter, setOccasionFilter] = React.useState('all');
  const [dateFilter, setDateFilter] = React.useState('all');
  const [view, setView] = React.useState<'list' | 'grid'>('list');

  const defaultAdvFilters = { budget: 'all', guests: 'all' };
  const [isAdvFilterOpen, setIsAdvFilterOpen] = React.useState(false);
  const [draftAdvFilters, setDraftAdvFilters] = React.useState(defaultAdvFilters);
  const [appliedAdvFilters, setAppliedAdvFilters] = React.useState(defaultAdvFilters);

  const activeFilterCount = Object.values(appliedAdvFilters).filter(v => v !== 'all').length;

  const handleApplyAdvFilters = () => {
    setAppliedAdvFilters(draftAdvFilters);
    setIsAdvFilterOpen(false);
  };

  const handleResetAdvFilters = () => {
    setDraftAdvFilters(defaultAdvFilters);
  };

  React.useEffect(() => {
    const checkView = () => {
      if (typeof window !== 'undefined') {
        setView(window.innerWidth <= 768 ? 'grid' : 'list');
      }
    };
    
    // Check on mount
    checkView();
    
    // Check on resize (useful for responsive testing)
    window.addEventListener('resize', checkView);
    return () => window.removeEventListener('resize', checkView);
  }, []);

  if (isLoading) return <AdminCustomOrdersSkeleton />;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Custom Orders</h1>
          <p className={styles.subtitle}>Manage bespoke cake pop requests and quotes.</p>
        </div>
        <button className={styles.addBtn} onClick={() => navigate('/admin/custom-orders/add')}>
          <Plus size={18} strokeWidth={2.5} />
          New Request
        </button>
      </div>

      <div className={styles.stickyWrapper}>
        {selectedItems.length > 0 ? (
        <div className={`${styles.toolbar} ${styles.bulkToolbar}`} style={{ backgroundColor: '#FFF0F5', borderColor: 'var(--admin-pink)', width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            <span style={{ fontWeight: 600, color: 'var(--admin-pink)', whiteSpace: 'nowrap' }}>
              {selectedItems.length} <span className={styles.hideMobile}>order{selectedItems.length > 1 ? 's' : ''} selected</span>
            </span>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'flex-end', flexWrap: 'nowrap' }}>
            <CustomSelect 
              className={styles.mobileSelect}
              variant="pink"
              placeholder="Update Status..."
              value=""
              onChange={(val) => {
                if (val) {
                  setConfirmAction(val);
                  setIsConfirmModalOpen(true);
                }
              }}
              options={[
                { value: 'active', label: 'Mark as Active' },
                { value: 'inactive', label: 'Mark as Inactive' }
              ]}
            />
            <button className={styles.btnOutline} title="Export Selected" style={{ padding: '8px' }}>
              <Download size={16} style={{ flexShrink: 0, minWidth: '16px' }} /> <span className={styles.hideMobile}>Export Selected</span>
            </button>
            <button className={styles.btnOutline} onClick={() => setSelectedItems([])} style={{ border: 'none', background: 'white', padding: '8px' }} title="Clear Selection">
              <span className={styles.hideMobile}>Clear Selection</span>
              <X size={16} className={styles.showMobileInline} style={{ flexShrink: 0, minWidth: '16px' }} />
            </button>
            <button 
              className={styles.btnDanger} 
              title="Delete Selected"
              style={{ padding: '8px' }}
              onClick={() => {
                setConfirmAction('delete');
                setIsConfirmModalOpen(true);
              }}
            >
              <Trash2 size={16} style={{ flexShrink: 0, minWidth: '16px' }} /> <span className={styles.hideMobile}>Delete Selected</span>
            </button>
          </div>
        </div>
      ) : (
        <div className={styles.toolbar}>
          <div className={styles.searchWrapper}>
            <Search size={16} className={styles.searchIcon} />
            <input type="text" placeholder="Search requests by ID, customer name or email..." className={styles.searchInput} />
          </div>
          
          <div className={styles.filtersScrollContainer}>
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
          </div>
  
          <div className={styles.actionButtons}>
            <button className={styles.btnOutline} title="Filter" onClick={() => setIsAdvFilterOpen(true)}>
              <Filter className={styles.btnIcon} /> <span className={styles.hideMobile}>Filter</span>
              {activeFilterCount > 0 && <span className={styles.filterBadge}>{activeFilterCount}</span>}
            </button>
            <button className={styles.btnOutline} title="Export">
              <Download className={styles.btnIcon} /> <span className={styles.hideMobile}>Export</span>
            </button>
            <div style={{ flexShrink: 0 }}>
              <ViewToggle view={view} onViewChange={setView} />
            </div>
          </div>
        </div>
      )}
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
                  <th className={styles.checkboxCell}>
                    <input type="checkbox" className={styles.checkbox} aria-label="Select all orders" checked={selectedItems.length === customOrders.length && customOrders.length > 0} onChange={(e) => setSelectedItems(e.target.checked ? customOrders.map(c => c.id) : [])} />
                  </th>
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
                      <td className={styles.checkboxCell}>
                        <input type="checkbox" className={styles.checkbox} aria-label={`Select ${order.customerName || order.id}`} checked={selectedItems.includes(order.id)} onChange={(e) => { if (e.target.checked) setSelectedItems(prev => [...prev, order.id]); else setSelectedItems(prev => prev.filter(id => id !== order.id)); }} />
                      </td>
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
                          <button 
                            className={deleteBtnStyles.deleteBtn} 
                            aria-label="Delete Request"
                            onClick={() => {
                              setSelectedItems([String(order.id)]);
                              setConfirmAction('delete');
                              setIsConfirmModalOpen(true);
                            }}
                          >
                            <Trash2 size={16} />
                          </button>
                          <button className={styles.actionBtn} aria-label="View Details"><Eye size={16} /></button>
                          <button className={styles.actionBtn} aria-label="Edit Request"><Edit2 size={16} /></button>
                          <ActionDropdown actions={[
      { label: 'View Details', icon: Eye },
      { label: 'Send Message', icon: MessageSquare },
      { label: 'Archive', icon: Archive, variant: 'danger' }
    ]} />
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
                    <button 
                      className={deleteBtnStyles.deleteBtn} 
                      aria-label="Delete Request"
                      onClick={() => {
                        setSelectedItems([String(order.id)]);
                        setConfirmAction('delete');
                        setIsConfirmModalOpen(true);
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
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

        {/* Mobile Cards View */}
        <div className={styles.mobileCards} style={{ display: view === 'list' ? 'none' : '' }}>
          {customOrders.map(order => {
            const OccasionIcon = OccasionIconMap[order.occasion] || Star;
            const occColors = OccasionColorMap[order.occasion] || { bg: '#FFF0F5', color: 'var(--admin-pink)' };

            return (
              <div key={order.id} className={styles.mobileCard}>
                <div className={styles.mcHeader}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input type="checkbox" className={styles.checkbox} aria-label={`Select ${order.customerName || order.id} mobile`} checked={selectedItems.includes(order.id)} onChange={(e) => { if (e.target.checked) setSelectedItems(prev => [...prev, order.id]); else setSelectedItems(prev => prev.filter(id => id !== order.id)); }} />
                    <div className={styles.orderCell}>
                      <span className={styles.orderId}>{order.id}</span>
                      <span className={styles.orderDate}>{order.createdDate}</span>
                    </div>
                  </div>
                  <span className={`${styles.statusBadge} ${styles[order.statusClass]}`}>
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
                  <button 
                    className={deleteBtnStyles.deleteBtn} 
                    aria-label="Delete Request"
                    onClick={() => {
                      setSelectedItems([String(order.id)]);
                      setConfirmAction('delete');
                      setIsConfirmModalOpen(true);
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
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
    
      {isConfirmModalOpen && createPortal(
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} onClick={() => setIsConfirmModalOpen(false)}></div>
          <div style={{ position: 'relative', backgroundColor: 'white', padding: '24px', borderRadius: '12px', maxWidth: '400px', width: '90%', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', color: confirmAction === 'delete' ? '#E53E3E' : 'var(--admin-brown)' }}>
              <AlertTriangle size={24} />
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>Confirm Action</h3>
            </div>
            <p style={{ margin: '0 0 24px 0', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
              Are you sure you want to {confirmAction === 'delete' ? `delete ${selectedItems.length} selected item(s)` : `mark ${selectedItems.length} selected item(s) as ${confirmAction}`}? {confirmAction === 'delete' && 'This action cannot be undone.'}
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button 
                onClick={() => setIsConfirmModalOpen(false)}
                style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'white', color: 'var(--color-text)', cursor: 'pointer', fontWeight: 600 }}
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  setIsConfirmModalOpen(false);
                  setSelectedItems([]);
                }}
                style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: confirmAction === 'delete' ? '#E53E3E' : 'var(--admin-pink)', color: 'white', cursor: 'pointer', fontWeight: 600 }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      <AdminFilterModal
        isOpen={isAdvFilterOpen}
        onClose={() => {
          setIsAdvFilterOpen(false);
          setDraftAdvFilters(appliedAdvFilters);
        }}
        onApply={handleApplyAdvFilters}
        onReset={handleResetAdvFilters}
      >
        <div className={filterModalStyles.filterGroup}>
          <span className={filterModalStyles.filterLabel}>Budget Range</span>
          <div className={filterModalStyles.bracketGrid}>
            {[
              { value: 'all', label: 'Any' },
              { value: '0-500', label: 'Up to ₹500' },
              { value: '500-2000', label: '₹500 - ₹2,000' },
              { value: '2000+', label: 'Over ₹2,000' },
            ].map(opt => (
              <button
                key={opt.value}
                className={`${filterModalStyles.bracketBtn} ${draftAdvFilters.budget === opt.value ? filterModalStyles.active : ''}`}
                onClick={() => setDraftAdvFilters(prev => ({ ...prev, budget: opt.value }))}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className={filterModalStyles.filterGroup}>
          <span className={filterModalStyles.filterLabel}>Guest Count</span>
          <div className={filterModalStyles.bracketGrid}>
            {[
              { value: 'all', label: 'Any' },
              { value: '1-50', label: '1 - 50' },
              { value: '51-200', label: '51 - 200' },
              { value: '200+', label: '200+' },
            ].map(opt => (
              <button
                key={opt.value}
                className={`${filterModalStyles.bracketBtn} ${draftAdvFilters.guests === opt.value ? filterModalStyles.active : ''}`}
                onClick={() => setDraftAdvFilters(prev => ({ ...prev, guests: opt.value }))}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </AdminFilterModal>
    </div>
  )
}
