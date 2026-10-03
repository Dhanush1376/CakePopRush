import { ActionDropdown } from '@/features/admin/components/ActionDropdown'
import React from 'react'
import { createPortal } from 'react-dom'
import { useNavigate, useLocation } from 'react-router-dom'
import { Search, Plus, Download, Filter, Calendar, ChevronRight, ChevronLeft, Briefcase, Heart, Star, Cake, MoreVertical, Eye, AlertTriangle, Trash2, X, MessageSquare, Archive, FileText, FileEdit, SlidersHorizontal, ChevronDown, ZoomIn } from 'lucide-react'
import { AdminCustomOrderConfig } from '@/pages/admin/components/AdminCustomOrderConfig'

import styles from './AdminCustomOrders.module.css'
import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon'
import deleteBtnStyles from '@/features/admin/components/AdminDeleteButton.module.css'
import { CustomSelect } from '@/features/admin/components/CustomSelect'
import { AdminFilterModal } from '@/features/admin/components/AdminFilterModal'
import filterModalStyles from '@/features/admin/components/AdminFilterModal.module.css'
import { ViewToggle } from '@/features/admin/components/ViewToggle'
import { AdminCustomOrdersSkeleton } from '@/features/admin/components/AdminCustomOrdersSkeleton'
import { useAdminTableState } from '@/features/admin/hooks/useAdminTableState'
import { CustomOrderDetailModal } from '@/features/admin/components/CustomOrderDetailModal'
import { AdminImageLightbox } from '@/features/admin/components/AdminImageLightbox'

import { adminCustomOrderData } from '@/features/admin/api/adminDataProvider'

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
  'wedding': Heart,
  'birthday': Cake,
  'corporate': Briefcase,
  'baby_shower': Star,
  'other': Star,
  'custom': Star,
};

const OccasionColorMap: Record<string, {bg: string, color: string}> = {
  'Wedding': { bg: '#FFF0F5', color: 'var(--admin-pink)' },
  'Birthday': { bg: '#FFF8E1', color: '#F59E0B' },
  'Corporate': { bg: '#E0FAFC', color: 'var(--admin-cyan)' },
  'Baby Shower': { bg: '#FCE7F3', color: '#EC4899' },
  'Custom': { bg: '#F3F4F6', color: '#6B7280' },
  'wedding': { bg: '#FFF0F5', color: 'var(--admin-pink)' },
  'birthday': { bg: '#FFF8E1', color: '#F59E0B' },
  'corporate': { bg: '#E0FAFC', color: 'var(--admin-cyan)' },
  'baby_shower': { bg: '#FCE7F3', color: '#EC4899' },
  'other': { bg: '#F3F4F6', color: '#6B7280' },
  'custom': { bg: '#F3F4F6', color: '#6B7280' },
};


export function AdminCustomOrders() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedItems, setSelectedItems] = React.useState<string[]>([]);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = React.useState(false);
  const [confirmAction, setConfirmAction] = React.useState('');

  const [customOrders, setCustomOrders] = React.useState<any[]>([]);
  const [selectedOrderDetail, setSelectedOrderDetail] = React.useState<any | null>(null);
  const [previewLightbox, setPreviewLightbox] = React.useState<{
    isOpen: boolean;
    src: string;
    title: string;
    subtitle?: string;
  }>({
    isOpen: false,
    src: '',
    title: '',
    subtitle: '',
  });

  React.useEffect(() => {
    adminCustomOrderData.getCustomOrders()
      .then((orders) => {
        setCustomOrders(orders);
      })
      .finally(() => {
        setIsLoading(false);
      });
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
    data: customOrders,
    searchFields: ['id', 'customerName', 'email', 'phone'],
    filterFns: {
      status: (item, val) => (item?.status || '').toLowerCase().includes(val.toLowerCase()) || val.toLowerCase().includes((item?.status || '').toLowerCase()),
      occasion: (item, val) => {
        const occ = (item?.occasion || '').toLowerCase();
        if (val === 'custom') return occ === 'custom';
        return occ === val.toLowerCase();
      },
      date: (item, val) => {
        if (!val || val === 'all') return true;
        const rawDate = item.createdDateRaw || item.createdAt || item.createdDate;
        const d = new Date(rawDate);
        if (isNaN(d.getTime())) return true;
        const now = new Date();
        if (val === 'today') {
          return d.toDateString() === now.toDateString();
        }
        if (val === 'week') {
          return d.getTime() >= now.getTime() - 7 * 86400000;
        }
        if (val === 'month') {
          return d.getTime() >= now.getTime() - 30 * 86400000;
        }
        return true;
      },
      budget: (item, val) => {
        if (!val || val === 'all') return true;
        const b = typeof item.budget === 'number' ? item.budget : parseFloat(String(item.budget || '').replace(/[^0-9.]/g, ''));
        if (isNaN(b)) return true;
        if (val === '0-500') return b <= 500;
        if (val === '500-2000') return b > 500 && b <= 2000;
        if (val === '2000+') return b > 2000;
        return true;
      },
      guests: (item, val) => {
        if (!val || val === 'all') return true;
        const q = typeof item.quantity === 'number' ? item.quantity : parseInt(String(item.quantity || ''), 10);
        if (isNaN(q)) return true;
        if (val === '1-50') return q <= 50;
        if (val === '51-200') return q > 50 && q <= 200;
        if (val === '200+') return q > 200;
        return true;
      },
    },
    defaultPageSize: 10
  });
  const [view, setView] = React.useState<'list' | 'grid'>('list');

  const isBuilder = location.pathname.endsWith('/builder') || location.search.includes('tab=builder') || location.search.includes('workspace=builder');
  const [currentWorkspace, setCurrentWorkspace] = React.useState<'inquiries' | 'builder'>(
    isBuilder ? 'builder' : 'inquiries'
  );

  React.useEffect(() => {
    if (location.pathname.endsWith('/builder') || location.search.includes('tab=builder') || location.search.includes('workspace=builder')) {
      setCurrentWorkspace('builder');
    } else {
      setCurrentWorkspace('inquiries');
    }
  }, [location.pathname, location.search]);

  const totalOrdersCount = customOrders.length;
  const pendingCount = customOrders.filter(o => {
    const s = (o.status || '').toLowerCase();
    return s.includes('pending') || s.includes('quoted');
  }).length;
  const approvedCount = customOrders.filter(o => {
    const s = (o.status || '').toLowerCase();
    return s.includes('approved') || s.includes('progress');
  }).length;
  const completedCount = customOrders.filter(o => {
    const s = (o.status || '').toLowerCase();
    return s.includes('completed');
  }).length;

  const defaultAdvFilters = { 
    status: 'all', 
    occasion: 'all', 
    date: 'all', 
    budget: 'all', 
    guests: 'all' 
  };
  const [isAdvFilterOpen, setIsAdvFilterOpen] = React.useState(false);
  const [draftAdvFilters, setDraftAdvFilters] = React.useState(defaultAdvFilters);
  const [appliedAdvFilters, setAppliedAdvFilters] = React.useState(defaultAdvFilters);

  const activeFilterCount = Object.values(appliedAdvFilters).filter(v => v !== 'all').length;

  const handleApplyAdvFilters = () => {
    setAppliedAdvFilters(draftAdvFilters);
    if (draftAdvFilters.status !== undefined) setFilter('status', draftAdvFilters.status);
    if (draftAdvFilters.occasion !== undefined) setFilter('occasion', draftAdvFilters.occasion);
    if (draftAdvFilters.date !== undefined) setFilter('date', draftAdvFilters.date);
    if (draftAdvFilters.budget !== undefined) setFilter('budget', draftAdvFilters.budget);
    if (draftAdvFilters.guests !== undefined) setFilter('guests', draftAdvFilters.guests);
    setIsAdvFilterOpen(false);
  };

  const handleResetAdvFilters = () => {
    setDraftAdvFilters(defaultAdvFilters);
    setAppliedAdvFilters(defaultAdvFilters);
    setFilter('status', 'all');
    setFilter('occasion', 'all');
    setFilter('date', 'all');
    setFilter('budget', 'all');
    setFilter('guests', 'all');
  };

  const handleExport = () => {
    if (filteredData.length === 0) return;
    const dataToExport = filteredData.map(item => ({
      ID: item.id,
      Customer: item.customerName,
      Email: item.email,
      Phone: item.phone || '',
      Occasion: item.occasion,
      Quantity: item.quantity,
      Budget: item.budget,
      Status: item.status,
      TargetDate: item.targetDate || item.date || ''
    }));
    const headers = Object.keys(dataToExport[0]).join(',');
    const rows = dataToExport.map(row => Object.values(row).map(v => `"${v}"`).join(','));
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `custom-orders-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportSelected = () => {
    const selectedData = customOrders.filter(o => selectedItems.includes(o.id));
    if (selectedData.length === 0) return;
    const dataToExport = selectedData.map(item => ({
      ID: item.id,
      Customer: item.customerName,
      Email: item.email,
      Phone: item.phone || '',
      Occasion: item.occasion,
      Quantity: item.quantity,
      Budget: item.budget,
      Status: item.status,
      TargetDate: item.targetDate || item.date || ''
    }));
    const headers = Object.keys(dataToExport[0]).join(',');
    const rows = dataToExport.map(row => Object.values(row).map(v => `"${v}"`).join(','));
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `custom-orders-selected-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Custom Orders</h1>
          <div className={styles.statsSubtitle}>
            <span className={styles.statItemTotal}>
              {totalOrdersCount} Total Inquiries
            </span>
            <span className={styles.statDotBadge}>
              <span className={styles.dotAmber} />
              <span className={styles.statItemPending}>{pendingCount} Pending</span>
            </span>
            <span className={styles.statDotBadge}>
              <span className={styles.dotEmerald} />
              <span className={styles.statItemActive}>{approvedCount} Approved</span>
            </span>
          </div>
        </div>
      </div>

      {/* Sticky Search & Actions Bar (EventDecor / Custom Orders Reference Layout) */}
      {currentWorkspace === 'inquiries' && (
        <div className={styles.stickyWrapper}>
        {/* Mobile Workspace Toggle (Above search bar on mobile) */}
        <div className={styles.mobileWorkspaceToggle}>
          <button
            type="button"
            onClick={() => {
              setCurrentWorkspace('inquiries');
              navigate('/admin/custom-orders');
            }}
            className={`${styles.mobileWorkspaceBtn} ${styles.mobileWorkspaceBtnActive}`}
          >
            <FileText size={15} />
            <span>Inquiries</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setCurrentWorkspace('builder');
              navigate('/admin/custom-orders/builder');
            }}
            className={styles.mobileWorkspaceBtn}
          >
            <FileEdit size={15} />
            <span>Form Builder</span>
          </button>
        </div>

        {selectedItems.length > 0 ? (
          /* Bulk Action Toolbar */
          <div className={styles.bulkToolbarRow}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
              <span style={{ fontWeight: 600, color: 'var(--admin-pink)', whiteSpace: 'nowrap' }}>
                {selectedItems.length} <span className={styles.hideMobile}>request{selectedItems.length > 1 ? 's' : ''} selected</span>
              </span>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'flex-end', flexWrap: 'nowrap' }}>
              <CustomSelect 
                className={styles.mobileSelect}
                placeholder="Update Status..."
                value=""
                onChange={(val) => {
                  if (val) {
                    setConfirmAction(val);
                    setIsConfirmModalOpen(true);
                  }
                }}
                options={[
                  { value: 'approved', label: 'Mark as Approved' },
                  { value: 'completed', label: 'Mark as Completed' },
                  { value: 'rejected', label: 'Mark as Rejected' }
                ]}
              />
              <button 
                type="button"
                className={styles.exportBtn} 
                title="Export Selected" 
                onClick={handleExportSelected}
              >
                <Download size={16} /> <span className={styles.hideMobile}>Export Selected</span>
              </button>
              <button 
                type="button"
                className={styles.exportBtn} 
                onClick={() => setSelectedItems([])} 
                title="Clear Selection"
              >
                <span className={styles.hideMobile}>Clear Selection</span>
                <X size={16} className={styles.showMobileInline} />
              </button>
              <button 
                type="button"
                className={styles.btnDanger} 
                title="Delete Selected"
                onClick={() => {
                  setConfirmAction('delete');
                  setIsConfirmModalOpen(true);
                }}
              >
                <Trash2 size={16} /> <span className={styles.hideMobile}>Delete Selected</span>
              </button>
            </div>
          </div>
        ) : (
          /* Single Row: Search Input + Workspace Switcher + Filters + Export + ViewToggle */
          <div className={styles.searchActionsBar}>
            {currentWorkspace === 'inquiries' && (
              <div className={styles.searchWrapper}>
                <Search size={18} className={styles.searchIcon} />
                <input 
                  type="text" 
                  placeholder="Search inquiries by ID, customer, occasion, details..." 
                  className={styles.searchInput} 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button 
                    type="button" 
                    onClick={() => setSearchTerm('')} 
                    className={styles.clearSearchBtn}
                    title="Clear search"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>
            )}

            {/* Desktop Workspace Switcher */}
            <div className={styles.desktopWorkspaceSwitcher}>
              <button
                type="button"
                onClick={() => {
                  setCurrentWorkspace('inquiries');
                  navigate('/admin/custom-orders');
                }}
                className={`${styles.workspaceBtn} ${styles.workspaceBtnActive}`}
                title="View customer custom order inquiries"
              >
                <FileText size={15} />
                <span>Inquiries</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setCurrentWorkspace('builder');
                  navigate('/admin/custom-orders/builder');
                }}
                className={styles.workspaceBtn}
                title="Customize storefront form steps and questions"
              >
                <FileEdit size={15} />
                <span>Form Builder</span>
              </button>
            </div>

            {/* Actions: Filters, Export, ViewToggle */}
            {currentWorkspace === 'inquiries' && (
              <div className={styles.actionControlsGroup}>
                <button 
                  type="button"
                  className={`${styles.filterBtn} ${activeFilterCount > 0 ? styles.filterBtnActive : ''}`}
                  title="Filters" 
                  onClick={() => setIsAdvFilterOpen(true)}
                >
                  <SlidersHorizontal size={16} />
                  <span className={styles.filterBtnText}>
                    {activeFilterCount > 0 ? `${activeFilterCount} Filters` : 'Filters'}
                  </span>
                  {activeFilterCount > 0 && <span className={styles.filterBadge}>{activeFilterCount}</span>}
                </button>

                <button 
                  type="button"
                  className={styles.exportBtn} 
                  title="Export CSV" 
                  onClick={handleExport}
                >
                  <Download size={16} />
                  <span className={styles.exportBtnText}>Export</span>
                </button>

                <div className={styles.viewToggleWrapper}>
                  <ViewToggle view={view} onViewChange={setView} />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Active Filter Chips Row */}
        {currentWorkspace === 'inquiries' && (activeFilterCount > 0 || (activeFilters.occasion && activeFilters.occasion !== 'all') || (activeFilters.status && activeFilters.status !== 'all') || (activeFilters.date && activeFilters.date !== 'all') || searchTerm) && (
          <div className={styles.activeFilterChipsRow}>
            <span className={styles.activeChipsLabel}>Active filters:</span>
            {searchTerm && (
              <span className={styles.filterChip}>
                Search: "{searchTerm}"
                <button type="button" onClick={() => setSearchTerm('')}><X size={12} /></button>
              </span>
            )}
            {activeFilters.status && activeFilters.status !== 'all' && (
              <span className={styles.filterChip}>
                Status: {activeFilters.status}
                <button type="button" onClick={() => {
                  setFilter('status', 'all');
                  setDraftAdvFilters(prev => ({ ...prev, status: 'all' }));
                  setAppliedAdvFilters(prev => ({ ...prev, status: 'all' }));
                }}><X size={12} /></button>
              </span>
            )}
            {activeFilters.occasion && activeFilters.occasion !== 'all' && (
              <span className={styles.filterChip}>
                Occasion: {activeFilters.occasion}
                <button type="button" onClick={() => {
                  setFilter('occasion', 'all');
                  setDraftAdvFilters(prev => ({ ...prev, occasion: 'all' }));
                  setAppliedAdvFilters(prev => ({ ...prev, occasion: 'all' }));
                }}><X size={12} /></button>
              </span>
            )}
            {activeFilters.date && activeFilters.date !== 'all' && (
              <span className={styles.filterChip}>
                Date: {activeFilters.date}
                <button type="button" onClick={() => {
                  setFilter('date', 'all');
                  setDraftAdvFilters(prev => ({ ...prev, date: 'all' }));
                  setAppliedAdvFilters(prev => ({ ...prev, date: 'all' }));
                }}><X size={12} /></button>
              </span>
            )}
            {appliedAdvFilters.budget && appliedAdvFilters.budget !== 'all' && (
              <span className={styles.filterChip}>
                Budget: {appliedAdvFilters.budget}
                <button type="button" onClick={() => {
                  setDraftAdvFilters(prev => ({ ...prev, budget: 'all' }));
                  setAppliedAdvFilters(prev => ({ ...prev, budget: 'all' }));
                }}><X size={12} /></button>
              </span>
            )}
            {appliedAdvFilters.guests && appliedAdvFilters.guests !== 'all' && (
              <span className={styles.filterChip}>
                Guests: {appliedAdvFilters.guests}
                <button type="button" onClick={() => {
                  setDraftAdvFilters(prev => ({ ...prev, guests: 'all' }));
                  setAppliedAdvFilters(prev => ({ ...prev, guests: 'all' }));
                }}><X size={12} /></button>
              </span>
            )}
            <button 
              type="button" 
              onClick={() => {
                resetAll();
                handleResetAdvFilters();
              }} 
              className={styles.clearAllChipsBtn}
            >
              Clear all
            </button>
          </div>
        )}
      </div>
      )}

      {currentWorkspace === 'builder' ? (
        <AdminCustomOrderConfig
          currentWorkspace={currentWorkspace}
          onWorkspaceChange={(ws) => {
            setCurrentWorkspace(ws);
            if (ws === 'inquiries') {
              navigate('/admin/custom-orders');
            } else {
              navigate('/admin/custom-orders/builder');
            }
          }}
        />
      ) : (
        <>
          {view === 'list' && (
        <div className={`${styles.tableCard} ${styles.desktopOnlyTable}`}>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.checkboxCell}>
                    <input type="checkbox" className={styles.checkbox} aria-label="Select all orders" checked={selectedItems.length === paginatedData.length && paginatedData.length > 0} onChange={(e) => setSelectedItems(e.target.checked ? paginatedData.map(c => c.id) : [])} />
                  </th>
                  <th>REQUEST ID</th>
                  <th>CUSTOMER</th>
                  <th>DESIGN</th>
                  <th>OCCASION</th>
                  <th>QTY</th>
                  <th>TARGET DATE</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ padding: 0, border: 'none' }}>
                      <div className={styles.emptyStateContainer}>
                        <div className={styles.emptyStateIconRing}>
                          <Cake size={30} strokeWidth={1.6} />
                        </div>
                        {searchTerm || Object.values(activeFilters).some(v => v && v !== 'all') ? (
                          <>
                            <h4 className={styles.emptyStateTitle}>No matching inquiries</h4>
                            <p className={styles.emptyStateSubtext}>No results match your current filters.</p>
                            <button 
                              type="button"
                              className={styles.emptyStateClearBtn}
                              onClick={resetAll}
                            >
                              <X size={14} /> Clear Filters
                            </button>
                          </>
                        ) : (
                          <>
                            <h4 className={styles.emptyStateTitle}>No custom orders yet</h4>
                            <p className={styles.emptyStateSubtext}>Customer inquiries will appear here.</p>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedData.map(order => {
                  const OccasionIcon = OccasionIconMap[order.occasion] || Star;
                  const occColors = OccasionColorMap[order.occasion] || { bg: '#FFF0F5', color: 'var(--admin-pink)' };

                  return (
                    <tr 
                      key={order.id} 
                      className={styles.tableRow}
                    >
                      <td className={styles.checkboxCell} onClick={(e) => e.stopPropagation()}>
                        <input 
                          type="checkbox" 
                          className={styles.checkbox} 
                          aria-label={`Select ${order.customerName || order.id}`} 
                          checked={selectedItems.includes(order.id)} 
                          onChange={(e) => { 
                            if (e.target.checked) setSelectedItems(prev => [...prev, order.id]); 
                            else setSelectedItems(prev => prev.filter(id => id !== order.id)); 
                          }} 
                        />
                      </td>
                      <td onClick={() => setSelectedOrderDetail(order)}>
                        <span className={styles.idBadge}>{order.id}</span>
                        <div className={styles.orderDate}>{order.createdDate}</div>
                      </td>
                      <td onClick={() => setSelectedOrderDetail(order)}>
                        <div className={styles.customerCell}>
                          <div className={styles.avatar} style={{ backgroundColor: order.avatarBg || '#FFF0F5', color: order.avatarColor || 'var(--admin-pink)' }}>
                            {order.initials}
                          </div>
                          <div className={styles.customerInfo}>
                            <span className={styles.customerName}>{order.customerName}</span>
                            <span className={styles.customerContact} style={{ display: 'flex', flexDirection: 'column' }}>
                              {order.email && <span>{order.email}</span>}
                              {order.phone && <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 500 }}>{order.phone}</span>}
                              {!order.email && !order.phone && <span>No contact info</span>}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td onClick={(e) => {
                        if (order.designImg) {
                          e.stopPropagation();
                          setPreviewLightbox({
                            isOpen: true,
                            src: order.designImg,
                            title: `Reference Photo • Request #${String(order.id).replace('#', '')}`,
                            subtitle: `${order.customerName} • ${order.occasion || 'Custom Order'}`
                          });
                        } else {
                          setSelectedOrderDetail(order);
                        }
                      }}>
                        <div className={styles.designPreviewWrapper} title="Click to view full picture">
                          <img src={order.designImg} alt={`${order.occasion} design`} className={styles.designPreview} />
                          <span className={styles.zoomIconOverlay}>
                            <ZoomIn size={14} />
                          </span>
                        </div>
                      </td>
                      <td onClick={() => setSelectedOrderDetail(order)}>
                        <div className={styles.occasionCell} style={{ backgroundColor: occColors.bg, color: occColors.color, borderColor: occColors.color + '40' }}>
                          <div className={styles.occasionIconWrapper}>
                            <OccasionIcon size={13} />
                          </div>
                          <span className={styles.occasionText}>{order.occasion}</span>
                        </div>
                      </td>
                      <td onClick={() => setSelectedOrderDetail(order)}>
                        <div className={styles.qtyBadge}>
                          <span className={styles.qtyNumber}>{order.quantity}</span>
                          <span className={styles.qtyUnit}>pops</span>
                        </div>
                      </td>
                      <td onClick={() => setSelectedOrderDetail(order)}>
                        <div className={styles.targetDate}>
                          <Calendar size={13} className={styles.targetDateIcon} />
                          <span>{order.targetDate}</span>
                        </div>
                      </td>
                      <td className={styles.actionsCell} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.actionsGroup}>
                          <button 
                            type="button"
                            className={styles.actionBtnDelete} 
                            title="Delete Request"
                            aria-label="Delete Request"
                            onClick={() => {
                              setSelectedItems([String(order.id)]);
                              setConfirmAction('delete');
                              setIsConfirmModalOpen(true);
                            }}
                          >
                            <Trash2 size={15} />
                          </button>
                          <ActionDropdown actions={[
                            { label: 'View Details', icon: Eye, onClick: () => setSelectedOrderDetail(order) },
                            { 
                              label: 'Delete', 
                              icon: Trash2, 
                              variant: 'danger', 
                              onClick: () => {
                                setSelectedItems([String(order.id)]);
                                setConfirmAction('delete');
                                setIsConfirmModalOpen(true);
                              }
                            }
                          ]} />
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className={styles.pagination}>
              <div className={styles.paginationText}>{pageInfo}</div>
              <div className={styles.pageControls}>
                <button 
                  className={styles.pageBtn} 
                  aria-label="Previous page"
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
                  aria-label="Next page"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Cards View (Mobile stack & Desktop grid matching EventDecor layout) */}
      <div className={`${styles.itemsGrid} ${view === 'list' ? styles.hideOnDesktop : ''}`}>
        {filteredData.length === 0 ? (
          <div style={{ gridColumn: '1 / -1' }}>
            <div className={styles.emptyStateContainer}>
              <div className={styles.emptyStateIconRing}>
                <Cake size={30} strokeWidth={1.6} />
              </div>
              {searchTerm || Object.values(activeFilters).some(v => v && v !== 'all') ? (
                <>
                  <h4 className={styles.emptyStateTitle}>No matching inquiries</h4>
                  <p className={styles.emptyStateSubtext}>No results match your current filters.</p>
                  <button 
                    type="button"
                    className={styles.emptyStateClearBtn}
                    onClick={resetAll}
                  >
                    <X size={14} /> Clear Filters
                  </button>
                </>
              ) : (
                <>
                  <h4 className={styles.emptyStateTitle}>No custom orders yet</h4>
                  <p className={styles.emptyStateSubtext}>Customer inquiries will appear here.</p>
                </>
              )}
            </div>
          </div>
        ) : (
          paginatedData.map(order => {
              return (
                <div 
                  key={`card-${order.id}`} 
                  className={styles.inquiryCard}
                  onClick={() => setSelectedOrderDetail(order)}
                >
                  {/* Row 1: Avatar, Customer Name, ID, Type & Status Badge */}
                  <div className={styles.cardHeaderRow}>
                    <div className={styles.cardCustomerInfo}>
                      <div 
                        className={styles.cardAvatar}
                        style={{
                          backgroundColor: order.avatarBg || '#FAF7F2',
                          color: order.avatarColor || 'var(--admin-brown)'
                        }}
                      >
                        {order.initials || (order.customerName || 'C').charAt(0).toUpperCase()}
                      </div>
                      <div className={styles.cardCustomerMeta}>
                        <span className={styles.cardCustomerName}>{order.customerName}</span>
                        <div className={styles.cardCustomerSubMeta}>
                          <span className={styles.cardOrderCode}>#{order.id.replace('#', '')}</span>
                          <span className={styles.cardProductTypeBadge}>PRODUCT</span>
                        </div>
                      </div>
                    </div>

                    <span 
                      className={styles.cardStatusBadge}
                      style={(() => {
                        const s = (order.status || '').toLowerCase();
                        if (s.includes('pending')) return { backgroundColor: '#FEF3C7', color: '#B45309', borderColor: '#FBBF2440' };
                        if (s.includes('quoted') || s.includes('quote sent')) return { backgroundColor: '#EDE9FE', color: '#6D28D9', borderColor: '#8B5CF640' };
                        if (s.includes('approved')) return { backgroundColor: '#D1FAE5', color: '#047857', borderColor: '#10B98140' };
                        if (s.includes('progress')) return { backgroundColor: '#DBEAFE', color: '#2563EB', borderColor: '#3B82F640' };
                        if (s.includes('completed')) return { backgroundColor: '#D1FAE5', color: '#059669', borderColor: '#10B98140' };
                        if (s.includes('rejected') || s.includes('declined')) return { backgroundColor: '#FFE4E6', color: '#BE123C', borderColor: '#F4364C40' };
                        if (s.includes('cancelled')) return { backgroundColor: '#F1F5F9', color: '#64748B', borderColor: '#94A3B840' };
                        return { backgroundColor: '#F1F5F9', color: '#475569', borderColor: '#94A3B840' };
                      })()}
                    >
                      {order.status.toUpperCase()}
                    </span>
                  </div>

                  {/* Row 2: Sub Row - Contact Email + Target/Event Date */}
                  <div className={styles.cardSubRow}>
                    <span className={styles.cardEmailText} title={`${order.phone ? `Phone: ${order.phone} • ` : ''}${order.email || ''}`}>
                      {order.phone ? `${order.phone}${order.email ? ` • ${order.email}` : ''}` : order.email || 'No contact info'}
                    </span>
                    <span className={styles.cardDateText}>
                      <Calendar size={13} className={styles.cardCalendarIcon} />
                      <span>{order.targetDate || order.createdDate}</span>
                    </span>
                  </div>

                  {/* Row 3: Product Customization Scope Box */}
                  <div className={styles.cardScopeBox}>
                    <div
                      className={styles.cardScopeThumbWrapper}
                      onClick={(e) => {
                        if (order.designImg) {
                          e.stopPropagation();
                          setPreviewLightbox({
                            isOpen: true,
                            src: order.designImg,
                            title: `Reference Photo • Request #${String(order.id).replace('#', '')}`,
                            subtitle: `${order.customerName} • ${order.occasion || 'Custom Order'}`
                          });
                        }
                      }}
                      title="Click to view full picture"
                      role="button"
                      tabIndex={0}
                    >
                      <img
                        src={order.designImg}
                        alt={`${order.occasion} design`}
                        className={styles.cardScopeThumb}
                      />
                      <span className={styles.zoomIconOverlay}>
                        <ZoomIn size={14} />
                      </span>
                    </div>
                    <div className={styles.cardScopeMeta}>
                      <span className={styles.cardScopeSubtitle}>
                        {order.occasion ? `${order.occasion.toUpperCase()} CUSTOMIZATION` : 'PRODUCT CUSTOMIZATION'}
                      </span>
                      <p className={styles.cardScopeTitle}>
                        {order.occasion} Cake Pops
                      </p>
                    </div>
                  </div>

                  {/* Row 4: Action Toolbar */}
                  <div className={styles.cardActionToolbar} onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedOrderDetail(order);
                    }}
                    className={styles.cardDetailsButton}
                  >
                    <Eye size={14} />
                    <span>DETAILS</span>
                  </button>

                  <a
                    href={`https://wa.me/${(order.phone || '').replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.cardWhatsAppButton}
                    title="WhatsApp"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!order.phone) {
                        e.preventDefault();
                        alert('No phone number recorded for this inquiry');
                      }
                    }}
                  >
                    <WhatsAppIcon style={{ width: '15px', height: '15px' }} />
                  </a>
                </div>
              </div>
            );
          })
        )}
      </div>

      {totalPages > 1 && (
        <div className={`${styles.paginationCard} ${view === 'list' ? styles.hideOnDesktop : ''}`}>
          <div className={styles.paginationText}>{pageInfo}</div>
          <div className={styles.pageControls}>
            <button 
              className={styles.pageBtn} 
              aria-label="Previous page"
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
              aria-label="Next page"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
        </>
      )}

      {isConfirmModalOpen && createPortal(
        <div className="animate-fade-in" style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} onClick={() => setIsConfirmModalOpen(false)}></div>
          <div className="animate-slide-up" style={{ position: 'relative', backgroundColor: 'white', padding: '24px', borderRadius: '12px', maxWidth: '400px', width: '90%', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
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
                onClick={async () => {
                  if (confirmAction === 'delete') {
                    for (const id of selectedItems) {
                      try {
                        await (adminCustomOrderData as any).deleteCustomOrder(id);
                      } catch (err) {
                        console.error('Failed to delete custom order:', err);
                      }
                    }
                    setCustomOrders(prev => prev.filter(o => !selectedItems.includes(o.id) && !selectedItems.includes(o._id)));
                  }
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

      {selectedOrderDetail && (
        <CustomOrderDetailModal
          order={selectedOrderDetail}
          onClose={() => setSelectedOrderDetail(null)}
          onOrderUpdated={(updated) => {
            setCustomOrders(prev => prev.map(o => (o.id === updated.id || o._id === updated._id) ? updated : o));
            setSelectedOrderDetail(updated);
          }}
        />
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

      {/* Big Picture Lightbox */}
      <AdminImageLightbox
        isOpen={previewLightbox.isOpen}
        src={previewLightbox.src}
        title={previewLightbox.title}
        subtitle={previewLightbox.subtitle}
        onClose={() => setPreviewLightbox((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  )
}
