import { useContext, useState, useEffect } from "react";
import { ShopContext } from "../context/ShopContex";
import Title from './Title';
import ProductItem from './ProductItem';

const BestSeller = () => {
  const { productScreenshots, backendUrl } = useContext(ShopContext);
  const [bestSeller, setBestSeller] = useState([]);

  useEffect(() => {
    if (Array.isArray(productScreenshots)) {
      const bestProducts = productScreenshots.filter((item) => item.bestseller);
      setBestSeller(bestProducts.slice(0, 3));
    }
  }, [productScreenshots]);

  return (
    <div className='my-10'>
      <div className='text-center py-8 text-3xl'>
        <Title text1={'BEST'} text2={'SELLERS'} />
        <p className='w-3/4 m-auto text-xs sm:text-sm md:text-base text-gray-600'>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Ratione minus reprehenderit harum et aspernatur, fuga blanditiis rerum esse non nobis. Dolores incidunt nisi asperiores quaerat nihil veniam quis mollitia ullam?
        </p>
      </div>
      <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6'>
        {bestSeller.map((item, index) => (
          <ProductItem
                key={index}
                id={item._id}
                name={item.name}
                price={item.price}
                images={item.images}  // pass the array
              />
        ))}
      </div>
    </div>
  );
}

export default BestSeller;
