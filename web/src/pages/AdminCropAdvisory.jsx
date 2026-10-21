import React, { useState, useEffect, useRef } from 'react';
import { Leaf, CheckCircle, Clock, Send, Search, X, Plus, User, MessageSquare, Loader2 } from 'lucide-react';

const API_BASE_URL = 'https://shahuraje-backend-1.onrender.com';

const AdminCropAdvisory = () => {
  const [queries, setQueries] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [farmerSearch, setFarmerSearch] = useState('');
  
  const [activeChatId, setActiveChatId] = useState(null);
  const [chatText, setChatText] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatScrollRef = useRef(null);

  const [selectedProducts, setSelectedProducts] = useState([]);
  const [productSearch, setProductSearch] = useState('');
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [resolveMessage, setResolveMessage] = useState('');
  const [resolving, setResolving] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const advisoryRes = await fetch(`${API_BASE_URL}/api/advisory/admin/all`);
      const productRes = await fetch(`${API_BASE_URL}/api/products`);
      const advisoryData = await advisoryRes.json();
      const productData = await productRes.json();

      if (advisoryData.success) setQueries(advisoryData.data);
      setProducts(productData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeChatId && chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [activeChatId, queries]);

  const handleSendMessage = async () => {
    if (!chatText.trim()) return;
    setChatLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/advisory/message/${activeChatId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sender: 'admin', text: chatText })
      });
      const data = await response.json();
      if (data.success) {
        setChatText('');
        fetchData(); 
      }
    } catch (error) {
      alert("मेसेज पाठवता आला नाही.");
    } finally {
      setChatLoading(false);
    }
  };

  const handleAddProduct = (product) => {
    if (!selectedProducts.some(p => p._id === product._id)) {
      setSelectedProducts([...selectedProducts, product]);
    }
    setProductSearch(''); setShowProductDropdown(false);
  };

  const handleResolve = async () => {
    if (selectedProducts.length === 0) return alert("कृपया किमान एक औषध निवडा.");
    setResolving(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/advisory/admin/resolve/${activeChatId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ suggestedProducts: selectedProducts.map(p => p._id), adminMessage: resolveMessage })
      });
      const data = await response.json();
      if (data.success) {
        alert("औषधे यशस्वीरित्या सुचवली!");
        setActiveChatId(null); setSelectedProducts([]); setResolveMessage(''); fetchData();
      }
    } catch (error) {
      alert("एरर आला, पुन्हा प्रयत्न करा.");
    } finally {
      setResolving(false);
    }
  };

  const formatDate = (date) => new Date(date).toLocaleDateString('mr-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  const displayedQueries = queries.filter(q => {
    const search = farmerSearch.toLowerCase().trim();
    if (search) return (q.userId?.name || '').toLowerCase().includes(search) || (q.userId?.phone || '').includes(search);
    return q.status !== 'Resolved';
  });

  const activeChatQuery = queries.find(q => q._id === activeChatId);
  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()));

  const getMessages = (query) => {
    if (query.messages && query.messages.length > 0) return query.messages;
    return [{ sender: 'farmer', text: query.description || 'तक्रार नोंदवली.', image: query.image, timestamp: query.createdAt }];
  };

  return (
    <div className="p-6 max-w-7xl mx-auto bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-black text-green-800 flex items-center gap-2"><Leaf className="text-green-600" /> शेतकऱ्यांच्या समस्या व चॅट</h1>
          <p className="text-sm text-gray-500 mt-1">शेतकऱ्यांच्या समस्या पहा, त्यांच्याशी चॅट करा आणि औषधे सुचवा.</p>
        </div>
        <div className="relative w-full md:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Search size={16} className="text-gray-400" /></div>
          <input type="text" placeholder="शेतकरी किंवा नंबर शोधा..." value={farmerSearch} onChange={(e) => setFarmerSearch(e.target.value)} className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-600 outline-none" />
          {farmerSearch && <button onClick={() => setFarmerSearch('')} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400"><X size={16} /></button>}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-green-700"><Loader2 size={40} className="animate-spin mb-4" /><p className="font-bold">माहिती लोड होत आहे...</p></div>
      ) : displayedQueries.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100 text-gray-500">सध्या कोणतीही प्रलंबित तक्रार नाही! 🎉</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedQueries.map((query) => (
            <div key={query._id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col transition-all hover:shadow-md">
              <div className="p-3 border-b flex justify-between items-center bg-gray-50">
                <div className="flex items-center gap-2">
                  <div className="bg-green-100 p-1.5 rounded-full text-green-700"><User size={16} /></div>
                  <div><h3 className="font-bold text-sm text-gray-800">{query.userId?.name || 'अज्ञात शेतकरी'}</h3><p className="text-[11px] text-gray-500">{query.userId?.phone}</p></div>
                </div>
                <div>
                  {query.status === 'Resolved' ? <span className="px-2 py-1 bg-green-100 text-green-800 text-[10px] font-bold rounded-md flex items-center gap-1"><CheckCircle size={12} /> सुटली</span>
                  : query.status === 'In-Progress' ? <span className="px-2 py-1 bg-blue-100 text-blue-800 text-[10px] font-bold rounded-md flex items-center gap-1"><MessageSquare size={12} /> चॅट सुरु</span>
                  : <span className="px-2 py-1 bg-amber-100 text-amber-800 text-[10px] font-bold rounded-md flex items-center gap-1"><Clock size={12} /> प्रलंबित</span>}
                </div>
              </div>
              <div className="p-4 flex gap-4 flex-1">
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 cursor-pointer" onClick={() => window.open(query.image, '_blank')}><img src={query.image} alt="Crop" className="w-full h-full object-cover" /></div>
                <div className="flex-1 flex flex-col justify-between"><p className="text-xs text-gray-600 font-medium line-clamp-3 mb-2">{query.description || "तक्रार नोंदवली आहे."}</p><p className="text-[10px] font-bold text-gray-400">{formatDate(query.createdAt)}</p></div>
              </div>
              <div className="p-3 border-t border-gray-100 bg-white">
                <button onClick={() => { setActiveChatId(query._id); setSelectedProducts([]); setResolveMessage(''); }} className="w-full py-2 bg-green-50 hover:bg-green-100 text-green-700 font-bold text-sm rounded-lg flex justify-center items-center gap-2 border border-green-200">
                  <MessageSquare size={16} /> तपासणी करा / चॅट उघडा
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeChatId && activeChatQuery && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-center items-center p-2 md:p-6">
          <div className="bg-gray-50 rounded-2xl w-full max-w-5xl h-[95vh] md:h-[90vh] flex flex-col md:flex-row shadow-2xl overflow-hidden">
            
            <div className="flex-1 flex flex-col border-r border-gray-200 bg-white">
              <div className="bg-green-700 text-white px-4 py-3 flex justify-between items-center shadow-sm z-10">
                <div className="flex items-center gap-3"><div className="bg-white/20 p-2 rounded-full"><User size={20} /></div><div><h2 className="font-bold text-sm">{activeChatQuery.userId?.name}</h2><p className="text-xs text-green-100">{activeChatQuery.userId?.phone}</p></div></div>
                <button onClick={() => setActiveChatId(null)} className="md:hidden p-2 bg-white/10 rounded-full"><X size={20}/></button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-100" ref={chatScrollRef}>
                {getMessages(activeChatQuery).map((msg, idx) => {
                  const isAdmin = msg.sender === 'admin';
                  return (
                    <div key={idx} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] md:max-w-[60%] p-3 rounded-2xl shadow-sm ${isAdmin ? 'bg-green-600 text-white rounded-tr-sm' : 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm'}`}>
                        {msg.image && <img src={msg.image} alt="attachment" className="w-full max-h-60 object-cover rounded-xl mb-2 cursor-pointer" onClick={() => window.open(msg.image, '_blank')} />}
                        {msg.text && <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>}
                        <span className={`text-[10px] block mt-1.5 text-right ${isAdmin ? 'text-green-200' : 'text-gray-400'}`}>{formatDate(msg.timestamp || Date.now())}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 🔴 Chat Input (Nehami Open) */}
              <div className="bg-white p-3 border-t border-gray-200 flex gap-2 items-end">
                <textarea rows={1} value={chatText} onChange={(e) => setChatText(e.target.value)} placeholder="शेतकऱ्याला मेसेज टाईप करा..." className="flex-1 bg-gray-100 border border-gray-200 rounded-2xl px-4 py-3 text-sm outline-none max-h-24 resize-none focus:ring-1 focus:ring-green-500" />
                <button onClick={handleSendMessage} disabled={chatLoading || !chatText.trim()} className={`p-3 rounded-full flex items-center justify-center transition-all ${chatLoading || !chatText.trim() ? 'bg-gray-200 text-gray-400' : 'bg-green-700 text-white hover:bg-green-800'}`}>
                  {chatLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                </button>
              </div>
            </div>

            <div className="w-full md:w-[400px] flex flex-col bg-white">
              <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                <h3 className="font-bold text-gray-800 flex items-center gap-2"><Leaf size={18} className="text-green-600"/> औषधे सुचवा</h3>
                <button onClick={() => setActiveChatId(null)} className="hidden md:block p-1.5 bg-gray-200 text-gray-600 rounded-full"><X size={18} /></button>
              </div>

              <div className="flex-1 p-5 overflow-y-auto">
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">सुचवण्यासाठी निवडलेली औषधे:</label>
                    {selectedProducts.length > 0 ? (
                      <div className="space-y-2 mb-3">
                        {selectedProducts.map(p => (
                          <div key={p._id} className="flex justify-between items-center bg-green-50 border border-green-200 p-2 rounded-lg">
                            <span className="text-sm font-bold text-green-900">{p.name} (₹{p.price})</span>
                            <button onClick={() => setSelectedProducts(selectedProducts.filter(item => item._id !== p._id))} className="text-red-500"><X size={16}/></button>
                          </div>
                        ))}
                      </div>
                    ) : <p className="text-xs text-gray-400 italic mb-3">कोणतेही औषध निवडलेले नाही.</p>}

                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Search size={14} className="text-gray-400" /></div>
                      <input type="text" placeholder="औषधाचे नाव शोधा..." className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-green-500 outline-none" value={productSearch} onChange={(e) => { setProductSearch(e.target.value); setShowProductDropdown(true); }} onFocus={() => setShowProductDropdown(true)} />
                      {showProductDropdown && productSearch && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-48 overflow-y-auto">
                          {filteredProducts.length > 0 ? filteredProducts.map(p => (
                            <div key={p._id} onClick={() => handleAddProduct(p)} className="p-3 text-sm hover:bg-green-50 cursor-pointer border-b border-gray-100 flex justify-between items-center"><span className="font-semibold text-gray-800">{p.name}</span><span className="text-xs font-bold text-green-700">₹{p.price} <Plus size={14} className="inline ml-1"/></span></div>
                          )) : <div className="p-3 text-xs text-gray-500 text-center">औषध सापडले नाही.</div>}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">फायनल सल्ला (Optional):</label>
                    <textarea rows={3} placeholder="उदा. औषध ५ लिटर पाण्यात मिसळून फवारा..." className="w-full p-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-green-500 outline-none resize-none" value={resolveMessage} onChange={(e) => setResolveMessage(e.target.value)} />
                  </div>

                  <button onClick={handleResolve} disabled={resolving || selectedProducts.length === 0} className={`w-full py-3.5 rounded-xl font-bold text-sm flex justify-center items-center gap-2 transition-all shadow-md ${resolving || selectedProducts.length === 0 ? 'bg-gray-300 text-gray-500' : 'bg-green-700 hover:bg-green-800 text-white'}`}>
                    {resolving ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />} औषधे पाठवा
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCropAdvisory;