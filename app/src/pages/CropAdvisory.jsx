import React, { useState } from 'react';
import { IonPage, IonContent } from '@ionic/react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, Image as ImageIcon, Send, Clock, CheckCircle, AlertCircle, Leaf, X } from 'lucide-react';

const CropAdvisory = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('नवीन_तक्रार'); // Tabs: नवीन_तक्रार, जुने_सल्ले
  const [selectedImage, setSelectedImage] = useState(null);
  const [description, setDescription] = useState('');

  // फोटो निवडण्यासाठी
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedImage) {
      alert("कृपया पिकाचा फोटो अपलोड करा.");
      return;
    }
    // इथे आपण नंतर Backend API कॉल करू
    alert("तुमची तक्रार यशस्वीरित्या पाठवली आहे! लवकरच आमचे तज्ज्ञ तुम्हाला औषध सुचवतील.");
    setSelectedImage(null);
    setDescription('');
    setActiveTab('जुने_सल्ले');
  };

  // डमी डेटा (नंतर हा डेटाबेस मधून येईल)
  const pastQueries = [
    {
      id: 1,
      date: '१८ ऑक्टोबर २०२६',
      status: 'सल्ला_दिला',
      desc: 'टोमॅटोच्या पानांवर काळे डाग पडले आहेत.',
      suggestedProduct: 'Amistar Top Fungicide (250ml)',
      price: 850
    },
    {
      id: 2,
      date: '१९ ऑक्टोबर २०२६',
      status: 'प्रलंबित',
      desc: 'कांद्याची पात पिवळी पडत आहे.',
    }
  ];

  return (
    <IonPage>
      <IonContent className="bg-gray-50">
        <div className="w-full min-h-full flex flex-col pb-20">
          
          {/* Header */}
          <div className="bg-[#0c542b] text-white px-4 pt-8 pb-5 shadow-sm sticky top-0 z-20">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate(-1)} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-all">
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-lg font-black tracking-wide">पिकांचा डॉक्टर</h1>
                <p className="text-[11px] text-green-100 mt-0.5">तज्ज्ञांचा मोफत सल्ला</p>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex mt-6 bg-white/10 p-1 rounded-xl">
              <button 
                onClick={() => setActiveTab('नवीन_तक्रार')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'नवीन_तक्रार' ? 'bg-white text-[#0c542b] shadow-sm' : 'text-green-50'}`}
              >
                नवीन प्रश्न विचारा
              </button>
              <button 
                onClick={() => setActiveTab('जुने_सल्ले')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'जुने_सल्ले' ? 'bg-white text-[#0c542b] shadow-sm' : 'text-green-50'}`}
              >
                माझे प्रश्न / सल्ले
              </button>
            </div>
          </div>

          <div className="p-4">
            {activeTab === 'नवीन_तक्रार' ? (
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-4 text-[#0c542b]">
                  <Leaf size={18} />
                  <h2 className="font-bold text-sm">पिकाचा फोटो काढा</h2>
                </div>
                
                <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                  रोगग्रस्त पानाचा किंवा पिकाचा स्पष्ट फोटो काढा म्हणजे आमचे तज्ज्ञ अचूक औषध सुचवू शकतील.
                </p>

                {/* 👉 Image Upload Section (दोन वेगळे ऑप्शन्स) */}
                {!selectedImage ? (
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    {/* Option 1: Live Camera */}
                    <label className="flex flex-col items-center justify-center p-5 border-2 border-dashed border-emerald-300 rounded-2xl bg-emerald-50 hover:bg-emerald-100 active:scale-95 transition-all cursor-pointer">
                      <Camera size={32} className="text-emerald-600 mb-2" />
                      <span className="text-[11px] font-bold text-emerald-800 text-center leading-tight">थेट कॅमेऱ्यातून<br/>फोटो काढा</span>
                      {/* capture="environment" मुळे थेट मोबाईलचा कॅमेरा उघडतो */}
                      <input type="file" accept="image/*" capture="environment" onChange={handleImageChange} className="hidden" />
                    </label>

                    {/* Option 2: Gallery */}
                    <label className="flex flex-col items-center justify-center p-5 border-2 border-dashed border-blue-300 rounded-2xl bg-blue-50 hover:bg-blue-100 active:scale-95 transition-all cursor-pointer">
                      <ImageIcon size={32} className="text-blue-600 mb-2" />
                      <span className="text-[11px] font-bold text-blue-800 text-center leading-tight">गॅलरीमधून<br/>फोटो निवडा</span>
                      <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                    </label>
                  </div>
                ) : (
                  // फोटो निवडल्यानंतरचे दृश्य
                  <div className="relative w-full h-56 rounded-2xl overflow-hidden border border-gray-200 shadow-inner">
                    <img src={selectedImage} alt="Crop" className="w-full h-full object-cover" />
                    {/* कॅन्सल किंवा बदलण्याचे बटण */}
                    <button 
                      onClick={() => setSelectedImage(null)}
                      className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg text-red-500 hover:bg-red-50 active:scale-90 transition-all"
                    >
                      <X size={20} />
                    </button>
                    <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm text-white text-[10px] px-3 py-1 rounded-full">
                      ✅ फोटो जोडला
                    </div>
                  </div>
                )}

                {/* Description */}
                <div className="mt-5">
                  <label className="block text-xs font-bold text-gray-700 mb-2">पिकाची समस्या (ऐच्छिक / Optional)</label>
                  <textarea 
                    rows="3" 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="उदा. टोमॅटोची पाने पिवळी पडत आहेत..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#0c542b] focus:border-transparent outline-none"
                  ></textarea>
                </div>

                <button 
                  onClick={handleSubmit}
                  className="w-full mt-6 bg-[#0c542b] text-white py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md hover:bg-[#083a1d] active:scale-95 transition-all"
                >
                  <Send size={16} /> तज्ज्ञांना पाठवा
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {pastQueries.map(query => (
                  <div key={query.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start mb-3">
                      <div className="text-[10px] font-bold text-gray-400">{query.date}</div>
                      {query.status === 'सल्ला_दिला' ? (
                        <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 bg-green-50 text-green-700 rounded-md">
                          <CheckCircle size={12} /> सल्ला उपलब्ध
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 bg-amber-50 text-amber-700 rounded-md">
                          <Clock size={12} /> तपासणी सुरु
                        </span>
                      )}
                    </div>
                    
                    <p className="text-xs text-gray-700 font-medium leading-relaxed mb-4">
                      "{query.desc}"
                    </p>

                    {query.status === 'सल्ला_दिला' && (
                      <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100">
                        <div className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider mb-2">तज्ज्ञांनी सुचवलेले औषध:</div>
                        <h3 className="font-black text-sm text-[#0c542b]">{query.suggestedProduct}</h3>
                        <div className="flex justify-between items-center mt-3">
                          <span className="text-xs font-bold text-gray-800">₹{query.price}</span>
                          <button className="bg-[#0c542b] text-white text-[10px] font-bold px-4 py-2 rounded-lg active:scale-95 transition-all shadow-sm">
                            कार्टमध्ये टाका
                          </button>
                        </div>
                      </div>
                    )}

                    {query.status === 'प्रलंबित' && (
                      <div className="bg-gray-50 rounded-xl p-3 flex items-start gap-2 border border-gray-100">
                        <AlertCircle size={14} className="text-gray-400 mt-0.5" />
                        <p className="text-[10px] text-gray-500 leading-relaxed font-medium">आमचे कृषी तज्ज्ञ तुमच्या फोटोची पाहणी करत आहेत. लवकरच तुम्हाला इथे योग्य औषध सुचवले जाईल.</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default CropAdvisory;