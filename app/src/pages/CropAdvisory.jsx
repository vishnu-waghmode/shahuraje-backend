import React, { useState, useEffect, useRef } from 'react';
import { IonPage, IonContent } from '@ionic/react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, Image as ImageIcon, Send, Clock, CheckCircle, AlertCircle, Leaf, X, Loader2, MessageSquare, ChevronLeft } from 'lucide-react';

const API_BASE_URL = 'https://shahuraje-backend-1.onrender.com';

const CropAdvisory = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('नवीन_तक्रार'); 
  const [selectedImage, setSelectedImage] = useState(null); 
  const [base64Image, setBase64Image] = useState(null); 
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false); 
  
  const [pastQueries, setPastQueries] = useState([]); 
  const [fetchingHistory, setFetchingHistory] = useState(false);

  const [activeChat, setActiveChat] = useState(null);
  const [chatText, setChatText] = useState('');
  const [chatImage, setChatImage] = useState(null);
  const [chatImageBase64, setChatImageBase64] = useState(null);
  const [chatLoading, setChatLoading] = useState(false);
  const chatScrollRef = useRef(null);

  const savedUser = JSON.parse(localStorage.getItem('user') || 'null');
  const userId = savedUser?._id || savedUser?.id;

  useEffect(() => {
    if (userId) {
      fetch(`${API_BASE_URL}/api/notifications/mark-all-read/${userId}`, { method: 'PUT' }).catch(e => console.log(e));
    }
  }, [userId]);

  useEffect(() => {
    if (activeChat && chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [activeChat, chatScrollRef]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(URL.createObjectURL(file));
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => setBase64Image(reader.result);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedImage || !base64Image) return alert("कृपया पिकाचा फोटो अपलोड करा.");
    if (!userId) return alert("सुरक्षेसाठी कृपया आधी ॲपमध्ये लॉगिन करा.");

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/advisory/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, description, imageBase64: base64Image })
      });
      const data = await response.json();
      if (data.success) {
        alert("तुमची तक्रार यशस्वीरित्या पाठवली आहे!");
        setSelectedImage(null); setBase64Image(null); setDescription('');
        fetchHistory(); 
        setActiveTab('जुने_सल्ले'); 
      }
    } catch (error) {
      alert("सर्वर एरर, कृपया थोड्या वेळाने प्रयत्न करा.");
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    if (!userId) return;
    setFetchingHistory(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/advisory/user/${userId}`);
      const data = await response.json();
      if (data.success) setPastQueries(data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setFetchingHistory(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'जुने_सल्ले') fetchHistory();
  }, [activeTab, userId]);

  const handleChatImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setChatImage(URL.createObjectURL(file));
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => setChatImageBase64(reader.result);
    }
  };

  const handleSendReply = async () => {
    if (!chatText.trim() && !chatImageBase64) return;
    setChatLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/advisory/message/${activeChat._id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sender: 'farmer', text: chatText, imageBase64: chatImageBase64 })
      });
      const data = await response.json();
      if (data.success) {
        setActiveChat(data.data);
        setChatText(''); setChatImage(null); setChatImageBase64(null);
        fetchHistory(); 
      }
    } catch (error) {
      alert("मेसेज पाठवता आला नाही.");
    } finally {
      setChatLoading(false);
    }
  };

  const formatDate = (date) => new Date(date).toLocaleDateString('mr-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  
  const getMessages = (query) => {
    if (query.messages && query.messages.length > 0) return query.messages;
    return [{ sender: 'farmer', text: query.description || 'तक्रार नोंदवली.', image: query.image, timestamp: query.createdAt }];
  };

  // Back button handler for Chat Modal
  const closeChat = () => {
    setActiveChat(null);
    setChatText('');
    setChatImage(null);
  };

  return (
    <IonPage>
      <IonContent className="bg-gray-50">
        <div className="w-full min-h-full flex flex-col pb-20">
          
          <div className="bg-[#0c542b] text-white px-4 pt-10 pb-5 shadow-sm sticky top-0 z-20">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate(-1)} className="p-2 bg-white/10 rounded-full hover:bg-white/20"><ArrowLeft size={20} /></button>
              <div>
                <h1 className="text-lg font-black tracking-wide">पिकांचा डॉक्टर</h1>
                <p className="text-[11px] text-green-100 mt-0.5">तज्ज्ञांचा मोफत सल्ला</p>
              </div>
            </div>
            <div className="flex mt-6 bg-white/10 p-1 rounded-xl">
              <button onClick={() => setActiveTab('नवीन_तक्रार')} className={`flex-1 py-2 text-xs font-bold rounded-lg ${activeTab === 'नवीन_तक्रार' ? 'bg-white text-[#0c542b]' : 'text-green-50'}`}>नवीन प्रश्न विचारा</button>
              <button onClick={() => setActiveTab('जुने_सल्ले')} className={`flex-1 py-2 text-xs font-bold rounded-lg ${activeTab === 'जुने_सल्ले' ? 'bg-white text-[#0c542b]' : 'text-green-50'}`}>माझे प्रश्न / चॅट</button>
            </div>
          </div>

          <div className="p-4">
            {activeTab === 'नवीन_तक्रार' ? (
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-4 text-[#0c542b]"><Leaf size={18} /><h2 className="font-bold text-sm">पिकाचा फोटो काढा</h2></div>
                <p className="text-xs text-gray-500 mb-4 leading-relaxed">रोगग्रस्त पानाचा किंवा पिकाचा स्पष्ट फोटो काढा म्हणजे आमचे तज्ज्ञ अचूक औषध सुचवू शकतील.</p>
                {!selectedImage ? (
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    <label className="flex flex-col items-center justify-center p-5 border-2 border-dashed border-emerald-300 rounded-2xl bg-emerald-50 hover:bg-emerald-100 cursor-pointer">
                      <Camera size={32} className="text-emerald-600 mb-2" />
                      <span className="text-[11px] font-bold text-emerald-800 text-center leading-tight">थेट कॅमेऱ्यातून<br/>फोटो काढा</span>
                      <input type="file" accept="image/*" capture="environment" onChange={handleImageChange} className="hidden" />
                    </label>
                    <label className="flex flex-col items-center justify-center p-5 border-2 border-dashed border-blue-300 rounded-2xl bg-blue-50 hover:bg-blue-100 cursor-pointer">
                      <ImageIcon size={32} className="text-blue-600 mb-2" />
                      <span className="text-[11px] font-bold text-blue-800 text-center leading-tight">गॅलरीमधून<br/>फोटो निवडा</span>
                      <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                    </label>
                  </div>
                ) : (
                  <div className="relative w-full h-56 rounded-2xl overflow-hidden border border-gray-200">
                    <img src={selectedImage} alt="Crop" className="w-full h-full object-cover" />
                    <button onClick={() => { setSelectedImage(null); setBase64Image(null); }} className="absolute top-3 right-3 bg-white/90 p-2 rounded-full text-red-500"><X size={20} /></button>
                  </div>
                )}
                <div className="mt-5">
                  <label className="block text-xs font-bold text-gray-700 mb-2">पिकाची समस्या (ऐच्छिक)</label>
                  <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="उदा. टोमॅटोची पाने पिवळी पडत आहेत..." className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-[#0c542b] outline-none"></textarea>
                </div>
                <button onClick={handleSubmit} disabled={loading || !selectedImage} className={`w-full mt-6 text-white py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 ${loading || !selectedImage ? 'bg-gray-400' : 'bg-[#0c542b] active:scale-95'}`}>
                  {loading ? <><Loader2 size={16} className="animate-spin" /> फोटो पाठवत आहे...</> : <><Send size={16} /> तज्ज्ञांना पाठवा</>}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {fetchingHistory ? (
                  <div className="flex flex-col items-center justify-center py-10 text-[#0c542b]"><Loader2 size={30} className="animate-spin mb-3" /><p className="text-sm font-bold">जुनी माहिती आणत आहे...</p></div>
                ) : pastQueries.length === 0 ? (
                  <div className="text-center py-10 text-gray-500 text-sm font-medium">तुम्ही अजून कोणताही प्रश्न विचारलेला नाही.</div>
                ) : (
                  pastQueries.map((query) => (
                    <div key={query._id} onClick={() => setActiveChat(query)} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 cursor-pointer">
                      <div className="flex justify-between items-start mb-3">
                        <div className="text-[10px] font-bold text-gray-400">{formatDate(query.createdAt)}</div>
                        {query.status === 'Resolved' ? (
                          <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 bg-green-50 text-green-700 rounded-md"><CheckCircle size={12} /> सल्ला उपलब्ध</span>
                        ) : query.status === 'In-Progress' ? (
                          <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 bg-blue-50 text-blue-700 rounded-md"><MessageSquare size={12} /> चॅट सुरु</span>
                        ) : (
                          <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 bg-amber-50 text-amber-700 rounded-md"><Clock size={12} /> तपासणी सुरु</span>
                        )}
                      </div>
                      <div className="flex gap-3 mb-2">
                        <img src={query.image} alt="Crop" className="w-16 h-16 rounded-xl object-cover border border-gray-100" />
                        <div className="flex-1 flex flex-col justify-center">
                          <p className="text-xs text-gray-700 font-medium line-clamp-2">{query.description || "तक्रार नोंदवली."}</p>
                          <div className="mt-2 text-[10px] font-bold text-[#0c542b] flex items-center gap-1">चॅट उघडा <ArrowLeft size={10} className="rotate-180" /></div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </IonContent>

      {/* 🔴 Full Screen Chat Modal */}
      {activeChat && (
        <div className="fixed inset-0 z-50 bg-gray-50 flex flex-col">
          {/* 👉 बदल १: Header ला वरून pt-10 ची padding दिली आहे जेणेकरून Notch च्या खाली दिसेल */}
          <div className="bg-[#0c542b] text-white px-4 pt-10 pb-4 flex items-center gap-3 shadow-md z-10">
            <button onClick={closeChat} className="p-1.5 bg-white/10 rounded-full active:bg-white/20 cursor-pointer">
              <ChevronLeft size={24} />
            </button>
            <div>
              <h2 className="text-base font-bold">कृषी तज्ज्ञ</h2>
              <p className="text-[10px] text-green-100">{activeChat.status === 'Resolved' ? 'समस्या सुटली (तरीही प्रश्न विचारू शकता)' : 'ऑनलाईन'}</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={chatScrollRef}>
            {getMessages(activeChat).map((msg, idx) => {
              const isFarmer = msg.sender === 'farmer';
              return (
                <div key={idx} className={`flex ${isFarmer ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-2xl ${isFarmer ? 'bg-[#0c542b] text-white rounded-tr-sm' : 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm shadow-sm'}`}>
                    {msg.image && <img src={msg.image} alt="attachment" className="w-full max-h-48 object-cover rounded-xl mb-2" onClick={() => window.open(msg.image, '_blank')} />}
                    {msg.text && <p className="text-[13px] leading-relaxed whitespace-pre-wrap">{msg.text}</p>}
                    <span className={`text-[9px] block mt-1.5 text-right ${isFarmer ? 'text-green-200' : 'text-gray-400'}`}>{formatDate(msg.timestamp || Date.now())}</span>
                  </div>
                </div>
              );
            })}

            {activeChat.status === 'Resolved' && activeChat.suggestedProducts && activeChat.suggestedProducts.length > 0 && (
              <div className="flex justify-start">
                <div className="max-w-[85%] bg-green-50 border border-green-200 p-3 rounded-2xl rounded-tl-sm">
                  <p className="text-[11px] font-bold text-green-800 mb-2">सुचवलेली औषधे (खरेदीसाठी उपलब्ध):</p>
                  {activeChat.suggestedProducts.map((prod, idx) => (
                    <div key={idx} className="bg-white p-2 mb-1.5 rounded-lg border border-green-100 flex justify-between items-center shadow-xs">
                      <span className="font-bold text-[11px] text-green-900">{prod.name}</span>
                      <button onClick={() => navigate('/product-detail', { state: { product: prod } })} className="bg-[#0c542b] text-white text-[9px] px-2.5 py-1 rounded">पहा</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 👉 बदल २: Chat Input ला खालून pb-8 ची padding दिली आहे जेणेकरून मोबाईलच्या बटन्सच्या वर दिसेल */}
          <div className="bg-white px-3 pt-3 pb-8 border-t border-gray-200 flex flex-col gap-2">
            {chatImage && (
              <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200 self-start ml-2 mb-1">
                <img src={chatImage} alt="preview" className="w-full h-full object-cover" />
                <button onClick={() => { setChatImage(null); setChatImageBase64(null); }} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-0.5"><X size={12} /></button>
              </div>
            )}

            <div className="flex items-end gap-2">
              <div className="flex gap-1">
                <label className="p-2.5 bg-emerald-50 text-emerald-600 rounded-full active:bg-emerald-100 cursor-pointer">
                  <Camera size={20} />
                  <input type="file" accept="image/*" capture="environment" onChange={handleChatImageChange} className="hidden" />
                </label>
                <label className="p-2.5 bg-blue-50 text-blue-600 rounded-full active:bg-blue-100 cursor-pointer">
                  <ImageIcon size={20} />
                  <input type="file" accept="image/*" onChange={handleChatImageChange} className="hidden" />
                </label>
              </div>
              
              <textarea 
                rows={1}
                value={chatText}
                onChange={(e) => setChatText(e.target.value)}
                placeholder="रिप्लाय द्या..."
                className="flex-1 bg-gray-100 rounded-2xl px-4 py-3 text-sm outline-none max-h-24 resize-none"
              />
              
              <button 
                onClick={handleSendReply}
                disabled={chatLoading || (!chatText.trim() && !chatImage)}
                className={`p-3 rounded-full flex items-center justify-center transition-all ${chatLoading || (!chatText.trim() && !chatImage) ? 'bg-gray-200 text-gray-400' : 'bg-[#0c542b] text-white active:scale-95'}`}
              >
                {chatLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} className="ml-1" />}
              </button>
            </div>
          </div>

        </div>
      )}
    </IonPage>
  );
};

export default CropAdvisory;