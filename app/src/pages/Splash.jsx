import React from 'react';
import { IonPage, IonContent } from '@ionic/react';
import { useNavigate } from 'react-router-dom';
import { checkHasMpin, isAppLocked } from '../mpinStorage';

const Splash = () => {
  const navigate = useNavigate();

  const handleStart = () => {
    const token = localStorage.getItem('token');
    const hasMpin = checkHasMpin();
    const locked = isAppLocked();

    if (token) {
      if (hasMpin && locked) {
        // युझर लॉगिन आहे पण ॲप लॉक आहे -> थेट MPIN स्क्रीन
        navigate('/mpin', { replace: true });
      } else if (!hasMpin) {
        // लॉगिन आहे पण MPIN सेट केला नाही -> सेटअप MPIN स्क्रीन
        navigate('/setup-mpin', { replace: true });
      } else {
        // सर्व बरोबर असेल तर थेट होम स्क्रीन
        navigate('/home', { replace: true });
      }
    } else {
      // प्रथमच उघडले असल्यास लॉगिन स्क्रीन
      navigate('/login');
    }
  };

  return (
    <IonPage>
      <IonContent fullscreen className="relative overflow-hidden">
        {/* १. मूळ बॅकग्राऊंड फोटो */}
        <div 
          className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat z-0"
          style={{ backgroundImage: "url('/splash.png')" }}
        ></div>

        {/* २. मुख्य घटक आणि मजकूर */}
        <div className="relative z-10 w-full h-full flex flex-col justify-between pt-16 pb-8 px-6">
          
          {/* शीर्ष भाग */}
          <div className="relative flex flex-col items-center text-center">
            <div className="absolute top-2 w-80 h-[300px] bg-white/80 rounded-full blur-3xl pointer-events-none -z-10"></div>

            <div className="w-64 max-w-[75%] mb-4 drop-shadow-md flex items-center justify-center">
              <img 
                src="/shahuraje1.png" 
                alt="शाहूराजे कृषी केंद्र" 
                className="w-full h-auto object-contain"
              />
            </div>
            
            <p className="text-[1.3rem] font-bold text-[#78350F] leading-[1.6] drop-shadow-sm -mt-2">
              शेतकऱ्यांचा विश्वास, <br /> आमची जबाबदारी...
            </p>
          </div>

          {/* तळाचा भाग */}
          <div className="w-full px-2 mb-2">
            <button 
              onClick={handleStart}
              className="w-full bg-[#0c542b] hover:bg-[#084224] active:scale-95 transition-all text-white py-4 rounded-2xl font-Arial text-xl shadow-[0_8px_20px_rgba(12,84,43,0.4)] tracking-wide"
            >
              चला सुरू करूया
            </button>
          </div>

        </div>
      </IonContent>
    </IonPage>
  );
};

export default Splash;