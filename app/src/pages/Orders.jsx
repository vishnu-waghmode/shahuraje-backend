import React, { useState } from 'react';
import { IonPage, IonContent } from '@ionic/react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Home as HomeIcon, Package, ShoppingCart, User, ChevronRight, CheckCircle, Clock, XCircle } from 'lucide-react';

const Orders = () => {
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('सर्व');
  const tabs = ['सर्व', 'प्रलंबित', 'पोहोचले', 'रद्द'];

  const myOrders = [
    {
      id: '#ORD12546',
      name: 'TATA रॅलिस झिंक 75% WP',
      price: 450,
      date: '12 Aug 2026, 10:30 AM',
      status: 'Delivered',
      image: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=150'
    },
    {
      id: '#ORD12501',
      name: 'Indofil M-45 (फंगिसाइड)',
      price: 380,
      date: '10 Aug 2026, 04:15 PM',
      status: 'Pending',
      image: 'https://images.unsplash.com/photo-1628352081506-83c43123ed6d?w=150'
    },
    {
      id: '#ORD12490',
      name: 'Yara Urea',
      price: 280,
      date: '08 Aug 2026, 09:00 AM',
      status: 'Delivered',
      image: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=150'
    }
  ];

  const filteredOrders = myOrders.filter(order => {
    if (activeTab === 'सर्व') return true;
    if (activeTab === 'प्रलंबित' && order.status === 'Pending') return true;
    if (activeTab === 'पोहोचले' && order.status === 'Delivered') return true;
    if (activeTab === 'रद्द' && order.status === 'Cancelled') return true;
    return false;
  });

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
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <div 
                    key={order.id} 
                    onClick={() => alert(`ऑर्डर ${order.id} चा तपशील लवकरच दिसेल!`)}
                    className="bg-white p-3.5 rounded-2xl shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-all"
                  >
                    <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-100">
                      <span className="text-xs font-bold text-gray-500">ऑर्डर {order.id}</span>
                      
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
                      {order.status === 'Cancelled' && (
                        <span className="flex items-center text-[10px] font-bold text-red-700 bg-red-50 px-2 py-1 rounded-md">
                          <XCircle size={12} className="mr-1" /> रद्द
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="w-16 h-16 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100">
                        <img src={order.image} alt={order.name} className="w-full h-full object-cover" />
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-bold text-xs text-gray-800 leading-snug line-clamp-1">{order.name}</h3>
                        <div className="font-black text-[#0c542b] text-sm mt-0.5">₹{order.price}</div>
                        <p className="text-[10px] text-gray-400 font-medium mt-1">{order.date}</p>
                      </div>

                      <div className="text-gray-300">
                        <ChevronRight size={20} />
                      </div>
                    </div>
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

      {/* प्रीमियम फ्लोटिंग बॉटम नेव्हिगेशन बार (Orders Page) */}
<div 
  className="fixed left-4 right-4 bg-white/95 backdrop-blur-xl border border-gray-100/80 py-2.5 px-6 flex justify-between items-center z-50 shadow-[0_12px_40px_rgba(0,0,0,0.12)] rounded-3xl select-none"
  style={{ bottom: 'calc(env(safe-area-inset-bottom) + 14px)' }}
>
  {/* होम बटण */}
  <div 
    onClick={() => navigate('/home')} 
    className="flex flex-col items-center justify-center text-gray-400 hover:text-[#0c542b] cursor-pointer transition-all duration-150 active:scale-90 px-3 py-1 rounded-2xl hover:bg-gray-50"
  >
    <HomeIcon size={22} className="stroke-[2]" />
    <span className="text-[10px] font-semibold mt-0.5">होम</span>
  </div>

  {/* ऑर्डर्स बटण (सध्या ॲक्टिव्ह - हलक्या हिरव्या बॅकग्राउंडसह) */}
  <div 
    onClick={() => navigate('/orders')} 
    className="flex flex-col items-center justify-center text-[#0c542b] cursor-pointer transition-all duration-150 active:scale-90 px-3 py-1 rounded-2xl bg-[#0c542b]/10"
  >
    <Package size={22} className="stroke-[2.5]" />
    <span className="text-[10px] font-black mt-0.5 tracking-wide">ऑर्डर्स</span>
  </div>

  {/* कार्ट बटण (बॅजसह) */}
  <div 
    onClick={() => navigate('/cart')} 
    className="relative flex flex-col items-center justify-center text-gray-400 hover:text-[#0c542b] cursor-pointer transition-all duration-150 active:scale-90 px-3 py-1 rounded-2xl hover:bg-gray-50"
  >
    <div className="relative">
      <ShoppingCart size={22} className="stroke-[2]" />
      <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold shadow-sm">
        2
      </span>
    </div>
    <span className="text-[10px] font-semibold mt-0.5">कार्ट</span>
  </div>

  {/* प्रोफाईल बटण */}
  <div 
    onClick={() => navigate('/profile')} 
    className="flex flex-col items-center justify-center text-gray-400 hover:text-[#0c542b] cursor-pointer transition-all duration-150 active:scale-90 px-3 py-1 rounded-2xl hover:bg-gray-50"
  >
    <User size={22} className="stroke-[2]" />
    <span className="text-[10px] font-semibold mt-0.5">प्रोफाईल</span>
  </div>
</div>
    </IonPage>
  );
};

export default Orders;