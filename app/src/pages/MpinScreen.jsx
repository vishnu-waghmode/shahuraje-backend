import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IonPage, IonContent } from '@ionic/react';
import { Fingerprint } from 'lucide-react';
import { verifyAppMpin, unlockApp, setAppMpin } from '../mpinStorage';
import { isBiometricAvailable, authenticateWithBiometrics } from '../biometricAuth';

const MpinScreen = ({ isSettingUp = false }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [hasBiometrics, setHasBiometrics] = useState(false);
  const navigate = useNavigate();

  // स्क्रीन उघडल्यावर फिंगरप्रिंट उपलब्ध असल्यास ऑटोमॅटिक स्कॅनर उघडा
  useEffect(() => {
    if (!isSettingUp) {
      isBiometricAvailable().then((available) => {
        setHasBiometrics(available);
        if (available) {
          triggerBiometricAuth();
        }
      });
    }
  }, [isSettingUp]);

  const triggerBiometricAuth = async () => {
    const success = await authenticateWithBiometrics();
    if (success) {
      unlockApp();
      navigate('/home', { replace: true });
    }
  };

  const handleKeyPress = (num) => {
    if (pin.length < 4) {
      const updatedPin = pin + num;
      setPin(updatedPin);
      if (updatedPin.length === 4) {
        processPin(updatedPin);
      }
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
    setError('');
  };

  const processPin = (finalPin) => {
    if (isSettingUp) {
      setAppMpin(finalPin);
      unlockApp();
      navigate('/home', { replace: true });
    } else {
      if (verifyAppMpin(finalPin)) {
        unlockApp();
        navigate('/home', { replace: true });
      } else {
        setError('चुकीचा पिन! कृपया पुन्हा प्रयत्न करा.');
        setPin('');
      }
    }
  };

  return (
    <IonPage>
      <IonContent fullscreen className="ion-padding">
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-6 select-none">
          <div className="w-full max-w-xs text-center">
            <img
              src="/shahuraje1.png"
              alt="शाहूराजे"
              className="w-20 h-20 mx-auto mb-4 object-contain"
            />
            <h2 className="text-xl font-bold text-gray-800">
              {isSettingUp ? 'नवीन MPIN सेट करा' : 'शाहूराजे MPIN टाका'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {isSettingUp ? 'पुढील लॉगिनसाठी ४ अंकी पिन निवडा' : 'सुरक्षित लॉगिनसाठी पिन टाका किंवा फिंगरप्रिंट वापरा'}
            </p>

            {/* पिनचे ४ ठिपके */}
            <div className="flex justify-center gap-4 my-7">
              {[0, 1, 2, 3].map((idx) => (
                <div
                  key={idx}
                  className={`w-4 h-4 rounded-full border-2 transition-all ${
                    pin.length > idx
                      ? 'bg-emerald-600 border-emerald-600 scale-110'
                      : 'border-gray-300 bg-white'
                  }`}
                />
              ))}
            </div>

            {error && <p className="text-red-500 text-xs mb-4 font-medium">{error}</p>}

            {/* नंबर पॅड (Keypad) */}
            <div className="grid grid-cols-3 gap-4 mb-5">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                <button
                  key={digit}
                  type="button"
                  onClick={() => handleKeyPress(digit)}
                  className="w-16 h-16 rounded-full bg-white shadow text-xl font-semibold text-gray-700 active:bg-gray-200 mx-auto flex items-center justify-center"
                >
                  {digit}
                </button>
              ))}

              {/* डाव्या बाजूला फिंगरप्रिंटचे बटण (फक्त लॉगिन स्क्रीनवर) */}
              {!isSettingUp && hasBiometrics ? (
                <button
                  type="button"
                  onClick={triggerBiometricAuth}
                  className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-700 shadow mx-auto flex items-center justify-center active:bg-emerald-100"
                  title="फिंगरप्रिंट वापरा"
                >
                  <Fingerprint size={28} />
                </button>
              ) : (
                <div className="w-16 h-16" />
              )}

              <button
                type="button"
                onClick={() => handleKeyPress('0')}
                className="w-16 h-16 rounded-full bg-white shadow text-xl font-semibold text-gray-700 active:bg-gray-200 mx-auto flex items-center justify-center"
              >
                0
              </button>

              <button
                type="button"
                onClick={handleDelete}
                className="w-16 h-16 rounded-full bg-gray-100 shadow text-sm font-semibold text-gray-600 active:bg-gray-200 mx-auto flex items-center justify-center"
              >
                हटवा
              </button>
            </div>

            {!isSettingUp && (
              <button
                type="button"
                onClick={() => {
                  localStorage.clear();
                  navigate('/login', { replace: true });
                }}
                className="text-xs text-emerald-700 underline font-medium"
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