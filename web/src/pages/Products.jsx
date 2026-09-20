import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, X, AlertTriangle, CheckCircle2 } from 'lucide-react';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);

  // १. डिलीट मॉडेल आणि टोस्टसाठी स्टेट्स
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  const [formData, setFormData] = useState({
    name: '', category: '', price: '', mrp: '', stock: '', image: ''
  });

  // टोस्ट दाखवण्यासाठी हेल्पर फंक्शन
  const triggerToast = (msg) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000); // ३ सेकंदांनंतर आपोआप टोस्ट बंद होईल
  };

  // सर्व उत्पादने आणणे
  const fetchProducts = async () => {
    try {
      const response = await fetch('https://shahuraje-backend.onrender.com/api/products');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Products fetch करताना एरर:', error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const closeModal = () => {
    setIsModalOpen(false);
    setEditId(null);
    setFormData({ name: '', category: '', price: '', mrp: '', stock: '', image: '' });
  };

  const handleEditClick = (product) => {
    setEditId(product._id);
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price,
      mrp: product.mrp,
      stock: product.stock,
      image: product.image || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // इथे नवीन Render ची लिंक टाकली आहे 
      const url = editId 
        ? `https://shahuraje-backend.onrender.com/api/products/${editId}` 
        : 'https://shahuraje-backend.onrender.com/api/products/add';
      
      const method = editId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        triggerToast(editId ? 'उत्पादन यशस्वीरीत्या अपडेट झाले!' : 'उत्पादन यशस्वीरीत्या ॲड झाले!');
        closeModal();
        fetchProducts();
      }
    } catch (error) {
      console.error('Product सेव्ह करताना एरर:', error);
    }
  };

  // २. डिलीट आयकॉनवर क्लिक केल्यावर सेंटर मॉडेल उघडणे
  const confirmDelete = (product) => {
    setProductToDelete(product);
    setDeleteModalOpen(true);
  };

  // ३. "होय" वर क्लिक केल्यावर डेटाबेसमधून डिलीट करणे
  const handleDeleteProduct = async () => {
    if (!productToDelete) return;
    try {
      // इथेही नवीन Render ची लिंक टाकली आहे 
      const response = await fetch(`https://shahuraje-backend.onrender.com/api/products/${productToDelete._id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setDeleteModalOpen(false);
        setProductToDelete(null);
        fetchProducts();
        triggerToast('उत्पादन यशस्वीरीत्या डिलीट झाले!');
      }
    } catch (error) {
      console.error('Product डिलीट करताना एरर:', error);
    }
  };

  return (
    <div className="space-y-6 relative">
      
      {/* FlyonUI स्टाईल टोस्ट नोटिफिकेशन */}
      {showToast && (
        <div className="fixed top-6 right-6 z-50 transition-all duration-300 transform translate-y-0">
          <div className="flex items-center gap-3 bg-white border border-emerald-100 shadow-xl rounded-2xl px-4 py-3 border-l-4 border-l-[#154f30]">
            <CheckCircle2 size={22} className="text-[#154f30]" />
            <div>
              <p className="text-sm font-bold text-gray-800">{toastMessage}</p>
            </div>
            <button onClick={() => setShowToast(false)} className="text-gray-400 hover:text-gray-600 ml-2">
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">उत्पादने व्यवस्थापन</h1>
        <button 
          onClick={() => { closeModal(); setIsModalOpen(true); }}
          className="bg-[#154f30] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#1b613c] transition-colors shadow-sm"
        >
          <Plus size={20} />
          <span className="font-medium">+ नवीन उत्पादन</span>
        </button>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
          <div className="relative w-full md:w-80">
            <input 
              type="text" 
              placeholder="उत्पादनाचे नाव शोधा..." 
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#154f30] text-sm"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-gray-600 text-sm">
                <th className="p-4 font-semibold whitespace-nowrap">उत्पादन (Product)</th>
                <th className="p-4 font-semibold whitespace-nowrap">प्रकार (Category)</th>
                <th className="p-4 font-semibold whitespace-nowrap">किंमत (Price)</th>
                <th className="p-4 font-semibold whitespace-nowrap">MRP</th>
                <th className="p-4 font-semibold whitespace-nowrap">स्टॉक (Stock)</th>
                <th className="p-4 font-semibold whitespace-nowrap">स्थिती (Status)</th>
                <th className="p-4 font-semibold text-center whitespace-nowrap">कृती (Action)</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {products.length > 0 ? (
                products.map((product) => {
                  const status = product.stock > 10 ? 'Active' : (product.stock > 0 ? 'Low Stock' : 'Out of Stock');
                  return (
                    <tr key={product._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="p-4 font-semibold text-gray-800 flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded border border-gray-200 overflow-hidden">
                          <img src={product.image || 'https://via.placeholder.com/150'} alt="Img" className="w-full h-full object-cover" />
                        </div>
                        {product.name}
                      </td>
                      <td className="p-4 text-gray-600">{product.category}</td>
                      <td className="p-4 font-bold text-gray-800">₹ {product.price}</td>
                      <td className="p-4 text-gray-500 line-through">₹ {product.mrp}</td>
                      <td className="p-4 font-medium text-gray-800">{product.stock}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          status === 'Active' ? 'bg-green-100 text-green-700' : 
                          status === 'Low Stock' ? 'bg-orange-100 text-orange-700' : 
                          'bg-red-100 text-red-700'
                        }`}>
                          {status}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex justify-center space-x-4">
                          <button 
                            onClick={() => handleEditClick(product)}
                            className="text-blue-500 hover:text-blue-700 transition-colors" 
                            title="Edit"
                          >
                            <Edit size={18} />
                          </button>
                          <button 
                            onClick={() => confirmDelete(product)}
                            className="text-red-500 hover:text-red-700 transition-colors" 
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="p-6 text-center text-gray-500 font-medium">कोणतीही उत्पादने उपलब्ध नाहीत.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ४. सेंटर डिलीट कन्फर्मेशन मॉडेल */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 text-center shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="w-14 h-14 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={28} />
            </div>
            
            <h3 className="text-lg font-black text-gray-800">उत्पादन डिलीट करायचे आहे का?</h3>
            <p className="text-xs text-gray-500 mt-2 leading-relaxed">
              तुम्ही नक्की <span className="font-bold text-gray-700">"{productToDelete?.name}"</span> डिलीट करू इच्छिता? ही कृती परत पूर्ववत करता येणार नाही.
            </p>

            <div className="grid grid-cols-2 gap-3 mt-6">
              <button 
                onClick={() => setDeleteModalOpen(false)}
                className="w-full py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition-all"
              >
                नाही (रद्द करा)
              </button>
              <button 
                onClick={handleDeleteProduct}
                className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md shadow-red-200 transition-all"
              >
                होय (डिलीट करा)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ५. ॲड / एडिट मॉडेल */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50">
              <h2 className="text-lg font-bold text-gray-800">
                {editId ? 'उत्पादन अपडेट करा' : 'नवीन उत्पादन ॲड करा'}
              </h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-red-500 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">नाव (Name)</label>
                  <input required type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#154f30]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">प्रकार (Category)</label>
                  <select required value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#154f30]">
                    <option value="">निवडा...</option>
                    <option value="खते">खते</option>
                    <option value="बियाणे">बियाणे</option>
                    <option value="कीटकनाशक">कीटकनाशक</option>
                    <option value="बुरशीनाशक">बुरशीनाशक</option>
                    <option value="सिंचन">सिंचन</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">किंमत (Price)</label>
                  <input required type="number" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#154f30]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">MRP</label>
                  <input required type="number" value={formData.mrp} onChange={(e) => setFormData({...formData, mrp: e.target.value})} className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#154f30]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">स्टॉक (Stock)</label>
                  <input required type="number" value={formData.stock} onChange={(e) => setFormData({...formData, stock: e.target.value})} className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#154f30]" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">फोटोची लिंक (Image URL)</label>
                <input required type="url" placeholder="उदा. https://images.unsplash.com/..." value={formData.image} onChange={(e) => setFormData({...formData, image: e.target.value})} className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#154f30] text-sm" />
                <p className="text-[10px] text-gray-500 mt-1">सध्या इंटरनेटवरील फोटोची लिंक येथे टाका.</p>
              </div>

              <button type="submit" className="w-full bg-[#154f30] text-white py-2.5 rounded-lg font-bold hover:bg-[#1b613c] transition-all mt-2">
                {editId ? 'बदल सेव्ह करा' : 'उत्पादन सेव्ह करा'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;