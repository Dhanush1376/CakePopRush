import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth/authRoutes';
import adminInviteRoutes from './routes/auth/adminInviteRoutes';
import adminRoutes from './routes/admin/adminRoutes';
import userRoutes from './routes/users/userRoutes';
import productRoutes from './routes/products/productRoutes';
import categoryRoutes from './routes/categories/categoryRoutes';
import customOrderRoutes from './routes/customOrders/customOrderRoutes';
import locationRoutes from './routes/location/locationRoutes';
import cartRoutes from './routes/cart/cartRoutes';
import wishlistRoutes from './routes/wishlist/wishlistRoutes';
import orderRoutes from './routes/orders/orderRoutes';
import deliveryRoutes from './routes/delivery/deliveryRoutes';
import ApiError from './utils/ApiError';
import logger from './config/logger';

const app = express();

const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  ...(process.env.NODE_ENV !== 'production'
    ? ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173', 'http://127.0.0.1:3000']
    : []),
  ...(process.env.FRONTEND_URLS ? process.env.FRONTEND_URLS.split(',').map((s) => s.trim()) : []),
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, Postman, server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      if (process.env.NODE_ENV !== 'production') {
        return callback(null, true); // Dev flexible
      }
      return callback(new ApiError(403, 'Blocked by CORS policy', 'CORS_ERROR'));
    },
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', service: 'cakepoprush-backend', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/admin/invites', adminInviteRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/delivery', deliveryRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/cart', cartRoutes);
app.use('/api/v1/users/cart', cartRoutes);
app.use('/api/v1/wishlist', wishlistRoutes);
app.use('/api/v1/users/wishlist', wishlistRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/custom-orders', customOrderRoutes);
app.use('/api/v1/location', locationRoutes);

// 404 handler
app.use((req, _res, next) => {
  next(new ApiError(404, `Route ${req.method} ${req.originalUrl} not found`, 'NOT_FOUND'));
});

// Centralized error handling middleware
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const statusCode = err.statusCode || (err.status >= 400 && err.status < 600 ? err.status : 500);
  const code = err.code || 'INTERNAL_SERVER_ERROR';
  const rawMessage = err.message || 'An unexpected internal error occurred';

  if (statusCode >= 500) {
    logger.error(`[SERVER ERROR] ${statusCode} ${code}: ${rawMessage}`, err.stack);
  }

  const message =
    statusCode >= 500 && process.env.NODE_ENV === 'production'
      ? 'An unexpected error occurred. Please try again later.'
      : rawMessage;

  res.status(statusCode).json({
    success: false,
    message,
    code,
    ...(err.details ? { details: err.details } : {}),
  });
});

export default app;
