import React, { useContext, useState } from 'react'
import Title from '../components/Title';
import CartTotal from '../components/CartTotal';
import { assets } from '../assets/assets';
import { ShopContext } from '../context/ShopContex';
import { orderAPI } from '../utils/api';
import toast from '../utils/toast';

const Placeorder = () => {
  const [method, setMethod] = useState('cod');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
    country: '',
    phone: ''
  });

  const { 
    navigate, 
    cartItems, 
    productScreenshots, 
    getCartAmount, 
    delivery, 
    currency,
    user,
    isAuthenticated,
    clearCart
  } = useContext(ShopContext);

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Pre-fill form with user data if available
  React.useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        email: user.email || '',
        firstName: user.name?.split(' ')[0] || '',
        lastName: user.name?.split(' ').slice(1).join(' ') || '',
        // Pre-fill address if user has default address
        ...(user.address && user.address[0] ? {
          street: user.address[0].street || '',
          city: user.address[0].city || '',
          state: user.address[0].state || '',
          country: user.address[0].country || '',
          pincode: user.address[0].pincode || '',
        } : {}),
        phone: user.phoneNo || ''
      }));
    }
  }, [user]);

  const onChangeHandler = (event) => {
    const { name, value } = event.target;
    setFormData(data => ({
      ...data,
      [name]: value
    }));
  };

  const validateForm = () => {
    const required = ['firstName', 'lastName', 'email', 'street', 'city', 'state', 'pincode', 'country', 'phone'];
    for (let field of required) {
      if (!formData[field].trim()) {
        toast.error(`${field.charAt(0).toUpperCase() + field.slice(1)} is required`);
        return false;
      }
    }
    
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return false;
    }

    // Validate pincode
    if (!/^\d{6}$/.test(formData.pincode)) {
      toast.error('Please enter a valid 6-digit pincode');
      return false;
    }

    return true;
  };

  const prepareOrderItems = () => {
    const orderItems = [];
    
    for (const itemId in cartItems) {
      for (const size in cartItems[itemId]) {
        if (cartItems[itemId][size] > 0) {
          // Use backend products only
          const product = productScreenshots.find(product => product._id === itemId);
          
          if (product) {
            orderItems.push({
              productId: product._id,
              productName: product.name,
              quantity: cartItems[itemId][size],
              price: product.price,
              size: size
            });
          }
        }
      }
    }
    
    return orderItems;
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    
    if (!validateForm()) return;
    
    const orderItems = prepareOrderItems();
    if (orderItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setLoading(true);

    try {
      const orderData = {
        items: orderItems,
        amount: getCartAmount() + delivery,
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          country: formData.country,
          pincode: formData.pincode,
          isDefault: false
        },
        paymentMethod: method.toUpperCase()
      };

      let response;
      
      switch (method) {
        case 'cod':
          response = await orderAPI.placeOrder(orderData);
          if (response.success) {
            toast.success(response.message || 'Order placed successfully!');
            // Clear cart after successful order
            try {
              await clearCart();
              console.log('Cart cleared successfully after order placement');
            } catch (error) {
              console.error('Error clearing cart:', error);
            }
            navigate('/order');
          }
          break;
          
        case 'stripe':
          response = await orderAPI.placeOrderStripe({
            items: orderItems,
            address: orderData.address
          });
          if (response.success && response.data.session_url) {
            window.location.href = response.data.session_url;
          }
          break;
          
        default:
          toast.error('Please select a payment method');
      }
    } catch (error) {
      console.error('Order placement error:', error);
      toast.error(error.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };
  // Show loading or redirect if not authenticated
  if (!isAuthenticated) {
    return (
      <div className='border-t pt-14'>
        <div className='text-center py-20'>
          <p className='text-gray-500'>Please log in to place an order</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmitHandler} className='flex flex-col sm:flex-row justify-between gap-4 pt-5 sm:pt-14 min-h-[80vh] border-t'>
      {/* Delivery Information */}
      <div className='flex flex-col gap-4 w-full sm:max-w-[480px]'>
        <div className='text-xl sm:text-2xl my-3'>
          <Title text1={'DELIVERY'} text2={'INFORMATION'}/>
        </div>
        
        <div className='flex gap-3'>
          <input 
            onChange={onChangeHandler} 
            name='firstName' 
            value={formData.firstName} 
            type="text" 
            placeholder='First name' 
            className='border border-gray-300 py-1.5 px-3.5 w-full focus:outline-none focus:border-black' 
            required
          />
          <input 
            onChange={onChangeHandler} 
            name='lastName' 
            value={formData.lastName} 
            type="text" 
            placeholder='Last name' 
            className='border border-gray-300 py-1.5 px-3.5 w-full focus:outline-none focus:border-black' 
            required
          />
        </div>
        
        <input 
          onChange={onChangeHandler} 
          name='email' 
          value={formData.email} 
          type="email" 
          placeholder='Email Address' 
          className='border border-gray-300 py-1.5 px-3.5 w-full focus:outline-none focus:border-black' 
          required
        />
        
        <input 
          onChange={onChangeHandler} 
          name='street' 
          value={formData.street} 
          type="text" 
          placeholder='Street Address' 
          className='border border-gray-300 py-1.5 px-3.5 w-full focus:outline-none focus:border-black' 
          required
        />
        
        <div className='flex gap-3'>
          <input 
            onChange={onChangeHandler} 
            name='city' 
            value={formData.city} 
            type="text" 
            placeholder='City' 
            className='border border-gray-300 py-1.5 px-3.5 w-full focus:outline-none focus:border-black' 
            required
          />
          <input 
            onChange={onChangeHandler} 
            name='state' 
            value={formData.state} 
            type="text" 
            placeholder='State' 
            className='border border-gray-300 py-1.5 px-3.5 w-full focus:outline-none focus:border-black' 
            required
          />
        </div>
        
        <div className='flex gap-3'>
          <input 
            onChange={onChangeHandler} 
            name='pincode' 
            value={formData.pincode} 
            type="text" 
            placeholder='Pincode' 
            maxLength="6"
            className='border border-gray-300 py-1.5 px-3.5 w-full focus:outline-none focus:border-black' 
            required
          />
          <input 
            onChange={onChangeHandler} 
            name='country' 
            value={formData.country} 
            type="text" 
            placeholder='Country' 
            className='border border-gray-300 py-1.5 px-3.5 w-full focus:outline-none focus:border-black' 
            required
          />
        </div>
        
        <input 
          onChange={onChangeHandler} 
          name='phone' 
          value={formData.phone} 
          type="tel" 
          placeholder='Phone Number' 
          className='border border-gray-300 py-1.5 px-3.5 w-full focus:outline-none focus:border-black' 
          required
        />
      </div>

      {/* Order Summary and Payment */}
      <div className='mt-8'>
        <div className='mt-8 min-w-80'>
          <CartTotal/>
        </div>
        
        <div className='mt-12'>
          <Title text1={'PAYMENT'} text2={'METHOD'}/>
          <div className='flex gap-3 flex-col lg:flex-row'>
            <div 
              onClick={() => setMethod('stripe')} 
              className='flex items-center gap-3 border p-2 px-3 cursor-pointer hover:border-black transition-colors'
            >
              <p className={`min-w-3.5 h-3.5 border rounded-full ${method === 'stripe' ? 'bg-green-400' : ''}`}></p>
              <p className='text-gray-500 text-sm font-medium mx-4'>STRIPE</p>
            </div>
            
            <div 
              onClick={() => setMethod('cod')} 
              className='flex items-center gap-3 border p-2 px-3 cursor-pointer hover:border-black transition-colors'
            >
              <p className={`min-w-3.5 h-3.5 border rounded-full ${method === 'cod' ? 'bg-green-400' : ''}`}></p>
              <p className='text-gray-500 text-sm font-medium mx-4'>CASH ON DELIVERY</p>
            </div>
          </div>
          
          <div className='w-full text-end mt-8'>
            <button 
              type="submit"
              disabled={loading}
              className='bg-black text-white px-16 py-3 text-sm hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {loading ? 'PLACING ORDER...' : 'PLACE ORDER'}
            </button>
          </div>
        </div>
      </div>
    </form>
  )
}

export default Placeorder
