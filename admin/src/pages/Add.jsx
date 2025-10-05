import React, { useState } from 'react'
import { assets } from '../assets/assets'
import axios from 'axios'
import { backendUrl } from '../App'
import { toast } from 'react-toastify'

const Add = ({ token }) => {
  const [image1, setImage1] = useState(false)
  const [image2, setImage2] = useState(false)
  const [image3, setImage3] = useState(false)
  const [image4, setImage4] = useState(false)

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [category, setCategory] = useState("Men")
  const [subcategory, setSubCategory] = useState("Topwear")
  const [bestseller, setBestseller] = useState(false)
  const [sizes, setSizes] = useState([])
  const [loading, setLoading] = useState(false) // ✅ loading state

  const onSubmitHandler = async (e) => {
    e.preventDefault()
    setLoading(true) // start loading
    try {
      const formData = new FormData()
      formData.append("name", name)
      formData.append("description", description)
      formData.append("price", price)
      formData.append("category", category)
      formData.append("subCategory", subcategory)
      formData.append("bestseller", bestseller.toString())
      formData.append("sizes", JSON.stringify(sizes))

      if (image1) formData.append("image1", image1)
      if (image2) formData.append("image2", image2)
      if (image3) formData.append("image3", image3)
      if (image4) formData.append("image4", image4)

      const response = await axios.post(
        `${backendUrl}/api/v1/product/add`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      )

      if (response.data.success) {
        toast.success(response.data.message)
        
        // Notify about ML model retraining
        setTimeout(() => {
          toast.info("💡 New product added! Consider retraining the ML model for better recommendations.", {
            autoClose: 8000
          })
        }, 2000)
        
        setName("")
        setDescription("")
        setImage1(false)
        setImage2(false)
        setImage3(false)
        setImage4(false)
        setPrice("")
        setSizes([])
        setBestseller(false)
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.error(error)
      toast.error(error.response?.data?.message || error.message)
    } finally {
      setLoading(false) // stop loading
    }
  }

  return (
    <form onSubmit={onSubmitHandler} className='flex flex-col w-full items-start gap-3'>
      <div>
        <p className='mb-2'>Upload Image</p>
        <div className='flex gap-2'>
          {[image1, image2, image3, image4].map((img, i) => (
            <label key={i} htmlFor={`image${i+1}`}>
              <img
                className='w-20 h-20 object-cover border rounded'
                src={!img ? assets.upload_area : URL.createObjectURL(img)}
                alt=""
              />
              <input
                onChange={(e) => {
                  if (i === 0) setImage1(e.target.files[0])
                  if (i === 1) setImage2(e.target.files[0])
                  if (i === 2) setImage3(e.target.files[0])
                  if (i === 3) setImage4(e.target.files[0])
                }}
                type="file"
                id={`image${i+1}`}
                hidden
                disabled={loading} // disable while loading
              />
            </label>
          ))}
        </div>
      </div>

      <div className='w-full'>
        <p className='mb-2'>Product name</p>
        <input
          onChange={(e) => setName(e.target.value)}
          value={name}
          className='w-full max-w-[500px] px-3 py-2 border rounded'
          type="text"
          placeholder='Type here'
          required
          disabled={loading}
        />
      </div>

      <div className='w-full'>
        <p className='mb-2'>Product description</p>
        <textarea
          onChange={(e) => setDescription(e.target.value)}
          value={description}
          className='w-full max-w-[500px] px-3 py-2 border rounded'
          placeholder='Type here'
          required
          disabled={loading}
        />
      </div>

      <div className='flex flex-col sm:flex-row gap-2 w-full sm:gap-8'>
        <div>
          <p className='mb-2'>Product category</p>
          <select onChange={(e) => setCategory(e.target.value)} className='w-full px-3 py-2' disabled={loading}>
            <option value="Men">Men</option>
            <option value="Women">Women</option>
            <option value="Women">Children</option>
          </select>
        </div>
        <div>
          <p className='mb-2'>Sub category</p>
          <select onChange={(e) => setSubCategory(e.target.value)} className='w-full px-3 py-2' disabled={loading}>
            <option value="Topwear">Topwear</option>
            <option value="Bodycon">Bodycon</option>
            <option value="T-Shirts">T-Shirts</option>
            <option value="Children-dresses">Children-dresses</option>
            <option value="Women-Jeans">Women-jeans</option>
            <option value="Men-Jeans">Men-Jeans</option>
          </select>
        </div>
        <div>
          <p className='mb-2'>Product Price</p>
          <input
            onChange={(e) => setPrice(e.target.value)}
            value={price}
            className='w-full px-3 py-2 sm:w-[120px] border rounded'
            type="number"
            placeholder='25'
            disabled={loading}
          />
        </div>
      </div>

      <div>
        <p className='mb-2'>Product size</p>
        <div className='flex gap-3'>
          {["S", "M", "L", "XL", "XXL"].map((size) => (
            <div key={size} onClick={() => !loading && setSizes(prev => prev.includes(size) ? prev.filter(item => item !== size) : [...prev, size])}>
              <p className={`${sizes.includes(size) ? "bg-pink-100" : "bg-slate-200"} px-3 py-1 cursor-pointer rounded`}>
                {size}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className='flex gap-2 mt-2'>
        <input type="checkbox" id='bestseller' onChange={() => setBestseller(prev => !prev)} disabled={loading} />
        <label htmlFor="bestseller" className='cursor-pointer'>Add to bestseller</label>
      </div>

      <button
        type="submit"
        className='w-32 py-3 mt-4 bg-black text-white flex justify-center items-center gap-2'
        disabled={loading}
      >
        {loading && <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
        {loading ? "Adding..." : "ADD"}
      </button>
    </form>
  )
}

export default Add
