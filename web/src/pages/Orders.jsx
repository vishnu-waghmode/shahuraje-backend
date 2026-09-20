import React, { useState } from 'react';
import { Search, Eye } from 'lucide-react';

// डमी डेटा (Figma डिझाईनप्रमाणे)
const ordersData = [
  { id: '#ORD12546', customer: 'राजेंद्र पाटील', date: '12 Aug 2026', amount: '₹ 870', status: 'Processing' },
  { id: '#ORD12521', customer: 'संतोष कदम', date: '11 Aug 2026', amount: '₹ 1,250', status: 'Delivered' },
  { id: '#ORD12488', customer: 'अमित शिंदे', date: '10 Aug 2026', amount: '₹ 450', status: 'Delivered' },
  { id: '#ORD12450', customer: 'विलास पवार', date: '09 Aug 2026', amount: '₹ 1,120', status: 'Pending' },
  { id: '#ORD12421', customer: 'गणेश साळुंखे', date: '08 Aug 2026', amount: '₹ 950', status: 'Delivered' },
];

const Orders = () => {
  const [activeTab, setActiveTab] = useState('All Orders');
  const tabs = ['All Orders', 'Pending', 'Processing', 'Delivered'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Orders Management</h1>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        
        {/* Top Controls: Tabs & Search Bar */}
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
              placeholder="Search by Order ID / Name" 
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#154f30] text-sm"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
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
              {ordersData.map((order, index) => (
                <tr key={index} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="p-4 font-medium text-gray-800">{order.id}</td>
                  <td className="p-4 text-gray-600">{order.customer}</td>
                  <td className="p-4 text-gray-500">{order.date}</td>
                  <td className="p-4 font-medium text-gray-800">{order.amount}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      order.status === 'Delivered' ? 'bg-green-100 text-green-700' : 
                      order.status === 'Processing' ? 'bg-blue-100 text-blue-700' : 
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <button className="text-gray-400 hover:text-[#154f30] transition-colors" title="View Order">
                      <Eye size={20} className="mx-auto" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="p-4 border-t border-gray-100 flex justify-between items-center text-sm text-gray-500">
          <span>Showing 1 to 5 of 248 entries</span>
          <div className="flex space-x-1">
            <button className="px-3 py-1 border border-gray-200 rounded hover:bg-gray-50">Prev</button>
            <button className="px-3 py-1 bg-[#154f30] text-white rounded shadow-sm">1</button>
            <button className="px-3 py-1 border border-gray-200 rounded hover:bg-gray-50">2</button>
            <button className="px-3 py-1 border border-gray-200 rounded hover:bg-gray-50">Next</button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Orders;