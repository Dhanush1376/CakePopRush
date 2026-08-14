import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import { 
  Search, Plus, Download, Calendar, ChevronDown, 
  ShoppingBag, Clock, Package, Truck, CheckCircle, 
  Eye, MoreVertical, User, ChevronLeft, ChevronRight, Filter, Trash2, AlertTriangle, X
} from 'lucide-react'
import { Link } from 'react-router-dom'
import styles from './AdminOrders.module.css'
import { ViewToggle } from '../components/ViewToggle'
import { CustomSelect } from '../components/CustomSelect'
import { AdminOrdersSkeleton } from '../components/AdminOrdersSkeleton'
import { InvoiceViewer } from '@/components/invoice/InvoiceViewer'
import { mapOrderToInvoiceData, InvoiceData } from '@/types/invoice'

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

const statsData = [
  { id: 1, label: 'TOTAL ORDERS', value: '1,248', trend: '18.6%', isPositive: true, comparison: 'vs last 7 days', icon: ShoppingBag, color: 'var(--admin-pink)', bg: '#FFF0F5' },
  { id: 2, label: 'PENDING', value: '312', trend: '8.2%', isPositive: true, comparison: 'vs last 7 days', icon: Clock, color: '#F59E0B', bg: '#FFF8E1' },
  { id: 3, label: 'PROCESSING', value: '456', trend: '16.3%', isPositive: true, comparison: 'vs last 7 days', icon: Package, color: '#0284C7', bg: '#E0F2FE' },
  { id: 4, label: 'SHIPPED', value: '312', trend: '12.7%', isPositive: true, comparison: 'vs last 7 days', icon: Truck, color: 'var(--admin-cyan)', bg: '#E0FAFC' },
  { id: 5, label: 'DELIVERED', value: '168', trend: '10.1%', isPositive: true, comparison: 'vs last 7 days', icon: CheckCircle, color: '#5C3317', bg: '#F5F5DC' },
];

const ordersData = [
  { id: '#CPR-1254', customer: 'Neha Sharma', email: 'nehasharma@email.com', date: 'May 24, 2025', time: '10:30 AM', amount: '₹1,260', items: '3 items', method: 'Online', paymentStatus: 'Paid', status: 'Pending' },
  { id: '#CPR-1253', customer: 'Riya Patel', email: 'riyapatel@email.com', date: 'May 24, 2025', time: '09:15 AM', amount: '₹980', items: '2 items', method: 'UPI', paymentStatus: 'Paid', status: 'Processing' },
  { id: '#CPR-1252', customer: 'Ankit Verma', email: 'ankitverma@email.com', date: 'May 23, 2025', time: '08:45 PM', amount: '₹1,450', items: '4 items', method: 'Card', paymentStatus: 'Paid', status: 'Shipped' },
  { id: '#CPR-1251', customer: 'Pooja Mehta', email: 'poojamehta@email.com', date: 'May 23, 2025', time: '06:20 PM', amount: '₹2,350', items: '5 items', method: 'Net Banking', paymentStatus: 'Paid', status: 'Delivered' },
  { id: '#CPR-1250', customer: 'Karan Singh', email: 'karansingh@email.com', date: 'May 23, 2025', time: '04:10 PM', amount: '₹890', items: '2 items', method: 'COD', paymentStatus: 'Pending', status: 'Pending' },
  { id: '#CPR-1249', customer: 'Sneha Iyer', email: 'snehaiyer@email.com', date: 'May 22, 2025', time: '02:35 PM', amount: '₹1,680', items: '3 items', method: 'UPI', paymentStatus: 'Paid', status: 'Shipped' },
  { id: '#CPR-1248', customer: 'Rahul Gupta', email: 'rahulgupta@email.com', date: 'May 22, 2025', time: '11:50 AM', amount: '₹760', items: '1 item', method: 'Card', paymentStatus: 'Paid', status: 'Delivered' },
];

export function AdminOrders() {
  const [isLoading, setIsLoading] = React.useState(true);
  const [invoiceOrder, setInvoiceOrder] = React.useState<any | null>(null);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);



  const [activeActionMenu, setActiveActionMenu] = React.useState<string | null>(null);
  const [selectedOrders, setSelectedOrders] = React.useState<string[]>([]);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = React.useState(false);
  const [confirmAction, setConfirmAction] = React.useState('');
  const [view, setView] = React.useState<'list' | 'grid'>('list');
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [paymentFilter, setPaymentFilter] = React.useState('all');
  const [dateFilter, setDateFilter] = React.useState('7days');

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
            <button className={styles.btnOutline} title="Export Selected" style={{ padding: '8px' }}>
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
            <input type="text" placeholder="Search orders..." className={styles.searchInput} />
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
              options={paymentOptions}
              value={paymentFilter}
              onChange={setPaymentFilter}
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
                    checked={selectedOrders.length === ordersData.length && ordersData.length > 0}
                    onChange={(e) => setSelectedOrders(e.target.checked ? ordersData.map(o => o.id) : [])}
                  />
                </th>
                <th>ORDER ID</th>
                <th>CUSTOMER</th>
                <th>DATE</th>
                <th>AMOUNT</th>
                <th>PAYMENT</th>
                <th>STATUS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {ordersData.map((order, idx) => (
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
                  <td>
                    <span className={styles.cellText}>{order.id}</span>
                  </td>
                  <td>
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
                        className="global-delete-btn" 
                        aria-label="Delete Order"
                        onClick={() => {
                          setSelectedOrders([String(order.id)]);
                          setConfirmAction('delete');
                          setIsConfirmModalOpen(true);
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                      <button className={styles.actionBtn}>
                        <Eye size={16} />
                      </button>
                      <div className={styles.actionMenuWrapper}>
                        <button 
                          className={styles.actionBtn}
                          onClick={() => setActiveActionMenu(activeActionMenu === order.id ? null : order.id)}
                        >
                          <MoreVertical size={16} />
                        </button>
                        {activeActionMenu === order.id && (
                          <div className={styles.actionMenu}>
                            <button className={styles.menuItem}>Edit Order</button>
                            <button className={styles.menuItem} onClick={() => setInvoiceOrder(order)}>View Invoice</button>
                            <button className={`${styles.menuItem} ${styles.menuItemDanger}`}>Cancel Order</button>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
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
              checked={selectedOrders.length === ordersData.length && ordersData.length > 0}
              onChange={(e) => setSelectedOrders(e.target.checked ? ordersData.map(o => o.id) : [])}
            />
            Select All Orders
          </label>
        </div>
        
        <div className={styles.ordersGrid} style={{ display: view === 'list' ? 'none' : '' }}>
          {ordersData.map((order, idx) => (
            <div key={`grid-${order.id}-${idx}`} className={styles.orderCard}>
              <div className={styles.mcHeader}>
                <div className={styles.customerCell}>
                  <div className={styles.customerAvatar}>
                    <User size={16} strokeWidth={2.5} />
                  </div>
                  <div className={styles.customerInfo} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className={styles.customerName}>{order.customer}</span>
                    <span className={styles.cellText} style={{ fontSize: '12px' }}>{order.id}</span>
                  </div>
                </div>
                <span className={`${styles.statusBadge} ${styles[order.status.toLowerCase()]}`}>
                  {order.status}
                </span>
              </div>

              <div className={styles.mcContact}>
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
                  <span className={styles.cellSubtext}>Amount</span>
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
                  className="global-delete-btn" 
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
                <button className={styles.actionBtn}>
                  <Eye size={14} />
                </button>
                <button 
                  className={styles.actionBtn} 
                  onClick={() => setActiveActionMenu(activeActionMenu === `grid-${order.id}` ? null : `grid-${order.id}`)}
                >
                  <MoreVertical size={14} />
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
          ))}
        </div>
        
        <div className={styles.pagination}>
          <span className={styles.pageText}>Showing 1 to 7 of 1,248 orders</span>
          <div className={styles.pageControls}>
            <button className={styles.pageBtn} disabled><ChevronLeft size={16} /></button>
            <button className={`${styles.pageBtn} ${styles.active}`}>1</button>
            <button className={styles.pageBtn}>2</button>
            <button className={styles.pageBtn}>3</button>
            <span className={styles.pageDots}>...</span>
            <button className={styles.pageBtn}>178</button>
            <button className={styles.pageBtn}><ChevronRight size={16} /></button>
          </div>
        </div>
      </div>
      
      <InvoiceViewer 
        isOpen={!!invoiceOrder} 
        onClose={() => setInvoiceOrder(null)} 
        data={invoiceOrder ? mapOrderToInvoiceData(invoiceOrder) : null} 
      />

      {isConfirmModalOpen && createPortal(
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} onClick={() => setIsConfirmModalOpen(false)}></div>
          <div style={{ position: 'relative', backgroundColor: 'white', padding: '24px', borderRadius: '12px', maxWidth: '400px', width: '90%', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
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
    </div>
  )
}
