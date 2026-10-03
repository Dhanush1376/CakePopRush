import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Phone, ArrowRight, ArrowLeft, AlertCircle, RefreshCw } from 'lucide-react';
import styles from './AuthModal.module.css';
import { CakePopMascot } from '@/components/mascot/CakePopMascot';
import { useMascotOrchestrator } from '@/components/mascot/orchestration/useMascotOrchestrator';
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/services/api/authService';
import { useGoogleIdentity } from '@/hooks/useGoogleIdentity';
import { useToast } from '@/components/ui/ToastContext';
import { useNavigate } from 'react-router-dom';

const TypingText = ({ text }: { text: string }) => {
  const [displayed, setDisplayed] = useState('');
  useEffect(() => {
    setDisplayed('');
    let i = 0;
    const interval = setInterval(() => {
      setDisplayed(text.slice(0, i + 1));
      i++;
      if (i >= text.length) clearInterval(interval);
    }, 30);
    return () => clearInterval(interval);
  }, [text]);
  return <>{displayed}</>;
};

interface AuthModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  onSignIn?: () => void;
}

const GoogleLogo = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen: propIsOpen,
  onClose: propOnClose,
  onSignIn: propOnSignIn,
}) => {
  const {
    isAuthModalOpen: contextIsOpen,
    closeAuthModal: contextCloseModal,
    loginSuccess,
    user,
  } = useAuth();

  const navigate = useNavigate();
  const loggedInRoleRef = useRef<string | null>(null);

  const isOpen = propIsOpen !== undefined ? propIsOpen : contextIsOpen;
  const onClose = propOnClose || contextCloseModal;

  const { showToast } = useToast();
  const { currentReaction, triggerReaction, tapMascot } = useMascotOrchestrator();

  const handleMascotClick = () => {
    tapMascot();
  };

  // State Machine
  const [step, setStep] = useState<'identifier' | 'verification' | 'success'>('identifier');
  const [successPhase, setSuccessPhase] = useState<'tick' | 'mascot'>('tick');

  // Input states (Unified dynamic identifier)
  const [identifier, setIdentifier] = useState('');
  const [detectedType, setDetectedType] = useState<'default' | 'phone' | 'email'>('default');
  const [challengeId, setChallengeId] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const otpRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  // Async / status states
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  // Responsive device mode: popup on desktop/laptop, app drawer on mobile
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

  const animationProps = isMobile
    ? {
        initial: { y: '100%' },
        animate: { y: 0 },
        exit: { y: '100%' },
        transition: { type: 'spring', damping: 28, stiffness: 300 },
      }
    : {
        initial: { opacity: 0, scale: 0.94, y: 16 },
        animate: { opacity: 1, scale: 1, y: 0 },
        exit: { opacity: 0, scale: 0.94, y: 16 },
        transition: { type: 'spring', damping: 25, stiffness: 350 },
      };

  // Google Sign-In Integration
  const handleGoogleSuccess = async (response: { credential: string }) => {
    try {
      setIsLoading(true);
      setErrorMsg('');
      const res = await authService.googleAuth(response.credential);
      if (res.success && res.data) {
        loggedInRoleRef.current = res.data.user?.role || null;
        setStep('success');
        triggerReaction('account:login-success');
        await loginSuccess(
          res.data.user,
          res.data.accessToken,
          res.data.refreshToken,
          { keepModalOpen: true }
        );
        propOnSignIn?.();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Google sign-in failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = (err: string) => {
    setErrorMsg(err || 'Google sign-in was cancelled or encountered an error.');
  };

  const { isReady: isGoogleReady, triggerLogin: triggerGoogleLogin, renderGoogleButton } = useGoogleIdentity(
    handleGoogleSuccess,
    handleGoogleError
  );

  useEffect(() => {
    if (isOpen && isGoogleReady) {
      renderGoogleButton('google-button-container');
    }
  }, [isOpen, isGoogleReady, step, renderGoogleButton]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Reset state on open
  useEffect(() => {
    if (isOpen) {
      setStep('identifier');
      setSuccessPhase('tick');
      setIdentifier('');
      setDetectedType('default');
      setChallengeId('');
      setOtp(['', '', '', '', '', '']);
      setErrorMsg('');
      setIsLoading(false);
      setIsVerifying(false);
    }
  }, [isOpen]);

  // Cooldown countdown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  // Auto-close on success flow
  useEffect(() => {
    if (step === 'success') {
      const phaseTimer = setTimeout(() => {
        setSuccessPhase('mascot');
        const closeTimer = setTimeout(() => {
          onClose();
          const targetRole = loggedInRoleRef.current || user?.role;
          if (targetRole === 'delivery_agent' || targetRole === 'DELIVERY_AGENT') {
            navigate('/delivery');
          }
        }, 3200);
        return () => clearTimeout(closeTimer);
      }, 1400);

      return () => clearTimeout(phaseTimer);
    }
  }, [step, onClose, user, navigate]);

  // Unified Input Change Handler
  const handleIdentifierChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setErrorMsg('');

    if (!raw.trim()) {
      setDetectedType('default');
      setIdentifier('');
      return;
    }

    // If string contains any alphabet or @, automatically switch to email
    if (/[a-zA-Z@]/.test(raw)) {
      setDetectedType('email');
      setIdentifier(raw);
    } else {
      // Numbers only -> phone format (up to 10 digits, stripping optional leading 91)
      let digits = raw.replace(/\D/g, '');
      if (digits.startsWith('91') && digits.length > 10) {
        digits = digits.slice(2);
      }
      digits = digits.slice(0, 10);
      setDetectedType('phone');
      setIdentifier(digits);
    }
  };

  // OTP Request handler
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const trimmed = identifier.trim();
    if (!trimmed) {
      setErrorMsg('Please enter your email address or mobile phone number');
      return;
    }

    let payloadIdentifier: string;
    const isPhone =
      detectedType === 'phone' ||
      (detectedType === 'default' && !/[a-zA-Z@]/.test(trimmed));

    if (isPhone) {
      const digits = trimmed.replace(/\D/g, '');
      if (digits.length < 10) {
        setErrorMsg('Please enter a valid 10-digit mobile number');
        return;
      }
      payloadIdentifier = `+91${digits}`;
    } else {
      if (!trimmed.includes('@') || !trimmed.includes('.')) {
        setErrorMsg('Please enter a valid email address');
        return;
      }
      payloadIdentifier = trimmed.toLowerCase();
    }

    try {
      setIsLoading(true);
      const res = await authService.requestOtp(payloadIdentifier);
      if (res.success && res.data?.challengeId) {
        setChallengeId(res.data.challengeId);
        setStep('verification');
        setResendCooldown(60);
        setOtp(['', '', '', '', '', '']);
        setTimeout(() => otpRefs[0].current?.focus(), 150);
      }
    } catch (err: any) {
      setErrorMsg(
        err.message || 'Failed to send verification code. Please check details and try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || isLoading) return;
    setErrorMsg('');

    const payloadIdentifier =
      detectedType === 'phone'
        ? `+91${identifier.replace(/\D/g, '')}`
        : identifier.trim().toLowerCase();

    try {
      setIsLoading(true);
      const res = await authService.requestOtp(payloadIdentifier);
      if (res.success && res.data?.challengeId) {
        setChallengeId(res.data.challengeId);
        setResendCooldown(60);
        setOtp(['', '', '', '', '', '']);
        showToast('Verification code resent successfully', 'success');
        setTimeout(() => otpRefs[0].current?.focus(), 150);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to resend code');
    } finally {
      setIsLoading(false);
    }
  };

  const executeVerify = async (otpCode: string) => {
    if (isVerifying || !challengeId) return;

    try {
      setIsVerifying(true);
      setErrorMsg('');
      const res = await authService.verifyOtp(challengeId, otpCode);

      if (res.success && res.data) {
        loggedInRoleRef.current = res.data.user?.role || null;
        setStep('success');
        triggerReaction('account:login-success');
        await loginSuccess(
          res.data.user,
          res.data.accessToken,
          res.data.refreshToken,
          { keepModalOpen: true }
        );
        propOnSignIn?.();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid or expired verification code');
      // Reset OTP inputs on error for smooth re-entry
      setOtp(['', '', '', '', '', '']);
      setTimeout(() => otpRefs[0].current?.focus(), 100);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const digit = value.slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    if (digit && index < 5) {
      otpRefs[index + 1].current?.focus();
    }

    const fullCode = newOtp.join('');
    if (fullCode.length === 6) {
      executeVerify(fullCode);
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs[index - 1].current?.focus();
    }
  };

  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = otp.join('');
    if (fullCode.length === 6) {
      executeVerify(fullCode);
    }
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className={styles.modalWrapper}>
          <motion.div
            className={styles.backdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={step !== 'success' ? onClose : undefined}
          />
          <motion.div
            className={`${styles.modal} ${isMobile ? styles.mobileDrawer : styles.desktopPopup}`}
            {...(animationProps as any)}
            drag={isMobile && step !== 'success' ? 'y' : false}
            dragConstraints={{ top: 0 }}
            dragElastic={0.2}
            onDragEnd={(_e, { offset, velocity }) => {
              if (offset.y > 100 || velocity.y > 400) {
                onClose();
              }
            }}
            role="dialog"
            aria-modal="true"
          >
            {isMobile && <div className={styles.dragIndicator} />}

            <button
              className={styles.closeButton}
              onClick={onClose}
              aria-label="Close modal"
              disabled={step === 'success' || isLoading || isVerifying}
            >
              <X size={18} strokeWidth={1.5} />
            </button>

            <img
              src="/assets/elegant_mandala.webp"
              alt=""
              aria-hidden="true"
              className={styles.mandalaWatermark}
            />

            <div className={styles.content}>
              {/* Step 1: Identifier Selection */}
              {step === 'identifier' && (
                <motion.div
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 16 }}
                  transition={{ duration: 0.25 }}
                >
                  <div className={styles.headerArea}>
                    <h2 className={styles.title}>Login or Sign Up</h2>
                    <p className={styles.subtitle}>
                      {detectedType === 'phone'
                        ? 'Log in or register with your mobile phone number'
                        : detectedType === 'email'
                          ? 'Log in or register with your email address'
                          : 'Log in or register with your phone number or email'}
                    </p>
                  </div>

                  {errorMsg && (
                    <div className={styles.errorMessage}>
                      <AlertCircle size={16} />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  <form onSubmit={handleRequestOtp}>
                    <div className={styles.fieldGroup}>
                      <label htmlFor="auth-identifier-input" className={styles.fieldLabel}>
                        {detectedType === 'phone' ? (
                          <>
                            <Phone className={styles.labelIconPink} size={13} strokeWidth={1.8} />
                            <span>MOBILE PHONE NUMBER</span>
                          </>
                        ) : detectedType === 'email' ? (
                          <>
                            <Mail className={styles.labelIconPink} size={13} strokeWidth={1.8} />
                            <span>EMAIL ADDRESS</span>
                          </>
                        ) : (
                          <>
                            <span className={styles.combinedIcons}>
                              <Mail size={13} strokeWidth={1.8} />
                              <span className={styles.iconSeparator}>/</span>
                              <Phone size={13} strokeWidth={1.8} />
                            </span>
                            <span>EMAIL OR MOBILE NUMBER</span>
                          </>
                        )}
                      </label>

                      <div className={styles.pillInputWrapper}>
                        {detectedType === 'phone' ? (
                          <div className={styles.countryCodePrefix}>
                            <span>+91</span>
                            <span className={styles.separator}>|</span>
                          </div>
                        ) : (
                          <Mail className={styles.inputIcon} size={16} strokeWidth={1.5} />
                        )}

                        <input
                          id="auth-identifier-input"
                          type={detectedType === 'phone' ? 'tel' : detectedType === 'email' ? 'email' : 'text'}
                          inputMode={detectedType === 'phone' ? 'numeric' : 'text'}
                          className={`${styles.pillInput} ${
                            detectedType === 'phone'
                              ? styles.pillInputPhone
                              : detectedType === 'email'
                                ? styles.pillInputEmail
                                : styles.pillInputDefault
                          }`}
                          placeholder={
                            detectedType === 'phone'
                              ? '98765 43210'
                              : detectedType === 'email'
                                ? 'name@example.com'
                                : 'Enter email or mobile number'
                          }
                          value={identifier}
                          onChange={handleIdentifierChange}
                          required
                          disabled={isLoading}
                          autoFocus
                          maxLength={detectedType === 'phone' ? 10 : undefined}
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className={styles.primaryButton}
                      disabled={
                        isLoading ||
                        (detectedType === 'phone'
                          ? identifier.length < 10
                          : detectedType === 'email'
                            ? !identifier.includes('@') || !identifier.includes('.')
                            : identifier.trim().length === 0)
                      }
                    >
                      {isLoading ? (
                        <div className={styles.buttonSpinner} />
                      ) : (
                        <>
                          <span>
                            {detectedType === 'phone'
                              ? 'SEND SMS VERIFICATION CODE'
                              : detectedType === 'email'
                                ? 'SEND EMAIL VERIFICATION CODE'
                                : 'SEND VERIFICATION CODE'}
                          </span>
                          <ArrowRight size={17} strokeWidth={2} />
                        </>
                      )}
                    </button>
                  </form>

                  <div className={styles.divider}>
                    <span>OR</span>
                  </div>

                  <div className={styles.googleWrapper}>
                    <div id="google-button-container" className={styles.googleIframeOverlay} />
                    <button
                      type="button"
                      className={styles.googleButton}
                      onClick={() => triggerGoogleLogin()}
                      disabled={isLoading}
                    >
                      <GoogleLogo />
                      <span>CONTINUE WITH GOOGLE</span>
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Verification */}
              {step === 'verification' && (
                <motion.div
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.25 }}
                >
                  <div className={styles.backHeader}>
                    <button
                      type="button"
                      className={styles.backButton}
                      onClick={() => {
                        setStep('identifier');
                        setErrorMsg('');
                      }}
                      disabled={isVerifying}
                    >
                      <ArrowLeft size={14} strokeWidth={2} />
                      <span>CHANGE</span>
                    </button>
                  </div>

                  <div className={styles.headerArea}>
                    <h2 className={styles.title}>Verification Code</h2>
                    <p className={styles.otpSubtitle}>
                      Code sent to <strong>{detectedType === 'phone' ? `+91 ${identifier}` : identifier}</strong>
                    </p>
                  </div>

                  {errorMsg && (
                    <div className={styles.errorMessage}>
                      <AlertCircle size={16} />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  <form onSubmit={handleVerifySubmit}>
                    <div className={styles.otpContainer}>
                      {otp.map((digit, index) => (
                        <input
                          key={index}
                          ref={otpRefs[index]}
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={1}
                          className={styles.otpBox}
                          value={digit}
                          onChange={(e) => handleOtpChange(index, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(index, e)}
                          disabled={isVerifying}
                          autoFocus={index === 0}
                          required
                        />
                      ))}
                    </div>

                    <button
                      type="submit"
                      className={styles.primaryButton}
                      disabled={isVerifying || otp.join('').length < 6}
                    >
                      <span>{isVerifying ? 'VERIFYING...' : 'VERIFY & CONTINUE'}</span>
                      <ArrowRight size={17} strokeWidth={2} />
                    </button>
                  </form>

                  <div className={styles.resendRow}>
                    <span>Didn't receive code?&nbsp;</span>
                    <button
                      type="button"
                      className={styles.resendButton}
                      onClick={handleResendOtp}
                      disabled={resendCooldown > 0 || isLoading || isVerifying}
                    >
                      {resendCooldown > 0 ? (
                        `Resend in ${resendCooldown}s`
                      ) : (
                        <>
                          <RefreshCw size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
                          Resend Code
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Success Celebration */}
              {step === 'success' && (
                <motion.div className={styles.successContainer}>
                  <AnimatePresence mode="wait">
                    {successPhase === 'tick' ? (
                      <motion.div
                        key="tick"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        className={styles.tickPhase}
                      >
                        <motion.div
                          className={styles.tickCircle}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
                        >
                          <svg
                            width="32"
                            height="32"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="white"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <motion.path
                              d="M5 13L9 17L19 7"
                              initial={{ pathLength: 0 }}
                              animate={{ pathLength: 1 }}
                              transition={{ duration: 0.5, ease: 'easeOut', delay: 0.3 }}
                            />
                          </svg>
                        </motion.div>
                        <h2 className={styles.successTitle}>Verification Successful!</h2>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="mascot"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        className={styles.mascotPhase}
                      >
                        <div className={styles.mascotSuccessWrap}>
                          <motion.div
                            className={styles.speechBubble}
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ type: 'spring', damping: 15, stiffness: 300, delay: 0.4 }}
                          >
                            <TypingText text="I lovee uuuu!" />
                          </motion.div>
                          <div className={styles.mascotClip}>
                            <motion.div
                              className={styles.mascotContainer}
                              initial={{ y: 50 }}
                              animate={{ y: 0 }}
                              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                              onClick={handleMascotClick}
                            >
                              <CakePopMascot
                                size="small"
                                reaction={currentReaction || 'blowKiss'}
                                loop={false}
                                hideArms={true}
                              />
                            </motion.div>
                          </div>
                          {/* Mascot Paws / Hands gripping the bar */}
                          <motion.div
                            className={styles.mascotHandRight}
                            initial={{ y: 20, opacity: 0, scale: 0.8 }}
                            animate={{ y: 0, opacity: 1, scale: 1 }}
                            transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.3 }}
                          />
                          <motion.div
                            className={styles.mascotHandLeft}
                            initial={{ y: 20, opacity: 0, scale: 0.8 }}
                            animate={{ y: 0, opacity: 1, scale: 1 }}
                            transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.45 }}
                          />
                          {/* Peeking Bar / Wall Line */}
                          <div className={styles.peekingBar} />
                        </div>
                        <h2 className={`${styles.title} ${styles.mascotTitle}`}>Welcome to CakePopRush!</h2>
                        <p className={`${styles.subtitle} ${styles.mascotSubtitle}`}>You have successfully signed in.</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default AuthModal;
