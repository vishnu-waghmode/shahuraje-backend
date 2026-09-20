import React, { useState } from 'react';
import { IonPage, IonContent } from '@ionic/react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react'; 

const Register = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const response = await fetch('https://shahuraje-backend.onrender.com/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone,
          password
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert('नोंदणी यशस्वी झाली! आता लॉगिन करा.');
        navigate('/login');
      } else {
        setErrorMsg(data.error || 'नोंदणी करताना अडचण आली.');
      }
    } catch (error) {
      console.error('Register Error:', error);
      setErrorMsg('सर्व्हरशी संपर्क होऊ शकला नाही. कृपया सर्व्हर तपासा.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <IonContent fullscreen className="bg-white">
        <div className="w-full h-full flex flex-col justify-between px-6 py-6 overflow-y-auto">
          
          <div>
            <button 
              onClick={() => navigate('/login')}
              className="flex items-center text-[#0c542b] font-bold text-sm mb-1 hover:underline"
            >
              <ArrowLeft size={18} className="mr-1" /> मागे जा
            </button>
          </div>

          {/* शीर्ष भाग: शाहूराजे ब्रँड लोगो */}
          <div className="flex flex-col items-center text-center mt-1">
            <div className="w-48 max-w-[65%] drop-shadow-md flex items-center justify-center">
              <img 
                src="/shahuraje1.png" 
                alt="शाहूराजे कृषी केंद्र" 
                className="w-full h-auto object-contain"
              />
            </div>
            
            <p className="text-xs font-bold text-[#78350F] mt-1 tracking-wide">
              शेतकऱ्यांचा विश्वास, आमची जबाबदारी...
            </p>
          </div>

          {/* मध्य भाग: फॉर्म */}
          <div className="my-auto w-full max-w-sm mx-auto py-3">
            <div className="text-center mb-4">
              <h3 className="text-2xl font-black text-gray-900 mb-1">नवीन खाते तयार करा</h3>
              <p className="text-sm font-semibold text-gray-500">शेतकरी नोंदणी फॉर्म</p>
            </div>

            {errorMsg && (
              <div className="bg-red-50 text-red-600 text-xs p-3 rounded-xl border border-red-100 mb-3 font-semibold text-center">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-3">
              <div className="relative flex items-center">
                <span className="absolute left-4 text-gray-400">
                  <User size={20} />
                </span>
                <input 
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="पूर्ण नाव"
                  className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#0c542b] shadow-sm text-base"
                  required
                />
              </div>

              <div className="relative flex items-center">
                <span className="absolute left-4 text-gray-400">
                  <Mail size={20} />
                </span>
                <input 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ईमेल आयडी"
                  className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#0c542b] shadow-sm text-base"
                  required
                />
              </div>

              <div className="relative flex items-center">
                <span className="absolute left-4 text-gray-400">
                  <Phone size={20} />
                </span>
                <input 
                  type="tel"
                  maxLength="10"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="मोबाईल नंबर"
                  className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#0c542b] shadow-sm text-base"
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
                  placeholder="पासवर्ड तयार करा"
                  className="w-full pl-12 pr-12 py-3 bg-white border border-gray-200 rounded-xl font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#0c542b] shadow-sm text-base"
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

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-[#0c542b] hover:bg-[#083a1d] active:scale-95 transition-all text-white py-3.5 rounded-xl font-bold text-lg shadow-md tracking-wider mt-2 disabled:opacity-50"
              >
                {loading ? 'नोंदणी होत आहे...' : 'नोंदणी करा'}
              </button>
            </form>
          </div>

          {/* तळाचा भाग: लॉगिन लिंक */}
          <div className="text-center pb-2">
            <p className="text-xs font-semibold text-gray-500">
              आधीपासून खाते आहे का?{' '}
              <span 
                onClick={() => navigate('/login')} 
                className="text-[#0c542b] font-bold cursor-pointer hover:underline"
              >
                लॉगिन करा
              </span>
            </p>
          </div>

        </div>
      </IonContent>
    </IonPage>
  );
};

export default Register;