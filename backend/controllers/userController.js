const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// 🔴 Common Email Sender Helper Function (Brevo HTTPS REST API)
const sendBrevoEmail = async (toEmail, toName, subject, htmlContent) => {
    try {
        const brevoApiKey = process.env.BREVO_API_KEY;
        if (!brevoApiKey) {
            console.error("❌ BREVO_API_KEY environment variable madhe sapadli nahi!");
            return false;
        }

        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'api-key': brevoApiKey,
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                sender: { name: 'Shahuraje Krushi Kendra', email: 'vishnuwaghmode43@gmail.com' },
                to: [{ email: toEmail, name: toName }],
                subject: subject,
                htmlContent: htmlContent
            })
        });

        if (response.ok) {
            console.log(`✅ Email pathavla (${subject}) -> ${toEmail}`);
            return true;
        } else {
            const errResult = await response.json();
            console.error(`❌ Brevo error (${subject}):`, errResult);
            return false;
        }
    } catch (err) {
        console.error(`❌ Email catch error (${subject}):`, err.message);
        return false;
    }
};

// १. युजर नोंदणी (Register) + Welcome Email
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

        // ✉️ Welcome Email Pathavne
        const welcomeHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                <h2 style="color: #0c542b; text-align: center;">शाहूराजे कृषी केंद्र</h2>
                <h3 style="color: #333;">नमस्कार ${user.name}, स्वागत आहे! 🌾</h3>
                <p>शाहूराजे कृषी केंद्रात आपले खाते यशस्वीरीत्या तयार झाले आहे.</p>
                <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 15px 0;">
                    <p style="margin: 5px 0;"><b>नाव:</b> ${user.name}</p>
                    <p style="margin: 5px 0;"><b>ईमेल:</b> ${user.email}</p>
                    <p style="margin: 5px 0;"><b>फोन:</b> ${user.phone}</p>
                </div>
                <p style="color: #555; font-size: 14px;">आता तुम्ही शेतीची औषधे आणि खतांची ऑर्डर मोबाईल ॲपवरून थेट करू शकता.</p>
                <p style="color: #888; font-size: 12px; margin-top: 20px;">धन्यवाद,<br>टीम शाहूराजे कृषी केंद्र</p>
            </div>
        `;
        sendBrevoEmail(user.email, user.name, 'शाहूराजे कृषी केंद्रात आपले स्वागत आहे! 🌾', welcomeHtml);

        res.status(201).json({ message: 'नोंदणी यशस्वी झाली!' });

    } catch (error) {
        console.error('बॅकएंड नोंदणी एरर:', error);
        res.status(500).json({ error: 'नोंदणी करताना एरर आला', details: error.message });
    }
};

// २. युजर लॉगिन (Login) + Security Alert Email
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

        // ✉️ Login Alert Email Pathavne
        const now = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
        const loginAlertHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                <h2 style="color: #0c542b; text-align: center;">शाहूराजे कृषी केंद्र</h2>
                <h3 style="color: #333;">नवीन लॉगिन ॲलर्ट 🔔</h3>
                <p>नमस्कार <b>${user.name}</b>,</p>
                <p>तुमच्या खात्यामध्ये आत्ताच लॉगिन झाले आहे.</p>
                <div style="background: #f1f8e9; padding: 12px; border-radius: 8px; margin: 15px 0;">
                    <p style="margin: 0; color: #2e7d32; font-size: 14px;"><b>तारीख व वेळ:</b> ${now}</p>
                </div>
                <p style="color: #d32f2f; font-size: 13px;">जर हे लॉगिन तुम्ही केले नसेल, तर कृपया लगेच आपला पासवर्ड बदला किंवा आमच्याशी संपर्क साधा.</p>
                <p style="color: #888; font-size: 12px; margin-top: 20px;">टीम शाहूराजे कृषी केंद्र</p>
            </div>
        `;
        sendBrevoEmail(user.email, user.name, 'नवीन लॉगिन ॲलर्ट - शाहूराजे कृषी केंद्र', loginAlertHtml);

        res.status(200).json({ 
            message: 'लॉगिन यशस्वी!', 
            token, 
            user: { id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role } 
        });

    } catch (error) {
        res.status(500).json({ error: 'लॉगिन करताना एरर आला', details: error.message });
    }
};

// ३. Brevo REST API द्वारे OTP पाठवणे (Forgot Password)
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
            return res.status(404).json({ error: 'हा ईमेल आयडी अस्तित्वात नाही.' });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.resetOtp = otp;
        user.resetOtpExpire = Date.now() + 10 * 60 * 1000;
        await user.save();
        console.log("👉 तयार झालेला OTP:", otp);

        const otpHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                <h2 style="color: #0c542b; text-align: center;">शाहूराजे कृषी केंद्र</h2>
                <p>नमस्कार <b>${user.name}</b>,</p>
                <p>तुमचा पासवर्ड रीसेट करण्यासाठी खालील OTP वापरा:</p>
                <div style="text-align: center; margin: 25px 0;">
                    <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #0c542b; background: #e8f5e9; padding: 10px 20px; border-radius: 8px;">${otp}</span>
                </div>
                <p style="color: #666; font-size: 13px;">हा OTP पुढील <b>१० मिनिटांसाठीच</b> वैध आहे.</p>
            </div>
        `;

        const sent = await sendBrevoEmail(user.email, user.name, 'पासवर्ड रीसेट करण्यासाठी OTP - शाहूराजे कृषी केंद्र', otpHtml);
        if (sent) {
            return res.status(200).json({ message: 'OTP तुमच्या ईमेलवर यशस्वीरीत्या पाठवला आहे!' });
        } else {
            return res.status(500).json({ error: 'ईमेल पाठवताना त्रुटी आली.' });
        }

    } catch (error) {
        console.error('❌ Brevo API Catch एरर:', error);
        return res.status(500).json({ error: 'ईमेल पाठवताना एरर आला: ' + error.message });
    }
};

// ४. पासवर्ड रीसेट करणे + Password Change Confirmation Email
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

        // ✉️ Password Changed Confirmation Email Pathavne
        const pwChangedHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                <h2 style="color: #0c542b; text-align: center;">शाहूराजे कृषी केंद्र</h2>
                <h3 style="color: #2e7d32;">पासवर्ड यशस्वीरीत्या बदलला आहे ✅</h3>
                <p>नमस्कार <b>${user.name}</b>,</p>
                <p>तुमच्या शाहूराजे खात्याचा पासवर्ड नुकताच यशस्वीरीत्या बदलण्यात आला आहे.</p>
                <p style="color: #d32f2f; font-size: 13px; margin-top: 15px;">जर हा पासवर्ड तुम्ही बदलला नसेल, तर कृपया त्वरित आमच्याशी संपर्क साधा.</p>
                <p style="color: #888; font-size: 12px; margin-top: 20px;">टीम शाहूराजे कृषी केंद्र</p>
            </div>
        `;
        sendBrevoEmail(user.email, user.name, 'सुरक्षा सूचना: पासवर्ड बदलला गेला आहे - शाहूराजे कृषी केंद्र', pwChangedHtml);

        res.status(200).json({ message: 'पासवर्ड यशस्वीरीत्या बदलला आहे!' });

    } catch (error) {
        res.status(500).json({ error: 'पासवर्ड बदलताना त्रुटी आली', details: error.message });
    }
};