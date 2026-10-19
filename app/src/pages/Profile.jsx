import React, { useState, useEffect } from 'react';
import { IonPage, IonContent } from '@ionic/react';
import { useNavigate } from 'react-router-dom';
import { 
  User, MapPin, Globe, HelpCircle, FileText, LogOut, ChevronRight, 
  Home as HomeIcon, Package, ShoppingCart, ArrowLeft, Camera, X, Phone, Mail, Check 
} from 'lucide-react';
import { lockApp } from '../mpinStorage';
import { useCart } from '../CartContext';

const Profile = () => {
  const navigate = useNavigate();
  const { cartItems } = useCart();

  const [userData, setUserData] = useState({
    name: 'शेतकरी मित्र',
    phone: '',
    email: '',
    initials: 'SM'
  });

  // 👉 कोणते मॉडल (Popup) उघडे आहे ते ट्रॅक करण्यासाठी स्टेट
  const [activeModal, setActiveModal] = useState(null); // 'info', 'address', 'language', 'help', 'terms'

  // localStorage मधून लॉगिन युझरची माहिती आणणे
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        const user = JSON.parse(savedUser);
        const fullName = user.name || user.fullName || user.username || 'शेतकरी मित्र';
        
        const nameParts = fullName.trim().split(' ');
        let initials = 'SM';
        if (nameParts.length >= 2) {
          initials = `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
        } else if (nameParts.length === 1 && nameParts[0].length > 0) {
          initials = nameParts[0].slice(0, 2).toUpperCase();
        }

        setUserData({
          name: fullName,
          phone: user.phone || user.mobile || '९८७६५४३२१०',
          email: user.email || 'farmer@shahuraje.com',
          initials
        });
      }
    } catch (e) {
      console.error('Error reading user data:', e);
    }
  }, []);

  // प्रोफाईल मेनू ऑप्शन्स आणि त्यांचे मॉडल हँडलर
  const menuOptions = [
    { id: 'info', icon: <User size={20} />, title: 'माझी माहिती', subtitle: 'प्रोफाईल तपशील पहा' },
    { id: 'address', icon: <MapPin size={20} />, title: 'माझे पत्ते', subtitle: 'डिलिव्हरीचा पत्ता व्यवस्थापित करा' },
    { id: 'language', icon: <Globe size={20} />, title: 'भाषा (Language)', subtitle: 'मराठी (Marathi)' },
    { id: 'help', icon: <HelpCircle size={20} />, title: 'मदत आणि सपोर्ट', subtitle: 'आमच्याशी संपर्क साधा' },
    { id: 'terms', icon: <FileText size={20} />, title: 'नियम आणि अटी', subtitle: 'ॲप वापरण्याच्या अटी' },
  ];

  // लॉगआउट फंक्शन
  const handleLogout = () => {
    const confirmLogout = window.confirm("तुम्हाला नक्की लॉगआउट करायचे आहे का?");
    if (confirmLogout) {
      lockApp();
      navigate('/mpin', { replace: true });
    }
  };

  return (
    <IonPage>
      <IonContent fullscreen className="bg-gray-50">
        <div className="w-full min-h-full flex flex-col pb-32">
          
          {/* १. टॉप हेडर */}
          <div 
            className="bg-[#0c542b] px-4 pb-6 rounded-b-[40px] shadow-md relative"
            style={{ paddingTop: 'calc(env(safe-area-inset-top) + 24px)' }}
          >
            <div className="flex items-center justify-between mb-6 relative z-10">
              <button 
                onClick={() => navigate(-1)}
                className="p-2 bg-white/10 rounded-full hover:bg-white/20 text-white transition-all shadow-sm"
              >
                <ArrowLeft size={20} />
              </button>
              
              <h1 className="text-lg font-black text-white absolute left-0 right-0 text-center pointer-events-none">
                माझे प्रोफाईल
              </h1>
              
              <div className="w-9 h-9"></div>
            </div>
            
            <div className="flex flex-col items-center relative z-10">
              <div className="w-20 h-20 bg-white rounded-full p-1 shadow-lg mb-3">
                <div className="w-full h-full bg-green-100 rounded-full flex items-center justify-center text-[#0c542b] font-black text-2xl">
                  {userData.initials}
                </div>
              </div>
              
              <h2 className="text-lg font-bold text-white">{userData.name}</h2>
              
              <p className="text-xs text-green-100 mt-1">
                {userData.phone ? `+91 ${userData.phone}` : userData.email}
              </p>
            </div>
            
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl pointer-events-none"></div>
          </div>

          <div className="px-4 pt-6 space-y-4 flex-1">
            
            {/* २. मेनू लिस्ट */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {menuOptions.map((item, index) => (
                <div 
                  key={item.id} 
                  onClick={() => setActiveModal(item.id)} // 👉 क्लिक केल्यावर संबंधित मॉडल उघडेल
                  className={`flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-all ${
                    index !== menuOptions.length - 1 ? 'border-b border-gray-100' : ''
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-green-50 text-[#0c542b] rounded-full flex items-center justify-center">
                      {item.icon}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-800">{item.title}</h3>
                      <p className="text-[10px] text-gray-500 font-medium mt-0.5">{item.subtitle}</p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-gray-300" />
                </div>
              ))}
            </div>

            {/* ३. लॉगआउट बटण */}
            <button 
              onClick={handleLogout}
              className="w-full bg-red-50 text-red-600 border border-red-100 py-3.5 rounded-2xl font-bold text-sm shadow-sm hover:bg-red-100 active:scale-95 transition-all flex items-center justify-center mt-4"
            >
              <LogOut size={18} className="mr-2" />
              लॉगआउट करा
            </button>
            <p className="text-center text-[10px] text-gray-400 font-medium mt-4">
              अॅप व्हर्जन १.०.०
            </p>
          </div>

        </div>
      </IonContent>

      {/* ================= 🟢 MODALS / POPUPS ================= */}
      {activeModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex justify-center items-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
            
            {/* मॉडल हेडर */}
            <div className="bg-[#0c542b] text-white p-4 flex justify-between items-center">
              <h3 className="font-bold text-base">
                {activeModal === 'info' && 'माझी माहिती'}
                {activeModal === 'address' && 'माझे पत्ते (Addresses)'}
                {activeModal === 'language' && 'भाषा निवडा (Language)'}
                {activeModal === 'help' && 'मदत आणि सपोर्ट'}
                {activeModal === 'terms' && 'नियम आणि अटी'}
              </h3>
              <button onClick={() => setActiveModal(null)} className="p-1 rounded-full bg-white/10 hover:bg-white/20 transition">
                <X size={20} />
              </button>
            </div>

            {/* मॉडल बॉडी */}
            <div className="p-5 overflow-y-auto space-y-4 text-gray-700 text-sm">
              
              {/* १. माझी माहिती */}
              {activeModal === 'info' && (
                <div className="space-y-3">
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <span className="text-xs text-gray-400 block font-bold">पूर्ण नाव</span>
                    <p className="font-bold text-gray-800 text-base">{userData.name}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <span className="text-xs text-gray-400 block font-bold">मोबाईल नंबर</span>
                    <p className="font-bold text-gray-800 text-base">+91 {userData.phone || 'उपलब्ध नाही'}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <span className="text-xs text-gray-400 block font-bold">खाते प्रकार</span>
                    <p className="font-bold text-[#0c542b] text-sm">नोंदणीकृत शेतकरी सदस्य</p>
                  </div>
                </div>
              )}

              {/* २. माझे पत्ते */}
              {activeModal === 'address' && (
                <div className="space-y-3">
                  <div className="bg-green-50 border border-green-200 p-4 rounded-2xl relative">
                    <span className="bg-[#0c542b] text-white text-[10px] font-bold px-2 py-0.5 rounded-md mb-2 inline-block">मुख्य पत्ता (Default)</span>
                    <h4 className="font-bold text-gray-800">{userData.name}</h4>
                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">मु. पोस्ट तालुका, शाहूराजे शेती केंद्र परिसर, महाराष्ट्र - ४१३००१</p>
                    <p className="text-xs font-bold text-gray-700 mt-2">मोबाईल: +91 {userData.phone}</p>
                  </div>
                  <button onClick={() => alert('नवीन पत्ता जोडण्याची सुविधा लवकरच येईल!')} className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs rounded-xl transition">
                    + नवीन पत्ता जोडा
                  </button>
                </div>
              )}

              {/* ३. भाषा */}
              {activeModal === 'language' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3.5 bg-green-50 border border-green-200 rounded-2xl cursor-pointer">
                    <span className="font-bold text-gray-800">मराठी (Marathi) - सद्यस्थिती</span>
                    <Check size={18} className="text-[#0c542b]" />
                  </div>
                  <div className="flex items-center justify-between p-3.5 bg-gray-50 border border-gray-100 rounded-2xl cursor-pointer hover:bg-gray-100 opacity-60">
                    <span className="font-medium text-gray-700">English (लवकरच येत आहे)</span>
                  </div>
                </div>
              )}

              {/* ४. मदत आणि सपोर्ट */}
              {activeModal === 'help' && (
                <div className="space-y-3">
                  <p className="text-xs text-gray-500">तुम्हाला शेतीविषयक किंवा ऑर्डरबद्दल काही अडचण असल्यास खालील माध्यमातून संपर्क साधा:</p>
                  <a href="tel:9876543210" className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100 transition">
                    <div className="p-2.5 bg-green-100 text-[#0c542b] rounded-full"><Phone size={18} /></div>
                    <div>
                      <span className="text-[10px] text-gray-400 block font-bold">हेल्पलाईन नंबर</span>
                      <span className="font-bold text-gray-800">+९१ ९८७६५ ४३२१०</span>
                    </div>
                  </a>
                  <a href="mailto:support@shahuraje.com" className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100 transition">
                    <div className="p-2.5 bg-green-100 text-[#0c542b] rounded-full"><Mail size={18} /></div>
                    <div>
                      <span className="text-[10px] text-gray-400 block font-bold">ईमेल सपोर्ट</span>
                      <span className="font-bold text-gray-800">support@shahuraje.com</span>
                    </div>
                  </a>
                </div>
              )}

              {/* ५. नियम आणि अटी */}
              {activeModal === 'terms' && (
                <div className="space-y-2 text-xs text-gray-600 leading-relaxed">
                  <p><b>१. सेवा वापर:</b> शाहूराजे कृषी केंद्र ॲप केवळ शेतकऱ्यांच्या सोयीसाठी आणि दर्जेदार खते, बियाणे पुरवण्यासाठी आहे.</p>
                  <p><b>२. पिकांचा डॉक्टर:</b> पिकांच्या रोगाबाबत दिलेला सल्ला अनुभवावर आणि तज्ज्ञांच्या मार्गदर्शनावर आधारित आहे.</p>
                  <p><b>३. गोपनीयता:</b> तुमची वैयक्तिक माहिती पूर्णपणे सुरक्षित ठेवण्यात येते.</p>
                </div>
              )}

            </div>

            {/* मॉडल फुटर */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button 
                onClick={() => setActiveModal(null)}
                className="px-5 py-2 bg-[#0c542b] text-white font-bold text-xs rounded-xl hover:bg-[#094020] transition"
              >
                बंद करा
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ================= 🟢 बॉटम नेव्हिगेशन बार ================= */}
      <div 
        className="fixed left-4 right-4 bg-white/95 backdrop-blur-xl border border-gray-100/80 py-2.5 px-5 flex justify-between items-center z-40 shadow-[0_12px_40px_rgba(0,0,0,0.12)] rounded-3xl select-none"
        style={{ bottom: 'calc(env(safe-area-inset-bottom) + 14px)' }}
      >
        <div 
          onClick={() => navigate('/home')} 
          className="flex flex-col items-center justify-center text-gray-400 hover:text-[#0c542b] cursor-pointer transition-all duration-150 active:scale-90 px-2 py-1 rounded-2xl hover:bg-gray-50"
        >
          <HomeIcon size={22} className="stroke-[2]" />
          <span className="text-[10px] font-semibold mt-0.5">होम</span>
        </div>

        <div 
          onClick={() => navigate('/orders')} 
          className="flex flex-col items-center justify-center text-gray-400 hover:text-[#0c542b] cursor-pointer transition-all duration-150 active:scale-90 px-2 py-1 rounded-2xl hover:bg-gray-50"
        >
          <Package size={22} className="stroke-[2]" />
          <span className="text-[10px] font-semibold mt-0.5">ऑर्डर्स</span>
        </div>

        {/* Professional Camera Button */}
        <div 
          onClick={() => navigate('/crop-advisory')} 
          className="flex flex-col items-center justify-center cursor-pointer transition-all duration-150 active:scale-90 group px-2"
        >
          <div className="w-12 h-12 bg-gradient-to-tr from-[#0c542b] via-emerald-600 to-lime-500 rounded-full flex items-center justify-center text-white shadow-[0_4px_14px_rgba(12,84,43,0.35)] group-hover:scale-105 transition-transform">
            <Camera size={24} className="stroke-[2.2]" />
          </div>
          <span className="text-[10px] font-bold text-[#0c542b] mt-0.5">डॉक्टर</span>
        </div>

        <div 
          onClick={() => navigate('/cart')} 
          className="relative flex flex-col items-center justify-center text-gray-400 hover:text-[#0c542b] cursor-pointer transition-all duration-150 active:scale-90 px-2 py-1 rounded-2xl hover:bg-gray-50"
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
          className="flex flex-col items-center justify-center text-[#0c542b] cursor-pointer transition-all duration-150 active:scale-90 px-2 py-1 rounded-2xl bg-[#0c542b]/10"
        >
          <User size={22} className="stroke-[2.5]" />
          <span className="text-[10px] font-black mt-0.5 tracking-wide">प्रोफाईल</span>
        </div>
      </div>
    </IonPage>
  );
};

export default Profile;