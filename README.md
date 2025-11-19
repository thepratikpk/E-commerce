# E-Commerce Platform with AI Recommendations

A full-stack e-commerce platform built with React, Node.js, Express, MongoDB, and Python. Features include user authentication, product management, shopping cart, order processing, payment integration with Stripe, and AI-powered product recommendations using machine learning.

## 🚀 Features

### Frontend (Customer)
- **User Authentication**: Register, login, logout with JWT tokens
- **Product Browsing**: View products with images, prices, and details
- **AI Recommendations**: Personalized product suggestions using machine learning
- **Recently Viewed**: Track and display recently viewed products
- **Shopping Cart**: Add/remove items, update quantities with smart cart management
- **Order Management**: Place orders, view order history with detailed tracking
- **Payment Integration**: COD and Stripe payment options with secure processing
- **Responsive Design**: Mobile-friendly interface with modern UI/UX
- **Profile Management**: Update user information and preferences
- **Error Handling**: Comprehensive error boundaries and user feedback

### Admin Panel
- **Product Management**: Add, edit, delete products with image upload
- **Order Management**: View all orders, update order status with real-time updates
- **User Management**: View customer information and analytics
- **Dashboard**: Order statistics and comprehensive analytics
- **Secure Access**: Role-based authentication for admin operations

### Backend API
- **RESTful API**: Clean, scalable API architecture with proper HTTP methods
- **Authentication**: JWT-based authentication with role-based access control
- **Database**: MongoDB with Mongoose ODM and optimized queries
- **File Upload**: Cloudinary integration for image storage and optimization
- **Payment Processing**: Stripe integration for secure payment handling
- **Order Processing**: Complete order lifecycle management with status tracking
- **Event Logging**: User interaction tracking for ML recommendations
- **CORS Configuration**: Environment-specific CORS setup for security
- **Rate Limiting**: API rate limiting and request validation

### AI Recommendation Service
- **Machine Learning**: SVD-based collaborative filtering for personalized recommendations
- **Real-time Training**: Automatic model retraining with new user interactions
- **Cold Start Handling**: Smart fallback recommendations for new users
- **Popular Products**: Trending product recommendations based on user behavior
- **API Integration**: RESTful API for recommendation requests
- **Performance Optimization**: Efficient model serving with caching

## 🛠 Tech Stack

### Frontend (Customer App)
- **React 19.1.0** - Modern UI library with latest features
- **React Router DOM 7.8.2** - Client-side routing and navigation
- **Tailwind CSS 4.1.12** - Utility-first CSS framework
- **Vite 7.0.4** - Fast build tool and development server
- **Axios 1.12.2** - Promise-based HTTP client

### Backend API
- **Node.js 22.17.0** - JavaScript runtime environment
- **Express.js 5.1.0** - Fast, unopinionated web framework
- **MongoDB** - NoSQL document database
- **Mongoose 8.17.0** - MongoDB object modeling for Node.js
- **JWT (jsonwebtoken 9.0.2)** - Secure authentication tokens
- **Cloudinary 2.7.0** - Cloud-based image and video management
- **Stripe 18.4.0** - Payment processing platform
- **bcryptjs 3.0.2** - Password hashing library
- **CORS 2.8.5** - Cross-Origin Resource Sharing middleware
- **Multer 2.0.2** - File upload handling middleware

### Admin Panel
- **React 19.1.1** - UI library for admin interface
- **React Router DOM 7.9.1** - Admin routing
- **Tailwind CSS 4.1.13** - Consistent styling
- **React Toastify 11.0.5** - Toast notifications
- **Axios 1.12.2** - API communication

### AI Recommendation Service
- **Python 3.10.9** - Programming language for ML
- **Flask 3.1.2** - Lightweight web framework
- **Flask-CORS 6.0.1** - Cross-origin resource sharing
- **Flask-JWT-Extended 4.7.1** - JWT authentication for Flask
- **scikit-surprise 1.1.4** - Recommendation system library
- **pandas 2.3.3** - Data manipulation and analysis
- **numpy 1.26.4** - Numerical computing library
- **pymongo 4.15.2** - MongoDB driver for Python
- **joblib 1.5.2** - Model serialization and parallel computing
- **python-dotenv 1.1.1** - Environment variable management

### Development Tools
- **Nodemon 3.1.10** - Auto-restart development server
- **ESLint 9.30.1** - JavaScript linting
- **Vite** - Fast development and build tool
- **Git** - Version control system

## 📁 Project Structure

```
ecommerce/
├── frontend/                    # Customer-facing React app
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   │   ├── ForYou.jsx       # AI recommendation component
│   │   │   ├── RecentlyViewed.jsx # Recently viewed products
│   │   │   ├── ErrorBoundary.jsx # Error handling component
│   │   │   └── ProtectedRoute.jsx # Route protection
│   │   ├── pages/               # Page components
│   │   │   ├── Home.jsx         # Homepage with recommendations
│   │   │   ├── Product.jsx      # Product detail page
│   │   │   ├── Cart.jsx         # Shopping cart
│   │   │   ├── Order.jsx        # Order management
│   │   │   └── Profile.jsx      # User profile
│   │   ├── context/             # React context providers
│   │   │   └── ShopContext.jsx  # Global state management
│   │   ├── utils/               # Utility functions
│   │   │   ├── api.js           # API client configuration
│   │   │   └── toast.js         # Toast notification utilities
│   │   ├── hooks/               # Custom React hooks
│   │   │   └── useErrorHandler.js # Error handling hook
│   │   └── assets/              # Static assets and images
│   ├── .env                     # Environment variables
│   └── package.json             # Dependencies and scripts
├── admin/                       # Admin panel React app
│   ├── src/
│   │   ├── components/          # Admin-specific components
│   │   │   └── Login.jsx        # Admin authentication
│   │   ├── pages/               # Admin pages
│   │   │   ├── Add.jsx          # Add products
│   │   │   ├── List.jsx         # Product listing
│   │   │   └── Orders.jsx       # Order management
│   │   └── assets/              # Admin assets
│   ├── .env                     # Admin environment variables
│   └── package.json             # Admin dependencies
├── backend/                     # Node.js/Express API server
│   ├── src/
│   │   ├── controllers/         # Business logic controllers
│   │   │   ├── user.controller.js    # User management
│   │   │   ├── product.controller.js # Product operations
│   │   │   ├── cart.controller.js    # Cart management
│   │   │   ├── order.controller.js   # Order processing
│   │   │   └── event.controller.js   # User event tracking
│   │   ├── models/              # Database schemas
│   │   │   ├── user.model.js    # User schema
│   │   │   ├── product.model.js # Product schema
│   │   │   ├── order.model.js   # Order schema
│   │   │   └── event.model.js   # Event tracking schema
│   │   ├── routes/              # API route definitions
│   │   │   ├── user.routes.js   # User endpoints
│   │   │   ├── product.routes.js # Product endpoints
│   │   │   ├── cart.routes.js   # Cart endpoints
│   │   │   ├── order.routes.js  # Order endpoints
│   │   │   └── event.routes.js  # Event tracking endpoints
│   │   ├── middlewares/         # Custom middleware functions
│   │   │   └── auth.middlewares.js # Authentication middleware
│   │   ├── utils/               # Utility functions
│   │   │   ├── cloudinary.js    # Image upload utilities
│   │   │   ├── ApiError.js      # Error handling
│   │   │   └── ApiResponse.js   # Response formatting
│   │   ├── db/                  # Database configuration
│   │   │   └── db.js            # MongoDB connection
│   │   ├── app.js               # Express app configuration
│   │   └── index.js             # Server entry point
│   ├── .env                     # Backend environment variables
│   └── package.json             # Backend dependencies
├── recommendation-service/       # Python ML recommendation service
│   ├── app.py                   # Flask application main file
│   ├── train.py                 # ML model training script
│   ├── .env                     # ML service environment variables
│   ├── venv/                    # Python virtual environment
│   ├── recommendation_model.joblib    # Trained ML model
│   ├── model_metadata.joblib    # Model metadata and parameters
│   └── popular_products.joblib  # Popular products cache
├── .gitignore                   # Git ignore rules
└── README.md                    # Project documentation
```

## 🚀 Getting Started

### System Requirements

#### Required Software
- **Node.js**: v22.17.0 or higher (LTS recommended)
- **Python**: 3.10.9 or higher (for AI recommendation service)
- **MongoDB**: 4.4 or higher (local installation or MongoDB Atlas)
- **Git**: Latest version for version control

#### Required Accounts & Services
- **MongoDB Atlas**: Cloud database service (or local MongoDB installation)
- **Cloudinary**: Image storage and optimization service
- **Stripe**: Payment processing service (for online payments)

#### Development Tools (Recommended)
- **VS Code**: Code editor with extensions for JavaScript/Python
- **MongoDB Compass**: GUI for MongoDB database management
- **Postman**: API testing and development
- **Node Version Manager (nvm)**: For managing Node.js versions

### Installation & Setup

#### 1. Clone the Repository
```bash
git clone <repository-url>
cd ecommerce
```

#### 2. Backend API Setup
```bash
cd backend
npm install
```

Create `.env` file in backend directory:
```env
# Database Configuration
MONGODB_URI=your_mongodb_connection_string
DB_NAME=E-commerce

# Server Configuration
PORT=5001
NODE_ENV=development

# CORS Configuration
DEV_ORIGIN=http://localhost:5175,http://localhost:5173,http://localhost:5174,http://localhost:3000
PROD_ORIGIN=your_production_frontend_url

# JWT Configuration
ACCESS_TOKEN_SECRET=your_super_secure_jwt_secret_key_here
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your_super_secure_refresh_secret_key_here
REFRESH_TOKEN_EXPIRY=10d

# Cloudinary Configuration (Image Storage)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Stripe Configuration (Payment Processing)
STRIP_SECRET_KEY=your_stripe_secret_key

# Business Configuration
DELIVERY_CHARGE=10
CURRENCY=inr
```

Start backend server:
```bash
npm run dev
```
Backend will run on: `http://localhost:5001`

#### 3. AI Recommendation Service Setup
```bash
cd recommendation-service

# Create Python virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt
```

Create `.env` file in recommendation-service directory:
```env
# MongoDB Configuration (same as backend)
MONGO_URI=your_mongodb_connection_string

# JWT Configuration (same secret as backend)
JWT_SECRET_KEY=your_super_secure_jwt_secret_key_here

# Flask Configuration
FLASK_ENV=development
```

Create `requirements.txt` file:
```txt
Flask==3.1.2
flask-cors==6.0.1
Flask-JWT-Extended==4.7.1
pandas==2.3.3
numpy==1.26.4
scikit-surprise==1.1.4
pymongo==4.15.2
joblib==1.5.2
python-dotenv==1.1.1
```

Train the initial ML model:
```bash
python train.py
```

Start recommendation service:
```bash
python app.py
```
Recommendation service will run on: `http://localhost:5000`

#### 4. Frontend (Customer App) Setup
```bash
cd frontend
npm install
```

Create `.env` file in frontend directory:
```env
# Backend API Configuration
VITE_BACKEND_URL=http://localhost:5001

# Recommendation Service Configuration
VITE_RECOMMENDATION_URL=http://localhost:5000
```

Start frontend development server:
```bash
npm run dev
```
Frontend will run on: `http://localhost:5173`

#### 5. Admin Panel Setup
```bash
cd admin
npm install
```

Create `.env` file in admin directory:
```env
# Backend API Configuration
VITE_BACKEND_URL=http://localhost:5001
```

Start admin panel:
```bash
npm run dev
```
Admin panel will run on: `http://localhost:5174`

#### 6. Verify Installation

1. **Backend API**: Visit `http://localhost:5001` - should show API status
2. **Recommendation Service**: Visit `http://localhost:5000` - should show service info
3. **Frontend**: Visit `http://localhost:5173` - should show the e-commerce homepage
4. **Admin Panel**: Visit `http://localhost:5174` - should show admin login page

#### 7. Initial Setup Steps

1. **Create Admin User**: Use the admin registration endpoint or create directly in MongoDB
2. **Add Products**: Use the admin panel to add initial products
3. **Train ML Model**: The recommendation service will automatically retrain as users interact
4. **Test Payments**: Use Stripe test keys for payment testing

## 📦 Detailed Dependencies

### Backend Dependencies (Node.js)
```json
{
  "dependencies": {
    "bcryptjs": "^3.0.2",           // Password hashing
    "cloudinary": "^2.7.0",        // Image storage service
    "cookie-parser": "^1.4.7",     // Cookie parsing middleware
    "cors": "^2.8.5",              // Cross-origin resource sharing
    "dotenv": "^17.2.1",           // Environment variable management
    "express": "^5.1.0",           // Web application framework
    "jsonwebtoken": "^9.0.2",      // JWT token generation/verification
    "mongoose": "^8.17.0",         // MongoDB object modeling
    "multer": "^2.0.2",            // File upload handling
    "stripe": "^18.4.0",           // Payment processing
    "validator": "^13.15.15"       // Data validation utilities
  },
  "devDependencies": {
    "nodemon": "^3.1.10"           // Development server auto-restart
  }
}
```

### Frontend Dependencies (React)
```json
{
  "dependencies": {
    "@tailwindcss/vite": "^4.1.12", // Tailwind CSS integration
    "axios": "^1.12.2",             // HTTP client for API calls
    "react": "^19.1.0",             // React library
    "react-dom": "^19.1.0",         // React DOM rendering
    "react-router-dom": "^7.8.2"    // Client-side routing
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.6.0", // Vite React plugin
    "eslint": "^9.30.1",              // JavaScript linting
    "tailwindcss": "^4.1.12",         // CSS framework
    "vite": "^7.0.4"                  // Build tool and dev server
  }
}
```

### Admin Panel Dependencies
```json
{
  "dependencies": {
    "react": "^19.1.1",             // React library
    "react-dom": "^19.1.1",         // React DOM rendering
    "react-router-dom": "^7.9.1",   // Admin routing
    "react-toastify": "^11.0.5",    // Toast notifications
    "tailwindcss": "^4.1.13",       // CSS framework
    "axios": "^1.12.2"              // HTTP client
  }
}
```

### Python ML Service Dependencies
```txt
Flask==3.1.2                    # Web framework for Python
flask-cors==6.0.1               # CORS support for Flask
Flask-JWT-Extended==4.7.1       # JWT authentication for Flask
pandas==2.3.3                   # Data manipulation and analysis
numpy==1.26.4                   # Numerical computing
scikit-surprise==1.1.4          # Recommendation system library
pymongo==4.15.2                 # MongoDB driver for Python
joblib==1.5.2                   # Model serialization
python-dotenv==1.1.1            # Environment variable loading
scipy==1.15.3                   # Scientific computing
requests==2.32.5                # HTTP library for Python
```

### Version Compatibility Matrix
| Component | Minimum Version | Recommended Version | Notes |
|-----------|----------------|-------------------|-------|
| Node.js | 18.0.0 | 22.17.0 | LTS version recommended |
| Python | 3.9.0 | 3.10.9 | Required for ML libraries |
| MongoDB | 4.4.0 | 6.0+ | Atlas or local installation |
| npm | 8.0.0 | 10.0+ | Comes with Node.js |
| pip | 21.0.0 | 24.0+ | Python package manager |

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
- `MONGODB_URI` - MongoDB connection string
- `PORT` - Server port (default: 5001)
- `NODE_ENV` - Environment (development/production)
- `DEV_ORIGIN` - Frontend URLs for CORS (comma-separated)
- `PROD_ORIGIN` - Production frontend URL
- `ACCESS_TOKEN_SECRET` - JWT secret for access tokens
- `REFRESH_TOKEN_SECRET` - JWT secret for refresh tokens
- `CLOUDINARY_*` - Cloudinary configuration
- `STRIP_SECRET_KEY` - Stripe secret key
- `DELIVERY_CHARGE` - Default delivery charge
- `CURRENCY` - Default currency

#### Frontend (.env)
- `VITE_BACKEND_URL` - Backend API URL

#### Admin (.env)
- `VITE_BACKEND_URL` - Backend API URL

## 🤖 AI Recommendation System

### Machine Learning Features
- **Collaborative Filtering**: Uses SVD (Singular Value Decomposition) algorithm
- **Real-time Learning**: Model retrains automatically with new user interactions
- **Cold Start Handling**: Smart recommendations for new users and products
- **Multi-strategy Approach**: Combines ML predictions, collaborative filtering, and popularity-based recommendations
- **Performance Optimization**: Efficient model serving with caching and rate limiting

### Recommendation Strategies
1. **ML-based Predictions**: For users with sufficient interaction history
2. **Collaborative Filtering**: Find similar users and recommend their preferences
3. **Content-based**: Recommendations based on product categories and user preferences
4. **Popularity-based**: Trending products for new users
5. **Recently Viewed**: Personal browsing history integration

### ML Model Training
```bash
# Navigate to recommendation service
cd recommendation-service

# Activate Python environment
venv\Scripts\activate  # Windows
source venv/bin/activate  # macOS/Linux

# Train/retrain the model
python train.py

# Test the model
python -c "import joblib; model = joblib.load('recommendation_model.joblib'); print('Model loaded successfully')"
```

### Recommendation API Endpoints
- `GET /api/recommendations` - Get personalized recommendations (requires JWT)
- `POST /api/retrain` - Trigger model retraining
- `GET /api/status` - Get recommendation service status
- `GET /api/health` - Health check endpoint

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/v1/user/register` - User registration
- `POST /api/v1/user/login` - User login
- `POST /api/v1/user/logout` - User logout
- `GET /api/v1/user/profile` - Get user profile
- `PUT /api/v1/user/profile` - Update user profile

### Product Endpoints
- `GET /api/v1/product/list` - Get all products
- `POST /api/v1/product/add` - Add product (Admin)
- `DELETE /api/v1/product/remove/:id` - Remove product (Admin)

### Cart Endpoints
- `GET /api/v1/cart/` - Get user cart
- `POST /api/v1/cart/add` - Add item to cart
- `PUT /api/v1/cart/update` - Update cart item
- `DELETE /api/v1/cart/remove` - Remove cart item
- `DELETE /api/v1/cart/clear` - Clear cart

### Order Endpoints
- `POST /api/v1/order/place` - Place COD order
- `POST /api/v1/order/stripe` - Create Stripe payment session
- `POST /api/v1/order/verifyStripe` - Verify Stripe payment
- `GET /api/v1/order/userorders` - Get user orders
- `GET /api/v1/order/list` - Get all orders (Admin)
- `PUT /api/v1/order/status/:id` - Update order status (Admin)

## 🎨 Features in Detail

### User Authentication
- JWT-based authentication
- Role-based access control (user/admin)
- Secure password hashing
- Token refresh mechanism

### Product Management
- Image upload with Cloudinary
- Product categories and pricing
- Inventory management
- Product search and filtering

### Shopping Cart
- Persistent cart storage
- Real-time cart updates
- Cart synchronization between devices
- Automatic cart clearing after orders

### Order Processing
- Multiple payment methods (COD, Stripe)
- Order status tracking
- Email notifications
- Order history

### Payment Integration
- Stripe checkout integration
- Secure payment processing
- Payment verification
- Webhook handling

## 🔒 Security Features

- JWT token authentication
- Password hashing with bcrypt
- CORS configuration
- Input validation and sanitization
- Role-based access control
- Secure API endpoints

## 🚀 Production Deployment

### Pre-deployment Checklist
- [ ] All environment variables configured for production
- [ ] Database indexes created for optimal performance
- [ ] SSL certificates configured
- [ ] Domain names and DNS configured
- [ ] Payment gateway configured with production keys
- [ ] Image storage (Cloudinary) configured for production
- [ ] Error monitoring and logging set up

### Backend API Deployment
**Recommended Platforms**: Railway, Render, Heroku, AWS EC2, DigitalOcean

1. **Environment Configuration**:
   ```env
   NODE_ENV=production
   PROD_ORIGIN=https://yourdomain.com
   MONGODB_URI=your_production_mongodb_uri
   # Use production keys for all services
   ```

2. **Build and Deploy**:
   ```bash
   # Install production dependencies
   npm ci --only=production
   
   # Start production server
   npm start
   ```

3. **Production Considerations**:
   - Use PM2 for process management
   - Configure reverse proxy (Nginx)
   - Set up SSL/TLS certificates
   - Configure database connection pooling
   - Set up monitoring and logging

### AI Recommendation Service Deployment
**Recommended Platforms**: Railway, Render, Heroku, AWS Lambda, Google Cloud Run

1. **Python Environment**:
   ```bash
   # Create requirements.txt
   pip freeze > requirements.txt
   
   # Production WSGI server
   pip install gunicorn
   ```

2. **Production Configuration**:
   ```env
   FLASK_ENV=production
   MONGO_URI=your_production_mongodb_uri
   JWT_SECRET_KEY=same_as_backend_secret
   ```

3. **Deploy with Gunicorn**:
   ```bash
   gunicorn -w 4 -b 0.0.0.0:5000 app:app
   ```

### Frontend Deployment
**Recommended Platforms**: Vercel, Netlify, AWS S3 + CloudFront

1. **Build Configuration**:
   ```env
   VITE_BACKEND_URL=https://your-api-domain.com
   VITE_RECOMMENDATION_URL=https://your-ml-service-domain.com
   ```

2. **Build and Deploy**:
   ```bash
   # Build for production
   npm run build
   
   # Deploy dist folder to your hosting platform
   ```

3. **Performance Optimizations**:
   - Enable gzip compression
   - Configure CDN for static assets
   - Set up proper caching headers
   - Optimize images and bundle size

### Admin Panel Deployment
**Recommended Platforms**: Vercel, Netlify (with password protection)

1. **Build Configuration**:
   ```env
   VITE_BACKEND_URL=https://your-api-domain.com
   ```

2. **Security Considerations**:
   - Use subdomain (admin.yourdomain.com)
   - Configure IP whitelisting if possible
   - Set up additional authentication layers
   - Use HTTPS only

### Database Deployment
**Recommended**: MongoDB Atlas (managed service)

1. **Production Setup**:
   - Enable authentication
   - Configure IP whitelisting
   - Set up automated backups
   - Configure monitoring and alerts
   - Create appropriate indexes

2. **Performance Optimization**:
   ```javascript
   // Create indexes for better performance
   db.products.createIndex({ category: 1, subCategory: 1 })
   db.orders.createIndex({ userId: 1, createdAt: -1 })
   db.events.createIndex({ userId: 1, productId: 1, createdAt: -1 })
   ```

### Monitoring and Maintenance
1. **Application Monitoring**:
   - Set up error tracking (Sentry, LogRocket)
   - Configure performance monitoring
   - Set up uptime monitoring

2. **ML Model Maintenance**:
   - Schedule regular model retraining
   - Monitor recommendation quality metrics
   - Set up automated model validation

3. **Security Monitoring**:
   - Regular security audits
   - Dependency vulnerability scanning
   - API rate limiting and monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🐛 Known Issues

- Stripe webhook configuration needed for production
- Image optimization can be improved
- Search functionality can be enhanced

## 🔮 Future Enhancements

### Planned Features
- [ ] **Product Reviews & Ratings**: User-generated reviews with ML-powered sentiment analysis
- [ ] **Advanced Wishlist**: Smart wishlist with price drop notifications
- [ ] **Enhanced Search**: Elasticsearch integration with autocomplete and filters
- [ ] **Email Notifications**: Automated email campaigns and order updates
- [ ] **Inventory Management**: Real-time stock tracking and low-stock alerts
- [ ] **Multi-vendor Support**: Marketplace functionality with vendor dashboards
- [ ] **Mobile Applications**: React Native apps for iOS and Android
- [ ] **Advanced Analytics**: Business intelligence dashboard with ML insights

### ML & AI Enhancements
- [ ] **Deep Learning Models**: Neural collaborative filtering for better recommendations
- [ ] **Real-time Personalization**: Dynamic content personalization based on user behavior
- [ ] **Price Optimization**: ML-powered dynamic pricing strategies
- [ ] **Fraud Detection**: AI-powered fraud detection for payments and orders
- [ ] **Chatbot Integration**: AI customer service chatbot
- [ ] **Image Recognition**: Visual search and product matching
- [ ] **Demand Forecasting**: ML-based inventory and demand prediction

### Technical Improvements
- [ ] **Microservices Architecture**: Break down monolith into microservices
- [ ] **GraphQL API**: More efficient data fetching
- [ ] **Redis Caching**: Improved performance with distributed caching
- [ ] **Elasticsearch**: Advanced search and analytics capabilities
- [ ] **Docker Containerization**: Containerized deployment
- [ ] **Kubernetes Orchestration**: Scalable container orchestration
- [ ] **CI/CD Pipeline**: Automated testing and deployment
- [ ] **Performance Monitoring**: APM tools integration

## 📞 Support

For support, email your-email@example.com or create an issue in the repository.

## 🙏 Acknowledgments

- React team for the amazing framework
- Express.js for the robust backend framework
- MongoDB for the flexible database
- Stripe for secure payment processing
- Cloudinary for image management