import React, { useState, useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';

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

setupIonicReact();

/* १. प्रत्येक पानावर जाताना वर दिसणारा स्लीक हिरवा लोडर */
const TopRouteLoader = () => {
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 250); // २५० मिलिसेकंदात स्मूथली गायब होईल

    return () => clearTimeout(timer);
  }, [location.pathname, location.search]);

  if (!loading) return null;

  return (
    <div className="fixed top-0 left-0 right-0 h-[3px] z-[99999] overflow-hidden bg-transparent pointer-events-none">
      <div className="h-full bg-gradient-to-r from-[#0c542b] via-emerald-400 to-lime-300 animate-pulse w-full duration-300" />
    </div>
  );
};

const App = () => (
  <IonApp>
    <IonReactRouter>
      {/* राऊटरच्या आत लोडर सक्रिय केला */}
      <TopRouteLoader />

      <IonRouterOutlet>
        <Routes>
          {/* मुख्य Splash स्क्रीन */}
          <Route path="/" element={<Splash />} />
          
          {/* शेतकरी लॉगिन स्क्रीन */}
          <Route path="/login" element={<Login />} />

          {/* शेतकरी नोंदणी (Register) स्क्रीन */}
          <Route path="/register" element={<Register />} />

          {/* MPIN स्क्रीन */}
          <Route path="/mpin" element={<MpinScreen />} />
          <Route path="/setup-mpin" element={<MpinScreen isSettingUp={true} />} />

          {/* home page */}
          <Route path="/home" element={<Home />} />

          {/* product listing */}
          <Route path="/productlisting" element={<ProductListing />} />

          {/* product details */}
          <Route path="/product-detail" element={<ProductDetail />} />

          {/* cart */}
          <Route path="/cart" element={<Cart />} />

          {/* orders */}
          <Route path="/orders" element={<Orders />} />

          {/* profile */}
          <Route path="/profile" element={<Profile />} />

          {/* forgot password */}
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Routes>
      </IonRouterOutlet>
    </IonReactRouter>
  </IonApp>
);

export default App;