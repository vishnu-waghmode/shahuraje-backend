import React, { useState, useEffect } from 'react';
import { IonPage, IonContent } from '@ionic/react';
import { useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, Home as HomeIcon, User, Package, Star, Plus } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();

  // १. लोकल स्टोरेजमधून लॉगिन युझरची माहिती मिळवणे
  const savedUser = JSON.parse(localStorage.getItem('user'));
  const userName = savedUser?.name || 'शेतकरी मित्र';
  
  // नावावरून प्रोफाइल अक्षरे (उदा. Vishnu Waghmode -> VW)
  const userInitials = userName
    .split(' ')
    .map(n => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  // २. प्रॉडक्ट्स, लोडिंग आणि डायनॅमिक सर्चसाठी स्टेट्स
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

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

  // ४. सर्च बारमधील शब्दांनुसार उत्पादने लाईव्ह फिल्टर करणे
  const displayedProducts = products.filter((item) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;

    const matchName = item.name?.toLowerCase().includes(query);
    const matchCategory = item.category?.toLowerCase().includes(query);
    return matchName || matchCategory;
  });

  return (
    <IonPage>
      <IonContent fullscreen className="bg-gray-50">
        <div className="w-full min-h-full flex flex-col pb-32">
          
          {/* १. टॉप हेडर (लोगो आणि प्रोफाइल) */}
          <div 
            className="bg-white px-4 pb-3 shadow-sm sticky top-0 z-20 flex items-center justify-between"
            style={{ paddingTop: 'calc(env(safe-area-inset-top) + 14px)' }}
          >
            <div className="flex items-center space-x-3">
             {/*  लोगो बॉक्स */}
    <div className="w-15 h-15 flex items-center justify-center overflow-hidden flex-shrink-0">
      <img 
        src="/shahuraje1.png" 
        alt="शाहूराजे लोगो" 
        style={{ width: '80px', height: '80px' }}
        className="object-contain block"
        onError={(e) => {
          e.target.style.display = 'none';
          e.target.parentNode.innerHTML = '<span class="text-xs font-black text-[#0c542b]">शाहूराजे</span>';
        }}
      />
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
            
            {/* २. डायनॅमिक सर्च बार (Live Filter + Clear '✕' Button) */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Search size={18} />
              </span>
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchQuery.trim() !== '') {
                    navigate(`/productlisting?search=${encodeURIComponent(searchQuery.trim())}`);
                  }
                }}
                placeholder="खते, बियाणे, औषधे शोधा..." 
                className="w-full pl-10 pr-10 py-3 bg-white border border-gray-200 rounded-2xl font-medium text-sm text-gray-800 placeholder-gray-400 shadow-sm focus:outline-none focus:border-[#0c542b] transition-all"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-700 text-xs font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            {/* ३. आकर्षक बॅनर */}
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

            {/* ४. उत्पादन श्रेण्या (कॅटेगरीज) */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-gray-800 text-base">उत्पादन श्रेण्या (Categories)</h3>
                <span 
                  onClick={() => navigate('/productlisting')} 
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
                    onClick={() => navigate(`/productlisting?category=${encodeURIComponent(cat.name)}`)} 
                    className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center hover:border-[#0c542b] cursor-pointer transition-all active:scale-95"
                  >
                    <span className="text-2xl mb-1">{cat.icon}</span>
                    <span className="text-xs font-bold text-gray-700">{cat.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ५. उत्पादनांची यादी (डायनॅमिक फिल्टर निकालांसह) */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-gray-800 text-base">
                  {searchQuery ? `"${searchQuery}" चे निकाल` : 'लोकप्रिय उत्पादने'}
                </h3>
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
              ) : displayedProducts.length === 0 ? (
                <div className="text-center py-10 text-gray-500 font-medium text-sm">
                  कोणतीही उत्पादने सापडली नाहीत.
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3.5">
                  {displayedProducts.map((item) => (
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

      {/* ६. प्रीमियम फ्लोटिंग बॉटम नेव्हिगेशन बार */}
<div 
  className="fixed left-4 right-4 bg-white/95 backdrop-blur-xl border border-gray-100/80 py-2.5 px-6 flex justify-between items-center z-50 shadow-[0_12px_40px_rgba(0,0,0,0.12)] rounded-3xl select-none"
  style={{ bottom: 'calc(env(safe-area-inset-bottom) + 14px)' }}
>
  {/* होम बटण (सध्या ॲक्टिव्ह - हलक्या हिरव्या बॅकग्राउंडसह) */}
  <div 
    onClick={() => navigate('/home')} 
    className="flex flex-col items-center justify-center text-[#0c542b] cursor-pointer transition-all duration-150 active:scale-90 px-3 py-1 rounded-2xl bg-[#0c542b]/10"
  >
    <HomeIcon size={22} className="stroke-[2.5]" />
    <span className="text-[10px] font-black mt-0.5 tracking-wide">होम</span>
  </div>

  {/* ऑर्डर्स बटण */}
  <div 
    onClick={() => navigate('/orders')} 
    className="flex flex-col items-center justify-center text-gray-400 hover:text-[#0c542b] cursor-pointer transition-all duration-150 active:scale-90 px-3 py-1 rounded-2xl hover:bg-gray-50"
  >
    <Package size={22} className="stroke-[2]" />
    <span className="text-[10px] font-semibold mt-0.5">ऑर्डर्स</span>
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

export default Home;