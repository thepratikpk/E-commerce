import React from 'react'
import { assets } from '../assets/assets.jsx'

const Navbar = () => {
  return (
    <div className='flex items-center justify-between py-5 font-medium'>
      <img src={assets.Screenshot20} alt="logo" className="w-36"/>
      <p>Navbar loaded</p>
    </div>
  )
}

export default Navbar;
