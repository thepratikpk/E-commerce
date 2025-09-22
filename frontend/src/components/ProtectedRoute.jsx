import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { ShopContext } from '../context/ShopContex';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, authLoading } = useContext(ShopContext);

  if (authLoading) {
    return (
      <div className='flex justify-center items-center min-h-[400px]'>
        <div className='text-gray-600'>Loading...</div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;