import React, { useState, useEffect } from 'react';
import { IonPage, IonContent } from '@ionic/react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, MapPin, Navigation, Loader2 } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Leaflet च्या डीफॉल्ट आयकॉनचा प्रॉब्लेम फिक्स करण्यासाठी
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// डिलिव्हरी बॉयसाठी बाईक/गाडीचा कस्टम आयकॉन
const deliveryBoyIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/2830/2830312.png',
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  popupAnchor: [0, -20],
});

const API_BASE_URL = 'https://shahuraje-backend-1.onrender.com';

const TrackDelivery = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [boyLocation, setBoyLocation] = useState(null);

  useEffect(() => {
    fetchOrderDetails();

    // डिलिव्हरी बॉयचे लोकेशन सतत अपडेट ठेवण्यासाठी Polling (दर ५ सेकंदांनी)
    const interval = setInterval(() => {
      fetchOrderDetails(false);
    }, 5000);

    return () => clearInterval(interval);
  }, [orderId]);

  const fetchOrderDetails = async (showLoader = true) => {
    if (showLoader) setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders`);
      const data = await res.json();
      const allOrders = Array.isArray(data) ? data : data.orders || [];
      const currentOrder = allOrders.find((o) => o._id === orderId);

      if (currentOrder) {
        setOrder(currentOrder);
        if (currentOrder.deliveryBoyLocation?.lat && currentOrder.deliveryBoyLocation?.lng) {
          setBoyLocation([currentOrder.deliveryBoyLocation.lat, currentOrder.deliveryBoyLocation.lng]);
        }
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  return (
    <IonPage>
      <IonContent fullscreen className="bg-gray-50">
        <div className="w-full h-full flex flex-col">
          
          {/* Header */}
          <div className="bg-white px-4 py-3 shadow-sm flex items-center space-x-3 pt-6 z-20">
            <button
              onClick={() => navigate(-1)}
              className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 text-gray-800 transition-all"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-lg font-black text-gray-800">डिलिव्हरी ट्रॅकिंग</h1>
          </div>

          {loading ? (
            <div className="flex-1 flex flex-col justify-center items-center text-gray-500 gap-2">
              <Loader2 className="animate-spin text-[#0c542b]" size={30} />
              <span className="text-sm font-semibold">नकाशा लोड होत आहे...</span>
            </div>
          ) : (
            <div className="flex-1 flex flex-col relative">
              
              {/* Leaflet Map Container */}
              <div className="flex-1 w-full bg-gray-100 relative z-10">
                {boyLocation ? (
                  <MapContainer center={boyLocation} zoom={15} className="h-full w-full">
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; OpenStreetMap contributors'
                    />
                    <Marker position={boyLocation} icon={deliveryBoyIcon}>
                      <Popup>डिलिव्हरी बॉय येथे आहे 🚚</Popup>
                    </Marker>
                  </MapContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center p-6 text-center text-gray-500">
                    <Navigation size={48} className="text-[#0c542b] mb-3 animate-pulse" />
                    <h3 className="font-bold text-gray-800 text-base">डिलिव्हरी पार्टनर निघत आहे...</h3>
                    <p className="text-xs text-gray-500 mt-1">
                      डिलिव्हरी बॉयने प्रवास सुरू केल्यावर त्याचे थेट लोकेशन नकाशावर दिसेल.
                    </p>
                  </div>
                )}
              </div>

              {/* Bottom Delivery Info Card */}
              <div className="bg-white p-5 rounded-t-3xl shadow-[0_-5px_20px_rgba(0,0,0,0.08)] z-20 border-t border-gray-100 space-y-4">
                
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-xs font-bold text-gray-400 uppercase">ऑर्डर स्टेटस</span>
                    <h3 className="font-black text-gray-800 text-base">
                      {order?.deliveryStatus === 'Picked_Up' ? 'रस्त्यात आहे (Out for Delivery)' : 
                       order?.deliveryStatus === 'Delivered' ? 'ऑर्डर पोहोचली' : 'तयार होत आहे'}
                    </h3>
                  </div>
                  <span className="text-xs font-bold px-3 py-1 bg-green-50 text-[#0c542b] rounded-full">
                    ₹{order?.totalAmount}
                  </span>
                </div>

                {/* Delivery Boy Details & Call Button */}
                {order?.deliveryBoyId && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-[#0c542b] text-white flex items-center justify-center font-bold text-sm">
                        {order.deliveryBoyId.name ? order.deliveryBoyId.name.charAt(0).toUpperCase() : 'D'}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-gray-800">{order.deliveryBoyId.name || 'डिलिव्हरी बॉय'}</h4>
                        <p className="text-xs text-gray-500">शाहूराजे डिलिव्हरी पार्टनर</p>
                      </div>
                    </div>

                    {order.deliveryBoyId.phone && (
                      <a
                        href={`tel:${order.deliveryBoyId.phone}`}
                        className="p-2.5 bg-[#0c542b] text-white rounded-xl shadow-sm hover:bg-[#083a1d] transition-all"
                      >
                        <Phone size={18} />
                      </a>
                    )}
                  </div>
                )}

                {/* Farmer Address */}
                <div className="flex items-start space-x-2 text-xs text-gray-500">
                  <MapPin size={16} className="text-[#0c542b] shrink-0 mt-0.5" />
                  <span>{order?.deliveryAddress}</span>
                </div>

              </div>

            </div>
          )}

        </div>
      </IonContent>
    </IonPage>
  );
};

export default TrackDelivery;