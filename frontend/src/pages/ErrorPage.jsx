import React from 'react'
import Title from '../components/Title'
import { useNavigate } from 'react-router-dom'

const ErrorPage = ({ 
  title = "Something went wrong", 
  message = "We're experiencing some technical difficulties. Please try again later.",
  showRetry = true,
  onRetry = null 
}) => {
  const navigate = useNavigate();

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  return (
    <div className='border-t pt-14'>
      <div className='text-center'>
        <div className='text-2xl mb-3'>
          <Title text1={'OOPS!'} text2={'ERROR'} />
        </div>
        
        <div className='max-w-2xl mx-auto py-16'>
          {/* Error Icon */}
          <div className='mb-8'>
            <div className='w-24 h-24 mx-auto mb-6 border-2 border-gray-300 rounded-full flex items-center justify-center'>
              <svg className='w-12 h-12 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z' />
              </svg>
            </div>
            <div className='w-24 h-[2px] bg-gray-700 mx-auto mb-8'></div>
          </div>
          
          {/* Error Message */}
          <div className='mb-12 space-y-4'>
            <h2 className='text-2xl md:text-3xl font-medium text-gray-800 mb-4'>
              {title}
            </h2>
            <p className='text-gray-600 text-lg leading-relaxed max-w-lg mx-auto'>
              {message}
            </p>
          </div>
          
          {/* Action Buttons */}
          <div className='space-y-4 md:space-y-0 md:space-x-4 md:flex md:justify-center'>
            {showRetry && (
              <button 
                onClick={handleRetry}
                className='w-full md:w-auto bg-black text-white px-8 py-3 text-sm hover:bg-gray-800 transition-colors duration-300'
              >
                TRY AGAIN
              </button>
            )}
            <button 
              onClick={() => navigate('/')}
              className='w-full md:w-auto border border-black px-8 py-3 text-sm hover:bg-black hover:text-white transition-all duration-300'
            >
              GO TO HOMEPAGE
            </button>
          </div>
          
          {/* Help Section */}
          <div className='mt-16 pt-8 border-t border-gray-200'>
            <p className='text-gray-500 text-sm mb-4'>If the problem persists:</p>
            <div className='flex flex-wrap justify-center gap-6 text-sm'>
              <button 
                onClick={() => navigate('/contact')}
                className='text-gray-600 hover:text-black transition-colors underline'
              >
                Contact Support
              </button>
              <button 
                onClick={() => window.location.href = 'mailto:admin@forever.com'}
                className='text-gray-600 hover:text-black transition-colors underline'
              >
                Email Us
              </button>
              <button 
                onClick={() => navigate('/about')}
                className='text-gray-600 hover:text-black transition-colors underline'
              >
                About Us
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ErrorPage