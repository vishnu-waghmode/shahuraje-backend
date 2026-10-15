import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { Bell, Check, Clock, Package } from 'lucide-react';

const API_BASE_URL = 'https://shahuraje-backend-1.onrender.com';

const AdminLayout = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  // नोटिफिकेशन्स बॅकएंडवरून आणण्याचे फंक्शन
  const fetchNotifications = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/notifications`);
      const data = await response.json();
      if (response.ok && data.success) {
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error("नोटिफिकेशन्स मिळवताना एरर:", error);
    }
  };

  // पेज उघडल्यावर आणि त्यानंतर दर 15 सेकंदांनी नवीन नोटिफिकेशन्स चेक करणे
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(() => {
      fetchNotifications();
    }, 15000); // 15000 ms = 15 सेकंद

    return () => clearInterval(interval); // कंपोनंट बंद होताना टायमर थांबवणे
  }, []);

  // नोटिफिकेशन वाचले (Read) म्हणून मार्क करणे
  const handleMarkAsRead = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/notifications/mark-read/${id}`, {
        method: 'PUT'
      });
      if (response.ok) {
        // локаल स्टेट अपडेट करा म्हणजे लगेच लाल डॉट जाईल
        setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("एरर:", error);
    }
  };

  // 🔴 नवीन फंक्शन: बेल आयकॉनवर क्लिक केल्यावर लाल आकडा गायब करणे
  const handleBellClick = () => {
    setIsOpen(!isOpen);
    
    // जर ड्रॉपडाऊन उघडले आणि लाल आकडा असेल, तर तो त्वरित झिरो करा
    if (!isOpen && unreadCount > 0) {
      setUnreadCount(0); // लाल बॅज लगेच लपवा
      
      // बॅकएंडमधील सर्व न वाचलेल्या मेसेजेसना 'Read' मार्क करा
      notifications.forEach(notif => {
        if (!notif.isRead) {
          fetch(`${API_BASE_URL}/api/notifications/mark-read/${notif._id}`, { method: 'PUT' });
        }
      });
      
      // लोकल स्क्रीनवरही सर्व वाचलेले दाखवा (हिरवा रंग काढून टाका)
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    }
  };

  // वेळ फॉरमॅट करणे (उदा. 10:30 AM)
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('mr-IN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      
      {/* डावीकडील फिक्स साईडबार */}
      <Sidebar />
      
      {/* उजवीकडील मुख्य भाग */}
      <div className="flex-1 ml-64 flex flex-col h-screen relative">
        
        {/* 🔴 Top Header - इथे Bell Icon असेल 🔴 */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-end px-8 z-20 shadow-sm">
          <div className="relative">
            
            {/* Bell Button */}
            <button 
              onClick={handleBellClick} // 👈 इथे नवीन फंक्शन लावले
              className="p-2 rounded-full hover:bg-gray-100 transition-colors relative"
            >
              <Bell size={24} className="text-gray-700" />
              
              {/* Unread Count Badge */}
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs font-bold flex items-center justify-center rounded-full animate-pulse shadow-md border-2 border-white">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Dropdown Menu (Notifications List) */}
            {isOpen && (
              <>
                {/* बाहेर क्लिक केल्यावर बंद होण्यासाठी Overlay */}
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setIsOpen(false)}
                ></div>
                
                {/* लिस्टचा डबा */}
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 z-20 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-200">
                  <div className="bg-[#154f30] text-white px-4 py-3 flex justify-between items-center">
                    <h3 className="font-bold text-sm">नोटिफिकेशन्स</h3>
                    <span className="text-xs bg-white/20 px-2 py-1 rounded-md">{unreadCount > 0 ? `${unreadCount} नवीन` : '0 नवीन'}</span>
                  </div>
                  
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((notif) => (
                        <div 
                          key={notif._id} 
                          className={`p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors flex gap-3 items-start ${!notif.isRead ? 'bg-green-50/50' : ''}`}
                        >
                          <div className={`mt-1 p-2 rounded-full ${!notif.isRead ? 'bg-[#154f30]/10 text-[#154f30]' : 'bg-gray-100 text-gray-400'}`}>
                            <Package size={16} />
                          </div>
                          
                          <div className="flex-1">
                            <h4 className={`text-sm ${!notif.isRead ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                              {notif.title}
                            </h4>
                            <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                              {notif.message}
                            </p>
                            <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-2">
                              <Clock size={10} />
                              <span>{formatTime(notif.createdAt)}</span>
                            </div>
                          </div>
                          
                          {!notif.isRead && (
                            <button 
                              onClick={() => handleMarkAsRead(notif._id)}
                              className="text-green-600 hover:bg-green-100 p-1.5 rounded-full transition-colors"
                              title="वाचले म्हणून मार्क करा"
                            >
                              <Check size={16} />
                            </button>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="p-6 text-center text-gray-500">
                        <Bell size={32} className="mx-auto mb-2 text-gray-300" />
                        <p className="text-sm font-medium">कोणतेही नवीन नोटिफिकेशन नाही.</p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </header>

        {/* 🟢 मुख्य भाग (Children) 🟢 */}
        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>

      </div>
    </div>
  );
};

export default AdminLayout;