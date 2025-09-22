import {useContext,useEffect,useState} from 'react'
import { ShopContext } from '../context/ShopContex'
import Title from '../components/Title';
import { assets } from '../assets/assets';
import CartTotal from '../components/CartTotal';


const Cart = () => {
  const {productScreenshots,currency,cartItems,updateQuantity,navigate,isAuthenticated,authLoading}=useContext(ShopContext);
  const [cartData,setCartData]=useState([]);
  const [loading, setLoading] = useState(true);

  // Debug logging
  console.log('Cart Debug:', {
    cartItems,
    productScreenshots: productScreenshots?.length || 0,
    cartData: cartData.length,
    isAuthenticated
  });
  useEffect(()=>{
    const tempData=[];
    for(const items in cartItems){
      for(const item in cartItems[items]){
        if(cartItems[items][item]>0){
          tempData.push({
            _id:items,
            size:item,
            quantity:cartItems[items][item]
          })
        }
      }
    }
    setCartData(tempData);
    setLoading(false);
  },[cartItems])

  // Show loading state if auth or products are still being fetched
  if (authLoading || loading || !productScreenshots) {
    return (
      <div className='border-t pt-14'>
        <div className='text-2xl mb-3'>
          <Title text1={'YOUR'} text2={'CART'}/>
        </div>
        <div className='text-center py-20'>
          <p className='text-gray-500'>Loading cart...</p>
        </div>
      </div>
    );
  }

  // Show login prompt for non-authenticated users
  if (!isAuthenticated) {
    return (
      <div className='border-t pt-14'>
        <div className='text-2xl mb-3'>
          <Title text1={'YOUR'} text2={'CART'}/>
        </div>
        <div className='text-center py-20'>
          <p className='text-gray-500 text-lg mb-4'>Please log in to view your cart</p>
          <button 
            onClick={() => navigate('/login')}
            className='bg-black text-white px-8 py-3 text-sm hover:bg-gray-800 transition-colors'
          >
            LOGIN
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className='border-t pt-14'>
        <div className='text-2xl mb-3'>
           <Title text1={'YOUR'} text2={'CART'}/>
        </div>
        <div>
          {cartData.length === 0 ? (
            <div className='text-center py-20'>
              <p className='text-gray-500 text-lg mb-4'>Your cart is empty</p>
              <button 
                onClick={() => navigate('/collection')}
                className='bg-black text-white px-8 py-3 text-sm hover:bg-gray-800 transition-colors'
              >
                CONTINUE SHOPPING
              </button>
            </div>
          ) : (
            cartData.map((item,index)=>{
              const productData=productScreenshots.find((product)=>product._id===item._id);
              
              // If product not found, skip this item or show error
              if (!productData) {
                return (
                  <div key={index} className='py-4 border-b border-t text-gray-700 grid grid-cols-[4fr_0.5fr_0.5fr] sm:grid-cols-[4fr_2fr_0.5fr] items-center gap-4'>
                    <div className='flex items-start gap-6'>
                      <div className='w-16 sm:w-20 h-16 sm:h-20 bg-gray-200 flex items-center justify-center'>
                        <span className='text-gray-400 text-xs'>No Image</span>
                      </div>
                      <div>
                        <p className='text-xs sm:text-lg font-medium text-red-500'>Product not found</p>
                        <div className='flex items-center gap-5 mt-2'>
                          <p className='text-gray-500'>Product ID: {item._id}</p>
                          <p className='px-2 sm:px-3 sm:py-1 border bg-slate-50'>{item.size}</p>
                        </div>
                      </div>
                    </div>
                    <input type="number" min={1} defaultValue={item.quantity} className='border max-w-10 sm:max-w-20 px-1 sm:px-2 py-1' disabled />
                    <img onClick={()=>updateQuantity(item._id,item.size,0)} className='w-4 mr-4 sm:w-5 cursor-pointer' src={assets.bin} alt="Remove" />
                  </div>
                );
              }

              return (
                <div key={index} className='py-4 border-b border-t text-gray-700 grid grid-cols-[4fr_0.5fr_0.5fr] sm:grid-cols-[4fr_2fr_0.5fr] items-center gap-4'>
                  <div className='flex items-start gap-6'>
                    {(() => {
                      // Handle both 'image' and 'images' properties
                      const imageArray = productData.images || productData.image;
                      const firstImage = Array.isArray(imageArray) ? imageArray[0] : imageArray;
                      
                      return firstImage ? (
                        <img 
                          src={firstImage} 
                          alt={productData.name || 'Product'} 
                          className='w-16 sm:w-20 h-16 sm:h-20 object-cover'
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : (
                        <div className='w-16 sm:w-20 h-16 sm:h-20 bg-gray-200 flex items-center justify-center text-gray-400 text-xs'>
                          No Image
                        </div>
                      );
                    })()}
                    <div>
                      <p className='text-xs sm:text-lg font-medium'>{productData.name || 'Unknown Product'}</p>
                      <div className='flex items-center gap-5 mt-2'>
                        <p>{currency}{productData.price || 0}</p>
                        <p className='px-2 sm:px-3 sm:py-1 border bg-slate-50'>{item.size}</p>
                      </div>
                    </div>
                  </div>
                  <input 
                    onChange={(e)=>e.target.value==='0'?null:updateQuantity(item._id,item.size,Number(e.target.value))} 
                    type="number" 
                    min={1} 
                    defaultValue={item.quantity} 
                    className='border max-w-10 sm:max-w-20 px-1 sm:px-2 py-1' 
                  />
                  <img 
                    onClick={()=>updateQuantity(item._id,item.size,0)}
                    className='w-4 mr-4 sm:w-5 cursor-pointer hover:opacity-70' 
                    src={assets.bin} 
                    alt="Remove item" 
                  />
                </div>
              )
            })
          )}
        </div>
        <div className='flex justify-end my-20'>
          <div className='w-full sm:w-[450px]'>
            <CartTotal/>
            <div className='w-full text-end'>
              <button onClick={()=>navigate('/Placeorder')} className='bg-black text-white text-sm my-8 px-8 py-3'>PROCEED TO CHECKOUT</button>
            </div>
          </div>

        </div>
      
    </div>
  )
}

export default Cart
