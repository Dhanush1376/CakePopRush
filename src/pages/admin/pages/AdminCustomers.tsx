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
import styles from './AdminCustomers.module.css'
import deleteBtnStyles from '@/features/admin/components/AdminDeleteButton.module.css'

import { adminCustomerData } from '@/features/admin/api/mockAdminDataProvider'

const kpiData = adminCustomerData.getStats();
const customers = adminCustomerData.getCustomers();

export function AdminCustomers() {
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedItems, setSelectedItems] = React.useState<(string | number)[]>([]);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = React.useState(false);
  const [confirmAction, setConfirmAction] = React.useState('');
  const [view, setView] = React.useState<'list' | 'grid'>('list');
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [locationFilter, setLocationFilter] = React.useState('all');
  const [dateFilter, setDateFilter] = React.useState('all');
  const [selectedCustomer, setSelectedCustomer] = React.useState<any | null>(null);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
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
            <input type="text" placeholder="Search customers by name, email or phone..." className={styles.searchInput} />
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
              options={locationOptions}
              value={locationFilter}
              onChange={setLocationFilter}
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
            <button className={styles.btnOutline} title="Filter">
              <Filter className={styles.btnIcon} /> <span className={styles.hideMobile}>Filter</span>
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
                    <input type="checkbox" className={styles.checkbox} aria-label="Select all customers" checked={selectedItems.length === customers.length && customers.length > 0} onChange={(e) => setSelectedItems(e.target.checked ? customers.map(c => c.id) : [])} />
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
                {customers.map((cust) => (
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
                ))}
              </tbody>
            </table>
          </div>
        )}

        {view === 'grid' && (
          <div className={styles.customersGrid}>
            {customers.map(cust => (
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
          ))}
        </div>
        )}

        <div className={styles.pagination}>
          <span className={styles.pageInfo}>Showing 1 to 7 of 856 customers</span>
          <div className={styles.pageControls}>
            <button className={styles.pageBtn}><ChevronLeft size={16} /></button>
            <button className={`${styles.pageBtn} ${styles.active}`}>1</button>
            <button className={styles.pageBtn}>2</button>
            <button className={styles.pageBtn}>3</button>
            <span className={styles.pageDots}>...</span>
            <button className={styles.pageBtn}>12</button>
            <button className={styles.pageBtn}><ChevronRight size={16} /></button>
          </div>
        </div>
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
    </div>
  )
}
