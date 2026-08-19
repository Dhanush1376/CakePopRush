import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MoreVertical } from 'lucide-react';
import styles from './ActionDropdown.module.css';
import { useToast } from '@/components/ui/ToastContext';

export interface DropdownAction {
  label: string;
  icon?: React.ElementType;
  onClick?: () => void;
  variant?: 'default' | 'danger' | 'success';
}

interface ActionDropdownProps {
  actions: DropdownAction[];
}

export const ActionDropdown: React.FC<ActionDropdownProps> = ({ actions }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleScroll = () => {
      if (isOpen) setIsOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('scroll', handleScroll, true); // true for capture phase to catch all scrolls
    window.addEventListener('resize', handleScroll);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleScroll);
    };
  }, [isOpen]);

  return (
    <div className={styles.dropdownContainer}>
      <button
        ref={buttonRef}
        className={`${styles.actionBtn} ${isOpen ? styles.active : ''}`}
        aria-label="More Actions"
        onClick={handleToggle}
      >
        <MoreVertical size={16} />
      </button>

      {isOpen && createPortal(
        <div 
          ref={menuRef}
          className={styles.portalContent}
          style={{
            top: `${coords.top + 4}px`,
            // Try to align to right of the button to prevent it going off screen
            left: `${coords.left - 160 + coords.width}px` // 160 is roughly the menu width
          }}
        >
          {actions.map((action, idx) => {
            const Icon = action.icon;
            return (
                <button
                  key={idx}
                  className={`${styles.menuItem} ${action.variant === 'danger' ? styles.danger : ''} ${action.variant === 'success' ? styles.success : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                  if (action.onClick) {
                    action.onClick();
                  } else {
                    toast({
                      title: 'Action performed',
                      type: 'info'
                    });
                  }
                }}
              >
                {Icon && <Icon size={14} />}
                {action.label}
              </button>
            )
          })}
        </div>,
        document.body
      )}
    </div>
  );
};
