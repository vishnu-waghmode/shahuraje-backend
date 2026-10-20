const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const fs = require('fs'); // 👉 fs मॉड्यूल इम्पोर्ट केले
require('dotenv').config();

// Firebase Admin सेटअप
const { initializeApp, cert } = require("firebase-admin/app");

// 🔴 Render वरील सिक्रेट फाईलचा अचूक पाथ शोधणे
let serviceAccount;
if (fs.existsSync('/etc/secrets/firebase-admin-key.json')) {
    serviceAccount = require('/etc/secrets/firebase-admin-key.json');
} else {
    serviceAccount = require('./firebase-admin-key.json'); // Local साठी
}

// Firebase ॲप इनिशियलाईज करणे
initializeApp({
  credential: cert(serviceAccount)
});

const app = express();
app.use(cors());

// Base64 इमेज मोठी असू शकते, त्यामुळे limit वाढवणे गरजेचे आहे.
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Routes इम्पोर्ट करणे
const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/userRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes'); 
const deliveryRoutes = require('./routes/deliveryRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const advisoryRoutes = require('./routes/advisoryRoutes'); 

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB शी यशस्वीरित्या कनेक्ट झाले!'))
    .catch((err) => console.log('MongoDB कनेक्शन एरर:', err));

// API Routes वापरणे
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes); 
app.use('/api/delivery', deliveryRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/advisory', advisoryRoutes); 

app.get('/', (req, res) => {
    res.send('शाहूराजे कृषी केंद्र - Backend API चालू आहे...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});