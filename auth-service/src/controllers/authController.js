const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ✅ REGISTER FUNCTION
exports.register = async (req, res) => {
  try {
    console.log("BODY:", req.body);

    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({
      firstName: name,
      lastName: "User",
      email,
      password: password, // ✅ plain password
    });

    res.status(201).json({
      message: "User registered successfully",
      user,
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

// ✅ LOGIN FUNCTION (ADD THIS BELOW REGISTER)
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 🔍 STEP 1: log incoming body
    console.log("BODY:", req.body);

    // const user = await User.findOne({ email });
    const user = await User.findByEmail(email); // uses your static method

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // use model method
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    // 🔍 STEP 2: log DB + password values
    console.log("USER FROM DB:", user);
    console.log("PASSWORD FROM BODY:", password);
    console.log("PASSWORD FROM DB:", user?.password);

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.status(200).json({
      message: "Login successful",
      token,
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};
