const express = require('express');
const router = express.Router();
const CropAdvisory = require('../models/CropAdvisory');
const Notification = require('../models/Notification'); 
const User = require('../models/User'); 
const admin = require('firebase-admin'); 
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// १. शेतकऱ्याने नवीन फोटो/तक्रार पाठवणे
router.post('/create', async (req, res) => {
  try {
    const { userId, description, imageBase64 } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ success: false, error: "Photo avashyak ahe" });
    }

    const uploadResponse = await cloudinary.uploader.upload(imageBase64, {
      folder: "crop_advisory"
    });

    const newAdvisory = new CropAdvisory({
      userId,
      image: uploadResponse.secure_url,
      description
    });

    await newAdvisory.save();

    try {
      await Notification.create({
        userId: null, 
        title: 'नवीन पिकाची तक्रार आली आहे! 🌾',
        message: 'एका शेतकऱ्याने पिकाच्या समस्येचा फोटो पाठवला आहे. कृपया तपासा.',
        isRead: false
      });
    } catch (notifErr) {
      console.error("Admin Notification creation error:", notifErr);
    }

    res.status(201).json({ success: true, message: "Takrar pathavali", data: newAdvisory });
  } catch (error) {
    console.error("Crop Advisory Error:", error);
    res.status(500).json({ success: false, error: "Server Error" });
  }
});

// २. शेतकऱ्याने स्वतःच्या जुन्या तक्रारी बघणे
router.get('/user/:userId', async (req, res) => {
  try {
    const history = await CropAdvisory.find({ userId: req.params.userId })
        .populate('suggestedProducts')
        .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: history });
  } catch (error) {
    res.status(500).json({ success: false, error: "Server Error" });
  }
});

// ३. ॲडमिनने सर्व तक्रारी बघणे
router.get('/admin/all', async (req, res) => {
  try {
    const allQueries = await CropAdvisory.find()
        .populate('userId', 'name phone')
        .populate('suggestedProducts')
        .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: allQueries });
  } catch (error) {
    res.status(500).json({ success: false, error: "Server Error" });
  }
});

// ४. ॲडमिनने औषध सुचवणे व शेतकऱ्याला नोटिफिकेशन/Push पाठवणे
router.put('/admin/resolve/:id', async (req, res) => {
  try {
    const { suggestedProducts, adminMessage } = req.body;
    
    const updated = await CropAdvisory.findByIdAndUpdate(
        req.params.id,
        { status: 'Resolved', suggestedProducts, adminMessage },
        { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, error: "तक्रार सापडली नाही" });
    }

    try {
      // ॲपच्या आत दाखवण्यासाठी डेटाबेसमध्ये सेव्ह
      await Notification.create({
        userId: updated.userId,
        title: 'पिकांच्या डॉक्टरकडून सल्ला मिळाला! 🌱',
        message: 'तज्ज्ञांनी तुमच्या पिकावर योग्य औषध सुचवले आहे. पाहण्यासाठी क्लिक करा.',
        isRead: false
      });

      // 🔴 Firebase द्वारे मोबाईलच्या Status Bar वर Push Notification पाठवा
      const farmer = await User.findById(updated.userId);
      if (farmer && farmer.fcmToken) {
          
          // 👇 तू दिलेला साधा कोड इथे ॲड केला आहे 👇
          const message = {
              notification: {
                  title: 'पिकांच्या डॉक्टरकडून सल्ला! 🌱',
                  body: 'तज्ज्ञांनी तुमच्या पिकावर योग्य औषध सुचवले आहे.'
              },
              token: farmer.fcmToken
          };
          // 👆 इथपर्यंत 👆

          await admin.messaging().send(message);
          console.log('✅ Firebase Push Notification यशस्वीरीत्या पाठवले!');
      } else {
          console.log('❌ शेतकऱ्याचा FCM Token सापडला नाही.');
      }

    } catch (notifErr) {
      console.error("Notification creation error:", notifErr);
    }

    res.status(200).json({ success: true, message: "औषध सुचवले आणि नोटिफिकेशन पाठवली!", data: updated });
  } catch (error) {
    console.error("Resolve Error:", error);
    res.status(500).json({ success: false, error: "Server Error" });
  }
});

module.exports = router;