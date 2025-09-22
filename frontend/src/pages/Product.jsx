import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ShopContext } from '../context/ShopContex.jsx';
import { assets } from '../assets/assets.jsx';
import RelatedProduct from '../components/RelatedProduct.jsx';

const Product = () => {
  const { id } = useParams();
  const { productScreenshots, currency, addToCart, isAuthenticated, navigate } = useContext(ShopContext);
  const [productData, setProductData] = useState(null);
  const [image, setImage] = useState('');
  const [size, setSize] = useState('');

  // Fetch product data based on ID
  useEffect(() => {
    const product = productScreenshots.find(item => item._id === id);
    if (product) {
      setProductData(product);
      setImage(product.images[0] || '');
    }

    // Scroll to top whenever the product changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id, productScreenshots]);

  if (!productData) return <div className='opacity-0'></div>;

  return (
    <div className='border-t-2 pt-10 transition-opacity ease-in duration-500 opacity-100'>
      <div className='flex gap-12 sm:gap-12 flex-col sm:flex-row '>
        {/* Images */}
        <div className='flex-1 flex flex-col-reverse gap-3 sm:flex-row'>
          <div className='flex sm:flex-col overflow-x-auto sm:overflow-y-scroll justify-between sm:justify-normal sm:w-[18.7%] w-full'>
            {productData.images.map((img, index) => (
              <img
                onClick={() => setImage(img)}
                src={img}
                key={index}
                className='w-[24%] sm:w-full sm:mb-3 flex-shrink-0 cursor-pointer'
                alt=""
              />
            ))}
          </div>
          <div className='w-full sm:w-[80%]'>
            <img className='w-full h-auto' src={image} alt={productData.name} />
          </div>
        </div>

        {/* Product Info */}
        <div className='flex-1'>
          <h1 className='font-medium text-2xl mt-2'>{productData.name}</h1>

          <div className='flex items-center gap-1 mt-2'>
            <img src={assets.star} className='w-3.5' alt="" />
            <img src={assets.star} className='w-3.5' alt="" />
            <img src={assets.star} className='w-3.5' alt="" />
            <img src={assets.star} className='w-3.5' alt="" />
            <img src={assets.stardulll} className='w-3.5' alt="" />
            <p className='pl-2'>(122)</p>
          </div>

          <p className='mt-5 text-3xl font-medium'>{currency}{productData.price}</p>
          <p className='mt-5 text-gray-500 md:w-4/5'>{productData.description}</p>

          {/* Size selection */}
          <div className='flex flex-col gap-4 my-8'>
            <p>Select Size</p>
            <div className='flex gap-2'>
              {productData.sizes.map((s, index) => (
                <button
                  onClick={() => setSize(s)}
                  className={`border py-2 px-4 bg-gray-100 ${s === size ? 'border-orange-500' : ''}`}
                  key={index}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {isAuthenticated ? (
            <button
              onClick={() => addToCart(productData._id, size)}
              className='bg-black text-white px-8 py-3 text-sm active:bg-gray-700'
            >
              ADD TO CART
            </button>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className='bg-gray-600 text-white px-8 py-3 text-sm hover:bg-gray-700 transition-colors'
            >
              LOGIN TO ADD TO CART
            </button>
          )}

          <hr className='mt-8 sm:w-4/5' />
          <div className='text-sm text-gray-500 mt-5 flex flex-col gap-1'>
            <p>100% Original product.</p>
            <p>Cash on delivery is available on this product.</p>
            <p>Easy return and exchange policy within 7 days.</p>
          </div>
        </div>
      </div>

      {/* Description & Reviews */}
      <div className='mt-20'>
        <div className='flex'>
          <b className='border px-5 py-3 text-sm'>Description</b>
          <p className='border px-5 py-3 text-sm'>Reviews (122)</p>
        </div>
        <div className='flex flex-col gap-4 border px-6 py-6 text-sm text-gray-500'>
          <p>An e-commerce website is an online platform that allows individuals or businesses to buy and sell products or services over the internet. It provides a virtual storefront where users can browse a catalog of items, view detailed product descriptions, compare prices, place orders, and make secure online payments.</p>
          <p>At [Forever], we bring you a seamless and enjoyable online shopping experience. Whether you're looking for the latest fashion trends, electronics, home essentials, or lifestyle products, our platform is designed to offer quality, convenience, and unbeatable prices—all in one place.</p>
        </div>
      </div>

      {/* Related Products */}
      <RelatedProduct category={productData.category} subCategory={productData.subCategory} />
    </div>
  );
};

export default Product;
