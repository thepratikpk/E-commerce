import React from 'react'
import { assets } from '../assets/assets'

const Navbar = () => {
  return (
    <div className='flex items-center justify-between py-5 font-medium'>
      <img src={assets.hii} alt="logo" className="w-36"/>
      <p>Navbar loaded</p>
    </div>
  )
}

export default Navbar;
