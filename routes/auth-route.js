const express = require("express");
const fs = require("fs");
const path = require('path');
const nodemailer = require("nodemailer");
const router = express.Router();
const Joi = require('joi');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require("uuid");
const { generateAccessToken, chkFile } = require("../utils/helper");
require('dotenv').config();

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    cnic: { type: String, required: true },
    password: { type: String, required: true }
});

const UserModel = mongoose.model("users", userSchema);

router.get("/login", async (req,res)=>{
    res.json({message:"login running"});
});

router.get("/signup", async (req,res)=>{
    res.json({message:"signup running"});
});

router.post("/login", async (req, res) => {
    const loginData = req.body;
    console.log("login trigger");
    console.log(loginData);
    
    const Schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(4).required(),
    });

    const validate = Schema.validate(loginData);
    if (validate.error) {
        console.log(validate.error);
        return res.status(400).json({ message: validate.error.message });
    }

    const FileData = await UserModel.find();
    const oldData = FileData;

    const chkUser = oldData.find((d) => d.email == validate.value.email && d.password == validate.value.password);
    if (!chkUser) {
        console.log("User Not Found");
        return res.status(400).json({ message: "User Not Found" });
    }

    console.log("{ message: 'User Found' }");
    try {
        const token = generateAccessToken(chkUser.id, process.env.JWT_SECRET);
        console.log(token);
        
        chkUser.password = ""; // Avoid sending password back to the client

        return res.status(200).json({
            message: "Logged in success",
            data: {
                token,
                user: chkUser,
            },
        });
    } catch (error) {
        console.log(error.message);
        return res.json({ message: "Internal Server error" });
    }
});

router.post("/signup", async (req, res) => {
    const signupData = req.body;

    const Schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(4).required(),
    });

    const validate = Schema.validate(signupData);
    if (validate.error) {
        return res.status(400).json({ message: validate.error.message });
    }

    const { email, password } = validate.value;

    try {
        const existedUser = await UserModel.findOne({ email });
        if (existedUser) {
            return res.status(409).json({ message: "User Already Exist" });
        }

        const newUser = new UserModel({ email, password });
        await newUser.save();

        res.json({ message: "User registered successfully" });
    } catch (error) {
        console.error("Error during signup:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

router.post("/register", async (req, res) => {
    const signupData = req.body;

    const Schema = Joi.object({
        email: Joi.string().email().required(),
        cnic: Joi.string().length(13).regex(/^\d+$/).required(), 
        name: Joi.string().required()
    });

    const validate = Schema.validate(signupData);
    if (validate.error) {
        return res.status(400).json({ message: validate.error.message });
    }

    const { name, email, cnic } = validate.value;

    try {
        const existedUser = await UserModel.findOne({ email });
        if (existedUser) {
            return res.status(409).json({ message: "User Already Exists" });
        }

        // Instead of hashing the password, we can use a simple random string as the password
        const autoGeneratedPassword = Math.random().toString(36).slice(-8);

        const newUser = new UserModel({ name, email, cnic, password: autoGeneratedPassword });
        await newUser.save();

        const themail = nodemailer.createTransport({
            service: "Gmail",
            auth: {
                user: "adil.ak9223@gmail.com",
                pass: "hyau ntnj qqmh vocr" // Use environment variables to securely store sensitive data
            }
        });

        const mailOptions = {
            from: "adil.ak9223@gmail.com",
            to: email,
            subject: "Your Account Password",
            text: `Hello ${name},\n\nYour account has been created successfully!\nYour password is: ${autoGeneratedPassword}\n\nPlease change your password after logging in.\n\nBest regards,\nYour Team`
        };

        await themail.sendMail(mailOptions);

        res.json({ message: "User registered successfully. Password has been sent to the email." });

    } catch (error) {
        console.error("Error during signup:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

const user_model = UserModel;
const authroutes = router;
module.exports = { authroutes, user_model };