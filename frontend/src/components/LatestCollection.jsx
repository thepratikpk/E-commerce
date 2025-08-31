import React,{useContext,useEffect,useState} from 'react'
import { ShopContext } from '../context/ShopContex';
import Title from './Title';
import ProductItem from './ProductItem';

const LatestCollection = () => {
    const {productScreenshots}=useContext(ShopContext);
    
    const [latestProducts,setLatestProducts]=useState([]);
    useEffect(()=>{
        
        setLatestProducts(productScreenshots.slice(0,3));
    },[])
  return (
    <div className='my-10'>
        <div className='text-center py-8 text-3xl'>
            <Title text1={'Latest'} text2={'Collection'}/>
            <p className='w-3/4 m-auto text-xs sm:text-sm md:text-base text-gray-600'>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Ratione minus reprehenderit harum et aspernatur, fuga blanditiis rerum esse non nobis. Dolores incidunt nisi asperiores quaerat nihil veniam quis mollitia ullam?
            </p>
        </div>
        {/* Redering Products */}
        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4  gap-y-6'>
            {
                latestProducts.map((item,index)=>(
                    <ProductItem key={index} id={item._id} name={item.name} price={item.price} image={item.image} />
                ))
            }

        </div>
      
    </div>
  )
}

export default LatestCollection
