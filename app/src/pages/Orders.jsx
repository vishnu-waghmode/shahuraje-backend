import React, { useState, useEffect } from 'react';
import { IonPage, IonContent } from '@ionic/react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Home as HomeIcon, 
  Package, 
  ShoppingCart, 
  User, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Loader2,
  Navigation // 👉 ट्रॅक आयकॉन
} from 'lucide-react';

const Orders = () => {
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('सर्व');
  const tabs = ['सर्व', 'प्रलंबित', 'पोहोचले', 'रद्द'];

  // १. खरी ऑर्डर्स सेव्ह करण्यासाठी state
  const [myOrders, setMyOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // २. बॅकएंडवरून ऑर्डर्स फेच करणे
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        const userId = user?.id || user?._id;
        
        if (!userId) {
          console.error("User not logged in");
          setLoading(false);
          return;
        }

        const response = await fetch(`https://shahuraje-backend-1.onrender.com/api/orders/user/${userId}`);
        const data = await response.json();

        if (response.ok) {
          setMyOrders(Array.isArray(data) ? data : data.orders || []);
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // ३. टॅबनुसार फिल्टर करणे
  const filteredOrders = myOrders.filter(order => {
    if (activeTab === 'सर्व') return true;
    if (activeTab === 'प्रलंबित' && order.status === 'Pending') return true;
    if (activeTab === 'पोहोचले' && order.status === 'Delivered') return true;
    if (activeTab === 'रद्द' && order.status === 'Cancelled') return true;
    return false;
  });

  // तारीख फॉरमॅट करण्याचे फंक्शन
  const formatDate = (dateString) => {
    const options = { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-GB', options);
  };

  return (
    <IonPage>
      <IonContent fullscreen className="bg-gray-50">
        <div className="w-full min-h-full flex flex-col pb-32">
          
          <div 
            className="bg-white px-4 pb-3 shadow-sm sticky top-0 z-20"
            style={{ paddingTop: 'calc(env(safe-area-inset-top) + 16px)' }}
          >
            <div className="flex items-center space-x-3 mb-4">
              <button 
                onClick={() => navigate(-1)}
                className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 text-gray-800 transition-all"
              >
                <ArrowLeft size={20} />
              </button>
              <h1 className="text-base font-black text-gray-800">माझी ऑर्डर्स</h1>
            </div>

            <div className="flex space-x-2 overflow-x-auto no-scrollbar pb-1">
              {tabs.map((tab) => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap shadow-sm transition-all ${
                    activeTab === tab 
                      ? 'bg-[#0c542b] text-white' 
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="px-4 pt-4 space-y-4">
            <div className="space-y-3">
              {loading ? (
                <div className="flex justify-center items-center py-10">
                  <Loader2 size={30} className="animate-spin text-[#0c542b]" />
                </div>
              ) : filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <div 
                    key={order._id} 
                    className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 transition-all"
                  >
                    <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-100">
                      <span className="text-xs font-bold text-gray-500">
                        ऑर्डर #{order._id.substring(order._id.length - 6).toUpperCase()}
                      </span>
                      
                      {order.status === 'Delivered' && (
                        <span className="flex items-center text-[10px] font-bold text-green-700 bg-green-50 px-2 py-1 rounded-md">
                          <CheckCircle size={12} className="mr-1" /> पोहोचले
                        </span>
                      )}
                      {order.status === 'Pending' && (
                        <span className="flex items-center text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded-md">
                          <Clock size={12} className="mr-1" /> प्रलंबित
                        </span>
                      )}
                      {order.status === 'Processing' && (
                        <span className="flex items-center text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded-md">
                          <Clock size={12} className="mr-1" /> तयार होत आहे
                        </span>
                      )}
                      {order.status === 'Cancelled' && (
                        <span className="flex items-center text-[10px] font-bold text-red-700 bg-red-50 px-2 py-1 rounded-md">
                          <XCircle size={12} className="mr-1" /> रद्द
                        </span>
                      )}
                    </div>

                    {/* प्रॉडक्ट्स यादी */}
                    {order.items.map((item, index) => (
                      <div key={index} className="flex items-center space-x-3 mb-2 last:mb-0">
                        <div className="w-16 h-16 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100">
                          <img 
                            src={item.productId?.image || 'https://via.placeholder.com/150'} 
                            alt={item.productId?.name} 
                            className="w-full h-full object-cover" 
                          />
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="font-bold text-xs text-gray-800 leading-snug line-clamp-1">
                            {item.productId?.name || 'उत्पादन'}
                          </h3>
                          <div className="font-black text-[#0c542b] text-sm mt-0.5">
                            ₹{item.price} <span className="text-[10px] text-gray-500">x {item.quantity}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    <div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-50">
                      <p className="text-[10px] text-gray-400 font-medium">{formatDate(order.createdAt)}</p>
                      <div className="font-black text-gray-800 text-sm">एकूण: ₹{order.totalAmount}</div>
                    </div>

                    {/* 👉 नवीन: लाईव्ह ट्रॅकिंग बटण (फक्त रद्द नसलेल्या ऑर्डर्ससाठी) */}
                    {order.status !== 'Cancelled' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/track-order/${order._id}`);
                        }}
                        className="w-full mt-3 py-2.5 px-4 bg-[#0c542b] hover:bg-[#083a1d] active:scale-95 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all"
                      >
                        <Navigation size={15} />
                        <span>डिलिव्हरी ट्रॅक करा (Track Order)</span>
                      </button>
                    )}

                  </div>
                ))
              ) : (
                <div className="text-center py-10 bg-white rounded-2xl border border-gray-100">
                  <Package size={40} className="mx-auto text-gray-300 mb-2" />
                  <p className="text-gray-500 font-bold text-sm">या कॅटेगरीमध्ये कोणतीही ऑर्डर नाही.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </IonContent>

      {/* प्रीमियम फ्लोटिंग बॉटम नेव्हिगेशन बार */}
      <div 
        className="fixed left-4 right-4 bg-white/95 backdrop-blur-xl border border-gray-100/80 py-2.5 px-6 flex justify-between items-center z-50 shadow-[0_12px_40px_rgba(0,0,0,0.12)] rounded-3xl select-none"
        style={{ bottom: 'calc(env(safe-area-inset-bottom) + 14px)' }}
      >
        <div onClick={() => navigate('/home')} className="flex flex-col items-center justify-center text-gray-400 hover:text-[#0c542b] cursor-pointer transition-all duration-150 active:scale-90 px-3 py-1 rounded-2xl hover:bg-gray-50">
          <HomeIcon size={22} className="stroke-[2]" />
          <span className="text-[10px] font-semibold mt-0.5">होम</span>
        </div>

        <div onClick={() => navigate('/orders')} className="flex flex-col items-center justify-center text-[#0c542b] cursor-pointer transition-all duration-150 active:scale-90 px-3 py-1 rounded-2xl bg-[#0c542b]/10">
          <Package size={22} className="stroke-[2.5]" />
          <span className="text-[10px] font-black mt-0.5 tracking-wide">ऑर्डर्स</span>
        </div>

        <div onClick={() => navigate('/cart')} className="relative flex flex-col items-center justify-center text-gray-400 hover:text-[#0c542b] cursor-pointer transition-all duration-150 active:scale-90 px-3 py-1 rounded-2xl hover:bg-gray-50">
          <ShoppingCart size={22} className="stroke-[2]" />
          <span className="text-[10px] font-semibold mt-0.5">कार्ट</span>
        </div>

        <div onClick={() => navigate('/profile')} className="flex flex-col items-center justify-center text-gray-400 hover:text-[#0c542b] cursor-pointer transition-all duration-150 active:scale-90 px-3 py-1 rounded-2xl hover:bg-gray-50">
          <User size={22} className="stroke-[2]" />
          <span className="text-[10px] font-semibold mt-0.5">प्रोफाईल</span>
        </div>
      </div>
    </IonPage>
  );
};

export default Orders;