import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IonPage } from '@ionic/react';
import { Fingerprint } from 'lucide-react';
import { verifyAppMpin, unlockApp, setAppMpin } from '../mpinStorage';
import { isBiometricAvailable, authenticateWithBiometrics } from '../biometricAuth';

const MpinScreen = ({ isSettingUp = false }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // फिंगरप्रिंट ऑथेंटिकेशन
  const handleBiometricClick = async (e) => {
    if (e) e.stopPropagation();
    setError('');
    try {
      const available = await isBiometricAvailable();
      if (!available) {
        setError('या मोबाईलवर फिंगरप्रिंट उपलब्ध नाही किंवा नोंदवलेला नाही.');
        return;
      }
      const success = await authenticateWithBiometrics();
      if (success) {
        unlockApp();
        navigate('/home', { replace: true });
      } else {
        setError('फिंगरप्रिंट जुळला नाही. कृपया MPIN वापरा.');
      }
    } catch (err) {
      console.error('Biometric error:', err);
      setError('फिंगरप्रिंटमध्ये अडचण आली. कृपया MPIN टाका.');
    }
  };

  // नंबर दाबल्यावर
  const handleKeyPress = (num) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      if (newPin.length === 4) {
        validatePin(newPin);
      }
    }
  };

  // एक नंबर पुसणे (हटवा)
  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
    setError('');
  };

  // पिन तपासणी
  const validatePin = (finalPin) => {
    if (isSettingUp) {
      setAppMpin(finalPin);
      unlockApp();
      navigate('/home', { replace: true });
    } else {
      if (verifyAppMpin(finalPin)) {
        unlockApp();
        navigate('/home', { replace: true });
      } else {
        setError('चुकीचा MPIN! पुन्हा प्रयत्न करा.');
        setPin('');
      }
    }
  };

  return (
    <IonPage>
      {/* थेट संपूर्ण स्क्रीनवर फुल-कंट्रोल कंटेनर */}
      <div 
        className="fixed inset-0 w-full h-full bg-slate-50 flex flex-col items-center justify-between py-8 px-6 z-50 overflow-y-auto"
        style={{
          paddingTop: 'calc(env(safe-area-inset-top) + 20px)',
          paddingBottom: 'calc(env(safe-area-inset-bottom) + 20px)'
        }}
      >
        
        {/* १. वरचा भाग: लोगो आणि शीर्षक */}
        <div className="flex flex-col items-center text-center mt-2">
          <img
            src="/shahuraje1.png"
            alt="शाहूराजे"
            className="w-20 h-20 mb-3 object-contain pointer-events-none"
          />
          <h2 className="text-xl font-bold text-gray-800">
            {isSettingUp ? 'नवीन MPIN सेट करा' : ' MPIN टाका'}
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            {isSettingUp 
              ? 'पुढील लॉगिनसाठी ४ अंकी पिन निवडा' 
              : 'सुरक्षित लॉगिनसाठी पिन टाका किंवा फिंगरप्रिंट वापरा'}
          </p>

          {/* पिनचे ४ ठिपके */}
          <div className="flex justify-center gap-4 mt-6 mb-2">
            {[0, 1, 2, 3].map((idx) => (
              <div
                key={idx}
                className={`w-4 h-4 rounded-full border-2 transition-all ${
                  pin.length > idx
                    ? 'bg-[#0c542b] border-[#0c542b] scale-110'
                    : 'border-gray-300 bg-white'
                }`}
              />
            ))}
          </div>

          {/* एरर मेसेज */}
          {error && (
            <p className="text-red-500 text-xs mt-2 font-semibold px-2">
              {error}
            </p>
          )}
        </div>

        {/* २. मधला भाग: रिअल टच कीपॅड */}
        <div className="w-full max-w-xs my-auto">
          <div className="grid grid-cols-3 gap-y-4 gap-x-6 justify-items-center">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
              <button
                key={digit}
                type="button"
                onPointerDown={() => handleKeyPress(digit)}
                className="w-16 h-16 rounded-full bg-white text-gray-800 text-2xl font-bold shadow-md active:bg-gray-200 active:scale-90 transition-transform flex items-center justify-center border border-gray-100 touch-manipulation cursor-pointer select-none"
              >
                {digit}
              </button>
            ))}

            {/* फिंगरप्रिंट बटण */}
            {!isSettingUp ? (
              <button
                type="button"
                onPointerDown={handleBiometricClick}
                className="w-16 h-16 rounded-full bg-green-50 text-[#0c542b] border border-green-200 shadow-md active:bg-green-100 active:scale-90 transition-transform flex items-center justify-center touch-manipulation cursor-pointer"
                title="फिंगरप्रिंट"
              >
                <Fingerprint size={28} />
              </button>
            ) : (
              <div className="w-16 h-16" />
            )}

            {/* शून्य (0) */}
            <button
              type="button"
              onPointerDown={() => handleKeyPress('0')}
              className="w-16 h-16 rounded-full bg-white text-gray-800 text-2xl font-bold shadow-md active:bg-gray-200 active:scale-90 transition-transform flex items-center justify-center border border-gray-100 touch-manipulation cursor-pointer select-none"
            >
              0
            </button>

            {/* हटवा */}
            <button
              type="button"
              onPointerDown={handleDelete}
              className="w-16 h-16 rounded-full bg-gray-100 text-gray-700 text-xs font-bold shadow-sm active:bg-gray-200 active:scale-90 transition-transform flex items-center justify-center border border-gray-200 touch-manipulation cursor-pointer select-none"
            >
              हटवा
            </button>
          </div>
        </div>

        {/* ३. तळाचा भाग: दुसरा मोबाईल नंबर */}
        {!isSettingUp && (
          <div className="w-full text-center pb-2">
            <button
              type="button"
              onClick={() => {
                localStorage.clear();
                navigate('/login', { replace: true });
              }}
              className="text-xs text-[#0c542b] font-semibold underline p-2 touch-manipulation cursor-pointer"
            >
              दुसऱ्या मोबाईल नंबरने लॉगिन करा
            </button>
          </div>
        )}

      </div>
    </IonPage>
  );
};

export default MpinScreen;