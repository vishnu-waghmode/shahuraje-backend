import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ShoppingBag, TrendingUp, Package } from 'lucide-react';

// ग्राफसाठी डमी डेटा
const salesData = [
  { name: 'Aug 11', sales: 12000 },
  { name: 'Aug 12', sales: 15000 },
  { name: 'Aug 13', sales: 11000 },
  { name: 'Aug 14', sales: 18000 },
  { name: 'Aug 15', sales: 22000 },
  { name: 'Aug 16', sales: 17000 },
  { name: 'Aug 17', sales: 25000 },
];

// टेबलसाठी डमी ऑर्डर्स
const recentOrders = [
  { id: '#ORD12546', customer: 'राजेंद्र पाटील', total: '₹ 870', status: 'Processing' },
  { id: '#ORD12521', customer: 'संतोष कदम', total: '₹ 1,250', status: 'Delivered' },
  { id: '#ORD12488', customer: 'अमित शिंदे', total: '₹ 450', status: 'Delivered' },
  { id: '#ORD12450', customer: 'विलास पवार', total: '₹ 1,120', status: 'Pending' },
];

const Dashboard = () => {
  return (
    <div className="space-y-6">
      {/* हेडर */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">शाहूराजे कृषी केंद्र</h1>
        <div className="flex items-center gap-3">
          <span className="text-gray-600 font-medium">Admin 👋</span>
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-[#154f30] font-bold">
            A
          </div>
        </div>
      </div>

      {/* वरचे ३ कार्ड्स (Stat Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-1">Total Orders</p>
            <h3 className="text-3xl font-bold text-gray-800">248</h3>
            <p className="text-sm text-green-500 mt-2">+12% Since last month</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-full text-blue-500"><ShoppingBag size={28} /></div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-1">Total Sales</p>
            <h3 className="text-3xl font-bold text-gray-800">₹ 1,45,230</h3>
            <p className="text-sm text-green-500 mt-2">+18% Since last month</p>
          </div>
          <div className="bg-green-50 p-4 rounded-full text-[#154f30]"><TrendingUp size={28} /></div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-1">Active Products</p>
            <h3 className="text-3xl font-bold text-gray-800">186</h3>
            <p className="text-sm text-gray-400 mt-2">In Inventory</p>
          </div>
          <div className="bg-orange-50 p-4 rounded-full text-orange-500"><Package size={28} /></div>
        </div>
      </div>

      {/* खालचा भाग: ग्राफ आणि टेबल */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Overview Graph */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Sales Overview</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#888'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#888'}} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Line type="monotone" dataKey="sales" stroke="#154f30" strokeWidth={3} dot={{r: 4, fill: '#154f30'}} activeDot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Orders Table */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-800">Recent Orders</h3>
            <button className="text-[#154f30] text-sm font-medium hover:underline">View All</button>
          </div>
          <div className="space-y-4">
            {recentOrders.map((order, index) => (
              <div key={index} className="flex justify-between items-center pb-3 border-b border-gray-50 last:border-0 last:pb-0">
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{order.id}</p>
                  <p className="text-xs text-gray-500">{order.customer}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm text-gray-800">{order.total}</p>
                  <span className={`text-[10px] px-2 py-1 rounded-full font-medium ${
                    order.status === 'Delivered' ? 'bg-green-100 text-green-700' : 
                    order.status === 'Processing' ? 'bg-blue-100 text-blue-700' : 
                    'bg-orange-100 text-orange-700'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;