import React, { useState, useEffect } from 'react';
import { IonPage, IonContent } from '@ionic/react';
import { Package, Truck, CheckCircle2, Phone, MapPin, RefreshCw, AlertCircle } from 'lucide-react';

const API_BASE_URL = 'https://shahuraje-backend-1.onrender.com';

const DeliveryDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  // सध्या लॉगिन असलेल्या डिलिव्हरी बॉयची माहिती
  const user = JSON.parse(localStorage.getItem('user')) || {};
  const deliveryBoyId = user._id || user.id;

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    if (!deliveryBoyId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/delivery/assigned-orders/${deliveryBoyId}`);
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error("Orders fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // स्टेटस अपडेट करणे (पिकअप किंवा डिलिव्हर)
  const handleUpdateStatus = (orderId, newStatus) => {
    setUpdatingId(orderId);

    // मोबाईलचे चालू GPS लोकेशन घेणे
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          await sendStatusRequest(orderId, newStatus, position.coords.latitude, position.coords.longitude);
        },
        async () => {
          // लोकेशन न मिळाल्यास तरीही स्टेटस अपडेट होऊ द्या
          await sendStatusRequest(orderId, newStatus, null, null);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      sendStatusRequest(orderId, newStatus, null, null);
    }
  };

  const sendStatusRequest = async (orderId, newStatus, lat, lng) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/delivery/update-status/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deliveryStatus: newStatus,
          lat,
          lng
        })
      });

      const data = await res.json();
      if (data.success) {
        alert(newStatus === 'Picked_Up' ? 'ऑर्डर पिकअप केली आहे!' : 'ऑर्डर यशस्वीरीत्या पोहोचवली!');
        fetchOrders();
      } else {
        alert('त्रुटी: ' + (data.error || 'पुन्हा प्रयत्न करा'));
      }
    } catch (err) {
      alert('सर्व्हरशी संपर्क होऊ शकला नाही!');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <IonPage>
      <IonContent className="bg-gray-50">
        <div className="w-full min-h-full flex flex-col pb-20">
          
          {/* Header */}
          <div className="bg-[#0c542b] text-white px-5 pt-8 pb-5 shadow-sm sticky top-0 z-20 flex justify-between items-center">
            <div>
              <h1 className="text-lg font-black tracking-wide">डिलिव्हरी पार्टनर पॅनेल</h1>
              <p className="text-xs text-green-100 mt-0.5">{user.name ? `नाव: ${user.name}` : 'शाहूराजे कृषी केंद्र'}</p>
            </div>
            <button 
              onClick={fetchOrders}
              className="p-2 bg-white/10 rounded-full hover:bg-white/20 active:scale-95 transition-all text-white"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>

          {/* Orders Container */}
          <div className="p-4 space-y-4">
            <div className="flex justify-between items-center px-1">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                नेमून दिलेल्या ऑर्डर्स ({orders.length})
              </span>
            </div>

            {loading ? (
              <div className="text-center py-16 text-gray-500 text-sm">
                ऑर्डर्स शोधत आहे...
              </div>
            ) : orders.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center border border-gray-100 shadow-sm mt-4">
                <Package size={48} className="mx-auto text-gray-300 mb-3" />
                <h3 className="font-bold text-gray-800 text-base">सध्या कोणतीही ऑर्डर पेंडिंग नाही</h3>
                <p className="text-xs text-gray-500 mt-1">नवीन ऑर्डर नेमून दिल्यास ती येथे दिसेल.</p>
              </div>
            ) : (
              orders.map((order) => (
                <div key={order._id} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm space-y-3">
                  
                  {/* Status & Amount Tag */}
                  <div className="flex justify-between items-center border-b border-gray-50 pb-2.5">
                    <span className="text-xs font-bold px-2.5 py-1 bg-green-50 text-[#0c542b] rounded-lg">
                      ₹{order.totalAmount} • {order.paymentMethod}
                    </span>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      order.deliveryStatus === 'Picked_Up' 
                        ? 'bg-amber-100 text-amber-800' 
                        : 'bg-blue-50 text-blue-700'
                    }`}>
                      {order.deliveryStatus === 'Picked_Up' ? 'रस्त्यात आहे (In Transit)' : 'पिकअप बाकी'}
                    </span>
                  </div>

                  {/* Customer Details */}
                  <div>
                    <h2 className="font-bold text-gray-800 text-sm">
                      {order.customerName || order.userId?.name || 'शेतकरी ग्राहक'}
                    </h2>
                    <div className="flex items-start text-xs text-gray-500 mt-1">
                      <MapPin size={15} className="mr-1 text-[#0c542b] shrink-0 mt-0.5" />
                      <span>{order.deliveryAddress}</span>
                    </div>
                  </div>

                  {/* Call Farmer Button */}
                  {(order.phone || order.userId?.phone) && (
                    <a 
                      href={`tel:${order.phone || order.userId?.phone}`}
                      className="flex items-center justify-center gap-2 w-full py-2.5 bg-gray-50 active:bg-gray-100 text-gray-700 rounded-xl text-xs font-bold border border-gray-200 transition-all"
                    >
                      <Phone size={14} className="text-[#0c542b]" />
                      <span>शेतकऱ्याला कॉल करा ({order.phone || order.userId?.phone})</span>
                    </a>
                  )}

                  {/* Action Buttons */}
                  <div className="pt-1">
                    {order.deliveryStatus !== 'Picked_Up' ? (
                      <button
                        onClick={() => handleUpdateStatus(order._id, 'Picked_Up')}
                        disabled={updatingId === order._id}
                        className="w-full bg-[#0c542b] text-white py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow hover:bg-[#083a1d] active:scale-95 transition-all disabled:opacity-50"
                      >
                        <Truck size={16} />
                        <span>{updatingId === order._id ? 'अपडेट करत आहे...' : 'ऑर्डर पिकअप केली (Pick Up)'}</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUpdateStatus(order._id, 'Delivered')}
                        disabled={updatingId === order._id}
                        className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow hover:bg-emerald-700 active:scale-95 transition-all disabled:opacity-50"
                      >
                        <CheckCircle2 size={16} />
                        <span>{updatingId === order._id ? 'अपडेट करत आहे...' : 'ऑर्डर ग्राहकास दिली (Delivered)'}</span>
                      </button>
                    )}
                  </div>

                </div>
              ))
            )}
          </div>

        </div>
      </IonContent>
    </IonPage>
  );
};

export default DeliveryDashboard;