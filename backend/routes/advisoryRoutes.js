const express = require('express');
const router = express.Router();
const CropAdvisory = require('../models/CropAdvisory');
const Notification = require('../models/Notification'); // 👉 ही ओळ नक्की ॲड करा
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

// ४. ॲडमिनने औषध सुचवणे (Multi-select Resolve) व शेतकऱ्याला नोटिफिकेशन पाठवणे
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

    // 👉 हा अत्यंत महत्त्वाचा भाग: शेतकऱ्यासाठी नोटिफिकेशन डेटाबेसमध्ये तयार करणे
    try {
      await Notification.create({
        userId: updated.userId,
        title: 'पिकांच्या डॉक्टरकडून सल्ला मिळाला! 🌱',
        message: 'तज्ज्ञांनी तुमच्या पिकावर योग्य औषध सुचवले आहे. पाहण्यासाठी क्लिक करा.',
        isRead: false
      });
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