import React from 'react'
import { 
  Search, Plus, Download, ChevronDown, Filter,
  ShoppingBag, Package, Tag, TrendingDown, Heart, 
  Edit2, MoreVertical, ChevronLeft, ChevronRight 
} from 'lucide-react'
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
        <button className={styles.addBtn}>
          <Plus size={18} strokeWidth={2.5} />
          Add Product
        </button>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.searchWrapper}>
          <Search size={16} className={styles.searchIcon} />
          <input type="text" placeholder="Search products by name or SKU..." className={styles.searchInput} />
        </div>
        
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

        <button className={styles.btnOutline}>
          <Filter size={14} />
          More Filters
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
                  <th style={{ width: '40px' }}>
                    <input type="checkbox" className={styles.checkbox} aria-label="Select all" />
                  </th>
                  <th style={{ width: '35%' }}>PRODUCT</th>
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
                        <input type="checkbox" className={styles.checkbox} aria-label={`Select ${product.name}`} />
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
                      <input type="checkbox" className={styles.checkbox} aria-label={`Select ${product.name}`} />
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
        <div className={styles.mobileCards}>
          {productsData.map((product, idx) => {
            const badgeClass = styles[product.category.toLowerCase()] || '';
            const stockStateClass = product.stockState === 'In Stock' ? styles.inStock : 
                                   product.stockState === 'Low Stock' ? styles.lowStock : styles.outOfStock;
            const statusClass = product.status === 'Active' ? styles.active : styles.inactive;

            return (
              <div key={idx} className={styles.mobileCard}>
                <div className={styles.mobileCardHeader}>
                  <div className={styles.productCell}>
                    <input type="checkbox" className={styles.checkbox} aria-label={`Select ${product.name}`} />
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
    </div>
  )
}
