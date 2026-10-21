const express = require('express');
const router = express.Router();
const CropAdvisory = require('../models/CropAdvisory');
const Notification = require('../models/Notification'); 
const User = require('../models/User'); 
const { getMessaging } = require('firebase-admin/messaging'); 
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// १. शेतकऱ्याने नवीन फोटो/तक्रार पाठवणे (आता हा चॅटचा पहिला मेसेज बनेल)
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
      description,
      // 🔴 चॅटची सुरुवात: पहिला मेसेज म्हणून सेव्ह करणे
      messages: [{
        sender: 'farmer',
        text: description || 'माझ्या पिकाला खालील समस्या आली आहे.',
        image: uploadResponse.secure_url
      }]
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

// ४. 🔴 नवीन API: चॅटमध्ये मेसेज किंवा फोटो पाठवणे (Two-way Communication)
router.post('/message/:id', async (req, res) => {
  try {
    const { sender, text, imageBase64 } = req.body; 
    // sender: 'admin' किंवा 'farmer' असेल

    const advisory = await CropAdvisory.findById(req.params.id);
    if (!advisory) {
      return res.status(404).json({ success: false, error: "तक्रार सापडली नाही" });
    }

    let imageUrl = null;
    // जर मेसेजमध्ये नवीन फोटो असेल तर तो Cloudinary वर अपलोड करा
    if (imageBase64) {
      const uploadResponse = await cloudinary.uploader.upload(imageBase64, { 
        folder: "crop_advisory_chat" 
      });
      imageUrl = uploadResponse.secure_url;
    }

    // मेसेज Array मध्ये पुश करा
    advisory.messages.push({
      sender,
      text: text || '',
      image: imageUrl
    });

    // जर ॲडमिनने पहिला रिप्लाय दिला, तर स्टेट्स 'Pending' वरून 'In-Progress' करा
    if (sender === 'admin' && advisory.status === 'Pending') {
      advisory.status = 'In-Progress';
    }

    await advisory.save();

    // जर ॲडमिनने मेसेज केला असेल, तर शेतकऱ्याला पुश नोटिफिकेशन पाठवा
    if (sender === 'admin') {
      try {
        const farmer = await User.findById(advisory.userId);
        if (farmer && farmer.fcmToken) {
          const msg = {
            token: farmer.fcmToken,
            notification: { 
              title: 'पिकांच्या डॉक्टरांचा रिप्लाय! 👨‍🌾', 
              body: text ? text : 'तुम्हाला एक नवीन फोटो / मेसेज पाठवला आहे.' 
            },
            data: { 
              route: '/crop-advisory',
              type: 'CHAT'
            },
            android: { priority: 'high' }
          };
          await getMessaging().send(msg);
        }
      } catch (pushErr) {
        console.error('Push Notif Error for Chat:', pushErr);
      }
    }

    res.status(200).json({ success: true, message: "मेसेज पाठवला", data: advisory });
  } catch (error) {
    console.error("Message Error:", error);
    res.status(500).json({ success: false, error: "Server Error" });
  }
});

// ५. ॲडमिनने औषध सुचवणे (Final Resolve)
router.put('/admin/resolve/:id', async (req, res) => {
  try {
    const { suggestedProducts, adminMessage } = req.body;
    
    const advisory = await CropAdvisory.findById(req.params.id);
    if (!advisory) {
      return res.status(404).json({ success: false, error: "तक्रार सापडली नाही" });
    }

    advisory.status = 'Resolved';
    advisory.suggestedProducts = suggestedProducts;
    advisory.adminMessage = adminMessage;

    // फायनल सल्ला देखील चॅटमध्ये सेव्ह करून ठेवा जेणेकरून संभाषणाचा शेवट दिसेल
    advisory.messages.push({
      sender: 'admin',
      text: `✅ तज्ज्ञांचा फायनल सल्ला: ${adminMessage || 'औषधे सुचवली आहेत.'}`
    });

    await advisory.save();

    // इन-ॲप नोटिफिकेशन
    try {
      await Notification.create({
        userId: advisory.userId,
        title: 'पिकांच्या डॉक्टरकडून सल्ला मिळाला! 🌱',
        message: 'तज्ज्ञांनी तुमच्या पिकावर योग्य औषध सुचवले आहे. पाहण्यासाठी क्लिक करा.',
        isRead: false
      });
    } catch (notifErr) {
      console.error("Notification creation error:", notifErr);
    }

    // Firebase Push Notification
    try {
      const farmer = await User.findById(advisory.userId);
      if (farmer && farmer.fcmToken) {
        const message = {
          token: farmer.fcmToken,
          notification: {
            title: 'पिकांच्या डॉक्टरकडून सल्ला! 🌱',
            body: adminMessage || 'तज्ज्ञांनी तुमच्या पिकावर योग्य औषध सुचवले आहे.'
          },
          data: {
            route: '/crop-advisory',
            type: 'ADVISORY',
            advisoryId: advisory._id.toString()
          },
          android: {
            priority: 'high',
            notification: {
              channelId: 'shahuraje_orders',
              sound: 'default'
            }
          }
        };
        await getMessaging().send(message);
      }
    } catch (pushErr) {
      console.error('Firebase Messaging Send Error:', pushErr);
    }

    res.status(200).json({ success: true, message: "औषध सुचवले आणि नोटिफिकेशन पाठवली!", data: advisory });
  } catch (error) {
    console.error("Resolve Error:", error);
    res.status(500).json({ success: false, error: "Server Error" });
  }
});

module.exports = router;