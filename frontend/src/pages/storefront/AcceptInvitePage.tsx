import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ShieldCheck, AlertTriangle, CheckCircle2, UserPlus, ArrowRight, LogIn, RefreshCw } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/ToastContext';
import { authService } from '@/services/api/authService';
import styles from './AcceptInvitePage.module.css';

export function AcceptInvitePage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const { user, isAuthenticated, isAuthInitialized, openAuthModal, logout, updateUser, restoreSession } = useAuth();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [invite, setInvite] = useState<any>(null);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setError('Invitation token is missing. Please check your invitation email link.');
      setLoading(false);
      return;
    }

    const fetchDetails = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await authService.getInviteDetails(token);
        if (res?.success && res.data) {
          setInvite(res.data);
        } else {
          setError('Failed to load invitation details.');
        }
      } catch (err: any) {
        setError(err.message || 'Invalid or expired invitation token.');
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [token]);

  const handleAccept = async () => {
    if (!token) return;
    setActionLoading(true);
    try {
      const res = await authService.acceptAdminInvite(token);
      if (res?.success) {
        setSuccessMessage(
          res.message || 'Welcome to the team! You have successfully accepted the invitation.'
        );
        showToast('Admin invitation accepted successfully!', 'success');
        
        // Refresh session user state so new admin role takes effect immediately
        if (res.data?.role) {
          updateUser((prev) => (prev ? { ...prev, role: res.data.role } : null));
        }
        await restoreSession();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to accept invitation', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDecline = async () => {
    if (!token) return;
    setActionLoading(true);
    try {
      const res = await authService.declineAdminInvite(token);
      if (res?.success) {
        setSuccessMessage('Invitation declined. Thank you for your response.');
        showToast('Invitation declined', 'info');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to decline invitation', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const isEmailMatching = () => {
    if (!user?.email || !invite?.email) return false;
    return user.email.trim().toLowerCase() === invite.email.trim().toLowerCase();
  };

  if (loading || !isAuthInitialized) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.skeletonCircle} />
          <div className={styles.skeletonBar} style={{ width: '65%', height: '22px' }} />
          <div className={styles.skeletonBar} style={{ width: '85%', height: '14px', marginTop: '8px' }} />
          <div className={styles.skeletonBar} style={{ width: '50%', height: '14px' }} />
          <div className={styles.skeletonBar} style={{ width: '100%', height: '44px', marginTop: '16px', borderRadius: '10px' }} />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.cardTopAccent} />

        <div className={styles.brandHeader}>
          <div className={styles.logoIconWrapper}>
            <ShieldCheck size={28} />
          </div>
          <h1 className={styles.brandTitle}>CakePopRush</h1>
          <p className={styles.brandSubtitle}>Admin Team Workspace</p>
          <div className={styles.divider} />
        </div>

        {error ? (
          <div className={styles.contentBody}>
            <div className={`${styles.statusIconBox} ${styles.statusIconError}`}>
              <AlertTriangle size={32} />
            </div>
            <h2 className={styles.heading}>Invitation Invalid</h2>
            <p className={styles.description}>{error}</p>
            <button className={styles.btnOutline} style={{ width: '100%' }} onClick={() => navigate('/')}>
              Return to Storefront
            </button>
          </div>
        ) : successMessage ? (
          <div className={styles.contentBody}>
            <div className={`${styles.statusIconBox} ${styles.statusIconSuccess}`}>
              <CheckCircle2 size={36} />
            </div>
            <h2 className={styles.heading}>Response Registered</h2>
            <p className={styles.description}>{successMessage}</p>

            {successMessage.includes('Welcome') ? (
              <button
                className={styles.btnPrimary}
                style={{ width: '100%' }}
                onClick={() => navigate('/admin')}
              >
                Proceed to Admin Dashboard <ArrowRight size={16} />
              </button>
            ) : (
              <button className={styles.btnOutline} style={{ width: '100%' }} onClick={() => navigate('/')}>
                Return to Storefront
              </button>
            )}
          </div>
        ) : (
          <div className={styles.contentBody}>
            <span className={styles.badgeRole}>
              Role: {invite?.roleAssigned === 'super_admin' ? 'Super Admin' : invite?.roleAssigned === 'admin' ? 'Administrator' : invite?.roleAssigned}
            </span>

            <h2 className={styles.heading}>You're Invited to Join!</h2>
            <p className={styles.description}>
              You have been granted an invitation to join the CakePopRush administrative portal with the permissions:
              <br />
              <strong>"{invite?.permissionsSummary || 'Full Store & Team Management'}"</strong>.
            </p>

            <div className={styles.detailsCard}>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Authorized Email</span>
                <span className={styles.detailValue}>{invite?.email}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Assigned Role</span>
                <span className={styles.detailValue}>
                  {invite?.roleAssigned === 'super_admin'
                    ? 'Super Admin'
                    : invite?.roleAssigned === 'admin'
                    ? 'Administrator'
                    : invite?.roleAssigned?.toUpperCase()}
                </span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Invited By</span>
                <span className={styles.detailValue}>{invite?.invitedBy?.name || 'Store Administration'}</span>
              </div>
            </div>

            {!isAuthenticated ? (
              <div>
                <div className={styles.warningBox}>
                  <strong>Authentication Required:</strong> Please sign in or register with{' '}
                  <strong>{invite?.email}</strong> to activate your administrative privileges.
                </div>
                <button
                  className={styles.btnPrimary}
                  style={{ width: '100%' }}
                  onClick={() => openAuthModal()}
                >
                  <LogIn size={16} /> Sign In with {invite?.email}
                </button>
              </div>
            ) : !isEmailMatching() ? (
              <div>
                <div className={styles.warningBox}>
                  <strong>Email Mismatch:</strong> You are currently signed in as{' '}
                  <strong>{user?.email}</strong>. This invitation is strictly tied to{' '}
                  <strong>{invite?.email}</strong>.
                </div>
                <button
                  className={styles.btnOutline}
                  style={{ width: '100%' }}
                  onClick={async () => {
                    await logout();
                    openAuthModal();
                  }}
                >
                  <RefreshCw size={16} /> Sign Out & Switch to {invite?.email}
                </button>
              </div>
            ) : (
              <div className={styles.actionsRow}>
                <button
                  className={styles.btnOutline}
                  disabled={actionLoading}
                  onClick={handleDecline}
                >
                  Decline
                </button>
                <button
                  className={styles.btnPrimary}
                  disabled={actionLoading}
                  onClick={handleAccept}
                >
                  {actionLoading ? 'Activating...' : 'Accept Invitation'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AcceptInvitePage;
