import React from 'react'
import { 
  Search, Plus, Download, ChevronDown, Filter,
  Grid, Package, Heart, Apple, Star, Flower2, PartyPopper, Gift, Snowflake,
  MoreVertical, Edit2, ChevronLeft, ChevronRight 
} from 'lucide-react'
import styles from './AdminCategories.module.css'
import { ViewToggle } from '../components/ViewToggle'
import { AdminCategoriesSkeleton } from '../components/AdminCategoriesSkeleton'
import { AdminAddCategoryModal } from '../components/AdminAddCategoryModal'
import { CustomSelect } from '../components/CustomSelect'

const statsData = [
  { id: 1, label: 'TOTAL CATEGORIES', value: '24', trend: '14.3%', isPositive: true, comparison: 'vs last 7 days', icon: Grid, color: 'var(--admin-pink)', bg: '#FFF0F5' },
  { id: 2, label: 'ACTIVE CATEGORIES', value: '20', trend: '11.5%', isPositive: true, comparison: 'vs last 7 days', icon: Package, color: '#F59E0B', bg: '#FFF8E1' },
  { id: 3, label: 'INACTIVE CATEGORIES', value: '4', trend: '20.0%', isPositive: false, comparison: 'vs last 7 days', icon: Package, color: 'var(--admin-cyan)', bg: '#E0FAFC' },
  { id: 4, label: 'PRODUCTS IN CATEGORIES', value: '128', trend: '12.4%', isPositive: true, comparison: 'vs last 7 days', icon: Heart, color: 'var(--admin-pink)', bg: '#FFF0F5' },
];

const categoriesData = [
  { id: 1, name: 'Fruity Pops', description: 'Delicious cake pops made with real fruit flavors.', products: 18, status: 'Active', created: 'May 10, 2025', icon: Apple, color: 'var(--admin-pink)', bg: '#FFF0F5' },
  { id: 2, name: 'Chocolate Pops', description: 'Rich, creamy and irresistible chocolate cake pops.', products: 24, status: 'Active', created: 'May 08, 2025', icon: Package, color: '#F59E0B', bg: '#FFF8E1' },
  { id: 3, name: 'Special Pops', description: 'Unique and special edition cake pops.', products: 16, status: 'Active', created: 'May 05, 2025', icon: Star, color: 'var(--admin-cyan)', bg: '#E0FAFC' },
  { id: 4, name: 'Floral Pops', description: 'Beautiful cake pops with floral designs.', products: 12, status: 'Active', created: 'May 02, 2025', icon: Flower2, color: '#9333EA', bg: '#F3E8FF' },
  { id: 5, name: 'Love & Romance', description: 'Perfect cake pops for love and celebrations.', products: 14, status: 'Active', created: 'Apr 28, 2025', icon: Heart, color: 'var(--admin-pink)', bg: '#FFF0F5' },
  { id: 6, name: 'Birthday Pops', description: 'Fun and colorful cake pops for birthdays.', products: 20, status: 'Active', created: 'Apr 25, 2025', icon: PartyPopper, color: '#F59E0B', bg: '#FFF8E1' },
  { id: 7, name: 'Occasion Pops', description: 'Cake pops for all special occasions.', products: 24, status: 'Inactive', created: 'Apr 20, 2025', icon: Gift, color: 'var(--admin-cyan)', bg: '#E0FAFC' },
  { id: 8, name: 'Seasonal Pops', description: 'Limited edition seasonal cake pops.', products: 10, status: 'Inactive', created: 'Apr 18, 2025', icon: Snowflake, color: '#5C3317', bg: '#F5F5DC' },
];

export function AdminCategories() {
  const [view, setView] = React.useState<'list' | 'grid'>('list');
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [isLoading, setIsLoading] = React.useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [categories, setCategories] = React.useState(categoriesData);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <AdminCategoriesSkeleton />;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Categories</h1>
          <p className={styles.subtitle}>Organize your products into categories.</p>
        </div>
        <button className={styles.addBtn} onClick={() => setIsAddModalOpen(true)}>
          <Plus size={18} strokeWidth={2.5} />
          Add Category
        </button>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.searchWrapper}>
          <Search size={16} className={styles.searchIcon} />
          <input type="text" placeholder="Search categories..." className={styles.searchInput} />
        </div>
        <div className={styles.filtersScrollContainer}>
          <CustomSelect
            options={[
              { value: 'all', label: 'All Status' },
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' }
            ]}
            value={statusFilter}
            onChange={setStatusFilter}
            variant="yellow"
            className={styles.filterSelect}
          />
        </div>
        <div className={styles.actionButtons}>
          <button className={styles.filterBtn}>
            <Filter size={16} className={styles.btnIcon} />
            <span className={styles.hideMobile}>Filter</span>
          </button>
          <button className={styles.exportBtn}>
            <Download size={16} className={styles.btnIcon} />
            <span className={styles.hideMobile}>Export</span>
          </button>
          <div style={{ flexShrink: 0 }}>
            <ViewToggle view={view} onViewChange={setView} />
          </div>
        </div>
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
        <div className={styles.tableWrapper} style={{ display: view === 'grid' ? 'none' : '' }}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ width: '48px', textAlign: 'center' }}>
                  <input type="checkbox" className={styles.checkbox} aria-label="Select all categories" />
                </th>
                <th style={{ width: '22%' }}>CATEGORY</th>
                <th>DESCRIPTION</th>
                <th>PRODUCTS</th>
                <th>STATUS</th>
                <th>CREATED ON</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => {
                const statusClass = category.status === 'Active' ? styles.active : styles.inactive;
                const CategoryIcon = category.icon;

                return (
                  <tr key={category.id}>
                    <td style={{ textAlign: 'center' }}>
                      <input type="checkbox" className={styles.checkbox} aria-label={`Select ${category.name}`} />
                    </td>
                    <td>
                      <div className={styles.categoryCell}>
                        <div className={styles.categoryIconWrapper} style={{ backgroundColor: category.bg, color: category.color }}>
                          <CategoryIcon size={18} />
                        </div>
                        <div className={styles.categoryName}>{category.name}</div>
                      </div>
                    </td>
                    <td>
                      <div className={styles.descriptionCell}>{category.description}</div>
                    </td>
                    <td>
                      <div className={styles.cellText}>{category.products}</div>
                    </td>
                    <td>
                      <span className={`${styles.statusBadge} ${statusClass}`}>
                        {category.status}
                      </span>
                    </td>
                    <td>
                      <div className={styles.cellText}>{category.created}</div>
                    </td>
                    <td>
                      <div className={styles.actionsCell}>
                        <button className={styles.actionBtn} aria-label="Edit Category"><Edit2 size={16} /></button>
                        <button className={styles.actionBtn} aria-label="More Actions"><MoreVertical size={16} /></button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className={styles.mobileCards} style={{ display: view === 'list' ? 'none' : '' }}>
          {categories.map((category) => {
            const statusClass = category.status === 'Active' ? styles.active : styles.inactive;
            const CategoryIcon = category.icon;

            return (
              <div key={category.id} className={styles.mobileCard}>
                <div className={styles.mobileCardHeader}>
                  <div className={styles.categoryCell}>
                    <div className={styles.categoryIconWrapper} style={{ backgroundColor: category.bg, color: category.color }}>
                      <CategoryIcon size={18} />
                    </div>
                    <div className={styles.categoryName}>{category.name}</div>
                  </div>
                  <span className={`${styles.statusBadge} ${statusClass}`}>{category.status}</span>
                </div>
                
                <div className={styles.descriptionCell} style={{ maxWidth: '100%' }}>
                  {category.description}
                </div>

                <div className={styles.mobileCardRow}>
                  <div>
                    <span className={styles.mobileCardLabel}>Products</span>
                    <div className={styles.cellText}>{category.products}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className={styles.mobileCardLabel}>Created On</span>
                    <div className={styles.cellText}>{category.created}</div>
                  </div>
                </div>
                
                <div className={styles.mobileCardRow}>
                  <div>
                    <input type="checkbox" className={styles.checkbox} aria-label={`Select ${category.name}`} />
                  </div>
                  <div className={styles.actionsCell}>
                    <button className={styles.actionBtn} aria-label="Edit Category"><Edit2 size={16} /></button>
                    <button className={styles.actionBtn} aria-label="More Actions"><MoreVertical size={16} /></button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className={styles.pagination}>
          <div className={styles.paginationText}>Showing 1 to 8 of 24 categories</div>
          <div className={styles.pageControls}>
            <button className={styles.pageBtn} aria-label="Previous page"><ChevronLeft size={16} /></button>
            <button className={`${styles.pageBtn} ${styles.active}`}>1</button>
            <button className={styles.pageBtn}>2</button>
            <button className={styles.pageBtn}>3</button>
            <span className={styles.pageEllipsis}>...</span>
            <button className={styles.pageBtn}>3</button>
            <button className={styles.pageBtn} aria-label="Next page"><ChevronRight size={16} /></button>
          </div>
        </div>
      </div>

      <AdminAddCategoryModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        existingCategories={categories}
        onSuccess={(newCategory) => {
          // Add new category at the top of the list
          setCategories([newCategory, ...categories])
        }}
      />
    </div>
  )
}
