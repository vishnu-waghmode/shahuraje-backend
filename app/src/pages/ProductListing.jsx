import React, { useState, useEffect, useRef } from 'react';
import { IonPage, IonContent } from '@ionic/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Search, ShoppingCart, Star, Plus, SlidersHorizontal } from 'lucide-react';

const ProductListing = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // कॅटेगरीज कंटेनरसाठी रेफरन्स (Auto-scroll साठी)
  const categoryScrollRef = useRef(null);

  // URL पॅरामीटर्स
  const queryParams = new URLSearchParams(location.search);
  const categoryFromUrl = queryParams.get('category');
  const searchFromUrl = queryParams.get('search');

  // १. स्टेट्स (States)
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchFromUrl || '');
  const [activeCategory, setActiveCategory] = useState(categoryFromUrl || 'सर्व');

  // कॅटेगरीजची यादी
  const categoriesList = ['सर्व', 'कीटकनाशक', 'खते', 'बियाणे', 'सिंचन'];

  // २. बॅकएंडवरून उत्पादने मिळवणे
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('https://shahuraje-backend.onrender.com/api/products');
        const data = await response.json();
        setProducts(data);
        setLoading(false);
      } catch (error) {
        console.error('प्रॉडक्ट्स लोड करताना एरर आला:', error);
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // ३. ऑटोमॅटिक कॅटेगरी शोधणे आणि ती टॅब स्क्रीनवर पुढे स्क्रोल करणे
  useEffect(() => {
    if (products.length > 0) {
      if (searchFromUrl) {
        const term = searchFromUrl.toLowerCase().trim();
        
        // आधी नावाने मॅच होणारे उत्पादन शोधणे (उदा. Tynzer / टायझर)
        const matched = products.find(p => 
          p.name?.toLowerCase().includes(term) ||
          p.category?.toLowerCase().includes(term)
        );

        if (matched && matched.category) {
          setActiveCategory(matched.category);
          // निवडलेली कॅटेगरी स्क्रीनवर सर्वात आधी दिसण्यासाठी स्क्रोल करणे
          setTimeout(() => {
            const el = document.getElementById(`cat-btn-${matched.category}`);
            if (el) {
              el.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
            }
          }, 150);
        }
      } else if (categoryFromUrl) {
        setActiveCategory(categoryFromUrl);
        setTimeout(() => {
          const el = document.getElementById(`cat-btn-${categoryFromUrl}`);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
          }
        }, 150);
      }
    }
  }, [products, searchFromUrl, categoryFromUrl]);

  // ४. फिल्टरिंग
  const filteredProducts = products.filter((item) => {
    const matchesCategory = 
      activeCategory === 'सर्व' || 
      item.category?.trim().toLowerCase() === activeCategory.trim().toLowerCase();

    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = 
      !query || 
      item.name?.toLowerCase().includes(query) ||
      item.category?.toLowerCase().includes(query);

    return matchesCategory && matchesSearch;
  });

  return (
    <IonPage>
      <IonContent fullscreen className="bg-gray-50">
        <div className="w-full min-h-full flex flex-col pb-10">
          
          {/* १. टॉप हेडर */}
          <div className="bg-white px-4 pt-4 pb-3 shadow-sm sticky top-0 z-20 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => navigate('/home')}
                className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 text-gray-800 transition-all"
              >
                <ArrowLeft size={20} />
              </button>
              <h1 className="text-base font-black text-gray-800">
                {activeCategory === 'सर्व' ? 'सर्व उत्पादने / औषधे' : `${activeCategory}`}
              </h1>
            </div>

            <div 
              onClick={() => navigate('/cart')}
              className="relative bg-gray-100 p-2 rounded-full cursor-pointer hover:bg-gray-200"
            >
              <ShoppingCart size={20} className="text-[#0c542b]" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold">2</span>
            </div>
          </div>

          <div className="px-4 pt-4 space-y-4">
            
            {/* २. सर्च बार */}
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Search size={18} />
                </span>
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="उत्पादन किंवा औषध शोधा..." 
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-2xl font-medium text-xs text-gray-800 placeholder-gray-400 shadow-sm focus:outline-none focus:border-[#0c542b]"
                />
              </div>
              <button className="bg-white border border-gray-200 p-3 rounded-2xl text-[#0c542b] shadow-sm hover:bg-gray-50">
                <SlidersHorizontal size={20} />
              </button>
            </div>

            {/* ३. कॅटेगरी फिल्टर्स (ऑटो-फोकस आणि ॲक्टिव्ह इफेक्टसह) */}
            <div 
              ref={categoryScrollRef}
              className="flex space-x-2 overflow-x-auto pb-1 no-scrollbar scroll-smooth"
            >
              {categoriesList.map((tab, idx) => (
                <button 
                  id={`cat-btn-${tab}`}
                  key={idx}
                  onClick={() => {
                    setActiveCategory(tab);
                    setSearchQuery('');
                  }}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap shadow-sm transition-all ${
                    activeCategory === tab 
                      ? 'bg-[#0c542b] text-white ring-2 ring-[#0c542b]/20' 
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* ४. उत्पादने ग्रिड */}
            {loading ? (
              <div className="flex justify-center py-12">
                <span className="text-sm font-bold text-[#0c542b]">उत्पादने लोड होत आहेत...</span>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3.5">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((item) => (
                    <div 
                      key={item._id}
                      onClick={() => navigate('/product-detail')}
                      className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between cursor-pointer hover:shadow-md transition-all"
                    >
                      <div>
                        <div className="w-full h-32 bg-gray-50 rounded-xl mb-2.5 overflow-hidden flex items-center justify-center relative">
                          <img 
                            src={item.image || 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=300'} 
                            alt={item.name} 
                            className="w-full h-full object-cover" 
                          />
                          <span className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm text-[10px] font-bold px-1.5 py-0.5 rounded-md flex items-center shadow-sm text-amber-700">
                            <Star size={10} className="fill-amber-500 text-amber-500 mr-0.5" /> 4.5
                          </span>
                        </div>
                        
                        <span className="text-[9px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-md">{item.category}</span>
                        <h4 className="font-bold text-xs text-gray-800 mt-1.5 line-clamp-2 leading-snug">{item.name}</h4>
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-sm font-black text-[#0c542b]">₹{item.price}</span>
                        <button 
                          onClick={(e) => { e.stopPropagation(); alert('प्रॉडक्ट कार्टमध्ये जोडले!'); }}
                          className="bg-[#0c542b] text-white p-2 rounded-xl hover:bg-[#083a1d] active:scale-95 transition-all shadow-sm"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 text-center py-12 text-gray-400 font-bold text-sm">
                    कोणतेही उत्पादन सापडले नाही.
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default ProductListing;