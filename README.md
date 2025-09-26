# E-Commerce Platform

A full-stack e-commerce platform built with React, Node.js, Express, and MongoDB. Features include user authentication, product management, shopping cart, order processing, and payment integration with Stripe.

## 🚀 Features

### Frontend (Customer)
- **User Authentication**: Register, login, logout with JWT tokens
- **Product Browsing**: View products with images, prices, and details
- **Shopping Cart**: Add/remove items, update quantities
- **Order Management**: Place orders, view order history
- **Payment Integration**: COD and Stripe payment options
- **Responsive Design**: Mobile-friendly interface
- **Profile Management**: Update user information

### Admin Panel
- **Product Management**: Add, edit, delete products
- **Order Management**: View all orders, update order status
- **User Management**: View customer information
- **Dashboard**: Order statistics and analytics

### Backend
- **RESTful API**: Clean API architecture
- **Authentication**: JWT-based authentication with role-based access
- **Database**: MongoDB with Mongoose ODM
- **File Upload**: Cloudinary integration for image storage
- **Payment Processing**: Stripe integration for secure payments
- **Order Processing**: Complete order lifecycle management

## 🛠 Tech Stack

### Frontend
- **React 18** - UI library
- **React Router** - Client-side routing
- **Tailwind CSS** - Styling framework
- **Vite** - Build tool
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Cloudinary** - Image storage
- **Stripe** - Payment processing

### Admin Panel
- **React** - UI library
- **React Router** - Routing
- **Tailwind CSS** - Styling
- **React Toastify** - Notifications

## 📁 Project Structure

```
ecommerce/
├── frontend/          # Customer-facing React app
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── context/       # React context
│   │   ├── utils/         # Utility functions
│   │   └── assets/        # Static assets
│   └── package.json
├── admin/             # Admin panel React app
│   ├── src/
│   │   ├── components/    # Admin components
│   │   ├── pages/         # Admin pages
│   │   └── assets/        # Admin assets
│   └── package.json
├── backend/           # Node.js/Express API
│   ├── src/
│   │   ├── controllers/   # Route controllers
│   │   ├── models/        # Database models
│   │   ├── routes/        # API routes
│   │   ├── middlewares/   # Custom middlewares
│   │   └── utils/         # Utility functions
│   └── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- Cloudinary account
- Stripe account (for payments)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ecommerce
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   ```

   Create `.env` file in backend directory:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   PORT=5001
   NODE_ENV=development
   DEV_ORIGIN=http://localhost:5175,http://localhost:5173,http://localhost:5174
   PROD_ORIGIN=your_production_url

   ACCESS_TOKEN_SECRET=your_jwt_secret
   ACCESS_TOKEN_EXPIRY=1d
   REFRESH_TOKEN_SECRET=your_refresh_secret
   REFRESH_TOKEN_EXPIRY=10d

   CLOUDINARY_CLOUD_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_cloudinary_key
   CLOUDINARY_API_SECRET=your_cloudinary_secret

   STRIP_SECRET_KEY=your_stripe_secret_key
   DELIVERY_CHARGE=10
   CURRENCY=inr
   ```

   Start backend server:
   ```bash
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   ```

   Create `.env` file in frontend directory:
   ```env
   VITE_BACKEND_URL=http://localhost:5001
   ```

   Start frontend:
   ```bash
   npm run dev
   ```

4. **Admin Panel Setup**
   ```bash
   cd admin
   npm install
   ```

   Create `.env` file in admin directory:
   ```env
   VITE_BACKEND_URL=http://localhost:5001
   ```

   Start admin panel:
   ```bash
   npm run dev
   ```

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

## 🚀 Deployment

### Backend Deployment
1. Set `NODE_ENV=production`
2. Configure `PROD_ORIGIN` with your frontend URL
3. Deploy to your preferred platform (Heroku, AWS, etc.)

### Frontend Deployment
1. Update `VITE_BACKEND_URL` to your backend URL
2. Build the project: `npm run build`
3. Deploy to your preferred platform (Vercel, Netlify, etc.)

### Admin Panel Deployment
1. Update `VITE_BACKEND_URL` to your backend URL
2. Build the project: `npm run build`
3. Deploy to your preferred platform

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

- [ ] Product reviews and ratings
- [ ] Wishlist functionality
- [ ] Advanced search and filters
- [ ] Email notifications
- [ ] Inventory management
- [ ] Multi-vendor support
- [ ] Mobile app
- [ ] Analytics dashboard

## 📞 Support

For support, email your-email@example.com or create an issue in the repository.

## 🙏 Acknowledgments

- React team for the amazing framework
- Express.js for the robust backend framework
- MongoDB for the flexible database
- Stripe for secure payment processing
- Cloudinary for image management