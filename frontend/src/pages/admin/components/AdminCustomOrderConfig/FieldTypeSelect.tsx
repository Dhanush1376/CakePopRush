import React, { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  ChevronDown,
  Check,
  Type,
  AlignLeft,
  ListFilter,
  Hash,
  Mail,
  Phone,
  Calendar,
  Image,
  MessageCircle,
  CheckSquare,
  Tag,
  CircleDot,
} from 'lucide-react';
import styles from './FieldTypeSelect.module.css';

export interface FieldTypeOption {
  value: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

export const FIELD_TYPE_OPTIONS: FieldTypeOption[] = [
  { value: 'dropdown', label: 'Dropdown', icon: ListFilter },
  { value: 'text', label: 'Short Text', icon: Type },
  { value: 'textarea', label: 'Long Text', icon: AlignLeft },
  { value: 'number', label: 'Number', icon: Hash },
  { value: 'email', label: 'Email Address', icon: Mail },
  { value: 'phone', label: 'Mobile Number', icon: Phone },
  { value: 'date', label: 'Date Picker', icon: Calendar },
  { value: 'file', label: 'Photo Upload', icon: Image },
  { value: 'whatsapp_chat', label: 'WhatsApp Chat', icon: MessageCircle },
  { value: 'checkbox', label: 'Checkbox', icon: CheckSquare },
  { value: 'multiselect', label: 'Multi-Select Tags', icon: Tag },
  { value: 'radio', label: 'Radio Buttons', icon: CircleDot },
];

interface FieldTypeSelectProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  disabled?: boolean;
}

export const FieldTypeSelect: React.FC<FieldTypeSelectProps> = ({
  value,
  onChange,
  className = '',
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [menuPos, setMenuPos] = useState<{
    top?: number;
    bottom?: number;
    left: number;
    width: number;
    maxHeight: number;
    placement: 'top' | 'bottom';
  }>({
    left: 0,
    width: 200,
    maxHeight: 240,
    placement: 'bottom',
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const selectedOption =
    FIELD_TYPE_OPTIONS.find((opt) => opt.value === value) || FIELD_TYPE_OPTIONS[0];

  const SelectedIcon = selectedOption.icon;

  // Smart placement & portal coordinates calculation
  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;

    const rect = triggerRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    // Available space above and below trigger
    const spaceBelow = viewportHeight - rect.bottom - 12;
    const spaceAbove = rect.top - 12;

    // Prefer downward opening unless space below is tight (< 200px) and space above is greater
    const isTop = spaceBelow < 200 && spaceAbove > spaceBelow;
    const availableSpace = isTop ? spaceAbove : spaceBelow;
    const maxHeight = Math.max(120, Math.min(availableSpace, 280));

    // Ensure comfortable width for icons and labels
    const menuWidth = Math.max(rect.width, 210);

    // Keep menu within viewport horizontal bounds
    let left = rect.left;
    if (left + menuWidth > viewportWidth - 12) {
      left = Math.max(12, rect.right - menuWidth);
    }

    setMenuPos({
      top: isTop ? undefined : Math.round(rect.bottom + 4),
      bottom: isTop ? Math.round(viewportHeight - rect.top + 4) : undefined,
      left: Math.round(left),
      width: Math.round(menuWidth),
      maxHeight: Math.round(maxHeight),
      placement: isTop ? 'top' : 'bottom',
    });
  }, []);

  useLayoutEffect(() => {
    if (isOpen) {
      updatePosition();
    }
  }, [isOpen, updatePosition]);

  // Scroll active option into view when opened
  useLayoutEffect(() => {
    if (isOpen && menuRef.current) {
      const selectedEl = menuRef.current.querySelector<HTMLElement>('[aria-selected="true"]');
      if (selectedEl) {
        selectedEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        triggerRef.current &&
        !triggerRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    const handleScrollOrResize = () => {
      if (!triggerRef.current) return;
      const rect = triggerRef.current.getBoundingClientRect();
      // If trigger scrolled entirely out of view, dismiss dropdown
      if (rect.bottom < 0 || rect.top > window.innerHeight) {
        setIsOpen(false);
      } else {
        updatePosition();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, updatePosition]);

  const handleSelectOption = (optVal: string) => {
    onChange(optVal);
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  const handleTriggerKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const currentIndex = FIELD_TYPE_OPTIONS.findIndex((opt) => opt.value === value);
      const nextIndex = (currentIndex + 1) % FIELD_TYPE_OPTIONS.length;
      onChange(FIELD_TYPE_OPTIONS[nextIndex].value);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const currentIndex = FIELD_TYPE_OPTIONS.findIndex((opt) => opt.value === value);
      const prevIndex = (currentIndex - 1 + FIELD_TYPE_OPTIONS.length) % FIELD_TYPE_OPTIONS.length;
      onChange(FIELD_TYPE_OPTIONS[prevIndex].value);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className={`${styles.container} ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        className={`${styles.trigger} ${isOpen ? styles.isOpen : ''}`}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        onKeyDown={handleTriggerKeyDown}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className={styles.triggerLeft}>
          <SelectedIcon size={14} className={styles.triggerIcon} />
          <span className={styles.triggerText}>{selectedOption.label}</span>
        </div>
        <ChevronDown
          size={14}
          className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`}
        />
      </button>

      {isOpen &&
        createPortal(
          <div
            ref={menuRef}
            className={`${styles.menu} ${
              menuPos.placement === 'top' ? styles.menuTop : styles.menuBottom
            }`}
            style={{
              top: menuPos.top !== undefined ? `${menuPos.top}px` : 'auto',
              bottom: menuPos.bottom !== undefined ? `${menuPos.bottom}px` : 'auto',
              left: `${menuPos.left}px`,
              width: `${menuPos.width}px`,
              maxHeight: `${menuPos.maxHeight}px`,
            }}
            role="listbox"
          >
            {FIELD_TYPE_OPTIONS.map((opt) => {
              const isSelected = opt.value === value;
              const Icon = opt.icon;

              return (
                <button
                  key={opt.value}
                  type="button"
                  className={`${styles.option} ${isSelected ? styles.optionSelected : ''}`}
                  onClick={() => handleSelectOption(opt.value)}
                  role="option"
                  aria-selected={isSelected}
                >
                  <div className={styles.optionLeft}>
                    <Icon size={14} className={styles.optionIcon} />
                    <span className={styles.optionLabel}>{opt.label}</span>
                  </div>
                  {isSelected && <Check size={13} className={styles.checkIcon} />}
                </button>
              );
            })}
          </div>,
          document.body
        )}
    </div>
  );
};
