const express = require('express');
const router = express.Router();
const CropAdvisory = require('../models/CropAdvisory');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// १. shetkaryane navin photo/takrar pathavne
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

// २. shetkaryane svatahchya junya takrari baghne
router.get('/user/:userId', async (req, res) => {
  try {
    const history = await CropAdvisory.find({ userId: req.params.userId })
        .populate('suggestedProducts') // 👉 Multi-select products populate kele
        .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: history });
  } catch (error) {
    res.status(500).json({ success: false, error: "Server Error" });
  }
});

// ३. Admin ne sarva takrari baghne
router.get('/admin/all', async (req, res) => {
  try {
    const allQueries = await CropAdvisory.find()
        .populate('userId', 'name phone')
        .populate('suggestedProducts') // 👉 Multi-select products populate kele
        .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: allQueries });
  } catch (error) {
    res.status(500).json({ success: false, error: "Server Error" });
  }
});

// ४. Admin ne ekapeksha jast aushdhe suchavne (Multi-select Resolve)
router.put('/admin/resolve/:id', async (req, res) => {
  try {
    const { suggestedProducts, adminMessage } = req.body;
    const updated = await CropAdvisory.findByIdAndUpdate(
        req.params.id,
        { status: 'Resolved', suggestedProducts, adminMessage },
        { new: true }
    );
    res.status(200).json({ success: true, message: "Aushdhe suchavli!", data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: "Server Error" });
  }
});

module.exports = router;