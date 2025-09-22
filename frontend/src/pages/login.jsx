import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ShopContext } from '../context/ShopContex';
import toast from '../utils/toast';

const Login = () => {
  const navigate = useNavigate(); // ✅ Hook for navigation
  const { login, isAuthenticated } = useContext(ShopContext);

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);
  const [currentState, setCurrentState] = useState('Sign Up'); 
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phoneNo: '',
    street: '',
    city: '',
    state: '',
    country: '',
    pincode: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      if (currentState === 'Sign Up') {
        const payload = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phoneNo: formData.phoneNo,
          address: [
            {
              street: formData.street,
              city: formData.city,
              state: formData.state,
              country: formData.country,
              pincode: formData.pincode,
              isDefault: true
            }
          ]
        };

        const res = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/v1/user/register`,
          payload,
          { withCredentials: true }
        );
        console.log('Sign Up Success:', res.data);
        toast.success(res.data.message || 'User registered successfully!');
      } else {
        const payload = {
          email: formData.email,
          password: formData.password
        };

        await login(payload);
        // Login success is handled in the context
      }

      // ✅ Redirect to home page or dashboard after successful login/signup
      navigate('/'); 
    } catch (err) {
      console.error(err);
      // Handle different error types
      if (err.response?.data?.message) {
        // Axios error with backend message
        toast.error(err.response.data.message);
      } else if (err.message && !err.message.includes('Server returned')) {
        // API utility error with backend message
        toast.error(err.message);
      } else if (err.data?.message) {
        // API utility error with data
        toast.error(err.data.message);
      } else {
        toast.error('Something went wrong');
      }
    }
  };

  return (
    <form
      onSubmit={onSubmitHandler}
      className="flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800"
    >
      <div className="inline-flex items-center gap-2 mb-2 mt-10">
        <p className="prata-regular text-3xl">{currentState}</p>
        <hr className="border-none h-[1.5px] w-8 bg-gray-800" />
      </div>

      {currentState === 'Sign Up' && (
        <>
          <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Name" className="w-full px-3 py-2 border border-gray-800" required />
          <input type="text" name="street" value={formData.street} onChange={handleChange} placeholder="Street" className="w-full px-3 py-2 border border-gray-800" />
          <input type="text" name="city" value={formData.city} onChange={handleChange} placeholder="City" className="w-full px-3 py-2 border border-gray-800" />
          <input type="text" name="state" value={formData.state} onChange={handleChange} placeholder="State" className="w-full px-3 py-2 border border-gray-800" />
          <input type="text" name="country" value={formData.country} onChange={handleChange} placeholder="Country" className="w-full px-3 py-2 border border-gray-800" />
          <input type="text" name="pincode" value={formData.pincode} onChange={handleChange} placeholder="Pincode" className="w-full px-3 py-2 border border-gray-800" />
          <input type="text" name="phoneNo" value={formData.phoneNo} onChange={handleChange} placeholder="Phone Number" className="w-full px-3 py-2 border border-gray-800" />
        </>
      )}

      <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="E-mail" className="w-full px-3 py-2 border border-gray-800" required />
      <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Password" className="w-full px-3 py-2 border border-gray-800" required />

      <div className="w-full flex justify-between text-sm mt-[-8px]">
        <p className="cursor-pointer">Forgot your password</p>
        {currentState === 'Login' ? (
          <p onClick={() => setCurrentState('Sign Up')} className="cursor-pointer">Create account</p>
        ) : (
          <p onClick={() => setCurrentState('Login')} className="cursor-pointer">Login Here</p>
        )}
      </div>

      <button className="bg-black text-white font-light px-8 py-2 mt-4">
        {currentState === 'Login' ? 'Sign In' : 'Sign Up'}
      </button>
    </form>
  );
};

export default Login;
