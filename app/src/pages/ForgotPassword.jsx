import React, { useState } from 'react';
import { IonPage, IonContent } from '@ionic/react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, KeyRound, ArrowLeft, Eye, EyeOff } from 'lucide-react';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  // स्टेप १: OTP पाठवणे
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg({ type: '', text: '' });

    try {
      const res = await fetch('http://192.168.1.42:5000/api/users/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (res.ok) {
        setStep(2);
        setMsg({ type: 'success', text: 'OTP तुमच्या ईमेलवर पाठवला आहे!' });
      } else {
        setMsg({ type: 'error', text: data.error || 'अडचण आली.' });
      }
    } catch (err) {
      setMsg({ type: 'error', text: 'सर्व्हरशी संपर्क होऊ शकला नाही.' });
    } finally {
      setLoading(false);
    }
  };

  // स्टेप २ आणि ३: OTP व पासवर्ड बदलणे
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg({ type: '', text: '' });

    try {
      const res = await fetch('http://192.168.1.42:5000/api/users/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword })
      });
      const data = await res.json();
      if (res.ok) {
        alert('पासवर्ड यशस्वीरीत्या बदलला! आता नवीन पासवर्डने लॉगिन करा.');
        navigate('/login');
      } else {
        setMsg({ type: 'error', text: data.error || 'अडचण आली.' });
      }
    } catch (err) {
      setMsg({ type: 'error', text: 'सर्व्हरशी संपर्क होऊ शकला नाही.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <IonContent fullscreen className="bg-white">
        <div className="w-full h-full flex flex-col justify-between px-6 py-8">
          <div>
            <button 
              onClick={() => (step > 1 ? setStep(step - 1) : navigate('/login'))}
              className="flex items-center text-[#0c542b] font-bold text-sm mb-6 hover:underline"
            >
              <ArrowLeft size={18} className="mr-1" /> मागे जा
            </button>

            <div className="text-center mb-8">
              <div className="w-14 h-14 bg-[#0c542b]/10 text-[#0c542b] rounded-2xl flex items-center justify-center mx-auto mb-3">
                <KeyRound size={28} />
              </div>
              <h2 className="text-2xl font-black text-gray-900">पासवर्ड रीसेट करा</h2>
              <p className="text-xs text-gray-500 mt-1">
                {step === 1 && 'नोंदणीकृत ईमेल आयडी प्रविष्ट करा'}
                {step === 2 && 'ईमेलवर पाठवलेला ६ अंकी OTP टाका'}
                {step === 3 && 'तुमचा नवीन पासवर्ड तयार करा'}
              </p>
            </div>

            {msg.text && (
              <div className={`text-xs p-3 rounded-xl mb-4 font-semibold text-center ${
                msg.type === 'error' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-700 border border-green-100'
              }`}>
                {msg.text}
              </div>
            )}

            {/* स्टेप १: ईमेल फॉर्म */}
            {step === 1 && (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div className="relative flex items-center">
                  <span className="absolute left-4 text-gray-400">
                    <Mail size={20} />
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="नोंदणीकृत ईमेल आयडी"
                    className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl text-base text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#0c542b]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#0c542b] hover:bg-[#083a1d] text-white py-3.5 rounded-xl font-bold text-base shadow-md disabled:opacity-50 transition-all"
                >
                  {loading ? 'OTP पाठवत आहे...' : 'OTP मिळवा'}
                </button>
              </form>
            )}

            {/* स्टेप २: OTP फॉर्म */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="relative flex items-center">
                  <span className="absolute left-4 text-gray-400">
                    <KeyRound size={20} />
                  </span>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="६ अंकी OTP"
                    className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl text-base text-gray-800 tracking-widest text-center font-bold focus:outline-none focus:border-[#0c542b]"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (otp.length === 6) setStep(3);
                    else setMsg({ type: 'error', text: 'कृपया ६ अंकी OTP टाका.' });
                  }}
                  className="w-full bg-[#0c542b] hover:bg-[#083a1d] text-white py-3.5 rounded-xl font-bold text-base shadow-md transition-all"
                >
                  पुढे जा
                </button>
              </div>
            )}

            {/* स्टेप ३: नवीन पासवर्ड फॉर्म */}
            {step === 3 && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="relative flex items-center">
                  <span className="absolute left-4 text-gray-400">
                    <Lock size={20} />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="नवीन पासवर्ड टाका"
                    className="w-full pl-12 pr-12 py-3.5 bg-white border border-gray-200 rounded-xl text-base text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#0c542b]"
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
                  className="w-full bg-[#0c542b] hover:bg-[#083a1d] text-white py-3.5 rounded-xl font-bold text-base shadow-md disabled:opacity-50 transition-all"
                >
                  {loading ? 'पासवर्ड बदलत आहे...' : 'पासवर्ड सेव्ह करा'}
                </button>
              </form>
            )}
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default ForgotPassword;