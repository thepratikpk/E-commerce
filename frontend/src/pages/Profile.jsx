import React, { useContext, useState } from 'react'
import { ShopContext } from '../context/ShopContex'
import Title from '../components/Title'
import { authAPI } from '../utils/api'
import toast from '../utils/toast'

const Profile = () => {
  const { user, logout, authLoading, checkAuthStatus } = useContext(ShopContext);
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phoneNo: user?.phoneNo || '',
    address: user?.address || []
  });

  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  if (authLoading) {
    return (
      <div className='border-t pt-14'>
        <div className='text-center'>
          <div className='text-2xl mb-3'>
            <Title text1={'LOADING'} text2={'PROFILE'} />
          </div>
          <p className='text-gray-600'>Please wait...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className='border-t pt-14'>
        <div className='text-center'>
          <div className='text-2xl mb-3'>
            <Title text1={'ACCESS'} text2={'DENIED'} />
          </div>
          <p className='text-gray-600'>Please log in to view your profile.</p>
        </div>
      </div>
    );
  }

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await authAPI.updateAccount(formData);
      toast.success(response.message || 'Profile updated successfully!');
      setIsEditing(false);
      checkAuthStatus(); // Refresh user data
    } catch (error) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    
    try {
      const response = await authAPI.changePassword({
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword
      });
      toast.success(response.message || 'Password changed successfully!');
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setActiveTab('profile');
    } catch (error) {
      toast.error(error.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='border-t pt-14'>
      <div className='text-2xl mb-3'>
        <Title text1={'MY'} text2={'PROFILE'} />
      </div>

      {/* Tab Navigation */}
      <div className='flex border-b mb-8'>
        <button 
          onClick={() => setActiveTab('profile')}
          className={`px-6 py-3 font-medium ${activeTab === 'profile' ? 'border-b-2 border-black text-black' : 'text-gray-500'}`}
        >
          Profile Information
        </button>
        <button 
          onClick={() => setActiveTab('security')}
          className={`px-6 py-3 font-medium ${activeTab === 'security' ? 'border-b-2 border-black text-black' : 'text-gray-500'}`}
        >
          Security
        </button>
        <button 
          onClick={() => setActiveTab('orders')}
          className={`px-6 py-3 font-medium ${activeTab === 'orders' ? 'border-b-2 border-black text-black' : 'text-gray-500'}`}
        >
          My Orders
        </button>
      </div>

      {/* Profile Information Tab */}
      {activeTab === 'profile' && (
        <div className='max-w-2xl'>
          <div className='flex justify-between items-center mb-6'>
            <h3 className='text-lg font-medium text-gray-700'>Personal Information</h3>
            <button 
              onClick={() => setIsEditing(!isEditing)}
              className='border border-black px-4 py-2 text-sm hover:bg-black hover:text-white transition-all duration-300'
            >
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>

          {isEditing ? (
            <form onSubmit={handleUpdateProfile} className='space-y-6'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className='w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-black'
                    required
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className='w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-black'
                    required
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>Phone Number</label>
                  <input
                    type="tel"
                    name="phoneNo"
                    value={formData.phoneNo}
                    onChange={handleInputChange}
                    className='w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-black'
                  />
                </div>
              </div>
              
              <div className='flex gap-4'>
                <button 
                  type="submit"
                  disabled={loading}
                  className='bg-black text-white px-6 py-2 hover:bg-gray-800 transition-colors disabled:opacity-50'
                >
                  {loading ? 'Updating...' : 'Update Profile'}
                </button>
                <button 
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className='border border-gray-300 px-6 py-2 hover:bg-gray-50 transition-colors'
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className='space-y-6'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div>
                  <label className='block text-sm font-medium text-gray-500'>Full Name</label>
                  <p className='mt-1 text-gray-900'>{user.name || 'Not provided'}</p>
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-500'>Email Address</label>
                  <p className='mt-1 text-gray-900'>{user.email}</p>
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-500'>Phone Number</label>
                  <p className='mt-1 text-gray-900'>{user.phoneNo || 'Not provided'}</p>
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-500'>Account Type</label>
                  <p className='mt-1 text-gray-900'>{user.isGoogleUser ? 'Google Account' : 'Regular Account'}</p>
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-500'>Member Since</label>
                  <p className='mt-1 text-gray-900'>
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-500'>Account Status</label>
                  <span className='mt-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800'>
                    Active
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className='max-w-md'>
          <h3 className='text-lg font-medium text-gray-700 mb-6'>Change Password</h3>
          
          {user.isGoogleUser ? (
            <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
              <p className='text-blue-800'>
                Your account is linked with Google. Password changes are not available for Google-linked accounts.
              </p>
            </div>
          ) : (
            <form onSubmit={handleChangePassword} className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>Current Password</label>
                <input
                  type="password"
                  name="oldPassword"
                  value={passwordData.oldPassword}
                  onChange={handlePasswordChange}
                  className='w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-black'
                  required
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className='w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-black'
                  required
                  minLength={6}
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>Confirm New Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className='w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-black'
                  required
                  minLength={6}
                />
              </div>
              <button 
                type="submit"
                disabled={loading}
                className='w-full bg-black text-white py-2 hover:bg-gray-800 transition-colors disabled:opacity-50'
              >
                {loading ? 'Changing Password...' : 'Change Password'}
              </button>
            </form>
          )}
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div>
          <h3 className='text-lg font-medium text-gray-700 mb-6'>Order History</h3>
          <div className='bg-gray-50 border border-gray-200 rounded-lg p-8 text-center'>
            <p className='text-gray-600 mb-4'>No orders found</p>
            <button 
              onClick={() => window.location.href = '/collection'}
              className='border border-black px-6 py-2 text-sm hover:bg-black hover:text-white transition-all duration-300'
            >
              Start Shopping
            </button>
          </div>
        </div>
      )}

      {/* Logout Section */}
      <div className='mt-12 pt-8 border-t'>
        <div className='flex justify-between items-center'>
          <div>
            <h3 className='text-lg font-medium text-gray-700'>Account Actions</h3>
            <p className='text-sm text-gray-500 mt-1'>Manage your account settings</p>
          </div>
          <button 
            onClick={logout}
            className='bg-red-600 text-white px-6 py-2 hover:bg-red-700 transition-colors'
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}

export default Profile