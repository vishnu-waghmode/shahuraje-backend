import React, { useState, useEffect } from 'react';
import { IonPage, IonContent } from '@ionic/react';
import { useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, Home as HomeIcon, User, Package, ChevronRight, Star, Plus } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();

  // १. लोकल स्टोरेजमधून लॉगिन युझरची माहिती मिळवणे
  const savedUser = JSON.parse(localStorage.getItem('user'));
  const userName = savedUser?.name || 'शेतकरी मित्र';
  
  // नावावरून प्रोफाइल अक्षरे (उदा. राजेश पाटील -> RP)
  const userInitials = userName
    .split(' ')
    .map(n => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  // २. प्रॉडक्ट्स आणि लोडिंगसाठी स्टेट
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // ३. बॅकएंडवरून डेटा आणणे (Fetch API)
  useEffect(() => {
    const fetchProducts = async () => {
      try {
       const response = await fetch('https://shahuraje-backend.onrender.com/api/products');
        const data = await response.json();
        
        setProducts(data);
        setLoading(false);
      } catch (error) {
        console.error('प्रॉडक्ट्स मिळवताना एरर आला:', error);
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <IonPage>
      <IonContent fullscreen className="bg-gray-50">
        <div className="w-full min-h-full flex flex-col pb-32">
          
          {/* १. टॉप हेडर (Top Navigation Bar) */}
          <div 
            className="bg-white px-4 pb-3 shadow-sm sticky top-0 z-20 flex items-center justify-between"
            style={{ paddingTop: 'calc(env(safe-area-inset-top) + 16px)' }}
          >
            <div className="flex items-center space-x-2.5">
              <div className="flex items-center space-x-1.5 bg-[#0c542b]/10 px-2 py-1 rounded-xl">
                <svg width="24" height="24" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M29 45 C 17 43 10 31 12 19 C 22 21 31 31 29 45 Z" fill="#1b5e20" />
                  <path d="M33 48 C 45 48 57 38 55 15 C 41 15 31 28 33 48 Z" fill="#0c542b" />
                </svg>
                <span className="font-black text-xs text-[#0c542b]">शाहूराजे</span>
              </div>
              <div>
                <p className="text-[11px] text-gray-500 font-medium">नमस्कार,</p>
                <h2 className="text-sm font-bold text-gray-800 leading-tight">{userName}</h2>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div 
                onClick={() => navigate('/cart')}
                className="relative bg-gray-100 p-2 rounded-full cursor-pointer hover:bg-gray-200"
              >
                <ShoppingCart size={20} className="text-[#0c542b]" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">2</span>
              </div>
              <div 
                onClick={() => navigate('/profile')}
                className="w-9 h-9 bg-[#0c542b] text-white rounded-full flex items-center justify-center font-bold text-xs shadow-md cursor-pointer"
              >
                {userInitials}
              </div>
            </div>
          </div>

          <div className="px-4 pt-4 space-y-4">
            
            {/* २. सर्च बार (Search Bar) */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Search size={18} />
              </span>
              <input 
                type="text" 
                placeholder="खते, बियाणे, औषधे शोधा..." 
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-2xl font-medium text-sm text-gray-800 placeholder-gray-400 shadow-sm focus:outline-none focus:border-[#0c542b]"
              />
            </div>

            {/* ३. आकर्षक बॅनर (Promotional Banner) */}
            <div className="bg-gradient-to-r from-[#0c542b] to-[#1b5e20] rounded-2xl p-4 text-white shadow-md relative overflow-hidden flex items-center justify-between">
              <div className="z-10 max-w-[65%]">
                <span className="bg-white/20 text-xs px-2.5 py-0.5 rounded-full font-bold">विशेष ऑफर</span>
                <h3 className="text-lg font-black mt-2 leading-tight">पिकांच्या उत्तम वाढीसाठी...</h3>
                <p className="text-xs text-green-100 mt-1">उत्तम दर्जाची कीटकनाशके व खते उपलब्ध.</p>
              </div>
              <div className="z-10 bg-white p-2.5 rounded-2xl shadow-lg">
                <Package size={36} className="text-[#0c542b]" />
              </div>
              <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none"></div>
            </div>

            {/* ४. कॅटेगरीज (Categories Grid) */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-gray-800 text-base">उत्पादन श्रेण्या (Categories)</h3>
                <span 
                  onClick={() => navigate('/products')}
                  className="text-xs font-bold text-[#0c542b] cursor-pointer hover:underline"
                >
                  सर्व पहा
                </span>
              </div>
              
              <div className="grid grid-cols-4 gap-3 text-center">
                {[
                  { name: 'खते', icon: '🌾' },
                  { name: 'बियाणे', icon: '🌱' },
                  { name: 'कीटकनाशक', icon: '💧' },
                  { name: 'सिंचन', icon: '⚙️' }
                ].map((cat, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => navigate('/productlisting')}
                    className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center hover:border-[#0c542b] cursor-pointer transition-all"
                  >
                    <span className="text-2xl mb-1">{cat.icon}</span>
                    <span className="text-xs font-bold text-gray-700">{cat.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ५. लोकप्रिय उत्पादने (Popular Products Grid) */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-gray-800 text-base">लोकप्रिय उत्पादने</h3>
                <span 
                  onClick={() => navigate('/productlisting')}
                  className="text-xs font-bold text-[#0c542b] cursor-pointer hover:underline"
                >
                  सर्व पहा
                </span>
              </div>

              {loading ? (
                <div className="flex justify-center py-10">
                  <span className="text-sm font-bold text-[#0c542b]">उत्पादने लोड होत आहेत...</span>
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-10 text-gray-500 font-medium text-sm">
                  कोणतीही उत्पादने उपलब्ध नाहीत.
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3.5">
                  {products.map((item) => (
                    <div 
                      key={item._id}
                      onClick={() => navigate('/product-detail')}
                      className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between cursor-pointer hover:shadow-md transition-all"
                    >
                      <div>
                        <div className="w-full h-28 bg-gray-100 rounded-xl mb-2.5 overflow-hidden flex items-center justify-center">
                          <img 
                            src={item.image || 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=300'} 
                            alt={item.name} 
                            className="w-full h-full object-cover" 
                          />
                        </div>
                        <span className="text-[10px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-md">
                          {item.category}
                        </span>
                        <h4 className="font-bold text-xs text-gray-800 mt-1.5 line-clamp-2 leading-snug">
                          {item.name}
                        </h4>
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <div>
                          <span className="text-sm font-black text-[#0c542b]">₹{item.price}</span>
                        </div>
                        <button 
                          onClick={(e) => { e.stopPropagation(); alert('प्रॉडक्ट कार्टमध्ये जोडले!'); }}
                          className="bg-[#0c542b] text-white p-2 rounded-xl hover:bg-[#083a1d] active:scale-95 transition-all shadow-sm"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </IonContent>

      {/* ६. प्रीमियम फ्लोटिंग बॉटम नेव्हिगेशन बार (IonContent च्या बाहेर) */}
      <div 
        className="fixed left-4 right-4 bg-white/90 backdrop-blur-lg border border-gray-100 py-3 px-6 flex justify-between items-center z-50 shadow-[0_10px_40px_rgba(0,0,0,0.1)] rounded-3xl"
        style={{ bottom: 'calc(env(safe-area-inset-bottom) + 16px)' }}
      >
        <div 
          onClick={() => navigate('/home')}
          className="flex flex-col items-center text-[#0c542b] cursor-pointer transition-transform active:scale-95"
        >
          <HomeIcon size={22} />
          <span className="text-[10px] font-bold mt-1">होम</span>
        </div>
        <div 
          onClick={() => navigate('/orders')}
          className="flex flex-col items-center text-gray-400 hover:text-[#0c542b] cursor-pointer transition-transform active:scale-95"
        >
          <Package size={22} />
          <span className="text-[10px] font-medium mt-1">ऑर्डर्स</span>
        </div>
        <div 
          onClick={() => navigate('/cart')}
          className="flex flex-col items-center text-gray-400 hover:text-[#0c542b] cursor-pointer transition-transform active:scale-95"
        >
          <ShoppingCart size={22} />
          <span className="text-[10px] font-medium mt-1">कार्ट</span>
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

export default Home;