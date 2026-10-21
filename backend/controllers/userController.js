const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

// Brevo (Sendinblue) SMTP Transporter
const transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    secure: false, // Port 587 sathi false
    auth: {
        user: process.env.EMAIL_USER, // bae1c9001@smtp-brevo.com
        pass: process.env.EMAIL_PASS  // bskzfsByHQHx2m8
    }
});

// 1. User Registration
exports.registerUser = async (req, res) => {
    try {
        const { name, email, phone, password, address } = req.body;

        let existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ error: 'Ha email ID aadhich register ahe.' });
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
        res.status(201).json({ message: 'Registration yashasvi jhale!' });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration kartanna truti aali', details: error.message });
    }
};

// 2. User Login
exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(400).json({ error: 'Chukicha email kinva password.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Chukicha email kinva password.' });
        }

        const token = jwt.sign(
            { userId: user._id, role: user.role }, 
            process.env.JWT_SECRET || 'secretKey123', 
            { expiresIn: '7d' }
        );

        res.status(200).json({ 
            message: 'Login yashasvi jhale!', 
            token, 
            user: { id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role } 
        });

    } catch (error) {
        res.status(500).json({ error: 'Login kartanna truti aali', details: error.message });
    }
};

// 3. Brevo dware OTP pathavne (Forgot Password)
exports.sendOtp = async (req, res) => {
    console.log("👉 /send-otp API call zali! Email:", req.body?.email);
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ error: 'Krupaya email ID taka.' });
        }

        const cleanEmail = email.trim().toLowerCase();
        const user = await User.findOne({ email: cleanEmail });
        if (!user) {
            return res.status(404).json({ error: 'Ha email ID sapadla nahi.' });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.resetOtp = otp;
        user.resetOtpExpire = Date.now() + 10 * 60 * 1000; // 10 minite
        await user.save();

        const mailOptions = {
            // Brevo madhil verified sender email
            from: `"Shahuraje Krushi Kendra" <vishnuwaghmode43@gmail.com>`,
            to: user.email,
            subject: 'Password reset sathi OTP - Shahuraje Krushi Kendra',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                    <h2 style="color: #0c542b; text-align: center;">Shahuraje Krushi Kendra</h2>
                    <p>Namaskar <b>${user.name}</b>,</p>
                    <p>Tumcha password reset karnyasathi kholil OTP vapra:</p>
                    <div style="text-align: center; margin: 25px 0;">
                        <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #0c542b; background: #e8f5e9; padding: 10px 20px; border-radius: 8px;">${otp}</span>
                    </div>
                    <p style="color: #666; font-size: 13px;">Ha OTP pudhil <b>10 minitansathich</b> valid ahe.</p>
                </div>
            `
        };

        console.log("👉 Brevo SMTP dware email pathavla jaat ahe...");
        await transporter.sendMail(mailOptions);
        console.log(`✅ Brevo dware OTP yashasvi pathavla: ${user.email}`);

        return res.status(200).json({ message: 'OTP tumchya email var pathavla ahe!' });

    } catch (error) {
        console.error('❌ Brevo email error:', error);
        return res.status(500).json({ error: 'Email pathavtanna truti aali: ' + error.message });
    }
};

// 4. Password Reset karne
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
            return res.status(400).json({ error: 'Chukicha OTP kinva OTP chi mudat sampli ahe.' });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        user.resetOtp = undefined;
        user.resetOtpExpire = undefined;
        await user.save();

        res.status(200).json({ message: 'Password yashasvi badalla ahe!' });

    } catch (error) {
        res.status(500).json({ error: 'Password badaltanna truti aali', details: error.message });
    }
};