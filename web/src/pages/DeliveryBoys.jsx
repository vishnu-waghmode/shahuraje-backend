import React, { useState, useEffect } from 'react';
import { UserPlus, Search, Loader2, Truck } from 'lucide-react';

const API_BASE_URL = 'https://shahuraje-backend-1.onrender.com';

const DeliveryBoys = () => {
  const [deliveryBoys, setDeliveryBoys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  // फॉर्म मधील डेटा
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  });

  useEffect(() => {
    fetchDeliveryBoys();
  }, []);

  const fetchDeliveryBoys = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/delivery/delivery-boys`);
      const data = await response.json();
      if (response.ok && data.success) {
        setDeliveryBoys(data.deliveryBoys || []);
      }
    } catch (error) {
      console.error("Error fetching delivery boys:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddDeliveryBoy = async (e) => {
    e.preventDefault();
    setIsAdding(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/delivery/add-delivery-boy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert("डिलिव्हरी बॉय यशस्वीरीत्या तयार केला!");
        setFormData({ name: '', email: '', phone: '', password: '' });
        fetchDeliveryBoys(); // यादी रिफ्रेश करा
      } else {
        alert("एरर: " + (data.error || "काहीतरी चूक झाली आहे."));
      }
    } catch (error) {
      alert("सर्व्हरशी संपर्क होऊ शकला नाही.");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">डिलिव्हरी बॉय मॅनेजमेंट</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* नवीन ॲड करण्याचा फॉर्म */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 md:col-span-1 h-fit">
          <div className="flex items-center gap-2 mb-4 border-b border-gray-50 pb-3">
            <UserPlus className="text-[#154f30]" size={20} />
            <h2 className="text-lg font-bold text-gray-800">नवीन जोडा</h2>
          </div>

          <form onSubmit={handleAddDeliveryBoy} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">पूर्ण नाव</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#154f30] text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">मोबाईल नंबर</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#154f30] text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">ईमेल आयडी</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#154f30] text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">पासवर्ड सेट करा</label>
              <input type="text" name="password" value={formData.password} onChange={handleChange} required
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#154f30] text-sm" />
            </div>
            
            <button type="submit" disabled={isAdding}
              className="w-full bg-[#154f30] hover:bg-[#0f3a23] text-white py-2.5 rounded-lg font-bold text-sm transition-all disabled:opacity-50">
              {isAdding ? 'ॲड करत आहे...' : 'डिलिव्हरी बॉय तयार करा'}
            </button>
          </form>
        </div>

        {/* डिलिव्हरी बॉयची यादी */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 md:col-span-2">
          <div className="flex items-center gap-2 mb-4 border-b border-gray-50 pb-3">
            <Truck className="text-[#154f30]" size={20} />
            <h2 className="text-lg font-bold text-gray-800">सर्व डिलिव्हरी पार्टनर्स</h2>
          </div>

          {loading ? (
            <div className="flex justify-center items-center p-10">
              <Loader2 className="animate-spin text-[#154f30]" size={32} />
            </div>
          ) : deliveryBoys.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {deliveryBoys.map(boy => (
                <div key={boy._id} className="p-4 border border-gray-100 rounded-xl bg-gray-50 flex items-start gap-3">
                  <div className="w-10 h-10 bg-[#154f30]/10 text-[#154f30] rounded-full flex items-center justify-center font-bold text-lg">
                    {boy.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 text-sm">{boy.name}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">📞 {boy.phone}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-10">सध्या कोणताही डिलिव्हरी बॉय नाही.</p>
          )}
        </div>

      </div>
    </div>
  );
};

export default DeliveryBoys;