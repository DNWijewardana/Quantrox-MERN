import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken'
import userModel from '../models/userModel.js'
import transporter from '../config/nodemailer.js';

// Controller function for user Registration

export const register = async (req, res) => {

    const {name, email, password} = req.body;

    if(!name || !email || !password) {
        return res.json({success: false, message: 'Missing Details'})
    }

    try {

        const existingUser = await userModel.findOne({email})

        if(existingUser) {
            return res.json({success: false, message: 'User alreay exits'});
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new userModel({name, email, password: hashedPassword});
        await user.save();

        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, { expiresIn: '7d'});

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        // Sending Welcome EMail

        const mailOption = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: 'Welcome to Quantrox – Your Construction Estimation Platform',
            text: `Hello ${name},
            Welcome to Quantrox! Your account has been successfully created using the email ${email}.
            You can now log in and start estimating construction costs and materials from your house plans.`
        }

        await transporter.sendMail(mailOption);

        return res.json({success: true});

    } catch (error) {
        return res.json({success: false, message: error.message})
    }
};

// User Login Controller Function

export const login = async (req, res) => {

    const {email, password} = req.body;

    if(!email || !password) {
        return res.json({success: false, message: 'Email and Password are required'}); 
    }

    try {

        const user = await userModel.findOne({email})

        if(!user){
            return res.json({success:false, message: "Can't find the email address"})
        }
        
        const isMatch = await bcrypt.compare(password, user.password);

        if(!isMatch){
            return res.json({success: false, message: "Wrong password, try again"})
        }

        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, { expiresIn: '7d'});

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        return res.json({success: true});
        
    } catch (error) {
        return res.json({success: false, message: error.message})
    }
};

// Logout Controller function

export const logout = async (req, res) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',     
        })

        return res.json({success: true, message: 'Logged Out'})
    } catch (error) {
        return res.json({success: false, message: error.message})
    }
}

// User Email Verification using OTP

export const sendVerifyOtp = async (req, res) => {
    try {
        const {userId} = req.body;

        const user = await userModel.findById(userId);

        if(user.isAccountVerified){
            return res.json({success: false, message: "Account is already verified"});
        }

        const otp = String(Math.floor(100000 + Math.random() * 900000));
        
        user.verifyOtp = otp;
        user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000; // Otp Valied for 24 Hours

        await user.save();

        const mailOption = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'Quantrox – Account Verification OTP',
            text: `Your OTP is ${otp}. It is valid for 24 hours. Please enter this OTP in the app to verify your account.`
        }

        await transporter.sendMail(mailOption);

        return res.json({success: true, messsage: 'OTP sent to your email address'});


    } catch (error) {
        res.json({success: false, message: error.message})
    }
}

// Verify Email using OTP 

export const verifyEmail = async (req, res) => {

    const {userId, otp} = req.body;

    if(!userId || !otp) {
        return res.json({success: false, message: 'Missing Details'})
    }

    try {
        const user = await userModel.findById(userId);

        if(!user) {
            return res.json({success: false, message: "User not found"});
        }
        
        if(user.verifyOtp === '' || user.verifyOtp !== otp) {
            return res.json({success: false, message: "Invalid OTP"});
        }

        if(user.verifyOtpExpireAt < Date.now()) {
            return res.json({success: false, message: "OTP Expired, Please try again"});
        }

        user.isAccountVerified = true;
        user.verifyOtp = '';
        user.verifyOtpExpireAt = 0;

        await user.save();

        return res.json({success: true, message: "Email Verified Successfully"});

    } catch (error) {
        return res.json({success: false, message: error.message});
    }
}

// Check if user is authenticated or not

export const isAuthenticated = async (req, res) => {
    try {
        return res.json({success: true });
    } catch (error) {
        return res.json({success: false, message: error.message});
    }
}

// Send Password reset OTP to user email

export const sendResetOtp = async (req, res) => {
    const {email} = req.body;

    if(!email) {
        return res.json({success: false, messge: "Email is required"})
    }

    try {
        const user = await userModel.findOne({email});
        if(!user) {
            return res.json({success: false, message: "User not found"});
        }

        const otp = String(Math.floor(100000 + Math.random() * 900000));
        
        user.resetOtp = otp;
        user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000; // Otp Valied for 15 Minutes

        await user.save();

        const mailOption = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'Quantrox – Password Reset OTP',
            text: `Your OTP is ${otp}. It is valid for 15 minutes. Please enter this OTP in the app to reset your password.`
        }

        await transporter.sendMail(mailOption);

        return res.json({success: true, message: "OTP sent to your email address"});

    } catch (error) {
        return res.json({success: false, message: error.message});
    }
}

// Reset Password using OTP

export const resetPassword = async (req, res) => {
    const {email, otp , newPassword} = req.body;

    if(!email || !otp || !newPassword) {
        return res.json({success: false, message: "Email, OTP and New Password are required"});
    }
    
    try {
        const user = await userModel.findOne({email});

        if(!user) {
            return res.json({success: false, message: "User not found"});
        }

        if(user.resetOtp === '' || user.resetOtp !== otp) {
            return res.json({success: false, message: "Invalid OTP"});
        }

        if(user.resetOtpExpireAt < Date.now()) {
            return res.json({success: false, message: "OTP Expired, Please try again"});
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        user.password = hashedPassword;
        user.resetOtp = '';
        user.resetOtpExpireAt = 0;

        await user.save();

        return res.json({success: true, message: "Password Reset Successfully"});

    } catch (error) {
        return res.json({success: false, message: error.message});
    }
}