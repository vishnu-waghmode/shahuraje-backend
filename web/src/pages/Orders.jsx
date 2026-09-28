import React, { useState, useEffect } from 'react';
import { Search, Eye, Loader2, X, CheckCircle, Clock, XCircle, Package } from 'lucide-react';

const Orders = () => {
  const [activeTab, setActiveTab] = useState('All Orders');
  const tabs = ['All Orders', 'Pending', 'Processing', 'Delivered'];

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // 👉 पॉप-अप साठी नवीन States
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('https://shahuraje-backend.onrender.com/api/orders/');
      const data = await response.json();
      if (response.ok) {
        setOrders(data);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-GB', options);
  };

  // 👉 स्टेटस अपडेट करण्याचे फंक्शन
  const handleStatusUpdate = async (orderId, newStatus) => {
    setIsUpdating(true);
    try {
      const response = await fetch(`https://shahuraje-backend.onrender.com/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        // टेबलमधील डेटा लगेच अपडेट करणे
        setOrders(orders.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
        // पॉप-अप मधील डेटा अपडेट करणे
        setSelectedOrder(prev => ({ ...prev, status: newStatus }));
        alert("ऑर्डरचे स्टेटस यशस्वीरित्या अपडेट झाले!");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("स्टेटस अपडेट करताना एरर आला.");
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    if (activeTab !== 'All Orders' && order.status !== activeTab) return false;
    const searchLower = searchTerm.toLowerCase();
    const customerName = order.userId?.name?.toLowerCase() || '';
    const orderId = order._id?.toLowerCase() || '';
    return customerName.includes(searchLower) || orderId.includes(searchLower);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Orders Management</h1>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        
        {/* Top Controls */}
        <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex space-x-2">
            {tabs.map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === tab 
                    ? 'bg-[#154f30] text-white shadow-sm' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-72">
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Order ID / Name" 
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#154f30] text-sm"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-gray-600 text-sm">
                <th className="p-4 font-semibold whitespace-nowrap">Order ID</th>
                <th className="p-4 font-semibold whitespace-nowrap">Customer Name</th>
                <th className="p-4 font-semibold whitespace-nowrap">Date</th>
                <th className="p-4 font-semibold whitespace-nowrap">Total Amount</th>
                <th className="p-4 font-semibold whitespace-nowrap">Status</th>
                <th className="p-4 font-semibold text-center whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-10 text-center">
                    <Loader2 className="mx-auto animate-spin text-[#154f30]" size={32} />
                    <p className="mt-2 text-gray-500">डेटा लोड होत आहे...</p>
                  </td>
                </tr>
              ) : filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr key={order._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 font-medium text-gray-800">
                      #{order._id.substring(order._id.length - 6).toUpperCase()}
                    </td>
                    <td className="p-4 text-gray-600 font-medium">
                      {order.userId?.name || 'अज्ञात'}
                    </td>
                    <td className="p-4 text-gray-500">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="p-4 font-bold text-[#154f30]">
                      ₹ {order.totalAmount}
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        order.status === 'Delivered' ? 'bg-green-100 text-green-700' : 
                        order.status === 'Processing' ? 'bg-blue-100 text-blue-700' : 
                        order.status === 'Cancelled' ? 'bg-red-100 text-red-700' : 
                        'bg-orange-100 text-orange-700'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      {/* 👉 इथे क्लिक केल्यावर पॉप-अप उघडेल */}
                      <button 
                        onClick={() => setSelectedOrder(order)}
                        className="text-gray-400 hover:text-[#154f30] transition-colors bg-gray-50 p-2 rounded-lg" 
                        title="View Order"
                      >
                        <Eye size={18} className="mx-auto" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="p-10 text-center text-gray-500">
                    कोणतीही ऑर्डर सापडली नाही.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 👉 पॉप-अप (Modal) डिझाईन */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  ऑर्डर #{selectedOrder._id.substring(selectedOrder._id.length - 6).toUpperCase()}
                </h2>
                <p className="text-xs text-gray-500 mt-1">{formatDate(selectedOrder.createdAt)}</p>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="p-2 text-gray-400 hover:bg-gray-200 hover:text-gray-800 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1">
              
              {/* Customer Details */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-6 flex flex-col md:flex-row justify-between gap-4">
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">शेतकऱ्याचा तपशील</h3>
                  <p className="font-bold text-gray-800">{selectedOrder.userId?.name || 'अज्ञात'}</p>
                  <p className="text-sm text-gray-600">{selectedOrder.userId?.phone || 'फोन नंबर उपलब्ध नाही'}</p>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">पत्ता / डिलिव्हरी</h3>
                  <p className="text-sm font-medium text-gray-700 max-w-[200px]">{selectedOrder.deliveryAddress || 'दुकानातून पिकअप'}</p>
                </div>
              </div>

              {/* Order Items */}
              <h3 className="font-bold text-gray-800 mb-3 border-b pb-2">ऑर्डरमधील उत्पादने</h3>
              <div className="space-y-3 mb-6">
                {selectedOrder.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center bg-white border border-gray-100 p-3 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        {item.productId?.image ? (
                          <img src={item.productId.image} alt={item.productId.name} className="w-full h-full object-cover" />
                        ) : (
                          <Package className="w-6 h-6 m-3 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-gray-800">{item.productId?.name || 'उत्पादन'}</p>
                        <p className="text-xs text-gray-500 font-medium">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <div className="font-black text-[#154f30]">₹ {item.price * item.quantity}</div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center bg-[#154f30]/5 p-4 rounded-xl border border-[#154f30]/20">
                <span className="font-bold text-gray-700">एकूण रक्कम:</span>
                <span className="text-xl font-black text-[#154f30]">₹ {selectedOrder.totalAmount}</span>
              </div>
            </div>

            {/* Modal Footer (Status Update) */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-gray-600">सध्याचे स्टेटस:</span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  selectedOrder.status === 'Delivered' ? 'bg-green-100 text-green-700' : 
                  selectedOrder.status === 'Processing' ? 'bg-blue-100 text-blue-700' : 
                  selectedOrder.status === 'Cancelled' ? 'bg-red-100 text-red-700' : 
                  'bg-orange-100 text-orange-700'
                }`}>
                  {selectedOrder.status}
                </span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select 
                  value={selectedOrder.status}
                  onChange={(e) => handleStatusUpdate(selectedOrder._id, e.target.value)}
                  disabled={isUpdating}
                  className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold focus:outline-none focus:border-[#154f30] bg-white cursor-pointer disabled:opacity-50"
                >
                  <option value="Pending">Pending (प्रलंबित)</option>
                  <option value="Processing">Processing (तयार होत आहे)</option>
                  <option value="Delivered">Delivered (पोहोचले)</option>
                  <option value="Cancelled">Cancelled (रद्द)</option>
                </select>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;