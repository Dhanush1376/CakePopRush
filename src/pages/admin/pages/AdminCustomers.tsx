import React from 'react'
import { createPortal } from 'react-dom'
import {
  Search, Filter, Download,
  MapPin, Eye, MoreVertical, ChevronLeft, ChevronRight,
  AlertTriangle, Trash2, X, MessageSquare, Ban
} from 'lucide-react'
import { ViewToggle } from '@/features/admin/components/ViewToggle'
import { CustomSelect } from '@/features/admin/components/CustomSelect'
import { CustomerDetailsModal } from '@/features/admin/components/CustomerDetailsModal'
import { AdminCustomersSkeleton } from '@/features/admin/components/AdminCustomersSkeleton'
import { ActionDropdown } from '@/features/admin/components/ActionDropdown'
import { AdminFilterModal } from '@/features/admin/components/AdminFilterModal'
import filterModalStyles from '@/features/admin/components/AdminFilterModal.module.css'
import styles from './AdminCustomers.module.css'
import deleteBtnStyles from '@/features/admin/components/AdminDeleteButton.module.css'
import { useAdminTableState } from '@/features/admin/hooks/useAdminTableState'
import { exportToCSV } from '@/features/admin/utils/exportUtils'


import { adminCustomerData } from '@/features/admin/api/adminDataProvider'

const kpiDataStatic = null;
const customersStatic = null;

export function AdminCustomers() {
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedItems, setSelectedItems] = React.useState<(string | number)[]>([]);
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
  const [kpiData, setKpiData] = React.useState<any>(null);
  const [customers, setCustomers] = React.useState<any[]>([]);

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
    data: customers,
    searchFields: ['name', 'email', 'phone', 'id'],
    filterFns: {
      status: (item, val) => item.status.toLowerCase() === val.toLowerCase(),
      location: (item, val) => item.location.toLowerCase().includes(val.toLowerCase()),
      date: () => true, // Mock date filtering
    },
    defaultPageSize: 10
  });

  const [selectedCustomer, setSelectedCustomer] = React.useState<any | null>(null);

  const defaultAdvFilters = { orders: 'all', spent: 'all', lastOrderDate: 'all' };
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
    Promise.all([
      adminCustomerData.getStats(),
      adminCustomerData.getCustomers()
    ]).then(([stats, custs]) => {
      setKpiData(stats);
      setCustomers(custs);
    }).finally(() => {
      setIsLoading(false);
    });
  }, []);

  if (isLoading) {
    return <AdminCustomersSkeleton />;
  }

  const statusOptions = [
    { label: 'All Status', value: 'all' },
    { label: 'Active', value: 'active' },
    { label: 'VIP', value: 'vip' },
    { label: 'Inactive', value: 'inactive' },
  ]

  const locationOptions = [
    { label: 'All Locations', value: 'all' },
    { label: 'Delhi', value: 'delhi' },
    { label: 'Mumbai', value: 'mumbai' },
    { label: 'Bangalore', value: 'bangalore' },
  ]

  const dateOptions = [
    { label: 'All Join Dates', value: 'all' },
    { label: 'Last 7 Days', value: '7d' },
    { label: 'Last 30 Days', value: '30d' },
  ]

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Customers</h1>
          <p className={styles.subtitle}>Manage and engage with your customers.</p>
        </div>
      </div>

      <div className={styles.stickyWrapper}>
        {selectedItems.length > 0 ? (
        <div className={`${styles.toolbar} ${styles.bulkToolbar}`} style={{ backgroundColor: '#FFF0F5', borderColor: 'var(--admin-pink)', width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            <span style={{ fontWeight: 600, color: 'var(--admin-pink)', whiteSpace: 'nowrap' }}>
              {selectedItems.length} <span className={styles.hideMobile}>customer{selectedItems.length > 1 ? 's' : ''} selected</span>
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
            <button 
              className={styles.btnOutline} 
              title="Export Selected" 
              style={{ padding: '8px' }}
              onClick={() => exportToCSV(customers.filter(c => selectedItems.includes(c.id)), 'customers-selected')}
            >
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
            <input 
              type="text" 
              placeholder="Search customers by name, email or phone..." 
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
              options={locationOptions}
              value={activeFilters.location || 'all'}
              onChange={(val) => setFilter('location', val)}
              className={styles.filterSelect}
              variant="pink"
            />
            <CustomSelect
              options={dateOptions}
              value={activeFilters.date || 'all'}
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
              onClick={() => exportToCSV(filteredData, 'customers-export')}
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

      {/* KPI Grid */}
      <div className={styles.kpiGrid}>
        {kpiData.map((kpi: any) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.id} className={styles.kpiCard}>
              <div className={styles.kpiIconWrapper} style={{ backgroundColor: kpi.bg, color: kpi.color }}>
                <Icon size={24} strokeWidth={2} />
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
          )
        })}
      </div>

      {/* Table Card */}
      <div className={styles.tableCard}>
        <div className={styles.tableHeader}>
          <span className={styles.tableTitle}>All Customers</span>
        </div>
        {view === 'list' && (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.checkboxCell}>
                    <input type="checkbox" className={styles.checkbox} aria-label="Select all customers" checked={selectedItems.length === paginatedData.length && paginatedData.length > 0} onChange={(e) => setSelectedItems(e.target.checked ? paginatedData.map(c => c.id) : [])} />
                  </th>
                  <th>CUSTOMER NAME</th>
                  <th>LOCATION</th>
                  <th style={{ textAlign: 'center' }}>ORDERS</th>
                  <th>TOTAL SPENT</th>
                  <th>LAST ORDER</th>
                  <th style={{ textAlign: 'center' }}>STATUS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--color-text-muted)' }}>
                      {searchTerm || Object.keys(activeFilters).length > 0 ? (
                        <>
                          <p>No customers found matching your search or filters.</p>
                          <button 
                            className={styles.btnOutline} 
                            style={{ margin: '16px auto 0' }}
                            onClick={resetAll}
                          >
                            Clear Filters
                          </button>
                        </>
                      ) : (
                        <p>No customers available.</p>
                      )}
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((cust) => (
                  <tr key={cust.id}>
                    <td className={styles.checkboxCell}>
                      <input type="checkbox" className={styles.checkbox} aria-label={`Select ${cust.name || cust.id}`} checked={selectedItems.includes(cust.id)} onChange={(e) => { if (e.target.checked) setSelectedItems(prev => [...prev, cust.id]); else setSelectedItems(prev => prev.filter(id => id !== cust.id)); }} />
                    </td>
                    <td>
                      <div className={styles.customerCell}>
                        <div className={styles.avatar} style={{ backgroundColor: cust.avatarBg, color: cust.avatarColor }}>
                          {cust.initials}
                        </div>
                        <div className={styles.customerInfo}>
                          <span className={styles.customerName}>{cust.name}</span>
                          <span className={styles.customerContact}>{cust.email}</span>
                          <span className={styles.customerContact}>{cust.phone}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className={styles.locationCell}>
                        <MapPin size={14} color={cust.locColor} />
                        {cust.location}
                      </div>
                    </td>
                    <td>
                      <div className={styles.ordersCell}>
                        <span className={styles.orderCount}>{cust.orders}</span>
                        <span className={styles.orderLabel}>Orders</span>
                      </div>
                    </td>
                    <td>
                      <span className={styles.spentCell}>{cust.spent}</span>
                    </td>
                    <td>
                      <div className={styles.dateCell}>
                        <span className={styles.datePrimary}>{cust.lastOrderDate}</span>
                        <span className={styles.dateSecondary}>{cust.lastOrderTime}</span>
                      </div>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={`${styles.badge} ${cust.status === 'Active' ? styles.badgeActive :
                          cust.status === 'VIP' ? styles.badgeVIP : styles.badgeInactive
                        }`}>
                        {cust.status}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actionsCell} style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button 
                          className={deleteBtnStyles.deleteBtn} 
                          aria-label="Delete Customer"
                          onClick={() => {
                            setSelectedItems([String(cust.id)]);
                            setConfirmAction('delete');
                            setIsConfirmModalOpen(true);
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                        <button className={styles.actionBtn} onClick={() => setSelectedCustomer(cust)}>
                          <Eye size={14} />
                        </button>
                        <ActionDropdown actions={[
                          { label: 'View Profile', icon: Eye },
                          { label: 'Message Customer', icon: MessageSquare },
                          { label: 'Block Customer', icon: Ban, variant: 'danger' as const }
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

        {view === 'grid' && (
          <div className={styles.customersGrid}>
            {filteredData.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '48px 24px', color: 'var(--color-text-muted)' }}>
                {searchTerm || Object.keys(activeFilters).length > 0 ? (
                  <>
                    <p>No customers found matching your search or filters.</p>
                    <button 
                      className={styles.btnOutline} 
                      style={{ margin: '16px auto 0' }}
                      onClick={resetAll}
                    >
                      Clear Filters
                    </button>
                  </>
                ) : (
                  <p>No customers available.</p>
                )}
              </div>
            ) : (
              paginatedData.map(cust => (
            <div key={`grid-${cust.id}`} className={styles.customerCard}>
              <div className={styles.mcHeader}>
                <div className={styles.customerCell}>
                  <div className={styles.avatar} style={{ backgroundColor: cust.avatarBg, color: cust.avatarColor }}>
                    {cust.initials}
                  </div>
                  <div className={styles.customerInfo}>
                    <span className={styles.customerName}>{cust.name}</span>
                    <div className={styles.locationCell} style={{ marginTop: '2px', fontSize: '12px' }}>
                      <MapPin size={12} color={cust.locColor} />
                      {cust.location}
                    </div>
                  </div>
                </div>
                <span className={`${styles.badge} ${cust.status === 'Active' ? styles.badgeActive :
                    cust.status === 'VIP' ? styles.badgeVIP : styles.badgeInactive
                  }`}>
                  {cust.status}
                </span>
              </div>

              <div className={styles.mcContact}>
                <span className={styles.customerContact}>{cust.phone}</span>
                <span className={styles.customerContact}>{cust.email}</span>
              </div>

              <div className={styles.mcStats}>
                <div className={styles.mcStatItem}>
                  <span className={styles.orderLabel}>Orders</span>
                  <span className={styles.orderCount}>{cust.orders}</span>
                </div>
                <div className={styles.mcStatItem} style={{ alignItems: 'center' }}>
                  <span className={styles.orderLabel}>Spent</span>
                  <span className={styles.spentCell}>{cust.spent}</span>
                </div>
                <div className={styles.mcStatItem} style={{ textAlign: 'right' }}>
                  <span className={styles.orderLabel}>Last Order</span>
                  <span className={styles.datePrimary} style={{ fontSize: '12px' }}>{cust.lastOrderDate}</span>
                </div>
              </div>

              <div className={styles.mcActions} style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                <button 
                  className={deleteBtnStyles.deleteBtn} 
                  aria-label="Delete Customer"
                  onClick={() => {
                    setSelectedItems([String(cust.id)]);
                    setConfirmAction('delete');
                    setIsConfirmModalOpen(true);
                  }}
                >
                  <Trash2 size={14} />
                </button>
                <button className={styles.actionBtn} onClick={() => setSelectedCustomer(cust)}>
                  <Eye size={14} />
                </button>
                <ActionDropdown actions={[
                  { label: 'View Profile', icon: Eye },
                  { label: 'Message Customer', icon: MessageSquare },
                  { label: 'Block Customer', icon: Ban, variant: 'danger' as const }
                ]} />
              </div>
            </div>
          ))
        )}
        </div>
        )}

        {totalPages > 0 && (
          <div className={styles.pagination}>
            <span className={styles.pageInfo}>{pageInfo}</span>
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
      <CustomerDetailsModal customer={selectedCustomer} onClose={() => setSelectedCustomer(null)} />
    
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
          setDraftAdvFilters(appliedAdvFilters); // reset draft to applied on close
        }}
        onApply={handleApplyAdvFilters}
        onReset={handleResetAdvFilters}
      >
        <div className={filterModalStyles.filterGroup}>
          <span className={filterModalStyles.filterLabel}>Order Count</span>
          <div className={filterModalStyles.bracketGrid}>
            {[
              { value: 'all', label: 'Any' },
              { value: '0-5', label: '0 - 5' },
              { value: '6-10', label: '6 - 10' },
              { value: '11-20', label: '11 - 20' },
              { value: '21+', label: '21+' },
            ].map(opt => (
              <button
                key={opt.value}
                className={`${filterModalStyles.bracketBtn} ${draftAdvFilters.orders === opt.value ? filterModalStyles.active : ''}`}
                onClick={() => setDraftAdvFilters(prev => ({ ...prev, orders: opt.value }))}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className={filterModalStyles.filterGroup}>
          <span className={filterModalStyles.filterLabel}>Total Spent</span>
          <div className={filterModalStyles.bracketGrid}>
            {[
              { value: 'all', label: 'Any' },
              { value: '0-1000', label: 'Up to ₹1,000' },
              { value: '1000-5000', label: '₹1,000 - ₹5,000' },
              { value: '5000+', label: 'Over ₹5,000' },
            ].map(opt => (
              <button
                key={opt.value}
                className={`${filterModalStyles.bracketBtn} ${draftAdvFilters.spent === opt.value ? filterModalStyles.active : ''}`}
                onClick={() => setDraftAdvFilters(prev => ({ ...prev, spent: opt.value }))}
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
