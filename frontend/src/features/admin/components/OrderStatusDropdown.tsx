import React, { useState, useRef, useEffect, useCallback, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check } from 'lucide-react';
import styles from './OrderStatusDropdown.module.css';

export interface OrderStatusOption {
  value: string;
  label: string;
  dotColor?: string;
}

export const DEFAULT_ORDER_STATUS_OPTIONS: OrderStatusOption[] = [
  { value: 'Pending', label: 'Pending', dotColor: '#F59E0B' },
  { value: 'Confirmed', label: 'Confirmed', dotColor: '#3B82F6' },
  { value: 'Being Baked', label: 'Being Baked', dotColor: '#EC4899' },
  { value: 'Dispatched', label: 'Dispatched', dotColor: '#8B5CF6' },
  { value: 'Delivered', label: 'Delivered', dotColor: '#10B981' },
  { value: 'Cancelled', label: 'Cancelled', dotColor: '#EF4444' },
];

export const STATUS_THEMES: Record<string, {
  label: string;
  dotColor: string;
  bgLight: string;
  borderColor: string;
  textColor: string;
  pulse?: boolean;
}> = {
  pending: {
    label: 'Pending',
    dotColor: '#F59E0B',
    bgLight: '#FFFBEB',
    borderColor: '#FDE68A',
    textColor: '#B45309',
    pulse: true,
  },
  confirmed: {
    label: 'Confirmed',
    dotColor: '#3B82F6',
    bgLight: '#EFF6FF',
    borderColor: '#BFDBFE',
    textColor: '#1D4ED8',
    pulse: false,
  },
  'being baked': {
    label: 'Being Baked',
    dotColor: '#EC4899',
    bgLight: '#FDF2F8',
    borderColor: '#FBCFE8',
    textColor: '#BE185D',
    pulse: true,
  },
  processing: {
    label: 'Being Baked',
    dotColor: '#EC4899',
    bgLight: '#FDF2F8',
    borderColor: '#FBCFE8',
    textColor: '#BE185D',
    pulse: true,
  },
  dispatched: {
    label: 'Dispatched',
    dotColor: '#8B5CF6',
    bgLight: '#F5F3FF',
    borderColor: '#DDD6FE',
    textColor: '#6D28D9',
    pulse: true,
  },
  shipped: {
    label: 'Dispatched',
    dotColor: '#8B5CF6',
    bgLight: '#F5F3FF',
    borderColor: '#DDD6FE',
    textColor: '#6D28D9',
    pulse: true,
  },
  delivered: {
    label: 'Delivered',
    dotColor: '#10B981',
    bgLight: '#ECFDF5',
    borderColor: '#A7F3D0',
    textColor: '#047857',
    pulse: false,
  },
  cancelled: {
    label: 'Cancelled',
    dotColor: '#EF4444',
    bgLight: '#FEF2F2',
    borderColor: '#FECACA',
    textColor: '#DC2626',
    pulse: false,
  },
};

export const normalizeStatusKey = (status: string): string => {
  const s = (status || '').toLowerCase().trim();
  if (s === 'completed' || s === 'otp_verified') return 'delivered';
  if (s === 'ready_for_pickup') return 'being baked';
  if (s === 'out_for_delivery' || s === 'picked_up') return 'dispatched';
  if (s === 'order confirmed') return 'confirmed';
  return s;
};

export interface OrderStatusDropdownProps {
  value: string;
  onChange: (newStatus: string) => void;
  options?: OrderStatusOption[];
  disabled?: boolean;
  isLoading?: boolean;
  variant?: 'badge' | 'card' | 'timeline';
  className?: string;
  menuPlacement?: 'auto' | 'top' | 'bottom';
  align?: 'left' | 'right';
  title?: string;
  leftIcon?: React.ReactNode;
  onPendingClick?: (e: React.MouseEvent) => void;
  onDisabledClick?: (e: React.MouseEvent) => void;
}

export function OrderStatusDropdown({
  value,
  onChange,
  options = DEFAULT_ORDER_STATUS_OPTIONS,
  disabled = false,
  isLoading = false,
  variant = 'badge',
  className = '',
  menuPlacement = 'auto',
  align = 'left',
  title = 'Click to change order status',
  leftIcon,
  onPendingClick,
  onDisabledClick,
}: OrderStatusDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [menuStyles, setMenuStyles] = useState<React.CSSProperties>({});
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const normalizedKey = normalizeStatusKey(value);
  const theme = STATUS_THEMES[normalizedKey] || {
    label: value || 'Pending',
    dotColor: '#F59E0B',
    bgLight: '#FFFBEB',
    borderColor: '#FDE68A',
    textColor: '#B45309',
    pulse: true,
  };

  // Find active option
  const activeOption = options.find(
    (opt) =>
      opt.value.toLowerCase() === (value || '').toLowerCase() ||
      opt.label.toLowerCase() === (value || '').toLowerCase() ||
      normalizeStatusKey(opt.value) === normalizedKey
  );

  const displayLabel = activeOption ? activeOption.label : theme.label;
  const currentDotColor = activeOption?.dotColor || theme.dotColor;

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    const expectedHeight = Math.min(options.length * 36 + 12, 280);

    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;

    const isTop =
      menuPlacement === 'top' ||
      (menuPlacement === 'auto' && spaceBelow < expectedHeight && spaceAbove > spaceBelow);

    const menuTop = isTop
      ? Math.max(8, rect.top - expectedHeight - 4)
      : Math.min(viewportHeight - expectedHeight - 8, rect.bottom + 4);

    const targetWidth = variant === 'card' ? rect.width : Math.max(160, rect.width);
    let menuLeft = align === 'right' ? rect.right - targetWidth : rect.left;

    if (menuLeft + targetWidth > viewportWidth - 8) {
      menuLeft = Math.max(8, viewportWidth - targetWidth - 8);
    }
    if (menuLeft < 8) {
      menuLeft = 8;
    }

    setMenuStyles({
      position: 'fixed',
      top: `${Math.round(menuTop)}px`,
      left: `${Math.round(menuLeft)}px`,
      width: `${Math.round(targetWidth)}px`,
      minWidth: `${Math.round(targetWidth)}px`,
      maxHeight: `${Math.min(290, isTop ? spaceAbove - 16 : spaceBelow - 16)}px`,
      zIndex: 99999,
    });
  }, [options.length, menuPlacement, align, variant]);

  useLayoutEffect(() => {
    if (isOpen) {
      updatePosition();
    }
  }, [isOpen, updatePosition]);

  useEffect(() => {
    if (!isOpen) return;

    const handleScrollOrResize = () => {
      updatePosition();
    };

    window.addEventListener('resize', handleScrollOrResize, { passive: true });
    window.addEventListener('scroll', handleScrollOrResize, { capture: true, passive: true });
    return () => {
      window.removeEventListener('resize', handleScrollOrResize);
      window.removeEventListener('scroll', handleScrollOrResize, { capture: true });
    };
  }, [isOpen, updatePosition]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        triggerRef.current &&
        !triggerRef.current.contains(target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const isPending = normalizedKey === 'pending';
  const hasSpecialHandler = Boolean((isPending && onPendingClick) || (disabled && onDisabledClick));

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLoading) return;
    if (isPending && onPendingClick) {
      onPendingClick(e);
      return;
    }
    if (disabled) {
      if (onDisabledClick) onDisabledClick(e);
      return;
    }
    setIsOpen(!isOpen);
  };

  const handleSelectOption = (optValue: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(false);
    if (optValue !== value) {
      onChange(optValue);
    }
  };

  let triggerElement: React.ReactNode = null;

  if (variant === 'badge') {
    triggerElement = (
      <button
        ref={triggerRef}
        type="button"
        className={`${styles.badgeTrigger} ${(disabled && !hasSpecialHandler) || isLoading ? styles.triggerDisabled : ''}`}
        style={{
          backgroundColor: theme.bgLight,
          color: theme.textColor,
          borderColor: theme.borderColor,
          cursor: hasSpecialHandler ? 'pointer' : undefined,
        }}
        onClick={handleToggle}
        disabled={isLoading || (disabled && !hasSpecialHandler)}
        title={isPending && onPendingClick ? 'Order Pending — Click to approve or cancel' : title}
        aria-expanded={isOpen}
      >
        {isLoading ? (
          <span className={styles.spinner} style={{ color: theme.textColor }} />
        ) : (
          <span
            className={`${styles.dot} ${theme.pulse ? styles.dotPulse : ''}`}
            style={{ backgroundColor: currentDotColor }}
          />
        )}
        <span className={styles.triggerLabel}>{displayLabel}</span>
        <ChevronDown
          size={12}
          className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`}
          style={{ color: theme.textColor }}
        />
      </button>
    );
  } else if (variant === 'card') {
    triggerElement = (
      <button
        ref={triggerRef}
        type="button"
        className={`${styles.cardTrigger} ${(disabled && !hasSpecialHandler) || isLoading ? styles.triggerDisabled : ''}`}
        style={{ cursor: hasSpecialHandler ? 'pointer' : undefined }}
        onClick={handleToggle}
        disabled={isLoading || (disabled && !hasSpecialHandler)}
        title={isPending && onPendingClick ? 'Order Pending — Click to approve or cancel' : title}
        aria-expanded={isOpen}
      >
        <div className={styles.triggerTextGroup}>
          {isLoading ? (
            <span className={styles.spinner} style={{ color: 'var(--admin-pink, #F20D6F)' }} />
          ) : (
            <span
              className={`${styles.dot} ${theme.pulse ? styles.dotPulse : ''}`}
              style={{ backgroundColor: currentDotColor }}
            />
          )}
          <span className={styles.triggerLabel}>{displayLabel}</span>
        </div>
        <ChevronDown
          size={13}
          className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`}
        />
      </button>
    );
  } else {
    // 'timeline' variant
    triggerElement = (
      <button
        ref={triggerRef}
        type="button"
        className={`${styles.timelineTrigger} ${(disabled && !hasSpecialHandler) || isLoading ? styles.triggerDisabled : ''}`}
        style={{ cursor: hasSpecialHandler ? 'pointer' : undefined }}
        onClick={handleToggle}
        disabled={isLoading || (disabled && !hasSpecialHandler)}
        title={isPending && onPendingClick ? 'Order Pending — Click to approve or cancel' : title}
        aria-expanded={isOpen}
      >
        <div className={styles.triggerTextGroup}>
          {leftIcon}
          {isLoading ? (
            <span className={styles.spinner} style={{ color: 'var(--admin-pink, #F20D6F)' }} />
          ) : (
            <span
              className={`${styles.dot} ${theme.pulse ? styles.dotPulse : ''}`}
              style={{ backgroundColor: currentDotColor }}
            />
          )}
          <span className={styles.triggerLabel}>{displayLabel}</span>
        </div>
        <ChevronDown
          size={14}
          className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`}
        />
      </button>
    );
  }

  const isContainerBlock = variant === 'card';

  return (
    <div
      className={`${isContainerBlock ? styles.containerBlock : styles.container} ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      {triggerElement}

      {isOpen &&
        createPortal(
          <div
            ref={dropdownRef}
            className={styles.dropdown}
            style={menuStyles}
            role="listbox"
            aria-label="Order status options"
            onClick={(e) => e.stopPropagation()}
          >
            {options.map((option) => {
              const isSelected =
                option.value.toLowerCase() === (value || '').toLowerCase() ||
                option.label.toLowerCase() === (value || '').toLowerCase() ||
                normalizeStatusKey(option.value) === normalizedKey;

              const optKey = normalizeStatusKey(option.value);
              const optTheme = STATUS_THEMES[optKey] || {
                dotColor: option.dotColor || '#9CA3AF',
              };

              return (
                <button
                  key={option.value}
                  type="button"
                  className={`${styles.option} ${isSelected ? styles.optionSelected : ''}`}
                  onClick={(e) => handleSelectOption(option.value, e)}
                  role="option"
                  aria-selected={isSelected}
                >
                  <div className={styles.optionContent}>
                    <span
                      className={styles.dot}
                      style={{ backgroundColor: option.dotColor || optTheme.dotColor }}
                    />
                    <span className={styles.optionLabel}>{option.label}</span>
                  </div>
                  {isSelected && (
                    <Check size={14} className={styles.checkmark} strokeWidth={2.5} />
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
