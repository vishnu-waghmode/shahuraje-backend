const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Routes इम्पोर्ट करणे
const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/userRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes'); // <-- पेमेंट राऊट इम्पोर्ट केला
const deliveryRoutes = require('./routes/deliveryRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB शी यशस्वीरित्या कनेक्ट झाले!'))
    .catch((err) => console.log('MongoDB कनेक्शन एरर:', err));

// API Routes वापरणे
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes); // <-- पेमेंट राऊट ऍक्टिव्हेट केला
app.use('/api/delivery', deliveryRoutes);
app.use('/api/notifications', notificationRoutes);

app.get('/', (req, res) => {
    res.send('शाहूराजे कृषी केंद्र - Backend API चालू आहे...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});