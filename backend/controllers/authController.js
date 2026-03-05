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

