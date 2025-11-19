import React, { useContext, useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { ShopContext } from '../context/ShopContex'
import { orderAPI, eventAPI } from '../utils/api'
import toast from '../utils/toast'

const Verify = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated, clearCart, user, token } = useContext(ShopContext);
  const [verifying, setVerifying] = useState(true);

  useEffect(() => {
    const verifyPayment = async () => {
      const success = searchParams.get('success');
      const orderId = searchParams.get('orderId');

      if (!isAuthenticated) {
        navigate('/login');
        return;
      }

      if (!orderId) {
        toast.error('Invalid verification link');
        navigate('/');
        return;
      }

      try {
        const response = await orderAPI.verifyStripe(orderId, success);
        
        if (response.success) {
          if (success === 'true') {
            toast.success('Payment successful! Your order has been confirmed.');
            
            // Log purchase event for Stripe payment
            try {
              await eventAPI.logEvent({
                action: 'purchase',
                userId: user?._id,
                metadata: { 
                  paymentMethod: 'Stripe',
                  orderId: orderId,
                  success: true
                }
              }, token);
            } catch (eventError) {
              console.error('Failed to log Stripe purchase event:', eventError);
            }
            
            await clearCart(); // Clear cart after successful payment
            navigate('/order');
          } else {
            toast.error('Payment was cancelled or failed.');
            navigate('/cart');
          }
        } else {
          toast.error('Payment verification failed');
          navigate('/cart');
        }
      } catch (error) {
        console.error('Payment verification error:', error);
        toast.error(`Payment verification failed: ${error.message || 'Unknown error'}`);
        navigate('/cart');
      } finally {
        setVerifying(false);
      }
    };

    verifyPayment();
  }, [searchParams, navigate, isAuthenticated, clearCart]);

  if (verifying) {
    return (
      <div className='border-t pt-14'>
        <div className='text-center py-20'>
          <div className='inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-black mb-4'></div>
          <p className='text-gray-600'>Verifying your payment...</p>
          <p className='text-sm text-gray-500 mt-2'>Please do not close this page</p>
        </div>
      </div>
    );
  }

  return (
    <div className='border-t pt-14'>
      <div className='text-center py-20'>
        <p className='text-gray-600'>Redirecting...</p>
      </div>
    </div>
  );
};

export default Verify;