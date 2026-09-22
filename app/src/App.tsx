import React, { useState, useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact, useIonRouter } from '@ionic/react';
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

/* २. अचूक बॅक बटण हँडलर (Ionic + Capacitor) */
const BackButtonManager = () => {
  const ionRouter = useIonRouter();
  const location = useLocation();

  useEffect(() => {
    // Capacitor चा हार्डवेअर बॅक लिसनर
    const listenerPromise = CapApp.addListener('backButton', () => {
      const path = location.pathname;

      // १. जर होम, लॉगिन किंवा स्प्लॅश असेल तरच ॲप बंद करा
      if (path === '/home' || path === '/' || path === '/login') {
        CapApp.exitApp();
      } 
      // २. इतर कोणत्याही पानावर (उदा. cart, orders, profile, productlisting) असेल तर मागे जा
      else if (ionRouter.canGoBack()) {
        ionRouter.back();
      } else {
        // फॉलबॅक: जर हिस्ट्री सापडली नाही तर थेट /home वर नेणे
        window.history.back();
      }
    });

    return () => {
      listenerPromise.then(handler => handler.remove());
    };
  }, [location.pathname, ionRouter]);

  return null;
};

const App = () => (
  <IonApp>
    <IonReactRouter>
      <TopRouteLoader />
      <BackButtonManager />

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
  </IonApp>
);

export default App;