import React, { useState, useEffect } from 'react';
import { IonPage, IonContent } from '@ionic/react';
import { useNavigate } from 'react-router-dom';
import { 
  User, MapPin, Globe, HelpCircle, FileText, LogOut, ChevronRight, 
  Home as HomeIcon, Package, ShoppingCart, ArrowLeft 
} from 'lucide-react';
import { lockApp } from '../mpinStorage';

const Profile = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    name: 'शेतकरी मित्र',
    phone: '',
    email: '',
    initials: 'SM'
  });

  // localStorage मधून लॉगिन युझरची माहिती आणणे
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        const user = JSON.parse(savedUser);
        const fullName = user.name || user.fullName || user.username || 'शेतकरी मित्र';
        
        // नावाची आद्याक्षरे (उदा. Vishnu Waghmode -> VW)
        const nameParts = fullName.trim().split(' ');
        let initials = 'SM';
        if (nameParts.length >= 2) {
          initials = `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
        } else if (nameParts.length === 1 && nameParts[0].length > 0) {
          initials = nameParts[0].slice(0, 2).toUpperCase();
        }

        setUserData({
          name: fullName,
          phone: user.phone || user.mobile || '',
          email: user.email || '',
          initials
        });
      }
    } catch (e) {
      console.error('Error reading user data:', e);
    }
  }, []);

  // प्रोफाईल मेनू ऑप्शन्स
  const menuOptions = [
    { id: 1, icon: <User size={20} />, title: 'माझी माहिती', subtitle: 'प्रोफाईल तपशील अपडेट करा' },
    { id: 2, icon: <MapPin size={20} />, title: 'माझे पत्ते', subtitle: 'डिलिव्हरीचा पत्ता व्यवस्थापित करा' },
    { id: 3, icon: <Globe size={20} />, title: 'भाषा (Language)', subtitle: 'मराठी (Marathi)' },
    { id: 4, icon: <HelpCircle size={20} />, title: 'मदत आणि सपोर्ट', subtitle: 'आमच्याशी संपर्क साधा' },
    { id: 5, icon: <FileText size={20} />, title: 'नियम आणि अटी', subtitle: 'ॲप वापरण्याच्या अटी' },
  ];

  // लॉगआउट फंक्शन (ॲप लॉक करून MPIN स्क्रीनवर पाठवेल)
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
              {/* डायनॅमिक आद्याक्षरे (Initials) */}
              <div className="w-20 h-20 bg-white rounded-full p-1 shadow-lg mb-3">
                <div className="w-full h-full bg-green-100 rounded-full flex items-center justify-center text-[#0c542b] font-black text-2xl">
                  {userData.initials}
                </div>
              </div>
              
              {/* डायनॅमिक नाव */}
              <h2 className="text-lg font-bold text-white">{userData.name}</h2>
              
              {/* फोन नंबर किंवा ईमेल */}
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
                  onClick={() => alert(`${item.title} पेज लवकरच उपलब्ध होईल!`)}
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

      {/* ४. बॉटम नेव्हिगेशन बार */}
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
          onClick={() => navigate('/cart')} 
          className="flex flex-col items-center text-gray-400 hover:text-[#0c542b] cursor-pointer transition-transform active:scale-95"
        >
          <ShoppingCart size={22} />
          <span className="text-[10px] font-medium mt-1">कार्ट</span>
        </div>
        <div 
          className="flex flex-col items-center text-[#0c542b] cursor-pointer transition-transform active:scale-95"
        >
          <User size={22} />
          <span className="text-[10px] font-bold mt-1">प्रोफाईल</span>
        </div>
      </div>

    </IonPage>
  );
};

export default Profile;