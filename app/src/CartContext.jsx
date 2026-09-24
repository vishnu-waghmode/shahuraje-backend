import React, { createContext, useState, useEffect, useContext } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  // १. आधी localStorage मधून जुनी कार्ट लोड करणे (रिफ्रेश झाल्यावर डेटा टिकून राहील)
  const [cartItems, setCartItems] = useState(() => {
    try {
      const savedCart = localStorage.getItem('shahuraje_cart');
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      return [];
    }
  });

  // २. जेव्हा जेव्हा कार्टमध्ये बदल होईल, तेव्हा तो आपोआप localStorage मध्ये सेव्ह होईल
  useEffect(() => {
    localStorage.setItem('shahuraje_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // प्रॉडक्ट ॲड करणे
  const addToCart = (product) => {
    setCartItems((prevItems) => {
      // मोंगोडीबी मध्ये _id असतो किंवा id असतो, दोन्ही तपासा
      const productId = product._id || product.id;
      const existingItem = prevItems.find(item => (item._id || item.id) === productId);

      if (existingItem) {
        return prevItems.map(item => 
          (item._id || item.id) === productId ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevItems, { ...product, quantity: 1 }];
    });
  };

  // संख्या वाढवणे (+)
  const increaseQty = (id) => {
    setCartItems(cartItems.map(item => 
      (item._id || item.id) === id ? { ...item, quantity: item.quantity + 1 } : item
    ));
  };

  // संख्या कमी करणे (-)
  const decreaseQty = (id) => {
    setCartItems(cartItems.map(item => 
      (item._id || item.id) === id && item.quantity > 1 ? { ...item, quantity: item.quantity - 1 } : item
    ));
  };

  // कार्टमधून काढून टाकणे
  const removeItem = (id) => {
    setCartItems(cartItems.filter(item => (item._id || item.id) !== id));
  };

  // कार्ट पूर्ण रिकामी करणे (पेमेंट झाल्यावर लागते)
  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('shahuraje_cart');
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, increaseQty, decreaseQty, removeItem, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);