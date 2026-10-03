import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search,
  Download,
  MapPin,
  Eye,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Trash2,
  X,
  MessageSquare,
  Ban,
  CheckCircle,
  SlidersHorizontal,
  Calendar,
  Users,
  Phone,
  Mail,
  Copy,
  Check,
  ShoppingCart,
  Clock,
  ShoppingBag,
  ShieldCheck,
  UserPlus,
  ArrowUpDown,
} from 'lucide-react';
import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon';
import { ViewToggle } from '@/features/admin/components/ViewToggle';
import { CustomSelect } from '@/features/admin/components/CustomSelect';
import { CustomerDetailsModal } from '@/features/admin/components/CustomerDetailsModal';
import { AdminCustomersSkeleton } from '@/features/admin/components/AdminCustomersSkeleton';
import { AdminFilterModal } from '@/features/admin/components/AdminFilterModal';
import filterModalStyles from '@/features/admin/components/AdminFilterModal.module.css';
import styles from './AdminCustomers.module.css';
import deleteBtnStyles from '@/features/admin/components/AdminDeleteButton.module.css';
import { exportToExcel } from '@/features/admin/utils/exportUtils';
import { adminCustomerData } from '@/features/admin/api/adminDataProvider';
import { useToast } from '@/components/ui/ToastContext';

interface CustomerFilterState {
  role: string;
  activity: string;
  cart: string;
  status: string;
  spent: string;
  sortBy: string;
}

const defaultFilters: CustomerFilterState = {
  role: 'all',
  activity: 'all',
  cart: 'all',
  status: 'all',
  spent: 'all',
  sortBy: 'newest',
};

export function AdminCustomers() {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { customerId: routeCustomerId } = useParams<{ customerId?: string }>();
  const [searchParams] = useSearchParams();
  const queryCustomerId = routeCustomerId || searchParams.get('id') || searchParams.get('customerId');

  const [isLoading, setIsLoading] = useState(true);
  const [customers, setCustomers] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });

  // Responsive view
  const [view, setView] = useState<'list' | 'grid'>('list');
  useEffect(() => {
    const checkView = () => {
      if (typeof window !== 'undefined') {
        setView(window.innerWidth <= 768 ? 'grid' : 'list');
      }
    };
    checkView();
    window.addEventListener('resize', checkView);
    return () => window.removeEventListener('resize', checkView);
  }, []);

  // Selection state
  const [selectedItems, setSelectedItems] = useState<(string | number)[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(queryCustomerId || null);

  // Modals
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'active' | 'inactive' | 'delete' | ''>('');
  const [customerToDelete, setCustomerToDelete] = useState<any | null>(null);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdvFilterOpen, setIsAdvFilterOpen] = useState(false);
  const [draftFilters, setDraftFilters] = useState<CustomerFilterState>(defaultFilters);
  const [appliedFilters, setAppliedFilters] = useState<CustomerFilterState>(defaultFilters);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (appliedFilters.role !== 'all') count++;
    if (appliedFilters.activity !== 'all') count++;
    if (appliedFilters.cart !== 'all') count++;
    if (appliedFilters.status !== 'all') count++;
    if (appliedFilters.spent !== 'all') count++;
    if (appliedFilters.sortBy !== 'newest') count++;
    return count;
  }, [appliedFilters]);

  // Sync route param with modal state
  useEffect(() => {
    if (queryCustomerId) {
      setSelectedCustomerId(queryCustomerId);
    }
  }, [queryCustomerId]);

  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search input by 300ms to avoid network spam while typing
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
      setPagination((prev) => (prev.page === 1 ? prev : { ...prev, page: 1 }));
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Fetch real data from backend using server-side pagination, search, and filtering
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const custs = await adminCustomerData.getCustomers({
        page: pagination.page,
        limit: pagination.limit,
        search: debouncedSearch || undefined,
        status: appliedFilters.status !== 'all' ? appliedFilters.status : undefined,
        role: appliedFilters.role !== 'all' ? appliedFilters.role : undefined,
        cart: appliedFilters.cart !== 'all' ? appliedFilters.cart : undefined,
        spent: appliedFilters.spent !== 'all' ? appliedFilters.spent : undefined,
        sortBy: appliedFilters.sortBy,
      });

      const list = Array.isArray(custs) ? custs : (custs as any)?.customers || [];
      setCustomers(list);

      const total = (custs as any)?.total ?? (custs as any)?.totalCount ?? list.length;
      const pages = (custs as any)?.totalPages || Math.ceil(total / pagination.limit) || 1;
      setPagination((prev) => ({
        ...prev,
        total,
        totalPages: pages,
      }));
    } catch (err) {
      console.error('Failed to load customers data:', err);
      showToast('Failed to load customers', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, pagination.limit, debouncedSearch, appliedFilters, showToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Server returned data for current page slice
  const paginatedData = customers;
  const totalPages = pagination.totalPages;

  const pageInfo = useMemo(() => {
    const total = pagination.total || customers.length;
    if (total === 0) return '0 customers';
    const start = (pagination.page - 1) * pagination.limit + 1;
    const end = Math.min(start + customers.length - 1, total);
    return `Showing ${start} to ${end} of ${total} customers`;
  }, [pagination.total, pagination.page, pagination.limit, customers.length]);

  // Live stats summary for the header
  const totalCount = customers.length;
  const activeCount = customers.filter((c) => !c.isLocked).length;
  const vipCount = customers.filter(
    (c) => c.loyaltyTier === 'VIP' || c.loyaltyTier === 'Platinum' || c.loyaltyTier === 'Gold'
  ).length;
  const totalOrdersPlaced = customers.reduce(
    (sum, c) => sum + (c.orders || c.ordersCount || 0),
    0
  );

  const handleApplyFilters = () => {
    setAppliedFilters(draftFilters);
    setIsAdvFilterOpen(false);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleResetFilters = () => {
    setDraftFilters(defaultFilters);
    setAppliedFilters(defaultFilters);
    setSearchTerm('');
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const customerExportColumns = [
    { key: 'name', label: 'Customer Name' },
    { key: 'email', label: 'Email Address' },
    { key: 'phone', label: 'Phone Number' },
    { key: 'role', label: 'User Role' },
    { key: 'status', label: 'Account Status' },
    { key: 'location', label: 'Location' },
    { key: 'city', label: 'City' },
    { key: 'ordersCount', label: 'Standard Orders' },
    { key: 'customOrdersCount', label: 'Custom Orders' },
    { key: 'totalOrders', label: 'Total Orders' },
    { key: 'spent', label: 'Total Spent' },
    { key: 'loyaltyTier', label: 'Loyalty Tier' },
    { key: 'rewardPoints', label: 'Reward Points' },
    { key: 'walletBalance', label: 'Wallet Balance (₹)' },
    { key: 'cartItemsCount', label: 'Cart Items' },
    { key: 'wishlistItemsCount', label: 'Wishlist Items' },
    { key: 'joinedDate', label: 'Date Joined' },
    { key: 'lastOrderDate', label: 'Last Order Date' },
  ];

  const handleExport = () => {
    const dataset = customers;
    if (dataset.length === 0) {
      showToast('No customer data to export', 'error');
      return;
    }
    const dateStr = new Date().toISOString().split('T')[0];
    const exportRows = dataset.map((c: any) => ({
      ...c,
      totalOrders: (c.ordersCount || 0) + (c.customOrdersCount || 0),
      role: (c.role || 'customer').toUpperCase().replace('_', ' '),
      spent: typeof c.spent === 'string' ? c.spent : `₹${(c.totalSpent || 0).toLocaleString('en-IN')}`,
    }));
    exportToExcel(exportRows, `CakePopRush-Customers-All-${dateStr}`, customerExportColumns, 'All Customers');
    showToast(`Exported ${exportRows.length} customers to Excel (.xlsx)`, 'success');
  };

  const handleExportSelected = () => {
    const sel = customers.filter((c) => selectedItems.includes(c.id || c._id));
    if (sel.length === 0) {
      showToast('Please select customers to export', 'error');
      return;
    }
    const dateStr = new Date().toISOString().split('T')[0];
    const exportRows = sel.map((c) => ({
      ...c,
      totalOrders: (c.ordersCount || 0) + (c.customOrdersCount || 0),
      role: (c.role || 'customer').toUpperCase().replace('_', ' '),
      spent: typeof c.spent === 'string' ? c.spent : `₹${(c.totalSpent || 0).toLocaleString('en-IN')}`,
    }));
    exportToExcel(exportRows, `CakePopRush-Customers-Selected-${dateStr}`, customerExportColumns, 'Selected Customers');
    showToast(`Exported ${exportRows.length} selected customers to Excel (.xlsx)`, 'success');
  };

  const handleExecuteConfirmAction = async () => {
    setIsConfirmModalOpen(false);
    if (!confirmAction) return;

    try {
      if (confirmAction === 'delete') {
        if (customerToDelete) {
          await adminCustomerData.deleteCustomer(customerToDelete._id || customerToDelete.id);
          showToast(`Customer "${customerToDelete.name}" removed`, 'success');
          setCustomerToDelete(null);
        } else if (selectedItems.length > 0) {
          await adminCustomerData.bulkDelete(selectedItems.map(String));
          showToast(`Removed ${selectedItems.length} customers`, 'success');
          setSelectedItems([]);
        }
      } else if (confirmAction === 'active' || confirmAction === 'inactive') {
        const statusLabel = confirmAction === 'active' ? 'Active' : 'Inactive';
        await adminCustomerData.bulkUpdateStatus(selectedItems.map(String), statusLabel);
        showToast(`Updated ${selectedItems.length} customers to ${statusLabel}`, 'success');
        setSelectedItems([]);
      }
      fetchData();
    } catch (err) {
      console.error('Failed to execute confirm action:', err);
      showToast('Action failed. Please try again.', 'error');
    } finally {
      setConfirmAction('');
    }
  };

  // ─── Contact Detail Checks ───
  const hasCustomerPhone = (phone?: string) => {
    if (!phone || phone === '—') return false;
    const clean = phone.replace(/[^0-9]/g, '');
    return clean.length >= 7;
  };

  const hasCustomerEmail = (email?: string) => {
    if (!email || email === '—') return false;
    return email.trim().length > 3 && email.includes('@');
  };

  // ─── Quick Contact Actions ───
  const handleWhatsApp = (cust: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const phone = cust?.phone;
    const clean = (phone || '').replace(/[^0-9]/g, '');
    if (!clean || clean.length < 5) {
      showToast(
        `No phone number on file for ${cust?.name || 'this customer'}. You can email them directly!`,
        'info'
      );
      return;
    }
    const msg = encodeURIComponent(
      `Hi ${cust?.name || ''}, greetings from CakePopRush! How can we assist you with your orders and treats?`
    );
    window.open(`https://wa.me/${clean}?text=${msg}`, '_blank', 'noopener,noreferrer');
  };

  const handleCall = (cust: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const phone = cust?.phone;
    const clean = (phone || '').replace(/[^0-9+]/g, '');
    if (!clean || clean.length < 5) {
      showToast(
        `No phone number on file for ${cust?.name || 'this customer'}.`,
        'info'
      );
      return;
    }
    window.location.href = `tel:${clean}`;
  };

  const handleEmail = (cust: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const email = cust?.email;
    if (!email || email === '—') {
      showToast(
        `No email address on file for ${cust?.name || 'this customer'}.`,
        'info'
      );
      return;
    }
    const subject = encodeURIComponent('Message from CakePopRush');
    const body = encodeURIComponent(
      `Hi ${cust?.name || ''},\n\nThank you for choosing CakePopRush!\n\nBest regards,\nCakePopRush Team`
    );
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
  };

  const handleSMS = (cust: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const phone = cust?.phone;
    if (!phone || phone === '—') {
      showToast(
        `No phone number on file for ${cust?.name || 'this customer'}.`,
        'info'
      );
      return;
    }
    const clean = phone.replace(/[^0-9+]/g, '');
    window.location.href = `sms:${clean}?body=${encodeURIComponent(
      `Hi ${cust?.name || ''}, message from CakePopRush: `
    )}`;
  };

  const handleCopyContact = (cust: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const details = [
      cust?.name ? `Name: ${cust.name}` : '',
      cust?.email && cust.email !== '—' ? `Email: ${cust.email}` : '',
      cust?.phone && cust.phone !== '—' ? `Phone: ${cust.phone}` : '',
      cust?.city ? `Location: ${cust.city}` : '',
    ]
      .filter(Boolean)
      .join('\n');

    if (navigator.clipboard) {
      const copyVal = cust?.email && cust.email !== '—' ? cust.email : details;
      navigator.clipboard.writeText(copyVal);
      showToast(`Copied ${cust?.name || 'customer'}'s contact details!`, 'success');
    }
  };

  if (isLoading && customers.length === 0) {
    return <AdminCustomersSkeleton />;
  }

  return (
    <div className={styles.container}>
      {/* ─── Header & Live Subtitle Badges (Inspired by Custom Orders) ─── */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Customers</h1>
          <div className={styles.statsSubtitle}>
            <span className={styles.statItemTotal}>
              {totalCount} Total Customer{totalCount !== 1 ? 's' : ''}
            </span>
            <span className={styles.statDotBadge}>
              <span className={styles.dotEmerald} />
              <span className={styles.statItemActive}>{activeCount} Active</span>
            </span>
            {vipCount > 0 && (
              <span className={styles.statDotBadge}>
                <span className={styles.dotAmber} />
                <span className={styles.statItemPending}>{vipCount} VIP</span>
              </span>
            )}
            {totalOrdersPlaced > 0 && (
              <span className={styles.statDotBadge}>
                <span className={styles.dotPink} />
                <span className={styles.statItemCompleted}>
                  {totalOrdersPlaced} Order{totalOrdersPlaced !== 1 ? 's' : ''} Placed
                </span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ─── Sticky Search & Actions Bar ─── */}
      <div className={styles.stickyWrapper}>
        {selectedItems.length > 0 ? (
          /* Bulk Action Toolbar */
          <div className={styles.bulkToolbarRow}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
              <span style={{ fontWeight: 600, color: 'var(--admin-pink)', whiteSpace: 'nowrap' }}>
                {selectedItems.length}{' '}
                <span className={styles.hideMobile}>
                  customer{selectedItems.length > 1 ? 's' : ''} selected
                </span>
              </span>
            </div>
            <div
              style={{
                display: 'flex',
                gap: '8px',
                alignItems: 'center',
                justifyContent: 'flex-end',
                flexWrap: 'nowrap',
              }}
            >
              <CustomSelect
                placeholder="Update Status..."
                value=""
                onChange={(val) => {
                  if (val === 'active' || val === 'inactive') {
                    setConfirmAction(val);
                    setIsConfirmModalOpen(true);
                  }
                }}
                options={[
                  { value: 'active', label: 'Mark as Active' },
                  { value: 'inactive', label: 'Mark as Inactive' },
                ]}
              />
              <button
                type="button"
                className={styles.exportBtn}
                title="Export Selected"
                onClick={handleExportSelected}
              >
                <Download size={16} />{' '}
                <span className={styles.hideMobile}>Export Selected</span>
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
                  setCustomerToDelete(null);
                  setIsConfirmModalOpen(true);
                }}
              >
                <Trash2 size={16} />{' '}
                <span className={styles.hideMobile}>Delete Selected</span>
              </button>
            </div>
          </div>
        ) : (
          /* Single Row: Search Input + Filters Button + Export Button + ViewToggle */
          <div className={styles.searchActionsBar}>
            <div className={styles.searchWrapper}>
              <Search size={18} className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search customers by name, email, phone, city..."
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

            <div className={styles.actionControlsGroup}>
              <button
                type="button"
                className={`${styles.filterBtn} ${
                  activeFilterCount > 0 ? styles.filterBtnActive : ''
                }`}
                title="Filters"
                onClick={() => setIsAdvFilterOpen(true)}
              >
                <SlidersHorizontal size={16} />
                <span className={styles.filterBtnText}>
                  {activeFilterCount > 0 ? `${activeFilterCount} Filters` : 'Filters'}
                </span>
                {activeFilterCount > 0 && (
                  <span className={styles.filterBadge}>{activeFilterCount}</span>
                )}
              </button>

              <button
                type="button"
                className={styles.exportBtn}
                title="Export Excel (.xlsx)"
                onClick={handleExport}
              >
                <Download size={16} />
                <span className={styles.exportBtnText}>Export</span>
              </button>

              <div className={styles.viewToggleWrapper}>
                <ViewToggle view={view} onViewChange={setView} />
              </div>
            </div>
          </div>
        )}

        {/* Active Filter Chips Row */}
        {(activeFilterCount > 0 || searchTerm) && (
          <div className={styles.activeFilterChipsRow}>
            <span className={styles.activeChipsLabel}>Active filters:</span>
            {searchTerm && (
              <span className={styles.filterChip}>
                Search: "{searchTerm}"
                <button type="button" onClick={() => setSearchTerm('')}>
                  <X size={12} />
                </button>
              </span>
            )}
            {appliedFilters.role && appliedFilters.role !== 'all' && (
              <span className={styles.filterChip}>
                Role: {appliedFilters.role === 'admin' ? 'Admins / Staff' : 'Customers Only'}
                <button
                  type="button"
                  onClick={() => {
                    setDraftFilters((prev) => ({ ...prev, role: 'all' }));
                    setAppliedFilters((prev) => ({ ...prev, role: 'all' }));
                  }}
                >
                  <X size={12} />
                </button>
              </span>
            )}
            {appliedFilters.activity && appliedFilters.activity !== 'all' && (
              <span className={styles.filterChip}>
                Orders:{' '}
                {appliedFilters.activity === 'custom'
                  ? 'Custom Orders'
                  : appliedFilters.activity === 'orders'
                  ? 'Storefront Buyers'
                  : appliedFilters.activity === 'repeat'
                  ? 'Repeat Buyers (2+)'
                  : 'No Orders'}
                <button
                  type="button"
                  onClick={() => {
                    setDraftFilters((prev) => ({ ...prev, activity: 'all' }));
                    setAppliedFilters((prev) => ({ ...prev, activity: 'all' }));
                  }}
                >
                  <X size={12} />
                </button>
              </span>
            )}
            {appliedFilters.cart && appliedFilters.cart !== 'all' && (
              <span className={styles.filterChip}>
                Cart:{' '}
                {appliedFilters.cart === 'has_cart' ? 'Has Items in Cart' : 'Has Wishlist'}
                <button
                  type="button"
                  onClick={() => {
                    setDraftFilters((prev) => ({ ...prev, cart: 'all' }));
                    setAppliedFilters((prev) => ({ ...prev, cart: 'all' }));
                  }}
                >
                  <X size={12} />
                </button>
              </span>
            )}
            {appliedFilters.status && appliedFilters.status !== 'all' && (
              <span className={styles.filterChip}>
                Status: {appliedFilters.status === 'active' ? 'Active' : 'Inactive / Locked'}
                <button
                  type="button"
                  onClick={() => {
                    setDraftFilters((prev) => ({ ...prev, status: 'all' }));
                    setAppliedFilters((prev) => ({ ...prev, status: 'all' }));
                  }}
                >
                  <X size={12} />
                </button>
              </span>
            )}
            {appliedFilters.spent && appliedFilters.spent !== 'all' && (
              <span className={styles.filterChip}>
                Spent:{' '}
                {appliedFilters.spent === '0-1000'
                  ? 'Under ₹1k'
                  : appliedFilters.spent === '1000-5000'
                  ? '₹1k - ₹5k'
                  : 'Over ₹5k'}
                <button
                  type="button"
                  onClick={() => {
                    setDraftFilters((prev) => ({ ...prev, spent: 'all' }));
                    setAppliedFilters((prev) => ({ ...prev, spent: 'all' }));
                  }}
                >
                  <X size={12} />
                </button>
              </span>
            )}
            {appliedFilters.sortBy && appliedFilters.sortBy !== 'newest' && (
              <span className={styles.filterChip}>
                Sort:{' '}
                {appliedFilters.sortBy === 'name'
                  ? 'Name (A to Z)'
                  : appliedFilters.sortBy === 'spend_high'
                  ? 'Highest Spend'
                  : appliedFilters.sortBy === 'most_orders'
                  ? 'Most Orders'
                  : 'Oldest First'}
                <button
                  type="button"
                  onClick={() => {
                    setDraftFilters((prev) => ({ ...prev, sortBy: 'newest' }));
                    setAppliedFilters((prev) => ({ ...prev, sortBy: 'newest' }));
                  }}
                >
                  <X size={12} />
                </button>
              </span>
            )}
            <button
              type="button"
              onClick={handleResetFilters}
              className={styles.clearAllChipsBtn}
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* ─── TABLE VIEW (LIST) ─── */}
      {view === 'list' && (
        <div className={styles.tableCard}>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.checkboxCell}>
                    <input
                      type="checkbox"
                      className={styles.checkbox}
                      aria-label="Select all customers"
                      checked={
                        selectedItems.length === paginatedData.length && paginatedData.length > 0
                      }
                      onChange={(e) =>
                        setSelectedItems(
                          e.target.checked
                            ? paginatedData.map((c) => c.id || c._id)
                            : []
                        )
                      }
                    />
                  </th>
                  <th>CUSTOMER</th>
                  <th>LOCATION</th>
                  <th>ORDERS</th>
                  <th>TOTAL SPENT</th>
                  <th>LAST ACTIVE</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: 0, border: 'none' }}>
                      <div className={styles.emptyStateContainer}>
                        <div className={styles.emptyStateIconRing}>
                          <Users size={30} strokeWidth={1.8} />
                        </div>
                        {searchTerm || activeFilterCount > 0 ? (
                          <>
                            <h4 className={styles.emptyStateTitle}>No matching customers</h4>
                            <p className={styles.emptyStateSubtext}>
                              No results match your current search or filters.
                            </p>
                            <button
                              type="button"
                              className={styles.emptyStateClearBtn}
                              onClick={handleResetFilters}
                            >
                              <X size={14} /> Clear Filters
                            </button>
                          </>
                        ) : (
                          <>
                            <h4 className={styles.emptyStateTitle}>No customers found</h4>
                            <p className={styles.emptyStateSubtext}>
                              Real customer accounts and custom order clients will appear here.
                            </p>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((cust) => {
                    const cId = String(cust.id || cust._id);
                    const ordersCount = cust.orders || cust.ordersCount || 0;
                    const customCount = cust.customOrdersCount || 0;

                    return (
                      <tr
                        key={cId}
                        className={styles.tableRow}
                        onClick={() => setSelectedCustomerId(cId)}
                      >
                        <td
                          className={styles.checkboxCell}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="checkbox"
                            className={styles.checkbox}
                            aria-label={`Select ${cust.name || cId}`}
                            checked={selectedItems.includes(cId)}
                            onChange={(e) => {
                              if (e.target.checked)
                                setSelectedItems((prev) => [...prev, cId]);
                              else
                                setSelectedItems((prev) =>
                                  prev.filter((id) => id !== cId)
                                );
                            }}
                          />
                        </td>

                        {/* Customer Info */}
                        <td>
                          <div className={styles.customerCell}>
                            <div
                              className={styles.avatar}
                              style={{
                                backgroundColor: cust.avatarBg || '#FFF0F5',
                                color: cust.avatarColor || 'var(--admin-pink)',
                              }}
                            >
                              {cust.avatar ? (
                                <img
                                  src={cust.avatar}
                                  alt={cust.name}
                                  className={styles.avatarImg}
                                />
                              ) : (
                                cust.initials || 'CU'
                              )}
                            </div>
                            <div className={styles.customerInfo}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span className={styles.customerName}>{cust.name}</span>
                                {cust.role && !['customer', 'user'].includes(cust.role) && (
                                  <span
                                    style={{
                                      fontSize: '9.5px',
                                      fontWeight: 700,
                                      padding: '1px 6px',
                                      borderRadius: '4px',
                                      textTransform: 'uppercase',
                                      backgroundColor: '#F3E8FF',
                                      color: '#7E22CE',
                                      letterSpacing: '0.4px',
                                    }}
                                  >
                                    {cust.role.replace('_', ' ')}
                                  </span>
                                )}
                              </div>
                              <div className={styles.customerContactRow}>
                                {cust.email && cust.email !== '—' && (
                                  <a
                                    href={`mailto:${cust.email}?subject=Message%20from%20CakePopRush`}
                                    className={styles.customerEmailLink}
                                    title={`Send email to ${cust.email}`}
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <Mail size={11} />
                                    <span>{cust.email}</span>
                                  </a>
                                )}
                                {cust.phone && cust.phone !== '—' && (
                                  <a
                                    href={`tel:${cust.phone.replace(/[^0-9+]/g, '')}`}
                                    className={styles.customerPhoneLink}
                                    title={`Call ${cust.phone}`}
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <Phone size={11} />
                                    <span>{cust.phone}</span>
                                  </a>
                                )}
                                {(!cust.email || cust.email === '—') &&
                                  (!cust.phone || cust.phone === '—') && (
                                    <span className={styles.customerContact}>No contact info</span>
                                  )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Location */}
                        <td>
                          <div className={styles.locationCell}>
                            <MapPin size={13} className={styles.locationIcon} />
                            <span>{cust.city || cust.location || 'India'}</span>
                          </div>
                        </td>

                        {/* Orders */}
                        <td>
                          <div className={styles.ordersCountWrapper}>
                            <div className={styles.qtyBadge}>
                              <span className={styles.qtyNumber}>{ordersCount}</span>
                              <span className={styles.qtyUnit}>
                                {ordersCount === 1 ? 'order' : 'orders'}
                              </span>
                            </div>
                            {customCount > 0 && (
                              <span className={styles.customOrderPill}>
                                +{customCount} Custom
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Total Spent */}
                        <td>
                          <span className={styles.spentAmount}>
                            {cust.spent ||
                              `₹${(cust.totalSpent || 0).toLocaleString('en-IN')}`}
                          </span>
                        </td>



                        {/* Last Active */}
                        <td>
                          <div className={styles.lastActiveWrapper}>
                            <span className={styles.lastActiveDate}>
                              {cust.lastOrderDate || '—'}
                            </span>
                            {cust.lastOrderTime && (
                              <span className={styles.lastActiveTime}>
                                {cust.lastOrderTime}
                              </span>
                            )}
                          </div>
                        </td>



                        {/* Actions */}
                        <td
                          className={styles.actionsCell}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className={styles.actionsGroup}>
                            <button
                              type="button"
                              className={`${styles.actionBtnWhatsApp} ${!hasCustomerPhone(cust.phone) ? styles.btnFaded : ''}`}
                              disabled={!hasCustomerPhone(cust.phone)}
                              title={
                                hasCustomerPhone(cust.phone)
                                  ? `WhatsApp: ${cust.phone}`
                                  : 'No phone number available'
                              }
                              aria-label="WhatsApp Customer"
                              onClick={(e) => handleWhatsApp(cust, e)}
                            >
                              <WhatsAppIcon style={{ width: '14px', height: '14px' }} />
                            </button>
                            <button
                              type="button"
                              className={`${styles.actionBtnCall} ${!hasCustomerPhone(cust.phone) ? styles.btnFaded : ''}`}
                              disabled={!hasCustomerPhone(cust.phone)}
                              title={
                                hasCustomerPhone(cust.phone)
                                  ? `Call: ${cust.phone}`
                                  : 'No phone number available'
                              }
                              aria-label="Call Customer"
                              onClick={(e) => handleCall(cust, e)}
                            >
                              <Phone size={14} />
                            </button>
                            <button
                              type="button"
                              className={`${styles.actionBtnEmail} ${!hasCustomerEmail(cust.email) ? styles.btnFaded : ''}`}
                              disabled={!hasCustomerEmail(cust.email)}
                              title={
                                hasCustomerEmail(cust.email)
                                  ? `Email: ${cust.email}`
                                  : 'No email address available'
                              }
                              aria-label="Email Customer"
                              onClick={(e) => handleEmail(cust, e)}
                            >
                              <Mail size={14} />
                            </button>
                            <button
                              type="button"
                              className={styles.actionBtn}
                              title="View Profile"
                              aria-label="View Customer Profile"
                              onClick={() => setSelectedCustomerId(cId)}
                            >
                              <Eye size={15} />
                            </button>
                            <button
                              type="button"
                              className={styles.actionBtnDelete}
                              title="Delete Customer"
                              aria-label="Delete Customer"
                              onClick={() => {
                                setCustomerToDelete(cust);
                                setConfirmAction('delete');
                                setIsConfirmModalOpen(true);
                              }}
                            >
                              <Trash2 size={15} />
                            </button>
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
                  disabled={pagination.page === 1}
                  onClick={() =>
                    setPagination((prev) => ({
                      ...prev,
                      page: Math.max(1, prev.page - 1),
                    }))
                  }
                >
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    className={`${styles.pageBtn} ${
                      pagination.page === p ? styles.active : ''
                    }`}
                    onClick={() =>
                      setPagination((prev) => ({ ...prev, page: p }))
                    }
                  >
                    {p}
                  </button>
                ))}
                <button
                  className={styles.pageBtn}
                  aria-label="Next page"
                  disabled={pagination.page === totalPages}
                  onClick={() =>
                    setPagination((prev) => ({
                      ...prev,
                      page: Math.min(totalPages, prev.page + 1),
                    }))
                  }
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── GRID / CARDS VIEW ─── */}
      {view === 'grid' && (
        <div className={styles.itemsGrid}>
        {paginatedData.length === 0 ? (
          <div style={{ gridColumn: '1 / -1' }}>
            <div className={styles.emptyStateContainer}>
              <div className={styles.emptyStateIconRing}>
                <Users size={30} strokeWidth={1.8} />
              </div>
              {searchTerm || activeFilterCount > 0 ? (
                <>
                  <h4 className={styles.emptyStateTitle}>No matching customers</h4>
                  <p className={styles.emptyStateSubtext}>
                    No results match your current search or filters.
                  </p>
                  <button
                    type="button"
                    className={styles.emptyStateClearBtn}
                    onClick={handleResetFilters}
                  >
                    <X size={14} /> Clear Filters
                  </button>
                </>
              ) : (
                <>
                  <h4 className={styles.emptyStateTitle}>No customers found</h4>
                  <p className={styles.emptyStateSubtext}>
                    Real customer accounts and custom order clients will appear here.
                  </p>
                </>
              )}
            </div>
          </div>
        ) : (
          paginatedData.map((cust) => {
            const cId = String(cust.id || cust._id);
            const ordersCount = cust.orders || cust.ordersCount || 0;
            const customCount = cust.customOrdersCount || 0;
            const cartCount = cust.cartItemsCount ?? cust.cartCount ?? (cust.cart?.length || 0);
            const displayLocation =
              cust.location && cust.location !== 'N/A'
                ? cust.location
                : cust.city && cust.city !== 'N/A'
                ? cust.city
                : 'N/A';

            return (
              <div
                key={`card-${cId}`}
                className={styles.customerCard}
                onClick={() => setSelectedCustomerId(cId)}
              >
                {/* Row 1: Avatar, Name, Location Badge (Bronze & Active removed) */}
                <div className={styles.cardHeaderRow}>
                  <div className={styles.cardCustomerInfo}>
                    <div
                      className={styles.cardAvatar}
                      style={{
                        backgroundColor: cust.avatarBg || '#FFF0F5',
                        color: cust.avatarColor || 'var(--admin-pink)',
                      }}
                    >
                      {cust.avatar ? (
                        <img
                          src={cust.avatar}
                          alt={cust.name}
                          style={{
                            width: '100%',
                            height: '100%',
                            borderRadius: '50%',
                            objectFit: 'cover',
                          }}
                        />
                      ) : (
                        cust.initials || 'CU'
                      )}
                    </div>
                    <div className={styles.cardCustomerMeta}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span className={styles.cardCustomerName}>{cust.name}</span>
                        {cust.role && !['customer', 'user'].includes(cust.role) && (
                          <span
                            style={{
                              fontSize: '9px',
                              fontWeight: 700,
                              padding: '1px 5px',
                              borderRadius: '4px',
                              textTransform: 'uppercase',
                              backgroundColor: '#F3E8FF',
                              color: '#7E22CE',
                              letterSpacing: '0.4px',
                            }}
                          >
                            {cust.role.replace('_', ' ')}
                          </span>
                        )}
                      </div>
                      <span className={styles.cardCustomerSubText}>
                        {cust.email && cust.email !== '—' ? cust.email : cust.phone || 'Customer'}
                      </span>
                    </div>
                  </div>

                  {/* Real Location Pill - Replaced Bronze and Active badges */}
                  <div className={styles.cardLocationBadge} title={`Location: ${displayLocation}`}>
                    <MapPin size={12} className={styles.cardLocationPin} />
                    <span>{displayLocation}</span>
                  </div>
                </div>

                {/* Row 2: Contact Action Buttons (WhatsApp, Call, Email) & Last Active */}
                <div className={styles.cardSubRow} onClick={(e) => e.stopPropagation()}>
                  <div className={styles.cardContactIconGroup}>
                    <button
                      type="button"
                      className={`${styles.subRowActionBtn} ${styles.subRowBtnWa} ${
                        !hasCustomerPhone(cust.phone) ? styles.btnFaded : ''
                      }`}
                      disabled={!hasCustomerPhone(cust.phone)}
                      title={
                        hasCustomerPhone(cust.phone)
                          ? `WhatsApp: ${cust.phone}`
                          : 'No phone number available'
                      }
                      onClick={(e) => handleWhatsApp(cust, e)}
                    >
                      <WhatsAppIcon style={{ width: '12px', height: '12px', flexShrink: 0 }} />
                      <span>WhatsApp</span>
                    </button>

                    <button
                      type="button"
                      className={`${styles.subRowActionBtn} ${styles.subRowBtnCall} ${
                        !hasCustomerPhone(cust.phone) ? styles.btnFaded : ''
                      }`}
                      disabled={!hasCustomerPhone(cust.phone)}
                      title={
                        hasCustomerPhone(cust.phone)
                          ? `Call: ${cust.phone}`
                          : 'No phone number available'
                      }
                      onClick={(e) => handleCall(cust, e)}
                    >
                      <Phone size={12} style={{ flexShrink: 0 }} />
                      <span>Call</span>
                    </button>

                    <button
                      type="button"
                      className={`${styles.subRowActionBtn} ${styles.subRowBtnEmail} ${
                        !hasCustomerEmail(cust.email) ? styles.btnFaded : ''
                      }`}
                      disabled={!hasCustomerEmail(cust.email)}
                      title={
                        hasCustomerEmail(cust.email)
                          ? `Email: ${cust.email}`
                          : 'No email address available'
                      }
                      onClick={(e) => handleEmail(cust, e)}
                    >
                      <Mail size={12} style={{ flexShrink: 0 }} />
                      <span>Email</span>
                    </button>
                  </div>

                  <span
                    className={styles.cardDateText}
                    title={`Joined on ${cust.joinedDate || 'Recent'}`}
                  >
                    <Calendar size={11} style={{ flexShrink: 0 }} />
                    <span>
                      Joined{' '}
                      {cust.joinedDate ||
                        (cust.createdAt
                          ? new Date(cust.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })
                          : 'Recently')}
                    </span>
                  </span>
                </div>

                {/* Row 3: EventDecor-Inspired 3-Column Scope/Metrics Box */}
                <div className={styles.cardMetricsBox}>
                  <div className={styles.metricItem}>
                    <span className={styles.metricLabel}>Spend</span>
                    <span className={styles.metricValue}>
                      {cust.spent ||
                        `₹${(cust.totalSpent || 0).toLocaleString('en-IN')}`}
                    </span>
                  </div>
                  <div className={styles.metricItem}>
                    <span className={styles.metricLabel}>Orders</span>
                    <span className={styles.metricValue}>
                      {ordersCount}
                    </span>
                  </div>
                  <div className={styles.metricItem}>
                    <span className={styles.metricLabel}>Cart Status</span>
                    <div style={{ marginTop: '2px', display: 'flex', justifyContent: 'center' }}>
                      {cartCount > 0 ? (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            backgroundColor: '#FEF3C7',
                            color: '#92400E',
                            border: '1px solid #FDE68A',
                            borderRadius: '4px',
                            padding: '2px 6px',
                            fontSize: '11px',
                            fontWeight: 700,
                          }}
                        >
                          <ShoppingCart size={11} />
                          <span>{cartCount} in cart</span>
                        </span>
                      ) : (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            backgroundColor: '#F1F5F9',
                            color: '#64748B',
                            border: '1px solid #CBD5E1',
                            borderRadius: '4px',
                            padding: '2px 6px',
                            fontSize: '11px',
                            fontWeight: 700,
                          }}
                        >
                          <span>Empty</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Row 4: Action Toolbar */}
                <div
                  className={styles.cardActionToolbar}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    className={styles.cardActionBtnPrimary}
                    onClick={() => setSelectedCustomerId(cId)}
                  >
                    <Eye size={15} />
                    <span>View Profile</span>
                  </button>
                  <button
                    type="button"
                    className={styles.cardDeleteBtn}
                    title="Delete Customer"
                    onClick={() => {
                      setCustomerToDelete(cust);
                      setConfirmAction('delete');
                      setIsConfirmModalOpen(true);
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })
        )}
        </div>
      )}

      {/* Standalone Pagination Card for Grid / Mobile view */}
      {view === 'grid' && totalPages > 1 && (
        <div className={styles.paginationCard}>
          <div className={styles.paginationText}>{pageInfo}</div>
          <div className={styles.pageControls}>
            <button
              className={styles.pageBtn}
              aria-label="Previous page"
              disabled={pagination.page === 1}
              onClick={() =>
                setPagination((prev) => ({
                  ...prev,
                  page: Math.max(1, prev.page - 1),
                }))
              }
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                className={`${styles.pageBtn} ${
                  pagination.page === p ? styles.active : ''
                }`}
                onClick={() => setPagination((prev) => ({ ...prev, page: p }))}
              >
                {p}
              </button>
            ))}
            <button
              className={styles.pageBtn}
              aria-label="Next page"
              disabled={pagination.page === totalPages}
              onClick={() =>
                setPagination((prev) => ({
                  ...prev,
                  page: Math.min(totalPages, prev.page + 1),
                }))
              }
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {selectedCustomerId && (
        <CustomerDetailsModal
          customer={customers.find((c) => (c.id || c._id) === selectedCustomerId) || null}
          customerId={selectedCustomerId}
          onClose={() => {
            setSelectedCustomerId(null);
            navigate('/admin/customers', { replace: true });
          }}
          onCustomerUpdated={() => {
            fetchData();
          }}
        />
      )}

      {/* ─── Filter Modal (Inspired by Custom Orders) ─── */}
      <AdminFilterModal
        isOpen={isAdvFilterOpen}
        title="Filter Customers"
        onClose={() => {
          setIsAdvFilterOpen(false);
          setDraftFilters(appliedFilters);
        }}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
      >
        {/* Customer Role */}
        <div className={filterModalStyles.filterGroup}>
          <span className={filterModalStyles.filterLabel}>Customer Role</span>
          <div className={filterModalStyles.bracketGrid}>
            {[
              { value: 'all', label: 'All Accounts' },
              { value: 'customer', label: 'Customers Only' },
              { value: 'admin', label: 'Admins & Staff' },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={`${filterModalStyles.bracketBtn} ${
                  draftFilters.role === opt.value ? filterModalStyles.active : ''
                }`}
                onClick={() =>
                  setDraftFilters((prev) => ({ ...prev, role: opt.value }))
                }
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Order History */}
        <div className={filterModalStyles.filterGroup}>
          <span className={filterModalStyles.filterLabel}>Order History & Requests</span>
          <div className={filterModalStyles.bracketGrid}>
            {[
              { value: 'all', label: 'All Orders' },
              { value: 'custom', label: 'Has Custom Orders' },
              { value: 'orders', label: 'Storefront Buyers' },
              { value: 'repeat', label: 'Repeat Buyers (2+)' },
              { value: 'none', label: 'No Orders (Prospects)' },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={`${filterModalStyles.bracketBtn} ${
                  draftFilters.activity === opt.value ? filterModalStyles.active : ''
                }`}
                onClick={() =>
                  setDraftFilters((prev) => ({ ...prev, activity: opt.value }))
                }
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Cart & Wishlist Abandonment */}
        <div className={filterModalStyles.filterGroup}>
          <span className={filterModalStyles.filterLabel}>Cart & Wishlist Activity</span>
          <div className={filterModalStyles.bracketGrid}>
            {[
              { value: 'all', label: 'All Activity' },
              { value: 'has_cart', label: 'Items in Cart (Cart Abandoners)' },
              { value: 'has_wishlist', label: 'Saved Wishlist Items' },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={`${filterModalStyles.bracketBtn} ${
                  draftFilters.cart === opt.value ? filterModalStyles.active : ''
                }`}
                onClick={() =>
                  setDraftFilters((prev) => ({ ...prev, cart: opt.value }))
                }
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Status */}
        <div className={filterModalStyles.filterGroup}>
          <span className={filterModalStyles.filterLabel}>Account Status</span>
          <div className={filterModalStyles.bracketGrid}>
            {[
              { value: 'all', label: 'All Status' },
              { value: 'active', label: 'Active Only' },
              { value: 'inactive', label: 'Inactive / Locked' },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={`${filterModalStyles.bracketBtn} ${
                  draftFilters.status === opt.value ? filterModalStyles.active : ''
                }`}
                onClick={() =>
                  setDraftFilters((prev) => ({ ...prev, status: opt.value }))
                }
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Total Spend */}
        <div className={filterModalStyles.filterGroup}>
          <span className={filterModalStyles.filterLabel}>Total Spend Level</span>
          <div className={filterModalStyles.bracketGrid}>
            {[
              { value: 'all', label: 'Any Amount' },
              { value: '0-1000', label: 'Under ₹1,000' },
              { value: '1000-5000', label: '₹1,000 - ₹5,000' },
              { value: '5000+', label: 'High Value (₹5,000+)' },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={`${filterModalStyles.bracketBtn} ${
                  draftFilters.spent === opt.value ? filterModalStyles.active : ''
                }`}
                onClick={() =>
                  setDraftFilters((prev) => ({ ...prev, spent: opt.value }))
                }
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sort Results By */}
        <div className={filterModalStyles.filterGroup}>
          <span className={filterModalStyles.filterLabel}>Sort Results By</span>
          <div className={filterModalStyles.bracketGrid}>
            {[
              { value: 'newest', label: 'Newest First' },
              { value: 'spend_high', label: 'Highest Spend' },
              { value: 'most_orders', label: 'Most Orders' },
              { value: 'name', label: 'Name (A to Z)' },
              { value: 'oldest', label: 'Oldest First' },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={`${filterModalStyles.bracketBtn} ${
                  draftFilters.sortBy === opt.value ? filterModalStyles.active : ''
                }`}
                onClick={() =>
                  setDraftFilters((prev) => ({ ...prev, sortBy: opt.value }))
                }
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </AdminFilterModal>

      {/* ─── Confirmation Modal ─── */}
      {isConfirmModalOpen &&
        createPortal(
          <div
            className={deleteBtnStyles.backdrop}
            onClick={() => setIsConfirmModalOpen(false)}
          >
            <div
              className={deleteBtnStyles.modal}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={deleteBtnStyles.iconContainer}>
                <AlertTriangle size={24} className={deleteBtnStyles.warningIcon} />
              </div>
              <h3 className={deleteBtnStyles.title}>
                {confirmAction === 'delete'
                  ? customerToDelete
                    ? `Delete "${customerToDelete.name}"?`
                    : `Delete ${selectedItems.length} customers?`
                  : `Update status to ${confirmAction}?`}
              </h3>
              <p className={deleteBtnStyles.message}>
                {confirmAction === 'delete'
                  ? 'This action cannot be undone. All customer profile associations will be permanently removed.'
                  : `Are you sure you want to mark the selected customer(s) as ${confirmAction}?`}
              </p>
              <div className={deleteBtnStyles.actions}>
                <button
                  type="button"
                  className={deleteBtnStyles.cancelButton}
                  onClick={() => setIsConfirmModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className={
                    confirmAction === 'delete'
                      ? deleteBtnStyles.confirmButton
                      : deleteBtnStyles.primaryButton
                  }
                  onClick={handleExecuteConfirmAction}
                >
                  {confirmAction === 'delete' ? 'Delete' : 'Confirm'}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}

export default AdminCustomers;
