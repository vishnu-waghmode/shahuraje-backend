const express = require('express');
const router = express.Router();
const CropAdvisory = require('../models/CropAdvisory');
const cloudinary = require('cloudinary').v2;

// 👉 Cloudinary Configuration (हे खूप महत्त्वाचे होते)
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
      return res.status(400).json({ success: false, error: "फोटो आवश्यक आहे" });
    }

    // Cloudinary वर इमेज अपलोड करणे
    const uploadResponse = await cloudinary.uploader.upload(imageBase64, {
      folder: "crop_advisory"
    });

    // डेटाबेस मध्ये सेव्ह करणे
    const newAdvisory = new CropAdvisory({
      userId,
      image: uploadResponse.secure_url,
      description
    });

    await newAdvisory.save();
    res.status(201).json({ success: true, message: "तक्रार पाठवली", data: newAdvisory });
  } catch (error) {
    console.error("Crop Advisory Error:", error);
    res.status(500).json({ success: false, error: "Server Error" });
  }
});

// २. शेतकऱ्याने स्वतःच्या जुन्या तक्रारी बघणे (App साठी)
router.get('/user/:userId', async (req, res) => {
  try {
    const history = await CropAdvisory.find({ userId: req.params.userId })
        .populate('suggestedProduct')
        .sort({ createdAt: -1 }); // नवीन तक्रार सर्वात वर
    res.status(200).json({ success: true, data: history });
  } catch (error) {
    res.status(500).json({ success: false, error: "Server Error" });
  }
});

// ३. Admin ने सर्व शेतकऱ्यांच्या तक्रारी बघणे (Admin Panel साठी)
router.get('/admin/all', async (req, res) => {
  try {
    const allQueries = await CropAdvisory.find()
        .populate('userId', 'name phone')
        .populate('suggestedProduct')
        .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: allQueries });
  } catch (error) {
    res.status(500).json({ success: false, error: "Server Error" });
  }
});

// ४. Admin ने औषध सुचवणे (Update Status)
router.put('/admin/resolve/:id', async (req, res) => {
  try {
    const { suggestedProduct, adminMessage } = req.body;
    const updated = await CropAdvisory.findByIdAndUpdate(
        req.params.id,
        { status: 'Resolved', suggestedProduct, adminMessage },
        { new: true }
    );
    res.status(200).json({ success: true, message: "औषध सुचवले!", data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: "Server Error" });
  }
});

module.exports = router;