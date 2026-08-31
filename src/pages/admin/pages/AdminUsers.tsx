import React from 'react'
import { createPortal } from 'react-dom'
import { ActionDropdown } from '@/features/admin/components/ActionDropdown'
import { 
  Search, Filter, Download, 
  Eye, MoreVertical, Plus, ChevronLeft, ChevronRight, X, Trash2, AlertTriangle, Key, UserX
} from 'lucide-react'
import { CustomSelect } from '@/features/admin/components/CustomSelect'
import { AdminFilterModal } from '@/features/admin/components/AdminFilterModal'
import filterModalStyles from '@/features/admin/components/AdminFilterModal.module.css'
import { ViewToggle } from '@/features/admin/components/ViewToggle'
import styles from './AdminUsers.module.css'
import deleteBtnStyles from '@/features/admin/components/AdminDeleteButton.module.css'
import { AdminUsersSkeleton } from '@/features/admin/components/AdminUsersSkeleton';
import { useAdminTableState } from '@/features/admin/hooks/useAdminTableState';
import { ResponsiveModal } from '@/components/ui/ResponsiveModal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

import { adminUserData } from '@/features/admin/api/adminDataProvider'

const kpiDataStatic = null;
const usersStatic = null;

const roleOptions = [
  { value: 'all', label: 'All Roles' },
  { value: 'superadmin', label: 'Super Admin' },
  { value: 'admin', label: 'Administrator' },
  { value: 'editor', label: 'Editor' },
  { value: 'viewer', label: 'Viewer' }
];

const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' }
];

const dateOptions = [
  { value: 'all', label: 'All Join Dates' }
];

export function AdminUsers() {
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedItems, setSelectedItems] = React.useState<string[]>([]);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = React.useState(false);
  const [confirmAction, setConfirmAction] = React.useState('');
  
  const [kpiData, setKpiData] = React.useState<any[]>([]);
  const [users, setUsers] = React.useState<any[]>([]);

  React.useEffect(() => {
    Promise.all([
      adminUserData.getStats(),
      adminUserData.getUsers()
    ]).then(([stats, u]) => {
      setKpiData(stats);
      setUsers(u);
    }).finally(() => {
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
    data: users,
    searchFields: ['name', 'email'],
    filterFns: {
      role: (item, val) => {
        if (val === 'superadmin') return item.role === 'Super Admin';
        if (val === 'admin') return item.role === 'Administrator';
        if (val === 'editor') return item.role === 'Editor';
        if (val === 'viewer') return item.role === 'Viewer';
        return true;
      },
      status: (item, val) => item.status.toLowerCase() === val.toLowerCase(),
      date: () => true
    },
    defaultPageSize: 10
  });

  const [view, setView] = React.useState<'list' | 'grid'>('list');

  const defaultAdvFilters = { orderCount: 'all', accountType: 'all' };
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

  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [newAdminEmail, setNewAdminEmail] = React.useState('');
  const [newAdminRole, setNewAdminRole] = React.useState('editor');
  const [isAdding, setIsAdding] = React.useState(false);
  const [addError, setAddError] = React.useState('');

  const handleAddAdmin = async () => {
    setAddError('');
    if (!newAdminEmail) {
      setAddError('Email is required');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newAdminEmail)) {
      setAddError('Please enter a valid email address');
      return;
    }
    if (!newAdminRole) {
      setAddError('Role is required');
      return;
    }

    setIsAdding(true);
    // Simulate API call
    setTimeout(() => {
      setIsAdding(false);
      setIsAddModalOpen(false);
      setNewAdminEmail('');
      setNewAdminRole('editor');
    }, 800);
  };

  if (isLoading) return <AdminUsersSkeleton />;

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Users & Roles</h1>
          <p className={styles.subtitle}>Manage your admin users and their roles & permissions.</p>
        </div>
        <button className={styles.btnPrimary} onClick={() => setIsAddModalOpen(true)}>
          <Plus size={16} /> Add Admin
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className={styles.stickyWrapper}>
        {selectedItems.length > 0 ? (
        <div className={`${styles.toolbar} ${styles.bulkToolbar}`} style={{ backgroundColor: '#FFF0F5', borderColor: 'var(--admin-pink)', width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            <span style={{ fontWeight: 600, color: 'var(--admin-pink)', whiteSpace: 'nowrap' }}>
              {selectedItems.length} <span className={styles.hideMobile}>user{selectedItems.length > 1 ? 's' : ''} selected</span>
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
            <input 
              type="text" 
              placeholder="Search by name, email or role..." 
              className={styles.searchInput} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className={styles.filtersScrollContainer}>
            <CustomSelect
              options={roleOptions}
              value={activeFilters.role || 'all'}
              onChange={(val) => setFilter('role', val)}
              className={styles.filterSelect}
              variant="yellow"
            />
            <CustomSelect
              options={statusOptions}
              value={activeFilters.status || 'all'}
              onChange={(val) => setFilter('status', val)}
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


      {/* Table Card */}
      <div className={styles.tableCard}>
        {view === 'list' && (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
            <thead>
              <tr>
                <th>
                  <label className={styles.checkboxLabel}>
                    <input 
                      type="checkbox" 
                      className={styles.checkboxInput} 
                      checked={selectedItems.length === paginatedData.length && paginatedData.length > 0} 
                      onChange={(e) => setSelectedItems(e.target.checked ? paginatedData.map(u => u.id) : [])}
                    />
                    <span className={styles.checkboxCustom}></span>
                  </label>
                </th>
                <th>USER</th>
                <th style={{ textAlign: 'center' }}>ROLE</th>
                <th style={{ textAlign: 'center' }}>STATUS</th>
                <th>LAST LOGIN</th>
                <th>JOIN DATE</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--color-text-muted)' }}>
                    {searchTerm || Object.keys(activeFilters).length > 0 ? (
                      <>
                        <p>No users found matching your search or filters.</p>
                        <button 
                          className={styles.btnOutline} 
                          style={{ margin: '16px auto 0' }}
                          onClick={resetAll}
                        >
                          Clear Filters
                        </button>
                      </>
                    ) : (
                      <p>No users available.</p>
                    )}
                  </td>
                </tr>
              ) : (
                paginatedData.map((user) => (
                <tr key={user.id}>
                  <td>
                    <label className={styles.checkboxLabel}>
                      <input 
                        type="checkbox" 
                        className={styles.checkboxInput} 
                        checked={selectedItems.includes(user.id)}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedItems(prev => [...prev, user.id]);
                          else setSelectedItems(prev => prev.filter(id => id !== user.id));
                        }}
                      />
                      <span className={styles.checkboxCustom}></span>
                    </label>
                  </td>
                  <td>
                    <div className={styles.userCell}>
                      <div className={styles.avatar} style={{ backgroundColor: user.avatarBg, color: user.avatarColor }}>
                        {user.initials}
                      </div>
                      <div className={styles.userInfo}>
                        <div className={styles.userNameRow}>
                          <span className={styles.userName}>{user.name}</span>
                          {user.isYou && <span className={styles.youBadge}>You</span>}
                        </div>
                        <span className={styles.userEmail}>{user.email}</span>
                      </div>
                    </div>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span className={`${styles.roleBadge} ${
                      user.role === 'Super Admin' ? styles.roleSuperAdmin : 
                      user.role === 'Administrator' ? styles.roleAdmin :
                      user.role === 'Editor' ? styles.roleEditor :
                      styles.roleViewer
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span className={`${styles.statusBadge} ${
                      user.status === 'Active' ? styles.statusActive : styles.statusInactive
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td>
                    <div className={styles.dateCell}>
                      <span className={styles.datePrimary}>{user.lastLoginDate}</span>
                      <span className={styles.dateSecondary}>{user.lastLoginTime}</span>
                    </div>
                  </td>
                  <td>
                    <div className={styles.dateCell}>
                      <span className={styles.datePrimary}>{user.joinDate}</span>
                      <span className={styles.dateSecondary}>{user.joinTime}</span>
                    </div>
                  </td>
                  <td>
                    <div className={styles.actionsCell}>
                      <button 
                        className={deleteBtnStyles.deleteBtn} 
                        aria-label="Delete User"
                        onClick={() => {
                          setSelectedItems([String(user.id)]);
                          setConfirmAction('delete');
                          setIsConfirmModalOpen(true);
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                      <ActionDropdown actions={[
                        { label: 'View Profile', icon: Eye },
                        { label: 'Reset Password', icon: Key },
                        { label: 'Deactivate User', icon: UserX, variant: 'danger' as const }
                      ]} />
                    </div>
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
        )}

        {/* Grid View / Mobile View */}
        <div className={styles.usersGrid} style={{ display: view === 'list' ? 'none' : '' }}>
          {filteredData.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '48px 24px', color: 'var(--color-text-muted)' }}>
              {searchTerm || Object.keys(activeFilters).length > 0 ? (
                <>
                  <p>No users found matching your search or filters.</p>
                  <button 
                    className={styles.btnOutline} 
                    style={{ margin: '16px auto 0' }}
                    onClick={resetAll}
                  >
                    Clear Filters
                  </button>
                </>
              ) : (
                <p>No users available.</p>
              )}
            </div>
          ) : (
            paginatedData.map(user => (
            <div key={`mob-${user.id}`} className={styles.mobileCard}>
              <div className={styles.mcHeader}>
                <div className={styles.userCell}>
                  <div className={styles.avatar} style={{ backgroundColor: user.avatarBg, color: user.avatarColor }}>
                    {user.initials}
                  </div>
                  <div className={styles.userInfo}>
                    <div className={styles.mcUserRow}>
                      <span className={styles.userName}>{user.name}</span>
                      {user.isYou && <span className={styles.youBadge}>You</span>}
                    </div>
                    <div className={styles.mcUserRow}>
                      <span className={`${styles.roleBadge} ${
                        user.role === 'Super Admin' ? styles.roleSuperAdmin : 
                        user.role === 'Administrator' ? styles.roleAdmin :
                        user.role === 'Editor' ? styles.roleEditor :
                        styles.roleViewer
                      }`}>
                        {user.role}
                      </span>
                      <span className={`${styles.statusBadge} ${
                        user.status === 'Active' ? styles.statusActive : styles.statusInactive
                      }`}>
                        {user.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className={styles.mcContact}>
                <span className={styles.userEmail}>{user.email}</span>
              </div>

              <div className={styles.mcStats}>
                <div className={styles.mcStatItem}>
                  <span className={styles.dateSecondary}>Last Login</span>
                  <span className={styles.datePrimary}>{user.lastLoginDate}</span>
                  <span className={styles.dateSecondary}>{user.lastLoginTime}</span>
                </div>
                <div className={styles.mcStatItem} style={{ textAlign: 'right' }}>
                  <span className={styles.dateSecondary}>Join Date</span>
                  <span className={styles.datePrimary}>{user.joinDate}</span>
                  <span className={styles.dateSecondary}>{user.joinTime}</span>
                </div>
              </div>

              <div className={styles.mcActions}>
                <button 
                  className={deleteBtnStyles.deleteBtn} 
                  aria-label="Delete User"
                  onClick={() => {
                    setSelectedItems([String(user.id)]);
                    setConfirmAction('delete');
                    setIsConfirmModalOpen(true);
                  }}
                >
                  <Trash2 size={14} />
                </button>
                <ActionDropdown actions={[
                  { label: 'View Profile', icon: Eye },
                  { label: 'Reset Password', icon: Key },
                  { label: 'Deactivate User', icon: UserX, variant: 'danger' as const }
                ]} />
              </div>
            </div>
          )))}
        </div>

        {totalPages > 0 && (
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

      <ResponsiveModal
        isOpen={isAddModalOpen}
        onClose={() => {
          if (!isAdding) {
            setIsAddModalOpen(false);
            setNewAdminEmail('');
            setNewAdminRole('editor');
            setAddError('');
          }
        }}
        title="Add Admin"
        allowOverflow={true}
      >
        <div style={{ padding: '4px 0' }}>
          {addError && <div className={styles.errorText}>{addError}</div>}
          
          <div className={styles.formGroup}>
            <label className={styles.label}>Email Address *</label>
            <Input 
              type="email" 
              placeholder="Enter email address" 
              value={newAdminEmail}
              onChange={(e) => setNewAdminEmail(e.target.value)}
              disabled={isAdding}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Role *</label>
            <CustomSelect
              options={[
                { value: 'superadmin', label: 'Super Admin' },
                { value: 'admin', label: 'Administrator' },
                { value: 'editor', label: 'Editor' },
                { value: 'viewer', label: 'Viewer' }
              ]}
              value={newAdminRole}
              onChange={setNewAdminRole}
              variant="pink"
              className={styles.modalCustomSelect}
              menuPosition="top"
            />
          </div>

          <div className={styles.modalFooter}>
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)} disabled={isAdding}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAddAdmin} isLoading={isAdding}>
              {isAdding ? 'Adding...' : 'Add Admin'}
            </Button>
          </div>
        </div>
      </ResponsiveModal>
    
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
          <span className={filterModalStyles.filterLabel}>Total Orders</span>
          <div className={filterModalStyles.bracketGrid}>
            {[
              { value: 'all', label: 'Any' },
              { value: '0', label: '0 orders' },
              { value: '1-10', label: '1 - 10' },
              { value: '10+', label: '10+ orders' },
            ].map(opt => (
              <button
                key={opt.value}
                className={`${filterModalStyles.bracketBtn} ${draftAdvFilters.orderCount === opt.value ? filterModalStyles.active : ''}`}
                onClick={() => setDraftAdvFilters(prev => ({ ...prev, orderCount: opt.value }))}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className={filterModalStyles.filterGroup}>
          <span className={filterModalStyles.filterLabel}>Account Type</span>
          <div className={filterModalStyles.bracketGrid}>
            {[
              { value: 'all', label: 'Any' },
              { value: 'guest', label: 'Guest' },
              { value: 'registered', label: 'Registered' },
              { value: 'premium', label: 'Premium' },
            ].map(opt => (
              <button
                key={opt.value}
                className={`${filterModalStyles.bracketBtn} ${draftAdvFilters.accountType === opt.value ? filterModalStyles.active : ''}`}
                onClick={() => setDraftAdvFilters(prev => ({ ...prev, accountType: opt.value }))}
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
