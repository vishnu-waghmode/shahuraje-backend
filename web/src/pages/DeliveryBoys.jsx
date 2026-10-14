import React, { useState, useEffect } from 'react';
import { UserPlus, Search, Loader2, Truck, X, Edit2, Save } from 'lucide-react';

const API_BASE_URL = 'https://shahuraje-backend-1.onrender.com';

const DeliveryBoys = () => {
  const [deliveryBoys, setDeliveryBoys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  // पॉप-अप आणि अपडेट साठी States
  const [selectedBoy, setSelectedBoy] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // नवीन ॲड करण्यासाठी फॉर्म डेटा
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', password: ''
  });

  // अपडेट करण्यासाठी फॉर्म डेटा
  const [editFormData, setEditFormData] = useState({
    name: '', email: '', phone: '', password: ''
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

  // पॉप-अप उघडण्याचे फंक्शन
  const openBoyDetails = (boy) => {
    setSelectedBoy(boy);
    setIsEditing(false);
    setEditFormData({
      name: boy.name,
      email: boy.email || '',
      phone: boy.phone,
      password: '' // जुना पासवर्ड दिसत नाही, फक्त नवीन टाकता येतो
    });
  };

  // माहिती अपडेट करण्याचे फंक्शन
  const handleUpdateDeliveryBoy = async () => {
    setIsUpdating(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/delivery/update-delivery-boy/${selectedBoy._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData)
      });
      const data = await response.json();
      if (response.ok && data.success) {
        alert("माहिती यशस्वीरित्या अपडेट झाली!");
        // यादीमध्ये त्वरित बदल दिसावा यासाठी
        setDeliveryBoys(deliveryBoys.map(b => b._id === selectedBoy._id ? { ...b, ...editFormData } : b));
        setSelectedBoy(null); // पॉप-अप बंद करा
      } else {
        alert("एरर: " + (data.error || "अपडेट होऊ शकले नाही."));
      }
    } catch (error) {
      alert("सर्व्हरशी संपर्क होऊ शकला नाही.");
    } finally {
      setIsUpdating(false);
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
                <div 
                  key={boy._id} 
                  onClick={() => openBoyDetails(boy)}
                  className="p-4 border border-gray-100 rounded-xl bg-gray-50 flex items-start gap-3 cursor-pointer hover:border-[#154f30] hover:shadow-md transition-all"
                  title="माहिती पाहण्यासाठी आणि बदलण्यासाठी क्लिक करा"
                >
                  <div className="w-10 h-10 bg-[#154f30]/10 text-[#154f30] rounded-full flex items-center justify-center font-bold text-lg">
                    {boy.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 text-sm">{boy.name}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">📞 {boy.phone}</p>
                    <p className="text-xs text-blue-600 mt-1 font-medium hover:underline">अधिक माहिती पहा</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-10">सध्या कोणताही डिलिव्हरी बॉय नाही.</p>
          )}
        </div>

      </div>

      {/* 🔴 माहिती पाहण्यासाठी आणि अपडेट करण्यासाठी पॉप-अप (Modal) 🔴 */}
      {selectedBoy && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                {isEditing ? <Edit2 size={20} className="text-[#154f30]" /> : <Truck size={20} className="text-[#154f30]" />}
                {isEditing ? 'माहिती अपडेट करा' : 'डिलिव्हरी बॉय माहिती'}
              </h2>
              <button onClick={() => setSelectedBoy(null)} className="p-2 text-gray-400 hover:bg-gray-200 hover:text-gray-800 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">पूर्ण नाव</label>
                {isEditing ? (
                  <input type="text" value={editFormData.name} onChange={(e) => setEditFormData({...editFormData, name: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                ) : (
                  <p className="font-semibold text-gray-800">{selectedBoy.name}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">मोबाईल नंबर</label>
                {isEditing ? (
                  <input type="tel" value={editFormData.phone} onChange={(e) => setEditFormData({...editFormData, phone: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                ) : (
                  <p className="font-semibold text-gray-800">{selectedBoy.phone}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">ईमेल आयडी (लॉगिनसाठी)</label>
                {isEditing ? (
                  <input type="email" value={editFormData.email} onChange={(e) => setEditFormData({...editFormData, email: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                ) : (
                  <p className="font-semibold text-gray-800">{selectedBoy.email || 'ईमेल उपलब्ध नाही'}</p>
                )}
              </div>

              {isEditing && (
                <div className="p-3 bg-orange-50 border border-orange-100 rounded-lg mt-4">
                  <label className="block text-xs font-bold text-orange-800 mb-1">नवीन पासवर्ड (बदलायचा असेल तरच टाका)</label>
                  <input type="text" placeholder="रिकामे सोडल्यास जुनाच राहील" value={editFormData.password} onChange={(e) => setEditFormData({...editFormData, password: e.target.value})} className="w-full px-3 py-2 border border-orange-200 rounded-lg text-sm focus:border-orange-500 focus:outline-none" />
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
              {isEditing ? (
                <>
                  <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-200 rounded-lg transition-all">
                    रद्द करा
                  </button>
                  <button onClick={handleUpdateDeliveryBoy} disabled={isUpdating} className="px-4 py-2 text-sm font-bold bg-[#154f30] hover:bg-[#0f3a23] text-white rounded-lg flex items-center gap-2 transition-all">
                    {isUpdating ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                    सेव्ह करा
                  </button>
                </>
              ) : (
                <button onClick={() => setIsEditing(true)} className="px-4 py-2 w-full text-sm font-bold bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg flex justify-center items-center gap-2 transition-all">
                  <Edit2 size={16} /> माहिती आणि पासवर्ड बदला
                </button>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryBoys;