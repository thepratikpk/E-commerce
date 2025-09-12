import React,{useContext,useEffect,useState} from 'react'
import { ShopContext } from '../context/ShopContex'
import Title from './Title'
import ProductItem from './ProductItem'

const RelatedProduct = ({category,subCategory}) => {
    const {productScreenshots}=useContext(ShopContext);
    const [related,setRelated]=useState([]);

    useEffect(()=>{
        if(productScreenshots.length>0){
            let productsCopy=productScreenshots.slice();
            productsCopy=productsCopy.filter((item)=>item.category === category);
            productsCopy=productsCopy.filter((item)=>item.subCategory === subCategory);

            setRelated(productsCopy.slice(0,4));
        }
    },[productScreenshots])
  return (
    <div className='my-24'>
        <div className='text-center py-2 text-3xl'>
            <Title text1={'RELATED'} text2={"PRODUCTS"}/>
        </div>
        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 lg:grid-cols-5 gap-4  gap-y-6'>
            {
                related.map((item,index)=>(
                    <ProductItem key={index} id={item._id} name={item.name} price={item.price} image={item.image} />
                ))
            }
        </div>
    </div>
  )
}

export default RelatedProduct
