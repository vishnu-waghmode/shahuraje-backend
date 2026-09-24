import React, { useState, useEffect } from 'react';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { App as CapApp } from '@capacitor/app';

/* Ionic चे CSS */
import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';
import './index.css'; 

import Splash from './pages/Splash';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import ProductListing from './pages/ProductListing';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import Profile from './pages/Profile';
import ForgotPassword from './pages/ForgotPassword';
import MpinScreen from './pages/MpinScreen';

/* १. CartProvider इम्पोर्ट केला (तुमच्या CartContext.js फाईलचा पाथ तपासा) */
import { CartProvider } from './CartContext';

setupIonicReact();

/* १. टॉप प्रोग्रेस बार लोडर */
const TopRouteLoader = () => {
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 250);

    return () => clearTimeout(timer);
  }, [location.pathname, location.search]);

  if (!loading) return null;

  return (
    <div className="fixed top-0 left-0 right-0 h-[3px] z-[99999] overflow-hidden bg-transparent pointer-events-none">
      <div className="h-full bg-gradient-to-r from-[#0c542b] via-emerald-400 to-lime-300 animate-pulse w-full duration-300" />
    </div>
  );
};

/* २. नवीन अचूक बॅक बटण हँडलर (एक्झिट स्प्लॅश स्क्रीनसह) */
const HardwareBackButtonHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const handleBackButton = (ev) => {
      // प्रायोरिटी 100 देऊन ॲप डायरेक्ट क्लोज होण्यापासून थांबवणे
      ev.detail.register(100, () => {
        const currentPath = location.pathname;

        // १. जर होम, लॉगिन किंवा स्प्लॅश पेजवर असेल
        if (currentPath === '/home' || currentPath === '/' || currentPath === '/login') {
          if (!isExiting) {
            setIsExiting(true); // एक्झिट स्क्रीन चालू करणे
            
            // अडीच सेकंदांनी ॲप खऱ्या अर्थाने बंद करणे
            setTimeout(() => {
              CapApp.exitApp();
            }, 2500);
          }
        } 
        // २. इतर कोणत्याही पानावर असेल तर मागे जाणे
        else {
          navigate(-1);
        }
      });
    };

    document.addEventListener('ionBackButton', handleBackButton);

    return () => {
      document.removeEventListener('ionBackButton', handleBackButton);
    };
  }, [location.pathname, navigate, isExiting]);

  // जेव्हा युझर बाहेर पडत असेल तेव्हा ही स्क्रीन दिसेल
  if (isExiting) {
    return (
      <div className="fixed inset-0 z-[999999] flex flex-col items-center justify-center bg-gradient-to-b from-[#0c542b] to-[#052914] text-white transition-opacity duration-500">
        
        {/* पांढऱ्या गोलात तुमचा ब्रँड लोगो */}
        <div className="bg-white p-2 rounded-full mb-6 shadow-[0_0_40px_rgba(34,197,94,0.3)] flex items-center justify-center w-24 h-24">
          <img 
            src="/shahuraje1.png" 
            alt="लोगो" 
            className="w-20 h-20 object-contain"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.parentNode.innerHTML = '<span class="text-3xl font-black text-[#0c542b]">SR</span>';
            }}
          />
        </div>
        
        {/* खास शेती विषयक संदेश */}
        <h2 className="text-2xl font-black text-white flex items-center shadow-sm">
          जय बळीराजा! <span className="ml-2 text-2xl">🌾</span>
        </h2>
        
        <p className="text-sm font-medium text-green-200 mt-2 text-center px-8 leading-relaxed">
          शेती आपली संस्कृती, <br/> शेतकरी आपला अभिमान!
        </p>
        
        {/* तळाला बारीक लोडिंग टेक्स्ट */}
        <p className="absolute bottom-10 text-[10px] font-bold text-green-400/60 tracking-[0.2em] uppercase animate-pulse">
          सुरक्षितपणे बाहेर पडत आहे...
        </p>
      </div>
    );
  }

  return null;
};

const App = () => (
  <IonApp>
    {/* २. संपूर्ण ॲपला CartProvider ने रॅप (Wrap) केले */}
    <CartProvider>
      <IonReactRouter>
        <TopRouteLoader />
        <HardwareBackButtonHandler />

        <IonRouterOutlet>
          <Routes>
            <Route path="/" element={<Splash />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/mpin" element={<MpinScreen />} />
            <Route path="/setup-mpin" element={<MpinScreen isSettingUp={true} />} />
            <Route path="/home" element={<Home />} />
            <Route path="/productlisting" element={<ProductListing />} />
            <Route path="/product-detail" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
          </Routes>
        </IonRouterOutlet>
      </IonReactRouter>
    </CartProvider>
  </IonApp>
);

export default App;