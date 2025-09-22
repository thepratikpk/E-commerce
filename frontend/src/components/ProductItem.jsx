import React, { useContext } from "react";
import { ShopContext } from "../context/ShopContex.jsx";
import { Link } from "react-router-dom";

const ProductItem = ({ id, images, name, price }) => {
  const { currency } = useContext(ShopContext);

  // ✅ Pick first image or fallback
  const imageUrl =
    Array.isArray(images) && images.length > 0
      ? images[0]
      : "/placeholder.png";

  return (
    <Link
      to={`/product/${id}`}
      className="group block text-gray-700 cursor-pointer"
      role="article"
      aria-label={`View details for ${name}`}
    >
      {/* Image Wrapper */}
      <div className="overflow-hidden rounded-xl aspect-[3/4] bg-gray-100">
        <img
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          src={imageUrl}
          alt={name || "Product Image"}
          onError={(e) => (e.target.src = "/placeholder.png")}
        />
      </div>

      {/* Product Info */}
      <div className="mt-3">
        <p className="text-sm font-medium truncate">{name}</p>
        <p className="text-sm font-semibold text-gray-800">
          {currency}
          {Number(price).toLocaleString("en-IN")}
        </p>
      </div>
    </Link>
  );
};

export default ProductItem;
