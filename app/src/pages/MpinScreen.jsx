import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IonPage, IonContent } from '@ionic/react';
import { Fingerprint } from 'lucide-react';
import { verifyAppMpin, unlockApp, setAppMpin } from '../mpinStorage';
import { isBiometricAvailable, authenticateWithBiometrics } from '../biometricAuth';

const MpinScreen = ({ isSettingUp = false }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // फिंगरप्रिंट स्कॅनिंग सुरू करणे
  const handleBiometricClick = async () => {
    try {
      const available = await isBiometricAvailable();
      if (!available) {
        setError('या फोनवर बायोमेट्रिक/फिंगरप्रिंट उपलब्ध नाही किंवा सेट नाही.');
        return;
      }
      const success = await authenticateWithBiometrics();
      if (success) {
        unlockApp();
        navigate('/home', { replace: true });
      }
    } catch (err) {
      console.error('Biometric error:', err);
      setError('फिंगरप्रिंट प्रमाणीकरण अयशस्वी.');
    }
  };

  // स्क्रीन लोड झाल्यावर आपोआप फिंगरप्रिंट उघडणे (पर्यायी)
  useEffect(() => {
    if (!isSettingUp) {
      isBiometricAvailable().then((available) => {
        if (available) {
          handleBiometricClick();
        }
      }).catch(() => {});
    }
  }, [isSettingUp]);

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
      <IonContent fullscreen className="ion-padding bg-slate-50">
        <div className="flex flex-col items-center justify-center min-h-screen py-6 px-4">
          <div className="w-full max-w-xs text-center flex flex-col items-center">
            
            {/* ब्रँड लोगो */}
            <img
              src="/shahuraje1.png"
              alt="शाहूराजे"
              className="w-20 h-20 mb-3 object-contain"
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
            <div className="flex justify-center gap-4 my-6">
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
              <p className="text-red-500 text-xs mb-4 font-semibold px-2">
                {error}
              </p>
            )}

            {/* नंबर कीपॅड (Keypad) */}
            <div className="grid grid-cols-3 gap-4 mb-6 w-full justify-items-center">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                <button
                  key={digit}
                  type="button"
                  onClick={() => handleKeyPress(digit)}
                  className="w-16 h-16 rounded-full bg-white text-gray-800 text-2xl font-bold shadow-md active:bg-gray-200 active:scale-95 transition-all flex items-center justify-center border border-gray-100"
                >
                  {digit}
                </button>
              ))}

              {/* १. फिंगरप्रिंट बटण (० च्या डाव्या बाजूला कायम दिसेल) */}
              {!isSettingUp ? (
                <button
                  type="button"
                  onClick={handleBiometricClick}
                  className="w-16 h-16 rounded-full bg-green-50 text-[#0c542b] border border-green-200 shadow-md active:bg-green-100 active:scale-95 transition-all flex items-center justify-center"
                >
                  <Fingerprint size={28} />
                </button>
              ) : (
                <div className="w-16 h-16" />
              )}

              {/* २. शून्य (0) */}
              <button
                type="button"
                onClick={() => handleKeyPress('0')}
                className="w-16 h-16 rounded-full bg-white text-gray-800 text-2xl font-bold shadow-md active:bg-gray-200 active:scale-95 transition-all flex items-center justify-center border border-gray-100"
              >
                0
              </button>

              {/* ३. हटवा (Backspace/Delete) */}
              <button
                type="button"
                onClick={handleDelete}
                className="w-16 h-16 rounded-full bg-gray-100 text-gray-700 text-xs font-bold shadow-sm active:bg-gray-200 active:scale-95 transition-all flex items-center justify-center border border-gray-200"
              >
                हटवा
              </button>
            </div>

            {/* दुसऱ्या नंबरने लॉगिन करण्याचा पर्याय */}
            {!isSettingUp && (
              <button
                type="button"
                onClick={() => {
                  localStorage.clear();
                  navigate('/login', { replace: true });
                }}
                className="text-xs text-[#0c542b] font-semibold underline p-2 mt-2"
              >
                दुसऱ्या मोबाईल नंबरने लॉगिन करा
              </button>
            )}

          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default MpinScreen;