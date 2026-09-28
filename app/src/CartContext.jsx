import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  
  // तुझ्या Node.js API ची मुख्य लिंक (पोर्ट 5000 असेल तर)
  const API_URL = 'http://localhost:5000/api/cart';

  // लोकल स्टोरेजमधून सध्या लॉगिन असलेल्या युझरची माहिती मिळवणे
  const getUser = () => {
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch (error) {
      return null;
    }
  };

  // १. डेटाबेसमधून युझरची कार्ट लोड करणे
  const loadCart = async () => {
    const currentUser = getUser();
    if (currentUser && currentUser._id) {
      try {
        const response = await axios.get(`${API_URL}/${currentUser._id}`);
        // डेटाबेसमध्ये items नावाची array आहे, ती setCartItems ला देणे
        setCartItems(response.data.items || []);
      } catch (error) {
        console.error('कार्ट लोड करताना एरर:', error);
      }
    } else {
      setCartItems([]); // युझर लॉगिन नसेल तर कार्ट रिकामी
    }
  };

  // जेव्हा ॲप पहिल्यांदा उघडेल तेव्हा कार्ट लोड करा
  useEffect(() => {
    loadCart();
  }, []);

  // २. कार्टमध्ये नवीन प्रॉडक्ट ॲड करणे
  const addToCart = async (product) => {
    const currentUser = getUser();
    if (!currentUser) {
      alert("कार्टमध्ये प्रॉडक्ट ॲड करण्यासाठी कृपया आधी लॉगिन करा!");
      return;
    }

    try {
      const productId = product._id || product.id;
      
      // Node.js ला POST Request पाठवणे
      const response = await axios.post(`${API_URL}/add`, {
        userId: currentUser._id,
        productId: productId,
        productDetails: {
          name: product.name,
          price: product.price,
          image: product.image
        },
        quantity: 1
      });
      
      // API ने दिलेली नवीन कार्ट अपडेट करणे
      setCartItems(response.data.items);
    } catch (error) {
      console.error('कार्टमध्ये ॲड करताना एरर:', error);
    }
  };

  // ३. संख्या वाढवणे (+)
  const increaseQty = async (productId) => {
    const currentUser = getUser();
    if (!currentUser) return;

    try {
      const response = await axios.put(`${API_URL}/update`, {
        userId: currentUser._id,
        productId: productId,
        action: 'increase'
      });
      setCartItems(response.data.items);
    } catch (error) {
      console.error('संख्या वाढवताना एरर:', error);
    }
  };

  // ४. संख्या कमी करणे (-)
  const decreaseQty = async (productId) => {
    const currentUser = getUser();
    if (!currentUser) return;

    try {
      const response = await axios.put(`${API_URL}/update`, {
        userId: currentUser._id,
        productId: productId,
        action: 'decrease'
      });
      setCartItems(response.data.items);
    } catch (error) {
      console.error('संख्या कमी करताना एरर:', error);
    }
  };

  // ५. कार्टमधून प्रॉडक्ट काढून टाकणे (Trash Icon)
  const removeItem = async (productId) => {
    const currentUser = getUser();
    if (!currentUser) return;

    try {
      const response = await axios.delete(`${API_URL}/remove`, {
        data: { userId: currentUser._id, productId: productId }
      });
      setCartItems(response.data.items);
    } catch (error) {
      console.error('आयटम हटवताना एरर:', error);
    }
  };

  // ६. कार्ट पूर्ण रिकामी करणे (उदा. पेमेंट यशस्वी झाल्यावर)
  const clearCart = () => {
    setCartItems([]);
    // (भविष्यात बॅकएंडला डिलीट कार्टची API बनवली तर ती इथे कॉल करू शकता)
  };

  return (
    <CartContext.Provider 
      value={{ 
        cartItems, 
        addToCart, 
        increaseQty, 
        decreaseQty, 
        removeItem, 
        clearCart,
        loadCart // लॉगिन पेजवरून थेट कॉल करण्यासाठी
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);