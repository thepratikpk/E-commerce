import React, {useContext,useEffect,useState} from 'react'
import { ShopContext } from '../context/ShopContex.jsx'
import { assets } from '../assets/assets.jsx';
import ProductItem from '../components/ProductItem.jsx';
import Title from '../components/Title.jsx';

const Collection = () => {
  const {productScreenshots,search,showSearch}=useContext(ShopContext);
  const [showFilter,setShowFilter]=useState(false);
  const [filterProducts,setFilterProducts]=useState([]);
  const [category,setCategory]=useState([]);
  const [subCategory,setSubCategory]=useState([]);
  const [sortType,setSortType]=useState('relavent');

  const toggleCategory=(e)=>{
    if(category.includes(e.target.value)){
      setCategory(prev=>prev.filter(item=>item !== e.target.value))
    }
    else{
      setCategory(prev=>[...prev,e.target.value])
    }
  }

  const toggleSubCategory=(e)=>{
    if(subCategory.includes(e.target.value)){0
      setSubCategory(prev=>prev.filter(item=>item !== e.target.value))
    }
    else{
      setSubCategory(prev=>[...prev,e.target.value])
    }
  }
  const applyFilter=()=>{
    let productsCopy=productScreenshots.slice();
    if(showSearch && search){
      productsCopy=productsCopy.filter(item=>item.name.toLowerCase().includes(search.toLowerCase()));
    }
    if(category.length>0){
      productsCopy=productsCopy.filter(item=>category.includes(item.category));
    }
    if(subCategory.length>0){
      productsCopy=productsCopy.filter(item=>subCategory.includes(item.subCaegory));
    }
    setFilterProducts(productsCopy);
  }
  const sortProducts=()=>{
    let fpcopy=filterProducts.slice();
    switch(sortType){
      case 'low-high':
        setFilterProducts(fpcopy.sort((a,b)=>(a.price-b.price)));
        break;
      case 'high-low':
        setFilterProducts(fpcopy.sort((a,b)=>(b.price-a.price)));
        break;
      default:
        applyFilter();
        break;
    }
  }
  useEffect(()=>{
    applyFilter();
  },[category,subCategory,search,showSearch])
  useEffect(()=>{ 
    sortProducts();
  },[sortType])
  return (
    <div className='flex flex-col sm:flex-row gap-1 sm:gap-10 pt-10 border-t'>
      {/* Filter Options */}
      <div className='min-w-60'>
        <p onClick={()=>setShowFilter(!showFilter)} className='my-2 text-xl flex items-center cursor-pointer gap-2'>FILTERS
          <img src={assets.dropdown} className={`h-3 sm:hidden ${showFilter ? 'rotate-270':''}`} alt="" />
        </p>
        {/* Category Filter */}
        <div className={`border border-gray-300 pl-5 py-3 mt-6 ${showFilter ? '' :'hidden'} sm:block`}>
          <p className='mb-3 text-sm font-medium'>CATEGORIES</p>
          <div className='flex flex-col gap-2 text-sm font-light text-gray-700'>
            <p className='flex gap-2'>
              <input type="checkbox" className='w-3' value={'Men'} onChange={toggleCategory}/> MEN
            </p>
            <p className='flex gap-2'>
              <input type="checkbox" className='w-3' value={'Women'} onChange={toggleCategory}/> Women
            </p>
          </div>
        </div>
        {/* Sub Category Filter */}
         <div className={`border border-gray-300 pl-5 py-3 my-5 ${showFilter ? '' :'hidden'} sm:block`}>
          <p className='mb-3 text-sm font-medium'>TYPES</p>
          <div className='flex flex-col gap-2 text-sm font-light text-gray-700'>
            <p className='flex gap-2'>
              <input type="checkbox" className='w-3' value={'T-shirt'} onChange={toggleSubCategory} /> T-shirt
            </p>
             <p className='flex gap-2'>
              <input type="checkbox" className='w-3' value={'Women-Bodycon'} onChange={toggleSubCategory} /> Women-Bodycon
            </p>
          </div>
        </div>
      </div>
      {/*Right side*/}
      <div className='flex-1'>
        <div className='flex justify-between text-base sm:text-2xl mb-4'>
          <Title text1={'ALL'} text2={'COLLECTION'}/>
          {/* Product Sort */}
          <select onChange={(e)=>setSortType(e.target.value)} className='border-2 border-gray-300 text-sm px-2'>
            <option value="relavent">Sort by: Relavent</option>
            <option value="low-high">Sort by: Low to High</option>
            <option value="high-low">Sort by: High to Low</option>
          </select>
        </div>
        {/* Map Products */}
        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 gap-y-6'>
          {
            filterProducts.map((item,index)=>(
              <ProductItem key={index} name={item.name} id={item._id} price={item.price} image={item.image} />
            ))
          }
        </div>
      </div>
      
    </div>
  )
}

export default Collection
