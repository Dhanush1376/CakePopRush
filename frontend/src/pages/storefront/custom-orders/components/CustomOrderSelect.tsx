import React, { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react';
import { ChevronDown, Check, X } from 'lucide-react';
import styles from './CustomOrderSelect.module.css';

export interface CustomOrderSelectOption {
  label: string;
  value: string;
}

export interface CustomOrderSelectProps {
  options: CustomOrderSelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: boolean;
  className?: string;
  disabled?: boolean;
  allowClear?: boolean;
}

export const CustomOrderSelect: React.FC<CustomOrderSelectProps> = ({
  options = [],
  value,
  onChange,
  placeholder = 'Select...',
  error = false,
  className = '',
  disabled = false,
  allowClear = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [placement, setPlacement] = useState<'top' | 'bottom'>('bottom');
  const [maxMenuHeight, setMaxMenuHeight] = useState<number>(240);

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Dynamic placement calculation
  const updatePosition = useCallback(() => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;

    const expectedHeight = Math.min(options.length * 42 + 16, 260);

    if (spaceBelow < expectedHeight && spaceAbove > spaceBelow) {
      setPlacement('top');
      setMaxMenuHeight(Math.max(120, Math.min(spaceAbove - 20, 260)));
    } else {
      setPlacement('bottom');
      setMaxMenuHeight(Math.max(120, Math.min(spaceBelow - 20, 260)));
    }
  }, [options.length]);

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

    window.addEventListener('scroll', handleScrollOrResize, { passive: true });
    window.addEventListener('resize', handleScrollOrResize, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScrollOrResize);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [isOpen, updatePosition]);

  // Outside click & Escape key dismiss
  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleTriggerClick = () => {
    if (disabled) return;
    setIsOpen((prev) => !prev);
  };

  const handleSelectOption = (optVal: string) => {
    onChange(optVal);
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    triggerRef.current?.focus();
  };

  return (
    <div ref={containerRef} className={`${styles.container} ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        className={`${styles.trigger} ${isOpen ? styles.isOpen : ''} ${error ? styles.hasError : ''}`}
        onClick={handleTriggerClick}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span
          className={`${styles.triggerText} ${!selectedOption ? styles.placeholder : ''}`}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>

        <div className={styles.triggerActions}>
          {allowClear && Boolean(value) && !disabled && (
            <button
              type="button"
              className={styles.clearBtn}
              onClick={handleClear}
              title="Clear selection"
              aria-label="Clear selection"
            >
              <X size={14} />
            </button>
          )}
          <ChevronDown
            size={16}
            className={`${styles.chevronIcon} ${isOpen ? styles.chevronOpen : ''}`}
          />
        </div>
      </button>

      {isOpen && (
        <div
          className={`${styles.dropdownMenu} ${placement === 'top' ? styles.menuTop : styles.menuBottom}`}
          style={{ maxHeight: `${maxMenuHeight}px` }}
          role="listbox"
        >
          {options.length === 0 ? (
            <div className={styles.emptyState}>No options available</div>
          ) : (
            options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  className={`${styles.option} ${isSelected ? styles.optionSelected : ''}`}
                  onClick={() => handleSelectOption(opt.value)}
                  role="option"
                  aria-selected={isSelected}
                >
                  <span className={styles.optionLabel}>{opt.label}</span>
                  {isSelected && <Check size={14} className={styles.checkIcon} />}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
