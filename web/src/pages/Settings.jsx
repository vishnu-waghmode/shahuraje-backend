import React from 'react';
import { User, MapPin, Phone, Edit, ChevronRight, Lock } from 'lucide-react';

const Settings = () => {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">सेटिंग्ज</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Profile Section */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-start">
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-4">दुकानदार प्रोफाईल</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-gray-600">
                <User size={18} className="text-[#154f30]" />
                <span className="font-medium">शाहूराजे मेटकरी</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <Phone size={18} className="text-[#154f30]" />
                <span>+91 9876543210</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <MapPin size={18} className="text-[#154f30]" />
                <span>मु. पो. सांगोला, जि. सोलापूर</span>
              </div>
            </div>
          </div>
          <button className="text-[#154f30] bg-green-50 px-3 py-1.5 rounded flex items-center gap-2 hover:bg-green-100 transition-colors text-sm font-medium">
            <Edit size={16} />
            <span>बदल करा</span>
          </button>
        </div>

        {/* Toggles Section */}
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-5">दुकानाचे प्राधान्यक्रम</h3>
          <div className="space-y-6">
            
            {/* Toggle 1 */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-800">दुकान ऑनलाईन चालू/बंद</p>
                <p className="text-xs text-gray-500 mt-0.5">सध्या तुमचे दुकान ॲपवर ग्राहकांना दिसत आहे</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#154f30]"></div>
              </label>
            </div>

            {/* Toggle 2 */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-800">TATA रॅलिस झिंक १०% सूट</p>
                <p className="text-xs text-gray-500 mt-0.5">ग्राहकांना ॲपवर १०% सूट दिसेल</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#154f30]"></div>
              </label>
            </div>

            {/* Toggle 3 */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-800">होम डिलिव्हरी</p>
                <p className="text-xs text-gray-500 mt-0.5">ॲपवरून होम डिलिव्हरी ऑर्डर्स स्वीकारणे</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#154f30]"></div>
              </label>
            </div>

            {/* Toggle 4 */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-800">दुकानातून पिकअप (Store Pickup)</p>
                <p className="text-xs text-gray-500 mt-0.5">ग्राहकांना दुकानात येऊन ऑर्डर नेण्याची सुविधा</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#154f30]"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Security / Other */}
        <div className="p-2">
          <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors text-left rounded-lg">
            <div className="flex items-center gap-3 text-gray-800 font-medium">
              <Lock size={18} className="text-[#154f30]" />
              <span>पासवर्ड बदला</span>
            </div>
            <ChevronRight size={20} className="text-gray-400" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;