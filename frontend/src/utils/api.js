const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';

export const apiCall = async (endpoint, options = {}, customBaseUrl = null) => {
  const baseUrl = customBaseUrl || API_BASE_URL;
  const url = `${baseUrl}${endpoint}`;

  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Include cookies for authentication
  };

  const config = { 
    ...defaultOptions, 
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    }
  };

  try {
    const response = await fetch(url, config);

    let data;
    try {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        data = { message: `Server returned ${response.status}: ${response.statusText}` };
      }
    } catch (parseError) {
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
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      error.status = 0; // Network error
      error.message = 'Network error. Please check your connection and try again.';
    }
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

export const orderAPI = {
  placeOrder: (orderData) =>
    apiCall('/api/v1/order/place', {
      method: 'POST',
      body: JSON.stringify(orderData),
    }),
  placeOrderStripe: (orderData) =>
    apiCall('/api/v1/order/stripe', {
      method: 'POST',
      body: JSON.stringify(orderData),
    }),
  getUserOrders: () =>
    apiCall('/api/v1/order/userorders'),
  verifyStripe: (orderId, success) =>
    apiCall('/api/v1/order/verifyStripe', {
      method: 'POST',
      body: JSON.stringify({ orderId, success }),
    }),
};

export const recommendationAPI = {
  getRecommendations: (token) =>
    apiCall(
      '/api/recommendations', // The endpoint
      { // Options object
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      },
      'http://localhost:5000' // The custom base URL for the Python service
    )
};

export const eventAPI = {
  logEvent: (eventData, token) =>
    apiCall(
      '/api/v1/events/log', // The event logging endpoint
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(eventData),
      }
    ),
};