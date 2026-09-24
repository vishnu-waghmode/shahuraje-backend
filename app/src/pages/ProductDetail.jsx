import React, { useState, useEffect } from 'react';
import { IonPage, IonContent } from '@ionic/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Star, ShieldCheck, Truck, Plus, Minus } from 'lucide-react';
import { useCart } from '../CartContext';

const ProductDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartItems, addToCart } = useCart();

  // मागील पेजवरून (Home किंवा Listing) पाठवलेले प्रॉडक्ट घेणे
  const passedProduct = location.state?.product;

  const [product, setProduct] = useState(passedProduct || null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (passedProduct) {
      setProduct(passedProduct);
    }
  }, [passedProduct]);

  const increaseQty = () => setQuantity(prev => prev + 1);
  const decreaseQty = () => setQuantity(prev => (quantity > 1 ? prev - 1 : 1));

  // कार्टमध्ये जोडणे (निवडलेल्या प्रमाणानुसार)
  const handleAddToCart = () => {
    if (!product) return;
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
    alert(`${product.name} (${quantity}) कार्टमध्ये जोडले गेले!`);
  };

  // थेट खरेदी करणे (कार्टमध्ये जोडून लगेच कार्ट पेजवर जाणे)
  const handleBuyNow = () => {
    if (!product) return;
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
    navigate('/cart');
  };

  // जर काही कारणाने युझर थेट URL ने आला आणि प्रॉडक्ट नसेल
  if (!product) {
    return (
      <IonPage>
        <IonContent fullscreen className="bg-gray-50">
          <div className="p-6 text-center pt-20">
            <p className="text-gray-600 font-bold mb-4">उत्पादनाची माहिती सापडली नाही.</p>
            <button 
              onClick={() => navigate('/home')}
              className="bg-[#0c542b] text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md"
            >
              मुख्य पानावर जा
            </button>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  // मूळ किंमत (MRP) नसल्यास १०% जास्त अंदाजे किंमत दाखवण्यासाठी
  const originalPrice = product.originalPrice || Math.round(product.price * 1.2);

  return (
    <IonPage>
      <IonContent fullscreen className="bg-gray-50">
        <div className="w-full min-h-full flex flex-col justify-between pb-24">

          {/* १. टॉप हेडर (Back Button & Cart) */}
          <div 
            className="bg-white px-4 pb-3 shadow-sm sticky top-0 z-20 flex items-center justify-between"
            style={{ paddingTop: 'calc(env(safe-area-inset-top) + 14px)' }}
          >
            <button 
              onClick={() => navigate(-1)}
              className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 text-gray-800 transition-all"
            >
              <ArrowLeft size={20} />
            </button>
            
            <h1 className="text-base font-black text-gray-800">उत्पादन तपशील</h1>
            
            <div 
              onClick={() => navigate('/cart')}
              className="relative bg-gray-100 p-2 rounded-full cursor-pointer hover:bg-gray-200"
            >
              <ShoppingCart size={20} className="text-[#0c542b]" />
              {cartItems.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold shadow-sm">
                  {cartItems.length}
                </span>
              )}
            </div>
          </div>

          <div className="px-4 pt-4 space-y-4">

            {/* २. प्रॉडक्टचा मोठा फोटो आणि बॅज */}
            <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center relative">
              <span className="absolute top-4 left-4 bg-green-50 text-green-700 text-[10px] font-bold px-2.5 py-1 rounded-lg">
                {product.category || 'शेती उत्पादन'}
              </span>
              <span className="absolute top-4 right-4 bg-amber-50 text-amber-700 text-[10px] font-bold px-2 py-1 rounded-lg flex items-center">
                <Star size={12} className="fill-amber-500 text-amber-500 mr-1" /> {product.rating || '4.5'} ({product.reviewsCount || '18'} रिव्ह्यूज)
              </span>

              <div className="w-full h-56 bg-gray-50 rounded-2xl mt-6 overflow-hidden flex items-center justify-center">
                <img 
                  src={product.image || 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=500'} 
                  alt={product.name} 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* ३. प्रॉडक्टचे नाव आणि किंमत */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-black text-gray-900 leading-snug">
                {product.name}
              </h2>
              <p className="text-xs text-gray-500 font-medium mt-1">
                {product.shortDescription || product.description || 'पिकांच्या उत्तम वाढीसाठी आणि अधिक उत्पादनासाठी अत्यंत गुणकारी.'}
              </p>

              <div className="mt-3 flex items-center justify-between">
                <div>
                  <span className="text-2xl font-black text-[#0c542b]">₹{product.price}</span>
                  <span className="text-xs text-gray-400 line-through ml-2">₹{originalPrice}</span>
                </div>
                <span className="text-xs font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
                  {product.inStock !== false ? 'स्टॉकमध्ये उपलब्ध' : 'स्टॉक संपला आहे'}
                </span>
              </div>
            </div>

            {/* ४. प्रमाण (Quantity Selector) */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
              <span className="font-bold text-sm text-gray-800">प्रमाण (Quantity):</span>
              <div className="flex items-center space-x-3 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-xl">
                <button 
                  onClick={decreaseQty}
                  className="p-1 bg-white rounded-lg shadow-sm text-gray-600 hover:bg-gray-100 active:scale-95 transition-all"
                >
                  <Minus size={16} />
                </button>
                <span className="font-black text-base text-gray-800 w-6 text-center">{quantity}</span>
                <button 
                  onClick={increaseQty}
                  className="p-1 bg-white rounded-lg shadow-sm text-gray-600 hover:bg-gray-100 active:scale-95 transition-all"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* ५. मुख्य वैशिष्ट्ये / फायदे (Admin कडून आल्यास Array/List दाखवेल, अन्यथा Default) */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 space-y-2.5">
              <h3 className="font-bold text-sm text-gray-800 mb-1">मुख्य वैशिष्ट्ये व फायदे:</h3>
              
              {Array.isArray(product.features) && product.features.length > 0 ? (
                product.features.map((feat, idx) => (
                  <div key={idx} className="flex items-start space-x-2 text-xs text-gray-600">
                    <span className="text-[#0c542b] font-bold">✔</span>
                    <span>{feat}</span>
                  </div>
                ))
              ) : (
                <>
                  <div className="flex items-start space-x-2 text-xs text-gray-600">
                    <span className="text-[#0c542b] font-bold">✔</span>
                    <span>पिकांची प्रतिकारशक्ती वाढवते आणि पिवळेपणा दूर करण्यास मदत करते.</span>
                  </div>
                  <div className="flex items-start space-x-2 text-xs text-gray-600">
                    <span className="text-[#0c542b] font-bold">✔</span>
                    <span>सर्व प्रकारच्या पिकांसाठी (धान्य, भाजीपाला, फळबागा) अत्यंत उपयुक्त.</span>
                  </div>
                  <div className="flex items-start space-x-2 text-xs text-gray-600">
                    <span className="text-[#0c542b] font-bold">✔</span>
                    <span>उत्तम दर्जाची हमी व १००% अस्सल शेती उत्पादन.</span>
                  </div>
                </>
              )}
            </div>

            {/* ६. खात्रीशीर सेवा (Trust Badges) */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-green-50/50 border border-green-100 p-3 rounded-xl flex items-center space-x-2.5">
                <ShieldCheck size={24} className="text-[#0c542b]" />
                <div>
                  <h4 className="text-xs font-bold text-gray-800">100% अस्सल</h4>
                  <p className="text-[10px] text-gray-500">खात्रीशीर गुणवत्ता</p>
                </div>
              </div>
              <div className="bg-green-50/50 border border-green-100 p-3 rounded-xl flex items-center space-x-2.5">
                <Truck size={24} className="text-[#0c542b]" />
                <div>
                  <h4 className="text-xs font-bold text-gray-800">जलद डिलिव्हरी</h4>
                  <p className="text-[10px] text-gray-500">घरापर्यंत पोहोच</p>
                </div>
              </div>
            </div>

          </div>

          {/* ७. तळाशी ॲड टू कार्ट आणि खरेदी बटण (Fixed Bottom Bar) */}
          <div 
            className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3.5 px-6 flex items-center space-x-3 z-30 shadow-lg"
            style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 14px)' }}
          >
            <button 
              onClick={handleAddToCart}
              className="flex-1 bg-green-50 border border-[#0c542b]/30 text-[#0c542b] py-3 rounded-xl font-bold text-sm shadow-sm hover:bg-green-100 active:scale-95 transition-all"
            >
              कार्ट मध्ये जोडा
            </button>
            <button 
              onClick={handleBuyNow}
              className="flex-1 bg-[#0c542b] text-white py-3 rounded-xl font-bold text-sm shadow-md hover:bg-[#083a1d] active:scale-95 transition-all"
            >
              आता खरेदी करा
            </button>
          </div>

        </div>
      </IonContent>
    </IonPage>
  );
};

export default ProductDetail;