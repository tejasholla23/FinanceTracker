const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// register new user
exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ name, email, password: hashedPassword });

        const payload = { id: user.id, email: user.email };
        const token = jwt.sign(payload, process.env.JWT_SECRET || "secretkey", { expiresIn: "7d" });

        res.status(201).json({
            success: true,
            data: { token, user: { name: user.name, email: user.email } },
            message: "User registered successfully"
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// login existing user and issue JWT
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Email and password required" });
        }

        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid credentials" });
        }

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
            return res.status(400).json({ success: false, message: "Invalid credentials" });
        }

        const payload = { id: user.id, email: user.email };
        const token = jwt.sign(payload, process.env.JWT_SECRET || "secretkey", { expiresIn: "7d" });

        res.status(200).json({ success: true, data: { token, user: { name: user.name, email: user.email } } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};