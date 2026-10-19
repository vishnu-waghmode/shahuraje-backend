import React, { useState, useEffect } from 'react';
import { Leaf, CheckCircle, Clock, Send, Search, X, Plus, History, User } from 'lucide-react';

const AdminCropAdvisory = () => {
  const [queries, setQueries] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedProducts, setSelectedProducts] = useState({});
  const [adminMessage, setAdminMessage] = useState({});

  const [searchTerms, setSearchTerms] = useState({});
  const [dropdownOpen, setDropdownOpen] = useState({});

  const [farmerSearch, setFarmerSearch] = useState('');
  const [activeFarmerHistory, setActiveFarmerHistory] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const advisoryRes = await fetch('https://shahuraje-backend-1.onrender.com/api/advisory/admin/all');
      const advisoryData = await advisoryRes.json();
      
      const productRes = await fetch('https://shahuraje-backend-1.onrender.com/api/products');
      const productData = await productRes.json();

      if (advisoryData.success) setQueries(advisoryData.data);
      setProducts(productData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = (queryId, product) => {
    const currentList = selectedProducts[queryId] || [];
    if (!currentList.some(p => p._id === product._id)) {
      setSelectedProducts({
        ...selectedProducts,
        [queryId]: [...currentList, product]
      });
    }
    setSearchTerms({ ...searchTerms, [queryId]: '' });
    setDropdownOpen({ ...dropdownOpen, [queryId]: false });
  };

  const handleRemoveProduct = (queryId, productId) => {
    const currentList = selectedProducts[queryId] || [];
    setSelectedProducts({
      ...selectedProducts,
      [queryId]: currentList.filter(p => p._id !== productId)
    });
  };

  const handleResolve = async (id) => {
    const list = selectedProducts[id] || [];
    const productIds = list.map(p => p._id);
    const message = adminMessage[id] || '';

    if (productIds.length === 0) {
      alert("कृपया शेतकऱ्याला सुचवण्यासाठी किमान एक औषध निवडा.");
      return;
    }

    try {
      const response = await fetch(`https://shahuraje-backend-1.onrender.com/api/advisory/admin/resolve/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          suggestedProducts: productIds,
          adminMessage: message
        })
      });

      const data = await response.json();
      if (data.success) {
        alert("शेतकऱ्याला औषधे यशस्वीरित्या सुचवली!");
        fetchData();
      }
    } catch (error) {
      alert("एरर आला, पुन्हा प्रयत्न करा.");
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('mr-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  // 👉 Grouping by Farmer
  const farmersMap = {};
  queries.forEach(q => {
    const farmerId = q.userId?._id || q.userId;
    if (!farmerId) return;

    if (!farmersMap[farmerId]) {
      farmersMap[farmerId] = {
        farmerId: farmerId,
        name: q.userId?.name || q.userId?.fullName || 'शेतकरी',
        phone: q.userId?.phone || '',
        allQueries: []
      };
    }
    farmersMap[farmerId].allQueries.push(q);
  });

  const farmersList = Object.values(farmersMap).map(farmer => {
    farmer.allQueries.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    farmer.latestQuery = farmer.allQueries[0];
    
    // Check jar shetkaryachi sagli takrari resolve zhalya ahet ka
    farmer.hasPending = farmer.allQueries.some(q => q.status === 'Pending');
    return farmer;
  });

  // 👉 Main Dashboard Filter: 
  // Jar search kela asel tar sagle shetkari (Resolved asle tri) distil. 
  // Jar search nsel kel tar fkt janchya kade 'Pending' takrar ahe tich shetkari distil.
  const displayedFarmers = farmersList.filter(f => {
    const nameMatch = f.name.toLowerCase().includes(farmerSearch.toLowerCase().trim());
    const phoneMatch = f.phone.includes(farmerSearch.trim());
    const isSearchActive = farmerSearch.trim().length > 0;

    if (isSearchActive) {
      return nameMatch || phoneMatch; // Search kelyavr sagle match hotil
    } else {
      return f.hasPending; // Normal veles fkt pending aslelyache card disel
    }
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-green-800 flex items-center gap-2">
            <Leaf className="text-green-600" /> शेतकऱ्यांच्या समस्या
          </h1>
          <p className="text-sm text-gray-500 mt-1">प्रलंबित तक्रारी तपासा किंवा नावावरुण/नंबरवरून शेतकरी शोधा.</p>
        </div>

        {/* Farmer Search Bar */}
        <div className="relative w-full md:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={16} className="text-gray-400" />
          </div>
          <input 
            type="text" 
            placeholder="शेतकऱ्याचे नाव किंवा नंबर टाका..." 
            value={farmerSearch}
            onChange={(e) => setFarmerSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-green-600 outline-none shadow-xs"
          />
          {farmerSearch && (
            <button 
              onClick={() => setFarmerSearch('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-green-700 font-bold">माहिती लोड होत आहे...</div>
      ) : displayedFarmers.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100 text-gray-500">
          {farmerSearch ? `"${farmerSearch}" शी जुळणारा कोणताही शेतकरी सापडला नाही.` : "सध्या कोणतीही प्रलंबित तक्रार नाही! 🎉"}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {displayedFarmers.map((farmer) => {
            const query = farmer.latestQuery; 
            const queryId = query._id;
            const isResolved = query.status === 'Resolved';

            const currentSearch = searchTerms[queryId] || '';
            const isDropdownOpen = dropdownOpen[queryId] || false;
            const filteredProducts = products.filter(p => p.name.toLowerCase().includes(currentSearch.toLowerCase()));
            const chosenList = selectedProducts[queryId] || [];

            return (
              <div key={farmer.farmerId} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                
                {/* Header */}
                <div className={`p-3 border-b flex justify-between items-center ${isResolved ? 'bg-green-50 border-green-100' : 'bg-amber-50 border-amber-100'}`}>
                  <div className="flex flex-col">
                    <span className="font-bold text-sm text-gray-800 flex items-center gap-1.5">
                      <User size={14} className="text-green-700" /> {farmer.name}
                    </span>
                    <span className="text-xs text-gray-500 mt-0.5">{farmer.phone || 'नंबर उपलब्ध नाही'} • एकूण तक्रारी: {farmer.allQueries.length}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setActiveFarmerHistory(farmer)}
                      className="px-2.5 py-1 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-bold rounded-lg flex items-center gap-1 shadow-xs transition-all"
                    >
                      <History size={13} className="text-green-700" /> इतिहास ({farmer.allQueries.length})
                    </button>

                    {isResolved ? (
                      <span className="px-2.5 py-1 bg-green-200 text-green-800 text-xs font-bold rounded-full flex items-center gap-1">
                        <CheckCircle size={13} /> सल्ला दिला
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 bg-amber-200 text-amber-800 text-xs font-bold rounded-full flex items-center gap-1">
                        <Clock size={13} /> प्रलंबित
                      </span>
                    )}
                  </div>
                </div>

                {/* Latest Query Photo & Description */}
                <div className="p-4 flex gap-4">
                  <div className="w-32 h-32 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-200 cursor-pointer hover:opacity-90" onClick={() => window.open(query.image, '_blank')}>
                    <img src={query.image} alt="Crop" className="w-full h-full object-cover" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">शेवटची समस्या:</h4>
                      <span className="text-[10px] text-gray-400 font-semibold">{formatDate(query.createdAt)}</span>
                    </div>
                    <p className="text-sm text-gray-700 font-medium bg-gray-50 p-2 rounded-lg border border-gray-100">
                      {query.description || <span className="text-gray-400 italic">माहिती दिलेली नाही...</span>}
                    </p>
                  </div>
                </div>

                {/* Action Section */}
                <div className="p-4 bg-gray-50 mt-auto border-t border-gray-100">
                  {isResolved ? (
                    <div className="bg-green-100 p-3 rounded-xl border border-green-200">
                      <p className="text-xs font-bold text-green-800 mb-2">सुचवलेली औषधे:</p>
                      <div className="space-y-1.5">
                        {query.suggestedProducts?.map((prod, idx) => (
                          <div key={idx} className="flex justify-between items-center bg-white/70 p-2 rounded-lg border border-green-200">
                            <span className="font-bold text-xs text-green-900">{prod.name}</span>
                            <span className="text-xs font-semibold text-green-700">₹{prod.price}</span>
                          </div>
                        ))}
                      </div>
                      {query.adminMessage && (
                        <p className="text-xs text-green-800 mt-3 bg-white/60 p-2 rounded-lg"><b>सल्ला:</b> {query.adminMessage}</p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="relative">
                        <label className="block text-xs font-bold text-gray-700 mb-1">औषधे शोधा आणि निवडा (कितीही) *</label>
                        
                        {chosenList.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-2.5">
                            {chosenList.map(p => (
                              <span key={p._id} className="inline-flex items-center gap-1 bg-green-100 text-green-800 text-xs font-bold px-2.5 py-1 rounded-full border border-green-300">
                                {p.name} (₹{p.price})
                                <button onClick={() => handleRemoveProduct(queryId, p._id)} className="hover:text-red-600">
                                  <X size={14} />
                                </button>
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search size={14} className="text-gray-400" />
                          </div>
                          <input 
                            type="text" 
                            placeholder="औषधाचे नाव टाईप करून शोधा..."
                            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none transition-all bg-white"
                            value={currentSearch}
                            onChange={(e) => {
                              setSearchTerms({...searchTerms, [queryId]: e.target.value});
                              setDropdownOpen({...dropdownOpen, [queryId]: true});
                            }}
                            onFocus={() => setDropdownOpen({...dropdownOpen, [queryId]: true})}
                          />
                        </div>

                        {isDropdownOpen && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                            {filteredProducts.length > 0 ? (
                              filteredProducts.map(p => (
                                <div 
                                  key={p._id}
                                  onClick={() => handleAddProduct(queryId, p)}
                                  className="p-2.5 text-sm hover:bg-green-50 cursor-pointer border-b border-gray-100 last:border-0 flex justify-between items-center transition-colors"
                                >
                                  <span className="font-semibold text-gray-800">{p.name}</span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded">₹{p.price}</span>
                                    <Plus size={16} className="text-green-600" />
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="p-3 text-xs text-gray-500 text-center">कोणतेही औषध सापडले नाही.</div>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">अतिरिक्त सल्ला (Optional)</label>
                        <input 
                          type="text" 
                          placeholder="उदा. हे सर्व एकत्र करून फवारा..."
                          className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none"
                          value={adminMessage[queryId] || ''}
                          onChange={(e) => setAdminMessage({...adminMessage, [queryId]: e.target.value})}
                        />
                      </div>

                      <button 
                        onClick={() => handleResolve(queryId)}
                        disabled={chosenList.length === 0}
                        className={`w-full font-bold text-sm py-2.5 rounded-lg flex justify-center items-center gap-2 transition-all shadow-sm ${chosenList.length === 0 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-[#0c542b] hover:bg-[#094020] text-white'}`}
                      >
                        <Send size={16} /> शेतकऱ्याला औषधे पाठवा ({chosenList.length})
                      </button>
                    </div>
                  )}
                </div>

                {isDropdownOpen && (
                  <div className="fixed inset-0 z-0" onClick={() => setDropdownOpen({...dropdownOpen, [queryId]: false})}></div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* History Modal Popup */}
      {activeFarmerHistory && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            
            <div className="bg-[#0c542b] text-white p-4 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-black">{activeFarmerHistory.name} - संपूर्ण इतिहास</h2>
                <p className="text-xs text-green-100">मोबाईल: {activeFarmerHistory.phone} • एकूण तक्रारी: {activeFarmerHistory.allQueries.length}</p>
              </div>
              <button 
                onClick={() => setActiveFarmerHistory(null)}
                className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 flex-1 bg-gray-50">
              {activeFarmerHistory.allQueries.map((item, idx) => (
                <div key={item._id || idx} className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-gray-400">{formatDate(item.createdAt)}</span>
                    {item.status === 'Resolved' ? (
                      <span className="px-2 py-0.5 bg-green-100 text-green-800 font-bold rounded text-[10px]">✅ सल्ला दिला</span>
                    ) : (
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-800 font-bold rounded text-[10px]">⏳ प्रलंबित</span>
                    )}
                  </div>

                  <div className="flex gap-3 items-start">
                    <img src={item.image} alt="Crop" className="w-20 h-20 rounded-lg object-cover border border-gray-100 shrink-0 cursor-pointer" onClick={() => window.open(item.image, '_blank')} />
                    <div className="flex-1">
                      <p className="text-xs text-gray-700 font-medium bg-gray-50 p-2 rounded-lg">
                        {item.description || "समस्या लिहिलेली नाही."}
                      </p>
                    </div>
                  </div>

                  {item.status === 'Resolved' && item.suggestedProducts && item.suggestedProducts.length > 0 && (
                    <div className="bg-green-50 p-3 rounded-lg border border-green-200 text-xs space-y-1">
                      <span className="font-bold text-green-900 block mb-1">सुचवलेली औषधे:</span>
                      {item.suggestedProducts.map((p, pIdx) => (
                        <div key={pIdx} className="flex justify-between text-green-800 font-medium">
                          <span>• {p.name}</span>
                          <span>₹{p.price}</span>
                        </div>
                      ))}
                      {item.adminMessage && (
                        <p className="text-gray-600 mt-2 bg-white p-2 rounded border border-green-100">
                          <b>सल्ला:</b> {item.adminMessage}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="p-4 bg-white border-t border-gray-100 flex justify-end">
              <button 
                onClick={() => setActiveFarmerHistory(null)}
                className="px-5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold text-sm rounded-xl transition-all"
              >
                बंद करा
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCropAdvisory;