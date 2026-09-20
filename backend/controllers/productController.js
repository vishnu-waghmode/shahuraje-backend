const Product = require('../models/Product');

exports.createProduct = async (req, res) => {
    try {
        const newProduct = new Product(req.body);
        const savedProduct = await newProduct.save();
        res.status(201).json({ message: 'Product यशस्वीरीत्या ऍड केले!', product: savedProduct });
    } catch (error) {
        res.status(500).json({ error: 'Product ऍड करताना एरर आला', details: error.message });
    }
};

exports.getProducts = async (req, res) => {
    try {
        const products = await Product.find();
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ error: 'Products मिळवताना एरर आला', details: error.message });
    }
};

// उत्पादन अपडेट (Edit) करणे
exports.updateProduct = async (req, res) => {
    try {
        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json({ message: 'Product यशस्वीरीत्या अपडेट झाले!', product: updatedProduct });
    } catch (error) {
        res.status(500).json({ error: 'Product अपडेट करताना एरर आला', details: error.message });
    }
};

// उत्पादन डिलीट (Delete) करणे
exports.deleteProduct = async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Product यशस्वीरीत्या डिलीट झाले!' });
    } catch (error) {
        res.status(500).json({ error: 'Product डिलीट करताना एरर आला', details: error.message });
    }
};