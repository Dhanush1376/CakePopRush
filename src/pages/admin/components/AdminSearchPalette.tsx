import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Search, LayoutDashboard, ShoppingCart, Users, Package, Star, Settings, ClipboardList, BarChart2, Ticket, Bell, HelpCircle, CornerDownLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import styles from './AdminSearchPalette.module.css';

interface AdminSearchPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

const searchItems = [
  { id: 'dashboard', title: 'Dashboard Overview', subtitle: 'Navigation section', icon: LayoutDashboard, path: '/admin' },
  { id: 'orders', title: 'Orders Management', subtitle: 'Navigation section', icon: ShoppingCart, path: '/admin/orders' },
  { id: 'customers', title: 'Customers Directory', subtitle: 'Navigation section', icon: Users, path: '/admin/customers' },
  { id: 'products', title: 'Catalog Products', subtitle: 'Navigation section', icon: Package, path: '/admin/products' },
  { id: 'reviews', title: 'Product Reviews', subtitle: 'Navigation section', icon: Star, path: '/admin/reviews' },
  { id: 'analytics', title: 'Analytics & Reports', subtitle: 'Navigation section', icon: BarChart2, path: '/admin/analytics' },
  { id: 'coupons', title: 'Coupons & Offers', subtitle: 'Navigation section', icon: Ticket, path: '/admin/coupons' },
  { id: 'custom-orders', title: 'Custom Orders', subtitle: 'Navigation section', icon: ClipboardList, path: '/admin/custom-orders' },
  { id: 'notifications', title: 'System Notifications', subtitle: 'Navigation section', icon: Bell, path: '/admin/notifications' },
  { id: 'settings', title: 'Admin Settings', subtitle: 'Navigation section', icon: Settings, path: '/admin/settings' },
  { id: 'support', title: 'Help & Support', subtitle: 'Navigation section', icon: HelpCircle, path: '/admin/support' },
];

export function AdminSearchPalette({ isOpen, onClose }: AdminSearchPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const filteredItems = searchItems.filter(item => 
    item.title.toLowerCase().includes(query.toLowerCase()) || 
    item.subtitle.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev < filteredItems.length - 1 ? prev + 1 : prev));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          navigate(filteredItems[selectedIndex].path);
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredItems, selectedIndex, navigate, onClose]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  if (!isOpen) return null;

  return createPortal(
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.paletteContainer} onClick={e => e.stopPropagation()}>
        {/* Search Input Header */}
        <div className={styles.header}>
          <Search size={22} className={styles.searchIcon} />
          <input
            ref={inputRef}
            type="text"
            className={styles.searchInput}
            placeholder="Search pages, orders, products, clients..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className={styles.escBadge}>ESC</div>
        </div>

        {/* Results List */}
        <div className={styles.resultsList}>
          {filteredItems.length > 0 ? (
            filteredItems.map((item, index) => {
              const isSelected = index === selectedIndex;
              const Icon = item.icon;
              return (
                <div 
                  key={item.id}
                  className={`${styles.resultItem} ${isSelected ? styles.selected : ''}`}
                  onMouseEnter={() => setSelectedIndex(index)}
                  onClick={() => {
                    navigate(item.path);
                    onClose();
                  }}
                >
                  <div className={`${styles.iconWrapper} ${isSelected ? styles.iconSelected : ''}`}>
                    <Icon size={20} strokeWidth={2} />
                  </div>
                  <div className={styles.itemInfo}>
                    <span className={styles.itemTitle}>{item.title}</span>
                    <span className={styles.itemSubtitle}>{item.subtitle}</span>
                  </div>
                  {isSelected && (
                    <CornerDownLeft size={20} className={styles.enterIcon} />
                  )}
                </div>
              );
            })
          ) : (
            <div className={styles.noResults}>
              No results found for "{query}"
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <div className={styles.shortcuts}>
            <div className={styles.shortcutGroup}>
              <span className={styles.keyIcon}>↑↓</span>
              <span className={styles.shortcutLabel}>NAVIGATE</span>
            </div>
            <div className={styles.shortcutGroup}>
              <span className={styles.keyIcon}>↵</span>
              <span className={styles.shortcutLabel}>SELECT</span>
            </div>
          </div>
          <div className={styles.footerBrand}>ADMIN SEARCH PALETTE</div>
        </div>
      </div>
    </div>,
    document.body
  );
}
