import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { backendUrl, currency } from '../App'
import { toast } from 'react-toastify'

const List = () => {
  const [list, setList] = useState([])

  const fetchList = async () => {
    try {
      const response = await axios.get(backendUrl + '/api/v1/product/list')
      console.log("API Response:", response.data)

      if (response.data.success) {
        setList(response.data.data)   // ✅ use data array, not success
      } else {
        toast.error(response.data.message || 'Failed to fetch products')
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message || 'Something went wrong')
    }
  }

  useEffect(() => {
    fetchList()
  }, [])

  return (
    <>
      <p className='mb-2'>All Products List</p>
      <div className='flex flex-col gap-2'>
        <div className='hidden md:grid grid-cols-[1fr_3fr_1fr_1fr_1fr] items-center py-1 px-2 border bg-gray-100 text-sm'>
          <b>Image</b>
          <b>Name</b>
          <b>Category</b>
          <b>Price</b>
          <b className='text-center'>Action</b>
        </div>
        {
          list.map((item, index) => (
            <div key={index} className='grid grid-cols-1 md:grid-cols-[1fr_3fr_1fr_1fr_1fr] items-center border px-2 py-1'>
              <img src={item.image[0]} alt="" />
              <p>{item.name}</p>
              <p>{item.category}</p>
              <p>{currency}{item.price}</p>
              <p className='text-center text-red-500 cursor-pointer'>X</p>
            </div>
          ))
        }
      </div>
    </>
  )
}

export default List
