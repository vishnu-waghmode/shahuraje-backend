const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');

// १. युझरची कार्ट मिळवणे (GET)
router.get('/:userId', async (req, res) => {
  try {
    let cart = await Cart.findOne({ userId: req.params.userId });
    if (!cart) cart = { items: [] }; // कार्ट नसेल तर रिकामी पाठवा
    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// २. कार्टमध्ये प्रॉडक्ट ॲड करणे (POST)
router.post('/add', async (req, res) => {
  const { userId, productId, productDetails, quantity } = req.body;
  try {
    let cart = await Cart.findOne({ userId });

    if (cart) {
      // जर कार्ट आधीच असेल, तर प्रॉडक्ट आधीपासून आहे का ते तपासा
      const itemIndex = cart.items.findIndex(p => p.productId === productId);
      if (itemIndex > -1) {
        cart.items[itemIndex].quantity += quantity; // आधीच असेल तर फक्त संख्या वाढवा
      } else {
        cart.items.push({ productId, ...productDetails, quantity }); // नवीन ॲड करा
      }
    } else {
      // युझरची पहिलीच वेळ असेल तर नवीन कार्ट बनवा
      cart = new Cart({
        userId,
        items: [{ productId, ...productDetails, quantity }]
      });
    }
    
    await cart.save();
    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ३. Quantity अपडेट करणे (+ किंवा -) (PUT)
router.put('/update', async (req, res) => {
  const { userId, productId, action } = req.body;
  try {
    let cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const itemIndex = cart.items.findIndex(p => p.productId === productId);
    if (itemIndex > -1) {
      if (action === 'increase') {
        cart.items[itemIndex].quantity += 1;
      } else if (action === 'decrease' && cart.items[itemIndex].quantity > 1) {
        cart.items[itemIndex].quantity -= 1;
      }
      await cart.save();
    }
    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ४. कार्टमधून प्रॉडक्ट पूर्णपणे काढणे (DELETE)
router.delete('/remove', async (req, res) => {
  const { userId, productId } = req.body;
  try {
    let cart = await Cart.findOne({ userId });
    if (cart) {
      cart.items = cart.items.filter(p => p.productId !== productId);
      await cart.save();
    }
    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;