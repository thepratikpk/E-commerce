import React from 'react'
import {Routes,Route} from 'react-router-dom'
import Home from './pages/Home'
import Collection from './pages/Collection'
import About from './pages/about'
import Contact from './pages/Contact'
import Product from './pages/Product'
import Cart from './pages/Cart'
import Login from './pages/login'
import Profile from './pages/Profile'
import Placeorder from './pages/Placeorder'
import Order from './pages/Order'
import NotFound from './pages/NotFound'
import ErrorBoundary from './components/ErrorBoundary'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Searchbar from './components/Searchbar'
import ProtectedRoute from './components/ProtectedRoute'

import ShopContextProvider from './context/ShopContex'
const App = () => {
  return (
    <ErrorBoundary>
      <ShopContextProvider>
        <div className='px-4 sm:px-[5vw] md:px-[7vw] lg:px-[10vw]'>
          <Navbar />
          <Searchbar />
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/collection' element={<Collection />} />
            <Route path='/about' element={<About />} />
            <Route path='/contact' element={<Contact />} />
            <Route path='/product/:id' element={<Product />} />
            <Route path='/cart' element={<Cart />} />
            <Route path='/login' element={<Login />} />
            <Route path='/profile' element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path='/placeorder' element={<Placeorder />} />
            <Route path='/order' element={<Order />} />
            {/* 404 Route - Must be last */}
            <Route path='*' element={<NotFound />} />
          </Routes>
          <Footer />
        </div>
      </ShopContextProvider>
    </ErrorBoundary>
  );
};

export default App

