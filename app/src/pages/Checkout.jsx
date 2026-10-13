import React, { useState, useEffect } from 'react';
import { IonPage, IonContent } from '@ionic/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, User, CreditCard, Banknote, ShieldCheck, Loader2 } from 'lucide-react';
import { useCart } from '../CartContext';

const API_BASE_URL = 'https://shahuraje-backend-1.onrender.com';

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartItems, clearCart } = useCart();
  
  const cartTotal = location.state?.total || 0;

  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('COD');
  
  const [address, setAddress] = useState({
    fullName: '',
    phone: '',
    village: '',
    fullAddress: '',
    pincode: ''
  });

  // पेज लोड झाल्यावर जुना सेव्ह केलेला पत्ता चेक करणे (Auto-fill)
  useEffect(() => {
    const savedAddress = localStorage.getItem('savedDeliveryAddress');
    if (savedAddress) {
      try {
        setAddress(JSON.parse(savedAddress));
      } catch (e) {
        console.error("Address parsing error:", e);
      }
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAddress({ ...address, [name]: value });
  };

  // १. Cash on Delivery (COD) साठी ऑर्डर सेव्ह करणे
  const handleCodOrder = async (orderData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/orders/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('savedDeliveryAddress', JSON.stringify(address));
        alert("तुमची ऑर्डर यशस्वीरित्या नोंदवली गेली आहे!");
        clearCart(); 
        navigate('/orders', { replace: true });
      } else {
        alert("ऑर्डर करताना एरर आला: " + (data.error || "Please try again"));
      }
    } catch (error) {
      console.error("COD Order API Error:", error);
      alert("सर्व्हरशी संपर्क होऊ शकला नाही!");
    } finally {
      setLoading(false);
    }
  };

  // २. Razorpay Online Payment प्रक्रिया
  const handleOnlinePayment = async (orderData) => {
    try {
      // Step A: बॅकएंडकडून Razorpay चा सुरक्षित Order ID मागवणे
      const createRes = await fetch(`${API_BASE_URL}/api/payment/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: cartTotal })
      });

      const createData = await createRes.json();

      if (!createData.success) {
        alert("पेमेंट ऑर्डर तयार करता आली नाही: " + (createData.error || "सर्व्हर त्रुटी"));
        setLoading(false);
        return;
      }

      // Step B: Razorpay SDK उपलब्ध असल्याची खात्री करणे
      if (!window.Razorpay) {
        alert("Razorpay पेमेंट गेटवे लोड झाले नाही. कृपया इंटरनेट तपासा आणि पेज रिफ्रेश करा.");
        setLoading(false);
        return;
      }

      // Step C: Razorpay चा Checkout पॉपअप कॉन्फिगरेशन
      const options = {
        key: createData.keyId,
        amount: createData.amount,
        currency: createData.currency,
        name: 'शाहूराजे कृषी केंद्र',
        description: 'शेती साहित्य खरेदी बिल',
        order_id: createData.orderId,
        handler: async function (response) {
          // Step D: पेमेंट झाल्यानंतर बॅकएंडकडे व्हेरिफाय करणे
          try {
            const verifyRes = await fetch(`${API_BASE_URL}/api/payment/verify-payment`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderData: {
                  ...orderData,
                  paymentStatus: 'Paid'
                }
              })
            });

            const verifyData = await verifyRes.json();

            if (verifyData.success) {
              localStorage.setItem('savedDeliveryAddress', JSON.stringify(address));
              alert("पेमेंट यशस्वी झाले! ऑर्डर नोंदवली गेली आहे.");
              clearCart();
              navigate('/orders', { replace: true });
            } else {
              alert("पेमेंट व्हेरिफाय होऊ शकले नाही: " + verifyData.error);
            }
          } catch (err) {
            console.error("Verification error:", err);
            alert("पेमेंट व्हेरिफाय करताना सर्व्हरशी संपर्क तुटला!");
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: address.fullName,
          contact: address.phone
        },
        theme: {
          color: '#0c542b'
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          }
        }
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.open();

    } catch (error) {
      console.error("Online payment error:", error);
      alert("पेमेंट गेटवे सुरू करताना त्रुटी आली!");
      setLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (!user || (!user.id && !user._id)) {
      alert("कृपया आधी लॉगिन करा!");
      return;
    }

    if (!address.fullName || !address.phone || !address.village || !address.fullAddress) {
      alert("कृपया पत्त्याची सर्व माहिती अचूक भरा!");
      return;
    }

    setLoading(true);

    const fullDeliveryAddress = `${address.fullName}, ${address.phone}, ${address.fullAddress}, ${address.village} - ${address.pincode}`;

    const orderData = {
      userId: user.id || user._id,
      customerName: address.fullName,
      phone: address.phone,
      shippingAddress: {
        fullName: address.fullName,
        name: address.fullName,
        phone: address.phone,
        village: address.village,
        pincode: address.pincode,
        address: address.fullAddress,
        city: address.village
      },
      items: cartItems.map(item => ({
        productId: item._id || item.id, 
        quantity: item.quantity,
        price: item.price
      })),
      totalAmount: cartTotal,
      deliveryAddress: fullDeliveryAddress,
      paymentMethod: paymentMethod
    };

    if (paymentMethod === 'ONLINE') {
      await handleOnlinePayment(orderData);
    } else {
      await handleCodOrder(orderData);
    }
  };

  return (
    <IonPage>
      <IonContent className="bg-gray-50">
        <div className="w-full min-h-full flex flex-col pb-32">
          
          <div className="bg-white px-4 pb-3 shadow-sm sticky top-0 z-20 flex items-center space-x-3 pt-6">
            <button 
              onClick={() => navigate(-1)}
              className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 text-gray-800 transition-all"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-lg font-black text-gray-800">चेकआउट (Checkout)</h1>
          </div>

          <div className="px-4 pt-5 space-y-6">
            
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center space-x-2 mb-4">
                <MapPin className="text-[#0c542b]" size={20} />
                <h2 className="font-bold text-base text-gray-800">डिलिव्हरी पत्ता (Delivery Address)</h2>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <User className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input 
                    type="text" name="fullName" value={address.fullName} onChange={handleInputChange}
                    placeholder="संपूर्ण नाव (Full Name)" 
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#0c542b] focus:bg-white"
                  />
                </div>
                
                <div className="relative">
                  <Phone className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input 
                    type="tel" name="phone" value={address.phone} onChange={handleInputChange}
                    placeholder="मोबाईल नंबर (Mobile No)" 
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#0c542b] focus:bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <input 
                    type="text" name="village" value={address.village} onChange={handleInputChange}
                    placeholder="गाव / शहर (Village)" 
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#0c542b] focus:bg-white"
                  />
                  <input 
                    type="number" name="pincode" value={address.pincode} onChange={handleInputChange}
                    placeholder="पिनकोड (Pincode)" 
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#0c542b] focus:bg-white"
                  />
                </div>

                <textarea 
                  name="fullAddress" value={address.fullAddress} onChange={handleInputChange}
                  placeholder="संपूर्ण पत्ता (घर क्र., जवळची खूण)" rows="2"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#0c542b] focus:bg-white resize-none"
                />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center space-x-2 mb-4">
                <CreditCard className="text-[#0c542b]" size={20} />
                <h2 className="font-bold text-base text-gray-800">पेमेंट पर्याय (Payment Method)</h2>
              </div>

              <div className="space-y-3">
                <label className={`flex items-center p-3 rounded-xl border cursor-pointer transition-all ${paymentMethod === 'COD' ? 'border-[#0c542b] bg-green-50/50' : 'border-gray-200'}`}>
                  <input type="radio" name="payment" value="COD" checked={paymentMethod === 'COD'} onChange={(e) => setPaymentMethod(e.target.value)} className="w-4 h-4 text-[#0c542b] focus:ring-[#0c542b]" />
                  <div className="ml-3 flex items-center space-x-2">
                    <Banknote className="text-green-600" size={20} />
                    <div>
                      <h3 className="font-bold text-sm text-gray-800">Cash on Delivery (COD)</h3>
                      <p className="text-xs text-gray-500">ऑर्डर मिळाल्यावर पैसे द्या</p>
                    </div>
                  </div>
                </label>

                <label className={`flex items-center p-3 rounded-xl border cursor-pointer transition-all ${paymentMethod === 'ONLINE' ? 'border-[#0c542b] bg-green-50/50' : 'border-gray-200'}`}>
                  <input type="radio" name="payment" value="ONLINE" checked={paymentMethod === 'ONLINE'} onChange={(e) => setPaymentMethod(e.target.value)} className="w-4 h-4 text-[#0c542b] focus:ring-[#0c542b]" />
                  <div className="ml-3 flex items-center space-x-2">
                    <ShieldCheck className="text-blue-600" size={20} />
                    <div>
                      <h3 className="font-bold text-sm text-gray-800">Online Payment</h3>
                      <p className="text-xs text-gray-500">Google Pay, PhonePe, UPI, Cards</p>
                    </div>
                  </div>
                </label>
              </div>
            </div>

          </div>
        </div>
      </IonContent>

      <div className="fixed left-0 right-0 bg-white border-t border-gray-100 p-4 z-40 rounded-t-3xl shadow-[0_-10px_20px_rgba(0,0,0,0.05)] bottom-0">
        <div className="flex justify-between items-center mb-3 px-2">
          <span className="text-sm font-semibold text-gray-600">Total Amount</span>
          <span className="text-lg font-black text-[#0c542b]">₹{cartTotal}</span>
        </div>
        <button 
          onClick={handlePlaceOrder}
          disabled={loading}
          className="w-full bg-[#0c542b] text-white py-3.5 rounded-2xl font-bold text-sm shadow-md hover:bg-[#083a1d] active:scale-95 transition-all flex items-center justify-center disabled:opacity-70"
        >
          {loading ? <Loader2 className="animate-spin mr-2" size={20} /> : null}
          {loading ? 'Processing...' : paymentMethod === 'ONLINE' ? 'पेमेंट करा आणि ऑर्डर नोंदवा' : 'ऑर्डर कन्फर्म करा'}
        </button>
      </div>
    </IonPage>
  );
};

export default Checkout;