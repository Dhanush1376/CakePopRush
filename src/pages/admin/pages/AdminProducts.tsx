import React from 'react'
import { createPortal } from 'react-dom'
import { 
  Search, Plus, Download, ChevronDown, Filter, X, Trash2, AlertTriangle,
  ShoppingBag, Package, Tag, TrendingDown, Heart, 
  Edit2, MoreVertical, ChevronLeft, ChevronRight 
} from 'lucide-react'
import { Link } from 'react-router-dom'
import styles from './AdminProducts.module.css'
import { CustomSelect } from '../components/CustomSelect'
import { ViewToggle } from '../components/ViewToggle'
import { AdminProductsSkeleton } from '../components/AdminProductsSkeleton'

const statsData = [
  { id: 1, label: 'TOTAL PRODUCTS', value: '128', trend: '12.4%', isPositive: true, comparison: 'vs last 7 days', icon: ShoppingBag, color: 'var(--admin-pink)', bg: '#FFF0F5' },
  { id: 2, label: 'ACTIVE PRODUCTS', value: '112', trend: '10.1%', isPositive: true, comparison: 'vs last 7 days', icon: Package, color: '#F59E0B', bg: '#FFF8E1' },
  { id: 3, label: 'OUT OF STOCK', value: '4', trend: '3.2%', isPositive: false, comparison: 'vs last 7 days', icon: Tag, color: 'var(--admin-cyan)', bg: '#E0FAFC' },
  { id: 4, label: 'LOW STOCK', value: '12', trend: '5.6%', isPositive: false, comparison: 'vs last 7 days', icon: TrendingDown, color: '#5C3317', bg: '#F5F5DC' },
  { id: 5, label: 'TOTAL VIEWS', value: '24,350', trend: '18.7%', isPositive: true, comparison: 'vs last 7 days', icon: Heart, color: 'var(--admin-pink)', bg: '#FFF0F5' },
];

const productsData = [
  { sku: 'CPR-001', name: 'Strawberry Bliss Pops', image: '/images/Products/mini valentine cake.jpeg', category: 'Fruity', price: '₹499', stock: 48, stockState: 'In Stock', status: 'Active', sales: 512, views: '2,350' },
  { sku: 'CPR-002', name: 'Chocolate Crunch Pops', image: '/images/Products/Dark choclate cakepops.jpeg', category: 'Chocolate', price: '₹499', stock: 36, stockState: 'In Stock', status: 'Active', sales: 498, views: '2,120' },
  { sku: 'CPR-003', name: 'Cute Chick Pops', image: '/images/Products/vanilla mango cupcakes.jpeg', category: 'Special', price: '₹449', stock: 8, stockState: 'Low Stock', status: 'Active', sales: 423, views: '1,890' },
  { sku: 'CPR-004', name: 'Lavender Love Pops', image: '/images/Products/White choclate cakepops.jpeg', category: 'Floral', price: '₹549', stock: 0, stockState: 'Out of Stock', status: 'Inactive', sales: 215, views: '1,450' },
  { sku: 'CPR-005', name: 'Red Velvet Pops', image: '/images/Products/Red velvet cookies.jpeg', category: 'Classic', price: '₹499', stock: 65, stockState: 'In Stock', status: 'Active', sales: 678, views: '3,100' },
  { sku: 'CPR-006', name: 'Oreo Crunch Pops', image: '/images/Products/Oreo pops.jpeg', category: 'Chocolate', price: '₹549', stock: 12, stockState: 'Low Stock', status: 'Active', sales: 345, views: '1,780' },
  { sku: 'CPR-007', name: 'Birthday Sprinkle Pops', image: '/images/Products/asorted flavours of cookies.jpeg', category: 'Special', price: '₹599', stock: 42, stockState: 'In Stock', status: 'Active', sales: 890, views: '4,200' },
];

const categoryOptions = [
  { value: 'all', label: 'All Categories' },
  { value: 'fruity', label: 'Fruity' },
  { value: 'chocolate', label: 'Chocolate' },
  { value: 'special', label: 'Special' },
  { value: 'floral', label: 'Floral' },
  { value: 'classic', label: 'Classic' },
];

const stockOptions = [
  { value: 'all', label: 'All Stock Status' },
  { value: 'in_stock', label: 'In Stock' },
  { value: 'low_stock', label: 'Low Stock' },
  { value: 'out_of_stock', label: 'Out of Stock' },
];

const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

export function AdminProducts() {
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedItems, setSelectedItems] = React.useState<string[]>([]);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = React.useState(false);
  const [confirmAction, setConfirmAction] = React.useState('');

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);



  const [categoryFilter, setCategoryFilter] = React.useState('all');
  const [stockFilter, setStockFilter] = React.useState('all');
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [view, setView] = React.useState<'list' | 'grid'>('list');

  if (isLoading) {
    return <AdminProductsSkeleton />;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Products</h1>
          <p className={styles.subtitle}>Manage your cake pop catalog, inventory and pricing.</p>
        </div>
        <Link to="/admin/products/add" className={styles.addBtn} style={{ textDecoration: 'none' }}>
          <Plus size={18} strokeWidth={2.5} />
          Add Product
        </Link>
      </div>

      <div className={styles.stickyWrapper}>
        {selectedItems.length > 0 ? (
        <div className={`${styles.toolbar} ${styles.bulkToolbar}`} style={{ backgroundColor: '#FFF0F5', borderColor: 'var(--admin-pink)', width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            <span style={{ fontWeight: 600, color: 'var(--admin-pink)', whiteSpace: 'nowrap' }}>
              {selectedItems.length} <span className={styles.hideMobile}>product{selectedItems.length > 1 ? 's' : ''} selected</span>
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
            <input type="text" placeholder="Search products by name or SKU..." className={styles.searchInput} />
          </div>
          
          <div className={styles.filtersScrollContainer}>
            <CustomSelect
              options={categoryOptions}
              value={categoryFilter}
              onChange={setCategoryFilter}
              className={styles.filterSelect}
              variant="pink"
            />
            <CustomSelect
              options={stockOptions}
              value={stockFilter}
              onChange={setStockFilter}
              className={styles.filterSelect}
              variant="turquoise"
            />
            <CustomSelect
              options={statusOptions}
              value={statusFilter}
              onChange={setStatusFilter}
              className={styles.filterSelect}
              variant="yellow"
            />
          </div>
  
          <div className={styles.actionButtons}>
            <button className={styles.btnOutline} title="Filters">
              <Filter className={styles.btnIcon} /> <span className={styles.hideMobile}>Filters</span>
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
                  <th style={{ width: '40px' }}>
                    <input type="checkbox" className={styles.checkbox} aria-label="Select all" checked={selectedItems.length === productsData.length && productsData.length > 0} onChange={(e) => setSelectedItems(e.target.checked ? productsData.map(p => p.sku) : [])} />
                  </th>
                  <th>PRODUCT</th>
                  <th>CATEGORY</th>
                  <th>PRICE</th>
                  <th>INVENTORY</th>
                  <th>STATUS</th>
                  <th>SALES</th>
                  <th>VIEWS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {productsData.map((product, idx) => {
                  const badgeClass = styles[product.category.toLowerCase()] || '';
                  const stockStateClass = product.stockState === 'In Stock' ? styles.inStock : 
                                         product.stockState === 'Low Stock' ? styles.lowStock : styles.outOfStock;
                  const statusClass = product.status === 'Active' ? styles.active : styles.inactive;

                  return (
                    <tr key={idx}>
                      <td>
                        <input type="checkbox" className={styles.checkbox} aria-label={`Select ${product.name}`} checked={selectedItems.includes(product.sku)} onChange={(e) => { if (e.target.checked) setSelectedItems(prev => [...prev, product.sku]); else setSelectedItems(prev => prev.filter(id => id !== product.sku)); }} />
                      </td>
                      <td>
                        <div className={styles.productCell}>
                          <img src={product.image} alt={product.name} className={styles.productImage} />
                          <div>
                            <div className={styles.productName}>{product.name}</div>
                            <div className={styles.productSku}>SKU: {product.sku}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`${styles.categoryBadge} ${badgeClass}`}>
                          {product.category}
                        </span>
                      </td>
                      <td>
                        <div className={styles.cellText}>{product.price}</div>
                      </td>
                      <td>
                        <div className={styles.cellText}>{product.stock} in stock</div>
                        <div className={`${styles.stockStatus} ${stockStateClass}`}>{product.stockState}</div>
                      </td>
                      <td>
                        <span className={`${styles.statusBadge} ${statusClass}`}>
                          {product.status}
                        </span>
                      </td>
                      <td>
                        <div className={styles.cellText}>{product.sales}</div>
                      </td>
                      <td>
                        <div className={styles.cellText}>{product.views}</div>
                      </td>
                      <td>
                        <div className={styles.actionsCell}>
                          <button 
                            className="global-delete-btn" 
                            aria-label="Delete Product"
                            onClick={() => {
                              setSelectedItems([String(product.sku)]);
                              setConfirmAction('delete');
                              setIsConfirmModalOpen(true);
                            }}
                          >
                            <Trash2 size={16} />
                          </button>
                          <button className={styles.actionBtn} aria-label="Edit Product">
                            <Edit2 size={16} />
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
            {productsData.map((product, idx) => {
              const badgeClass = styles[product.category.toLowerCase()] || '';
              const stockStateClass = product.stockState === 'In Stock' ? styles.inStock : 
                                     product.stockState === 'Low Stock' ? styles.lowStock : styles.outOfStock;
              const statusClass = product.status === 'Active' ? styles.active : styles.inactive;

              return (
                <div key={`grid-${idx}`} className={styles.gridCard}>
                  <div className={styles.mobileCardHeader}>
                    <div className={styles.productCell}>
                      <input type="checkbox" className={styles.checkbox} aria-label={`Select ${product.name}`} checked={selectedItems.includes(product.sku)} onChange={(e) => { if (e.target.checked) setSelectedItems(prev => [...prev, product.sku]); else setSelectedItems(prev => prev.filter(id => id !== product.sku)); }} />
                      <img src={product.image} alt={product.name} className={styles.productImage} />
                      <div>
                        <div className={styles.productName}>{product.name}</div>
                        <div className={styles.productSku}>SKU: {product.sku}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className={styles.mobileCardRow}>
                    <span className={styles.mobileCardLabel}>Status:</span>
                    <div style={{display: 'flex', gap: '8px'}}>
                      <span className={`${styles.categoryBadge} ${badgeClass}`}>{product.category}</span>
                      <span className={`${styles.statusBadge} ${statusClass}`}>{product.status}</span>
                    </div>
                  </div>

                  <div className={styles.mobileCardRow}>
                    <span className={styles.mobileCardLabel}>Price / Stock:</span>
                    <span className={styles.cellText}>{product.price} <span className={styles.cellSubtext}>| {product.stock} (<span className={`${styles.stockStatus} ${stockStateClass}`}>{product.stockState}</span>)</span></span>
                  </div>

                  <div className={styles.mobileCardRow}>
                    <span className={styles.mobileCardLabel}>Sales / Views:</span>
                    <span className={styles.cellText}>{product.sales} <span className={styles.cellSubtext}>/ {product.views}</span></span>
                  </div>

                  <div className={styles.mobileCardRow}>
                    <span className={styles.mobileCardLabel}>Actions:</span>
                    <div className={styles.actionsCell}>
                      <button 
                        className="global-delete-btn" 
                        aria-label="Delete Product"
                        onClick={() => {
                          setSelectedItems([String(product.sku)]);
                          setConfirmAction('delete');
                          setIsConfirmModalOpen(true);
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                      <button className={styles.actionBtn} aria-label="Edit Product"><Edit2 size={16} /></button>
                      <button className={styles.actionBtn} aria-label="More Actions"><MoreVertical size={16} /></button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Mobile View */}
        <div className={styles.mobileCards} style={{ display: view === 'list' ? 'none' : '' }}>
          {productsData.map((product, idx) => {
            const badgeClass = styles[product.category.toLowerCase()] || '';
            const stockStateClass = product.stockState === 'In Stock' ? styles.inStock : 
                                   product.stockState === 'Low Stock' ? styles.lowStock : styles.outOfStock;
            const statusClass = product.status === 'Active' ? styles.active : styles.inactive;

            return (
              <div key={idx} className={styles.mobileCard}>
                <div className={styles.mobileCardHeader}>
                  <div className={styles.productCell}>
                    <input type="checkbox" className={styles.checkbox} aria-label={`Select ${product.name}`} checked={selectedItems.includes(product.sku)} onChange={(e) => { if (e.target.checked) setSelectedItems(prev => [...prev, product.sku]); else setSelectedItems(prev => prev.filter(id => id !== product.sku)); }} />
                    <img src={product.image} alt={product.name} className={styles.productImage} />
                    <div>
                      <div className={styles.productName}>{product.name}</div>
                      <div className={styles.productSku}>SKU: {product.sku}</div>
                    </div>
                  </div>
                </div>
                
                <div className={styles.mobileCardRow}>
                  <span className={styles.mobileCardLabel}>Status:</span>
                  <div style={{display: 'flex', gap: '8px'}}>
                    <span className={`${styles.categoryBadge} ${badgeClass}`}>{product.category}</span>
                    <span className={`${styles.statusBadge} ${statusClass}`}>{product.status}</span>
                  </div>
                </div>

                <div className={styles.mobileCardRow}>
                  <span className={styles.mobileCardLabel}>Price / Stock:</span>
                  <span className={styles.cellText}>{product.price} <span className={styles.cellSubtext}>| {product.stock} (<span className={`${styles.stockStatus} ${stockStateClass}`}>{product.stockState}</span>)</span></span>
                </div>

                <div className={styles.mobileCardRow}>
                  <span className={styles.mobileCardLabel}>Sales / Views:</span>
                  <span className={styles.cellText}>{product.sales} <span className={styles.cellSubtext}>/ {product.views}</span></span>
                </div>

                <div className={styles.mobileCardRow}>
                  <span className={styles.mobileCardLabel}>Actions:</span>
                  <div className={styles.actionsCell}>
                    <button 
                      className="global-delete-btn" 
                      aria-label="Delete Product"
                      onClick={() => {
                        setSelectedItems([String(product.sku)]);
                        setConfirmAction('delete');
                        setIsConfirmModalOpen(true);
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                    <button className={styles.actionBtn} aria-label="Edit Product"><Edit2 size={16} /></button>
                    <button className={styles.actionBtn} aria-label="More Actions"><MoreVertical size={16} /></button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className={styles.pagination}>
          <div className={styles.paginationText}>Showing 1 to 7 of 128 products</div>
          <div className={styles.pageControls}>
            <button className={styles.pageBtn} aria-label="Previous page"><ChevronLeft size={16} /></button>
            <button className={`${styles.pageBtn} ${styles.active}`}>1</button>
            <button className={styles.pageBtn}>2</button>
            <button className={styles.pageBtn}>3</button>
            <span className={styles.pageEllipsis}>...</span>
            <button className={styles.pageBtn}>19</button>
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
