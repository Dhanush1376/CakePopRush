import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check } from 'lucide-react';
import styles from './CustomOrderStatusDropdown.module.css';

export interface StatusOption {
  value: string;
  label: string;
  dot: string;
}

export const ORDER_STATUS_OPTIONS: StatusOption[] = [
  { value: 'Pending Quote', label: 'PENDING', dot: '#F59E0B' },
  { value: 'Quoted', label: 'QUOTED', dot: '#3B82F6' },
  { value: 'Approved', label: 'APPROVED', dot: '#10B981' },
  { value: 'In Progress', label: 'IN PROGRESS', dot: '#6366F1' },
  { value: 'Completed', label: 'COMPLETED', dot: '#22C55E' },
  { value: 'Rejected', label: 'REJECTED', dot: '#EF4444' },
];

interface CustomOrderStatusDropdownProps {
  status: string;
  onChange: (newStatus: string) => void;
  fullWidth?: boolean;
  size?: 'sm' | 'md';
  disabled?: boolean;
  className?: string;
}

export function CustomOrderStatusDropdown({
  status,
  onChange,
  fullWidth = false,
  size = 'md',
  disabled = false,
  className = '',
}: CustomOrderStatusDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number; width: number }>({ top: 0, left: 0, width: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Find current option matching status string
  const currentOption = ORDER_STATUS_OPTIONS.find(opt => {
    const s = (status || '').toLowerCase().trim();
    const optVal = opt.value.toLowerCase();
    const optLbl = opt.label.toLowerCase();
    return s === optVal || s === optLbl || optVal.includes(s) || s.includes(optVal);
  }) || ORDER_STATUS_OPTIONS[0];

  const updatePosition = useCallback(() => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const menuWidth = Math.max(rect.width, 165);
    const spaceBelow = window.innerHeight - rect.bottom;
    const estimatedHeight = ORDER_STATUS_OPTIONS.length * 36 + 40;

    let top = rect.bottom + 6;
    if (spaceBelow < estimatedHeight && rect.top > estimatedHeight) {
      top = rect.top - estimatedHeight - 6;
    }

    let left = rect.left;
    if (left + menuWidth > window.innerWidth - 12) {
      left = Math.max(12, rect.right - menuWidth);
    }

    setCoords({ top, left, width: menuWidth });
  }, []);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    if (!isOpen) {
      updatePosition();
    }
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        menuRef.current && !menuRef.current.contains(target) &&
        buttonRef.current && !buttonRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    const handleScrollOrResize = () => {
      setIsOpen(false);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div 
      className={`${styles.dropdownWrapper} ${fullWidth ? styles.fullWidth : ''} ${className}`} 
      onClick={(e) => e.stopPropagation()}
    >
      <button
        ref={buttonRef}
        type="button"
        className={`${styles.trigger} ${size === 'sm' ? styles.triggerSm : ''} ${isOpen ? styles.triggerOpen : ''}`}
        onClick={handleToggle}
        disabled={disabled}
        aria-expanded={isOpen}
        aria-label={`Order status: ${currentOption.label}`}
        title="Click to update status"
      >
        <div className={styles.triggerLeft}>
          <span 
            className={styles.statusDot} 
            style={{ backgroundColor: currentOption.dot }} 
          />
          <span className={styles.triggerLabel}>
            {currentOption.label}
          </span>
        </div>
        <ChevronDown 
          size={size === 'sm' ? 12 : 14} 
          className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`} 
        />
      </button>

      {isOpen && createPortal(
        <div
          ref={menuRef}
          className={styles.portalMenu}
          style={{
            top: `${coords.top}px`,
            left: `${coords.left}px`,
            width: `${coords.width}px`,
          }}
          onClick={(e) => e.stopPropagation()}
          role="listbox"
        >
          <div className={styles.menuHeader}>Status</div>
          {ORDER_STATUS_OPTIONS.map((opt) => {
            const isSelected = opt.value === currentOption.value;
            return (
              <button
                key={opt.value}
                type="button"
                className={`${styles.menuItem} ${isSelected ? styles.menuItemSelected : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                role="option"
                aria-selected={isSelected}
              >
                <div className={styles.itemLeft}>
                  <span 
                    className={styles.itemDot} 
                    style={{ backgroundColor: opt.dot }} 
                  />
                  <span className={styles.itemLabel}>
                    {opt.label}
                  </span>
                </div>
                {isSelected && (
                  <Check size={14} className={styles.checkIcon} style={{ color: opt.dot }} />
                )}
              </button>
            );
          })}
        </div>,
        document.body
      )}
    </div>
  );
}
