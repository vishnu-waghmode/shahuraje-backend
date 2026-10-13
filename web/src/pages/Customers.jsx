import React, { useState, useEffect } from 'react';
import { Search, Phone, MapPin, ShoppingBag, IndianRupee, Loader2 } from 'lucide-react';

const API_BASE_URL = 'https://shahuraje-backend-1.onrender.com';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCustomersFromOrders();
  }, []);

  const fetchCustomersFromOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/orders`);
      const data = await res.json();
      const orders = Array.isArray(data) ? data : data.orders || [];

      const customerMap = {};

      orders.forEach((order) => {
        const u = order.userId || order.user || {};

        // 👉 नवीन ॲप चेकआउटमधील 'deliveryAddress' मधून डेटा काढणे
        let parsedName = '';
        let parsedPhone = '';
        let parsedVillage = '';

        if (order.deliveryAddress && typeof order.deliveryAddress === 'string') {
          const parts = order.deliveryAddress.split(',');
          // जर पत्ता "नाव, फोन, पत्ता, गाव - पिनकोड" या फॉरमॅटमध्ये असेल
          if (parts.length >= 3) {
            parsedName = parts[0].trim(); // पहिले नाव
            parsedPhone = parts[1].trim(); // दुसरा फोन नंबर
            parsedVillage = parts[parts.length - 1].trim(); // शेवटचे गाव आणि पिनकोड
          } else {
            parsedVillage = order.deliveryAddress; // फॉरमॅट वेगळा असल्यास पूर्ण पत्ता दाखवा
          }
        }

        // 1. शेतकऱ्याचे / ग्राहकाचे नाव
        const name =
          parsedName ||
          (typeof u === 'object' && (u.name || u.fullName || u.userName)) ||
          order.customerName ||
          order.shippingAddress?.fullName ||
          order.shippingAddress?.name ||
          order.name ||
          (typeof u === 'string' && u.length > 0 ? `शेतकरी (#${u.slice(-4)})` : 'शेतकरी');

        // 2. मोबाईल नंबर
        const phone =
          parsedPhone ||
          (typeof u === 'object' && (u.phone || u.phoneNumber || u.mobile)) ||
          order.phone ||
          order.phoneNumber ||
          order.shippingAddress?.phone ||
          order.shippingAddress?.phoneNumber ||
          order.shippingAddress?.mobile ||
          'उपलब्ध नाही';

        // 3. गाव / पत्ता
        const location =
          parsedVillage ||
          (typeof u === 'object' && (u.village || u.city || u.address)) ||
          order.shippingAddress?.village ||
          order.shippingAddress?.city ||
          order.shippingAddress?.district ||
          order.shippingAddress?.address ||
          order.city ||
          order.village ||
          'महाराष्ट्र';

        // Unique identifier: phone -> userId ID -> name
        const uniqueKey =
          phone !== 'उपलब्ध नाही'
            ? phone
            : (u._id || (typeof u === 'string' ? u : name));

        const orderAmount = Number(order.totalAmount || order.total || order.amount || 0);
        const orderDate = order.createdAt ? new Date(order.createdAt) : new Date();

        if (!customerMap[uniqueKey]) {
          customerMap[uniqueKey] = {
            id: order._id,
            name: name,
            phone: phone,
            location: location,
            totalOrders: 1,
            totalSpent: orderAmount,
            lastOrderDate: orderDate,
          };
        } else {
          customerMap[uniqueKey].totalOrders += 1;
          customerMap[uniqueKey].totalSpent += orderAmount;
          if (orderDate > customerMap[uniqueKey].lastOrderDate) {
            customerMap[uniqueKey].lastOrderDate = orderDate;
          }
        }
      });

      setCustomers(Object.values(customerMap));
    } catch (error) {
      console.error('Customers fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm) ||
      c.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalSpentAll = customers.reduce((sum, c) => sum + c.totalSpent, 0);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">ग्राहक व शेतकरी (Customers)</h1>
          <p className="text-xs text-gray-500 mt-0.5">दुकानाशी जोडलेले सर्व शेतकरी व ग्राहक तपशील</p>
        </div>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-1">एकूण शेतकरी (Customers)</p>
            <h3 className="text-3xl font-bold text-gray-800">{customers.length}</h3>
          </div>
          <div className="bg-green-50 p-4 rounded-full text-[#154f30]">
            <ShoppingBag size={26} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-1">ग्राहकांकडून झालेली विक्री</p>
            <h3 className="text-3xl font-bold text-gray-800">₹ {totalSpentAll.toLocaleString('en-IN')}</h3>
          </div>
          <div className="bg-blue-50 p-4 rounded-full text-blue-500">
            <IndianRupee size={26} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-1">सरासरी खरेदी (Avg Spent)</p>
            <h3 className="text-3xl font-bold text-gray-800">
              ₹ {customers.length > 0 ? Math.round(totalSpentAll / customers.length).toLocaleString('en-IN') : 0}
            </h3>
          </div>
          <div className="bg-orange-50 p-4 rounded-full text-orange-500">
            <ShoppingBag size={26} />
          </div>
        </div>
      </div>

      {/* Main Customers Table Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-end">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              placeholder="नाव, मोबाईल किंवा गाव शोधा..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#154f30] text-sm"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center py-20 text-gray-500 gap-2">
              <Loader2 className="animate-spin text-[#154f30]" size={28} />
              <span className="text-base font-medium">माहिती लोड होत आहे...</span>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-gray-600 text-sm">
                  <th className="p-4 font-semibold whitespace-nowrap">शेतकऱ्याचे नाव</th>
                  <th className="p-4 font-semibold whitespace-nowrap">मोबाईल नंबर</th>
                  <th className="p-4 font-semibold whitespace-nowrap">गाव / पत्ता</th>
                  <th className="p-4 font-semibold text-center whitespace-nowrap">एकूण ऑर्डर्स</th>
                  <th className="p-4 font-semibold text-right whitespace-nowrap">एकूण खरेदी</th>
                  <th className="p-4 font-semibold text-center whitespace-nowrap">शेवटची भेट / ऑर्डर</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {filteredCustomers.length > 0 ? (
                  filteredCustomers.map((cust, idx) => (
                    <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="p-4 font-medium text-gray-800 flex items-center gap-3">
                        <div className="w-9 h-9 bg-green-100 text-[#154f30] rounded-full flex items-center justify-center font-bold text-sm">
                          {cust.name.charAt(0).toUpperCase()}
                        </div>
                        <span>{cust.name}</span>
                      </td>

                      <td className="p-4 text-gray-600">
                        <div className="flex items-center gap-1.5">
                          <Phone size={14} className="text-gray-400" />
                          <span>{cust.phone}</span>
                        </div>
                      </td>

                      <td className="p-4 text-gray-600">
                        <div className="flex items-center gap-1.5">
                          <MapPin size={14} className="text-gray-400" />
                          <span>{cust.location}</span>
                        </div>
                      </td>

                      <td className="p-4 text-center font-semibold text-gray-700">
                        {cust.totalOrders}
                      </td>

                      <td className="p-4 text-right font-bold text-[#154f30]">
                        ₹ {cust.totalSpent.toLocaleString('en-IN')}
                      </td>

                      <td className="p-4 text-center text-xs text-gray-500">
                        {cust.lastOrderDate.toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-10 text-gray-400">
                      कोणतीही ग्राहक माहिती सापडली नाही.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Customers;