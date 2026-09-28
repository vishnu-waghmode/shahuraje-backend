import React, { useState, useEffect } from 'react';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { App as CapApp } from '@capacitor/app';

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
import WeatherDetail from './pages/WeatherDetail';

import { CartProvider } from './CartContext';
import { 
  isAppLocked, 
  checkHasMpin, 
  recordBackgroundTime, 
  clearBackgroundTime 
} from './mpinStorage';

setupIonicReact();

const TopRouteLoader = () => {
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 250);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  if (!loading) return null;

  return (
    <div className="fixed top-0 left-0 right-0 h-[3px] z-[99999] overflow-hidden bg-transparent pointer-events-none">
      <div className="h-full bg-gradient-to-r from-[#0c542b] via-emerald-400 to-lime-300 animate-pulse w-full duration-300" />
    </div>
  );
};

const HardwareBackButtonHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const handleBackButton = (ev: any) => {
      if (!ev.detail?.register) return;

      ev.detail.register(100, () => {
        const currentPath = location.pathname;

        if (currentPath === '/home' || currentPath === '/' || currentPath === '/login') {
          if (!isExiting) {
            setIsExiting(true);
            setTimeout(() => {
              try {
                CapApp.exitApp();
              } catch (e) {
                // browser fallback
              }
            }, 2000);
          }
        } else {
          navigate(-1);
        }
      });
    };

    document.addEventListener('ionBackButton', handleBackButton as any);
    return () => document.removeEventListener('ionBackButton', handleBackButton as any);
  }, [location.pathname, navigate, isExiting]);

  if (isExiting) {
    return (
      <div className="fixed inset-0 z-[999999] flex flex-col items-center justify-center bg-gradient-to-b from-[#0c542b] to-[#052914] text-white">
        <div className="bg-white p-2 rounded-full mb-6 shadow-2xl flex items-center justify-center w-24 h-24">
          <img src="/shahuraje1.png" alt="logo" className="w-20 h-20 object-contain" />
        </div>
        <h2 className="text-2xl font-black">Jai Baliraja! 🌾</h2>
        <p className="text-sm font-medium text-green-200 mt-2">Sheti Aapli Sanskruti, Shetkari Aapla Abhiman!</p>
      </div>
    );
  }

  return null;
};

const AppLockWatcher = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const publicPaths = ['/login', '/register', '/mpin', '/setup-mpin', '/forgot-password', '/'];

    const checkLockStatus = () => {
      const user = localStorage.getItem('user');
      if (user && checkHasMpin() && isAppLocked()) {
        if (!publicPaths.includes(location.pathname)) {
          navigate('/mpin', { replace: true });
        }
      } else {
        clearBackgroundTime();
      }
    };

    // Render cycle complete jhalyavar check hone saathi timeout
    const timeoutId = setTimeout(checkLockStatus, 100);

    let appListenerHandle: any = null;
    try {
      CapApp.addListener('appStateChange', ({ isActive }) => {
        if (!isActive) {
          recordBackgroundTime();
        } else {
          const user = localStorage.getItem('user');
          if (user && checkHasMpin() && isAppLocked()) {
            navigate('/mpin', { replace: true });
          } else {
            clearBackgroundTime();
          }
        }
      }).then((handle) => {
        appListenerHandle = handle;
      }).catch(() => {});
    } catch (e) {}

    const handleVisibility = () => {
      if (document.hidden) {
        recordBackgroundTime();
      } else {
        const user = localStorage.getItem('user');
        if (user && checkHasMpin() && isAppLocked()) {
          navigate('/mpin', { replace: true });
        } else {
          clearBackgroundTime();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('visibilitychange', handleVisibility);
      if (appListenerHandle?.remove) {
        appListenerHandle.remove();
      }
    };
  }, [location.pathname, navigate]);

  return null;
};

const App = () => (
  <IonApp>
    <CartProvider>
      <IonReactRouter>
        <TopRouteLoader />
        <HardwareBackButtonHandler />
        <AppLockWatcher />

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
            <Route path="/weather-detail" element={<WeatherDetail />} />
          </Routes>
        </IonRouterOutlet>
      </IonReactRouter>
    </CartProvider>
  </IonApp>
);

export default App;