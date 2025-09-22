import React from 'react'
import Title from '../components/Title'
import { useNavigate } from 'react-router-dom'

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className='border-t pt-14'>
      <div className='text-center'>
        <div className='text-2xl mb-3'>
          <Title text1={'PAGE'} text2={'NOT FOUND'} />
        </div>
        
        <div className='max-w-2xl mx-auto py-16'>
          {/* Large 404 */}
          <div className='mb-8'>
            <h1 className='text-8xl md:text-9xl font-light text-gray-300 mb-4'>404</h1>
            <div className='w-24 h-[2px] bg-gray-700 mx-auto mb-8'></div>
          </div>
          
          {/* Error Message */}
          <div className='mb-12 space-y-4'>
            <h2 className='text-2xl md:text-3xl font-medium text-gray-800 mb-4'>
              We can't find that page
            </h2>
            <p className='text-gray-600 text-lg leading-relaxed max-w-lg mx-auto'>
              Sorry, the page you are looking for doesn't exist or has been moved. 
              Here are some helpful links instead:
            </p>
          </div>
          
          {/* Action Buttons */}
          <div className='space-y-4 md:space-y-0 md:space-x-4 md:flex md:justify-center'>
            <button 
              onClick={() => navigate('/')}
              className='w-full md:w-auto bg-black text-white px-8 py-3 text-sm hover:bg-gray-800 transition-colors duration-300'
            >
              GO TO HOMEPAGE
            </button>
            <button 
              onClick={() => navigate('/collection')}
              className='w-full md:w-auto border border-black px-8 py-3 text-sm hover:bg-black hover:text-white transition-all duration-300'
            >
              BROWSE PRODUCTS
            </button>
          </div>
          
          {/* Help Links */}
          <div className='mt-16 pt-8 border-t border-gray-200'>
            <p className='text-gray-500 text-sm mb-4'>Looking for something specific?</p>
            <div className='flex flex-wrap justify-center gap-6 text-sm'>
              <button 
                onClick={() => navigate('/contact')}
                className='text-gray-600 hover:text-black transition-colors underline'
              >
                Contact Us
              </button>
              <button 
                onClick={() => navigate('/about')}
                className='text-gray-600 hover:text-black transition-colors underline'
              >
                About Us
              </button>
              <button 
                onClick={() => window.history.back()}
                className='text-gray-600 hover:text-black transition-colors underline'
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NotFound