import React from 'react';
import { useRouteError, isRouteErrorResponse, useNavigate } from 'react-router-dom';
import { AlertTriangle, RefreshCcw, Home, ChevronRight } from 'lucide-react';
import styles from './AdminErrorBoundary.module.css';

export function AdminErrorBoundary() {
  const error = useRouteError();
  const navigate = useNavigate();
  const [showDetails, setShowDetails] = React.useState(false);

  let errorMessage = 'An unexpected error occurred.';
  let errorDetails = '';

  if (isRouteErrorResponse(error)) {
    errorMessage = error.data?.message || error.statusText;
    errorDetails = `Status: ${error.status}\nStatus Text: ${error.statusText}`;
  } else if (error instanceof Error) {
    errorMessage = error.message;
    errorDetails = error.stack || '';
  } else if (typeof error === 'string') {
    errorMessage = error;
  }

  return (
    <div className={styles.container}>
      <div className={styles.errorCard}>
        <div className={styles.iconWrapper}>
          <AlertTriangle size={40} strokeWidth={2.5} />
        </div>
        
        <div>
          <h1 className={styles.title}>Oops! Something went wrong.</h1>
          <p className={styles.subtitle}>
            We encountered an unexpected error while loading this page.
          </p>
        </div>

        <div className={styles.errorDetailsWrapper}>
          <button 
            className={styles.detailsToggle}
            onClick={() => setShowDetails(!showDetails)}
          >
            <ChevronRight 
              size={16} 
              style={{ 
                transform: showDetails ? 'rotate(90deg)' : 'rotate(0deg)',
                transition: 'transform 0.3s ease'
              }} 
            />
            View Error Details
          </button>
          
          <div className={`${styles.errorDetailsBox} ${showDetails ? styles.open : ''}`}>
            <pre className={styles.errorText}>
              {errorMessage}
              {errorDetails && `\n\n${errorDetails}`}
            </pre>
          </div>
        </div>

        <div className={styles.actions}>
          <button 
            onClick={() => window.location.reload()} 
            className={styles.primaryBtn}
          >
            <RefreshCcw size={16} />
            Try Again
          </button>
          
          <button 
            onClick={() => navigate('/admin')} 
            className={styles.secondaryBtn}
          >
            <Home size={16} />
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
