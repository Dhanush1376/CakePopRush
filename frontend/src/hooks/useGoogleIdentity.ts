import { useState, useEffect, useCallback, useRef } from 'react';

const GSI_SCRIPT_SRC = 'https://accounts.google.com/gsi/client';
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

let gsiScriptLoadPromise: Promise<void> | null = null;
let gsiScriptLoaded = false;

function loadGsiScript(): Promise<void> {
  if (gsiScriptLoaded) return Promise.resolve();
  if (gsiScriptLoadPromise) return gsiScriptLoadPromise;

  gsiScriptLoadPromise = new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${GSI_SCRIPT_SRC}"]`)) {
      if ((window as any).google?.accounts?.id) {
        gsiScriptLoaded = true;
        resolve();
        return;
      }
    }

    const script = document.createElement('script');
    script.src = GSI_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      gsiScriptLoaded = true;
      resolve();
    };
    script.onerror = () => {
      gsiScriptLoadPromise = null;
      reject(new Error('Failed to load Google Identity Services SDK'));
    };
    document.head.appendChild(script);
  });

  return gsiScriptLoadPromise;
}

export function useGoogleIdentity(
  onSuccess: (response: { credential: string }) => void,
  onError?: (errorMsg: string) => void
) {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const initializedRef = useRef(false);
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onSuccessRef.current = onSuccess;
    onErrorRef.current = onError;
  }, [onSuccess, onError]);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) {
      setError('Google Sign-In is not configured');
      return;
    }

    if (initializedRef.current) return;
    let cancelled = false;

    (async () => {
      try {
        await loadGsiScript();
        if (cancelled) return;

        const google = (window as any).google;
        if (!google?.accounts?.id) {
          throw new Error('Google Identity Services SDK not ready');
        }

        google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: (response: any) => {
            if (response.credential) {
              onSuccessRef.current?.(response);
            } else {
              onErrorRef.current?.('Google sign-in returned no credential');
            }
          },
          auto_select: false,
          cancel_on_tap_outside: true,
          itp_support: true,
        });

        initializedRef.current = true;
        setIsReady(true);
      } catch (err: any) {
        if (cancelled) return;
        const msg = err?.message || 'Failed to initialize Google Sign-In';
        setError(msg);
        onErrorRef.current?.(msg);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const triggerLogin = useCallback(() => {
    const google = (window as any).google;
    if (!isReady || !google?.accounts?.id) {
      onErrorRef.current?.('Google Sign-In is not initialized');
      return;
    }
    google.accounts.id.prompt();
  }, [isReady]);

  const renderGoogleButton = useCallback(
    (elementId: string) => {
      const google = (window as any).google;
      if (!isReady || !google?.accounts?.id) return;

      const btnElement = document.getElementById(elementId);
      if (btnElement) {
        google.accounts.id.renderButton(btnElement, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: 'continue_with',
          shape: 'pill',
          width: 380,
        });
      }
    },
    [isReady]
  );

  return { isReady, triggerLogin, renderGoogleButton, error };
}

export default useGoogleIdentity;
