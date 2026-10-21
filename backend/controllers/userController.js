const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// १. युजर नोंदणी (Register)
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
        console.error('बॅकएंड नोंदणी एरर:', error);
        res.status(500).json({ error: 'नोंदणी करताना एरर आला', details: error.message });
    }
};

// २. युजर लॉगिन (Login)
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

// ३. Brevo REST API द्वारे OTP पाठवणे (Forgot Password) 🔴
exports.sendOtp = async (req, res) => {
    console.log("👉 /send-otp API कॉल झाली! ईमेल:", req.body?.email);
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ error: 'कृपया ईमेल आयडी प्रविष्ट करा.' });
        }

        const cleanEmail = email.trim().toLowerCase();
        const user = await User.findOne({ email: cleanEmail });
        if (!user) {
            console.log("❌ युझर सापडला नाही:", cleanEmail);
            return res.status(404).json({ error: 'हा ईमेल आयडी अस्तित्वात नाही.' });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.resetOtp = otp;
        user.resetOtpExpire = Date.now() + 10 * 60 * 1000; // १० मिनिटे वैध
        await user.save();
        console.log("👉 तयार झालेला OTP:", otp);

        const brevoApiKey = process.env.BREVO_API_KEY;
        if (!brevoApiKey) {
            console.error("❌ BREVO_API_KEY पर्यावरण व्हेरिएबल्समध्ये सापडली नाही!");
            return res.status(500).json({ error: 'सर्व्हरवर Brevo API Key कॉन्फिगर केलेली नाही.' });
        }

        // Brevo chi HTTPS REST API (Port 443 वरून चालते, Render वर कधीही ब्लॉक होत नाही)
        console.log("👉 Brevo REST API द्वारे ईमेल पाठवत आहे...");
        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'api-key': brevoApiKey,
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                sender: { name: 'शाहूराजे कृषी केंद्र', email: 'vishnuwaghmode43@gmail.com' },
                to: [{ email: user.email, name: user.name }],
                subject: 'पासवर्ड रीसेट करण्यासाठी OTP - शाहूराजे कृषी केंद्र',
                htmlContent: `
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
            })
        });

        const result = await response.json();
        console.log("👉 Brevo API कडून मिळालेला रिस्पॉन्स:", result);

        if (response.ok) {
            console.log(`✅ Brevo API द्वारे OTP यशस्वीरीत्या पाठवला: ${user.email}`);
            return res.status(200).json({ message: 'OTP तुमच्या ईमेलवर यशस्वीरीत्या पाठवला आहे!' });
        } else {
            console.error('❌ Brevo API एरर:', result);
            return res.status(500).json({ error: result.message || 'ईमेल पाठवताना त्रुटी आली.' });
        }

    } catch (error) {
        console.error('❌ Brevo API Catch एरर:', error);
        return res.status(500).json({ error: 'ईमेल पाठवताना एरर आला: ' + error.message });
    }
};

// ४. पासवर्ड रीसेट करणे (Reset Password with OTP)
exports.resetPasswordWithOtp = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        const cleanEmail = email ? email.trim().toLowerCase() : '';
        const cleanOtp = otp ? otp.trim() : '';

        const user = await User.findOne({
            email: cleanEmail,
            resetOtp: cleanOtp,
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