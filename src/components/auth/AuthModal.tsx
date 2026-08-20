import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, ArrowRight, ArrowLeft } from 'lucide-react';
import styles from './AuthModal.module.css';
import { CakePopMascot } from '@/components/mascot/CakePopMascot';
import { useMascotOrchestrator } from '@/components/mascot/orchestration/useMascotOrchestrator';

const TypingText = ({ text }: { text: string }) => {
  const [displayed, setDisplayed] = React.useState('');
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
  isOpen: boolean;
  onClose: () => void;
  onSignIn: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSignIn }) => {
  const { currentReaction, triggerReaction, tapMascot } = useMascotOrchestrator();

  const handleMascotClick = () => {
    tapMascot();
  };
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

  const [step, setStep] = React.useState<'email' | 'verification' | 'success'>('email');
  const [successPhase, setSuccessPhase] = React.useState<'tick' | 'mascot'>('tick');
  const [email, setEmail] = React.useState('');
  const [otp, setOtp] = React.useState(['', '', '', '']);
  const otpRefs = [React.useRef<HTMLInputElement>(null), React.useRef<HTMLInputElement>(null), React.useRef<HTMLInputElement>(null), React.useRef<HTMLInputElement>(null)];

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      setStep('email');
      setSuccessPhase('tick');
      setEmail('');
      setOtp(['', '', '', '']);
    }
  }, [isOpen]);

  // Auto-close on success flow
  useEffect(() => {
    if (step === 'success') {
      const phaseTimer = setTimeout(() => {
        setSuccessPhase('mascot');

        // After showing mascot, wait a bit before closing
        setTimeout(() => {
          onClose();
        }, 3500);
      }, 1500); // show tick for 1.5s

      return () => clearTimeout(phaseTimer);
    }
  }, [step, onClose]);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setStep('verification');
      setTimeout(() => otpRefs[0].current?.focus(), 100);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next
    if (value && index < 3) {
      otpRefs[index + 1].current?.focus();
    } else if (newOtp.join('').length === 4) {
      // Auto verify when fully entered
      setStep('success');
      triggerReaction('account:login-success');
      onSignIn();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs[index - 1].current?.focus();
    }
  };

  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.join('').length === 4) {
      setStep('success');
      triggerReaction('account:login-success');
      onSignIn();
    }
  };

  const handleGoogleSignIn = () => {
    setStep('success');
    triggerReaction('account:login-success');
    onSignIn();
  };

  const GoogleLogo = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className={styles.modalWrapper}>
          <motion.div
            className={styles.backdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className={styles.modal}
            initial={{ y: 50, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
            role="dialog"
            aria-modal="true"
          >
            <button
              className={styles.closeButton}
              onClick={onClose}
              aria-label="Close modal"
              disabled={step === 'success'}
            >
              <X size={20} strokeWidth={1.5} />
            </button>

            <div className={styles.dragIndicator} />

            <div className={styles.content}>
              {step === 'email' && (
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                  <h2 className={styles.title}>Login or Sign Up</h2>
                  <p className={styles.subtitle}>Log in or register with your email</p>

                  <form onSubmit={handleEmailSubmit}>
                    <div className={styles.inputGroup}>
                      <Mail className={styles.inputIcon} size={20} strokeWidth={1.5} />
                      <input
                        type="email"
                        className={styles.input}
                        placeholder="EMAIL ADDRESS"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>

                    <button type="submit" className={styles.primaryButton} disabled={!email || !email.includes('@')}>
                      SEND VERIFICATION CODE <ArrowRight size={18} strokeWidth={2} />
                    </button>
                  </form>

                  <div className={styles.divider}>
                    <span>OR</span>
                  </div>

                  <button
                    type="button"
                    className={styles.googleButton}
                    onClick={handleGoogleSignIn}
                  >
                    <GoogleLogo /> CONTINUE WITH GOOGLE
                  </button>
                </motion.div>
              )}

              {step === 'verification' && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <div className={styles.backHeader}>
                    <button className={styles.backButton} onClick={() => setStep('email')}>
                      <ArrowLeft size={20} strokeWidth={2} />
                    </button>
                    <h2 className={styles.title}>Verify Email</h2>
                  </div>
                  <p className={styles.subtitle}>Enter the 4-digit code sent to<br /><strong>{email}</strong></p>

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
                          className={styles.otpInput}
                          value={digit}
                          onChange={(e) => handleOtpChange(index, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(index, e)}
                          required
                        />
                      ))}
                    </div>

                    <button type="submit" className={styles.primaryButton} disabled={otp.join('').length < 4}>
                      VERIFY
                    </button>
                  </form>
                </motion.div>
              )}

              {step === 'success' && (
                <motion.div
                  className={styles.successContainer}
                >
                  <AnimatePresence mode="wait">
                    {successPhase === 'tick' ? (
                      <motion.div
                        key="tick"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className={styles.tickPhase}
                      >
                        <motion.div
                          className={styles.tickCircle}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
                        >
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <motion.path
                              d="M5 13L9 17L19 7"
                              initial={{ pathLength: 0 }}
                              animate={{ pathLength: 1 }}
                              transition={{ duration: 0.5, ease: "easeOut", delay: 0.3 }}
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
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
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
                              transition={{ type: "spring", stiffness: 300, damping: 20 }}
                              onClick={handleMascotClick}
                            >
                              <CakePopMascot size="small" reaction={currentReaction || 'blowKiss'} loop={false} hideArms={true} />
                            </motion.div>
                          </div>
                          <motion.div className={styles.mascotHandRight} />
                          <motion.div className={styles.mascotHandLeft} />
                        </div>
                        <h2 className={styles.title}>Welcome to CakePopRush!</h2>
                        <p className={styles.subtitle}>You have successfully logged in.</p>
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
