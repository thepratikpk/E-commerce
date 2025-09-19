import React from 'react'
import Title from '../components/Title';
import { assets } from '../assets/assets';
import NewsletterBox from '../components/NewsletterBox';

const about = () => {
  return (
    <div>
      <div className='text-2xl text-center pt-8 border-t'>
        <Title text1={'ABOUT'} text2={'US'}/>
      </div>
      <div className='my-10 flex flex-col md:flex-row gap-16'>
        <img className='w-full md:max-w-[450px]'src={assets.aboutimg} alt="" />
        <div className='flex flex-col justify-center gap-6 md:w-2/4 text-gray-600'>
        <p>Welcome to forever, your trusted online destination for quality products and unbeatable service. We’re more than just an e-commerce store — we’re a team of passionate individuals committed to delivering the best online shopping experience.</p>
        <p>Whether you're shopping from home, work, or on the go, [Your Store Name] brings the products you love right to your fingertips.</p>
        <b className='text-gray-800'>Our Mission</b>
        <p>At forever, our mission is simple:To make online shopping easy, enjoyable, and accessible for everyone — everywhere.We strive to provide high-quality products, unbeatable value, and exceptional customer service, all from the comfort of your home. By combining innovation, convenience, and care, we aim to create a shopping experience that’s not just about buying — but about building trust and satisfaction with every click.</p>
        </div>
      </div>
      <div className='text-xl py-4'>
        <Title text1={'WHY'} text2={'CHOOSE US'} />
      </div>
      <div className='flex flex-col md:flex-row text-sm mb-20'>
        <div className='border px-10 md:px-16 py-8 sm:py-20 flex-col gap-5'>
          <b>Quality Assurence:</b>
          <p className='text-gray-600'>At forever, quality isn't just a promise — it's a commitment.We understand that when you shop online, you're placing your trust in us. That's why we go the extra mile to ensure that every product we offer meets the highest standards of performance, durability, and satisfaction.</p>
        </div>
        <div className='border px-10 md:px-16 py-8 sm:py-20 flex-col gap-5'>
          <b>Convience</b>
          <p className='text-gray-600'>At forever, we believe that shopping should be simple, fast, and hassle-free. That’s why we’ve designed every part of our experience with your convenience in mind — so you can spend less time shopping and more time enjoying what you love.</p>
        </div>
        <div className='border px-10 md:px-16 py-8 sm:py-20 flex-col gap-5'>
          <b>Exceptional Customer Service</b>
          <p className='text-gray-600'>At forever, we don’t just sell products — we build relationships. Exceptional customer service is at the core of everything we do because your satisfaction is our top priority.We’re here to ensure that your shopping experience is smooth, enjoyable, and worry-free — from the moment you land on our site to long after your order arrives.</p>
        </div>
      </div>
      <NewsletterBox/>
    </div>
  )
}

export default about
