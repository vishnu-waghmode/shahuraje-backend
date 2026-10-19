import React, { useState, useEffect } from 'react';
import { IonPage, IonContent } from '@ionic/react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, Image as ImageIcon, Send, Clock, CheckCircle, AlertCircle, Leaf, X, Loader2 } from 'lucide-react';

const CropAdvisory = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('नवीन_तक्रार'); // Tabs: नवीन_तक्रार, जुने_सल्ले
  const [selectedImage, setSelectedImage] = useState(null); // दाखवण्यासाठी
  const [base64Image, setBase64Image] = useState(null); // Backend ला पाठवण्यासाठी
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false); // फॉर्म सबमिट होताना लोडिंगसाठी
  const [pastQueries, setPastQueries] = useState([]); // डेटाबेसमधून येणारे जुने सल्ले
  const [fetchingHistory, setFetchingHistory] = useState(false);

  // 👉 सुरक्षितपणे युझर ID घेणे
  const savedUser = JSON.parse(localStorage.getItem('user') || 'null');
  const userId = savedUser?._id || savedUser?.id;

  // १. फोटो निवडणे आणि Base64 मध्ये बदलणे
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // ॲपमध्ये दाखवण्यासाठी URL
      setSelectedImage(URL.createObjectURL(file));

      // Backend ला पाठवण्यासाठी Base64
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        setBase64Image(reader.result);
      };
    }
  };

  // २. बॅकएंडला फोटो आणि माहिती पाठवणे
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedImage || !base64Image) {
      alert("कृपया पिकाचा फोटो अपलोड करा.");
      return;
    }
    if (!userId) {
      alert("सुरक्षेसाठी कृपया आधी ॲपमध्ये लॉगिन करा.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('https://shahuraje-backend-1.onrender.com/api/advisory/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: userId, 
          description: description, 
          imageBase64: base64Image 
        })
      });

      const data = await response.json();

      if (data.success) {
        alert("तुमची तक्रार यशस्वीरित्या पाठवली आहे! लवकरच आमचे तज्ज्ञ तुम्हाला औषध सुचवतील.");
        setSelectedImage(null);
        setBase64Image(null);
        setDescription('');
        setActiveTab('जुने_सल्ले'); // फोटो गेल्यावर ऑटोमॅटिक जुन्या सल्ल्यांवर जाणे
      } else {
        alert("फोटो पाठवताना अडचण आली: " + data.error);
      }
    } catch (error) {
      alert("सर्वर एरर, कृपया थोड्या वेळाने प्रयत्न करा.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // ३. डेटाबेसमधून जुने सल्ले (History) आणणे
  useEffect(() => {
    const fetchHistory = async () => {
      if (!userId || activeTab !== 'जुने_सल्ले') return;
      setFetchingHistory(true);
      try {
        const response = await fetch(`https://shahuraje-backend-1.onrender.com/api/advisory/user/${userId}`);
        const data = await response.json();
        if (data.success) {
          setPastQueries(data.data);
        }
      } catch (error) {
        console.error("Error fetching history:", error);
      } finally {
        setFetchingHistory(false);
      }
    };

    fetchHistory();
  }, [activeTab, userId]);

  // तारीख मराठीत फॉरमॅट करण्यासाठी
  const formatDate = (dateString) => {
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('mr-IN', options);
  };

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

                {/* 👉 Image Upload Section */}
                {!selectedImage ? (
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    {/* Live Camera */}
                    <label className="flex flex-col items-center justify-center p-5 border-2 border-dashed border-emerald-300 rounded-2xl bg-emerald-50 hover:bg-emerald-100 active:scale-95 transition-all cursor-pointer">
                      <Camera size={32} className="text-emerald-600 mb-2" />
                      <span className="text-[11px] font-bold text-emerald-800 text-center leading-tight">थेट कॅमेऱ्यातून<br/>फोटो काढा</span>
                      <input type="file" accept="image/*" capture="environment" onChange={handleImageChange} className="hidden" />
                    </label>

                    {/* Gallery */}
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
                    <button 
                      onClick={() => { setSelectedImage(null); setBase64Image(null); }}
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

                {/* 👉 Submit Button with Loader */}
                <button 
                  onClick={handleSubmit}
                  disabled={loading || !selectedImage}
                  className={`w-full mt-6 text-white py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all ${loading || !selectedImage ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#0c542b] hover:bg-[#083a1d] active:scale-95'}`}
                >
                  {loading ? (
                    <><Loader2 size={16} className="animate-spin" /> फोटो पाठवत आहे...</>
                  ) : (
                    <><Send size={16} /> तज्ज्ञांना पाठवा</>
                  )}
                </button>
              </div>
            ) : (
              // 👉 जुने सल्ले टॅब (History)
              <div className="space-y-4">
                {fetchingHistory ? (
                  <div className="flex flex-col items-center justify-center py-10 text-[#0c542b]">
                    <Loader2 size={30} className="animate-spin mb-3" />
                    <p className="text-sm font-bold">जुनी माहिती आणत आहे...</p>
                  </div>
                ) : pastQueries.length === 0 ? (
                  <div className="text-center py-10 text-gray-500 text-sm font-medium">
                    तुम्ही अजून कोणताही प्रश्न विचारलेला नाही.
                  </div>
                ) : (
                  pastQueries.map((query) => (
                    <div key={query._id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 overflow-hidden">
                      <div className="flex justify-between items-start mb-3">
                        <div className="text-[10px] font-bold text-gray-400">{formatDate(query.createdAt)}</div>
                        {query.status === 'Resolved' ? (
                          <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 bg-green-50 text-green-700 rounded-md">
                            <CheckCircle size={12} /> सल्ला उपलब्ध
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 bg-amber-50 text-amber-700 rounded-md">
                            <Clock size={12} /> तपासणी सुरु
                          </span>
                        )}
                      </div>

                      {/* फोटो आणि समस्या */}
                      <div className="flex gap-3 mb-4">
                        <img src={query.image} alt="Crop" className="w-16 h-16 rounded-xl object-cover border border-gray-100 shadow-sm" />
                        <p className="text-xs text-gray-700 font-medium leading-relaxed flex-1">
                          {query.description ? `"${query.description}"` : "कोणतीही समस्या लिहिलेली नाही."}
                        </p>
                      </div>

                      {query.status === 'Resolved' && query.suggestedProduct && (
                        <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100 mt-2">
                          <div className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider mb-2">तज्ज्ञांनी सुचवलेले औषध:</div>
                          <h3 className="font-black text-sm text-[#0c542b]">{query.suggestedProduct.name}</h3>
                          
                          {query.adminMessage && (
                            <p className="text-[10px] text-gray-600 mt-1 mb-2 font-medium bg-white/60 p-2 rounded-lg border border-emerald-100/50">
                              <span className="font-bold text-emerald-700">सल्ला:</span> {query.adminMessage}
                            </p>
                          )}

                          <div className="flex justify-between items-center mt-3">
                            <span className="text-xs font-bold text-gray-800">₹{query.suggestedProduct.price}</span>
                            <button 
                              onClick={() => navigate('/product-detail', { state: { product: query.suggestedProduct } })}
                              className="bg-[#0c542b] text-white text-[10px] font-bold px-4 py-2 rounded-lg active:scale-95 transition-all shadow-sm"
                            >
                              खरेदी करा
                            </button>
                          </div>
                        </div>
                      )}

                      {query.status === 'Pending' && (
                        <div className="bg-gray-50 rounded-xl p-3 flex items-start gap-2 border border-gray-100 mt-2">
                          <AlertCircle size={14} className="text-gray-400 mt-0.5 shrink-0" />
                          <p className="text-[10px] text-gray-500 leading-relaxed font-medium">आमचे कृषी तज्ज्ञ तुमच्या फोटोची पाहणी करत आहेत. लवकरच तुम्हाला इथे योग्य औषध सुचवले जाईल.</p>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default CropAdvisory;