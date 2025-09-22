import { useState } from 'react';
import toast from '../utils/toast';

export const useErrorHandler = () => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleError = (error, showToast = true) => {
    console.error('Error occurred:', error);
    
    let errorMessage = 'Something went wrong';
    let errorType = 'error';

    // Handle different types of errors
    if (error.message) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }

    // Handle specific HTTP status codes
    if (error.status) {
      switch (error.status) {
        case 400:
          errorType = 'validation';
          break;
        case 401:
          errorMessage = 'Please log in to continue';
          errorType = 'auth';
          break;
        case 403:
          errorMessage = 'You don\'t have permission to perform this action';
          errorType = 'permission';
          break;
        case 404:
          errorMessage = 'The requested resource was not found';
          errorType = 'notFound';
          break;
        case 500:
          errorMessage = 'Server error. Please try again later';
          errorType = 'server';
          break;
        case 503:
          errorMessage = 'Service temporarily unavailable';
          errorType = 'service';
          break;
        default:
          errorMessage = `Error ${error.status}: ${errorMessage}`;
      }
    }

    // Handle network errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      errorMessage = 'Network error. Please check your connection';
      errorType = 'network';
    }

    setError({ message: errorMessage, type: errorType, originalError: error });

    if (showToast) {
      toast.error(errorMessage);
    }

    return { message: errorMessage, type: errorType };
  };

  const clearError = () => {
    setError(null);
  };

  const withErrorHandling = async (asyncFunction, showToast = true) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await asyncFunction();
      setIsLoading(false);
      return result;
    } catch (error) {
      setIsLoading(false);
      handleError(error, showToast);
      throw error;
    }
  };

  return {
    error,
    isLoading,
    handleError,
    clearError,
    withErrorHandling,
    setIsLoading
  };
};

export default useErrorHandler;