import React from 'react'
import { createPortal } from 'react-dom'
import { 
  Search, Download, Filter, Star, Eye, MoreVertical,
  ThumbsUp, MessageSquare, AlertCircle, TrendingUp, ChevronLeft, ChevronRight,
  AlertTriangle, Trash2, X
} from 'lucide-react'
import styles from './AdminReviews.module.css'
import { CustomSelect } from '../components/CustomSelect'
import { ViewToggle } from '../components/ViewToggle'
import { AdminReviewsSkeleton } from '../components/AdminReviewsSkeleton';

const statsData = [
  { id: 1, label: 'TOTAL REVIEWS', value: '1,248', trend: '18.6%', isPositive: true, comparison: 'vs last 7 days', icon: MessageSquare, color: 'var(--admin-pink)', bg: '#FFF0F5' },
  { id: 2, label: 'AVERAGE RATING', value: '4.8', trend: '2.4%', isPositive: true, comparison: 'vs last 7 days', icon: Star, color: '#F59E0B', bg: '#FFF8E1' },
  { id: 3, label: 'POSITIVE REVIEWS', value: '92%', trend: '4.2%', isPositive: true, comparison: 'vs last 7 days', icon: ThumbsUp, color: 'var(--admin-cyan)', bg: '#E0FAFC' },
  { id: 4, label: 'NEEDS ATTENTION', value: '12', trend: '14.5%', isPositive: false, comparison: 'vs last 7 days', icon: AlertCircle, color: '#DC2626', bg: '#FEE2E2' },
];

const productOptions = [
  { value: 'all', label: 'All Products' },
  { value: 'cakes', label: 'Cakes' },
  { value: 'cupcakes', label: 'Cupcakes' },
  { value: 'cakepops', label: 'Cake Pops' }
];

const ratingOptions = [
  { value: 'all', label: 'All Ratings' },
  { value: '5', label: '5 Stars' },
  { value: '4', label: '4 Stars & Up' },
  { value: '3', label: '3 Stars & Up' },
  { value: '2', label: '2 Stars & Up' },
  { value: '1', label: '1 Star & Up' }
];

const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'approved', label: 'Approved' },
  { value: 'pending', label: 'Pending' },
  { value: 'rejected', label: 'Rejected' }
];

const dateOptions = [
  { value: 'all', label: 'All Time' },
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' }
];

const reviewsData = [
  { id: 1, text: "Absolutely delicious! The strawberry flavor is so fresh and the cake pops are so soft and moist. Perfect for any occasion!", product: 'Strawberry Bliss Pops', sku: 'CPR-001', category: 'Cakes', image: '/images/Products/mini valentine cake.jpeg', rating: 5, customer: 'Neha Sharma', email: 'neha.sharma@email.com', initials: 'NS', avatarColor: 'var(--admin-pink)', avatarBg: '#FFF0F5', date: 'May 24, 2025', time: '10:30 AM', status: 'Approved' },
  { id: 2, text: "Love the chocolate crunch! Great taste and beautifully decorated. Will definitely order again.", product: 'Chocolate Crunch Pops', sku: 'CPR-002', category: 'Cakes', image: '/images/Products/Dark choclate cakepops.jpeg', rating: 5, customer: 'Riya Patel', email: 'riya.patel@email.com', initials: 'RP', avatarColor: '#F59E0B', avatarBg: '#FFF8E1', date: 'May 24, 2025', time: '09:15 AM', status: 'Approved' },
  { id: 3, text: "So cute and kids loved it! The packaging was amazing too.", product: 'Cute Chick Pops', sku: 'CPR-003', category: 'Cakes', image: '/images/Products/vanilla mango cupcakes.jpeg', rating: 4, customer: 'Ankit Verma', email: 'ankit.verma@email.com', initials: 'AV', avatarColor: 'var(--admin-cyan)', avatarBg: '#E0FAFC', date: 'May 23, 2025', time: '08:45 PM', status: 'Approved' },
  { id: 4, text: "Good flavor and quality, but a bit on the smaller side than I expected.", product: 'Lavender Love Pops', sku: 'CPR-004', category: 'Cakes', image: '/images/Products/White choclate cakepops.jpeg', rating: 4, customer: 'Pooja Mehta', email: 'pooja.mehta@email.com', initials: 'PM', avatarColor: '#9333EA', avatarBg: '#F3E8FF', date: 'May 23, 2025', time: '06:20 PM', status: 'Pending' },
  { id: 5, text: "The red velvet is out of this world. Super moist and the frosting is divine.", product: 'Red Velvet Pops', sku: 'CPR-005', category: 'Cakes', image: '/images/Products/Red velvet cookies.jpeg', rating: 5, customer: 'Vikram Singh', email: 'vikram.s@email.com', initials: 'VS', avatarColor: 'var(--admin-primary)', avatarBg: '#E5E7EB', date: 'May 22, 2025', time: '04:10 PM', status: 'Pending' },
  { id: 6, text: "Not satisfied with the taste. It was too sweet for my liking.", product: 'Oreo Crunch Pops', sku: 'CPR-006', category: 'Cakes', image: '/images/Products/Oreo pops.jpeg', rating: 2, customer: 'Sneha Iyer', email: 'sneha.iyer@email.com', initials: 'SI', avatarColor: 'var(--admin-pink)', avatarBg: '#FFF0F5', date: 'May 22, 2025', time: '02:35 PM', status: 'Rejected' },
  { id: 7, text: "Perfect for birthday celebrations! My guests loved it.", product: 'Birthday Sprinkle Pops', sku: 'CPR-007', category: 'Cakes', image: '/images/Products/asorted flavours of cookies.jpeg', rating: 5, customer: 'Rahul Gupta', email: 'rahulgupta@email.com', initials: 'RG', avatarColor: 'var(--admin-cyan)', avatarBg: '#E0FAFC', date: 'May 22, 2025', time: '11:50 AM', status: 'Approved' },
];

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className={styles.ratingStars}>
      {[...Array(5)].map((_, i) => (
        <Star 
          key={i} 
          size={14} 
          className={i < rating ? styles.starFilled : styles.starEmpty} 
          fill={i < rating ? "currentColor" : "none"} 
        />
      ))}
    </div>
  )
}

export function AdminReviews() {
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedItems, setSelectedItems] = React.useState<(string | number)[]>([]);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = React.useState(false);
  const [confirmAction, setConfirmAction] = React.useState('');
  
  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const [productFilter, setProductFilter] = React.useState('all');
  const [ratingFilter, setRatingFilter] = React.useState('all');
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [dateFilter, setDateFilter] = React.useState('all');
  const [view, setView] = React.useState<'list' | 'grid'>('list');

  if (isLoading) return <AdminReviewsSkeleton />;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Product Reviews</h1>
          <p className={styles.subtitle}>Monitor and manage customer reviews for your products.</p>
        </div>
      </div>

      <div className={styles.stickyWrapper}>
        {selectedItems.length > 0 ? (
        <div className={`${styles.toolbar} ${styles.bulkToolbar}`} style={{ backgroundColor: '#FFF0F5', borderColor: 'var(--admin-pink)', width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            <span style={{ fontWeight: 600, color: 'var(--admin-pink)', whiteSpace: 'nowrap' }}>
              {selectedItems.length} <span className={styles.hideMobile}>review{selectedItems.length > 1 ? 's' : ''} selected</span>
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
            <input type="text" placeholder="Search by customer, review text or product..." className={styles.searchInput} />
          </div>
          
          <div className={styles.filtersScrollContainer}>
            <CustomSelect
              options={productFilter === 'all' ? productOptions : productOptions}
              value={productFilter}
              onChange={setProductFilter}
              className={styles.filterSelect}
              variant="yellow"
            />
            <CustomSelect
              options={ratingOptions}
              value={ratingFilter}
              onChange={setRatingFilter}
              className={styles.filterSelect}
              variant="pink"
            />
            <CustomSelect
              options={statusOptions}
              value={statusFilter}
              onChange={setStatusFilter}
              className={styles.filterSelect}
              variant="turquoise"
            />
            <CustomSelect
              options={dateOptions}
              value={dateFilter}
              onChange={setDateFilter}
              className={styles.filterSelect}
              variant="yellow"
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
                  <th className={styles.checkboxCell}>
                    <input type="checkbox" className={styles.checkbox} aria-label="Select all reviews" checked={selectedItems.length === reviewsData.length && reviewsData.length > 0} onChange={(e) => setSelectedItems(e.target.checked ? reviewsData.map(r => r.id) : [])} />
                  </th>
                  <th>PRODUCT</th>
                  <th>REVIEW</th>
                  <th>CUSTOMER</th>
                  <th>DATE</th>
                  <th>STATUS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {reviewsData.map((review) => {
                  const statusClass = review.status === 'Approved' ? styles.approved : 
                                     review.status === 'Pending' ? styles.pending : styles.rejected;

                  return (
                    <tr key={review.id}>
                      <td className={styles.checkboxCell}>
                        <input type="checkbox" className={styles.checkbox} aria-label={`Select ${review.product || review.id}`} checked={selectedItems.includes(review.id)} onChange={(e) => { if (e.target.checked) setSelectedItems(prev => [...prev, review.id]); else setSelectedItems(prev => prev.filter(id => id !== review.id)); }} />
                      </td>
                      <td>
                        <div className={styles.productCell} style={{ minWidth: 0, paddingRight: '24px' }}>
                          <img src={review.image} alt={review.product} className={styles.productImage} />
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <div className={styles.productName} style={{ maxWidth: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{review.product}</div>
                            <div className={styles.productCategory}>{review.category}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className={styles.reviewCell} style={{ minWidth: 0 }}>
                          <RatingStars rating={review.rating} />
                          <div className={styles.reviewText} style={{ maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{review.text}</div>
                        </div>
                      </td>
                      <td>
                        <div className={styles.customerCell}>
                          <div className={styles.avatarInitials} style={{ backgroundColor: review.avatarBg, color: review.avatarColor }}>
                            {review.initials}
                          </div>
                          <div>
                            <div className={styles.customerName}>{review.customer}</div>
                            <div className={styles.customerEmail}>{review.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className={styles.cellText}>{review.date}</div>
                        <div className={styles.cellSubtext}>{review.time}</div>
                      </td>
                      <td>
                        <span className={`${styles.statusBadge} ${statusClass}`}>
                          {review.status}
                        </span>
                      </td>
                      <td>
                        <div className={styles.actionsCell}>
                          <button 
                            className={styles.deleteBtn} 
                            aria-label="Delete Review"
                            onClick={() => {
                              setSelectedItems([String(review.id)]);
                              setConfirmAction('delete');
                              setIsConfirmModalOpen(true);
                            }}
                          >
                            <Trash2 size={16} />
                          </button>
                          <button className={styles.actionBtn} aria-label="View Review">
                            <Eye size={16} />
                          </button>
                          <button className={styles.actionBtn} aria-label="More Actions">
                            <MoreVertical size={16} />
                          </button>
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
            {reviewsData.map((review) => {
              const statusClass = review.status === 'Approved' ? styles.approved : 
                                 review.status === 'Pending' ? styles.pending : styles.rejected;

              return (
                <div key={`grid-${review.id}`} className={styles.gridCard}>
                  <div className={styles.mobileCardHeader}>
                    <div className={styles.customerCell}>
                      <div className={styles.avatarInitials} style={{ backgroundColor: review.avatarBg, color: review.avatarColor }}>
                        {review.initials}
                      </div>
                      <div>
                        <div className={styles.customerName}>{review.customer}</div>
                        <RatingStars rating={review.rating} />
                      </div>
                    </div>
                    <span className={`${styles.statusBadge} ${statusClass}`}>{review.status}</span>
                  </div>
                  
                  <div className={styles.reviewText}>{review.text}</div>

                  <div className={styles.mobileCardRow}>
                    <div className={styles.productCell}>
                      <img src={review.image} alt={review.product} className={styles.productImage} />
                      <div>
                        <div className={styles.productName}>{review.product}</div>
                        <div className={styles.productCategory}>{review.category}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className={styles.mobileCardFooter}>
                    <div className={styles.cellText}>{review.date} at {review.time}</div>
                    <div className={styles.actionsCell}>
                      <button 
                        className={styles.deleteBtn} 
                        aria-label="Delete Review"
                        onClick={() => {
                          setSelectedItems([String(review.id)]);
                          setConfirmAction('delete');
                          setIsConfirmModalOpen(true);
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                      <button className={styles.actionBtn}><Eye size={14} /></button>
                      <button className={styles.actionBtn}><MoreVertical size={14} /></button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Mobile View */}
        <div className={styles.mobileCards} style={{ display: view === 'list' ? 'none' : '' }}>
          {reviewsData.map((review) => {
              const statusClass = review.status === 'Approved' ? styles.approved : 
                                 review.status === 'Pending' ? styles.pending : styles.rejected;

              return (
              <div key={review.id} className={styles.mobileCard}>
                <div className={styles.mobileCardHeader}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <div style={{ marginTop: '4px' }}>
                      <input type="checkbox" className={styles.checkbox} aria-label={`Select ${review.product || review.id} mobile`} checked={selectedItems.includes(review.id)} onChange={(e) => { if (e.target.checked) setSelectedItems(prev => [...prev, review.id]); else setSelectedItems(prev => prev.filter(id => id !== review.id)); }} />
                    </div>
                    <div className={styles.customerCell}>
                      <div className={styles.avatarInitials} style={{ backgroundColor: review.avatarBg, color: review.avatarColor }}>
                        {review.initials}
                      </div>
                      <div>
                        <div className={styles.customerName}>{review.customer}</div>
                        <RatingStars rating={review.rating} />
                      </div>
                    </div>
                  </div>
                  <span className={`${styles.statusBadge} ${statusClass}`}>{review.status}</span>
                </div>
                
                <div className={styles.reviewText}>{review.text}</div>

                <div className={styles.mobileCardRow}>
                  <div className={styles.productCell}>
                    <img src={review.image} alt={review.product} className={styles.productImage} />
                    <div>
                      <div className={styles.productName}>{review.product}</div>
                      <div className={styles.productCategory}>{review.category}</div>
                    </div>
                  </div>
                </div>

                <div className={styles.mobileCardRow}>
                  <div style={{display: 'flex', flexDirection: 'column'}}>
                    <span className={styles.cellText}>{review.date}</span>
                    <span className={styles.cellSubtext}>{review.time}</span>
                  </div>
                  <div className={styles.actionsCell}>
                    <button 
                      className={styles.deleteBtn} 
                      aria-label="Delete Review"
                      onClick={() => {
                        setSelectedItems([String(review.id)]);
                        setConfirmAction('delete');
                        setIsConfirmModalOpen(true);
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                    <button className={styles.actionBtn} aria-label="View Review"><Eye size={16} /></button>
                    <button className={styles.actionBtn} aria-label="More Actions"><MoreVertical size={16} /></button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className={styles.pagination}>
          <div className={styles.paginationText}>Showing 1 to 7 of 1,248 reviews</div>
          <div className={styles.pageControls}>
            <button className={styles.pageBtn} aria-label="Previous page"><ChevronLeft size={16} /></button>
            <button className={`${styles.pageBtn} ${styles.active}`}>1</button>
            <button className={styles.pageBtn}>2</button>
            <button className={styles.pageBtn}>3</button>
            <span className={styles.pageEllipsis}>...</span>
            <button className={styles.pageBtn}>179</button>
            <button className={styles.pageBtn} aria-label="Next page"><ChevronRight size={16} /></button>
          </div>
        </div>
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
    </div>
  )
}
