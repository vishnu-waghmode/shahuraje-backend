import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Leaf, Mail, Lock, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    navigate('/dashboard');
  };

  return (
    // p-0 आणि h-screen मुळे हे पूर्ण स्क्रीनवर दिसेल
    <div className="h-screen w-screen flex items-center justify-center bg-white p-0 m-0 overflow-hidden">
      
      {/* संपूर्ण स्क्रीन व्यापणारे मुख्य कार्ड (कोणताही गॅप किंवा साईड बॉर्डर नाही) */}
      <div className="w-full h-full flex flex-col md:flex-row">
        
        {/* डावीकडील भाग - बॅकग्राऊंड इमेज आणि हिरवा ओव्हरले */}
        <div 
          className="w-full md:w-1/2 h-2/5 md:h-full flex flex-col justify-center items-center text-white p-8 md:p-12 relative bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1589923188900-85dae523342b?q=80&w=1000&auto=format&fit=crop')" }}
        >
          {/* गडद हिरवा ओव्हरले */}
          <div className="absolute inset-0 bg-[#154f30]/85"></div>
          
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="bg-white text-[#154f30] p-4 rounded-full mb-4 shadow-xl">
              <Leaf size={42} />
            </div>
            <h1 className="text-3xl md:text-5xl font-bold mb-2 tracking-wide">शाहूराजे</h1>
            <p className="text-lg md:text-xl text-green-200 mb-4 font-medium">कृषी केंद्र</p>
            
            <div className="w-16 h-1 bg-green-400 rounded mb-4"></div>
            
            <p className="text-xs md:text-sm font-medium text-green-50 leading-relaxed px-4 max-w-sm">
              शेतकऱ्यांचा विश्वास, आमची जबाबदारी.<br/> 
              आधुनिक तंत्रज्ञान आणि उत्कृष्ट खते आता तुमच्या बांधावर...
            </p>
          </div>
        </div>

        {/* उजवीकडील भाग - लॉगिन फॉर्म (पूर्ण स्क्रीन उंचीसह) */}
        <div className="w-full md:w-1/2 h-3/5 md:h-full p-8 md:p-20 flex flex-col justify-center bg-white overflow-y-auto">
          <div className="max-w-md w-full mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Admin Login</h2>
            <p className="text-gray-500 text-sm mb-8">Enter your credentials to access the admin panel.</p>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 text-gray-400" size={20} />
                  <input 
                    type="email" 
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
                  <input type="checkbox" className="rounded text-[#154f30] focus:ring-[#154f30]" />
                  <span className="text-gray-600 font-medium">Remember me</span>
                </label>
                <a href="#" className="text-[#154f30] font-medium hover:underline">Forgot password?</a>
              </div>

              <button 
                type="submit" 
                className="w-full bg-[#154f30] text-white py-3.5 rounded-xl font-bold hover:bg-[#1b613c] transition-all shadow-md mt-4 text-base"
              >
                Login
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;