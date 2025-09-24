import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { backendUrl, currency } from '../App'
import { toast } from 'react-toastify'

const Orders = ({ token }) => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [updating, setUpdating] = useState([])
  const [filter, setFilter] = useState('all')

  const statusOptions = [
    'pending',
    'processing', 
    'shipped',
    'delivered',
    'cancelled'
  ]

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const response = await axios.get(`${backendUrl}/api/v1/order/list`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      })
      if (response.data.success) {
        setOrders(response.data.data || [])
      } else {
        toast.error(response.data.message || 'Failed to fetch orders')
      }
    } catch (error) {
      console.error('Fetch orders error:', error)
      toast.error(error.response?.data?.message || 'Failed to fetch orders')
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId, newStatus) => {
    setUpdating(prev => [...prev, orderId])
    
    try {
      const response = await axios.put(
        `${backendUrl}/api/v1/order/status/${orderId}`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      )

      if (response.data.success) {
        toast.success('Order status updated successfully')
        setOrders(prev => prev.map(order => 
          order._id === orderId 
            ? { ...order, status: newStatus }
            : order
        ))
      } else {
        toast.error(response.data.message || 'Failed to update order status')
      }
    } catch (error) {
      console.error('Update status error:', error)
      toast.error(error.response?.data?.message || 'Failed to update order status')
    } finally {
      setUpdating(prev => prev.filter(id => id !== orderId))
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const filteredOrders = orders.filter(order => 
    filter === 'all' || order.status.toLowerCase() === filter
  )

  useEffect(() => {
    fetchOrders()
  }, [])

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Loading orders...</p>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">All Orders</h1>
            <p className="text-gray-600 text-sm mt-1">Manage customer orders</p>
          </div>
          <button
            onClick={fetchOrders}
            className="px-4 py-2 border border-gray-300 text-sm hover:bg-gray-50 transition-colors"
          >
            Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap gap-4 mb-4">
          <div className="border border-gray-300 p-3 min-w-[100px]">
            <p className="text-lg font-semibold text-gray-900">{orders.length}</p>
            <p className="text-xs text-gray-600">Total</p>
          </div>
          <div className="border border-gray-300 p-3 min-w-[100px]">
            <p className="text-lg font-semibold text-gray-900">
              {orders.filter(o => o.status === 'delivered').length}
            </p>
            <p className="text-xs text-gray-600">Delivered</p>
          </div>
          <div className="border border-gray-300 p-3 min-w-[100px]">
            <p className="text-lg font-semibold text-gray-900">
              {orders.filter(o => o.status === 'processing').length}
            </p>
            <p className="text-xs text-gray-600">Processing</p>
          </div>
          <div className="border border-gray-300 p-3 min-w-[100px]">
            <p className="text-lg font-semibold text-gray-900">
              {orders.filter(o => o.status === 'pending').length}
            </p>
            <p className="text-xs text-gray-600">Pending</p>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2">
          {['all', ...statusOptions].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 py-1 text-sm border transition-colors ${
                filter === status
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-12 border border-gray-300">
          <p className="text-gray-500">
            {filter === 'all' ? 'No orders found' : `No ${filter} orders found`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div key={order._id} className="border border-gray-300">
              {/* Order Header */}
              <div className="bg-gray-100 px-4 py-3 border-b border-gray-300">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="font-semibold text-gray-900">
                        Order #{order._id.slice(-8)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <span className="px-2 py-1 text-xs border border-gray-400 text-gray-700">
                      {order.status.toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{currency}{order.amount}</p>
                      <p className="text-xs text-gray-600">
                        {order.payment ? 'PAID' : 'PENDING'} • {order.paymentMethod}
                      </p>
                    </div>
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                      disabled={updating.includes(order._id)}
                      className="px-2 py-1 border border-gray-300 text-sm focus:outline-none disabled:opacity-50"
                    >
                      {statusOptions.map(status => (
                        <option key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Order Content */}
              <div className="p-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
                  {/* Customer Info */}
                  <div>
                    <p className="font-medium text-gray-900 mb-2">Customer</p>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>{order.userId?.name || 'N/A'}</p>
                      <p>{order.userId?.email || 'N/A'}</p>
                      <p>{order.userId?.phoneNo || 'N/A'}</p>
                    </div>
                  </div>

                  {/* Delivery Address */}
                  <div>
                    <p className="font-medium text-gray-900 mb-2">Address</p>
                    <div className="text-sm text-gray-600">
                      <p>{order.address.street}</p>
                      <p>{order.address.city}, {order.address.state}</p>
                      <p>{order.address.pincode}</p>
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div>
                    <p className="font-medium text-gray-900 mb-2">Summary</p>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>Items: {order.items.length}</p>
                      <p>Quantity: {order.items.reduce((sum, item) => sum + item.quantity, 0)}</p>
                      <p>Total: {currency}{order.amount}</p>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div>
                  <p className="font-medium text-gray-900 mb-3">Items</p>
                  <div className="space-y-2">
                    {order.items.map((item, itemIndex) => (
                      <div key={itemIndex} className="flex items-center gap-3 p-2 border border-gray-200">
                        <div className="flex-shrink-0">
                          {item.productId?.images?.[0] ? (
                            <img
                              src={item.productId.images[0]}
                              alt={item.productName}
                              className="w-12 h-12 object-cover border border-gray-300"
                              onError={(e) => {
                                e.target.style.display = 'none'
                                e.target.nextSibling.style.display = 'flex'
                              }}
                            />
                          ) : null}
                          <div
                            className="w-12 h-12 bg-gray-100 flex items-center justify-center text-gray-400 text-xs border border-gray-300"
                            style={{ display: item.productId?.images?.[0] ? 'none' : 'flex' }}
                          >
                            No Image
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 text-sm truncate">{item.productName}</p>
                          <div className="flex items-center gap-3 text-xs text-gray-600 mt-1">
                            <span>{currency}{item.price}</span>
                            <span>Qty: {item.quantity}</span>
                            {item.size && <span className="px-1 py-0.5 border border-gray-300">Size: {item.size}</span>}
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="font-medium text-gray-900 text-sm">
                            {currency}{item.price * item.quantity}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Orders