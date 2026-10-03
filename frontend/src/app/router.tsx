import React, { Suspense, lazy } from 'react'
import { createBrowserRouter, Navigate, useParams } from 'react-router-dom'
import App from '@/App'
import { HomePage } from '@/pages/storefront/HomePage'
import { ShopPage } from '@/pages/storefront/ShopPage'
import { ProductDetailPage } from '@/pages/storefront/product/ProductDetailPage'
import { CartPage } from '@/pages/storefront/cart/CartPage'
import { WishlistPage } from '@/pages/storefront/wishlist/WishlistPage'

import { AdminErrorBoundary } from '@/features/admin/components/AdminErrorBoundary'
import { GlobalErrorBoundary } from '@/components/error/GlobalErrorBoundary'
import { StorefrontErrorBoundary } from '@/components/error/StorefrontErrorBoundary'
import { NotFoundPage } from '@/pages/error/NotFoundPage'

import { ProfilePage } from '@/pages/storefront/profile/ProfilePage'
import { TermsPage } from '@/pages/storefront/legal/TermsPage'
import { PrivacyPage } from '@/pages/storefront/legal/PrivacyPage'
import { ContactPage } from '@/pages/storefront/info/ContactPage'

import { SuspenseFallback } from '@/components/ui/SuspenseFallback'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { AdminProtectedRoute } from '@/components/auth/AdminProtectedRoute'
import { DeliveryProtectedRoute } from '@/components/auth/DeliveryProtectedRoute'

// Direct redirect from legacy /order-success/:id to /orders/:id
const OrderSuccessRedirect = () => {
  const { id } = useParams();
  return <Navigate to={`/orders/${id}`} replace />;
};

// Lazy-loaded heavy storefront pages
const ProductReviewsPage = lazy(() => import('@/pages/storefront/product/ProductReviewsPage').then(m => ({ default: m.ProductReviewsPage })))
const CheckoutDeliveryPage = lazy(() => import('@/pages/storefront/checkout/CheckoutDeliveryPage').then(m => ({ default: m.CheckoutDeliveryPage })))
const CheckoutPaymentPage = lazy(() => import('@/pages/storefront/checkout/CheckoutPaymentPage').then(m => ({ default: m.CheckoutPaymentPage })))
const DesignSystemPage = lazy(() => import('@/pages/storefront/DesignSystemPage').then(m => ({ default: m.DesignSystemPage })))
const OrdersPage = lazy(() => import('@/pages/storefront/orders/OrdersPage').then(m => ({ default: m.OrdersPage })))
const OrderTrackingPage = lazy(() => import('@/pages/storefront/orders/LiveTrackingPage').then(m => ({ default: m.LiveTrackingPage })))
const LiveTrackingPage = OrderTrackingPage
const CustomOrdersPage = lazy(() => import('@/pages/storefront/custom-orders/CustomOrdersPage').then(m => ({ default: m.CustomOrdersPage })))
const CustomOrderDetailPage = lazy(() => import('@/pages/storefront/custom-orders/CustomOrderDetailPage').then(m => ({ default: m.CustomOrderDetailPage })))
const AcceptInvitePage = lazy(() => import('@/pages/storefront/AcceptInvitePage').then(m => ({ default: m.AcceptInvitePage })))

// Lazy-loaded admin pages
const AdminLayout = lazy(() => import('@/pages/admin/AdminLayout').then(m => ({ default: m.AdminLayout })))
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })))
const AdminOrders = lazy(() => import('@/pages/admin/pages/AdminOrders').then(m => ({ default: m.AdminOrders })))
const AdminOrderDetail = lazy(() => import('@/pages/admin/pages/AdminOrderDetail').then(m => ({ default: m.AdminOrderDetail })))
const AdminProducts = lazy(() => import('@/pages/admin/pages/AdminProducts').then(m => ({ default: m.AdminProducts })))
const AdminAddProduct = lazy(() => import('@/pages/admin/pages/AdminAddProduct').then(m => ({ default: m.AdminAddProduct })))
const AdminCategories = lazy(() => import('@/pages/admin/pages/AdminCategories').then(m => ({ default: m.AdminCategories })))
const AdminCustomers = lazy(() => import('@/pages/admin/pages/AdminCustomers').then(m => ({ default: m.AdminCustomers })))
const AdminCustomOrders = lazy(() => import('@/pages/admin/pages/AdminCustomOrders').then(m => ({ default: m.AdminCustomOrders })))
const AdminReviews = lazy(() => import('@/pages/admin/pages/AdminReviews').then(m => ({ default: m.AdminReviews })))
const AdminCoupons = lazy(() => import('@/pages/admin/pages/AdminCoupons').then(m => ({ default: m.AdminCoupons })))
const AdminAddCoupon = lazy(() => import('@/pages/admin/pages/AdminAddCoupon').then(m => ({ default: m.AdminAddCoupon })))
const AdminAnalytics = lazy(() => import('@/pages/admin/pages/AdminAnalytics').then(m => ({ default: m.AdminAnalytics })))
const AdminBanners = lazy(() => import('@/pages/admin/pages/AdminBanners').then(m => ({ default: m.AdminBanners })))
const AdminSettings = lazy(() => import('@/pages/admin/pages/AdminSettings').then(m => ({ default: m.AdminSettings })))
const AdminUsers = lazy(() => import('@/pages/admin/pages/AdminUsers').then(m => ({ default: m.AdminUsers })))
const AdminNotifications = lazy(() => import('@/pages/admin/pages/AdminNotifications').then(m => ({ default: m.AdminNotifications })))
const AdminStorefrontCMS = lazy(() => import('@/pages/admin/pages/AdminStorefrontCMS').then(m => ({ default: m.AdminStorefrontCMS })))
const AdminAddCustomOrder = lazy(() => import('@/pages/admin/pages/AdminAddCustomOrder').then(m => ({ default: m.AdminAddCustomOrder })))
const AdminDeliveryAgents = lazy(() => import('@/pages/admin/pages/AdminDeliveryAgents').then(m => ({ default: m.AdminDeliveryAgents })))
const DeliveryAgentPortal = lazy(() => import('@/pages/delivery/DeliveryAgentPortal').then(m => ({ default: m.DeliveryAgentPortal })))
const DeliveryOrderDetailPage = lazy(() => import('@/pages/delivery/DeliveryOrderDetailPage').then(m => ({ default: m.DeliveryOrderDetailPage })))
const ErrorTrackingPanel = lazy(() => import('@/pages/admin/ErrorTrackingPanel').then(m => ({ default: m.ErrorTrackingPanel })))
const AdminMascotPlayground = lazy(() => import('@/pages/admin/pages/AdminMascotPlayground').then(m => ({ default: m.AdminMascotPlayground })))

import { DeliveryAgentPortalSkeleton, DeliveryOrderDetailSkeleton } from '@/pages/delivery/components'

// Helper for wrapping lazy routes
const LazyWrap = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<SuspenseFallback />}>
    {children}
  </Suspense>
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <GlobalErrorBoundary />,
    children: [
      {
        errorElement: <StorefrontErrorBoundary />,
        children: [
          {
            index: true,
            element: <HomePage />,
          },
          {
            path: 'shop',
            element: <ShopPage />,
          },
          {
            path: 'product/:id',
            element: <ProductDetailPage />,
          },
          {
            path: 'wishlist',
            element: <WishlistPage />,
          },
          {
            path: 'cart',
            element: <CartPage />,
          },
          {
            path: 'checkout',
            element: <LazyWrap><CheckoutDeliveryPage /></LazyWrap>,
          },
          {
            path: 'payment',
            element: <LazyWrap><CheckoutPaymentPage /></LazyWrap>,
          },
          {
            path: 'profile',
            element: <ProtectedRoute><ProfilePage /></ProtectedRoute>,
          },
          {
            path: 'profile/addresses',
            element: <ProtectedRoute><ProfilePage initialModal="addresses" /></ProtectedRoute>,
          },
          {
            path: 'orders',
            element: <ProtectedRoute><LazyWrap><OrdersPage /></LazyWrap></ProtectedRoute>,
          },
          {
            path: 'orders/:id',
            element: <ProtectedRoute><LazyWrap><OrderTrackingPage /></LazyWrap></ProtectedRoute>,
          },
          {
            path: 'tracking/live',
            element: <ProtectedRoute><LazyWrap><LiveTrackingPage /></LazyWrap></ProtectedRoute>,
          },
          {
            path: 'order-success/:id',
            element: <OrderSuccessRedirect />,
          },
          {
            path: 'product/:id/reviews',
            element: <LazyWrap><ProductReviewsPage /></LazyWrap>,
          },
          {
            path: 'design-system',
            element: <LazyWrap><DesignSystemPage /></LazyWrap>,
          },
          {
            path: 'terms',
            element: <TermsPage />,
          },
          {
            path: 'contact',
            element: <ContactPage />,
          },
          {
            path: 'privacy',
            element: <PrivacyPage />,
          },
          {
            path: 'custom-orders',
            element: <LazyWrap><CustomOrdersPage /></LazyWrap>,
          },
          {
            path: 'custom-orders/:id',
            element: <LazyWrap><CustomOrderDetailPage /></LazyWrap>,
          },
          {
            path: 'custom-orders/:id/edit',
            element: <ProtectedRoute><LazyWrap><CustomOrdersPage /></LazyWrap></ProtectedRoute>,
          },
          {
            path: 'custom-orders/edit/:id',
            element: <ProtectedRoute><LazyWrap><CustomOrdersPage /></LazyWrap></ProtectedRoute>,
          },
          {
            path: 'accept-invite',
            element: <LazyWrap><AcceptInvitePage /></LazyWrap>,
          },
          {
            path: '*',
            element: <NotFoundPage />,
          }
        ],
      }
    ],
  },
  {
    path: '/delivery',
    element: (
      <DeliveryProtectedRoute>
        <Suspense fallback={<DeliveryAgentPortalSkeleton />}>
          <DeliveryAgentPortal />
        </Suspense>
      </DeliveryProtectedRoute>
    ),
    errorElement: <GlobalErrorBoundary />,
  },
  {
    path: '/delivery/orders/:id',
    element: (
      <DeliveryProtectedRoute>
        <Suspense fallback={<DeliveryOrderDetailSkeleton />}>
          <DeliveryOrderDetailPage />
        </Suspense>
      </DeliveryProtectedRoute>
    ),
    errorElement: <GlobalErrorBoundary />,
  },
  {
    path: '/admin',
    element: <AdminProtectedRoute><LazyWrap><AdminLayout /></LazyWrap></AdminProtectedRoute>,
    errorElement: <AdminErrorBoundary />,
    children: [
      {
        index: true,
        element: <LazyWrap><AdminDashboard /></LazyWrap>,
      },
      { path: 'orders', element: <LazyWrap><AdminOrders /></LazyWrap> },
      { path: 'orders/:orderId', element: <LazyWrap><AdminOrderDetail /></LazyWrap> },
      { path: 'delivery-agents', element: <LazyWrap><AdminDeliveryAgents /></LazyWrap> },
      { path: 'products', element: <LazyWrap><AdminProducts /></LazyWrap> },
      { path: 'products/add', element: <LazyWrap><AdminAddProduct /></LazyWrap> },
      { path: 'categories', element: <LazyWrap><AdminCategories /></LazyWrap> },
      { path: 'customers', element: <LazyWrap><AdminCustomers /></LazyWrap> },
      { path: 'customers/:customerId', element: <LazyWrap><AdminCustomers /></LazyWrap> },
      { path: 'custom-orders', element: <LazyWrap><AdminCustomOrders /></LazyWrap> },
      { path: 'custom-orders/add', element: <LazyWrap><AdminAddCustomOrder /></LazyWrap> },
      { path: 'custom-orders/builder', element: <LazyWrap><AdminCustomOrders /></LazyWrap> },
      { path: 'reviews', element: <LazyWrap><AdminReviews /></LazyWrap> },
      { path: 'coupons', element: <LazyWrap><AdminCoupons /></LazyWrap> },
      { path: 'coupons/add', element: <LazyWrap><AdminAddCoupon /></LazyWrap> },
      { path: 'analytics', element: <LazyWrap><AdminAnalytics /></LazyWrap> },
      { path: 'banners', element: <LazyWrap><AdminBanners /></LazyWrap> },
      { path: 'settings', element: <LazyWrap><AdminSettings /></LazyWrap> },
      { path: 'users', element: <LazyWrap><AdminUsers /></LazyWrap> },
      { path: 'notifications', element: <LazyWrap><AdminNotifications /></LazyWrap> },
      { path: 'storefront-cms', element: <LazyWrap><AdminStorefrontCMS /></LazyWrap> },
      { path: 'errors', element: <LazyWrap><ErrorTrackingPanel /></LazyWrap> },
      { path: 'mascot', element: <LazyWrap><AdminMascotPlayground /></LazyWrap> },
    ]
  }
])
