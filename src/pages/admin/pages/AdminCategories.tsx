import { CategoryDetailsModal } from '@/features/admin/components/CategoryDetailsModal'
import React from 'react'
import { Search, Plus, Download, Filter, Edit2, ChevronLeft, ChevronRight, Eye, Power, PowerOff } from 'lucide-react'
import styles from './AdminCategories.module.css'
import { ViewToggle } from '@/features/admin/components/ViewToggle'
import { AdminCategoriesSkeleton } from '@/features/admin/components/AdminCategoriesSkeleton'
import { AdminAddCategoryModal } from '@/features/admin/components/AdminAddCategoryModal'
import { CustomSelect } from '@/features/admin/components/CustomSelect'

import { adminCategoryData, adminProductData } from '@/features/admin/api/adminDataProvider'

const statsDataStatic = null;
const categoriesDataStatic = null;
const productsDataStatic = null;


export function AdminCategories() {
  const [view, setView] = React.useState<'list' | 'grid'>('list');

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
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [isLoading, setIsLoading] = React.useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [categories, setCategories] = React.useState<any[]>([]);
  const [statsData, setStatsData] = React.useState<any[]>([]);
  const [productsData, setProductsData] = React.useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = React.useState<any | null>(null);

  const toggleCategoryStatus = (id: string) => {
    const category = categories.find(c => c.id === id);
    if (!category) return;
    const newStatus = category.status === 'Active' ? 'Inactive' : 'Active';
    adminCategoryData.updateCategory(id, { status: newStatus }).then(updated => {
      if (updated) {
        setCategories(prev => prev.map(c => c.id === id ? updated : c));
      }
    });
  };

  React.useEffect(() => {
    Promise.all([
      adminCategoryData.getStats(),
      adminCategoryData.getCategories(),
      adminProductData.getProducts()
    ]).then(([stats, cats, prods]) => {
      setStatsData(stats);
      setCategories(cats);
      setProductsData(prods);
    }).finally(() => {
      setIsLoading(false);
    });
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
                    <tr key={category.id} className={category.status === 'Inactive' ? styles.inactiveRow : ''}>
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
                          <button className={styles.actionBtn} disabled={category.status === 'Inactive'} aria-label="Edit Category"><Edit2 size={16} /></button>
                          <button className={styles.actionBtn} aria-label="View Details" onClick={() => setSelectedCategory(category)}><Eye size={16} /></button>
                          <button 
                            className={`${styles.actionBtn} ${category.status === 'Active' ? styles.dangerBtn : styles.successBtn}`}
                            aria-label={category.status === 'Active' ? 'Deactivate Category' : 'Activate Category'}
                            onClick={() => toggleCategoryStatus(category.id)}
                            style={{ color: category.status === 'Active' ? '#DC2626' : 'var(--admin-green)' }}
                          >
                            {category.status === 'Active' ? <PowerOff size={16} /> : <Power size={16} />}
                          </button>
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
              <div key={category.id} className={`${styles.mobileCard} ${category.status === 'Inactive' ? styles.inactiveCard : ''}`}>
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
                    <button className={styles.actionBtn} disabled={category.status === 'Inactive'} aria-label="Edit Category"><Edit2 size={16} /></button>
                    <button className={styles.actionBtn} aria-label="View Details" onClick={() => setSelectedCategory(category)}><Eye size={16} /></button>
                    <button 
                      className={`${styles.actionBtn} ${category.status === 'Active' ? styles.dangerBtn : styles.successBtn}`}
                      aria-label={category.status === 'Active' ? 'Deactivate Category' : 'Activate Category'}
                      onClick={() => toggleCategoryStatus(category.id)}
                      style={{ color: category.status === 'Active' ? '#DC2626' : 'var(--admin-green)' }}
                    >
                      {category.status === 'Active' ? <PowerOff size={16} /> : <Power size={16} />}
                    </button>
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
          return adminCategoryData.addCategory(newCategory as any).then((added) => {
            setCategories(prev => [added as any, ...prev]);
            return added;
          });
        }}
      />

      <CategoryDetailsModal 
        isOpen={!!selectedCategory}
        onClose={() => setSelectedCategory(null)}
        category={selectedCategory}
        products={productsData}
      />
    </div>
  )
}
