import React, { useState, useEffect } from 'react';
import { IonPage, IonContent } from '@ionic/react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, Package, Clock, Stethoscope } from 'lucide-react';

const API_BASE_URL = 'https://shahuraje-backend-1.onrender.com';

const Notifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const userId = user?._id || user?.id; 

  useEffect(() => {
    if (userId) {
      fetchAndMarkAllAsRead();
    } else {
      setLoading(false);
    }
  }, [userId]);

  // 👉 पेज उघडताच नोटिफिकेशन्स आणणे आणि एकाच API कॉलद्वारे सर्व 'Read' म्हणून मार्क करणे
  const fetchAndMarkAllAsRead = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/notifications/${userId}`);
      const data = await response.json();
      
      if (response.ok && data.success) {
        setNotifications(data.notifications || []);

        // 🔴 एकाच वेळी सर्व नोटिफिकेशन्स Read करणे (बॅज त्वरित गायब होईल)
        await fetch(`${API_BASE_URL}/api/notifications/mark-all-read/${userId}`, {
          method: 'PUT'
        });
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  // नोटिफिकेशनवर क्लिक केल्यावर योग्य पेजवर जाणे
  const handleNotificationClick = (notif) => {
    const titleText = (notif.title || '').toLowerCase();
    const messageText = (notif.message || '').toLowerCase();

    if (titleText.includes('डॉक्टर') || messageText.includes('पिक') || messageText.includes('औषध')) {
      navigate('/crop-advisory');
    } else if (titleText.includes('ऑर्डर') || messageText.includes('ऑर्डर') || messageText.includes('डिलिव्हरी')) {
      navigate('/orders');
    } else {
      navigate('/home');
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('mr-IN', { day: '2-digit', month: 'short' }) + ' ' + 
           date.toLocaleTimeString('mr-IN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <IonPage>
      <IonContent className="bg-gray-50">
        <div className="w-full min-h-full pb-20">
          
          <div 
            className="bg-[#0c542b] text-white px-4 py-4 sticky top-0 z-20 flex items-center shadow-md"
            style={{ paddingTop: 'calc(env(safe-area-inset-top) + 16px)' }}
          >
            <button onClick={() => navigate(-1)} className="p-1 mr-3 rounded-full hover:bg-white/20 transition">
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-lg font-bold">नोटिफिकेशन्स</h1>
          </div>

          <div className="p-4 space-y-3">
            {loading ? (
              <div className="text-center py-10 text-gray-500">लोड होत आहे...</div>
            ) : notifications.length > 0 ? (
              notifications.map((notif) => (
                <div 
                  key={notif._id} 
                  onClick={() => handleNotificationClick(notif)}
                  className="p-4 rounded-xl shadow-sm bg-white border border-gray-100 flex gap-3 items-start cursor-pointer hover:bg-green-50/30 transition"
                >
                  <div className="p-2 rounded-full mt-1 bg-[#0c542b]/10 text-[#0c542b]">
                    {notif.title?.includes('डॉक्टर') ? <Stethoscope size={20} /> : <Package size={20} />}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-gray-900">
                      {notif.title}
                    </h3>
                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                      {notif.message}
                    </p>
                    <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-2">
                      <Clock size={12} />
                      <span>{formatTime(notif.createdAt)}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-20">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Bell size={30} className="text-gray-400" />
                </div>
                <h3 className="text-gray-800 font-bold">कोणतेही नोटिफिकेशन नाही</h3>
                <p className="text-xs text-gray-500 mt-1">तज्ज्ञांचे सल्ला आणि ऑर्डर्सचे अपडेट्स इथे दिसतील.</p>
              </div>
            )}
          </div>

        </div>
      </IonContent>
    </IonPage>
  );
};

export default Notifications;