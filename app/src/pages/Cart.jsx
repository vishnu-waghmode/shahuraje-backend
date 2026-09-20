import React, { useState } from 'react';
import { IonPage, IonContent } from '@ionic/react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, Plus, Minus, Home as HomeIcon, Package, ShoppingCart, User } from 'lucide-react';

const Cart = () => {
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: 'TATA रॅलिस झिंक 75% WP',
      price: 450,
      quantity: 1,
      image: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=150'
    },
    {
      id: 2,
      name: 'Indofil M-45 (फंगिसाइड)',
      price: 380,
      quantity: 1,
      image: 'https://images.unsplash.com/photo-1628352081506-83c43123ed6d?w=150'
    }
  ]);

  const deliveryFee = 40;

  const increaseQty = (id) => {
    setCartItems(cartItems.map(item => 
      item.id === id ? { ...item, quantity: item.quantity + 1 } : item
    ));
  };

  const decreaseQty = (id) => {
    setCartItems(cartItems.map(item => 
      item.id === id && item.quantity > 1 ? { ...item, quantity: item.quantity - 1 } : item
    ));
  };

  const removeItem = (id) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };

  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const total = subtotal > 0 ? subtotal + deliveryFee : 0;

  return (
    <IonPage>
      <IonContent fullscreen className="bg-gray-50">
        {/* pb-48 मुळे शेवटचे प्रॉडक्ट पेमेंट बटण आणि नेव्हिगेशन बारच्या मागे लपणार नाही */}
        <div className="w-full min-h-full flex flex-col pb-48">
          
          <div 
            className="bg-white px-4 pb-3 shadow-sm sticky top-0 z-20 flex items-center space-x-3"
            style={{ paddingTop: 'calc(env(safe-area-inset-top) + 16px)' }}
          >
            <button 
              onClick={() => navigate(-1)}
              className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 text-gray-800 transition-all"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-base font-black text-gray-800">माझी कार्ट</h1>
          </div>

          <div className="px-4 pt-4 space-y-4">
            
            <div className="space-y-3">
              {cartItems.length > 0 ? (
                cartItems.map((item) => (
                  <div key={item.id} className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-3">
                    <div className="w-20 h-20 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-bold text-xs text-gray-800 leading-snug line-clamp-2">{item.name}</h3>
                      <div className="font-black text-[#0c542b] text-sm mt-1">₹{item.price}</div>
                      
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center space-x-2 bg-gray-50 border border-gray-200 px-2 py-1 rounded-lg">
                          <button onClick={() => decreaseQty(item.id)} className="p-0.5 text-gray-500 hover:text-gray-800">
                            <Minus size={14} />
                          </button>
                          <span className="font-bold text-xs text-gray-800 w-4 text-center">{item.quantity}</span>
                          <button onClick={() => increaseQty(item.id)} className="p-0.5 text-gray-500 hover:text-gray-800">
                            <Plus size={14} />
                          </button>
                        </div>
                        
                        <button 
                          onClick={() => removeItem(item.id)}
                          className="text-red-400 hover:text-red-600 bg-red-50 p-1.5 rounded-lg transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 bg-white rounded-2xl border border-gray-100">
                  <ShoppingCart size={40} className="mx-auto text-gray-300 mb-2" />
                  <p className="text-gray-500 font-bold text-sm">तुमची कार्ट रिकामी आहे.</p>
                </div>
              )}
            </div>

            {cartItems.length > 0 && (
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-sm text-gray-800 mb-3">बिलाचा तपशील</h3>
                <div className="space-y-2 text-xs font-medium text-gray-600">
                  <div className="flex justify-between">
                    <span>एकूण किंमत</span>
                    <span className="text-gray-800 font-bold">₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>डिलिव्हरी शुल्क</span>
                    <span className="text-gray-800 font-bold">₹{deliveryFee}</span>
                  </div>
                </div>
                
                <div className="border-t border-dashed border-gray-200 my-3"></div>
                
                <div className="flex justify-between items-center">
                  <span className="font-bold text-sm text-gray-800">एकूण (Grand Total)</span>
                  <span className="font-black text-lg text-[#0c542b]">₹{total}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </IonContent>

      {/* ४. पेमेंट बटण (नवीन नेव्हिगेशन बारच्या बरोबर वर सेट केले आहे) */}
      {cartItems.length > 0 && (
        <div 
          className="fixed left-0 right-0 bg-white border-t border-gray-100 p-3.5 px-6 z-40 rounded-t-3xl shadow-[0_-10px_20px_rgba(0,0,0,0.05)]"
          style={{ bottom: 'calc(env(safe-area-inset-bottom) + 90px)' }}
        >
          <button 
            onClick={() => alert('पेमेंट गेटवे सुरू होत आहे...')}
            className="w-full bg-[#0c542b] text-white py-3.5 rounded-2xl font-bold text-sm shadow-md hover:bg-[#083a1d] active:scale-95 transition-all flex items-center justify-center"
          >
            पेमेंट करा (Checkout)
          </button>
        </div>
      )}

      {/* ५. प्रीमियम फ्लोटिंग बॉटम नेव्हिगेशन बार */}
      <div 
        className="fixed left-4 right-4 bg-white/90 backdrop-blur-lg border border-gray-100 py-3 px-6 flex justify-between items-center z-50 shadow-[0_10px_40px_rgba(0,0,0,0.1)] rounded-3xl"
        style={{ bottom: 'calc(env(safe-area-inset-bottom) + 16px)' }}
      >
        <div 
          onClick={() => navigate('/home')} 
          className="flex flex-col items-center text-gray-400 hover:text-[#0c542b] cursor-pointer transition-transform active:scale-95"
        >
          <HomeIcon size={22} />
          <span className="text-[10px] font-medium mt-1">होम</span>
        </div>
        <div 
          onClick={() => navigate('/orders')} 
          className="flex flex-col items-center text-gray-400 hover:text-[#0c542b] cursor-pointer transition-transform active:scale-95"
        >
          <Package size={22} />
          <span className="text-[10px] font-medium mt-1">ऑर्डर्स</span>
        </div>
        <div 
          className="flex flex-col items-center text-[#0c542b] cursor-pointer transition-transform active:scale-95"
        >
          <ShoppingCart size={22} />
          <span className="text-[10px] font-bold mt-1">कार्ट</span>
        </div>
        <div 
          onClick={() => navigate('/profile')} 
          className="flex flex-col items-center text-gray-400 hover:text-[#0c542b] cursor-pointer transition-transform active:scale-95"
        >
          <User size={22} />
          <span className="text-[10px] font-medium mt-1">प्रोफाईल</span>
        </div>
      </div>
    </IonPage>
  );
};

export default Cart;