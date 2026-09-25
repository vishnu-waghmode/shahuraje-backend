import React, { useState, useEffect } from 'react';
import { IonPage, IonContent } from '@ionic/react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, ShoppingCart, Home as HomeIcon, User, Package, Plus, 
  CloudSun, Wind, Droplets, MapPin, CheckCircle2, AlertTriangle, CloudRain
} from 'lucide-react';
import { useCart } from '../CartContext';

const Home = () => {
  const navigate = useNavigate();
  const { cartItems, addToCart } = useCart();

  const savedUser = JSON.parse(localStorage.getItem('user'));
  const userName = savedUser?.name || 'शेतकरी मित्र';
  
  const userInitials = userName
    .split(' ')
    .map(n => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // लाईव्ह हवामानासाठी स्टेट्स
  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(true);

  // कॅरोसेलसाठी ३ बॅनर
  const banners = [
    {
      badge: 'विशेष सवलत',
      title: 'पिकांच्या भरघोस वाढीसाठी...',
      subtitle: 'उत्तम दर्जाची कीटकनाशके व खते थेट शेतात.',
      image: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=800&q=80',
      tagColor: 'bg-emerald-500/80'
    },
    {
      badge: '१००% खात्रीशीर',
      title: 'जास्त उत्पादन देणारे बियाणे',
      subtitle: 'सर्व प्रकारच्या प्रमाणित बियाण्यांची मोठी उपलब्धता.',
      image: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800&q=80',
      tagColor: 'bg-amber-500/80'
    },
    {
      badge: 'जलद सेवा',
      title: 'घरपोच मोफत डिलिव्हरी',
      subtitle: 'घरबसल्या ऑर्डर करा शेतीची सर्व उत्पादने.',
      image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&q=80',
      tagColor: 'bg-blue-500/80'
    }
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 3500);
    return () => clearInterval(slideInterval);
  }, [banners.length]);

  // प्रॉडक्ट्स आणणे
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

  // थेट GPS लोकेशनवरून लाईव्ह हवामान
  useEffect(() => {
    const fetchLiveWeather = async (lat, lon) => {
      try {
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m&timezone=auto`
        );
        const data = await res.json();
        setWeather(data.current);
        setWeatherLoading(false);
      } catch (err) {
        console.error('हवामान एरर:', err);
        setWeatherLoading(false);
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchLiveWeather(pos.coords.latitude, pos.coords.longitude),
        () => fetchLiveWeather(17.6599, 75.9064) // सोलापूर डिफॉल्ट
      );
    } else {
      fetchLiveWeather(17.6599, 75.9064);
    }
  }, []);

  const displayedProducts = products.filter((item) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    const matchName = item.name?.toLowerCase().includes(query);
    const matchCategory = item.category?.toLowerCase().includes(query);
    return matchName || matchCategory;
  });

  // १. लाईव्ह हवामानानुसार स्थिती ठरवणे
  const isRaining = Boolean(
    weather && (
      weather.precipitation > 0 || 
      (weather.weather_code >= 51 && weather.weather_code <= 67) ||
      (weather.weather_code >= 80 && weather.weather_code <= 82)
    )
  );

  // const isRaining = true;

  const isWindy = !isRaining && Boolean(weather && weather.wind_speed_10m >= 26);

  // २. हवामानानुसार डायनॅमिक इमेज, बॅज आणि मजकूर
  let weatherTheme = {
    bgImage: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80',
    statusBadge: '☀️ स्वच्छ हवामान',
    subText: 'आज हवामान अगदी प्रसन्न आहे',
    advisoryTitle: 'आज पिकांवर फवारणीसाठी अतिशय उत्तम वेळ आहे!',
    advisoryDesc: 'हवामान कोरडे व शांत असल्याने औषधाचे १००% चांगले परिणाम मिळतील.',
    isGoodForSpray: true
  };

  if (isRaining) {
    weatherTheme = {
      bgImage: 'https://images.unsplash.com/photo-1519692933481-e162a57d6721?w=800&q=80',
      statusBadge: '🌧️ पाऊस सुरू आहे',
      subText: 'पावसामुळे वातावरणात चांगला गारवा आहे',
      advisoryTitle: 'आज फवारणी करू नका (पाऊस सुरू आहे)!',
      advisoryDesc: 'पावसाच्या पाण्याने औषध वाहून जाऊन औषध व पैशांचे नुकसान होईल.',
      isGoodForSpray: false
    };
  } else if (isWindy) {
    weatherTheme = {
      bgImage: 'https://images.unsplash.com/photo-1505672678563-1498064a383d?w=800&q=80',
      statusBadge: '💨 जोराचा वारा',
      subText: `वाऱ्याचा वेग ${weather?.wind_speed_10m || 0} km/h इतका आहे`,
      advisoryTitle: 'फवारणी करताना काळजी घ्या (वारा जोरात आहे)!',
      advisoryDesc: 'वाऱ्यामुळे औषध इतरत्र उडून जाईल किंवा झाडावर व्यवस्थित बसणार नाही.',
      isGoodForSpray: false
    };
  }

  return (
    <IonPage>
      <IonContent fullscreen className="bg-gray-50">
        <div className="w-full min-h-full flex flex-col pb-32">
          
          {/* १. हेडर */}
          <div 
            className="bg-white px-4 pb-3 shadow-sm sticky top-0 z-20 flex items-center justify-between"
            style={{ paddingTop: 'calc(env(safe-area-inset-top) + 14px)' }}
          >
            <div className="flex items-center space-x-3">
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
                {cartItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                    {cartItems.length}
                  </span>
                )}
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
            
            {/* २. सर्च बार */}
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

            {/* ३. बॅनर कॅरोसेल */}
            <div className="relative overflow-hidden rounded-3xl shadow-lg h-44">
              <div 
                className="flex h-full transition-transform duration-700 ease-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {banners.map((banner, index) => (
                  <div 
                    key={index} 
                    className="min-w-full h-full relative overflow-hidden flex items-center justify-between p-5 text-white select-none"
                  >
                    <img 
                      src={banner.image} 
                      alt={banner.title} 
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-transparent"></div>

                    <div className="relative z-10 max-w-[70%]">
                      <span className={`inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full backdrop-blur-md text-white mb-2 shadow-sm ${banner.tagColor}`}>
                        {banner.badge}
                      </span>
                      <h3 className="text-base font-black leading-snug drop-shadow-md text-white">
                        {banner.title}
                      </h3>
                      <p className="text-xs text-gray-200 mt-1 leading-relaxed line-clamp-2">
                        {banner.subtitle}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="absolute bottom-3 left-0 right-0 flex justify-center space-x-1.5 z-20">
                {banners.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      currentSlide === idx ? 'w-6 bg-white' : 'w-2 bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* ४. उत्पादन श्रेण्या */}
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

            {/* ५. लोकप्रिय उत्पादने (फक्त ४ उत्पादने) */}
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
                <>
                  <div className="grid grid-cols-2 gap-3.5">
                    {(searchQuery ? displayedProducts : displayedProducts.slice(0, 4)).map((item) => (
                      <div 
                        key={item._id || item.id} 
                        onClick={() => navigate('/product-detail', { state: { product: item } })}
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
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              addToCart(item);
                              alert('प्रॉडक्ट कार्टमध्ये जोडले!'); 
                            }} 
                            className="bg-[#0c542b] text-white p-2 rounded-xl hover:bg-[#083a1d] active:scale-95 transition-all shadow-sm"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {!searchQuery && displayedProducts.length > 4 && (
                    <div className="mt-3 text-center">
                      <button
                        onClick={() => navigate('/productlisting')}
                        className="w-full py-2.5 bg-white border border-[#0c542b] text-[#0c542b] font-bold text-xs rounded-2xl hover:bg-green-50 active:scale-95 transition-all shadow-sm"
                      >
                        सर्व उत्पादने पहा ({displayedProducts.length}) →
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* ६. 🔥 लाईव्ह हवामान कार्ड (क्लिक केल्यावर WeatherDetail पेज उघडेल) */}
            <div 
               onClick={() => navigate('/weather-detail', { state: { weather } })}
               className="relative overflow-hidden rounded-3xl p-4.5 text-white shadow-xl border border-white/20 select-none min-h-[205px] flex flex-col justify-between cursor-pointer active:scale-[0.98] transition-all"
            >
              
              {/* १. बॅकग्राउंड इमेज */}
              <img 
                src={weatherTheme.bgImage} 
                alt="हवामान दृश्य" 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 scale-105"
              />

              {/* २. गडद ग्रेडियंट ओव्हरले */}
              <div className={`absolute inset-0 transition-colors duration-700 ${
                isRaining 
                  ? 'bg-gradient-to-r from-slate-950/90 via-slate-900/75 to-blue-950/60' 
                  : isWindy 
                    ? 'bg-gradient-to-r from-teal-950/90 via-emerald-950/75 to-transparent'
                    : 'bg-gradient-to-r from-[#0c542b]/95 via-[#0c542b]/75 to-transparent'
              }`}></div>

              {/* ३. पाऊस असल्यास पडणारे पावसाचे थेंब */}
              {isRaining && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
                  {[...Array(24)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-[1.5px] bg-gradient-to-b from-transparent via-cyan-200 to-white/95 rounded-full animate-rain-drop"
                      style={{
                        height: `${Math.random() * 22 + 15}px`,
                        left: `${(i * 4.2) + (Math.random() * 2)}%`,
                        animationDelay: `${Math.random() * 0.7}s`,
                        animationDuration: `${0.55 + Math.random() * 0.25}s`
                      }}
                    />
                  ))}
                </div>
              )}

              {/* ४. वारा असल्यास वाऱ्याच्या लाटांचा ॲनिमेशन इफेक्ट */}
              {isWindy && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
                  <div className="absolute top-1/4 -left-full w-full h-8 bg-gradient-to-r from-transparent via-white/25 to-transparent blur-sm animate-wind-gust"></div>
                  <div className="absolute top-2/3 -left-full w-full h-12 bg-gradient-to-r from-transparent via-cyan-100/20 to-transparent blur-md animate-wind-gust" style={{ animationDelay: '1.2s' }}></div>
                </div>
              )}

              {/* ५. मुख्य माहितीचा मजकूर */}
              <div className="relative z-10">
                {/* टॉप हेडर बार */}
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center space-x-1.5 bg-black/40 px-2.5 py-1 rounded-full backdrop-blur-md border border-white/15">
                    <MapPin size={13} className="text-emerald-300 animate-bounce" />
                    <span className="text-[11px] font-bold tracking-wide">तुमचे शेत (Live हवामान)</span>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-black/40 backdrop-blur-md border border-white/15 flex items-center">
                      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${isRaining ? 'bg-cyan-400 animate-ping' : isWindy ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400 animate-ping'}`}></span>
                      {weatherTheme.statusBadge}
                    </span>
                    <span className="text-[9px] bg-white/20 hover:bg-white/30 px-2 py-0.5 rounded-full font-bold backdrop-blur-md border border-white/20">
                      तपशील →
                    </span>
                  </div>
                </div>

                {weatherLoading ? (
                  <div className="py-8 text-center text-xs text-white/90 font-medium animate-pulse">
                    उपग्रहावरून थेट हवामान माहिती घेत आहे...
                  </div>
                ) : weather ? (
                  <>
                    <div className="flex items-center justify-between my-2">
                      <div className="flex items-center space-x-3.5">
                        <div className="relative">
                          {isRaining ? (
                            <CloudRain size={46} className="text-cyan-300 drop-shadow-[0_4px_12px_rgba(34,211,238,0.5)] animate-bounce" />
                          ) : isWindy ? (
                            <Wind size={46} className="text-teal-200 drop-shadow-[0_4px_12px_rgba(45,212,191,0.5)] animate-pulse" />
                          ) : (
                            <CloudSun size={46} className="text-amber-300 drop-shadow-[0_4px_12px_rgba(251,191,36,0.5)]" />
                          )}
                        </div>
                        <div>
                          <div className="text-3xl font-black tracking-tight flex items-baseline drop-shadow-md">
                            {Math.round(weather.temperature_2m)}
                            <span className="text-xl font-bold ml-0.5 text-white/90">°C</span>
                          </div>
                          <span className="text-[11px] text-white/90 font-semibold drop-shadow-sm">
                            {weatherTheme.subText}
                          </span>
                        </div>
                      </div>

                      {/* आर्द्रता व वारा */}
                      <div className="space-y-1.5 bg-black/40 backdrop-blur-md p-2 rounded-2xl border border-white/15 text-xs shadow-md">
                        <div className="flex items-center space-x-1.5 justify-end text-cyan-200">
                          <Droplets size={14} className="text-cyan-300" />
                          <span className="text-white/90">आर्द्रता:</span>
                          <b className="text-white font-black">{weather.relative_humidity_2m}%</b>
                        </div>
                        <div className="flex items-center space-x-1.5 justify-end text-teal-200">
                          <Wind size={14} className="text-teal-300" />
                          <span className="text-white/90">वारा:</span>
                          <b className="text-white font-black">{weather.wind_speed_10m} km/h</b>
                        </div>
                      </div>
                    </div>

                    {/* फवारणी सल्ला */}
                    <div className="mt-3.5 bg-black/40 border border-white/20 p-2.5 rounded-2xl backdrop-blur-md flex items-center space-x-2.5 shadow-md">
                      {weatherTheme.isGoodForSpray ? (
                        <CheckCircle2 size={20} className="text-emerald-300 flex-shrink-0" />
                      ) : (
                        <AlertTriangle size={20} className="text-amber-300 flex-shrink-0" />
                      )}
                      <div>
                        <p className="text-[11px] font-bold text-white leading-tight">
                          {weatherTheme.advisoryTitle}
                        </p>
                        <p className="text-[9px] text-white/80 mt-0.5">
                          {weatherTheme.advisoryDesc}
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="py-4 text-center text-xs text-white/80">
                    हवामान माहिती मिळवण्यात अडचण आली.
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </IonContent>

      {/* ७. बॉटम नेव्हिगेशन बार */}
      <div 
        className="fixed left-4 right-4 bg-white/95 backdrop-blur-xl border border-gray-100/80 py-2.5 px-6 flex justify-between items-center z-50 shadow-[0_12px_40px_rgba(0,0,0,0.12)] rounded-3xl select-none"
        style={{ bottom: 'calc(env(safe-area-inset-bottom) + 14px)' }}
      >
        <div 
          onClick={() => navigate('/home')} 
          className="flex flex-col items-center justify-center text-[#0c542b] cursor-pointer transition-all duration-150 active:scale-90 px-3 py-1 rounded-2xl bg-[#0c542b]/10"
        >
          <HomeIcon size={22} className="stroke-[2.5]" />
          <span className="text-[10px] font-black mt-0.5 tracking-wide">होम</span>
        </div>

        <div 
          onClick={() => navigate('/orders')} 
          className="flex flex-col items-center justify-center text-gray-400 hover:text-[#0c542b] cursor-pointer transition-all duration-150 active:scale-90 px-3 py-1 rounded-2xl hover:bg-gray-50"
        >
          <Package size={22} className="stroke-[2]" />
          <span className="text-[10px] font-semibold mt-0.5">ऑर्डर्स</span>
        </div>

        <div 
          onClick={() => navigate('/cart')} 
          className="relative flex flex-col items-center justify-center text-gray-400 hover:text-[#0c542b] cursor-pointer transition-all duration-150 active:scale-90 px-3 py-1 rounded-2xl hover:bg-gray-50"
        >
          <div className="relative">
            <ShoppingCart size={22} className="stroke-[2]" />
            {cartItems.length > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold shadow-sm">
                {cartItems.length}
              </span>
            )}
          </div>
          <span className="text-[10px] font-semibold mt-0.5">कार्ट</span>
        </div>

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