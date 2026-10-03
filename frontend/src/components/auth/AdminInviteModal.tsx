import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, CheckCircle2, X, ArrowRight } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/ToastContext';
import { authService } from '@/services/api/authService';
import { refreshAccessToken } from '@/lib/api/client';
import styles from './AdminInviteModal.module.css';

interface PendingInviteData {
  _id: string;
  email: string;
  roleAssigned: string;
  permissionsSummary?: string;
  status: string;
  invitedBy?: {
    _id?: string;
    name?: string;
    email?: string;
    role?: string;
  };
  createdAt?: string;
  expiresAt?: string;
}

export const AdminInviteModal: React.FC = () => {
  const { user, isAuthenticated, isAuthModalOpen, restoreSession } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [invite, setInvite] = useState<PendingInviteData | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const checkPendingInvitation = useCallback(async () => {
    // Only check if authenticated, user exists, and not currently on dedicated accept-invite route
    if (!isAuthenticated || !user) return;
    if (location.pathname.startsWith('/accept-invite')) return;
    if (isAuthModalOpen) return;

    try {
      const res = await authService.getMyPendingInvite();
      if (res?.success && res.data) {
        const inviteData = res.data as PendingInviteData;
        const dismissedId = sessionStorage.getItem('dismissed_admin_invite_id');
        if (dismissedId !== inviteData._id) {
          setInvite(inviteData);
          setIsOpen(true);
        }
      } else {
        setIsOpen(false);
        setInvite(null);
      }
    } catch {
      // Silently ignore 401 or network polling errors
    }
  }, [isAuthenticated, user, isAuthModalOpen, location.pathname]);

  useEffect(() => {
    let active = true;

    if (isAuthenticated && user && !isAuthModalOpen) {
      checkPendingInvitation();
    }

    // Polling interval to detect invitations issued while user is browsing
    const intervalId = setInterval(() => {
      if (active) checkPendingInvitation();
    }, 25000);

    const handleFocus = () => {
      if (active) checkPendingInvitation();
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      active = false;
      clearInterval(intervalId);
      window.removeEventListener('focus', handleFocus);
    };
  }, [isAuthenticated, user, isAuthModalOpen, checkPendingInvitation]);

  const handleDismiss = () => {
    if (invite?._id) {
      sessionStorage.setItem('dismissed_admin_invite_id', invite._id);
    }
    setIsOpen(false);
  };

  const handleResponse = async (action: 'accept' | 'reject') => {
    if (!invite || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await authService.respondToAdminInvite(invite._id, action);
      if (res?.success) {
        if (action === 'accept') {
          showToast('Welcome to the Admin Team! Activating privileges...', 'success');

          // 1. Refresh access token so that JWT claims contain the elevated role
          await refreshAccessToken();

          // 2. Refresh AuthContext state
          await restoreSession();

          sessionStorage.removeItem('dismissed_admin_invite_id');
          setIsOpen(false);
          setInvite(null);

          // 3. Smooth transition to admin console
          setTimeout(() => {
            navigate('/admin');
          }, 600);
        } else {
          showToast('Invitation declined successfully.', 'info');
          sessionStorage.removeItem('dismissed_admin_invite_id');
          setIsOpen(false);
          setInvite(null);
        }
      } else {
        showToast(res?.message || 'Failed to process invitation response.', 'error');
      }
    } catch (err: any) {
      showToast(err?.message || 'Failed to process invitation response.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatRoleName = (role?: string) => {
    if (!role) return 'Administrator';
    switch (role.toLowerCase()) {
      case 'super_admin':
      case 'superadmin':
        return 'Super Admin';
      case 'admin':
        return 'Administrator';
      case 'editor':
        return 'Content Editor';
      case 'viewer':
        return 'Viewer';
      case 'owner':
        return 'Store Owner';
      default:
        return role.toUpperCase();
    }
  };

  if (!isOpen || !invite) return null;

  const animationProps = isMobile
    ? {
        initial: { y: '100%' },
        animate: { y: 0 },
        exit: { y: '100%' },
        transition: { type: 'spring', damping: 28, stiffness: 320 }
      }
    : {
        initial: { opacity: 0, scale: 0.95, y: 20 },
        animate: { opacity: 1, scale: 1, y: 0 },
        exit: { opacity: 0, scale: 0.95, y: 20 },
        transition: { type: 'spring', damping: 25, stiffness: 320 }
      };

  return createPortal(
    <AnimatePresence>
      <div className={styles.portalWrapper}>
        {/* Backdrop */}
        <motion.div
          className={styles.backdrop}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleDismiss}
        />

        {/* Modal / Mobile App Drawer Card */}
        <motion.div
          className={`${styles.modalCard} ${isMobile ? styles.mobileDrawer : ''}`}
          {...(animationProps as any)}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Drawer Handle (Mobile Only) */}
          {isMobile && <div className={styles.drawerHandle} />}

          {/* Ambient Glows */}
          <div className={styles.glowAccentTop} />
          <div className={styles.glowAccentBottom} />

          {/* Close / Decide Later Button */}
          <button
            type="button"
            className={styles.closeBtn}
            onClick={handleDismiss}
            aria-label="Close"
            title="Decide later"
          >
            <X size={18} />
          </button>

          {/* Header Icon */}
          <div className={styles.iconContainer}>
            <ShieldCheck size={26} strokeWidth={2.2} />
          </div>

          <h2 className={styles.title}>Admin Invitation</h2>
          <p className={styles.subtitle}>
            <strong>
              {invite.invitedBy?.name || invite.invitedBy?.email || 'Store Administration'}
            </strong>{' '}
            invited you to join as
          </p>

          {/* Compact Role & Permissions Card */}
          <div className={styles.roleCard}>
            <span className={styles.roleBadge}>{formatRoleName(invite.roleAssigned)}</span>
            {invite.permissionsSummary && (
              <span className={styles.permissionsSummary}>
                "{invite.permissionsSummary}"
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className={styles.actionsRow}>
            <button
              type="button"
              className={styles.btnDecline}
              disabled={isSubmitting}
              onClick={() => handleResponse('reject')}
            >
              Decline
            </button>
            <button
              type="button"
              className={styles.btnAccept}
              disabled={isSubmitting}
              onClick={() => handleResponse('accept')}
            >
              {isSubmitting ? (
                <>
                  <div className={styles.spinner} />
                  <span>Activating...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  <span>Accept Access</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
};

export default AdminInviteModal;
