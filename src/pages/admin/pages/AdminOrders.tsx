import React, {} from 'react'
import { createPortal } from 'react-dom'
import { ActionDropdown } from '@/features/admin/components/ActionDropdown'
import { 
  Search, Plus, Download, Eye, MoreVertical, User, ChevronLeft, ChevronRight, Filter, Trash2, AlertTriangle, X, Printer, Archive
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import styles from './AdminOrders.module.css'
import deleteBtnStyles from '@/features/admin/components/AdminDeleteButton.module.css'
import { ViewToggle } from '@/features/admin/components/ViewToggle'
import { CustomSelect } from '@/features/admin/components/CustomSelect'
import { AdminFilterModal } from '@/features/admin/components/AdminFilterModal'
import filterModalStyles from '@/features/admin/components/AdminFilterModal.module.css'
import { AdminOrdersSkeleton } from '@/features/admin/components/AdminOrdersSkeleton'
import { InvoiceViewer } from '@/components/invoice/InvoiceViewer'
import { mapOrderToInvoiceData } from '@/lib/invoiceMapper'
import { useAdminTableState } from '@/features/admin/hooks/useAdminTableState'
import { exportToCSV } from '@/features/admin/utils/exportUtils'


const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' }
];

const paymentOptions = [
  { value: 'all', label: 'All Payment' },
  { value: 'online', label: 'Online' },
  { value: 'cod', label: 'COD' },
  { value: 'upi', label: 'UPI' }
];

const dateOptions = [
  { value: '7days', label: 'Last 7 Days' },
  { value: '30days', label: 'Last 30 Days' },
  { value: 'thismonth', label: 'This Month' },
  { value: 'alltime', label: 'All Time' }
];

import { adminOrderData } from '@/features/admin/api/adminDataProvider'

const statsDataStatic = null; // Removed static consts
const ordersDataStatic = null;

export function AdminOrders() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = React.useState(true);
  const [invoiceOrder, setInvoiceOrder] = React.useState<any | null>(null);

  const [statsData, setStatsData] = React.useState<any>(null);
  const [ordersData, setOrdersData] = React.useState<any[]>([]);

  React.useEffect(() => {
    Promise.all([
      adminOrderData.getStats(),
      adminOrderData.getOrders()
    ]).then(([stats, orders]) => {
      setStatsData(stats);
      setOrdersData(orders);
    }).finally(() => {
      setIsLoading(false);
    });
  }, []);



  const [activeActionMenu, setActiveActionMenu] = React.useState<string | null>(null);
  const [selectedOrders, setSelectedOrders] = React.useState<string[]>([]);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = React.useState(false);
  const [confirmAction, setConfirmAction] = React.useState('');
  const [view, setView] = React.useState<'list' | 'grid'>('list');

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
  const {
    searchTerm,
    setSearchTerm,
    activeFilters,
    setFilter,
    filteredData,
    paginatedData,
    currentPage,
    setCurrentPage,
    totalPages,
    pageInfo,
    resetAll
  } = useAdminTableState({
    data: ordersData,
    searchFields: ['id', 'customer', 'email'],
    filterFns: {
      status: (item, val) => item.status.toLowerCase() === val.toLowerCase(),
      paymentStatus: (item, val) => {
        const itemPayment = item.method.toLowerCase();
        if (val === 'online') return itemPayment !== 'cod'; // mock mapping
        if (val === 'cod') return itemPayment === 'cod';
        if (val === 'upi') return itemPayment === 'upi';
        return true;
      },
      // date is harder to mock without real dates, we'll just return true for demo
      date: () => true,
    },
    defaultPageSize: 10
  });

  const defaultAdvFilters = { paymentStatus: 'all', items: 'all', amount: 'all' };
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
    if (!activeActionMenu) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(`.${styles.actionMenuWrapper}`) && !target.closest(`.${styles.mcActions}`)) {
        setActiveActionMenu(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [activeActionMenu]);

  if (isLoading) {
    return <AdminOrdersSkeleton />;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Orders</h1>
          <p className={styles.subtitle}>Manage and track all customer orders.</p>
        </div>
        <Link to="/admin/orders/new" className={styles.newOrderBtn} style={{ textDecoration: 'none' }}>
          <Plus size={18} strokeWidth={2.5} />
          New Order
        </Link>
      </div>

      <div className={styles.stickyWrapper}>
        {selectedOrders.length > 0 ? (
        <div className={`${styles.toolbar} ${styles.bulkToolbar}`} style={{ backgroundColor: '#FFF0F5', borderColor: 'var(--admin-pink)', width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            <span style={{ fontWeight: 600, color: 'var(--admin-pink)', whiteSpace: 'nowrap' }}>
              {selectedOrders.length} <span className={styles.hideMobile}>order{selectedOrders.length > 1 ? 's' : ''}</span> selected
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
                { value: 'pending', label: 'Mark as Pending' },
                { value: 'processing', label: 'Mark as Processing' },
                { value: 'shipped', label: 'Mark as Shipped' },
                { value: 'delivered', label: 'Mark as Delivered' }
              ]}
            />
            <button 
              className={styles.btnOutline} 
              title="Export Selected" 
              style={{ padding: '8px' }}
              onClick={() => exportToCSV(ordersData.filter(o => selectedOrders.includes(o.id)), 'orders-selected')}
            >
              <Download size={16} style={{ flexShrink: 0, minWidth: '16px' }} /> <span className={styles.hideMobile}>Export Selected</span>
            </button>
            <button className={styles.btnOutline} onClick={() => setSelectedOrders([])} style={{ border: 'none', background: 'white', padding: '8px' }} title="Clear Selection">
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
            <input 
              type="text" 
              placeholder="Search orders..." 
              className={styles.searchInput} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className={styles.filtersScrollContainer}>
            <CustomSelect
              options={statusOptions}
              value={activeFilters.status || 'all'}
              onChange={(val) => setFilter('status', val)}
              className={styles.filterSelect}
              variant="yellow"
            />
            <CustomSelect
              options={paymentOptions}
              value={activeFilters.paymentStatus || 'all'}
              onChange={(val) => setFilter('paymentStatus', val)}
              className={styles.filterSelect}
              variant="pink"
            />
            <CustomSelect
              options={dateOptions}
              value={activeFilters.date || '7days'}
              onChange={(val) => setFilter('date', val)}
              className={styles.filterSelect}
              variant="turquoise"
            />
          </div>

          <div className={styles.actionButtons}>
            <button className={styles.btnOutline} title="Filter" onClick={() => setIsAdvFilterOpen(true)}>
              <Filter className={styles.btnIcon} /> <span className={styles.hideMobile}>Filter</span>
              {activeFilterCount > 0 && <span className={styles.filterBadge}>{activeFilterCount}</span>}
            </button>
            <button 
              className={styles.btnOutline} 
              title="Export"
              onClick={() => exportToCSV(filteredData, 'orders-export')}
            >
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
        {statsData.map((stat: any) => {
          const Icon = stat.icon;
          return (
            <div key={stat.id} className={styles.statCard}>
              <div className={styles.statIconWrapper} style={{ backgroundColor: stat.bg, color: stat.color }}>
                <Icon size={20} strokeWidth={2.5} />
              </div>
              <div className={styles.statLabel}>{stat.label}</div>
              <div className={styles.statValue}>{stat.value}</div>
              <div className={styles.statTrend}>
                <span className={stat.isPositive ? styles.positive : ''}>↑ {stat.trend}</span>
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
                <th style={{ width: '40px', textAlign: 'center' }}>
                  <input 
                    type="checkbox" 
                    className={styles.checkbox}
                    checked={selectedOrders.length === paginatedData.length && paginatedData.length > 0}
                    onChange={(e) => setSelectedOrders(e.target.checked ? paginatedData.map(o => o.id) : [])}
                  />
                </th>
                <th>ORDER</th>
                <th>CUSTOMER</th>
                <th>DATE</th>
                <th>AMOUNT</th>
                <th>PAYMENT</th>
                <th>STATUS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--color-text-muted)' }}>
                    {searchTerm || Object.keys(activeFilters).length > 0 ? (
                      <>
                        <p>No orders found matching your search or filters.</p>
                        <button 
                          className={styles.btnOutline} 
                          style={{ margin: '16px auto 0' }}
                          onClick={resetAll}
                        >
                          Clear Filters
                        </button>
                      </>
                    ) : (
                      <p>No orders available.</p>
                    )}
                  </td>
                </tr>
              ) : (
                paginatedData.map((order, idx) => (
                <tr key={idx}>
                  <td style={{ textAlign: 'center' }}>
                    <input 
                      type="checkbox" 
                      className={styles.checkbox}
                      checked={selectedOrders.includes(order.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedOrders(prev => [...prev, order.id]);
                        } else {
                          setSelectedOrders(prev => prev.filter(id => id !== order.id));
                        }
                      }}
                    />
                  </td>
                    <td onClick={() => navigate(`/admin/orders/${encodeURIComponent(order.id)}`)} style={{ cursor: 'pointer' }}>
                      <div className={styles.productCell}>
                        <img src={(order as any).productImage || '/images/placeholder.jpg'} alt={(order as any).productName || 'Order'} className={styles.productImage} />
                        <div>
                          <div className={styles.productName}>{(order as any).productName || 'Unknown Product'}</div>
                          <div className={styles.productSku}>{order.id}</div>
                        </div>
                      </div>
                    </td>
                  <td onClick={() => navigate(`/admin/orders/${encodeURIComponent(order.id)}`)} style={{ cursor: 'pointer' }}>
                    <div className={styles.customerCell}>
                      <div className={styles.customerAvatar}>
                        <User size={16} strokeWidth={2.5} />
                      </div>
                      <div>
                        <div className={styles.customerName}>{order.customer}</div>
                        <div className={styles.customerEmail}>{order.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className={styles.cellText}>{order.date}</div>
                    <div className={styles.cellSubtext}>{order.time}</div>
                  </td>
                  <td>
                    <div className={styles.cellText}>{order.amount}</div>
                    <div className={styles.cellSubtext}>{order.items}</div>
                  </td>
                  <td>
                    <div className={styles.cellText}>{order.method}</div>
                    <div className={`${styles.paymentStatus} ${order.paymentStatus === 'Paid' ? styles.paid : styles.pending}`}>
                      {order.paymentStatus}
                    </div>
                  </td>
                  <td>
                    <span className={`${styles.statusBadge} ${styles[order.status.toLowerCase()]}`}>
                      {order.status}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actionsCell}>
                      <button 
                        className={styles.actionBtn}
                        aria-label="View Order"
                        onClick={() => navigate(`/admin/orders/${encodeURIComponent(order.id)}`)}
                      >
                        <Eye size={16} />
                      </button>
                      <button 
                        className={deleteBtnStyles.deleteBtn} 
                        aria-label="Delete Order"
                        onClick={() => {
                          setSelectedOrders([String(order.id)]);
                          setConfirmAction('delete');
                          setIsConfirmModalOpen(true);
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                      <ActionDropdown actions={[
                        { label: 'View Details', icon: Eye, onClick: () => navigate(`/admin/orders/${encodeURIComponent(order.id)}`) },
                        { label: 'Print Packing Slip', icon: Printer },
                        { label: 'Archive Order', icon: Archive, variant: 'danger' as const }
                      ]} />
                    </div>
                  </td>
                </tr>
              ))
            )}
            </tbody>
          </table>
        </div>
        )}

        {/* Grid View / Mobile View */}
        <div className={`${styles.selectAllWrapper} ${view === 'list' ? styles.listMode : ''}`}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', fontSize: '14px', fontWeight: 600, color: 'var(--admin-brown)' }}>
            <input 
              type="checkbox" 
              className={styles.checkbox}
              checked={selectedOrders.length === paginatedData.length && paginatedData.length > 0}
              onChange={(e) => setSelectedOrders(e.target.checked ? paginatedData.map(o => o.id) : [])}
            />
            Select All Orders
          </label>
        </div>
        
        <div className={styles.ordersGrid} style={{ display: view === 'list' ? 'none' : '' }}>
          {filteredData.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--color-text-muted)' }}>
              {searchTerm || Object.keys(activeFilters).length > 0 ? (
                <>
                  <p>No orders found matching your search or filters.</p>
                  <button 
                    className={styles.btnOutline} 
                    style={{ margin: '16px auto 0' }}
                    onClick={resetAll}
                  >
                    Clear Filters
                  </button>
                </>
              ) : (
                <p>No orders available.</p>
              )}
            </div>
          ) : (
            paginatedData.map((order, idx) => (
            <div key={`grid-${order.id}-${idx}`} className={styles.orderCard}>
              <div className={styles.mcHeader}>
                  <div className={styles.productCell}>
                    <img src={(order as any).productImage || '/images/placeholder.jpg'} alt={(order as any).productName || 'Order'} className={styles.productImage} />
                    <div className={styles.customerInfo} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span className={styles.productName}>{(order as any).productName || 'Unknown Product'}</span>
                      <span className={styles.cellText} style={{ fontSize: '12px' }}>{order.id}</span>
                    </div>
                  </div>
                <span className={`${styles.statusBadge} ${styles[order.status.toLowerCase()]}`}>
                  {order.status}
                </span>
              </div>

              <div className={styles.mcContact}><span className={styles.customerName}>{order.customer}</span>
                <span className={styles.customerEmail} style={{ fontSize: '13px' }}>{order.email}</span>
              </div>

              <div className={styles.mcStats}>
                <div className={styles.mcStatItem}>
                  <span className={styles.cellSubtext}>Date</span>
                  <span className={styles.cellText} style={{ fontSize: '13px' }}>{order.date}</span>
                </div>
                <div className={styles.mcStatItem} style={{ alignItems: 'center' }}>
                  <span className={styles.cellSubtext}>Items</span>
                  <span className={styles.cellText} style={{ fontSize: '13px' }}>{order.items}</span>
                </div>
                <div className={styles.mcStatItem} style={{ textAlign: 'right' }}>
                  <span className={styles.cellSubtext} >Amount</span>
                  <span className={styles.cellText} style={{ fontSize: '14px', fontWeight: 600 }}>{order.amount}</span>
                </div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px', padding: '0 4px' }}>
                <div className={styles.cellText} style={{ fontSize: '13px' }}>{order.method}</div>
                <div className={`${styles.paymentStatus} ${order.paymentStatus === 'Paid' ? styles.paid : styles.pending}`}>
                  {order.paymentStatus}
                </div>
              </div>

              <div className={styles.mcActions} style={{ position: 'relative', marginTop: '12px', alignItems: 'center' }}>
                <input 
                  type="checkbox" 
                  className={styles.checkbox}
                  checked={selectedOrders.includes(order.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedOrders(prev => [...prev, order.id]);
                    } else {
                      setSelectedOrders(prev => prev.filter(id => id !== order.id));
                    }
                  }}
                  style={{ marginRight: '8px' }}
                />
                <button 
                  className={deleteBtnStyles.deleteBtn} 
                  aria-label="Delete Order"
                  onClick={() => {
                    setSelectedOrders([String(order.id)]);
                    setConfirmAction('delete');
                    setIsConfirmModalOpen(true);
                  }}
                  style={{ marginRight: '8px' }}
                >
                  <Trash2 size={14} />
                </button>
                {activeActionMenu === `grid-${order.id}` && (
                  <div className={styles.actionMenu} style={{ bottom: 'calc(100% + 4px)', top: 'auto', right: 0 }}>
                    <button className={styles.menuItem}>Edit Order</button>
                    <button className={styles.menuItem} onClick={() => setInvoiceOrder(order)}>View Invoice</button>
                    <button className={`${styles.menuItem} ${styles.menuItemDanger}`}>Cancel Order</button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        </div>
        
        {totalPages > 0 && (
          <div className={styles.pagination}>
            <span className={styles.paginationText}>{pageInfo}</span>
            <div className={styles.pageControls}>
              <button 
                className={styles.pageBtn} 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              >
                <ChevronLeft size={16} />
              </button>
              
              {Array.from({ length: totalPages }).map((_, i) => (
                <button 
                  key={i}
                  className={`${styles.pageBtn} ${currentPage === i + 1 ? styles.active : ''}`}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}

              <button 
                className={styles.pageBtn} 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
      
      <InvoiceViewer 
        isOpen={!!invoiceOrder} 
        onClose={() => setInvoiceOrder(null)} 
        data={invoiceOrder ? mapOrderToInvoiceData(invoiceOrder) : null} 
      />

      {isConfirmModalOpen && createPortal(
        <div className="animate-fade-in" style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} onClick={() => setIsConfirmModalOpen(false)}></div>
          <div className="animate-slide-up" style={{ position: 'relative', backgroundColor: 'white', padding: '24px', borderRadius: '12px', maxWidth: '400px', width: '90%', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', color: confirmAction === 'delete' ? '#E53E3E' : 'var(--admin-brown)' }}>
              <AlertTriangle size={24} />
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>Confirm Action</h3>
            </div>
            <p style={{ margin: '0 0 24px 0', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
              Are you sure you want to {confirmAction === 'delete' ? `delete ${selectedOrders.length} selected order(s)` : `mark ${selectedOrders.length} selected order(s) as ${confirmAction}`}? {confirmAction === 'delete' && 'This action cannot be undone.'}
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
                  // Execute action here
                  setIsConfirmModalOpen(false);
                  setSelectedOrders([]);
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
          setDraftAdvFilters(appliedAdvFilters); // reset draft to applied on close
        }}
        onApply={handleApplyAdvFilters}
        onReset={handleResetAdvFilters}
      >
        <div className={filterModalStyles.filterGroup}>
          <span className={filterModalStyles.filterLabel}>Payment Status</span>
          <div className={filterModalStyles.bracketGrid}>
            {[
              { value: 'all', label: 'Any' },
              { value: 'paid', label: 'Paid' },
              { value: 'unpaid', label: 'Unpaid' },
              { value: 'refunded', label: 'Refunded' },
            ].map(opt => (
              <button
                key={opt.value}
                className={`${filterModalStyles.bracketBtn} ${draftAdvFilters.paymentStatus === opt.value ? filterModalStyles.active : ''}`}
                onClick={() => setDraftAdvFilters(prev => ({ ...prev, paymentStatus: opt.value }))}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className={filterModalStyles.filterGroup}>
          <span className={filterModalStyles.filterLabel}>Items Count</span>
          <div className={filterModalStyles.bracketGrid}>
            {[
              { value: 'all', label: 'Any' },
              { value: '1', label: '1 Item' },
              { value: '2-5', label: '2 - 5 Items' },
              { value: '6+', label: '6+ Items' },
            ].map(opt => (
              <button
                key={opt.value}
                className={`${filterModalStyles.bracketBtn} ${draftAdvFilters.items === opt.value ? filterModalStyles.active : ''}`}
                onClick={() => setDraftAdvFilters(prev => ({ ...prev, items: opt.value }))}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className={filterModalStyles.filterGroup}>
          <span className={filterModalStyles.filterLabel}>Amount Range</span>
          <div className={filterModalStyles.bracketGrid}>
            {[
              { value: 'all', label: 'Any' },
              { value: '0-500', label: 'Up to ₹500' },
              { value: '500-2000', label: '₹500 - ₹2,000' },
              { value: '2000+', label: 'Over ₹2,000' },
            ].map(opt => (
              <button
                key={opt.value}
                className={`${filterModalStyles.bracketBtn} ${draftAdvFilters.amount === opt.value ? filterModalStyles.active : ''}`}
                onClick={() => setDraftAdvFilters(prev => ({ ...prev, amount: opt.value }))}
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
 // trigger hmr
