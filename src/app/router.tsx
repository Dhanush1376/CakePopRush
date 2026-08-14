import { createBrowserRouter } from 'react-router-dom'
import App from '@/App'
import { HomePage } from '@/pages/storefront/HomePage'
import { ShopPage } from '@/pages/storefront/ShopPage'
import { ProductDetailPage } from '@/pages/storefront/product/ProductDetailPage'
import { ProductReviewsPage } from '@/pages/storefront/product/ProductReviewsPage'
import { CartPage } from '@/pages/storefront/cart/CartPage'
import { CheckoutDeliveryPage } from '@/pages/storefront/checkout/CheckoutDeliveryPage'
import { CheckoutPaymentPage } from '@/pages/storefront/checkout/CheckoutPaymentPage'
import { DesignSystemPage } from '@/pages/storefront/DesignSystemPage'
import { MascotPlayground } from '@/pages/dev/MascotPlayground'
import { ServerErrorPage } from '@/pages/error/ServerErrorPage'
import { NotFoundPage } from '@/pages/error/NotFoundPage'
import { ErrorTrackingPanel } from '@/pages/admin/ErrorTrackingPanel'
import { WishlistPage } from '@/pages/storefront/wishlist/WishlistPage'
import { ProfilePage } from '@/pages/storefront/profile/ProfilePage'
import { TermsPage } from '@/pages/storefront/legal/TermsPage'
import { PrivacyPage } from '@/pages/storefront/legal/PrivacyPage'
import { ContactPage } from '@/pages/storefront/info/ContactPage'
import { OrdersPage } from '@/pages/storefront/orders/OrdersPage'
import { OrderTrackingPage } from '@/pages/storefront/orders/OrderTrackingPage'
import { OrderSuccessPage } from '@/pages/storefront/orders/OrderSuccessPage'
import { AdminLayout } from '@/pages/admin/AdminLayout'
import { AdminDashboard } from '@/pages/admin/AdminDashboard'
import { AdminOrders } from '@/pages/admin/pages/AdminOrders'
import { AdminNewOrder } from '@/pages/admin/pages/AdminNewOrder'
import { AdminProducts } from '@/pages/admin/pages/AdminProducts'
import { AdminAddProduct } from '@/pages/admin/pages/AdminAddProduct'
import { AdminCategories } from '@/pages/admin/pages/AdminCategories'
import { AdminCustomers } from '@/pages/admin/pages/AdminCustomers'
import { AdminCustomOrders } from '@/pages/admin/pages/AdminCustomOrders'
import { AdminReviews } from '@/pages/admin/pages/AdminReviews'
import { AdminCoupons } from '@/pages/admin/pages/AdminCoupons'
import { AdminAddCoupon } from '@/pages/admin/pages/AdminAddCoupon'
import { AdminAnalytics } from '@/pages/admin/pages/AdminAnalytics'
import { AdminBanners } from '@/pages/admin/pages/AdminBanners'
import { AdminSettings } from '@/pages/admin/pages/AdminSettings'
import { AdminUsers } from '@/pages/admin/pages/AdminUsers'
import { AdminNotifications } from '@/pages/admin/pages/AdminNotifications'
import { AdminStorefrontCMS } from '@/pages/admin/pages/AdminStorefrontCMS'
import { AdminAddCustomOrder } from '@/pages/admin/pages/AdminAddCustomOrder'
import { AdminErrorBoundary } from '@/pages/admin/components/AdminErrorBoundary'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <ServerErrorPage />,
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
        element: <CheckoutDeliveryPage />,
      },
      {
        path: 'payment',
        element: <CheckoutPaymentPage />,
      },
      {
        path: 'profile',
        element: <ProfilePage />,
      },
      {
        path: 'orders',
        element: <OrdersPage />,
      },
      {
        path: 'orders/:id',
        element: <OrderTrackingPage />,
      },
      {
        path: 'order-success/:id',
        element: <OrderSuccessPage />,
      },

      {
        path: 'product/:id/reviews',
        element: <ProductReviewsPage />,
      },
      {
        path: 'design-system',
        element: <DesignSystemPage />,
      },
      {
        path: 'cakepopmascot',
        element: <MascotPlayground />,
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
        path: '*',
        element: <NotFoundPage />,
      }
    ],
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    errorElement: <AdminErrorBoundary />,
    children: [
      {
        index: true,
        element: <AdminDashboard />,
      },
      { path: 'orders', element: <AdminOrders /> },
      { path: 'orders/new', element: <AdminNewOrder /> },
      { path: 'products', element: <AdminProducts /> },
      { path: 'products/add', element: <AdminAddProduct /> },
      { path: 'categories', element: <AdminCategories /> },
      { path: 'customers', element: <AdminCustomers /> },
      { path: 'custom-orders', element: <AdminCustomOrders /> },
      { path: 'custom-orders/add', element: <AdminAddCustomOrder /> },
      { path: 'reviews', element: <AdminReviews /> },
      { path: 'coupons', element: <AdminCoupons /> },
      { path: 'coupons/add', element: <AdminAddCoupon /> },
      { path: 'analytics', element: <AdminAnalytics /> },
      { path: 'banners', element: <AdminBanners /> },
      { path: 'settings', element: <AdminSettings /> },
      { path: 'users', element: <AdminUsers /> },
      { path: 'notifications', element: <AdminNotifications /> },
      { path: 'storefront-cms', element: <AdminStorefrontCMS /> },
      { path: 'errors', element: <ErrorTrackingPanel /> },
    ]
  }
])
