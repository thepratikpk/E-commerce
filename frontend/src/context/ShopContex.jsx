import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI, cartAPI, eventAPI } from "../utils/api";
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
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [authLoading, setAuthLoading] = useState(true);
    const [cartLoading, setCartLoading] = useState(false);
    const [skipAuthCheck, setSkipAuthCheck] = useState(false);
    const [lastVisitedProduct, setLastVisitedProduct] = useState(null);
    const [recentlyViewedProducts, setRecentlyViewedProducts] = useState([]);
    
    // State for the authentication token, initialized from localStorage
    const [token, setToken] = useState(localStorage.getItem("token"));

    const navigate = useNavigate();

    const addToCart = async (itemId, size) => {
        if (!size) {
            toast.error("Please select product size");
            return;
        }

        try {
            if (isAuthenticated) {
                const response = await cartAPI.addToCart(itemId, size);
                if (response.success) {
                    setCartItems(response.data);
                    toast.success(response.message || "Item added to cart");
                    
                    // Log add_to_cart event
                    try {
                        await eventAPI.logEvent({
                            productId: itemId,
                            action: 'add_to_cart',
                            userId: user?._id,
                            metadata: { size }
                        }, token);
                    } catch (eventError) {
                        console.error("Failed to log add_to_cart event:", eventError);
                    }
                }
            } else {
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
                
                // Log add_to_cart event for anonymous users
                try {
                    await eventAPI.logEvent({
                        productId: itemId,
                        action: 'add_to_cart',
                        sessionId: 'anonymous_' + Date.now(),
                        metadata: { size }
                    });
                } catch (eventError) {
                    console.error("Failed to log add_to_cart event:", eventError);
                }
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
            if (!itemInfo) continue;
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
                if (quantity === 0) {
                    const response = await cartAPI.removeCartItem(itemId, size);
                    if (response.success) {
                        setCartItems(response.data);
                        toast.success(response.message || "Item removed from cart");
                    }
                } else {
                    const response = await cartAPI.updateCart(itemId, size, quantity);
                    if (response.success) {
                        setCartItems(response.data);
                        toast.success(response.message || "Cart updated");
                    }
                }
            } else {
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
            await loadUserCart();
            
            const localCart = JSON.parse(localStorage.getItem('cartItems') || '{}');
            const hasLocalItems = Object.keys(localCart).length > 0;
            
            if (hasLocalItems) {
                for (const itemId in localCart) {
                    for (const size in localCart[itemId]) {
                        const quantity = localCart[itemId][size];
                        for (let i = 0; i < quantity; i++) {
                            await cartAPI.addToCart(itemId, size);
                        }
                    }
                }
                
                localStorage.removeItem('cartItems');
                await loadUserCart();
            }
        } catch (error) {
            console.error("Failed to sync cart:", error);
        }
    };

    const clearCart = async () => {
        try {
            setCartItems({});
            localStorage.removeItem('cartItems');
            
            if (isAuthenticated) {
                const response = await cartAPI.clearCart();
                if (response.success) {
                    toast.success(response.message || 'Cart cleared');
                }
            } else {
                toast.success('Cart cleared');
            }
        } catch (error) {
            toast.error(error.message || "Failed to clear cart");
        }
    };

    // Track product visits for better recommendations
    const trackProductVisit = (product) => {
        if (!product) return;
        
        // Update last visited product
        setLastVisitedProduct(product);
        
        // Update recently viewed products (keep last 10)
        setRecentlyViewedProducts(prev => {
            const filtered = prev.filter(p => p._id !== product._id);
            const updated = [product, ...filtered].slice(0, 10);
            
            // Store in localStorage for persistence
            localStorage.setItem('recentlyViewedProducts', JSON.stringify(updated));
            return updated;
        });
        

    };

    // Get last visited product for recommendations
    const getLastVisitedProduct = () => {
        return lastVisitedProduct;
    };

    // Get recently viewed products
    const getRecentlyViewedProducts = () => {
        return recentlyViewedProducts;
    };

    const checkAuthStatus = async () => {
        if (skipAuthCheck || !token) {
            setAuthLoading(false);
            return;
        }
        
        try {
            const response = await authAPI.getCurrentUser(); 
            if (response.success) {
                setUser(response.data);
                setIsAuthenticated(true);
                await loadUserCart();
            }
        } catch (error) {
            if (error.status === 401) {
                localStorage.removeItem("token");
                setToken(null);
            }
            setUser(null);
            setIsAuthenticated(false);
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
                const receivedToken = response.data.accessToken; 
                localStorage.setItem("token", receivedToken);
                setToken(receivedToken);
                setUser(response.data.user);
                setIsAuthenticated(true);
                setSkipAuthCheck(false);
                await syncLocalCartToBackend();
                
                toast.success(response.message || 'Login successful!');
                return response;
            }
        } catch (error) {
            throw error;
        }
    };

    const logout = async () => {
        try {
            setSkipAuthCheck(true); 
            
            localStorage.removeItem("token");
            setToken(null);
            setUser(null);
            setIsAuthenticated(false);
            setCartItems({});
            localStorage.removeItem('cartItems'); 
            
            const response = await authAPI.logout();
            toast.success(response.message || 'Logged out successfully');
            navigate('/');
        } catch (error) {
            console.error('Logout API error:', error);
            toast.success('Logged out successfully');
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
                if (!result.success) {
                    throw new Error(result.message || "Failed to fetch products");
                }
                setProductScreenshots(result.data || []);
            } catch (err) {
                console.error("Error fetching products:", err);
                if (err.status !== 0) {
                    toast.error(err.message || "Error fetching products");
                }
            }
        };
        fetchProducts();
    }, [backendUrl]);

    // Load recently viewed products from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem('recentlyViewedProducts');
            if (stored) {
                const parsed = JSON.parse(stored);
                setRecentlyViewedProducts(parsed);
                if (parsed.length > 0) {
                    setLastVisitedProduct(parsed[0]);

                }
            }
        } catch (error) {
            console.error('Error loading recently viewed products:', error);
        }
    }, []);

    useEffect(() => {
        checkAuthStatus();
    }, [token]);

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
        trackProductVisit,
        getLastVisitedProduct,
        getRecentlyViewedProducts,
        lastVisitedProduct,
        recentlyViewedProducts,
        userId: user?._id,
        token,
    };

    return (
        <ShopContext.Provider value={value}>
            {props.children}
        </ShopContext.Provider>
    );
};

export default ShopContextProvider;