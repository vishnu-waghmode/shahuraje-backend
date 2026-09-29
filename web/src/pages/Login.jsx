import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // पेज उघडताच सेव्ह केलेले credentials चेक करणे (Remember Me)
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
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Remember me चेक केले असल्यास सेव्ह करणे
        if (rememberMe) {
          localStorage.setItem('remembered_email', email);
          localStorage.setItem('remembered_password', password);
        } else {
          localStorage.removeItem('remembered_email');
          localStorage.removeItem('remembered_password');
        }

        // डॅशबोर्ड किंवा होम पेजवर पाठवणे
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

  return (
    // p-0 आणि h-screen मुळे हे पूर्ण स्क्रीनवर दिसेल
    <div className="h-screen w-screen flex items-center justify-center bg-white p-0 m-0 overflow-hidden">
      
      {/* संपूर्ण स्क्रीन व्यापणारे मुख्य कार्ड */}
      <div className="w-full h-full flex flex-col md:flex-row">
        
        {/* डावीकडील भाग - बॅकग्राऊंड इमेज, हिरवा ओव्हरले आणि तुमचा लोगो */}
        <div 
          className="w-full md:w-1/2 h-2/5 md:h-full flex flex-col justify-center items-center text-white p-8 md:p-12 relative bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1589923188900-85dae523342b?q=80&w=1000&auto=format&fit=crop')" }}
        >
          {/* गडद हिरवा ओव्हरले */}
          <div className="absolute inset-0 bg-[#154f30]/85"></div>
          
          <div className="relative z-10 flex flex-col items-center text-center">
            {/* Shahuraje Logo */}
            <div className="bg-white/95 p-3 rounded-2xl mb-4 shadow-xl w-32 h-32 flex items-center justify-center">
              <img 
                src="/shahuraje1.png" 
                alt="शाहूराजे कृषी केंद्र" 
                className="w-full h-full object-contain"
              />
            </div>

            {/* <h1 className="text-3xl md:text-5xl font-bold mb-2 tracking-wide">शाहूराजे</h1>
            <p className="text-lg md:text-xl text-green-200 mb-4 font-medium">कृषी केंद्र</p> */}
            
            <div className="w-16 h-1 bg-green-400 rounded mb-4"></div>
            
            <p className="text-xs md:text-sm font-medium text-green-50 leading-relaxed px-4 max-w-sm">
              शेतकऱ्यांचा विश्वास, आमची जबाबदारी.<br/> 
              आधुनिक तंत्रज्ञान आणि उत्कृष्ट खते आता तुमच्या बांधावर...
            </p>
          </div>
        </div>

        {/* उजवीकडील भाग - लॉगिन फॉर्म */}
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
                    className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600 focus:outline-none"
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
                <a href="#" className="text-[#154f30] font-medium hover:underline">Forgot password?</a>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-[#154f30] text-white py-3.5 rounded-xl font-bold hover:bg-[#1b613c] transition-all shadow-md mt-2 text-base disabled:opacity-50"
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;