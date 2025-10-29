import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContex";
import Title from "./Title";
import ProductItem from "./ProductItem";
import { recommendationAPI } from "../utils/api";

const ForYou = () => {
  const { 
    isAuthenticated, 
    token, 
    productScreenshots, 
    lastVisitedProduct, 
    getRecentlyViewedProducts 
  } = useContext(ShopContext);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recommendationMeta, setRecommendationMeta] = useState(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true);
      setError(null);

      try {
        if (isAuthenticated && token) {
          console.log("🤖 Fetching personalized AI recommendations...");
          
          const data = await recommendationAPI.getRecommendations(token);

          if (data.success && data.recommendations && data.recommendations.length > 0) {
            // Map recommendation IDs to full product details
            const recommendedIds = new Set(data.recommendations);
            
            // Preserve the order from recommendations
            const fullProductDetails = data.recommendations
              .map(id => productScreenshots.find(product => product._id === id))
              .filter(product => product !== undefined); // Remove any products not found

            if (fullProductDetails.length > 0) {
              console.log(`✅ Got ${fullProductDetails.length} AI recommendations`);
              setRecommendedProducts(fullProductDetails);
              setRecommendationMeta(data.metadata);
              return;
            }
          }

          // If ML service returns empty (user has seen everything), use category-based
          if (data.success && data.recommendations && data.recommendations.length === 0) {
            console.log("🎯 Power user detected! Using category-based recommendations...");
            // Skip recently viewed here since we have a separate section for that
            // Fall through to category-based logic below
          }
        }
        
        // Enhanced fallback based on last visited product (for all users)
        if (lastVisitedProduct) {
          console.log("📍 Using last visited product for recommendations:", lastVisitedProduct.name);
          
          // Get products from same category as last visited
          const sameCategoryProducts = productScreenshots.filter(product => 
            product._id !== lastVisitedProduct._id && 
            product.category === lastVisitedProduct.category
          );
          
          // Get products from same subcategory
          const sameSubCategoryProducts = productScreenshots.filter(product => 
            product._id !== lastVisitedProduct._id && 
            product.subCategory === lastVisitedProduct.subCategory
          );
          
          // Combine and prioritize: same subcategory first, then same category, then others
          const otherProducts = productScreenshots.filter(product => 
            product._id !== lastVisitedProduct._id && 
            product.category !== lastVisitedProduct.category &&
            product.subCategory !== lastVisitedProduct.subCategory
          );
          
          const combinedRecommendations = [
            ...sameSubCategoryProducts.slice(0, 4),
            ...sameCategoryProducts.slice(0, 3),
            ...otherProducts.sort(() => Math.random() - 0.5).slice(0, 3)
          ].slice(0, 10);
          
          if (combinedRecommendations.length > 0) {
            setRecommendedProducts(combinedRecommendations);
            setRecommendationMeta({ 
              type: 'category-based', 
              source: 'last-visited',
              lastProduct: lastVisitedProduct.name 
            });
            return;
          }
        }
        
        // Final fallback - random popular products
        console.log("🎲 Using random products as final fallback");
        const fallbackProducts = [...productScreenshots]
          .sort(() => Math.random() - 0.5)
          .slice(0, 10);
        
        setRecommendedProducts(fallbackProducts);
        setRecommendationMeta({ type: 'random', source: 'fallback' });

      } catch (error) {
        console.error("❌ Recommendation service error:", error.message);
        setError("Unable to load personalized recommendations");
        
        // Fallback to showing random products
        const fallbackProducts = [...productScreenshots]
          .sort(() => Math.random() - 0.5)
          .slice(0, 10);
        
        setRecommendedProducts(fallbackProducts);
      } finally {
        setLoading(false);
      }
    };

    if (productScreenshots.length > 0) {
      fetchRecommendations();
    }
  }, [isAuthenticated, token, productScreenshots, lastVisitedProduct, getRecentlyViewedProducts]);

  // Don't show the section if there are no products at all
  if (!loading && recommendedProducts.length === 0) {
    return null;
  }

  return (
    <div className="my-10">
      {/* Heading */}
      <div className="text-center py-8">
        <Title text1="Just For" text2="You" />
        <p className="w-11/12 sm:w-3/4 mx-auto text-xs sm:text-sm md:text-base text-gray-600 mt-2">
          {recommendationMeta?.type === 'category-based' && lastVisitedProduct ? (
            <>Based on your interest in "{lastVisitedProduct.name}" and similar products</>
          ) : recommendationMeta?.type === 'recently-viewed' ? (
            <>Your recently viewed products</>
          ) : isAuthenticated ? (
            recommendationMeta?.strategy_used === 'ml' ? (
              <>AI-powered recommendations just for you</>
            ) : (
              <>Curated picks based on shoppers with similar tastes</>
            )
          ) : lastVisitedProduct ? (
            <>More products like "{lastVisitedProduct.name}"</>
          ) : (
            <>Discover trending products - Sign in for personalized recommendations</>
          )}
        </p>
        
        {/* Optional: Show some metadata for debugging or user insight */}
        {isAuthenticated && recommendationMeta && (
          <p className="text-xs text-gray-400 mt-1">
            Based on your {recommendationMeta.user_seen_count} interactions
          </p>
        )}
      </div>

      {/* Error Message */}
      {error && !loading && (
        <div className="text-center mb-4">
          <p className="text-sm text-amber-600 bg-amber-50 py-2 px-4 rounded-lg inline-block">
            ⚠️ {error} - Showing popular items instead
          </p>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-square bg-gray-200 rounded-xl mb-3" />
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : recommendedProducts.length > 0 ? (
        <>
          {/* Products Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {recommendedProducts.map((item, index) => (
              <ProductItem
                key={`${item._id}-${index}`} // Using index as backup to ensure uniqueness
                id={item._id}
                name={item.name}
                price={item.price}
                images={item.images}
              />
            ))}
          </div>

          {/* Refresh Button (Optional) */}
          {isAuthenticated && (
            <div className="text-center mt-8">
              <button
                onClick={() => window.location.reload()}
                className="text-sm text-gray-600 hover:text-gray-900 underline"
              >
                🔄 Refresh recommendations
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg mb-2">
            No recommendations available yet
          </p>
          <p className="text-gray-400 text-sm">
            {isAuthenticated 
              ? "Start browsing products to get personalized recommendations!"
              : "Sign in to get AI-powered personalized recommendations"
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default ForYou;