import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContex";
import Title from "./Title";
import ProductItem from "./ProductItem";

const LatestCollection = () => {
  const { productScreenshots } = useContext(ShopContext);

  const [latestProducts, setLatestProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (productScreenshots && productScreenshots.length > 0) {
      setLatestProducts(productScreenshots.slice(0, 6));
      setLoading(false);
    }
  }, [productScreenshots]);

  return (
    <div className="my-10">
      {/* Heading */}
      <div className="text-center py-8">
        <Title text1="Latest" text2="Collection" />
        <p className="w-11/12 sm:w-3/4 mx-auto text-xs sm:text-sm md:text-base text-gray-600 mt-2">
          Discover our newest arrivals – handpicked to keep your style fresh
          and modern.
        </p>
      </div>

      {/* Products Section */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-40 bg-gray-200 animate-pulse rounded-xl"
            />
          ))}
        </div>
      ) : latestProducts.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {latestProducts.map((item) => (
            <ProductItem
              key={item._id}
              id={item._id}
              name={item.name}
              price={item.price}
              images={item.images} // ✅ correct: pass array
            />
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 mt-6">
          No products available at the moment.
        </p>
      )}
    </div>
  );
};

export default LatestCollection;
