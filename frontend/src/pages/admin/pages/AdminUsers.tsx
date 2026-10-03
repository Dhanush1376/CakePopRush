import React, { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { ActionDropdown } from '@/features/admin/components/ActionDropdown'
import { RoleSelectDropdown } from '@/features/admin/components/RoleSelectDropdown'
import { 
  Search, Filter, Download, 
  Eye, MoreVertical, Plus, ChevronLeft, ChevronRight, ChevronDown, X, Trash2, AlertTriangle, Key, UserX, UserCheck, Shield, Send, RefreshCw, Mail, Users, UserPlus, Clock
} from 'lucide-react'
import { CustomSelect } from '@/features/admin/components/CustomSelect'
import { AdminFilterModal } from '@/features/admin/components/AdminFilterModal'
import filterModalStyles from '@/features/admin/components/AdminFilterModal.module.css'
import { ViewToggle } from '@/features/admin/components/ViewToggle'
import styles from './AdminUsers.module.css'
import deleteBtnStyles from '@/features/admin/components/AdminDeleteButton.module.css'
import { AdminUsersSkeleton } from '@/features/admin/components/AdminUsersSkeleton';
import { ResponsiveModal } from '@/components/ui/ResponsiveModal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/ToastContext'
import { useAuth } from '@/context/AuthContext'
import { apiAdminUserData } from '@/features/admin/api/apiAdminDataProvider'

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

const ROLE_WEIGHTS: Record<string, number> = {
  owner: 100,
  super_admin: 90,
  main_admin: 85,
  admin: 80,
  editor: 60,
  viewer: 40,
  delivery_agent: 20,
  DELIVERY_AGENT: 20,
  customer: 0,
  user: 0,
};

export function AdminUsers() {
  const { user: currentUser } = useAuth();
  const { showToast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'active' | 'pending' | 'history'>('active');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  
  // Data states
  const [kpiData, setKpiData] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [pendingInvites, setPendingInvites] = useState<any[]>([]);
  const [inviteHistory, setInviteHistory] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Search & Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminRole, setNewAdminRole] = useState('editor');
  const [newAdminPermissions, setNewAdminPermissions] = useState('Access Admin Portal & Dashboard');
  const [isAdding, setIsAdding] = useState(false);
  const [addError, setAddError] = useState('');

  // Role Change Modal
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [targetUserForRole, setTargetUserForRole] = useState<any>(null);
  const [selectedNewRole, setSelectedNewRole] = useState('editor');
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);

  // Confirm Modal
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'' | 'delete' | 'active' | 'inactive'>('');
  const [isPerformingAction, setIsPerformingAction] = useState(false);

  const [view, setView] = useState<'list' | 'grid'>('list');

  // Adv filter modal
  const defaultAdvFilters = { orderCount: 'all', accountType: 'all' };
  const [isAdvFilterOpen, setIsAdvFilterOpen] = useState(false);
  const [draftAdvFilters, setDraftAdvFilters] = useState(defaultAdvFilters);
  const [appliedAdvFilters, setAppliedAdvFilters] = useState(defaultAdvFilters);
  const activeFilterCount = Object.values(appliedAdvFilters).filter(v => v !== 'all').length;

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Load team users and KPIs from backend
  const loadData = async (pageToLoad: number = currentPage) => {
    try {
      setIsLoading(true);
      const [stats, usersRes, invitesRes, historyRes] = await Promise.all([
        apiAdminUserData.getStats(),
        apiAdminUserData.getUsersPaginated({
          search: debouncedSearch,
          role: roleFilter,
          status: statusFilter,
          page: pageToLoad,
          limit: pageSize,
        }),
        apiAdminUserData.getPendingInvites(),
        apiAdminUserData.getInviteHistory(),
      ]);

      if (stats && Array.isArray(stats)) {
        setKpiData(stats);
      }
      if (usersRes) {
        // Enforce staff-only users in admin portal
        const rawUsers = usersRes.users || [];
        const staffOnlyUsers = rawUsers.filter(
          (u: any) => u.rawRole !== 'customer' && u.role !== 'Customer' && u.rawRole !== 'user'
        );
        setUsers(staffOnlyUsers);
        setTotalCount(usersRes.total ?? staffOnlyUsers.length);
        setTotalPages(usersRes.totalPages || Math.ceil((usersRes.total ?? staffOnlyUsers.length) / pageSize) || 1);
      }
      if (invitesRes && Array.isArray(invitesRes)) {
        setPendingInvites(invitesRes);
      }
      if (historyRes && Array.isArray(historyRes)) {
        setInviteHistory(historyRes);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to fetch admin users from database', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData(currentPage);
  }, [debouncedSearch, roleFilter, statusFilter, currentPage]);

  // Responsive view check
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

  // Hierarchy Helpers
  const canActorManageTarget = (targetRole: string, isSuperAdmin: boolean, isYou: boolean) => {
    if (!currentUser) return false;
    if (isYou) return false; // Self-management blocked
    if (isSuperAdmin) return false; // Super admin protected

    const actorWeight = ROLE_WEIGHTS[currentUser.role] || 0;
    const targetWeight = ROLE_WEIGHTS[targetRole] || 0;

    if (actorWeight < 80) return false; // Must be at least admin
    if (currentUser.role === 'owner') return true;

    return actorWeight > targetWeight;
  };

  const getAvailableAssignableRoles = () => {
    if (!currentUser) return [];
    const normalizedRole = (currentUser.role || '').toLowerCase().trim();
    const actorWeight = ROLE_WEIGHTS[normalizedRole] || 0;

    const all = [
      { value: 'super_admin', label: 'Super Admin', weight: 90 },
      { value: 'admin', label: 'Administrator', weight: 80 },
      { value: 'editor', label: 'Editor', weight: 60 },
      { value: 'viewer', label: 'Viewer', weight: 40 },
      { value: 'delivery_agent', label: 'Delivery Agent', weight: 20 },
    ];

    if (normalizedRole === 'owner' || normalizedRole === 'super_admin') return all;

    // Normal users can only assign roles strictly lower than their own weight
    return all.filter(r => r.weight < actorWeight);
  };

  useEffect(() => {
    const roles = getAvailableAssignableRoles();
    if (roles.length > 0 && !roles.some(r => r.value === newAdminRole)) {
      setNewAdminRole(roles[0].value);
    }
  }, [currentUser]);

  // Handle Add Admin Invite
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
    try {
      const res: any = await apiAdminUserData.createInvite(newAdminEmail.trim(), newAdminRole, newAdminPermissions);
      if (res?.success || res?._id || res?.id || res?.data) {
        showToast(`Admin invitation dispatched to ${newAdminEmail}!`, 'success');
        setIsAddModalOpen(false);
        setNewAdminEmail('');
        const available = getAvailableAssignableRoles();
        setNewAdminRole(available[0]?.value || 'editor');
        setActiveTab('pending');
        await loadData();
      } else {
        setAddError(res?.message || 'Failed to dispatch admin invite');
      }
    } catch (err: any) {
      setAddError(err.message || 'Failed to dispatch admin invite');
    } finally {
      setIsAdding(false);
    }
  };

  // Handle Role Change
  const handleOpenRoleModal = (user: any) => {
    const isSuper = user.role === 'Super Admin' || user.rawRole === 'super_admin';
    if (!canActorManageTarget(user.rawRole || 'admin', isSuper, user.isYou)) {
      showToast('You do not have clearance to modify this user’s role.', 'error');
      return;
    }
    setTargetUserForRole(user);
    setSelectedNewRole(user.rawRole || 'editor');
    setIsRoleModalOpen(true);
  };

  const handleSaveRoleChange = async () => {
    if (!targetUserForRole) return;
    setIsUpdatingRole(true);
    try {
      const res = await apiAdminUserData.updateRole(targetUserForRole.id, selectedNewRole);
      if (res?.success) {
        showToast(`Role updated successfully for ${targetUserForRole.name}`, 'success');
        setIsRoleModalOpen(false);
        setTargetUserForRole(null);
        await loadData();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to update role', 'error');
    } finally {
      setIsUpdatingRole(false);
    }
  };

  const [updatingRoleId, setUpdatingRoleId] = useState<string | null>(null);

  const getRolesForUser = (user: any) => {
    const available = getAvailableAssignableRoles();
    const roles = [...available];
    const userRoleValue = user.rawRole || (user.role === 'Super Admin' ? 'super_admin' : user.role === 'Administrator' ? 'admin' : user.role === 'Editor' ? 'editor' : 'viewer');
    if (!roles.some(r => r.value === userRoleValue)) {
      roles.unshift({
        value: userRoleValue,
        label: user.role || userRoleValue,
        weight: ROLE_WEIGHTS[userRoleValue] || 0
      });
    }
    return roles;
  };

  const handleDirectRoleChange = async (user: any, newRole: string) => {
    const currentRole = user.rawRole || (user.role === 'Super Admin' ? 'super_admin' : user.role === 'Administrator' ? 'admin' : user.role === 'Editor' ? 'editor' : 'viewer');
    if (currentRole === newRole) return;

    setUpdatingRoleId(user.id);
    try {
      const res = await apiAdminUserData.updateRole(user.id, newRole);
      if (res?.success) {
        const roleLabels: Record<string, string> = {
          super_admin: 'Super Admin',
          admin: 'Administrator',
          editor: 'Editor',
          viewer: 'Viewer'
        };
        showToast(`Role updated to ${roleLabels[newRole] || newRole} for ${user.name}`, 'success');
        await loadData();
      } else {
        showToast(res?.message || 'Failed to update role', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to update role', 'error');
    } finally {
      setUpdatingRoleId(null);
    }
  };

  // Handle Status Toggle
  const handleToggleStatus = async (user: any) => {
    const isSuper = user.role === 'Super Admin' || user.rawRole === 'super_admin';
    if (!canActorManageTarget(user.rawRole || 'admin', isSuper, user.isYou)) {
      showToast('You do not have clearance to change this user’s status.', 'error');
      return;
    }
    const newStatus = user.status === 'Active' ? 'inactive' : 'active';
    try {
      const res = await apiAdminUserData.updateStatus(user.id, newStatus);
      if (res?.success) {
        showToast(`User marked as ${newStatus}`, 'success');
        await loadData();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to update status', 'error');
    }
  };

  // Handle Admin Removal
  const handleRemoveAdmin = async (user: any) => {
    const isSuper = user.role === 'Super Admin' || user.rawRole === 'super_admin';
    if (!canActorManageTarget(user.rawRole || 'admin', isSuper, user.isYou)) {
      showToast('You do not have clearance to remove this administrator.', 'error');
      return;
    }
    setSelectedItems([user.id]);
    setConfirmAction('delete');
    setIsConfirmModalOpen(true);
  };

  // Handle Bulk Action execution
  const executeConfirmAction = async () => {
    if (selectedItems.length === 0 || !confirmAction) {
      setIsConfirmModalOpen(false);
      return;
    }

    setIsPerformingAction(true);
    try {
      let successCount = 0;
      let skippedCount = 0;

      for (const id of selectedItems) {
        const target = users.find(u => u.id === id);
        if (target) {
          const isSuper = target.role === 'Super Admin' || target.rawRole === 'super_admin';
          const canManage = canActorManageTarget(target.rawRole || 'admin', isSuper, target.isYou);
          if (!canManage) {
            skippedCount++;
            continue;
          }
        }

        try {
          if (confirmAction === 'delete') {
            await apiAdminUserData.removeAdmin(id);
            successCount++;
          } else if (confirmAction === 'active' || confirmAction === 'inactive') {
            await apiAdminUserData.updateStatus(id, confirmAction);
            successCount++;
          }
        } catch (itemErr: any) {
          skippedCount++;
          console.warn(`Action ${confirmAction} failed for user ${id}:`, itemErr.message);
        }
      }

      if (successCount > 0) {
        showToast(
          `Action applied to ${successCount} administrator${successCount > 1 ? 's' : ''}${skippedCount > 0 ? ` (${skippedCount} protected account${skippedCount > 1 ? 's' : ''} skipped)` : ''}.`,
          'success'
        );
      } else if (skippedCount > 0) {
        showToast('Selected accounts are protected and cannot be modified.', 'error');
      }

      setSelectedItems([]);
      setIsConfirmModalOpen(false);
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to complete action', 'error');
    } finally {
      setIsPerformingAction(false);
    }
  };

  // Handle Pending Invite Actions
  const handleResendInvite = async (inviteId: string, email: string) => {
    try {
      const res = await apiAdminUserData.resendInvite(inviteId);
      if (res?.success) {
        showToast(`Invitation resent to ${email}!`, 'success');
        await loadData();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to resend invitation', 'error');
    }
  };

  const handleRevokeInvite = async (inviteId: string) => {
    try {
      const res = await apiAdminUserData.revokeInvite(inviteId);
      if (res?.success) {
        showToast('Invitation revoked successfully', 'success');
        await loadData();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to revoke invitation', 'error');
    }
  };

  const resetAllFilters = () => {
    setSearchTerm('');
    setRoleFilter('all');
    setStatusFilter('all');
    setCurrentPage(1);
  };

  const pageInfo = totalCount > 0 
    ? `Showing ${(currentPage - 1) * pageSize + 1} to ${Math.min(currentPage * pageSize, totalCount)} of ${totalCount} users`
    : '0 users found';

  if (isLoading && users.length === 0) {
    return <AdminUsersSkeleton />;
  }

  const assignableRoles = getAvailableAssignableRoles();

  const activeStat = kpiData.find((k: any) => k.label?.includes('ACTIVE'));
  const activeCount = activeStat?.value
    ? Number(activeStat.value)
    : users.filter((u: any) => u.status === 'Active' || u.status === 'active').length;
  const totalAdminsCount = totalCount || users.length;

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Admins</h1>
          <div className={styles.statsSubtitle}>
            <span className={styles.statItemTotal}>
              {totalAdminsCount} Total {totalAdminsCount === 1 ? 'Admin' : 'Admins'}
            </span>
            <span className={styles.statDot} style={{ color: '#10B981' }}>•</span>
            <span className={styles.statItemActive}>
              {activeCount} Active {activeCount === 1 ? 'Admin' : 'Admins'}
            </span>
            <span className={styles.statDot} style={{ color: '#F59E0B' }}>•</span>
            <span className={styles.statItemPending}>
              {pendingInvites.length} Pending
            </span>
          </div>
        </div>
      </div>

      {/* Combined Unified Toolbar & Tabs Card (Sticky below topnavbar on scroll) */}
      <div className={styles.stickyWrapper}>
        <div className={styles.unifiedCard}>
          {/* Row 1: Segmented Tabs (Active, Pending, History) + Compact Add Button */}
          <div className={styles.tabBarRow}>
            <div className={styles.segmentedControl}>
              <button
                className={`${styles.segmentBtn} ${activeTab === 'active' ? styles.segmentBtnActive : ''}`}
                onClick={() => setActiveTab('active')}
              >
                <span>Active</span>
                <span className={`${styles.countBadge} ${activeTab === 'active' ? styles.countBadgeActive : ''}`}>
                  {totalAdminsCount}
                </span>
              </button>
              <button
                className={`${styles.segmentBtn} ${activeTab === 'pending' ? styles.segmentBtnActive : ''}`}
                onClick={() => setActiveTab('pending')}
              >
                <span>Pending</span>
                <span className={`${styles.countBadge} ${activeTab === 'pending' ? styles.countBadgeActive : ''}`}>
                  {pendingInvites.length}
                </span>
              </button>
              <button
                className={`${styles.segmentBtn} ${activeTab === 'history' ? styles.segmentBtnActive : ''}`}
                onClick={() => setActiveTab('history')}
              >
                <span>History</span>
                <span className={`${styles.countBadge} ${activeTab === 'history' ? styles.countBadgeActive : ''}`}>
                  {inviteHistory.length}
                </span>
              </button>
            </div>

            <div className={styles.tabBarActions}>
              <div className={styles.viewToggleWrapper}>
                <ViewToggle view={view} onViewChange={setView} />
              </div>

              {assignableRoles.length > 0 && (
                <button className={styles.btnAddCompact} onClick={() => setIsAddModalOpen(true)} title="Add Administrator">
                  <UserPlus size={15} />
                  <span className={styles.btnAddText}>Add</span>
                </button>
              )}
            </div>
          </div>

          {/* Bulk Action Toolbar (appears only when items are selected) */}
          {activeTab === 'active' && selectedItems.length > 0 && (
            <div className={styles.bulkToolbarRow}>
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
                      setConfirmAction(val as any);
                      setIsConfirmModalOpen(true);
                    }
                  }}
                  options={[
                    { value: 'active', label: 'Mark as Active' },
                    { value: 'inactive', label: 'Mark as Inactive' }
                  ]}
                />
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
                  <Trash2 size={16} style={{ flexShrink: 0, minWidth: '16px' }} /> <span className={styles.hideMobile}>Revoke Access</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {activeTab === 'active' ? (
        <>

          {/* Table Card */}
          <div className={styles.tableCard}>
            {view === 'list' && (() => {
              const manageableUsers = users.filter((u) => {
                const isSuper = u.role === 'Super Admin' || u.rawRole === 'super_admin';
                return canActorManageTarget(u.rawRole || 'admin', isSuper, u.isYou);
              });
              const allManageableSelected = manageableUsers.length > 0 && manageableUsers.every(u => selectedItems.includes(u.id));

              return (
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>
                        <label className={styles.checkboxLabel}>
                          <input 
                            type="checkbox" 
                            className={styles.checkboxInput} 
                            disabled={manageableUsers.length === 0}
                            checked={allManageableSelected} 
                            onChange={(e) => setSelectedItems(e.target.checked ? manageableUsers.map(u => u.id) : [])}
                          />
                          <span 
                            className={`${styles.checkboxCustom} ${manageableUsers.length === 0 ? styles.checkboxDisabled : ''}`}
                            title={manageableUsers.length === 0 ? 'No manageable administrators available to select' : undefined}
                          ></span>
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
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ padding: 0 }}>
                          <div className={styles.emptyStateContainer}>
                            <div className={styles.emptyStateIconWrapper}>
                              {searchTerm || roleFilter !== 'all' || statusFilter !== 'all' ? (
                                <Search size={24} />
                              ) : (
                                <Users size={24} />
                              )}
                            </div>
                            <h3 className={styles.emptyStateTitle}>
                              {searchTerm || roleFilter !== 'all' || statusFilter !== 'all' 
                                ? 'No matching administrators' 
                                : 'No admin users found'}
                            </h3>
                            <p className={styles.emptyStateDescription}>
                              {searchTerm || roleFilter !== 'all' || statusFilter !== 'all'
                                ? "We couldn't find any team members matching your active search or filters."
                                : 'No administrator accounts exist in the system yet.'}
                            </p>
                            {searchTerm || roleFilter !== 'all' || statusFilter !== 'all' ? (
                              <button className={styles.emptyStateActionSecondary} onClick={resetAllFilters}>
                                <X size={15} /> Clear Filters
                              </button>
                            ) : (
                              <button className={styles.emptyStateAction} onClick={() => setIsAddModalOpen(true)}>
                                <Plus size={16} /> Invite Admin
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ) : (
                      users.map((user) => {
                        const isSuper = user.role === 'Super Admin' || user.rawRole === 'super_admin';
                        const canManage = canActorManageTarget(user.rawRole || 'admin', isSuper, user.isYou);
                        const isDeleteDisabled = isSuper || !canManage;

                        return (
                          <tr key={user.id}>
                            <td>
                              <label className={styles.checkboxLabel}>
                                <input 
                                  type="checkbox" 
                                  className={styles.checkboxInput} 
                                  disabled={!canManage}
                                  checked={selectedItems.includes(user.id)}
                                  onChange={(e) => {
                                    if (!canManage) return;
                                    if (e.target.checked) setSelectedItems(prev => [...prev, user.id]);
                                    else setSelectedItems(prev => prev.filter(id => id !== user.id));
                                  }}
                                />
                                <span 
                                  className={`${styles.checkboxCustom} ${!canManage ? styles.checkboxDisabled : ''}`}
                                  title={!canManage ? (isSuper ? 'Super Admin accounts are protected' : user.isYou ? 'You cannot select your own account for bulk actions' : 'Insufficient permissions') : undefined}
                                ></span>
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
                              {canManage ? (
                                <RoleSelectDropdown
                                  currentRole={user.rawRole || (user.role === 'Super Admin' ? 'super_admin' : user.role === 'Administrator' ? 'admin' : user.role === 'Editor' ? 'editor' : 'viewer')}
                                  currentRoleLabel={user.role}
                                  options={getRolesForUser(user)}
                                  onSelect={(newRole) => handleDirectRoleChange(user, newRole)}
                                  disabled={updatingRoleId === user.id}
                                  isLoading={updatingRoleId === user.id}
                                  size="sm"
                                  ariaLabel={`Update role for ${user.name}`}
                                />
                              ) : (
                                <span className={`${styles.roleBadge} ${
                                  user.role === 'Super Admin' ? styles.roleSuperAdmin : 
                                  user.role === 'Administrator' ? styles.roleAdmin :
                                  user.role === 'Editor' ? styles.roleEditor :
                                  styles.roleViewer
                                }`}>
                                  {user.role}
                                </span>
                              )}
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
                                <ActionDropdown actions={[
                                  ...(canManage ? [
                                    { label: 'Change Role', icon: Key, onClick: () => handleOpenRoleModal(user) },
                                    { 
                                      label: user.status === 'Active' ? 'Deactivate User' : 'Activate User', 
                                      icon: user.status === 'Active' ? UserX : UserCheck, 
                                      variant: user.status === 'Active' ? ('danger' as const) : undefined,
                                      onClick: () => handleToggleStatus(user)
                                    },
                                    { label: 'Revoke Admin Access', icon: Trash2, variant: 'danger' as const, onClick: () => handleRemoveAdmin(user) },
                                  ] : [
                                    { label: 'View Profile', icon: Eye, onClick: () => showToast(`Viewing ${user.name}`, 'info') }
                                  ])
                                ]} />
                                <button 
                                  className={deleteBtnStyles.deleteBtn} 
                                  aria-label="Remove Admin"
                                  onClick={() => !isDeleteDisabled && handleRemoveAdmin(user)}
                                  disabled={isDeleteDisabled}
                                  title={isSuper ? "Super Admin cannot be deleted" : isDeleteDisabled ? "Cannot remove this administrator" : "Remove Admin"}
                                >
                                  <Trash2 size={14} />
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
              );
            })()}

            {/* Grid View / Mobile View */}
            <div className={styles.usersGrid} style={{ display: view === 'list' ? 'none' : '' }}>
              {users.length === 0 ? (
                <div style={{ gridColumn: '1 / -1', width: '100%' }}>
                  <div className={styles.emptyStateContainer}>
                    <div className={styles.emptyStateIconWrapper}>
                      {searchTerm || roleFilter !== 'all' || statusFilter !== 'all' ? (
                        <Search size={24} />
                      ) : (
                        <Users size={24} />
                      )}
                    </div>
                    <h3 className={styles.emptyStateTitle}>
                      {searchTerm || roleFilter !== 'all' || statusFilter !== 'all' 
                        ? 'No matching administrators' 
                        : 'No admin users found'}
                    </h3>
                    <p className={styles.emptyStateDescription}>
                      {searchTerm || roleFilter !== 'all' || statusFilter !== 'all'
                        ? "We couldn't find any team members matching your active search or filters."
                        : 'No administrator accounts exist in the system yet.'}
                    </p>
                    {searchTerm || roleFilter !== 'all' || statusFilter !== 'all' ? (
                      <button className={styles.emptyStateActionSecondary} onClick={resetAllFilters}>
                        <X size={15} /> Clear Filters
                      </button>
                    ) : (
                      <button className={styles.emptyStateAction} onClick={() => setIsAddModalOpen(true)}>
                        <Plus size={16} /> Invite Admin
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                users.map(user => {
                  const isSuper = user.role === 'Super Admin' || user.rawRole === 'super_admin';
                  const canManage = canActorManageTarget(user.rawRole || 'admin', isSuper, user.isYou);
                  const isDeleteDisabled = isSuper || !canManage;

                  return (
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
                        {canManage ? (
                          <RoleSelectDropdown
                            currentRole={user.rawRole || (user.role === 'Super Admin' ? 'super_admin' : user.role === 'Administrator' ? 'admin' : user.role === 'Editor' ? 'editor' : 'viewer')}
                            currentRoleLabel={user.role}
                            options={getRolesForUser(user)}
                            onSelect={(newRole) => handleDirectRoleChange(user, newRole)}
                            disabled={updatingRoleId === user.id}
                            isLoading={updatingRoleId === user.id}
                            size="lg"
                            className={styles.mcRoleDropdown}
                            ariaLabel={`Update role for ${user.name}`}
                          />
                        ) : (
                          <div className={styles.mcRoleWrapper}>
                            <div className={`${styles.mcRoleStatic} ${
                              user.role === 'Super Admin' ? styles.roleSuperAdmin : 
                              user.role === 'Administrator' ? styles.roleAdmin :
                              user.role === 'Editor' ? styles.roleEditor :
                              styles.roleViewer
                            }`}>
                              {user.role}
                            </div>
                          </div>
                        )}

                        <div className={styles.mcActionButtons}>
                          <ActionDropdown actions={[
                            ...(canManage ? [
                              { label: 'Change Role', icon: Key, onClick: () => handleOpenRoleModal(user) },
                              { 
                                label: user.status === 'Active' ? 'Deactivate User' : 'Activate User', 
                                icon: user.status === 'Active' ? UserX : UserCheck, 
                                variant: user.status === 'Active' ? ('danger' as const) : undefined,
                                onClick: () => handleToggleStatus(user)
                              },
                              { label: 'Revoke Admin Access', icon: Trash2, variant: 'danger' as const, onClick: () => handleRemoveAdmin(user) },
                            ] : [
                              { label: 'View Profile', icon: Eye, onClick: () => showToast(`Viewing ${user.name}`, 'info') }
                            ])
                          ]} />
                          <button 
                            className={deleteBtnStyles.deleteBtn} 
                            aria-label="Remove Admin"
                            onClick={() => !isDeleteDisabled && handleRemoveAdmin(user)}
                            disabled={isDeleteDisabled}
                            title={isSuper ? "Super Admin cannot be deleted" : isDeleteDisabled ? "Cannot remove this administrator" : "Remove Admin"}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
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
        </>
      ) : activeTab === 'pending' ? (
        /* Pending Invitations Tab */
        <div className={styles.tableCard}>
          {view === 'list' ? (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>RECIPIENT EMAIL</th>
                    <th style={{ textAlign: 'center' }}>ROLE ASSIGNED</th>
                    <th>PERMISSIONS</th>
                    <th>SENT DATE</th>
                    <th>STATUS</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingInvites.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: 0 }}>
                        <div className={styles.emptyStateContainer}>
                          <div className={styles.emptyStateIconWrapper}>
                            <Mail size={24} />
                          </div>
                          <h3 className={styles.emptyStateTitle}>No pending invitations</h3>
                          <p className={styles.emptyStateDescription}>
                            All dispatched administrator invitations have been resolved. New invites will appear here while awaiting response.
                          </p>
                          <button className={styles.emptyStateAction} onClick={() => setIsAddModalOpen(true)}>
                            <Plus size={16} /> Invite Admin
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    pendingInvites.map((inv) => (
                      <tr key={inv.id}>
                        <td>
                          <strong>{inv.email}</strong>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span className={`${styles.roleBadge} ${styles.roleAdmin}`}>
                            {inv.roleAssigned === 'super_admin' ? 'Super Admin' : inv.roleAssigned === 'admin' ? 'Administrator' : inv.roleAssigned === 'editor' ? 'Editor' : 'Viewer'}
                          </span>
                        </td>
                        <td style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
                          {inv.permissionsSummary}
                        </td>
                        <td style={{ fontSize: '13px' }}>
                          {new Date(inv.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                        </td>
                        <td>
                          <span className={`${styles.statusBadge} ${styles.statusPending}`}>
                            Pending
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              className={styles.btnOutline}
                              style={{ padding: '6px 12px', fontSize: '12px' }}
                              onClick={() => handleResendInvite(inv.id, inv.email)}
                              title="Resend Invitation Email"
                            >
                              <RefreshCw size={13} /> Resend
                            </button>
                            <button
                              className={deleteBtnStyles.deleteBtn}
                              onClick={() => handleRevokeInvite(inv.id)}
                              title="Revoke Invitation"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className={styles.usersGrid}>
              {pendingInvites.length === 0 ? (
                <div style={{ gridColumn: '1 / -1', width: '100%' }}>
                  <div className={styles.emptyStateContainer}>
                    <div className={styles.emptyStateIconWrapper}>
                      <Mail size={24} />
                    </div>
                    <h3 className={styles.emptyStateTitle}>No pending invitations</h3>
                    <p className={styles.emptyStateDescription}>
                      All dispatched administrator invitations have been resolved. New invites will appear here while awaiting response.
                    </p>
                    <button className={styles.emptyStateAction} onClick={() => setIsAddModalOpen(true)}>
                      <Plus size={16} /> Invite Admin
                    </button>
                  </div>
                </div>
              ) : (
                pendingInvites.map((inv) => (
                  <div key={`pending-mob-${inv.id}`} className={styles.mobileCard}>
                    <div className={styles.mcHeader}>
                      <div className={styles.userCell}>
                        <div className={styles.avatar} style={{ backgroundColor: '#FFF8E1', color: '#D97706' }}>
                          <Mail size={18} />
                        </div>
                        <div className={styles.userInfo}>
                          <div className={styles.mcUserRow}>
                            <span className={styles.userName}>{inv.email}</span>
                          </div>
                          <div className={styles.mcUserRow}>
                            <span className={`${styles.roleBadge} ${styles.roleAdmin}`}>
                              {inv.roleAssigned === 'super_admin' ? 'Super Admin' : inv.roleAssigned === 'admin' ? 'Administrator' : inv.roleAssigned === 'editor' ? 'Editor' : 'Viewer'}
                            </span>
                            <span className={`${styles.statusBadge} ${styles.statusPending}`}>
                              Pending
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className={styles.mcContact} style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                      <span>{inv.permissionsSummary || 'Standard admin permissions'}</span>
                    </div>

                    <div className={styles.mcStats}>
                      <div className={styles.mcStatItem}>
                        <span className={styles.dateSecondary}>Sent Date</span>
                        <span className={styles.datePrimary}>
                          {new Date(inv.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                        </span>
                      </div>
                    </div>

                    <div className={styles.mcActions}>
                      <button
                        className={styles.btnOutline}
                        style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                        onClick={() => handleResendInvite(inv.id, inv.email)}
                      >
                        <RefreshCw size={13} /> Resend Invite
                      </button>
                      <button
                        className={deleteBtnStyles.deleteBtn}
                        onClick={() => handleRevokeInvite(inv.id)}
                        title="Revoke Invitation"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      ) : (
        /* Invitation History Tab */
        <div className={styles.tableCard}>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>RECIPIENT EMAIL</th>
                  <th style={{ textAlign: 'center' }}>ROLE ASSIGNED</th>
                  <th>INVITED BY</th>
                  <th>OUTCOME</th>
                  <th>EVENT DATE</th>
                  <th>DETAILS</th>
                </tr>
              </thead>
              <tbody>
                {inviteHistory.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: 0 }}>
                      <div className={styles.emptyStateContainer}>
                        <div className={styles.emptyStateIconWrapper}>
                          <Clock size={24} />
                        </div>
                        <h3 className={styles.emptyStateTitle}>No invitation history</h3>
                        <p className={styles.emptyStateDescription}>
                          An audit trail of all accepted, revoked, or expired administrator invitations will appear here.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  inviteHistory.map((item: any) => {
                    const statusColor = 
                      item.status === 'accepted' ? '#10B981' :
                      item.status === 'revoked' ? '#EF4444' :
                      item.status === 'rejected' ? '#6B7280' :
                      '#F59E0B';
                    
                    const statusBg =
                      item.status === 'accepted' ? '#ECFDF5' :
                      item.status === 'revoked' ? '#FEF2F2' :
                      item.status === 'rejected' ? '#F3F4F6' :
                      '#FFFBEB';

                    const resolvedDate = item.acceptedAt || item.revokedAt || item.rejectedAt || item.createdAt;

                    return (
                      <tr key={item.id}>
                        <td>
                          <strong>{item.email}</strong>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span className={`${styles.roleBadge} ${styles.roleAdmin}`}>
                            {item.roleAssigned === 'super_admin' ? 'Super Admin' : item.roleAssigned === 'admin' ? 'Administrator' : item.roleAssigned}
                          </span>
                        </td>
                        <td style={{ fontSize: '13px' }}>
                          {item.invitedBy?.name ? (
                            <div>
                              <span>{item.invitedBy.name}</span>
                              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{item.invitedBy.email}</div>
                            </div>
                          ) : (
                            <span style={{ color: 'var(--color-text-muted)' }}>System / Admin</span>
                          )}
                        </td>
                        <td>
                          <span 
                            style={{ 
                              display: 'inline-flex', 
                              alignItems: 'center', 
                              gap: '5px',
                              padding: '3px 10px', 
                              borderRadius: '20px', 
                              fontSize: '12px', 
                              fontWeight: 600,
                              color: statusColor, 
                              backgroundColor: statusBg,
                              textTransform: 'capitalize' 
                            }}
                          >
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: statusColor }} />
                            {item.status}
                          </span>
                        </td>
                        <td style={{ fontSize: '13px' }}>
                          <div>
                            {new Date(resolvedDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                            {new Date(resolvedDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </td>
                        <td style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
                          {item.acceptedBy?.name ? (
                            <span>Activated by {item.acceptedBy.name}</span>
                          ) : item.permissionsSummary ? (
                            <span>{item.permissionsSummary}</span>
                          ) : (
                            <span>Standard Access</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Admin Modal */}
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
        title="Invite Administrator"
        allowOverflow={true}
      >
        <div style={{ padding: '4px 0' }}>
          {addError && <div className={styles.errorText} style={{ color: '#E53E3E', background: '#FFF5F5', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px' }}>{addError}</div>}
          
          <div className={styles.formGroup} style={{ marginBottom: '16px' }}>
            <label className={styles.label}>Email Address *</label>
            <Input 
              type="email" 
              placeholder="recipient@example.com" 
              value={newAdminEmail}
              onChange={(e) => setNewAdminEmail(e.target.value)}
              disabled={isAdding}
            />
          </div>

          <div className={styles.formGroup} style={{ marginBottom: '16px' }}>
            <label className={styles.label}>Assignable Role *</label>
            <CustomSelect
              options={(assignableRoles.length > 0 ? assignableRoles : [
                { value: 'admin', label: 'Administrator', weight: 80 },
                { value: 'editor', label: 'Editor', weight: 60 },
                { value: 'viewer', label: 'Viewer', weight: 40 },
                { value: 'delivery_agent', label: 'Delivery Agent', weight: 20 }
              ]).map(r => ({ value: r.value, label: r.label }))}
              value={newAdminRole}
              onChange={setNewAdminRole}
              variant="pink"
              className={styles.modalCustomSelect}
              menuPosition="auto"
            />
          </div>

          <div className={styles.modalFooter} style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)} disabled={isAdding}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAddAdmin} isLoading={isAdding}>
              {isAdding ? 'Dispatching...' : 'Dispatch Invite'}
            </Button>
          </div>
        </div>
      </ResponsiveModal>

      {/* Role Change Modal */}
      <ResponsiveModal
        isOpen={isRoleModalOpen}
        onClose={() => {
          if (!isUpdatingRole) {
            setIsRoleModalOpen(false);
            setTargetUserForRole(null);
          }
        }}
        title={`Change Role: ${targetUserForRole?.name || ''}`}
        allowOverflow={true}
      >
        <div style={{ padding: '4px 0' }}>
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '16px' }}>
            Select a new administrative role for <strong>{targetUserForRole?.email}</strong>. Clearance hierarchy rules are strictly enforced.
          </p>

          <div className={styles.formGroup} style={{ marginBottom: '20px' }}>
            <label className={styles.label}>Select Role *</label>
            <CustomSelect
              options={(assignableRoles.length > 0 ? assignableRoles : [
                { value: 'admin', label: 'Administrator', weight: 80 },
                { value: 'editor', label: 'Editor', weight: 60 },
                { value: 'viewer', label: 'Viewer', weight: 40 },
                { value: 'delivery_agent', label: 'Delivery Agent', weight: 20 }
              ]).map(r => ({ value: r.value, label: r.label }))}
              value={selectedNewRole}
              onChange={setSelectedNewRole}
              variant="pink"
              className={styles.modalCustomSelect}
              menuPosition="auto"
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <Button variant="outline" onClick={() => setIsRoleModalOpen(false)} disabled={isUpdatingRole}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveRoleChange} isLoading={isUpdatingRole}>
              {isUpdatingRole ? 'Updating...' : 'Save Role'}
            </Button>
          </div>
        </div>
      </ResponsiveModal>

      {/* Confirm Action Modal */}
      {isConfirmModalOpen && createPortal(
        <div className="animate-fade-in" style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} onClick={() => !isPerformingAction && setIsConfirmModalOpen(false)}></div>
          <div className="animate-slide-up" style={{ position: 'relative', backgroundColor: 'white', padding: '24px', borderRadius: '12px', maxWidth: '400px', width: '90%', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', color: confirmAction === 'delete' ? '#E53E3E' : 'var(--admin-brown)' }}>
              <AlertTriangle size={24} />
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>Confirm Action</h3>
            </div>
            <p style={{ margin: '0 0 24px 0', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
              Are you sure you want to {confirmAction === 'delete' ? `revoke admin access for ${selectedItems.length} selected user(s)` : `mark ${selectedItems.length} selected user(s) as ${confirmAction}`}? {confirmAction === 'delete' && 'This will downgrade their account to customer status.'}
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button 
                onClick={() => setIsConfirmModalOpen(false)}
                disabled={isPerformingAction}
                style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'white', color: 'var(--color-text)', cursor: 'pointer', fontWeight: 600 }}
              >
                Cancel
              </button>
              <button 
                onClick={executeConfirmAction}
                disabled={isPerformingAction}
                style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: confirmAction === 'delete' ? '#E53E3E' : 'var(--admin-pink)', color: 'white', cursor: 'pointer', fontWeight: 600 }}
              >
                {isPerformingAction ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

export default AdminUsers;
