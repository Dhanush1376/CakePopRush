import { useState, useCallback, useRef } from 'react';
import orderService, { CreateOrderPayload } from '@/services/api/orderService';
import { useToast } from '@/components/ui/ToastContext';

declare global {
  interface Window {
    Razorpay?: any;
  }
}

const RAZORPAY_CHECKOUT_URL = 'https://checkout.razorpay.com/v1/checkout.js';
let razorpayPromise: Promise<boolean> | null = null;

const loadRazorpayScript = async (retries = 2): Promise<boolean> => {
  if (razorpayPromise) return razorpayPromise;

  razorpayPromise = new Promise((resolve) => {
    if (document.querySelector(`script[src="${RAZORPAY_CHECKOUT_URL}"]`)) {
      if (window.Razorpay) return resolve(true);
    }
    const script = document.createElement('script');
    script.src = RAZORPAY_CHECKOUT_URL;
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      razorpayPromise = null;
      resolve(false);
    };
    document.body.appendChild(script);
  });

  const result = await razorpayPromise;
  if (!result && retries > 0) {
    await new Promise((r) => setTimeout(r, 1000));
    return loadRazorpayScript(retries - 1);
  }
  return result;
};

export const useRazorpay = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const paymentInProgress = useRef(false);

  const processPayment = useCallback(
    async (
      orderPayload: CreateOrderPayload,
      onSuccess: (order: any) => void,
      onError?: (error: any) => void
    ) => {
      if (paymentInProgress.current) {
        return;
      }

      paymentInProgress.current = true;
      setIsLoading(true);

      const finalize = () => {
        paymentInProgress.current = false;
        setIsLoading(false);
      };

      try {
        // 1. Create order / payment intent on backend
        const res = await orderService.create(orderPayload);

        if (!res.success) {
          toast({
            type: 'error',
            title: 'Order Failed',
            message: res.message || 'Failed to initialize order',
          });
          onError?.(res);
          return finalize();
        }

        // If COD or instant checkout
        if (res.data.isInstantCheckout || res.data.type === 'cod') {
          onSuccess(res.data.order);
          return finalize();
        }

        // 2. Online Razorpay flow
        const { razorpayOrder } = res.data;
        if (!razorpayOrder?.id || !razorpayOrder?.amount) {
          throw new Error('Payment gateway returned an invalid order payload');
        }

        const isLoaded = await loadRazorpayScript();
        if (!isLoaded) {
          toast({
            type: 'error',
            title: 'SDK Error',
            message: 'Razorpay SDK failed to load. Please check your internet connection.',
          });
          onError?.(new Error('Razorpay SDK failed to load'));
          return finalize();
        }

        const options = {
          key: (import.meta as any).env.VITE_RAZORPAY_KEY_ID || 'rzp_test_placeholder',
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency || 'INR',
          name: 'CakePopRush',
          description: 'Delicious Pops, Brownies & Treats',
          order_id: razorpayOrder.id,
          handler: async (response: any) => {
            try {
              // 3. Backend signature verification
              const verifyRes = await orderService.verifyPayment({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              });

              if (verifyRes.success) {
                toast({
                  type: 'success',
                  title: 'Payment Successful',
                  message: 'Your payment was confirmed successfully!',
                });
                onSuccess(verifyRes.data);
              } else {
                toast({
                  type: 'error',
                  title: 'Payment Verification Failed',
                  message: verifyRes.message || 'Signature mismatch',
                });
                onError?.(verifyRes);
              }
            } catch (err: any) {
              const msg = err.response?.data?.message || err.message || 'Payment verification failed';
              toast({
                type: 'error',
                title: 'Verification Error',
                message: msg,
              });
              onError?.(err);
            } finally {
              finalize();
            }
          },
          modal: {
            ondismiss: () => {
              toast({
                type: 'error',
                title: 'Payment Dismissed',
                message: 'Payment was cancelled before completion.',
              });
              onError?.(new Error('Payment dismissed by user'));
              finalize();
            },
          },
          prefill: {
            name: orderPayload.shippingAddress.recipientName,
            contact: orderPayload.shippingAddress.phone,
            email: orderPayload.shippingAddress.email,
          },
          theme: {
            color: '#F20D6F', // CakePopRush brand pink
          },
        };

        const razorpayInstance = new window.Razorpay(options);
        razorpayInstance.on('payment.failed', (failRes: any) => {
          toast({
            type: 'error',
            title: 'Payment Failed',
            message: failRes.error?.description || 'Transaction declined by bank/gateway.',
          });
          onError?.(failRes.error);
          finalize();
        });

        razorpayInstance.open();
      } catch (err: any) {
        const msg = err.response?.data?.message || err.message || 'Payment initiation failed';
        toast({
          type: 'error',
          title: 'Checkout Error',
          message: msg,
        });
        onError?.(err);
        finalize();
      }
    },
    [toast]
  );

  return { processPayment, isLoading };
};

export default useRazorpay;
