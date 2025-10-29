import React, { useContext } from 'react';
import { ShopContext } from '../context/ShopContex';
import Title from './Title';
import ProductItem from './ProductItem';

const RecentlyViewed = () => {
    const { getRecentlyViewedProducts } = useContext(ShopContext);
    const recentlyViewed = getRecentlyViewedProducts();

    // Don't show if no recently viewed products or less than 2
    if (!recentlyViewed || recentlyViewed.length < 2) {
        return null;
    }

    return (
        <div className="my-10">
            <div className="text-center py-8">
                <Title text1="Recently" text2="Viewed" />
                <p className="w-11/12 sm:w-3/4 mx-auto text-xs sm:text-sm md:text-base text-gray-600 mt-2">
                    Continue where you left off - products you've recently explored
                </p>
            </div>
            
            {/* Horizontal scrollable on mobile, grid on desktop */}
            <div className="overflow-x-auto pb-4">
                <div className="flex gap-4 sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 sm:gap-6">
                    {recentlyViewed.slice(0, 8).map((item, index) => (
                        <div key={`${item._id}-${index}`} className="flex-shrink-0 w-40 sm:w-auto">
                            <ProductItem
                                id={item._id}
                                name={item.name}
                                price={item.price}
                                images={item.images}
                            />
                        </div>
                    ))}
                </div>
            </div>
            
            {/* Clear history option */}
            <div className="text-center mt-4">
                <button 
                    onClick={() => {
                        localStorage.removeItem('recentlyViewedProducts');
                        window.location.reload(); // Simple refresh to update state
                    }}
                    className="text-xs text-gray-500 hover:text-gray-700 underline"
                >
                    Clear viewing history
                </button>
            </div>
        </div>
    );
};

export default RecentlyViewed;