import { ActionDropdown } from '@/features/admin/components/ActionDropdown'
import React from 'react'
import { createPortal } from 'react-dom'
import { Search, Plus, Download, Filter, X, Trash2, AlertTriangle, Edit2, MoreVertical, ChevronLeft, ChevronRight, Eye, Copy, Archive, Package, Power, PowerOff } from 'lucide-react'
import { Link } from 'react-router-dom'
import styles from './AdminProducts.module.css'
import deleteBtnStyles from '@/features/admin/components/AdminDeleteButton.module.css'
import { CustomSelect } from '@/features/admin/components/CustomSelect'
import { AdminFilterModal } from '@/features/admin/components/AdminFilterModal'
import filterModalStyles from '@/features/admin/components/AdminFilterModal.module.css'
import { ViewToggle } from '@/features/admin/components/ViewToggle'
import { AdminProductsSkeleton } from '@/features/admin/components/AdminProductsSkeleton'
import { ProductDetailsModal } from '@/features/admin/components/ProductDetailsModal'
import { useAdminTableState } from '@/features/admin/hooks/useAdminTableState'
import { exportToCSV } from '@/features/admin/utils/exportUtils'

import { adminProductData } from '@/features/admin/api/adminDataProvider'

const statsDataStatic = null;
const initialProductsDataStatic = null;

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
  const [selectedProductDetails, setSelectedProductDetails] = React.useState<any | null>(null);

  const [statsData, setStatsData] = React.useState<any>(null);
  const [products, setProducts] = React.useState<any[]>([]);
  const [isInventoryMode, setIsInventoryMode] = React.useState(false);

  const handleStockUpdate = (sku: string, newStock: number) => {
    setProducts(prev => prev.map(p => {
      if (p.sku === sku) {
        const stockState = newStock === 0 ? 'Out of Stock' : newStock <= 10 ? 'Low Stock' : 'In Stock';
        return { ...p, stock: newStock, stockState };
      }
      return p;
    }));
  };

  const toggleProductStatus = (sku: string) => {
    setProducts(prev => prev.map(p => {
      if (p.sku === sku) {
        return { ...p, status: p.status === 'Active' ? 'Inactive' : 'Active' };
      }
      return p;
    }));
  };

  React.useEffect(() => {
    Promise.all([
      adminProductData.getStats(),
      adminProductData.getProducts()
    ]).then(([stats, prods]) => {
      setStatsData(stats);
      setProducts(prods);
    }).finally(() => {
      setIsLoading(false);
    });
  }, []);



  const {
    searchTerm,
    setSearchTerm,
    activeFilters,
    setFilter,
    filteredData,
    paginatedData,
    currentPage,
    setCurrentPage,
    totalPages,
    pageInfo,
    resetAll,
    totalItems
  } = useAdminTableState({
    data: products,
    searchFields: ['name', 'sku', 'category'],
    filterFns: {
      category: (item, val) => item.category.toLowerCase().includes(val.toLowerCase()),
      stockState: (item, val) => {
        if (val === 'in_stock') return item.stockState === 'In Stock';
        if (val === 'low_stock') return item.stockState === 'Low Stock';
        if (val === 'out_of_stock') return item.stockState === 'Out of Stock';
        return true;
      },
      status: (item, val) => item.status.toLowerCase() === val.toLowerCase(),
    },
    defaultPageSize: 10
  });

  const [view, setView] = React.useState<'list' | 'grid'>('list');

  const defaultAdvFilters = { price: 'all', sales: 'all', views: 'all' };
  const [isAdvFilterOpen, setIsAdvFilterOpen] = React.useState(false);
  const [draftAdvFilters, setDraftAdvFilters] = React.useState(defaultAdvFilters);
  const [appliedAdvFilters, setAppliedAdvFilters] = React.useState(defaultAdvFilters);

  const activeFilterCount = Object.values(appliedAdvFilters).filter(v => v !== 'all').length;

  const handleApplyAdvFilters = () => {
    setAppliedAdvFilters(draftAdvFilters);
    setIsAdvFilterOpen(false);
  };

  const handleResetAdvFilters = () => {
    setDraftAdvFilters(defaultAdvFilters);
  };

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
        <div className={styles.headerActions}>
          <button 
            className={`${styles.btnOutline} ${isInventoryMode ? styles.activeInventoryBtn : ''}`} 
            title="Inventory Mode"
            onClick={() => setIsInventoryMode(!isInventoryMode)}
          >
            <Package className={styles.btnIcon} /> <span className={styles.hideMobile}>Inventory Mode</span>
          </button>
          <Link to="/admin/products/add" className={styles.addBtn} style={{ textDecoration: 'none' }}>
            <Plus size={18} strokeWidth={2.5} />
            Add Product
          </Link>
        </div>
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
            <button 
              className={styles.btnOutline} 
              title="Export Selected" 
              style={{ padding: '8px' }}
              onClick={() => exportToCSV(products.filter(p => selectedItems.includes(p.sku)), 'products-selected')}
            >
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
            <input 
              type="text" 
              placeholder="Search products by name or SKU..." 
              className={styles.searchInput} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className={styles.filtersScrollContainer}>
            <CustomSelect
              options={categoryOptions}
              value={activeFilters.category || 'all'}
              onChange={(val) => setFilter('category', val)}
              className={styles.filterSelect}
              variant="pink"
            />
            <CustomSelect
              options={stockOptions}
              value={activeFilters.stockState || 'all'}
              onChange={(val) => setFilter('stockState', val)}
              className={styles.filterSelect}
              variant="turquoise"
            />
            <CustomSelect
              options={statusOptions}
              value={activeFilters.status || 'all'}
              onChange={(val) => setFilter('status', val)}
              className={styles.filterSelect}
              variant="yellow"
            />
          </div>
  
          <div className={styles.actionButtons}>
            <button className={styles.btnOutline} title="Filters" onClick={() => setIsAdvFilterOpen(true)}>
              <Filter className={styles.btnIcon} /> <span className={styles.hideMobile}>Filters</span>
              {activeFilterCount > 0 && <span className={styles.filterBadge}>{activeFilterCount}</span>}
            </button>
  
            <button 
              className={styles.btnOutline} 
              title="Export"
              onClick={() => exportToCSV(filteredData, 'products-export')}
            >
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
        {statsData.map((stat: any) => {
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
                    <input type="checkbox" className={styles.checkbox} aria-label="Select all" checked={selectedItems.length === paginatedData.length && paginatedData.length > 0} onChange={(e) => setSelectedItems(e.target.checked ? paginatedData.map(p => p.sku) : [])} />
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
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--color-text-muted)' }}>
                      {searchTerm || Object.keys(activeFilters).length > 0 ? (
                        <>
                          <p>No products found matching your search or filters.</p>
                          <button 
                            className={styles.btnOutline} 
                            style={{ margin: '16px auto 0' }}
                            onClick={resetAll}
                          >
                            Clear Filters
                          </button>
                        </>
                      ) : (
                        <p>No products available.</p>
                      )}
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((product, idx) => {
                    const badgeClass = styles[product.category.toLowerCase()] || '';
                  const stockStateClass = product.stockState === 'In Stock' ? styles.inStock : 
                                         product.stockState === 'Low Stock' ? styles.lowStock : styles.outOfStock;
                  const statusClass = product.status === 'Active' ? styles.active : styles.inactive;

                  return (
                    <tr key={idx} className={product.status === 'Inactive' ? styles.inactiveRow : ''}>
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
                        {isInventoryMode ? (
                          <div className={styles.inventoryInputWrapper}>
                            <input 
                              type="number" 
                              className={styles.inventoryInput} 
                              value={product.stock} 
                              onChange={(e) => handleStockUpdate(product.sku, parseInt(e.target.value) || 0)}
                              min="0"
                            />
                            <div className={`${styles.stockStatus} ${stockStateClass}`} style={{marginTop: 0}}>{product.stockState}</div>
                          </div>
                        ) : (
                          <>
                            <div className={styles.cellText}>{product.stock} in stock</div>
                            <div className={`${styles.stockStatus} ${stockStateClass}`}>{product.stockState}</div>
                          </>
                        )}
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
                            className={deleteBtnStyles.deleteBtn} 
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
                          <ActionDropdown actions={[
      { label: 'View Details', icon: Eye, onClick: () => setSelectedProductDetails(product) },
      ...(product.status === 'Active' ? [{ label: 'Update Stock', icon: Package }] : []),
      { 
        label: product.status === 'Active' ? 'Deactivate Product' : 'Activate Product', 
        icon: product.status === 'Active' ? PowerOff : Power, 
        variant: product.status === 'Active' ? 'danger' : 'success',
        onClick: () => toggleProductStatus(product.sku)
      }
    ]} />
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
              </tbody>
            </table>
          </div>
        )}

        {view === 'grid' && (
          <div className={styles.itemsGrid}>
            {filteredData.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '48px 24px', color: 'var(--color-text-muted)' }}>
                {searchTerm || Object.keys(activeFilters).length > 0 ? (
                  <>
                    <p>No products found matching your search or filters.</p>
                    <button 
                      className={styles.btnOutline} 
                      style={{ margin: '16px auto 0' }}
                      onClick={resetAll}
                    >
                      Clear Filters
                    </button>
                  </>
                ) : (
                  <p>No products available.</p>
                )}
              </div>
            ) : (
              paginatedData.map((product, idx) => {
              const badgeClass = styles[product.category.toLowerCase()] || '';
              const stockStateClass = product.stockState === 'In Stock' ? styles.inStock : 
                                     product.stockState === 'Low Stock' ? styles.lowStock : styles.outOfStock;
              const statusClass = product.status === 'Active' ? styles.active : styles.inactive;

              return (
                <div key={`grid-${idx}`} className={`${styles.gridCard} ${product.status === 'Inactive' ? styles.inactiveCard : ''}`}>
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
                    <span className={styles.cellText}>{product.price} <span className={styles.cellSubtext}>| {isInventoryMode ? <input type="number" className={styles.inventoryInput} style={{padding: '2px 4px'}} value={product.stock} onChange={(e) => handleStockUpdate(product.sku, parseInt(e.target.value) || 0)} min="0" /> : product.stock} (<span className={`${styles.stockStatus} ${stockStateClass}`}>{product.stockState}</span>)</span></span>
                  </div>

                  <div className={styles.mobileCardRow}>
                    <span className={styles.mobileCardLabel}>Sales / Views:</span>
                    <span className={styles.cellText}>{product.sales} <span className={styles.cellSubtext}>/ {product.views}</span></span>
                  </div>

                  <div className={styles.mobileCardRow}>
                    <span className={styles.mobileCardLabel}>Actions:</span>
                    <div className={styles.actionsCell}>
                      <button 
                        className={deleteBtnStyles.deleteBtn} 
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
                      <ActionDropdown actions={[
      { label: 'View Details', icon: Eye, onClick: () => setSelectedProductDetails(product) },
      ...(product.status === 'Active' ? [{ label: 'Update Stock', icon: Package }] : []),
      { 
        label: product.status === 'Active' ? 'Deactivate Product' : 'Activate Product', 
        icon: product.status === 'Active' ? PowerOff : Power, 
        variant: product.status === 'Active' ? 'danger' : 'success',
        onClick: () => toggleProductStatus(product.sku)
      }
    ]} />
                    </div>
                  </div>
                </div>
              )
            })
          )}
          </div>
        )}

        {/* Mobile View */}
        <div className={styles.mobileCards} style={{ display: view === 'list' ? 'none' : '' }}>
          {filteredData.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--color-text-muted)' }}>
              {searchTerm || Object.keys(activeFilters).length > 0 ? (
                <>
                  <p>No products found matching your search or filters.</p>
                  <button 
                    className={styles.btnOutline} 
                    style={{ margin: '16px auto 0' }}
                    onClick={resetAll}
                  >
                    Clear Filters
                  </button>
                </>
              ) : (
                <p>No products available.</p>
              )}
            </div>
          ) : (
            paginatedData.map((product, idx) => {
            const badgeClass = styles[product.category.toLowerCase()] || '';
            const stockStateClass = product.stockState === 'In Stock' ? styles.inStock : 
                                   product.stockState === 'Low Stock' ? styles.lowStock : styles.outOfStock;
            const statusClass = product.status === 'Active' ? styles.active : styles.inactive;

            return (
              <div key={idx} className={`${styles.mobileCard} ${product.status === 'Inactive' ? styles.inactiveCard : ''}`}>
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
                  <span className={styles.cellText}>{product.price} <span className={styles.cellSubtext}>| {isInventoryMode ? <input type="number" className={styles.inventoryInput} style={{padding: '2px 4px'}} value={product.stock} onChange={(e) => handleStockUpdate(product.sku, parseInt(e.target.value) || 0)} min="0" /> : product.stock} (<span className={`${styles.stockStatus} ${stockStateClass}`}>{product.stockState}</span>)</span></span>
                </div>

                <div className={styles.mobileCardRow}>
                  <span className={styles.mobileCardLabel}>Sales / Views:</span>
                  <span className={styles.cellText}>{product.sales} <span className={styles.cellSubtext}>/ {product.views}</span></span>
                </div>

                <div className={styles.mobileCardRow}>
                  <span className={styles.mobileCardLabel}>Actions:</span>
                  <div className={styles.actionsCell}>
                    <button 
                      className={deleteBtnStyles.deleteBtn} 
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
                      <ActionDropdown actions={[
      { label: 'View Details', icon: Eye, onClick: () => setSelectedProductDetails(product) },
      ...(product.status === 'Active' ? [{ label: 'Update Stock', icon: Package }] : []),
      { 
        label: product.status === 'Active' ? 'Deactivate Product' : 'Activate Product', 
        icon: product.status === 'Active' ? PowerOff : Power, 
        variant: product.status === 'Active' ? 'danger' : 'success',
        onClick: () => toggleProductStatus(product.sku)
      }
    ]} />
                  </div>
                </div>
              </div>
            )
          })
        )}
        </div>

        {totalPages > 0 && (
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
    
      {isConfirmModalOpen && createPortal(
        <div className="animate-fade-in" style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} onClick={() => setIsConfirmModalOpen(false)}></div>
          <div className="animate-slide-up" style={{ position: 'relative', backgroundColor: 'white', padding: '24px', borderRadius: '12px', maxWidth: '400px', width: '90%', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
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

      <ProductDetailsModal product={selectedProductDetails} onClose={() => setSelectedProductDetails(null)} />

      <AdminFilterModal
        isOpen={isAdvFilterOpen}
        onClose={() => {
          setIsAdvFilterOpen(false);
          setDraftAdvFilters(appliedAdvFilters); // reset draft to applied on close
        }}
        onApply={handleApplyAdvFilters}
        onReset={handleResetAdvFilters}
      >
        <div className={filterModalStyles.filterGroup}>
          <span className={filterModalStyles.filterLabel}>Price Range</span>
          <div className={filterModalStyles.bracketGrid}>
            {[
              { value: 'all', label: 'Any' },
              { value: '0-50', label: 'Up to ₹50' },
              { value: '50-100', label: '₹50 - ₹100' },
              { value: '100+', label: 'Over ₹100' },
            ].map(opt => (
              <button
                key={opt.value}
                className={`${filterModalStyles.bracketBtn} ${draftAdvFilters.price === opt.value ? filterModalStyles.active : ''}`}
                onClick={() => setDraftAdvFilters(prev => ({ ...prev, price: opt.value }))}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className={filterModalStyles.filterGroup}>
          <span className={filterModalStyles.filterLabel}>Sales Range</span>
          <div className={filterModalStyles.bracketGrid}>
            {[
              { value: 'all', label: 'Any' },
              { value: '0-500', label: '0 - 500' },
              { value: '500-2000', label: '500 - 2,000' },
              { value: '2000+', label: '2,000+' },
            ].map(opt => (
              <button
                key={opt.value}
                className={`${filterModalStyles.bracketBtn} ${draftAdvFilters.sales === opt.value ? filterModalStyles.active : ''}`}
                onClick={() => setDraftAdvFilters(prev => ({ ...prev, sales: opt.value }))}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className={filterModalStyles.filterGroup}>
          <span className={filterModalStyles.filterLabel}>Views Range</span>
          <div className={filterModalStyles.bracketGrid}>
            {[
              { value: 'all', label: 'Any' },
              { value: '0-5000', label: '0 - 5,000' },
              { value: '5000-20000', label: '5k - 20k' },
              { value: '20000+', label: '20k+' },
            ].map(opt => (
              <button
                key={opt.value}
                className={`${filterModalStyles.bracketBtn} ${draftAdvFilters.views === opt.value ? filterModalStyles.active : ''}`}
                onClick={() => setDraftAdvFilters(prev => ({ ...prev, views: opt.value }))}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </AdminFilterModal>
    </div>
  )
}
