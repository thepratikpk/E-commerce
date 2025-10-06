import { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContex';
import Title from '../components/Title';
import { orderAPI } from '../utils/api';
import toast from '../utils/toast';

const Order = () => {
  const { currency, isAuthenticated, navigate, user } = useContext(ShopContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const loadOrderData = async () => {
    try {
      setLoading(true);
      console.log('🔍 Loading orders...');
      const response = await orderAPI.getUserOrders();
      
      console.log('📦 Orders API Response:', response);
      console.log('📊 Orders data:', response.data);
      console.log('📈 Number of orders:', response.data?.length || 0);
      
      if (response.success) {
        const ordersData = response.data || [];
        console.log('✅ Setting orders:', ordersData);
        setOrders(ordersData);
        
        // Log order statuses for debugging
        ordersData.forEach((order, index) => {
          console.log(`📋 Order ${index + 1}: ID=${order._id.slice(-8)}, Status=${order.status}, Amount=${order.amount}`);
        });
      } else {
        console.error('❌ API returned success=false:', response);
      }
    } catch (error) {
      console.error('💥 Failed to load orders:', error);
      console.error('💥 Error details:', {
        message: error.message,
        status: error.status,
        data: error.data
      });
      toast.error('Failed to load orders: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('📄 Orders page - auth status changed:', { isAuthenticated });
    if (isAuthenticated) {
      loadOrderData();
    }
  }, [isAuthenticated]);

  // Debug user context in orders page
  useEffect(() => {
    console.log('📄 Orders page mounted - current user:', user ? { id: user._id, name: user.name } : 'No user');
  }, []);

  // Track user changes in orders page
  useEffect(() => {
    console.log('📄 Orders page - user changed:', user ? { id: user._id, name: user.name } : 'No user');
  }, [user]);

  // Removed fancy colors - using simple text styling instead

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getProductImage = (productData) => {
    try {
      if (productData && typeof productData === 'object') {
        // Product data is populated from backend
        const images = productData.images;
        
        if (Array.isArray(images) && images.length > 0) {
          return images[0];
        } else if (images) {
          return images;
        }
      }
    } catch (error) {
      console.error('Error getting product image:', error);
    }
    return null;
  };
  if (!isAuthenticated) {
    return (
      <div className='border-t pt-14'>
        <div className='text-center py-20'>
          <p className='text-gray-500'>Please log in to view your orders</p>
        </div>
      </div>
    );
  }

  return (
    <div className='border-t pt-14'>
      <div className='text-2xl mb-3'>
        <Title text1={'MY'} text2={'ORDERS'} />
      </div>

      {loading ? (
        <div className='text-center py-20'>
          <p className='text-gray-500'>Loading your orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className='text-center py-20'>
          <p className='text-gray-500 text-lg mb-4'>No orders found</p>
          <button
            onClick={() => navigate('/collection')}
            className='border border-black px-8 py-3 text-sm hover:bg-black hover:text-white transition-all duration-300'
          >
            START SHOPPING
          </button>
        </div>
      ) : (
        <div className='space-y-4'>
          {orders.map((order) => (
            <div key={order._id} className='border border-gray-300'>
              {/* Order Header */}
              <div className='px-4 py-4 border-b border-gray-300'>
                <div className='flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3'>
                  <div>
                    <div className='flex items-center gap-3'>
                      <p className='text-base font-medium'>Order #{order._id.slice(-8)}</p>
                      <span className='text-sm capitalize text-gray-600'>{order.status}</span>
                    </div>
                    <p className='text-sm text-gray-500 mt-1'>Placed on {formatDate(order.createdAt)}</p>
                  </div>
                  <div className='flex items-center gap-3'>
                    <span className={`px-2 py-1 text-xs border ${order.payment ? 'border-gray-400 text-gray-700' : 'border-gray-400 text-gray-600'}`}>
                      {order.payment ? 'PAID' : 'PENDING'}
                    </span>
                    <span className='text-base font-medium'>{currency}{order.amount}</span>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className='px-4 py-4'>
                <div className='space-y-3'>
                  {order.items.map((item, itemIndex) => {
                    const productImage = getProductImage(item.productId);

                    return (
                      <div key={itemIndex} className='flex items-center gap-4 py-3 border-b border-gray-200 last:border-b-0'>
                        <div className='flex-shrink-0'>
                          {productImage ? (
                            <img
                              src={productImage}
                              alt={item.productName}
                              className='w-16 sm:w-20 h-16 sm:h-20 object-cover border border-gray-300'
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div
                            className='w-16 sm:w-20 h-16 sm:h-20 bg-gray-100 flex items-center justify-center text-gray-400 text-xs border border-gray-300'
                            style={{ display: productImage ? 'none' : 'flex' }}
                          >
                            No Image
                          </div>
                        </div>
                        <div className='flex-1 min-w-0'>
                          <p className='font-medium text-gray-800'>{item.productName}</p>
                          <div className='flex items-center gap-4 text-sm text-gray-600 mt-1'>
                            <span>{currency}{item.price}</span>
                            <span>Quantity: {item.quantity}</span>
                            {item.size && <span className='px-2 py-1 border border-gray-300 text-xs'>Size: {item.size}</span>}
                          </div>
                        </div>
                        <div className='text-right flex-shrink-0'>
                          <p className='font-medium text-gray-800'>{currency}{item.price * item.quantity}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Order Footer */}
              <div className='px-4 py-4 border-t border-gray-300 bg-gray-50'>
                <div className='flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4'>
                  <div className='text-sm text-gray-600'>
                    <p><span className='font-medium'>Payment Method:</span> {order.paymentMethod}</p>
                    <p className='mt-1'><span className='font-medium'>Delivery Address:</span></p>
                    <p>{order.address.street}, {order.address.city}, {order.address.state} - {order.address.pincode}</p>
                  </div>
                  <button
                    onClick={loadOrderData}
                    className='border border-black px-4 py-2 text-sm hover:bg-black hover:text-white transition-all duration-300'
                  >
                    REFRESH
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Order
