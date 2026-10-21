import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, KeyRound, X, ArrowLeft, CheckCircle } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // 🔴 Forgot Password Modal States
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [forgotEmail, setForgotEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalMsg, setModalMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    const savedEmail = localStorage.getItem('remembered_email');
    const savedPassword = localStorage.getItem('remembered_password');
    if (savedEmail && savedPassword) {
      setEmail(savedEmail);
      setPassword(savedPassword);
      setRememberMe(true);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const response = await fetch('https://shahuraje-backend-1.onrender.com/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('login_time', Date.now().toString());
        
        if (rememberMe) {
          localStorage.setItem('remembered_email', email);
          localStorage.setItem('remembered_password', password);
        } else {
          localStorage.removeItem('remembered_email');
          localStorage.removeItem('remembered_password');
        }

        navigate('/dashboard', { replace: true });
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

  // 🔴 Step 1: Send OTP for Forgot Password
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    setModalMsg({ type: '', text: '' });

    try {
      const res = await fetch('https://shahuraje-backend-1.onrender.com/api/users/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail.trim().toLowerCase() })
      });
      const data = await res.json();

      if (res.ok) {
        setForgotStep(2);
        setModalMsg({ type: 'success', text: 'OTP तुमच्या ईमेलवर यशस्वीरीत्या पाठवला आहे!' });
      } else {
        setModalMsg({ type: 'error', text: data.error || 'अडचण आली.' });
      }
    } catch (err) {
      setModalMsg({ type: 'error', text: 'सर्व्हरशी संपर्क होऊ शकला नाही.' });
    } finally {
      setModalLoading(false);
    }
  };

  // 🔴 Step 2 & 3: Reset Password with OTP
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    setModalMsg({ type: '', text: '' });

    try {
      const res = await fetch('https://shahuraje-backend-1.onrender.com/api/users/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: forgotEmail.trim().toLowerCase(), 
          otp: otp.trim(), 
          newPassword 
        })
      });
      const data = await res.json();

      if (res.ok) {
        setModalMsg({ type: 'success', text: 'पासवर्ड बदलला! आता लॉगिन करू शकता.' });
        setTimeout(() => {
          setIsForgotModalOpen(false);
          setForgotStep(1);
          setForgotEmail('');
          setOtp('');
          setNewPassword('');
          setModalMsg({ type: '', text: '' });
        }, 2000);
      } else {
        setModalMsg({ type: 'error', text: data.error || 'अडचण आली.' });
      }
    } catch (err) {
      setModalMsg({ type: 'error', text: 'सर्व्हरशी संपर्क होऊ शकला नाही.' });
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-white p-0 m-0 overflow-hidden relative">
      <div className="w-full h-full flex flex-col md:flex-row">
        {/* Left Side: Branding */}
        <div 
          className="w-full md:w-1/2 h-2/5 md:h-full flex flex-col justify-center items-center text-white p-8 md:p-12 relative bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1589923188900-85dae523342b?q=80&w=1000&auto=format&fit=crop')" }}
        >
          <div className="absolute inset-0 bg-[#154f30]/85"></div>
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="bg-white/95 p-3 rounded-2xl mb-4 shadow-xl w-32 h-32 flex items-center justify-center">
              <img 
                src="/shahuraje1.png" 
                alt="शाहूराजे कृषी केंद्र" 
                className="w-full h-full object-contain"
              />
            </div>
            <div className="w-16 h-1 bg-green-400 rounded mb-4"></div>
            <p className="text-xs md:text-sm font-medium text-green-50 leading-relaxed px-4 max-w-sm">
              शेतकऱ्यांचा विश्वास, आमची जबाबदारी.<br/> 
              आधुनिक तंत्रज्ञान आणि उत्कृष्ट खते आता तुमच्या बांधावर...
            </p>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="w-full md:w-1/2 h-3/5 md:h-full p-8 md:p-20 flex flex-col justify-center bg-white overflow-y-auto">
          <div className="max-w-md w-full mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Admin Login</h2>
            <p className="text-gray-500 text-sm mb-6">Enter your credentials to access the admin panel.</p>

            {errorMsg && (
              <div className="bg-red-50 text-red-600 text-xs p-3 rounded-xl border border-red-100 mb-4 font-semibold text-center">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 text-gray-400" size={20} />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@gmail.com" 
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#154f30] focus:ring-1 focus:ring-[#154f30] transition-colors bg-gray-50 focus:bg-white text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 text-gray-400" size={20} />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password" 
                    className="w-full pl-12 pr-12 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#154f30] focus:ring-1 focus:ring-[#154f30] transition-colors bg-gray-50 focus:bg-white text-sm"
                    required
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded text-[#154f30] focus:ring-[#154f30]" 
                  />
                  <span className="text-gray-600 font-medium">Remember me</span>
                </label>
                
                {/* 🔴 Trigger Forgot Password Modal */}
                <button 
                  type="button"
                  onClick={() => {
                    setForgotStep(1);
                    setForgotEmail(email);
                    setModalMsg({ type: '', text: '' });
                    setIsForgotModalOpen(true);
                  }}
                  className="text-[#154f30] font-medium hover:underline cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-[#154f30] text-white py-3.5 rounded-xl font-bold hover:bg-[#1b613c] transition-all shadow-md mt-2 text-base disabled:opacity-50 cursor-pointer"
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* 🔴 Forgot Password Modal Pop-up */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 md:p-8 relative">
            <button 
              onClick={() => setIsForgotModalOpen(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100"
            >
              <X size={20} />
            </button>

            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-[#154f30]/10 text-[#154f30] rounded-xl flex items-center justify-center mx-auto mb-3">
                <KeyRound size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Password Reset करा</h3>
              <p className="text-xs text-gray-500 mt-1">
                {forgotStep === 1 && 'तुमचा नोंदणीकृत ईमेल आयडी प्रविष्ट करा'}
                {forgotStep === 2 && 'ईमेलवर पाठवलेला ६ अंकी OTP टाका'}
                {forgotStep === 3 && 'नवीन सुरक्षित पासवर्ड तयार करा'}
              </p>
            </div>

            {modalMsg.text && (
              <div className={`text-xs p-3 rounded-xl mb-4 font-semibold text-center ${
                modalMsg.type === 'error' 
                  ? 'bg-red-50 text-red-600 border border-red-100' 
                  : 'bg-green-50 text-green-700 border border-green-100 flex items-center justify-center gap-1.5'
              }`}>
                {modalMsg.type === 'success' && <CheckCircle size={14} />}
                {modalMsg.text}
              </div>
            )}

            {/* Step 1: Send OTP Form */}
            {forgotStep === 1 && (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 text-gray-400" size={18} />
                  <input 
                    type="email" 
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="नोंदणीकृत ईमेल आयडी" 
                    className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#154f30] text-sm"
                    required
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={modalLoading}
                  className="w-full bg-[#154f30] text-white py-3 rounded-xl font-bold hover:bg-[#1b613c] transition-all text-sm disabled:opacity-50"
                >
                  {modalLoading ? 'OTP पाठवत आहे...' : 'OTP मिळवा'}
                </button>
              </form>
            )}

            {/* Step 2: Enter OTP Form */}
            {forgotStep === 2 && (
              <div className="space-y-4">
                <div className="relative">
                  <KeyRound className="absolute left-4 top-3.5 text-gray-400" size={18} />
                  <input 
                    type="text" 
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="६ अंकी OTP" 
                    className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#154f30] text-center tracking-widest font-bold text-base"
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <button 
                    type="button" 
                    onClick={() => setForgotStep(1)}
                    className="w-1/3 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold text-sm transition-all"
                  >
                    मागे
                  </button>
                  <button 
                    type="button" 
                    onClick={() => {
                      if (otp.length === 6) setForgotStep(3);
                      else setModalMsg({ type: 'error', text: 'कृपया ६ अंकी OTP टाका.' });
                    }}
                    className="w-2/3 bg-[#154f30] text-white py-3 rounded-xl font-bold hover:bg-[#1b613c] transition-all text-sm"
                  >
                    पुढे जा
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Enter New Password Form */}
            {forgotStep === 3 && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 text-gray-400" size={18} />
                  <input 
                    type={showNewPassword ? "text" : "password"} 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="नवीन पासवर्ड टाका" 
                    className="w-full pl-11 pr-11 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#154f30] text-sm"
                    required
                  />
                  <button 
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600"
                  >
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <button 
                  type="submit" 
                  disabled={modalLoading}
                  className="w-full bg-[#154f30] text-white py-3 rounded-xl font-bold hover:bg-[#1b613c] transition-all text-sm disabled:opacity-50"
                >
                  {modalLoading ? 'पासवर्ड सेव्ह करत आहे...' : 'पासवर्ड सेव्ह करा'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;