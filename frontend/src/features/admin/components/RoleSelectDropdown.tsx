import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check } from 'lucide-react';
import styles from './RoleSelectDropdown.module.css';

export interface RoleOption {
  value: string;
  label: string;
  weight?: number;
}

interface RoleSelectDropdownProps {
  currentRole: string; // e.g. 'super_admin' | 'admin' | 'editor' | 'viewer'
  currentRoleLabel: string; // e.g. 'Super Admin' | 'Administrator' | 'Editor' | 'Viewer'
  options: RoleOption[];
  onSelect: (roleValue: string) => void;
  disabled?: boolean;
  isLoading?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  ariaLabel?: string;
}

export function RoleSelectDropdown({
  currentRole,
  currentRoleLabel,
  options,
  onSelect,
  disabled = false,
  isLoading = false,
  size = 'md',
  className = '',
  ariaLabel = 'Select role'
}: RoleSelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number; width: number }>({ top: 0, left: 0, width: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const getRoleTheme = (roleValue: string, roleLabel: string) => {
    const norm = (roleValue || roleLabel || '').toLowerCase();
    if (norm.includes('super')) {
      return {
        className: styles.themeSuperAdmin,
        dotColor: '#F20D6F',
      };
    }
    if (norm.includes('admin')) {
      return {
        className: styles.themeAdmin,
        dotColor: '#00B4D8',
      };
    }
    if (norm.includes('editor')) {
      return {
        className: styles.themeEditor,
        dotColor: '#9C27B0',
      };
    }
    return {
      className: styles.themeViewer,
      dotColor: '#F59E0B',
    };
  };

  const currentTheme = getRoleTheme(currentRole, currentRoleLabel);

  const updatePosition = useCallback(() => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const menuWidth = Math.max(rect.width, 185);
    const spaceBelow = window.innerHeight - rect.bottom;
    const estimatedHeight = options.length * 42 + 36;

    let top = rect.bottom + 6;
    if (spaceBelow < estimatedHeight && rect.top > estimatedHeight) {
      top = rect.top - estimatedHeight - 6;
    }

    let left = rect.left;
    if (left + menuWidth > window.innerWidth - 12) {
      left = Math.max(12, rect.right - menuWidth);
    }

    setCoords({ top, left, width: menuWidth });
  }, [options.length]);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled || isLoading) return;
    if (!isOpen) {
      updatePosition();
    }
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleScrollOrResize = () => {
      setIsOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
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
    <div className={`${styles.container} ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        className={`${styles.trigger} ${styles[`size-${size}`]} ${currentTheme.className} ${isOpen ? styles.triggerOpen : ''}`}
        onClick={handleToggle}
        disabled={disabled || isLoading}
        aria-expanded={isOpen}
        aria-label={ariaLabel}
        title={disabled ? undefined : 'Click to change role'}
      >
        <div className={styles.triggerContent}>
          <span 
            className={styles.triggerDot} 
            style={{ backgroundColor: currentTheme.dotColor }} 
          />
          <span className={styles.triggerText}>
            {isLoading ? 'Updating...' : currentRoleLabel || currentRole}
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
            minWidth: `${coords.width}px`
          }}
          role="listbox"
          aria-label="Available roles"
        >
          <div className={styles.menuHeader}>Select Role</div>
          {options.map((opt) => {
            const isSelected = opt.value === currentRole;
            const optTheme = getRoleTheme(opt.value, opt.label);

            return (
              <button
                key={opt.value}
                type="button"
                className={`${styles.menuOption} ${isSelected ? styles.optionSelected : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                  if (!isSelected) {
                    onSelect(opt.value);
                  }
                }}
                role="option"
                aria-selected={isSelected}
              >
                <div className={styles.optionLeft}>
                  <span 
                    className={styles.optionDot} 
                    style={{ backgroundColor: optTheme.dotColor }} 
                  />
                  <span className={styles.optionLabel}>{opt.label}</span>
                </div>
                {isSelected && (
                  <Check size={15} className={styles.checkIcon} strokeWidth={2.5} />
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
