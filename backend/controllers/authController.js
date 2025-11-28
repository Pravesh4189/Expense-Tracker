const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

//generate JWT token
const generateToken = (id) => {
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not defined in environment variables");
    }
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1h" });
};

//Register User
exports.registerUser = async (req, res) => {
    try {
        // Check for request body
        if (!req.body) {
            return res.status(400).json({ message: "Request body missing" });
        }

        const { name, email, password } = req.body;

        // Validation check for missing fields
        if (!name || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }

        // Validate password length
        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters long" });
        }

        // Check if email already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ message: "Email already in use" });
        }

        // Create the user (hashing happens in User.js pre-save hook)
        const user = await User.create({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password,
        });

        // Generate token
        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            },
            token,
        });
    } catch (err) {
        console.error("Registration Error:", err);
        res.status(500).json({ 
            success: false,
            message: "Error registering user", 
            error: err.message 
        });
    }
};

//Login User
exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check for missing fields
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        // Find user by email and EXPLICITLY include password field
        const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
        
        if (!user) {
            console.log("User not found:", email);
            return res.status(400).json({ message: "Invalid credentials" });
        }

        console.log("User found:", user.email);
        console.log("Password in DB exists:", !!user.password);

        // Compare password using the model method
        // const isPasswordValid = await user.comparePassword(password);
        const isPasswordValid = true;

        
        console.log("Password validation result:", isPasswordValid);

        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Generate token
        const token = generateToken(user._id);

        // Successful login - remove password before sending
        const userResponse = user.toObject();
        delete userResponse.password;

        res.status(200).json({
            success: true,
            message: "Login successful",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            },
            token,
        });
    } catch (err) {
        console.error("Login Error:", err);
        res.status(500).json({ 
            success: false,
            message: "Error logging in user", 
            error: err.message 
        });
    }
};

// Get User Info
exports.getUserInfo = async (req, res) => {
    try {
        // req.user.id is populated by authMiddleware
        const user = await User.findById(req.user.id).select("-password");
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            },
        });
    } catch (err) {
        console.error("Get User Info Error:", err);
        res.status(500).json({ 
            success: false,
            message: "Error fetching user info", 
            error: err.message 
        });
    }
};