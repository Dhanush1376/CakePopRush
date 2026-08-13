import React from 'react'
import { 
  Users, Shield, Edit, Key,
  Search, Filter, Download, 
  Eye, MoreVertical, Plus, ChevronLeft, ChevronRight
} from 'lucide-react'
import { CustomSelect } from '../components/CustomSelect'
import { ViewToggle } from '../components/ViewToggle'
import styles from './AdminUsers.module.css'
import { AdminUsersSkeleton } from '../components/AdminUsersSkeleton';
import { ResponsiveModal } from '@/components/ui/ResponsiveModal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

// KPI Data
const kpiData = [
  { id: 1, label: 'TOTAL USERS', value: '3', trend: '0.0%', isPositive: true, isNeutral: true, icon: Users, color: 'var(--admin-pink)', bg: '#FFF0F5' },
  { id: 2, label: 'ACTIVE USERS', value: '3', trend: '100%', isPositive: true, isNeutral: false, icon: Shield, color: '#F59E0B', bg: '#FFF8E1' },
  { id: 3, label: 'ADMINISTRATORS', value: '1', trend: '33.3%', isPositive: true, isNeutral: false, icon: Shield, color: 'var(--admin-cyan)', bg: '#E0FAFC' },
  { id: 4, label: 'EDITORS', value: '1', trend: '33.3%', isPositive: true, isNeutral: false, icon: Edit, color: 'var(--admin-purple)', bg: '#F3E5F5' },
  { id: 5, label: 'SUPER ADMINS', value: '1', trend: '33.3%', isPositive: true, isNeutral: false, icon: Key, color: '#5C3317', bg: '#F5F5DC' },
];

// Mock Users
const users = [
  {
    id: 1,
    name: 'Priyanka',
    email: 'priyanka@cakepoprush.com',
    initials: 'PR',
    avatarBg: '#FFF0F5',
    avatarColor: 'var(--admin-pink)',
    isYou: false,
    role: 'Super Admin',
    status: 'Active',
    lastLoginDate: 'May 24, 2025',
    lastLoginTime: '10:30 AM',
    joinDate: 'Jan 01, 2024',
    joinTime: '11:00 AM'
  },
  {
    id: 2,
    name: 'Sravani',
    email: 'sravani@cakepoprush.com',
    initials: 'SR',
    avatarBg: '#FFF8E1',
    avatarColor: '#F59E0B',
    isYou: false,
    role: 'Administrator',
    status: 'Active',
    lastLoginDate: 'May 24, 2025',
    lastLoginTime: '09:15 AM',
    joinDate: 'Jan 10, 2024',
    joinTime: '09:30 AM'
  },
  {
    id: 3,
    name: 'Dhanush',
    email: 'dhanush@cakepoprush.com',
    initials: 'DH',
    avatarBg: '#E0FAFC',
    avatarColor: 'var(--admin-cyan)',
    isYou: true,
    role: 'Editor',
    status: 'Active',
    lastLoginDate: 'May 24, 2025',
    lastLoginTime: '08:45 AM',
    joinDate: 'Jan 15, 2024',
    joinTime: '02:20 PM'
  }
];

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
  
  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const [roleFilter, setRoleFilter] = React.useState('all');
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [dateFilter, setDateFilter] = React.useState('all');
  const [view, setView] = React.useState<'list' | 'grid'>('list');

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
      <div className={styles.toolbar}>
        <div className={styles.searchWrapper}>
          <Search size={16} className={styles.searchIcon} />
          <input type="text" placeholder="Search by name, email or role..." className={styles.searchInput} />
        </div>
        
        <CustomSelect
          options={roleOptions}
          value={roleFilter}
          onChange={setRoleFilter}
          className={styles.filterSelect}
          variant="yellow"
        />
        <CustomSelect
          options={statusOptions}
          value={statusFilter}
          onChange={setStatusFilter}
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
          <Filter size={14} /> Filter
        </button>
        <button className={styles.btnOutline}>
          <Download size={14} /> Export
        </button>
        <ViewToggle view={view} onViewChange={setView} />
      </div>

      {/* KPI Grid */}
      <div className={styles.kpiGrid}>
        {kpiData.map((kpi) => {
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
                  <span className={kpi.isNeutral ? styles.trendNeutral : (kpi.isPositive ? styles.trendPositive : styles.trendNegative)}>
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
        {view === 'list' && (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
            <thead>
              <tr>
                <th>
                  <label className={styles.checkboxLabel}>
                    <input type="checkbox" className={styles.checkboxInput} />
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
              {users.map((user) => (
                <tr key={user.id}>
                  <td>
                    <label className={styles.checkboxLabel}>
                      <input type="checkbox" className={styles.checkboxInput} />
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
                      <button className={styles.actionBtn}><Eye size={14} /></button>
                      <button className={styles.actionBtn}><MoreVertical size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}

        {/* Grid View / Mobile View */}
        <div className={`${styles.usersGrid} ${view === 'list' ? styles.hideOnDesktop : ''}`}>
          {users.map(user => (
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
                <button className={styles.actionBtn}><Eye size={14} /></button>
                <button className={styles.actionBtn}><MoreVertical size={14} /></button>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.pagination}>
          <span className={styles.pageInfo}>Showing 1 to 3 of 3 users</span>
          <div className={styles.pageControls}>
            <button className={styles.pageBtn}><ChevronLeft size={16} /></button>
            <button className={`${styles.pageBtn} ${styles.active}`}>1</button>
            <button className={styles.pageBtn}>2</button>
            <button className={styles.pageBtn}><ChevronRight size={16} /></button>
          </div>
        </div>
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
    </div>
  )
}
