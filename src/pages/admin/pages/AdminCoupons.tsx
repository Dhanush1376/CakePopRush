import React from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Search, Plus, Download, ChevronDown, Filter,
  Ticket, Tag, Calendar, Wallet, Gift,
  MoreVertical, Edit2, Trash2, ChevronLeft, ChevronRight 
} from 'lucide-react'
import styles from './AdminCoupons.module.css'
import { CustomSelect } from '../components/CustomSelect'
import { ViewToggle } from '../components/ViewToggle'
import { AdminCouponsSkeleton } from '../components/AdminCouponsSkeleton';

const statsData = [
  { id: 1, label: 'TOTAL COUPONS', value: '24', trend: '14.3%', isPositive: true, comparison: 'vs last 7 days', icon: Ticket, color: 'var(--admin-pink)', bg: '#FFF0F5' },
  { id: 2, label: 'ACTIVE COUPONS', value: '18', trend: '12.6%', isPositive: true, comparison: 'vs last 7 days', icon: Tag, color: '#F59E0B', bg: '#FFF8E1' },
  { id: 3, label: 'TOTAL REDEMPTIONS', value: '3,248', trend: '18.7%', isPositive: true, comparison: 'vs last 7 days', icon: Calendar, color: 'var(--admin-cyan)', bg: '#E0FAFC' },
  { id: 4, label: 'TOTAL DISCOUNT GIVEN', value: '₹1,45,230', trend: '22.4%', isPositive: true, comparison: 'vs last 7 days', icon: Wallet, color: 'var(--admin-pink)', bg: '#FFF0F5' },
  { id: 5, label: 'EXPIRING SOON', value: '5', trend: '16.7%', isPositive: false, comparison: 'vs last 7 days', icon: Gift, color: '#5C3317', bg: '#F5F5DC' },
];

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

const couponsData = [
  { id: 1, code: 'WELCOME10', name: 'Welcome Offer', description: 'Flat 10% off on first order', discount: '10%', discountDesc: 'Flat', type: 'Percentage', minOrder: '₹499', used: 245, limit: 500, validityRange: 'May 18 - May 31, 2025', validityTimeLeft: '13 days left', status: 'Active', codeColor: 'pink', barColor: 'var(--admin-pink)' },
  { id: 2, code: 'CAKEPOP20', name: 'CakePop Special', description: 'Get 20% off on all cake pops', discount: '20%', discountDesc: 'Flat', type: 'Percentage', minOrder: '₹999', used: 128, limit: 300, validityRange: 'May 10 - May 30, 2025', validityTimeLeft: '12 days left', status: 'Active', codeColor: 'yellow', barColor: '#F59E0B' },
  { id: 3, code: 'FREESHIP', name: 'Free Shipping', description: 'Free shipping on orders above ₹799', discount: '—', discountDesc: 'Free Shipping', type: 'Shipping', minOrder: '₹799', used: 356, limit: null, validityRange: 'May 01 - May 31, 2025', validityTimeLeft: '13 days left', status: 'Active', codeColor: 'cyan', barColor: 'var(--admin-cyan)' },
  { id: 4, code: 'SUMMER15', name: 'Summer Treat', description: 'Enjoy 15% off this summer', discount: '15%', discountDesc: 'Flat', type: 'Percentage', minOrder: '₹699', used: 78, limit: 200, validityRange: 'May 12 - May 26, 2025', validityTimeLeft: '8 days left', status: 'Active', codeColor: 'purple', barColor: '#9333EA' },
  { id: 5, code: 'EXTRA5', name: 'Extra Savings', description: 'Extra ₹5 off on prepaid orders', discount: '₹5', discountDesc: 'Flat', type: 'Fixed Amount', minOrder: '₹299', used: 532, limit: null, validityRange: 'Apr 20 - May 20, 2025', validityTimeLeft: '2 days left', status: 'Active', codeColor: 'brown', barColor: '#5C3317' },
  { id: 6, code: 'NEWUSER30', name: 'New User Deal', description: 'Flat 30% off for new users', discount: '30%', discountDesc: 'Flat', type: 'Percentage', minOrder: '₹1,499', used: 85, limit: 100, validityRange: 'May 01 - May 24, 2025', validityTimeLeft: 'Expires today', status: 'Expiring Soon', codeColor: 'pink', barColor: 'var(--admin-pink)' },
  { id: 7, code: 'OLD25', name: 'Old is Gold', description: '25% off for returning users', discount: '25%', discountDesc: 'Flat', type: 'Percentage', minOrder: '₹999', used: 0, limit: 150, validityRange: 'Apr 10 - Apr 25, 2025', validityTimeLeft: 'Expired', status: 'Expired', codeColor: 'gray', barColor: '#CBD5E1' },
  { id: 8, code: 'DIWALI50', name: 'Diwali Dhamaka', description: 'Flat 50% off on special collection', discount: '50%', discountDesc: 'Flat', type: 'Percentage', minOrder: '₹1,999', used: 320, limit: 320, validityRange: 'Oct 20 - Nov 05, 2024', validityTimeLeft: 'Expired', status: 'Expired', codeColor: 'gray', barColor: '#CBD5E1' },
];

export function AdminCoupons() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = React.useState(true);
  
  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const [coupons, setCoupons] = React.useState(couponsData);
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [typeFilter, setTypeFilter] = React.useState('all');
  const [expiryFilter, setExpiryFilter] = React.useState('all');
  const [view, setView] = React.useState<'list' | 'grid'>('list');

  const handleDelete = (id: number) => {
    setCoupons(prev => prev.filter(c => c.id !== id));
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

      <div className={styles.toolbar}>
        <div className={styles.searchWrapper}>
          <Search size={16} className={styles.searchIcon} />
          <input type="text" placeholder="Search coupons by code or name..." className={styles.searchInput} />
        </div>
        
        <CustomSelect
          options={statusOptions}
          value={statusFilter}
          onChange={setStatusFilter}
          className={styles.filterSelect}
          variant="yellow"
        />
        <CustomSelect
          options={typeOptions}
          value={typeFilter}
          onChange={setTypeFilter}
          className={styles.filterSelect}
          variant="pink"
        />
        <CustomSelect
          options={expiryOptions}
          value={expiryFilter}
          onChange={setExpiryFilter}
          className={styles.filterSelect}
          variant="turquoise"
        />

        <button className={styles.btnOutline}>
          <Filter size={14} />
          Filter
        </button>

        <button className={styles.btnOutline}>
          <Download size={14} />
          Export
        </button>

        <ViewToggle view={view} onViewChange={setView} />
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
                  <th style={{ width: '15%' }}>COUPON CODE</th>
                  <th style={{ width: '22%' }}>COUPON NAME</th>
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
                {coupons.map((coupon) => {
                  const typeClass = coupon.type === 'Percentage' ? styles.percentage : 
                                   coupon.type === 'Shipping' ? styles.shipping : styles.fixed;
                                   
                  const statusClass = coupon.status === 'Active' ? styles.active : 
                                     coupon.status === 'Expiring Soon' ? styles.expiring : styles.expired;

                  const progress = coupon.limit ? (coupon.used / coupon.limit) * 100 : coupon.used > 0 ? 100 : 0;
                  
                  const codeColorClass = styles[coupon.codeColor] || '';
                  const isWarning = coupon.validityTimeLeft === 'Expires today' || coupon.validityTimeLeft === 'Expired';

                  return (
                    <tr key={coupon.id} className={coupon.status === 'Expired' ? styles.expiredState : ''}>
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
                          {coupon.status === 'Expired' && (
                            <button 
                              className={styles.deleteCouponBtn} 
                              aria-label="Delete Coupon"
                              title="Delete Expired Coupon"
                              onClick={() => handleDelete(coupon.id)}
                            >
                              <Trash2 size={14} /> Delete
                            </button>
                          )}
                          <button className={styles.actionBtn} aria-label="Edit Coupon"><Edit2 size={16} /></button>
                          <button className={styles.actionBtn} aria-label="More Actions"><MoreVertical size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {view === 'grid' && (
          <div className={styles.itemsGrid}>
            {coupons.map((coupon) => {
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
                    {coupon.status === 'Expired' && (
                      <button 
                        className={styles.deleteCouponBtn} 
                        aria-label="Delete Coupon"
                        title="Delete Expired Coupon"
                        onClick={() => handleDelete(coupon.id)}
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    )}
                    <button className={styles.actionBtn} aria-label="Edit Coupon"><Edit2 size={16} /></button>
                    <button className={styles.actionBtn} aria-label="More Actions"><MoreVertical size={16} /></button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Mobile View */}
        <div className={styles.mobileCards}>
          {coupons.map((coupon) => {
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
                  {coupon.status === 'Expired' && (
                    <button 
                      className={styles.deleteCouponBtn} 
                      aria-label="Delete Coupon"
                      title="Delete Expired Coupon"
                      onClick={() => handleDelete(coupon.id)}
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  )}
                  <button className={styles.actionBtn} aria-label="Edit Coupon"><Edit2 size={16} /></button>
                  <button className={styles.actionBtn} aria-label="More Actions"><MoreVertical size={16} /></button>
                </div>
              </div>
            )
          })}
        </div>

        <div className={styles.pagination}>
          <span className={styles.pageInfo}>Showing 1 to 8 of 24 coupons</span>
          <div className={styles.pageControls}>
            <button className={styles.pageBtn}><ChevronLeft size={16} /></button>
            <button className={`${styles.pageBtn} ${styles.active}`}>1</button>
            <button className={styles.pageBtn}>2</button>
            <button className={styles.pageBtn}>3</button>
            <button className={styles.pageBtn}><ChevronRight size={16} /></button>
          </div>
        </div>
      </div>
    </div>
  )
}
