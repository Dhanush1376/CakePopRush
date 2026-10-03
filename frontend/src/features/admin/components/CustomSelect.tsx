import React, { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import styles from './CustomSelect.module.css';

interface Option {
  label: string;
  value: string;
}

interface CustomSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  variant?: 'pink' | 'yellow' | 'turquoise';
  menuPosition?: 'auto' | 'top' | 'bottom';
}

export function CustomSelect({ 
  options, 
  value, 
  onChange, 
  placeholder = 'Select...', 
  className = '',
  variant = 'pink',
  menuPosition = 'auto'
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [computedPlacement, setComputedPlacement] = useState<'top' | 'bottom'>('bottom');
  const [maxMenuHeight, setMaxMenuHeight] = useState<number>(240);

  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  // Smart placement calculation: responds dynamically to viewport size, modals, and screen space
  const updatePosition = useCallback(() => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;

    // Expected height based on options count (~40px per item + container padding)
    const expectedHeight = Math.min(options.length * 40 + 14, 250);

    const isTop = menuPosition === 'top' || (spaceBelow < expectedHeight && spaceAbove > spaceBelow);
    const placement: 'top' | 'bottom' = isTop ? 'top' : 'bottom';
    const availableSpace = isTop ? spaceAbove : spaceBelow;

    setComputedPlacement(placement);

    // Ensure dropdown never bleeds outside viewport bounds
    const safeMaxHeight = Math.max(100, Math.min(availableSpace - 16, 260));
    setMaxMenuHeight(safeMaxHeight);
  }, [options.length, menuPosition]);

  useLayoutEffect(() => {
    if (isOpen) {
      updatePosition();
    }
  }, [isOpen, updatePosition]);

  useEffect(() => {
    if (!isOpen) return;

    const handleResizeOrScroll = () => {
      updatePosition();
    };

    window.addEventListener('resize', handleResizeOrScroll, { passive: true });
    window.addEventListener('scroll', handleResizeOrScroll, { passive: true });

    return () => {
      window.removeEventListener('resize', handleResizeOrScroll);
      window.removeEventListener('scroll', handleResizeOrScroll);
    };
  }, [isOpen, updatePosition]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div 
      className={`${styles.container} ${styles[`variant-${variant}`]} ${className}`} 
      ref={containerRef}
    >
      <button 
        type="button" 
        className={styles.trigger} 
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span className={styles.triggerText}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown 
          size={15} 
          className={`${styles.icon} ${isOpen ? styles.iconOpen : ''}`} 
        />
      </button>

      {isOpen && (
        <div 
          ref={dropdownRef}
          className={`${styles.dropdown} ${computedPlacement === 'top' ? styles.menuTop : styles.menuBottom}`}
          style={{ maxHeight: `${maxMenuHeight}px` }}
          role="listbox"
        >
          {options.map(option => (
            <button
              key={option.value}
              type="button"
              className={`${styles.option} ${value === option.value ? styles.selected : ''}`}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              role="option"
              aria-selected={value === option.value}
            >
              <span className={styles.optionLabel}>{option.label}</span>
              {value === option.value && (
                <Check size={14} className={styles.checkmark} strokeWidth={2.5} />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
