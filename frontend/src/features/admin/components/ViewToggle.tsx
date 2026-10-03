import React from 'react';
import { List, Grid } from 'lucide-react';
import styles from './ViewToggle.module.css';

interface ViewToggleProps {
  view: 'list' | 'grid';
  onViewChange: (view: 'list' | 'grid') => void;
}

export function ViewToggle({ view, onViewChange }: ViewToggleProps) {
  return (
    <div className={styles.viewToggles}>
      <button 
        className={`${styles.viewToggle} ${view === 'list' ? styles.active : ''}`}
        onClick={() => onViewChange('list')}
      >
        <List size={16} />
      </button>
      <button 
        className={`${styles.viewToggle} ${view === 'grid' ? styles.active : ''}`}
        onClick={() => onViewChange('grid')}
      >
        <Grid size={16} />
      </button>
    </div>
  );
}
