import React, { useState } from 'react';
import { IonPage, IonContent } from '@ionic/react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'; 
import { checkHasMpin, unlockApp } from '../mpinStorage';

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const response = await fetch('https://shahuraje-backend.onrender.com/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        unlockApp();

        if (!checkHasMpin()) {
          navigate('/setup-mpin', { replace: true });
        } else {
          navigate('/home', { replace: true });
        }
      } else {
        setErrorMsg(data.error || 'ईमेल किंवा पासवर्ड चुकीचा आहे.');
      }
    } catch (error) {
      console.error('Login Error:', error);
      setErrorMsg('सर्व्हरशी संपर्क होऊ शकला नाही. कृपया सर्व्हर तपासा.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <IonContent fullscreen className="bg-white">
        <div className="w-full h-full flex flex-col justify-between px-6 py-8 overflow-y-auto">
          
          {/* Shirsh bhag: Shahuraje Brand Logo */}
          <div className="flex flex-col items-center text-center mt-4">
            <div className="w-56 max-w-[70%] drop-shadow-md flex items-center justify-center">
              <img 
                src="/shahuraje1.png" 
                alt="शाहूराजे कृषी केंद्र" 
                className="w-full h-auto object-contain"
              />
            </div>
            
            <p className="text-sm font-bold text-[#78350F] mt-1 tracking-wide">
              शेतकऱ्यांचा विश्वास, आमची जबाबदारी...
            </p>
          </div>

          {/* Madhya bhag: Form */}
          <div className="my-auto w-full max-w-sm mx-auto py-4">
            <div className="text-center mb-5">
              <h3 className="text-2xl font-black text-gray-900 mb-1">आपले स्वागत आहे!</h3>
              <p className="text-sm font-semibold text-gray-500">शेतकरी म्हणून लॉगिन करा</p>
            </div>

            {errorMsg && (
              <div className="bg-red-50 text-red-600 text-xs p-3 rounded-xl border border-red-100 mb-4 font-semibold text-center">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="relative flex items-center">
                <span className="absolute left-4 text-gray-400">
                  <Mail size={20} />
                </span>
                <input 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ईमेल आयडी"
                  className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#0c542b] shadow-sm text-base"
                  required
                />
              </div>

              <div className="relative flex items-center">
                <span className="absolute left-4 text-gray-400">
                  <Lock size={20} />
                </span>
                <input 
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="पासवर्ड"
                  className="w-full pl-12 pr-12 py-3.5 bg-white border border-gray-200 rounded-xl font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#0c542b] shadow-sm text-base"
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              <div className="text-right">
                <span 
                  onClick={() => navigate('/forgot-password')}
                  className="text-xs font-bold text-[#0c542b] cursor-pointer hover:underline"
                >
                  पासवर्ड विसरलात ?
                </span>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-[#0c542b] hover:bg-[#083a1d] active:scale-95 transition-all text-white py-3.5 rounded-xl font-bold text-lg shadow-md tracking-wider mt-2 disabled:opacity-50"
              >
                {loading ? 'लॉगिन होत आहे...' : 'लॉगिन'}
              </button>
            </form>

            <div className="flex items-center my-5">
              <div className="flex-grow border-t border-gray-200"></div>
              <span className="px-4 text-xs font-bold text-gray-400">किंवा</span>
              <div className="flex-grow border-t border-gray-200"></div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button 
                type="button"
                className="flex items-center justify-center py-3 px-4 bg-white border border-gray-200 rounded-xl font-bold text-sm text-gray-700 shadow-sm hover:bg-gray-50 active:scale-95 transition-all"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Google
              </button>
              
              <button 
                type="button"
                className="flex items-center justify-center py-3 px-4 bg-white border border-gray-200 rounded-xl font-bold text-sm text-gray-700 shadow-sm hover:bg-gray-50 active:scale-95 transition-all"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="#1877F2" xmlns="http://www.w3.org/2000/svg">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Facebook
              </button>
            </div>
          </div>

          {/* Talacha bhag: Nondani link */}
          <div className="text-center pb-2">
            <p className="text-xs font-semibold text-gray-500">
              नवीन खाते तयार करा?{' '}
              <span 
                onClick={() => navigate('/register')} 
                className="text-[#0c542b] font-bold cursor-pointer hover:underline"
              >
                नोंदणी करा
              </span>
            </p>
          </div>

        </div>
      </IonContent>
    </IonPage>
  );
};  

export default Login;