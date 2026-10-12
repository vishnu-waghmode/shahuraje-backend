import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ShoppingBag, TrendingUp, Package, Loader2, Calendar, User, LogOut, ChevronDown } from 'lucide-react';

const API_BASE_URL = 'https://shahuraje-backend-1.onrender.com';

// 1. Shop Admin Profile Component
const AdminProfileMenu = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  // LocalStorage मधून डेटा तपासणे
  const savedUser = JSON.parse(localStorage.getItem('adminUser') || localStorage.getItem('user') || '{}');
  
  // दुकानासाठी योग्य नाव आणि रोल सेट करणे
  // जर रोल 'admin' असेल किंवा नाव 'Admin' असेल तर तेच घ्या, अन्यथा 'शाहूराजे ॲडमिन' दाखवा
  const isAdminRole = savedUser.role === 'admin' || savedUser.isAdmin === true;
  const adminName = isAdminRole && savedUser.name ? savedUser.name : 'शाहूराजे ॲडमिन';
  const adminEmail = savedUser.email || 'admin@shahuraje.com';
  const adminRole = 'दुकान व्यवस्थापक (Store Admin)';
  const avatarLetter = 'A'; // दुकानासाठी नेहमी दिमाखात 'A' (Admin) च दिसेल

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('adminUser');
    localStorage.removeItem('user');
    localStorage.removeItem('login_time');
    navigate('/');
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 transition-colors cursor-pointer outline-none"
      >
        <span className="text-gray-700 font-medium text-sm hidden sm:inline">{adminName}</span>
        <div className="w-10 h-10 bg-green-100 border border-green-200 rounded-full flex items-center justify-center text-[#154f30] font-bold text-base shadow-sm">
          {avatarLetter}
        </div>
        <ChevronDown size={14} className="text-gray-500 hidden sm:block" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-60 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2">
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-800">{adminName}</p>
            <p className="text-xs text-gray-500 truncate">{adminEmail}</p>
            <span className="inline-block mt-1 text-[11px] bg-green-50 text-[#154f30] px-2 py-0.5 rounded font-medium border border-green-100">
              {adminRole}
            </span>
          </div>

          <div className="py-1">
            <button
              onClick={() => {
                setIsOpen(false);
                navigate('/settings');
              }}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors cursor-pointer"
            >
              <User size={16} className="text-gray-500" />
              <span>दुकान सेटिंग्ज (Settings)</span>
            </button>

            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors cursor-pointer"
            >
              <LogOut size={16} />
              <span>लॉगआउट (Logout)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// 2. Main Dashboard Component
const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('all'); // 'today', 'week', 'month', 'all'
  const [rawOrders, setRawOrders] = useState([]);
  const [productsCount, setProductsCount] = useState(0);

  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSales: 0,
    activeProducts: 0,
  });
  const [salesGraphData, setSalesGraphData] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (rawOrders.length >= 0) {
      calculateFilteredStats(rawOrders, timeFilter, productsCount);
    }
  }, [timeFilter, rawOrders, productsCount]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const [ordersRes, productsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/orders`),
        fetch(`${API_BASE_URL}/api/products`)
      ]);

      const ordersData = await ordersRes.json();
      const productsData = await productsRes.json();

      const ordersList = Array.isArray(ordersData) ? ordersData : ordersData.orders || [];
      const productsList = Array.isArray(productsData) ? productsData : productsData.products || [];

      setRawOrders(ordersList);
      setProductsCount(productsList.length);

      // Latest 4 orders
      const sortedOrders = [...ordersList].reverse().slice(0, 4);
      setRecentOrders(sortedOrders);

    } catch (err) {
      console.error('Dashboard data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateFilteredStats = (orders, filter, activeProdCount) => {
    const now = new Date();

    const filtered = orders.filter((order) => {
      if (!order.createdAt) return filter === 'all';
      const orderDate = new Date(order.createdAt);

      if (filter === 'today') {
        return (
          orderDate.getDate() === now.getDate() &&
          orderDate.getMonth() === now.getMonth() &&
          orderDate.getFullYear() === now.getFullYear()
        );
      } else if (filter === 'week') {
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);
        return orderDate >= weekAgo;
      } else if (filter === 'month') {
        return (
          orderDate.getMonth() === now.getMonth() &&
          orderDate.getFullYear() === now.getFullYear()
        );
      }
      return true;
    });

    let salesSum = 0;
    const dateWiseSales = {};

    filtered.forEach((order) => {
      const amount = Number(order.totalAmount || order.total || order.amount || 0);
      if (order.status !== 'Cancelled') {
        salesSum += amount;

        const dateStr = order.createdAt
          ? new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          : 'General';

        dateWiseSales[dateStr] = (dateWiseSales[dateStr] || 0) + amount;
      }
    });

    let graphPoints = Object.keys(dateWiseSales).map((date) => ({
      name: date,
      sales: dateWiseSales[date]
    }));

    if (graphPoints.length === 1) {
      graphPoints = [
        { name: 'Start', sales: Math.round(graphPoints[0].sales * 0.4) },
        graphPoints[0],
        { name: 'Current', sales: graphPoints[0].sales }
      ];
    } else if (graphPoints.length === 0) {
      graphPoints = [
        { name: 'Start', sales: 0 },
        { name: 'End', sales: 0 }
      ];
    }

    setStats({
      totalOrders: filtered.length,
      totalSales: salesSum,
      activeProducts: activeProdCount
    });
    setSalesGraphData(graphPoints);
  };

  const getCustomerName = (order) => {
    return (
      order.customerName ||
      order.customer?.name ||
      order.user?.name ||
      order.userName ||
      order.shippingAddress?.fullName ||
      order.shippingAddress?.name ||
      order.name ||
      'ग्राहक'
    );
  };

  const getFilterLabel = () => {
    switch (timeFilter) {
      case 'today': return 'आजचा';
      case 'week': return 'या आठवड्याचा';
      case 'month': return 'या महिन्याचा';
      default: return 'एकूण (All Time)';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header aani Profile Menu */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">शाहूराजे कृषी केंद्र</h1>
          <p className="text-xs text-gray-500 mt-0.5">डॅशबोर्ड सारांश ({getFilterLabel()})</p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          {/* Dropdown Filter */}
          <div className="relative flex items-center bg-white border border-gray-200 rounded-lg px-3 py-1.5 shadow-sm">
            <Calendar size={16} className="text-[#154f30] mr-2" />
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="bg-transparent text-sm font-medium text-gray-700 outline-none cursor-pointer"
            >
              <option value="today">आज (Today)</option>
              <option value="week">हा आठवडा (This Week)</option>
              <option value="month">हा महिना (This Month)</option>
              <option value="all">सर्व (All Time)</option>
            </select>
          </div>

          {/* Dynamic Admin Profile Dropdown */}
          <AdminProfileMenu />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20 text-gray-500 gap-2">
          <Loader2 className="animate-spin text-[#154f30]" size={28} />
          <span className="text-base font-medium">डॅशबोर्ड डेटा लोड होत आहे...</span>
        </div>
      ) : (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Orders</p>
                <h3 className="text-3xl font-bold text-gray-800">{stats.totalOrders}</h3>
                <p className="text-xs text-gray-400 mt-2">{getFilterLabel()} ऑर्डर्स</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-full text-blue-500">
                <ShoppingBag size={28} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Sales (गल्ला)</p>
                <h3 className="text-3xl font-bold text-gray-800">₹ {stats.totalSales.toLocaleString('en-IN')}</h3>
                <p className="text-xs text-green-600 mt-2">{getFilterLabel()} महसूल</p>
              </div>
              <div className="bg-green-50 p-4 rounded-full text-[#154f30]">
                <TrendingUp size={28} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Active Products</p>
                <h3 className="text-3xl font-bold text-gray-800">{stats.activeProducts}</h3>
                <p className="text-xs text-gray-400 mt-2">दुकान इन्व्हेंटरी</p>
              </div>
              <div className="bg-orange-50 p-4 rounded-full text-orange-500">
                <Package size={28} />
              </div>
            </div>
          </div>

          {/* Graph aani Recent Orders */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Zigzag Line Chart */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-800">Sales Overview</h3>
                <span className="text-xs font-medium text-gray-500">{getFilterLabel()}</span>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={salesGraphData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#888' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#888' }} />
                    <Tooltip
                      formatter={(val) => [`₹ ${val}`, 'विक्री']}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="sales"
                      stroke="#154f30"
                      strokeWidth={3}
                      dot={{ r: 4, fill: '#154f30' }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recent Orders List */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-800">Recent Orders</h3>
                <button
                  onClick={() => navigate('/orders')}
                  className="text-[#154f30] text-sm font-medium hover:underline cursor-pointer"
                >
                  View All
                </button>
              </div>
              <div className="space-y-4">
                {recentOrders.length > 0 ? (
                  recentOrders.map((order) => (
                    <div
                      key={order._id}
                      className="flex justify-between items-center pb-3 border-b border-gray-50 last:border-0 last:pb-0"
                    >
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">
                          #{order._id?.slice(-6).toUpperCase()}
                        </p>
                        <p className="text-xs font-medium text-gray-600 mt-0.5">
                          {getCustomerName(order)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sm text-gray-800">
                          ₹ {Number(order.totalAmount || order.total || order.amount || 0).toLocaleString('en-IN')}
                        </p>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-medium inline-block mt-1 ${
                            order.status === 'Delivered'
                              ? 'bg-green-100 text-green-700'
                              : order.status === 'Processing'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-orange-100 text-orange-700'
                          }`}
                        >
                          {order.status || 'Pending'}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-400 text-center py-6">कोणत्याही ऑर्डर्स नाहीत</p>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;