import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { backendUrl, currency } from '../App'
import { toast } from 'react-toastify'

const List = ({ token }) => {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(false)
  const [removing, setRemoving] = useState([]) // Track items being removed

  const fetchList = async () => {
    setLoading(true)
    try {
      const response = await axios.get(`${backendUrl}/api/v1/product/list`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      })
      if (response.data.success) setList(response.data.data)
      else toast.error(response.data.message || 'Failed to fetch products')
    } catch (error) {
      console.error(error)
      toast.error(error.response?.data?.message || error.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const removeProduct = async (id) => {
    // Start remove animation
    setRemoving(prev => [...prev, id])

    try {
      const response = await axios.delete(`${backendUrl}/api/v1/product/remove/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      })

      if (response.data.success) {
        toast.success('Product removed successfully')
        // Wait for animation to finish before updating list
        setTimeout(() => {
          setList(prev => prev.filter(item => item._id !== id))
          setRemoving(prev => prev.filter(itemId => itemId !== id))
        }, 300) // duration matches CSS transition
      } else {
        toast.error(response.data.message || 'Failed to remove product')
        setRemoving(prev => prev.filter(itemId => itemId !== id))
      }
    } catch (error) {
      console.error('Remove error:', error)
      toast.error(error.response?.data?.message || 'Failed to remove product')
      setRemoving(prev => prev.filter(itemId => itemId !== id))
    }
  }

  useEffect(() => {
    fetchList()
  }, [])

  if (loading) return <div className="text-center py-4">Loading products...</div>

  return (
    <>
      <p className="mb-2 font-semibold">All Products List</p>
      <div className="flex flex-col gap-2">
        <div className="hidden md:grid grid-cols-[1fr_3fr_1fr_1fr_1fr] items-center py-1 px-2 border bg-gray-100 text-sm">
          <b>Image</b>
          <b>Name</b>
          <b>Category</b>
          <b>Price</b>
          <b className="text-center">Action</b>
        </div>
        {list.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No products found</div>
        ) : (
          list.map((item, index) => {
            const isRemoving = removing.includes(item._id)
            return (
              <div
                key={item._id || index}
                className={`grid grid-cols-1 md:grid-cols-[1fr_3fr_1fr_1fr_1fr] items-center gap-2 py-1 px-2 border text-sm transition-all duration-300 ease-in-out
                ${isRemoving ? 'opacity-0 transform -translate-x-10' : 'opacity-100 transform translate-x-0'}`}
              >
                <img
                  className="w-12 h-12 object-cover rounded"
                  src={item.images?.[0] || '/placeholder.png'}
                  alt={item.name}
                  onError={(e) => e.target.style.display = 'none'}
                />
                <p>{item.name}</p>
                <p>{item.category}</p>
                <p>{currency}{item.price}</p>
                <p
                  onClick={() => removeProduct(item._id)}
                  className="text-right md:text-center cursor-pointer text-lg text-red-500"
                >
                  ✖
                </p>
              </div>
            )
          })
        )}
      </div>
    </>
  )
}

export default List
