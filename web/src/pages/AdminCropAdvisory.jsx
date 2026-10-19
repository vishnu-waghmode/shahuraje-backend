import React, { useState, useEffect } from 'react';
import { Leaf, CheckCircle, Clock, Send, Search, X, Plus } from 'lucide-react';

const AdminCropAdvisory = () => {
  const [queries, setQueries] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedProducts, setSelectedProducts] = useState({});
  const [adminMessage, setAdminMessage] = useState({});

  const [searchTerms, setSearchTerms] = useState({});
  const [dropdownOpen, setDropdownOpen] = useState({});

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

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-black text-green-800 flex items-center gap-2">
            <Leaf className="text-green-600" /> पिकांचा डॉक्टर - ॲडमिन पॅनेल
          </h1>
          <p className="text-sm text-gray-500 mt-1">शेतकऱ्यांनी पाठवलेले फोटो पहा आणि त्यांना एकापेक्षा जास्त योग्य औषधे सुचवा.</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-green-700 font-bold">लोड होत आहे...</div>
      ) : queries.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100 text-gray-500">
          सध्या कोणतीही नवीन तक्रार नाही.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {queries.map((query) => {
            const currentSearch = searchTerms[query._id] || '';
            const isDropdownOpen = dropdownOpen[query._id] || false;
            const filteredProducts = products.filter(p => p.name.toLowerCase().includes(currentSearch.toLowerCase()));
            const chosenList = selectedProducts[query._id] || [];

            return (
              <div key={query._id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                
                {/* Header */}
                <div className={`p-3 border-b flex justify-between items-center ${query.status === 'Resolved' ? 'bg-green-50 border-green-100' : 'bg-amber-50 border-amber-100'}`}>
                  <div className="flex flex-col">
                    <span className="font-bold text-sm text-gray-800">{query.userId?.name || 'शेतकरी'}</span>
                    <span className="text-xs text-gray-500">{query.userId?.phone || ''} • {formatDate(query.createdAt)}</span>
                  </div>
                  {query.status === 'Resolved' ? (
                    <span className="px-3 py-1 bg-green-200 text-green-800 text-xs font-bold rounded-full flex items-center gap-1">
                      <CheckCircle size={14} /> सल्ला दिला
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-amber-200 text-amber-800 text-xs font-bold rounded-full flex items-center gap-1">
                      <Clock size={14} /> प्रलंबित
                    </span>
                  )}
                </div>

                <div className="p-4 flex gap-4">
                  <div className="w-32 h-32 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-200 cursor-pointer hover:opacity-90" onClick={() => window.open(query.image, '_blank')}>
                    <img src={query.image} alt="Crop" className="w-full h-full object-cover" />
                  </div>
                  
                  <div className="flex-1">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">शेतकऱ्याची समस्या:</h4>
                    <p className="text-sm text-gray-700 font-medium bg-gray-50 p-2 rounded-lg border border-gray-100">
                      {query.description || <span className="text-gray-400 italic">माहिती दिलेली नाही...</span>}
                    </p>
                  </div>
                </div>

                {/* Action Section */}
                <div className="p-4 bg-gray-50 mt-auto border-t border-gray-100">
                  {query.status === 'Resolved' ? (
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
                                <button onClick={() => handleRemoveProduct(query._id, p._id)} className="hover:text-red-600">
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
                              setSearchTerms({...searchTerms, [query._id]: e.target.value});
                              setDropdownOpen({...dropdownOpen, [query._id]: true});
                            }}
                            onFocus={() => setDropdownOpen({...dropdownOpen, [query._id]: true})}
                          />
                        </div>

                        {isDropdownOpen && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                            {filteredProducts.length > 0 ? (
                              filteredProducts.map(p => (
                                <div 
                                  key={p._id}
                                  onClick={() => handleAddProduct(query._id, p)}
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
                          value={adminMessage[query._id] || ''}
                          onChange={(e) => setAdminMessage({...adminMessage, [query._id]: e.target.value})}
                        />
                      </div>

                      <button 
                        onClick={() => handleResolve(query._id)}
                        disabled={chosenList.length === 0}
                        className={`w-full font-bold text-sm py-2.5 rounded-lg flex justify-center items-center gap-2 transition-all shadow-sm ${chosenList.length === 0 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-[#0c542b] hover:bg-[#094020] text-white'}`}
                      >
                        <Send size={16} /> शेतकऱ्याला औषधे पाठवा ({chosenList.length})
                      </button>
                    </div>
                  )}
                </div>

                {isDropdownOpen && (
                  <div className="fixed inset-0 z-0" onClick={() => setDropdownOpen({...dropdownOpen, [query._id]: false})}></div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminCropAdvisory;