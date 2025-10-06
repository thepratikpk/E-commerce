import express from 'express'
import cors from 'cors'
import cookieparser from 'cookie-parser'

const app=express();

const allowedOrigin =
  process.env.NODE_ENV === "production"
    ? process.env.PROD_ORIGIN
    : process.env.DEV_ORIGIN.split(",");

app.use(cors({
  origin: allowedOrigin,
  credentials: true
}));

// Add middleware to handle different authentication contexts
app.use((req, res, next) => {
  // Log request details for debugging
  const userAgent = req.get('User-Agent') || '';
  const referer = req.get('Referer') || '';
  const isAdminRequest = referer.includes(':5174') || referer.includes('admin') || req.path.includes('/admin');
  
  console.log('🌐 Request:', {
    path: req.path,
    method: req.method,
    isAdmin: isAdminRequest,
    referer: referer,
    hasAuthHeader: !!req.get('Authorization'),
    hasCookies: !!req.cookies?.accessToken
  });
  
  next();
});

app.use(express.json())
app.use(express.urlencoded({extended:true,limit:"16kb"}))
app.use(express.static("public"))

app.use(cookieparser());

// API endpoints
import userRouter from './routes/user.routes.js'
import productRouter from './routes/product.routes.js'
import cartRouter from './routes/cart.routes.js'
import orderRouter from './routes/order.routes.js';
import eventRoutes from './routes/event.routes.js'

app.use('/api/v1/user',userRouter)
app.use('/api/v1/product',productRouter)
app.use('/api/v1/cart',cartRouter)
app.use('/api/v1/order',orderRouter)
app.use('/api/v1/events',eventRoutes)
// Global error handling middleware
app.use((err, req, res, next) => {
  // If error is already handled, pass it on
  if (res.headersSent) {
    return next(err);
  }

  // Default error values
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let success = false;

  // Log error in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', err);
  }

  // Send JSON error response
  res.status(statusCode).json({
    success,
    message,
    statusCode,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

export {app}