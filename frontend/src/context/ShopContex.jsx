import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI, cartAPI } from "../utils/api";
import toast from "../utils/toast";

export const ShopContext = createContext();

const ShopContextProvider = (props) => {
  const currency = "₹";
  const delivery = 10;
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [cartItems, setCartItems] = useState({});
  const [productScreenshots, setProductScreenshots] = useState([]);
  
  // Debug: Log cart changes in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Cart items changed:', cartItems, 'Count:', Object.keys(cartItems).length);
    }
  }, [cartItems]);

  // Debug: Log products when they change
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('=== DEBUG: Products loaded:', productScreenshots.length);
      if (productScreenshots.length > 0) {
        console.log('=== DEBUG: First product:', productScreenshots[0]);
      }
    }
  }, [productScreenshots]);
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [cartLoading, setCartLoading] = useState(false);
  const [skipAuthCheck, setSkipAuthCheck] = useState(false);
  const navigate = useNavigate();

  const addToCart = async (itemId, size) => {
    if (!size) {
      toast.error("Please select product size");
      return;
    }

    try {
      if (isAuthenticated) {
        // If user is logged in, add to backend cart
        const response = await cartAPI.addToCart(itemId, size);
        if (response.success) {
          setCartItems(response.data);
          toast.success(response.message || "Item added to cart");
        }
      } else {
        // If user is not logged in, add to local storage cart
        let cartData = structuredClone(cartItems);
        if (cartData[itemId]) {
          if (cartData[itemId][size]) {
            cartData[itemId][size] += 1;
          } else {
            cartData[itemId][size] = 1;
          }
        } else {
          cartData[itemId] = {};
          cartData[itemId][size] = 1;
        }
        setCartItems(cartData);
        localStorage.setItem('cartItems', JSON.stringify(cartData));
        toast.success("Item added to cart");
      }
    } catch (error) {
      toast.error(error.message || "Failed to add item to cart");
    }
  };

  const getCartCount = () => {
    let totalCount = 0;
    for (const items in cartItems) {
      for (const item in cartItems[items]) {
        try {
          if (cartItems[items][item] > 0) {
            totalCount += cartItems[items][item];
          }
        } catch (error) {
          console.error("Cart count error:", error);
        }
      }
    }
    return totalCount;
  };

  const getCartAmount = () => {
    let totalAmount = 0;
    for (const items in cartItems) {
      let itemInfo = productScreenshots.find(
        (product) => product._id === items
      );
      if (!itemInfo) continue; // ✅ prevent crash if product not found
      for (const item in cartItems[items]) {
        try {
          if (cartItems[items][item] > 0) {
            totalAmount += itemInfo.price * cartItems[items][item];
          }
        } catch (error) {
          console.error("Cart amount error:", error);
        }
      }
    }
    return totalAmount;
  };

  const updateQuantity = async (itemId, size, quantity) => {
    try {
      if (isAuthenticated) {
        // If user is logged in, update backend cart
        if (quantity === 0) {
          // Remove item from cart
          const response = await cartAPI.removeCartItem(itemId, size);
          if (response.success) {
            setCartItems(response.data);
            toast.success(response.message || "Item removed from cart");
          }
        } else {
          // Update quantity
          const response = await cartAPI.updateCart(itemId, size, quantity);
          if (response.success) {
            setCartItems(response.data);
            toast.success(response.message || "Cart updated");
          }
        }
      } else {
        // If user is not logged in, update local storage cart
        let cartData = structuredClone(cartItems);
        if (quantity === 0) {
          delete cartData[itemId][size];
          if (Object.keys(cartData[itemId]).length === 0) {
            delete cartData[itemId];
          }
        } else {
          cartData[itemId][size] = quantity;
        }
        setCartItems(cartData);
        localStorage.setItem('cartItems', JSON.stringify(cartData));
      }
    } catch (error) {
      toast.error(error.message || "Failed to update cart");
    }
  };

  // Cart functions
  const loadUserCart = async () => {
    try {
      setCartLoading(true);
      const response = await cartAPI.getUserCart();
      if (response.success) {
        const cartData = response.data || {};
        setCartItems(cartData);
        return cartData;
      }
      return {};
    } catch (error) {
      console.error("Failed to load user cart:", error);
      return {};
    } finally {
      setCartLoading(false);
    }
  };

  const syncLocalCartToBackend = async () => {
    try {
      // Always load the user's cart from backend first
      const backendCart = await loadUserCart();
      
      // Check if there are local cart items to sync
      const localCart = JSON.parse(localStorage.getItem('cartItems') || '{}');
      const hasLocalItems = Object.keys(localCart).length > 0;
      
      if (hasLocalItems) {
        // Add each item from local cart to backend
        for (const itemId in localCart) {
          for (const size in localCart[itemId]) {
            const quantity = localCart[itemId][size];
            // Add items one by one to backend
            for (let i = 0; i < quantity; i++) {
              await cartAPI.addToCart(itemId, size);
            }
          }
        }
        
        // Clear local cart after syncing
        localStorage.removeItem('cartItems');
        
        // Reload cart to get the final state after syncing
        await loadUserCart();
      }
    } catch (error) {
      console.error("Failed to sync cart:", error);
    }
  };

  const clearCart = async () => {
    try {
      // Clear cart immediately in frontend first
      setCartItems({});
      localStorage.removeItem('cartItems');
      
      if (isAuthenticated) {
        const response = await cartAPI.clearCart();
        if (response.success) {
          console.log('Cart cleared successfully on backend');
          toast.success(response.message || 'Cart cleared');
        } else {
          console.error('Failed to clear cart on backend:', response.message);
        }
      } else {
        toast.success('Cart cleared');
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
      toast.error(error.message || "Failed to clear cart");
    }
  };

  // Authentication functions
  const checkAuthStatus = async () => {
    if (skipAuthCheck) {
      console.log('🔐 Skipping auth check');
      setAuthLoading(false);
      return;
    }
    
    console.log('🔐 Checking auth status...');
    try {
      const response = await authAPI.getCurrentUser();
      if (response.success) {
        console.log('🔐 Auth successful:', { id: response.data._id, name: response.data.name, email: response.data.email });
        setUser(response.data);
        setIsAuthenticated(true);
        setSkipAuthCheck(false);
        // Load user's cart from backend
        await loadUserCart();
      }
    } catch (error) {
      console.log('🔐 Auth failed:', error.message);
      // Only log error if it's not a 401 (which is expected when not logged in)
      if (error.message && !error.message.includes('401') && !error.message.includes('Unauthorized')) {
        console.error('Auth check error:', error);
      }
      setUser(null);
      setIsAuthenticated(false);
      // Load cart from localStorage for non-authenticated users
      const localCart = JSON.parse(localStorage.getItem('cartItems') || '{}');
      setCartItems(localCart);
    } finally {
      setAuthLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      if (response.success) {
        // Set user state first
        setUser(response.data.user);
        setIsAuthenticated(true);
        setSkipAuthCheck(false); // Re-enable auth checks after login
        
        // Load cart immediately after authentication
        await syncLocalCartToBackend();
        
        toast.success(response.message || 'Login successful!');
        return response;
      }
    } catch (error) {
      // The login page will handle showing the error message
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Set states first to prevent auth checks
      setSkipAuthCheck(true); // Prevent further auth checks
      setUser(null);
      setIsAuthenticated(false);
      setCartItems({}); // Clear cart on logout
      localStorage.removeItem('cartItems'); // Clear any local cart data
      
      // Then call logout API
      const response = await authAPI.logout();
      toast.success(response.message || 'Logged out successfully');
      navigate('/');
    } catch (error) {
      // Even if logout API fails, we've already cleared local state
      console.error('Logout API error:', error);
      toast.success('Logged out successfully'); // Still show success since local state is cleared
      navigate('/');
    }
  };

  const updateUserProfile = async (userData) => {
    try {
      const response = await authAPI.updateAccount(userData);
      if (response.success) {
        setUser(response.data);
        toast.success(response.message || 'Profile updated successfully!');
        return response;
      }
    } catch (error) {
      toast.error(error.message || 'Failed to update profile');
      throw error;
    }
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${backendUrl}/api/v1/product/list`, {
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });

        if (!res.ok) {
          throw new Error(`Failed to fetch, status ${res.status}`);
        }

        const result = await res.json();
        console.log("API Result:", result);

        if (!result.success) {
          throw new Error(result.message || "Failed to fetch products");
        }

        const products = result.data || [];
        setProductScreenshots(products);
      } catch (err) {
        console.error("Error fetching products:", err);
        // Only show toast for non-network errors to avoid spam
        if (err.status !== 0) {
          toast.error(err.message || "Error fetching products");
        }
      }
    };

    fetchProducts();
  }, [backendUrl]);

  // Check authentication status on app load
  useEffect(() => {
    console.log('🚀 App starting - checking auth status');
    checkAuthStatus();
  }, []);

  // Debug user changes
  useEffect(() => {
    if (user) {
      console.log('👤 User changed to:', { id: user._id, name: user.name, email: user.email });
    } else {
      console.log('👤 User cleared/logged out');
    }
  }, [user]);

  // Load cart from localStorage for non-authenticated users on app start
  useEffect(() => {
    if (!isAuthenticated && !authLoading) {
      const localCart = JSON.parse(localStorage.getItem('cartItems') || '{}');
      setCartItems(localCart);
    }
  }, [isAuthenticated, authLoading]);

  const value = {
    productScreenshots,
    currency,
    delivery,
    search,
    setSearch,
    showSearch,
    setShowSearch,
    cartItems,
    addToCart,
    setCartItems,
    getCartCount,
    updateQuantity,
    getCartAmount,
    navigate,
    backendUrl,
    // Authentication
    user,
    isAuthenticated,
    authLoading,
    cartLoading,
    login,
    logout,
    checkAuthStatus,
    updateUserProfile,
    loadUserCart,
    syncLocalCartToBackend,
    clearCart,
  };

  return (
    <ShopContext.Provider value={value}>
      {props.children}
    </ShopContext.Provider>
  );
};

export default ShopContextProvider;
