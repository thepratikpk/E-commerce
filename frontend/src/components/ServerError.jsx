import React from 'react'

const ServerError = ({ 
  message = "Unable to load content", 
  onRetry = null,
  showRetry = true,
  compact = false 
}) => {
  
  if (compact) {
    return (
      <div className='text-center py-8'>
        <div className='text-gray-500 mb-4'>
          <svg className='w-8 h-8 mx-auto mb-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
          </svg>
          <p className='text-sm'>{message}</p>
        </div>
        {showRetry && onRetry && (
          <button 
            onClick={onRetry}
            className='text-sm text-gray-600 hover:text-black underline'
          >
            Try again
          </button>
        )}
      </div>
    );
  }

  return (
    <div className='text-center py-16'>
      <div className='max-w-md mx-auto'>
        {/* Error Icon */}
        <div className='w-16 h-16 mx-auto mb-6 border border-gray-300 rounded-full flex items-center justify-center'>
          <svg className='w-8 h-8 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
          </svg>
        </div>
        
        {/* Error Message */}
        <h3 className='text-lg font-medium text-gray-800 mb-2'>
          Something went wrong
        </h3>
        <p className='text-gray-600 mb-6'>
          {message}
        </p>
        
        {/* Retry Button */}
        {showRetry && onRetry && (
          <button 
            onClick={onRetry}
            className='border border-black px-6 py-2 text-sm hover:bg-black hover:text-white transition-all duration-300'
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
};

export default ServerError;