const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const router = require("express").Router();
const User = require("../models/User.js");
const { authenticateToken } = require("./userAuth.js");
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads");
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

router.post("/sign-up", async (req, res) => {
  try {
    const { username, email, password, address } = req.body;
    if (username.length < 4) {
      return res
        .status(400)
        .json({ message: "Username length should be greater than 4" });
    }

    const existingUsername = await User.findOne({ username });

    if (existingUsername) {
      return res.status(400).json({ message: "Username already exists" });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: "Email already exists" });
    }

    if (password.length <= 5) {
      return res
        .status(400)
        .json({ message: "Password should be greater than 5 characters" });
    }

    const hashPass = await bcrypt.hash(password, 10);
    const verificationCode = Math.floor(100000 + Math.random() * 900000); // Generate a random 6-digit verification code

    const newUser = new User({
      username,
      email,
      password: hashPass,
      address,
      verificationCode,
    });

    await newUser.save();

    return res.status(200).json({ message: "Signup successful" });
  } catch (error) {
    console.error("Error during user signup:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/sign-in", async (req, res) => {
  try {
    const { identifier, password } = req.body;

    const existingUser = await User.findOne({
      $or: [{ username: identifier }, { email: identifier }],
    });
    if (!existingUser) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, existingUser.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const authClaims = {
      id: existingUser._id,
      name: existingUser.username,
      email: existingUser.email,

      about: existingUser.about,
      avatar: existingUser.avatar,
      role: existingUser.role,
    };

    const token = jwt.sign(authClaims, "NoteShare1333", { expiresIn: "30d" });

    return res.status(200).json({
      id: existingUser._id,
      role: existingUser.role,
      token,
    });
  } catch (error) {
    console.error("Error during user sign-in:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
});
// Get User Information
router.get("/get-user-information", authenticateToken, async (req, res) => {
  try {
    const { id } = req.headers;
    const user = await User.findById(id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user information:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
});
router.put(
  "/update-user-information",
  authenticateToken,
  upload.single("avatar"),
  async (req, res) => {
    try {
      const { id } = req.headers;
      const { username, email, about } = req.body;

      // Check if the username already exists
      const existingUsername = await User.findOne({
        username,
        _id: { $ne: id },
      });
      if (existingUsername) {
        return res.status(400).json({ message: "Username already exists" });
      }

      // Check if the email already exists
      const existingEmail = await User.findOne({
        email,
        _id: { $ne: id },
      });
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }

      // Update user information
      const updatedUser = await User.findByIdAndUpdate(
        id,
        { username, email, about, avatar: req.file.filename },
        { new: true }
      ).select("-password");

      return res.status(200).json(updatedUser);
    } catch (error) {
      console.error("Error updating user information:", error.message);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

module.exports = router;
