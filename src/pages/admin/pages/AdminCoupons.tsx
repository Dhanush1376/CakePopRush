import { ActionDropdown } from '@/features/admin/components/ActionDropdown'
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Plus, Download, Filter, MoreVertical, Edit2, Trash2, ChevronLeft, ChevronRight, X, AlertTriangle, Eye, Copy, Ban } from 'lucide-react'
import { createPortal } from 'react-dom'
import styles from './AdminCoupons.module.css'
import { CustomSelect } from '@/features/admin/components/CustomSelect'
import { AdminFilterModal } from '@/features/admin/components/AdminFilterModal'
import filterModalStyles from '@/features/admin/components/AdminFilterModal.module.css'
import { ViewToggle } from '@/features/admin/components/ViewToggle'
import { AdminCouponsSkeleton } from '@/features/admin/components/AdminCouponsSkeleton';
import { useAdminTableState } from '@/features/admin/hooks/useAdminTableState';
import { exportToCSV } from '@/features/admin/utils/exportUtils';

import { adminCouponData } from '@/features/admin/api/adminDataProvider'

const statsDataStatic = null;
const couponsDataStatic = null;

const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'expiring', label: 'Expiring Soon' },
  { value: 'expired', label: 'Expired' }
];

const typeOptions = [
  { value: 'all', label: 'All Coupon Types' },
  { value: 'percentage', label: 'Percentage' },
  { value: 'shipping', label: 'Shipping' },
  { value: 'fixed', label: 'Fixed Amount' }
];

const expiryOptions = [
  { value: 'all', label: 'All Expiry' }
];

export function AdminCoupons() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = React.useState(true);
  
  const [statsData, setStatsData] = React.useState<any[]>([]);
  const [coupons, setCoupons] = React.useState<any[]>([]);
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
    data: coupons,
    searchFields: ['code', 'name', 'description'],
    filterFns: {
      status: (item, val) => item.status.toLowerCase() === val.toLowerCase(),
      type: (item, val) => item.type.toLowerCase() === val.toLowerCase(),
      expiry: () => true // Mock expiry filter
    },
    defaultPageSize: 10
  });
  const [view, setView] = React.useState<'list' | 'grid'>('list');

  const defaultAdvFilters = { minOrder: 'all', usageLimit: 'all' };
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
  const [selectedItems, setSelectedItems] = React.useState<number[]>([]);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = React.useState(false);
  const [confirmAction, setConfirmAction] = React.useState('');
  
  React.useEffect(() => {
    Promise.all([
      adminCouponData.getStats(),
      adminCouponData.getCoupons()
    ]).then(([stats, c]) => {
      setStatsData(stats);
      setCoupons(c);
    }).finally(() => {
      setIsLoading(false);
    });
  }, []);

  const handleDelete = (id: number) => {
    adminCouponData.deleteCoupon(id).then((success) => {
      if (success) {
        setCoupons(prev => prev.filter(c => c.id !== id));
      }
    });
  };

  if (isLoading) return <AdminCouponsSkeleton />;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Coupons & Offers</h1>
          <p className={styles.subtitle}>Create and manage discounts, coupons and special offers.</p>
        </div>
        <button className={styles.addBtn} onClick={() => navigate('/admin/coupons/add')}>
          <Plus size={18} strokeWidth={2.5} />
          Create Coupon
        </button>
      </div>

      <div className={styles.stickyWrapper}>
        {selectedItems.length > 0 ? (
          <div className={`${styles.toolbar} ${styles.bulkToolbar}`} style={{ backgroundColor: '#FFF0F5', borderColor: 'var(--admin-pink)', width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
              <span style={{ fontWeight: 600, color: 'var(--admin-pink)', whiteSpace: 'nowrap' }}>
                {selectedItems.length} <span className={styles.hideMobile}>coupon{selectedItems.length > 1 ? 's' : ''} selected</span>
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
                onClick={() => exportToCSV(coupons.filter(c => selectedItems.includes(c.id)), 'coupons-selected')}
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
                placeholder="Search coupons by code or name..." 
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
                options={typeOptions}
                value={activeFilters.type || 'all'}
                onChange={(val) => setFilter('type', val)}
                className={styles.filterSelect}
                variant="pink"
              />
              <CustomSelect
                options={expiryOptions}
                value={activeFilters.expiry || 'all'}
                onChange={(val) => setFilter('expiry', val)}
                className={styles.filterSelect}
                variant="turquoise"
              />
            </div>

            <div className={styles.actionButtons}>
              <button className={styles.btnOutline} onClick={() => setIsAdvFilterOpen(true)}>
                <Filter size={14} className={styles.btnIcon} />
                <span className={styles.hideMobile}>Filter</span>
                {activeFilterCount > 0 && <span className={styles.filterBadge}>{activeFilterCount}</span>}
              </button>
  
              <button 
                className={styles.btnOutline}
                onClick={() => exportToCSV(filteredData, 'coupons-export')}
              >
                <Download size={14} className={styles.btnIcon} />
                <span className={styles.hideMobile}>Export</span>
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
                  <th style={{ width: '40px', padding: '10px 4px', textAlign: 'center' }}>
                    <input type="checkbox" className={styles.checkbox} aria-label="Select all coupons" checked={selectedItems.length === paginatedData.length && paginatedData.length > 0} onChange={(e) => setSelectedItems(e.target.checked ? paginatedData.map(c => c.id) : [])} />
                  </th>
                  <th style={{ whiteSpace: 'nowrap' }}>COUPON CODE</th>
                  <th style={{ minWidth: '100px' }}>COUPON NAME</th>
                  <th>DISCOUNT</th>
                  <th>TYPE</th>
                  <th>MIN ORDER</th>
                  <th>USAGE</th>
                  <th>VALIDITY</th>
                  <th>STATUS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={10} style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--color-text-muted)' }}>
                      {searchTerm || Object.keys(activeFilters).length > 0 ? (
                        <>
                          <p>No coupons found matching your search or filters.</p>
                          <button 
                            className={styles.btnOutline} 
                            style={{ margin: '16px auto 0' }}
                            onClick={resetAll}
                          >
                            Clear Filters
                          </button>
                        </>
                      ) : (
                        <p>No coupons available.</p>
                      )}
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((coupon) => {
                  const typeClass = coupon.type === 'Percentage' ? styles.percentage : 
                                   coupon.type === 'Shipping' ? styles.shipping : styles.fixed;
                                   
                  const statusClass = coupon.status === 'Active' ? styles.active : 
                                     coupon.status === 'Expiring Soon' ? styles.expiring : styles.expired;

                  const progress = coupon.limit ? (coupon.used / coupon.limit) * 100 : coupon.used > 0 ? 100 : 0;
                  
                  const codeColorClass = styles[coupon.codeColor] || '';
                  const isWarning = coupon.validityTimeLeft === 'Expires today' || coupon.validityTimeLeft === 'Expired';

                  return (
                    <tr key={coupon.id} className={coupon.status === 'Expired' ? styles.expiredState : ''}>
                      <td style={{ width: '40px', padding: '10px 4px', textAlign: 'center' }}>
                        <input type="checkbox" className={styles.checkbox} aria-label={`Select ${coupon.code}`} checked={selectedItems.includes(coupon.id)} onChange={(e) => { if (e.target.checked) setSelectedItems(prev => [...prev, coupon.id]); else setSelectedItems(prev => prev.filter(id => id !== coupon.id)); }} />
                      </td>
                      <td>
                        <span className={`${styles.couponBadge} ${codeColorClass}`}>
                          {coupon.code}
                        </span>
                      </td>
                      <td>
                        <div>
                          <div className={styles.cellText}>{coupon.name}</div>
                          <div className={styles.cellSubtext}>{coupon.description}</div>
                        </div>
                      </td>
                      <td>
                        <div className={styles.cellText}>{coupon.discount}</div>
                        <div className={styles.cellSubtext}>{coupon.discountDesc}</div>
                      </td>
                      <td>
                        <span className={`${styles.typeBadge} ${typeClass}`}>
                          {coupon.type}
                        </span>
                      </td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <div className={styles.cellText}>{coupon.minOrder}</div>
                      </td>
                      <td>
                        <div className={styles.usageCol}>
                          <div className={styles.usageRow}>
                            {coupon.used} / {coupon.limit ? coupon.limit : '∞'}
                          </div>
                          <div className={styles.progressBarContainer}>
                            <div 
                              className={styles.progressBar} 
                              style={{ width: `${progress}%`, backgroundColor: coupon.barColor }} 
                            />
                          </div>
                        </div>
                      </td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <div className={styles.cellText}>{coupon.validityRange}</div>
                        <div className={`${styles.cellSubtext} ${isWarning ? styles.error : ''}`}>
                          {coupon.validityTimeLeft}
                        </div>
                      </td>
                      <td>
                        <span className={`${styles.statusBadge} ${statusClass}`}>
                          {coupon.status}
                        </span>
                      </td>
                      <td>
                        <div className={styles.actionsCell}>
                          <button 
                            className={styles.deleteCouponBtn} 
                            aria-label="Delete Coupon"
                            title="Delete Coupon"
                            onClick={() => handleDelete(coupon.id)}
                          >
                            <Trash2 size={16} />
                          </button>
                          <button className={styles.actionBtn} aria-label="Edit Coupon"><Edit2 size={16} /></button>
                          <ActionDropdown actions={[
      { label: 'View Details', icon: Eye },
      { label: 'Duplicate', icon: Copy },
      { label: 'Deactivate', icon: Ban, variant: 'danger' }
    ]} />
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
              </tbody>
            </table>
          </div>
        )}

        {view === 'grid' && (
          <div className={styles.itemsGrid}>
            {filteredData.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '48px 24px', color: 'var(--color-text-muted)' }}>
                {searchTerm || Object.keys(activeFilters).length > 0 ? (
                  <>
                    <p>No coupons found matching your search or filters.</p>
                    <button 
                      className={styles.btnOutline} 
                      style={{ margin: '16px auto 0' }}
                      onClick={resetAll}
                    >
                      Clear Filters
                    </button>
                  </>
                ) : (
                  <p>No coupons available.</p>
                )}
              </div>
            ) : (
              paginatedData.map((coupon) => {
              const typeClass = coupon.type === 'Percentage' ? styles.percentage : 
                               coupon.type === 'Shipping' ? styles.shipping : styles.fixed;
                               
              const statusClass = coupon.status === 'Active' ? styles.active : 
                                 coupon.status === 'Expiring Soon' ? styles.expiring : styles.expired;

              const progress = coupon.limit ? (coupon.used / coupon.limit) * 100 : coupon.used > 0 ? 100 : 0;
              const codeColorClass = styles[coupon.codeColor] || '';
              const isWarning = coupon.validityTimeLeft === 'Expires today' || coupon.validityTimeLeft === 'Expired';

              return (
                <div key={`grid-${coupon.id}`} className={`${styles.gridCard} ${coupon.status === 'Expired' ? styles.expiredState : ''}`}>
                  <div className={styles.mobileCardHeader}>
                    <span className={`${styles.couponBadge} ${codeColorClass}`}>{coupon.code}</span>
                    <span className={`${styles.statusBadge} ${statusClass}`}>{coupon.status}</span>
                  </div>
                  
                  <div>
                    <div className={styles.cellText}>{coupon.name}</div>
                    <div className={styles.cellSubtext}>{coupon.description}</div>
                  </div>

                  <div className={styles.mobileCardRow}>
                    <div>
                      <span className={styles.mobileCardLabel}>Discount</span>
                      <div className={styles.cellText}>{coupon.discount}</div>
                      <div className={styles.cellSubtext}>{coupon.discountDesc}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span className={styles.mobileCardLabel}>Type</span>
                      <span className={`${styles.typeBadge} ${typeClass}`}>{coupon.type}</span>
                    </div>
                  </div>

                  <div className={styles.mobileCardRow}>
                    <div>
                      <span className={styles.mobileCardLabel}>Min Order</span>
                      <div className={styles.cellText}>{coupon.minOrder}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span className={styles.mobileCardLabel}>Usage</span>
                      <div className={styles.cellText}>{coupon.used} / {coupon.limit ? coupon.limit : '∞'}</div>
                    </div>
                  </div>

                  <div>
                    <span className={styles.mobileCardLabel}>Validity</span>
                    <div className={styles.cellText}>{coupon.validityRange}</div>
                    <div className={`${styles.cellSubtext} ${isWarning ? styles.error : ''}`}>
                      {coupon.validityTimeLeft}
                    </div>
                  </div>

                  <div className={styles.actionsCell} style={{ marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid var(--color-border)', justifyContent: 'flex-end' }}>
                      <button 
                        className={styles.deleteCouponBtn} 
                        aria-label="Delete Coupon"
                        title="Delete Coupon"
                        onClick={() => handleDelete(coupon.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    <button className={styles.actionBtn} aria-label="Edit Coupon"><Edit2 size={16} /></button>
                    <ActionDropdown actions={[
      { label: 'View Details', icon: Eye },
      { label: 'Duplicate', icon: Copy },
      { label: 'Deactivate', icon: Ban, variant: 'danger' }
    ]} />
                  </div>
                </div>
              )
            })
          )}
          </div>
        )}

        {/* Mobile View */}
        <div className={styles.mobileCards} style={{ display: view === 'list' ? 'none' : '' }}>
          {filteredData.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--color-text-muted)' }}>
              {searchTerm || Object.keys(activeFilters).length > 0 ? (
                <>
                  <p>No coupons found matching your search or filters.</p>
                  <button 
                    className={styles.btnOutline} 
                    style={{ margin: '16px auto 0' }}
                    onClick={resetAll}
                  >
                    Clear Filters
                  </button>
                </>
              ) : (
                <p>No coupons available.</p>
              )}
            </div>
          ) : (
            paginatedData.map((coupon) => {
            const typeClass = coupon.type === 'Percentage' ? styles.percentage : 
                             coupon.type === 'Shipping' ? styles.shipping : styles.fixed;
                             
            const statusClass = coupon.status === 'Active' ? styles.active : 
                               coupon.status === 'Expiring Soon' ? styles.expiring : styles.expired;

            const progress = coupon.limit ? (coupon.used / coupon.limit) * 100 : coupon.used > 0 ? 100 : 0;
            const codeColorClass = styles[coupon.codeColor] || '';
            const isWarning = coupon.validityTimeLeft === 'Expires today' || coupon.validityTimeLeft === 'Expired';

            return (
              <div key={`mobile-${coupon.id}`} className={`${styles.mobileCard} ${coupon.status === 'Expired' ? styles.expiredState : ''}`}>
                <div className={styles.mobileCardHeader}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input type="checkbox" className={styles.checkbox} aria-label={`Select ${coupon.code} mobile`} checked={selectedItems.includes(coupon.id)} onChange={(e) => { if (e.target.checked) setSelectedItems(prev => [...prev, coupon.id]); else setSelectedItems(prev => prev.filter(id => id !== coupon.id)); }} />
                    <span className={`${styles.couponBadge} ${codeColorClass}`}>{coupon.code}</span>
                  </div>
                  <span className={`${styles.statusBadge} ${statusClass}`}>{coupon.status}</span>
                </div>
                
                <div>
                  <div className={styles.cellText}>{coupon.name}</div>
                  <div className={styles.cellSubtext}>{coupon.description}</div>
                </div>

                <div className={styles.mobileCardRow}>
                  <div>
                    <span className={styles.mobileCardLabel}>Discount</span>
                    <div className={styles.cellText}>{coupon.discount}</div>
                    <div className={styles.cellSubtext}>{coupon.discountDesc}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className={styles.mobileCardLabel}>Type</span>
                    <span className={`${styles.typeBadge} ${typeClass}`}>{coupon.type}</span>
                  </div>
                </div>

                <div className={styles.mobileCardRow}>
                  <div>
                    <span className={styles.mobileCardLabel}>Min Order</span>
                    <div className={styles.cellText}>{coupon.minOrder}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className={styles.mobileCardLabel}>Usage</span>
                    <div className={styles.cellText}>{coupon.used} / {coupon.limit ? coupon.limit : '∞'}</div>
                  </div>
                </div>

                <div>
                  <span className={styles.mobileCardLabel}>Validity</span>
                  <div className={styles.cellText}>{coupon.validityRange}</div>
                  <div className={`${styles.cellSubtext} ${isWarning ? styles.error : ''}`}>
                    {coupon.validityTimeLeft}
                  </div>
                </div>

                <div className={styles.actionsCell} style={{ marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid var(--color-border)', justifyContent: 'flex-end' }}>
                  <button 
                    className={styles.deleteCouponBtn} 
                    aria-label="Delete Coupon"
                    title="Delete Coupon"
                    onClick={() => handleDelete(coupon.id)}
                  >
                    <Trash2 size={16} />
                  </button>
                  <button className={styles.actionBtn} aria-label="Edit Coupon"><Edit2 size={16} /></button>
                  <ActionDropdown actions={[
      { label: 'View Details', icon: Eye },
      { label: 'Duplicate', icon: Copy },
      { label: 'Deactivate', icon: Ban, variant: 'danger' }
    ]} />
                </div>
              </div>
            )
          })
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
          <span className={filterModalStyles.filterLabel}>Minimum Order</span>
          <div className={filterModalStyles.bracketGrid}>
            {[
              { value: 'all', label: 'Any' },
              { value: 'none', label: 'None' },
              { value: '1-50', label: '₹1 - ₹50' },
              { value: '50+', label: 'Over ₹50' },
            ].map(opt => (
              <button
                key={opt.value}
                className={`${filterModalStyles.bracketBtn} ${draftAdvFilters.minOrder === opt.value ? filterModalStyles.active : ''}`}
                onClick={() => setDraftAdvFilters(prev => ({ ...prev, minOrder: opt.value }))}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className={filterModalStyles.filterGroup}>
          <span className={filterModalStyles.filterLabel}>Usage Limit</span>
          <div className={filterModalStyles.bracketGrid}>
            {[
              { value: 'all', label: 'Any' },
              { value: 'unlimited', label: 'Unlimited' },
              { value: '1-100', label: '1 - 100 uses' },
              { value: '100+', label: 'Over 100 uses' },
            ].map(opt => (
              <button
                key={opt.value}
                className={`${filterModalStyles.bracketBtn} ${draftAdvFilters.usageLimit === opt.value ? filterModalStyles.active : ''}`}
                onClick={() => setDraftAdvFilters(prev => ({ ...prev, usageLimit: opt.value }))}
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
