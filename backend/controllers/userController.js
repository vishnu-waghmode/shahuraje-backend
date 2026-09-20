const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

// Gmail ट्रान्सपोर्टर
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// १. युजर रजिस्ट्रेशन
exports.registerUser = async (req, res) => {
    try {
        const { name, email, phone, password, address } = req.body;

        let existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ error: 'हा ईमेल आयडी आधीच नोंदणीकृत आहे.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = new User({
            name,
            email: email.toLowerCase(),
            phone,
            password: hashedPassword,
            role: 'farmer',
            address
        });

        await user.save();
        res.status(201).json({ message: 'नोंदणी यशस्वी झाली!' });

    } catch (error) {
        console.error('बॅकएंड रजिस्ट्रेशन एरर:', error);
        res.status(500).json({ error: 'नोंदणी करताना एरर आला', details: error.message });
    }
};

// २. युजर लॉगिन
exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(400).json({ error: 'चुकीचा ईमेल आयडी किंवा पासवर्ड.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'चुकीचा ईमेल आयडी किंवा पासवर्ड.' });
        }

        const token = jwt.sign(
            { userId: user._id, role: user.role }, 
            process.env.JWT_SECRET || 'secretKey123', 
            { expiresIn: '7d' }
        );

        res.status(200).json({ 
            message: 'लॉगिन यशस्वी!', 
            token, 
            user: { id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role } 
        });

    } catch (error) {
        res.status(500).json({ error: 'लॉगिन करताना एरर आला', details: error.message });
    }
};

// ३. OTP पाठवणे (Forgot Password)
exports.sendOtp = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(404).json({ error: 'हा ईमेल आयडी अस्तित्वात नाही.' });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.resetOtp = otp;
        user.resetOtpExpire = Date.now() + 10 * 60 * 1000; // १० मिनिटे
        await user.save();

        const mailOptions = {
            from: `"शाहूराजे कृषी केंद्र" <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: 'पासवर्ड रीसेट करण्यासाठी OTP - शाहूराजे कृषी केंद्र',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                    <h2 style="color: #0c542b; text-align: center;">शाहूराजे कृषी केंद्र</h2>
                    <p>नमस्कार <b>${user.name}</b>,</p>
                    <p>तुमचा पासवर्ड रीसेट करण्यासाठी खालील OTP वापरा:</p>
                    <div style="text-align: center; margin: 25px 0;">
                        <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #0c542b; background: #e8f5e9; padding: 10px 20px; border-radius: 8px;">${otp}</span>
                    </div>
                    <p style="color: #666; font-size: 13px;">हा OTP पुढील <b>१० मिनिटांसाठीच</b> वैध आहे.</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'OTP तुमच्या ईमेलवर पाठवला गेला आहे!' });

    } catch (error) {
        res.status(500).json({ error: 'ईमेल पाठवताना एरर आला', details: error.message });
    }
};

// ४. पासवर्ड रीसेट करणे
exports.resetPasswordWithOtp = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        const user = await User.findOne({
            email: email.toLowerCase(),
            resetOtp: otp,
            resetOtpExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ error: 'चुकीचा OTP किंवा OTP ची मुदत संपली आहे.' });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        user.resetOtp = undefined;
        user.resetOtpExpire = undefined;
        await user.save();

        res.status(200).json({ message: 'पासवर्ड यशस्वीरीत्या बदलला आहे!' });

    } catch (error) {
        res.status(500).json({ error: 'पासवर्ड बदलताना त्रुटी आली', details: error.message });
    }
};