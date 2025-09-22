const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';

export const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Include cookies for authentication
  };

  const config = { ...defaultOptions, ...options };

  try {
    const response = await fetch(url, config);
    
    // Try to parse JSON response
    let data;
    try {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        // Handle non-JSON responses
        const text = await response.text();
        data = { message: `Server returned ${response.status}: ${response.statusText}` };
      }
    } catch (parseError) {
      // If JSON parsing fails, create a generic error
      data = { message: `Server returned ${response.status}: ${response.statusText}` };
    }
    
    if (!response.ok) {
      const error = new Error(data.message || 'API request failed');
      error.status = response.status;
      error.data = data;
      throw error;
    }
    
    return data;
  } catch (error) {
    // Add status code to network errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      error.status = 0; // Network error
      error.message = 'Network error. Please check your connection and try again.';
    }
    
    // Only log non-401 errors to reduce console noise
    if (!error.message?.includes('401') && !error.message?.includes('Unauthorized')) {
      console.error('API Error:', error);
    }
    
    throw error;
  }
};

export const authAPI = {
  login: (credentials) => 
    apiCall('/api/v1/user/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
  
  register: (userData) => 
    apiCall('/api/v1/user/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),
  
  logout: () => 
    apiCall('/api/v1/user/logout', {
      method: 'POST',
    }),
  
  getCurrentUser: () => 
    apiCall('/api/v1/user/me'),

  updateAccount: (userData) =>
    apiCall('/api/v1/user/update-account', {
      method: 'PATCH',
      body: JSON.stringify(userData),
    }),

  changePassword: (passwordData) =>
    apiCall('/api/v1/user/change-password', {
      method: 'PATCH',
      body: JSON.stringify(passwordData),
    }),

  refreshToken: () =>
    apiCall('/api/v1/user/refresh-token', {
      method: 'POST',
    }),
};

export const cartAPI = {
  addToCart: (itemId, size) =>
    apiCall('/api/v1/cart/add', {
      method: 'POST',
      body: JSON.stringify({ itemId, size }),
    }),

  updateCart: (itemId, size, quantity) =>
    apiCall('/api/v1/cart/update', {
      method: 'PUT',
      body: JSON.stringify({ itemId, size, quantity }),
    }),

  getUserCart: () =>
    apiCall('/api/v1/cart'),

  removeCartItem: (itemId, size) =>
    apiCall('/api/v1/cart/remove', {
      method: 'DELETE',
      body: JSON.stringify({ itemId, size }),
    }),

  clearCart: () =>
    apiCall('/api/v1/cart/clear', {
      method: 'DELETE',
    }),
};